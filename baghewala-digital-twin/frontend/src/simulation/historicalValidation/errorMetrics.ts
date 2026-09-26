import { VALIDATION_LIMITS } from './defaults';

export function calculateAbsoluteError(historical: number | null, modeled: number | null): number | null {
  if (historical === null || modeled === null || Number.isNaN(historical) || Number.isNaN(modeled)) {
    return null;
  }
  return Number(Math.abs(modeled - historical).toFixed(4));
}

export function calculatePercentageError(historical: number | null, modeled: number | null): number | null {
  if (historical === null || modeled === null || Number.isNaN(historical) || Number.isNaN(modeled)) {
    return null;
  }
  if (historical === 0) {
    return modeled === 0 ? 0 : null;
  }
  return Number((((modeled - historical) / Math.abs(historical)) * 100).toFixed(2));
}

export function calculateMAE(errors: (number | null)[]): number | undefined {
  const validErrors = errors.filter((e): e is number => e !== null && !Number.isNaN(e));
  if (validErrors.length < VALIDATION_LIMITS.minObservationsForMetrics) {
    return undefined;
  }
  const sum = validErrors.reduce((acc, curr) => acc + Math.abs(curr), 0);
  return Number((sum / validErrors.length).toFixed(2));
}

export function calculateMAPE(percentageErrors: (number | null)[]): number | undefined {
  const validErrors = percentageErrors.filter((e): e is number => e !== null && !Number.isNaN(e));
  if (validErrors.length < VALIDATION_LIMITS.minObservationsForMetrics) {
    return undefined;
  }
  const sum = validErrors.reduce((acc, curr) => acc + Math.abs(curr), 0);
  return Number((sum / validErrors.length).toFixed(2));
}

export function calculateRMSE(historicalVals: (number | null)[], modeledVals: (number | null)[]): number | undefined {
  const pairs: { h: number; m: number }[] = [];
  for (let i = 0; i < Math.min(historicalVals.length, modeledVals.length); i++) {
    const h = historicalVals[i];
    const m = modeledVals[i];
    if (h !== null && m !== null && !Number.isNaN(h) && !Number.isNaN(m)) {
      pairs.push({ h, m });
    }
  }

  if (pairs.length < VALIDATION_LIMITS.minObservationsForMetrics) {
    return undefined;
  }

  const sumSquaredDiffs = pairs.reduce((acc, p) => acc + Math.pow(p.m - p.h, 2), 0);
  return Number(Math.sqrt(sumSquaredDiffs / pairs.length).toFixed(2));
}
