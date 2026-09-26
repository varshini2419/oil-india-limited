import type {
  CalibrationParameter,
  CalibrationResult,
  CalibrationSummary,
  FullCalibrationReport,
  OverfitStatus,
  CalibrationObservation,
} from './types';
import {
  CALIBRATION_DEFAULT_DISCLAIMER,
  MIN_CALIBRATION_IMPROVEMENT_PERCENT,
} from './defaults';
import { validateCalibrationParameterValue } from './validation';
import { buildCalibrationObservations } from './calibrationDataset';
import { runSensitivityAnalysisForParameter } from './sensitivityAnalysis';
import {
  calculateAggregateErrorMetrics,
  compareErrorMetrics,
} from './comparisonEngine';
import {
  getParameterRegistry,
  updateParameterInRegistry,
  getActiveModelMode,
} from './parameterRegistry';

function filterObservationsByCategory(
  observations: CalibrationObservation[],
  category: CalibrationParameter['category']
): CalibrationObservation[] {
  return observations.filter((o) => {
    if (category === 'production') return o.unit === 'BOPD' || o.parameter.toLowerCase().includes('production');
    if (category === 'thermal') return o.parameter.toLowerCase().includes('temperature');
    if (category === 'viscosity') return o.parameter.toLowerCase().includes('viscosity');
    return true;
  });
}

