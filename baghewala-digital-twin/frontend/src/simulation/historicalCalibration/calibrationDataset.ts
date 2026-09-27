import { loadHistoricalBacktestDataset } from '../historicalValidation/historicalDataset';
import { runBacktestForCase } from '../historicalValidation/backtestEngine';
import { calculateAbsoluteError, calculatePercentageError } from '../historicalValidation/errorMetrics';
import type { BacktestCase } from '../historicalValidation/types';
import type { CalibrationObservation } from './types';

export function runPipelineWithCustomParameters(
  testCase: BacktestCase,
  productivityMobilityCoeff: number = 50.0
): {
  predictedTemperature: number;
  predictedViscosity: number;
  predictedMobility: number;
  predictedProduction: number;
} {
  const baseOutputs = runBacktestForCase(testCase);

  // Custom Productivity Index J_o = C_prod * oilMobilityDcp
  const customProdIndex = productivityMobilityCoeff * baseOutputs.mobilityResult.mobilityDcP;
  const effectiveDrawdownBar = 30.0;

  // Pump Operation Factor
  const normSpm = testCase.inputs.spm / 8.0;
  const normStroke = testCase.inputs.strokeLengthMeters / 2.5;
  const normVfd = Math.sqrt(Math.max(0.1, testCase.inputs.vfdFrequencyHz / 50.0));
  const pumpFactor = Math.min(2.5, Math.max(0.2, normSpm * normStroke * normVfd));

  const unconstrainedFlow = customProdIndex * effectiveDrawdownBar;
  const rawProduction = unconstrainedFlow * pumpFactor;
  const customProduction = Math.min(5000.0, Math.max(0.0, rawProduction));

  return {
    predictedTemperature: baseOutputs.thermalResult.predictedReservoirTemperatureC,
    predictedViscosity: baseOutputs.viscosityResult.estimatedViscosityCp,
    predictedMobility: baseOutputs.mobilityResult.mobilityDcP,
    predictedProduction: Number(customProduction.toFixed(2)),
  };
}

export function buildCalibrationObservations(
  customProdCoeff: number = 50.0
): CalibrationObservation[] {
  const cases = loadHistoricalBacktestDataset();
  const observations: CalibrationObservation[] = [];

  for (const bCase of cases) {
    const baseOutputs = runBacktestForCase(bCase);
    const customOutputs = runPipelineWithCustomParameters(bCase, customProdCoeff);

    for (const obs of bCase.observations) {
      let baselinePred: number | null = null;
      let calibratedPred: number | null = null;

      const parameterName = obs.parameter ?? 'Production Rate';
      const paramLower = parameterName.toLowerCase();
      const obsVal = obs.observedValue ?? null;

      if (paramLower.includes('temperature')) {
        baselinePred = baseOutputs.thermalResult.predictedReservoirTemperatureC;
        calibratedPred = customOutputs.predictedTemperature;
      } else if (paramLower.includes('viscosity')) {
        baselinePred = baseOutputs.viscosityResult.estimatedViscosityCp;
        calibratedPred = customOutputs.predictedViscosity;
      } else if (
        obs.unit === 'BOPD' ||
        paramLower.includes('production rate') ||
        paramLower.includes('peak oil production')
      ) {
        baselinePred = baseOutputs.productionResult.estimatedProductionBopd;
        calibratedPred = customOutputs.predictedProduction;
      }

      let baseAbsErr: number | null = null;
      let basePctErr: number | null = null;
      let calAbsErr: number | null = null;
      let calPctErr: number | null = null;

      if (obsVal !== null && baselinePred !== null) {
        baseAbsErr = calculateAbsoluteError(obsVal, baselinePred);
        basePctErr = calculatePercentageError(obsVal, baselinePred);
      }

      if (obsVal !== null && calibratedPred !== null) {
        calAbsErr = calculateAbsoluteError(obsVal, calibratedPred);
        calPctErr = calculatePercentageError(obsVal, calibratedPred);
      }

      observations.push({
        id: `CAL_OBS_${obs.id}`,
        dateOrYear: obs.dateOrYear ?? obs.date,
        parameter: parameterName,
        observedValue: obsVal,
        baselinePredictedValue: baselinePred,
        calibratedPredictedValue: calibratedPred,
        unit: obs.unit ?? 'BOPD',
        baselineAbsoluteError: baseAbsErr,
        baselinePercentageError: basePctErr,
        calibratedAbsoluteError: calAbsErr,
        calibratedPercentageError: calPctErr,
        sourceId: obs.sourceId ?? 'SRC_DEMO',
        dataQuality: obsVal !== null ? 'COMPLETE' : 'INSUFFICIENT_DATA',
      });
    }
  }

  return observations;
}
