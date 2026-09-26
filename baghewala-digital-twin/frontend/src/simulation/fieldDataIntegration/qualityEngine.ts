import type { NormalizedTelemetryRecord, DataQualityReport, DataQualityStatus } from './types';

export function computeDataQualityReport(
  records: NormalizedTelemetryRecord[],
  globalWarnings: string[] = [],
  globalErrors: string[] = []
): DataQualityReport {
  const recordCount = records.length;

  if (recordCount === 0) {
    return {
      overallStatus: 'INSUFFICIENT_DATA',
      qualityScore: 0,
      recordCount: 0,
      validRecordCount: 0,
      invalidRecordCount: 0,
      missingValueCount: 0,
      outlierCount: 0,
      rangeViolationCount: 0,
      completenessPercent: 0,
      warnings: globalWarnings.length > 0 ? globalWarnings : ['No records provided for quality analysis.'],
      errors: globalErrors,
    };
  }

  let validRecordCount = 0;
  let invalidRecordCount = 0;
  let missingValueCount = 0;
  let outlierCount = 0;
  let rangeViolationCount = 0;
  let totalExpectedFields = 0;
  let totalPopulatedFields = 0;

  const warningsSet = new Set<string>(globalWarnings);
  const errorsSet = new Set<string>(globalErrors);

  const numericFields: Array<keyof NormalizedTelemetryRecord> = [
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
    'waterCut',
  ];

  records.forEach((rec) => {
    if (rec.qualityStatus === 'VALID' || rec.qualityStatus === 'PARTIALLY_VALID') {
      validRecordCount++;
    } else if (rec.qualityStatus === 'INVALID') {
      invalidRecordCount++;
    }

    rec.warnings.forEach((w) => warningsSet.add(w));
    rec.errors.forEach((e) => errorsSet.add(e));

    numericFields.forEach((fieldKey) => {
      totalExpectedFields++;
      const valObj = rec[fieldKey] as any;
      if (valObj && valObj.value !== undefined && valObj.value !== null) {
        totalPopulatedFields++;
        if (valObj.isImputed) {
          missingValueCount++;
        }
        if (valObj.outlierStatus === 'POSSIBLE_OUTLIER' || valObj.outlierStatus === 'EXTREME_OUTLIER') {
          outlierCount++;
        }
      } else {
        missingValueCount++;
      }
    });

    if (rec.qualityStatus === 'OUTSIDE_MODEL_RANGE') {
      rangeViolationCount++;
    }
  });

  const completenessPercent = totalExpectedFields > 0
    ? Number(((totalPopulatedFields / totalExpectedFields) * 100).toFixed(1))
    : 0;

  // Score calculation
  const validRatio = validRecordCount / recordCount;
  let qualityScore = validRatio * 70 + completenessPercent * 0.3;

  // Deductions
  if (outlierCount > 0) qualityScore -= Math.min(15, outlierCount * 2);
  if (errorsSet.size > 0) qualityScore -= Math.min(20, errorsSet.size * 5);
  if (rangeViolationCount > 0) qualityScore -= Math.min(10, rangeViolationCount * 3);

  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

  // Determine overall status
  let overallStatus: DataQualityStatus = 'VALID';
  if (invalidRecordCount / recordCount > 0.4 || errorsSet.size >= 5) {
    overallStatus = 'INVALID';
  } else if (rangeViolationCount > 0) {
    overallStatus = 'OUTSIDE_MODEL_RANGE';
  } else if (qualityScore < 70) {
    overallStatus = 'PARTIALLY_VALID';
  }

  // Determine timestamp range
  const timestamps = records.map((r) => r.timestamp).filter(Boolean).sort();
  const timestampRange = timestamps.length > 0
    ? { start: timestamps[0], end: timestamps[timestamps.length - 1] }
    : undefined;

  return {
    overallStatus,
    qualityScore,
    recordCount,
    validRecordCount,
    invalidRecordCount,
    missingValueCount,
    outlierCount,
    rangeViolationCount,
    completenessPercent,
    warnings: Array.from(warningsSet),
    errors: Array.from(errorsSet),
    timestampRange,
  };
}