export function runHistoricalCalibration(options?: {
  minImprovementPercent?: number;
}): FullCalibrationReport {
  const minThresholdPct = options?.minImprovementPercent ?? MIN_CALIBRATION_IMPROVEMENT_PERCENT;

  // 1. Get initial candidate parameters from registry
  const candidateParams = getParameterRegistry();

  // 2. Build baseline observations & aggregate baseline error metrics
  const baselineObsAll = buildCalibrationObservations(
    candidateParams.find((p) => p.id === 'PARAM_PRODUCTIVITY_MOBILITY_COEFFICIENT')?.value ?? 50.0
  );
  const baselineMetricsAll = calculateAggregateErrorMetrics(baselineObsAll, 'baseline');

  const calibrationResults: CalibrationResult[] = [];
  const sensitivityResults = [];
  let calibratedCount = 0;
  let rejectedCount = 0;

  // Track active best parameters
  let bestProdCoeff =
    candidateParams.find((p) => p.id === 'PARAM_PRODUCTIVITY_MOBILITY_COEFFICIENT')?.value ?? 50.0;

  for (const param of candidateParams) {
    // 3. Sensitivity analysis for all parameters
    const sensitivity = runSensitivityAnalysisForParameter(param);
    sensitivityResults.push(sensitivity);

    // Filter baseline observations for this parameter's domain
    const paramBaselineObs = filterObservationsByCategory(baselineObsAll, param.category);
    const paramBaselineMetrics = calculateAggregateErrorMetrics(paramBaselineObs, 'baseline');

    // If parameter is marked NOT_CALIBRATABLE due to insufficient data or documented status
    if (param.calibrationStatus === 'NOT_CALIBRATABLE' || param.sourceType === 'documented') {
      rejectedCount++;
      calibrationResults.push({
        parameterId: param.id,
        parameterName: param.name,
        initialValue: param.value,
        calibratedValue: param.value,
        unit: param.unit,
        improvementPercent: 0.0,
        baselineError: paramBaselineMetrics,
        calibratedError: paramBaselineMetrics,
        observationsUsed: 0,
        confidence: 'LOW',
        status: 'INSUFFICIENT_DATA',
        warnings: [param.calibratableReason],
        overfitStatus: 'INSUFFICIENT_DATA_FOR_HOLDOUT_VALIDATION',
      });
      continue;
    }

    // 4. Perform bounded grid-search calibration for calibratable parameters
    if (param.id === 'PARAM_PRODUCTIVITY_MOBILITY_COEFFICIENT') {
      let optimalVal = param.value;
      let lowestMae = paramBaselineMetrics.mae;
      const searchSteps = 40;
      const stepSize = (param.maxAllowed - param.minAllowed) / searchSteps;

      for (let i = 0; i <= searchSteps; i++) {
        const candidateVal = Number((param.minAllowed + i * stepSize).toFixed(2));
        const validation = validateCalibrationParameterValue(param, candidateVal);
        if (!validation.isValid) continue;

        const candidateObs = buildCalibrationObservations(candidateVal);
        const filteredCandObs = filterObservationsByCategory(candidateObs, param.category);
        const candidateMetrics = calculateAggregateErrorMetrics(filteredCandObs, 'calibrated');

        if (candidateMetrics.mae < lowestMae) {
          lowestMae = candidateMetrics.mae;
          optimalVal = candidateVal;
        }
      }

      // Check if improvement exceeds threshold
      const candObsFinalAll = buildCalibrationObservations(optimalVal);
      const candObsFinalParam = filterObservationsByCategory(candObsFinalAll, param.category);
      const candMetricsFinalParam = calculateAggregateErrorMetrics(candObsFinalParam, 'calibrated');
      const errorImp = compareErrorMetrics(paramBaselineMetrics, candMetricsFinalParam);

      if (errorImp.maeImprovementPercent >= minThresholdPct) {
        calibratedCount++;
        bestProdCoeff = optimalVal;

        const validObsCount = candObsFinalParam.filter((o) => o.observedValue !== null).length;
        let overfitStatus: OverfitStatus = 'INSUFFICIENT_DATA_FOR_HOLDOUT_VALIDATION';
        let trainingErr = undefined;
        let validationErr = undefined;

        if (validObsCount >= 4) {
          const trainCount = Math.floor(validObsCount * 0.7);
          const trainObs = candObsFinalParam.filter((o) => o.observedValue !== null).slice(0, trainCount);
          const valObs = candObsFinalParam.filter((o) => o.observedValue !== null).slice(trainCount);

          trainingErr = calculateAggregateErrorMetrics(trainObs, 'calibrated');
          validationErr = calculateAggregateErrorMetrics(valObs, 'calibrated');

          if (validationErr.mae > trainingErr.mae * 1.5) {
            overfitStatus = 'OVERFIT_WARNING';
          } else {
            overfitStatus = 'VALIDATED_NO_OVERFIT';
          }
        }

        const updatedParam: CalibrationParameter = {
          ...param,
          previousValue: param.value,
          value: optimalVal,
          sourceType: 'calibrated',
          sourceId: 'SRC_STEP_5_2_CALIBRATION',
          calibrationStatus: 'CALIBRATED',
          confidence: 'MEDIUM',
          description: `Calibrated via grid-search optimization against 2006 CSS pilot historical production. Baseline error MAE ${paramBaselineMetrics.mae} → Calibrated MAE ${candMetricsFinalParam.mae}.`,
        };

        updateParameterInRegistry(updatedParam);

        calibrationResults.push({
          parameterId: param.id,
          parameterName: param.name,
          initialValue: param.value,
          calibratedValue: optimalVal,
          unit: param.unit,
          improvementPercent: errorImp.maeImprovementPercent,
          baselineError: paramBaselineMetrics,
          calibratedError: candMetricsFinalParam,
          observationsUsed: validObsCount,
          confidence: 'MEDIUM',
          status: 'CALIBRATED',
          warnings: [],
          trainingError: trainingErr,
          validationError: validationErr,
          overfitStatus,
        });
      } else {
        rejectedCount++;
        calibrationResults.push({
          parameterId: param.id,
          parameterName: param.name,
          initialValue: param.value,
          calibratedValue: param.value,
          unit: param.unit,
          improvementPercent: 0.0,
          baselineError: paramBaselineMetrics,
          calibratedError: paramBaselineMetrics,
          observationsUsed: 0,
          confidence: 'LOW',
          status: 'NOT_CALIBRATABLE',
          warnings: [
            `Calibration rejected: Improvement (${errorImp.maeImprovementPercent.toFixed(1)}%) below required threshold (${minThresholdPct}%).`,
          ],
          overfitStatus: 'INSUFFICIENT_DATA_FOR_HOLDOUT_VALIDATION',
        });
      }
    }
  }

  // Final observations & metrics with active calibrated parameters
  const finalObsAll = buildCalibrationObservations(bestProdCoeff);
  const finalMetricsAll = calculateAggregateErrorMetrics(finalObsAll, 'calibrated');
  const overallImprovement = compareErrorMetrics(baselineMetricsAll, finalMetricsAll).maeImprovementPercent;

  const summary: CalibrationSummary = {
    totalParametersEvaluated: candidateParams.length,
    calibratedParametersCount: calibratedCount,
    rejectedParametersCount: rejectedCount,
    baselineMetrics: baselineMetricsAll,
    calibratedMetrics: finalMetricsAll,
    overallImprovementPercent: overallImprovement,
    calculatedAt: new Date().toISOString(),
    disclaimer: CALIBRATION_DEFAULT_DISCLAIMER,
    activeModelMode: getActiveModelMode(),
  };

  return {
    parameters: getParameterRegistry(),
    results: calibrationResults,
    sensitivityResults,
    observations: finalObsAll,
    summary,
  };
}
