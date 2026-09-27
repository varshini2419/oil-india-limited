import type { HistoricalObservation, HistoricalMatchResult } from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BAGHEWALA_HISTORICAL_DATASET } from './historicalDataset';

// Parameter ranges for normalization
const PARAMETER_RANGES = {
  reservoirTemperatureC: { min: 20.0, max: 150.0 },
  reservoirPressureBar: { min: 10.0, max: 100.0 },
  steamInjectionRateTpd: { min: 0.0, max: 300.0 },
  steamQualityPercent: { min: 0.0, max: 100.0 },
  waterCutPercent: { min: 0.0, max: 100.0 },
  spm: { min: 1.0, max: 25.0 },
  strokeLengthMeters: { min: 0.5, max: 5.0 },
  permeabilityDarcy: { min: 0.1, max: 10.0 },
};

/**
 * Finds top N historical matches comparing current scenario inputs to historical observations.
 * Uses Euclidean distance across normalized parameter spaces.
 */
export function findHistoricalMatches(
  currentInputs: ScenarioInputValues,
  dataset: HistoricalObservation[] = BAGHEWALA_HISTORICAL_DATASET,
  options?: { topN?: number }
): HistoricalMatchResult[] {
  const topN = options?.topN ?? 3;

  const results: HistoricalMatchResult[] = dataset.map((record) => {
    const deviations: Record<string, number> = {};
    let sumSqDev = 0;
    let paramCount = 0;

    for (const [key, range] of Object.entries(PARAMETER_RANGES)) {
      const curVal = (currentInputs as any)[key] ?? range.min;
      const obsVal = (record as any)[key] ?? range.min;

      const span = Math.max(0.001, range.max - range.min);
      const normDiff = Math.abs(curVal - obsVal) / span;

      deviations[key] = Number(normDiff.toFixed(4));
      sumSqDev += normDiff * normDiff;
      paramCount += 1;
    }

    const distance = Number(Math.sqrt(sumSqDev / paramCount).toFixed(4));
    const matchQualityPercent = Number(Math.max(0.0, 100.0 * (1.0 - distance)).toFixed(1));

    return {
      record,
      distance,
      matchQualityPercent,
      parameterDeviations: deviations,
    };
  });

  // Sort by distance ascending (closest first)
  results.sort((a, b) => a.distance - b.distance);

  return results.slice(0, topN);
}
