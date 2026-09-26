import type { CalibrationParameter, SensitivityResult, SensitivityStep } from './types';
import { buildCalibrationObservations } from './calibrationDataset';
import { calculateAggregateErrorMetrics } from './comparisonEngine';
import { EPSILON_SAFE_DIVISION } from './defaults';

export function runSensitivityAnalysisForParameter(
  param: CalibrationParameter,
  perturbationsPercent: number[] = [-20, -10, 0, 10, 20]
): SensitivityResult {
  const steps: SensitivityStep[] = [];
  const baselineValue = param.value;

  // 1. Compute baseline metrics (0% perturbation) for matching category
  const baselineObs = buildCalibrationObservations(baselineValue);
  const filteredBaselineObs = baselineObs.filter((o) => {
    if (param.category === 'production') return o.unit === 'BOPD' || o.parameter.toLowerCase().includes('production');
    if (param.category === 'thermal') return o.parameter.toLowerCase().includes('temperature');
    if (param.category === 'viscosity') return o.parameter.toLowerCase().includes('viscosity');
    return true;
  });

  const baselineMetrics = calculateAggregateErrorMetrics(filteredBaselineObs, 'calibrated');

  let bestValue = baselineValue;
  let minMae = baselineMetrics.mae;
  let maxImprovement = 0.0;

  for (const pPct of perturbationsPercent) {
    const candidateValue = Number((baselineValue * (1 + pPct / 100)).toFixed(4));
    const clampedValue = Math.min(param.maxAllowed, Math.max(param.minAllowed, candidateValue));

    const obs = buildCalibrationObservations(clampedValue);
    const filteredObs = obs.filter((o) => {
      if (param.category === 'production') return o.unit === 'BOPD' || o.parameter.toLowerCase().includes('production');
      if (param.category === 'thermal') return o.parameter.toLowerCase().includes('temperature');
      if (param.category === 'viscosity') return o.parameter.toLowerCase().includes('viscosity');
      return true;
    });

    const metrics = calculateAggregateErrorMetrics(filteredObs, 'calibrated');

    let improvement = 0.0;
    if (baselineMetrics.mae > EPSILON_SAFE_DIVISION) {
      improvement = Number(
        (((baselineMetrics.mae - metrics.mae) / baselineMetrics.mae) * 100).toFixed(2)
      );
    }

    if (metrics.mae < minMae) {
      minMae = metrics.mae;
      bestValue = clampedValue;
      maxImprovement = improvement;
    }

    steps.push({
      perturbationPercent: pPct,
      parameterValue: clampedValue,
      mae: metrics.mae,
      rmse: metrics.rmse,
      mape: metrics.mape,
      improvementPercent: improvement,
    });
  }

  const isSensitive = steps.some(
    (s) => Math.abs(s.mae - baselineMetrics.mae) > EPSILON_SAFE_DIVISION
  );

  return {
    parameterId: param.id,
    parameterName: param.name,
    steps,
    optimalValue: bestValue,
    bestImprovementPercent: maxImprovement,
    isSensitive,
  };
}
