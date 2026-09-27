import type {
  HistoricalObservation,
  HistoricalValidationResult,
  ValidationStatus,
} from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BAGHEWALA_HISTORICAL_DATASET, historicalObservationToInputs } from './historicalDataset';
import { findHistoricalMatches } from './historicalMatcher';
import { evaluateEngineeringConfidence, checkIsWithinOperatingEnvelope } from './confidenceEngine';

// Physics engine imports
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';

/**
 * Runs physics solvers for a given set of scenario inputs to calculate modeled oil production (BOPD).
 */
export function simulateHistoricalRecordProduction(inputs: ScenarioInputValues): {
  predictedProductionBopd: number;
  viscosityCp: number;
  temperatureC: number;
} {
  const thermalResult = calculateThermalModel({ inputs } as any);
  const evalTemp = Math.max(inputs.reservoirTemperatureC, thermalResult.predictedReservoirTemperatureC);

  const viscosityResult = calculateViscosityModel(evalTemp, 48.0);
  const mobilityResult = calculateMobilityModel(
    viscosityResult.estimatedViscosityCp,
    evalTemp,
    inputs.permeabilityDarcy,
    1.0,
    viscosityResult.baselineViscosityCp
  );

  const drawdown = Math.max(5.0, inputs.reservoirPressureBar - 18.0);
  const productionResult = calculateProductionModel(
    mobilityResult.mobilityDcP,
    evalTemp,
    viscosityResult.estimatedViscosityCp,
    drawdown,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  );

  return {
    predictedProductionBopd: Number(productionResult.estimatedProductionBopd.toFixed(2)),
    viscosityCp: Number(viscosityResult.estimatedViscosityCp.toFixed(1)),
    temperatureC: Number(evalTemp.toFixed(1)),
  };
}

/**
 * Calculates MAE, MAPE, RMSE, and Bias across a dataset of historical observations.
 */
export function calculateDatasetErrorMetrics(dataset: HistoricalObservation[] = BAGHEWALA_HISTORICAL_DATASET): {
  mae: number;
  mape: number;
  rmse: number;
  bias: number;
} {
  if (dataset.length === 0) {
    return { mae: 0, mape: 0, rmse: 0, bias: 0 };
  }

  let totalAbsError = 0;
  let totalPctError = 0;
  let totalSqError = 0;
  let totalError = 0;

  for (const obs of dataset) {
    const inputs = historicalObservationToInputs(obs);
    const sim = simulateHistoricalRecordProduction(inputs);
    const obsBopd = obs.observedProductionBopd;
    const err = sim.predictedProductionBopd - obsBopd;
    const absErr = Math.abs(err);
    const pctErr = (absErr / Math.max(0.1, obsBopd)) * 100.0;

    totalAbsError += absErr;
    totalPctError += pctErr;
    totalSqError += err * err;
    totalError += err;
  }

  const n = dataset.length;
  return {
    mae: Number((totalAbsError / n).toFixed(2)),
    mape: Number((totalPctError / n).toFixed(1)),
    rmse: Number((Math.sqrt(totalSqError / n)).toFixed(2)),
    bias: Number((totalError / n).toFixed(2)),
  };
}

/**
 * Primary Historical Validation Engine entrypoint.
 * Evaluates committed inputs against historical observations.
 */
export function runHistoricalValidation(
  committedInputs: ScenarioInputValues,
  dataset: HistoricalObservation[] = BAGHEWALA_HISTORICAL_DATASET
): HistoricalValidationResult {
  const matches = findHistoricalMatches(committedInputs, dataset, { topN: 3 });
  const topMatch = matches[0];

  const currentSim = simulateHistoricalRecordProduction(committedInputs);
  const predictedProductionBopd = currentSim.predictedProductionBopd;

  const observedProductionBopd = topMatch?.record.observedProductionBopd ?? 0.75;
  const absoluteErrorBopd = Number(Math.abs(predictedProductionBopd - observedProductionBopd).toFixed(2));
  const absolutePercentageError = Number(
    ((absoluteErrorBopd / Math.max(0.1, observedProductionBopd)) * 100.0).toFixed(1)
  );

  const datasetMetrics = calculateDatasetErrorMetrics(dataset);

  const isWithinEnvelope = checkIsWithinOperatingEnvelope(committedInputs);

  let validationStatus: ValidationStatus = 'VALIDATED';
  if (!isWithinEnvelope) {
    validationStatus = 'OUTSIDE_HISTORICAL_RANGE';
  } else if (dataset.length < 3 || (topMatch && topMatch.distance > 0.35)) {
    validationStatus = 'LIMITED_DATA';
  } else {
    validationStatus = 'VALIDATED';
  }

  const confidence = evaluateEngineeringConfidence(
    topMatch,
    datasetMetrics.mape,
    committedInputs,
    validationStatus
  );

  const uncertaintySources: string[] = [
    'Viscosity model log-linear extrapolation above 85°C',
    'Uncalibrated bottomhole pressure drawdown transients',
    'Permeability heterogeneity across Jodhpur sandstone formation',
    'Demonstration/synthetic dataset variance vs real field gauges',
  ];

  return {
    matchedRecords: matches,
    topMatch,
    predictedProductionBopd,
    observedProductionBopd,
    absoluteErrorBopd,
    absolutePercentageError,
    mae: datasetMetrics.mae,
    mape: datasetMetrics.mape,
    rmse: datasetMetrics.rmse,
    bias: datasetMetrics.bias,
    validationStatus,
    confidenceBand: confidence.level,
    uncertaintySources,
    dataProvenanceLabel: 'DEMONSTRATION / SYNTHETIC HISTORICAL DATASET',
    disclaimer:
      'ENGINEERING ADVISORY NOTICE: Historical validation calculations compare physics-based simulation outputs against reference demonstration data. Physical field SCADA integration and gauge calibration are required for field operations.',
    calculatedAt: new Date().toISOString(),
  };
}
