import type { DataReadinessEvaluation, DataReadinessStatus } from './types';
import type { DataQualityReport, NormalizedTelemetryRecord } from '../fieldDataIntegration/types';

export function evaluateDataReadiness(
  qualityReport?: DataQualityReport,
  records?: NormalizedTelemetryRecord[]
): DataReadinessEvaluation {
  const warnings: string[] = [];

  if (!qualityReport || !records || records.length === 0 || qualityReport.recordCount === 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      qualityScore: 0,
      recordCount: 0,
      completenessPercent: 0,
      missingMetricsCount: 0,
      outlierCount: 0,
      rangeViolationsCount: 0,
      provenanceSummary: {},
      warnings: ['No telemetry or field data available for evaluation. Status set to INSUFFICIENT_DATA.'],
    };
  }

  const recordCount = records.length;
  const qualityScore = qualityReport.qualityScore;
  const missingMetricsCount = qualityReport.missingValueCount;
  const outlierCount = qualityReport.outlierCount;
  const rangeViolationsCount = qualityReport.rangeViolationCount;

  // Compute provenance breakdown
  const provenanceSummary: Record<string, number> = {
    MEASURED: 0,
    SIMULATED: 0,
    HISTORICAL: 0,
    IMPUTED: 0,
    DERIVED: 0,
    NOT_AVAILABLE: 0,
  };

  records.forEach((r) => {
    Object.values(r).forEach((val: any) => {
      if (val && typeof val === 'object' && 'provenance' in val) {
        const prov = (val.provenance as string) || 'NOT_AVAILABLE';
        provenanceSummary[prov] = (provenanceSummary[prov] || 0) + 1;
      }
    });
  });

  const completenessPercent = qualityReport.completenessPercent;

  if (qualityReport.overallStatus === 'INVALID') {
    warnings.push('Field dataset failed schema validation or contains severe invalid entries.');
  }
  if (missingMetricsCount > 0) {
    warnings.push(`${missingMetricsCount} essential metric field(s) missing and marked NOT_AVAILABLE.`);
  }
  if (outlierCount > 0) {
    warnings.push(`${outlierCount} extreme outlier record(s) detected during data ingestion.`);
  }
  if (provenanceSummary.SIMULATED > 0) {
    warnings.push(`${provenanceSummary.SIMULATED} metric(s) labeled SIMULATED TELEMETRY (not real field sensor measurement).`);
  }

  let status: DataReadinessStatus = 'READY';
  if (qualityReport.overallStatus === 'INVALID') {
    status = 'INVALID';
  } else if (qualityScore < 50 || completenessPercent < 50) {
    status = 'INSUFFICIENT_DATA';
  } else if (qualityScore < 80 || warnings.length > 0) {
    status = 'WARNING';
  }

  return {
    status,
    qualityScore,
    recordCount,
    completenessPercent,
    missingMetricsCount,
    outlierCount,
    rangeViolationsCount,
    provenanceSummary,
    warnings,
  };
}
