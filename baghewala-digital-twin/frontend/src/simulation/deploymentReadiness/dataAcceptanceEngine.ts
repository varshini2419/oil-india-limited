import type { DataAcceptanceResult, DataAcceptanceStatus, TelemetryConnectionInfo } from './types';

export function evaluateFieldPilotDataAcceptance(
  telemetry: TelemetryConnectionInfo,
  options: {
    completenessPercent?: number;
    missingValueCount?: number;
    outlierCount?: number;
    physicalBoundViolations?: number;
    hasDuplicateTimestamps?: boolean;
    sensorCoverageScore?: number;
  } = {}
): DataAcceptanceResult {
  const completeness = options.completenessPercent ?? (telemetry.status === 'DISCONNECTED' ? 0 : 92);
  const missingValues = options.missingValueCount ?? (telemetry.status === 'DISCONNECTED' ? 50 : 2);
  const outliers = options.outlierCount ?? 1;
  const boundViolations = options.physicalBoundViolations ?? 0;
  const sensorScore = options.sensorCoverageScore ?? (telemetry.status === 'DISCONNECTED' ? 0 : 85);
  const warnings: string[] = [];

  if (telemetry.status === 'DISCONNECTED' || telemetry.recordCount === 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      completenessPercent: 0,
      validTimestampCount: 0,
      missingValueCount: missingValues,
      outlierCount: outliers,
      physicalBoundViolations: boundViolations,
      sensorCoverageScore: 0,
      provenance: 'UNIT_UNKNOWN',
      summary: 'Telemetry feed disconnected or dataset empty. Data acceptance INSUFFICIENT_DATA.',
      warnings: ['No telemetry records available for evaluation.'],
    };
  }

  if (boundViolations > 0) {
    return {
      status: 'REJECT',
      completenessPercent: completeness,
      validTimestampCount: telemetry.recordCount,
      missingValueCount: missingValues,
      outlierCount: outliers,
      physicalBoundViolations: boundViolations,
      sensorCoverageScore: sensorScore,
      provenance: telemetry.provenance,
      summary: `Rejected: ${boundViolations} physical range bound violation(s) detected in field records.`,
      warnings: [`Physical bound violation: ${boundViolations} record(s) out of valid engineering limits.`],
    };
  }

  if (options.hasDuplicateTimestamps) {
    warnings.push('Duplicate timestamps detected in payload.');
  }

  if (outliers > 0) {
    warnings.push(`${outliers} statistical outlier record(s) detected.`);
  }

  if (missingValues > 0) {
    warnings.push(`${missingValues} missing telemetry field(s) detected.`);
  }

  let status: DataAcceptanceStatus = 'ACCEPT';
  let summary = `Data accepted cleanly (${completeness.toFixed(1)}% completeness).`;

  if (completeness < 70 || missingValues > 10) {
    status = 'REJECT';
    summary = `Data rejected due to low completeness (${completeness.toFixed(1)}%) or high missing value count (${missingValues}).`;
  } else if (warnings.length > 0) {
    status = 'ACCEPT_WITH_WARNINGS';
    summary = `Data accepted with ${warnings.length} warning condition(s).`;
  }

  return {
    status,
    completenessPercent: completeness,
    validTimestampCount: telemetry.recordCount,
    missingValueCount: missingValues,
    outlierCount: outliers,
    physicalBoundViolations: boundViolations,
    sensorCoverageScore: sensorScore,
    provenance: telemetry.provenance,
    summary,
    warnings,
  };
}
