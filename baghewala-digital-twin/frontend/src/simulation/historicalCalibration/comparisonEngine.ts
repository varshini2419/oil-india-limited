import type { CalibrationObservation, ErrorMetrics } from './types';
import { EPSILON_SAFE_DIVISION } from './defaults';

export function calculateAggregateErrorMetrics(
  observations: CalibrationObservation[],
  mode: 'baseline' | 'calibrated' = 'baseline'
): ErrorMetrics {
  const validObs = observations.filter(
    (o) => o.observedValue !== null && (mode === 'baseline' ? o.baselinePredictedValue !== null : o.calibratedPredictedValue !== null)
  );

  if (validObs.length === 0) {
    return {
      mae: 0.0,
      rmse: 0.0,
      mape: 0.0,
      maxAbsoluteError: 0.0,
      medianAbsoluteError: 0.0,
      observationCount: 0,
    };
  }

  const absErrors: number[] = [];
  const pctErrors: number[] = [];

  for (const obs of validObs) {
    const historicalVal = obs.observedValue!;
    const predVal = mode === 'baseline' ? obs.baselinePredictedValue! : obs.calibratedPredictedValue!;

    const absErr = Math.abs(historicalVal - predVal);
    absErrors.push(absErr);

    if (Math.abs(historicalVal) > EPSILON_SAFE_DIVISION) {
      const pctErr = (absErr / Math.abs(historicalVal)) * 100;
      pctErrors.push(pctErr);
    }
  }

  // 1. MAE
  const sumAbsErr = absErrors.reduce((sum, val) => sum + val, 0);
  const mae = Number((sumAbsErr / absErrors.length).toFixed(2));

  // 2. RMSE
  const sumSqErr = absErrors.reduce((sum, val) => sum + val * val, 0);
  const rmse = Number(Math.sqrt(sumSqErr / absErrors.length).toFixed(2));

  // 3. MAPE
  let mape = 0.0;
  if (pctErrors.length > 0) {
    const sumPctErr = pctErrors.reduce((sum, val) => sum + val, 0);
    mape = Number((sumPctErr / pctErrors.length).toFixed(2));
  }

  // 4. Max Absolute Error
  const maxAbsErr = Number(Math.max(...absErrors).toFixed(2));

  // 5. Median Absolute Error
  const sortedAbsErrors = [...absErrors].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedAbsErrors.length / 2);
  const medianAbsErr = Number(
    sortedAbsErrors.length % 2 !== 0
      ? sortedAbsErrors[midIndex].toFixed(2)
      : ((sortedAbsErrors[midIndex - 1] + sortedAbsErrors[midIndex]) / 2).toFixed(2)
  );

  return {
    mae,
    rmse,
    mape,
    maxAbsoluteError: maxAbsErr,
    medianAbsoluteError: medianAbsErr,
    observationCount: validObs.length,
  };
}

export function compareErrorMetrics(
  baseline: ErrorMetrics,
  calibrated: ErrorMetrics
): {
  maeImprovementPercent: number;
  rmseImprovementPercent: number;
  mapeImprovementPercent: number;
} {
  let maeImp = 0.0;
  let rmseImp = 0.0;
  let mapeImp = 0.0;

  if (baseline.mae > EPSILON_SAFE_DIVISION) {
    maeImp = Number((((baseline.mae - calibrated.mae) / baseline.mae) * 100).toFixed(2));
  }

  if (baseline.rmse > EPSILON_SAFE_DIVISION) {
    rmseImp = Number((((baseline.rmse - calibrated.rmse) / baseline.rmse) * 100).toFixed(2));
  }

  if (baseline.mape > EPSILON_SAFE_DIVISION) {
    mapeImp = Number((((baseline.mape - calibrated.mape) / baseline.mape) * 100).toFixed(2));
  }

  return {
    maeImprovementPercent: maeImp,
    rmseImprovementPercent: rmseImp,
    mapeImprovementPercent: mapeImp,
  };
}
