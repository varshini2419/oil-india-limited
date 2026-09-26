import type { NormalizedTelemetryRecord, OutlierClassification, TelemetryValue } from './types';

export function detectAndClassifyOutliers(
  records: NormalizedTelemetryRecord[],
  rejectOutliers = false
): NormalizedTelemetryRecord[] {
  if (records.length < 3) {
    // Insufficient dataset size for statistical IQR calculation
    return records;
  }

  const numericKeys: Array<keyof NormalizedTelemetryRecord> = [
    'reservoirTemperature',
    'reservoirPressure',
    'flowingPressure',
    'viscosity',
    'permeability',
    'steamRateTpd',
    'steamQuality',
    'vfdHz',
    'spm',
    'strokeM',
    'productionBopd',
  ];

  const fieldStats: Record<string, { q1: number; q3: number; iqr: number }> = {};

  numericKeys.forEach((key) => {
    const vals = records
      .map((r) => (r[key] as TelemetryValue<number> | undefined)?.value)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (vals.length >= 3) {
      const sorted = [...vals].sort((a, b) => a - b);
      const q1 = getPercentile(sorted, 0.25);
      const q3 = getPercentile(sorted, 0.75);
      const iqr = q3 - q1;
      fieldStats[key] = { q1, q3, iqr };
    }
  });

  return records.map((rec) => {
    const updatedRec = { ...rec, warnings: [...rec.warnings] };
    let hasExtremeOutlier = false;

    numericKeys.forEach((key) => {
      const valObj = rec[key] as TelemetryValue<number> | undefined;
      const stats = fieldStats[key];

      if (valObj && typeof valObj.value === 'number' && stats) {
        const { q1, q3, iqr } = stats;
        let classification: OutlierClassification = 'NORMAL';
        let reason: string | undefined;

        if (iqr > 0) {
          const lowerMild = q1 - 1.5 * iqr;
          const upperMild = q3 + 1.5 * iqr;
          const lowerExtreme = q1 - 3.0 * iqr;
          const upperExtreme = q3 + 3.0 * iqr;

          if (valObj.value < lowerExtreme || valObj.value > upperExtreme) {
            classification = 'EXTREME_OUTLIER';
            reason = `Value ${valObj.value} is an extreme outlier beyond 3.0x IQR range [${lowerExtreme.toFixed(2)}, ${upperExtreme.toFixed(2)}].`;
            hasExtremeOutlier = true;
          } else if (valObj.value < lowerMild || valObj.value > upperMild) {
            classification = 'POSSIBLE_OUTLIER';
            reason = `Value ${valObj.value} is a possible outlier beyond 1.5x IQR range [${lowerMild.toFixed(2)}, ${upperMild.toFixed(2)}].`;
          }
        }

        (updatedRec[key] as TelemetryValue<number>) = {
          ...valObj,
          outlierStatus: classification,
          outlierReason: reason,
        };

        if (reason) {
          updatedRec.warnings.push(`[${String(key)}] ${reason}`);
        }
      }
    });

    if (rejectOutliers && hasExtremeOutlier) {
      updatedRec.qualityStatus = 'INVALID';
      updatedRec.errors = [...(updatedRec.errors || []), 'Record rejected due to extreme outlier values.'];
    }

    return updatedRec;
  });
}

function getPercentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = p * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
