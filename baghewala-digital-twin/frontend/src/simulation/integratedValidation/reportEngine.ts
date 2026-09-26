import type {
  IntegratedReport,
  ValidationResult,
  ConfidenceResult,
  IntegratedDecision,
  DecisionTrace,
  UncertaintyStatistics,
} from './types';
import type { DataQualityReport, NormalizedTelemetryRecord } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ScenarioCandidate } from '../scenarioOptimization/types';
import { INTEGRATED_VALIDATION_DISCLAIMER, DEFAULT_ASSUMPTIONS, DEFAULT_LIMITATIONS } from './defaults';

export function generateIntegratedReport(
  twinState: DigitalTwinState,
  qualityReport: DataQualityReport,
  validationResult: ValidationResult,
  confidenceResult: ConfidenceResult,
  uncertaintyStats: UncertaintyStatistics,
  candidates: ScenarioCandidate[],
  decisionTrace: DecisionTrace,
  integratedDecision: IntegratedDecision,
  records: NormalizedTelemetryRecord[]
): IntegratedReport {
  const timestamp = twinState.timestamp || new Date().toISOString();
  const reportId = `report_baghewala_${Date.now()}`;

  const execSummary = `Baghewala Heavy Oil Digital Twin integrated validation executed under ${twinState.metadata.modelMode} mode. Data quality score is ${qualityReport.qualityScore}% across ${qualityReport.recordCount} ingested record(s). Overall validation status is ${validationResult.overallStatus} with ${confidenceResult.confidence} model confidence (${confidenceResult.confidenceScore}/100). Model uncertainty range is P10 ${uncertaintyStats.p10Bopd} BOPD to P90 ${uncertaintyStats.p90Bopd} BOPD.`;

  const assumptions = [...DEFAULT_ASSUMPTIONS];
  const limitations = [...DEFAULT_LIMITATIONS, ...validationResult.limitations];

  if (records.length < 3) {
    limitations.push(`Sparse field data: Only ${records.length} record(s) provided. Statistical validation cannot be claimed.`);
  }

  const provenanceMap: Record<string, string> = {
    ...twinState.metadata.provenance,
    'Field Telemetry Data': records[0]?.source || 'SCENARIO_DEFAULTS',
    'Data Quality Engine': `Score ${qualityReport.qualityScore}% (${qualityReport.overallStatus})`,
    'Uncertainty Engine': `Monte Carlo ${uncertaintyStats.sampleCount} samples`,
    'Decision Support Engine': 'Step 5.7 Integrated Validation',
  };

  return {
    reportId,
    generatedAt: timestamp,
    title: 'Baghewala Heavy-Oil Field Digital Twin Integrated Validation Report',
    executiveSummary: execSummary,
    currentTwinState: twinState,
    dataQualityReport: qualityReport,
    modelMode: twinState.metadata.modelMode,
    calibrationStatus: twinState.metadata.modelMode === 'CALIBRATED' ? 'Calibrated parameters active from Step 5.2 registry.' : 'Baseline model active.',
    validationMetrics: validationResult.metricComparisons,
    performanceSummaries: validationResult.performanceSummary,
    uncertaintyStats,
    candidateScenarios: candidates,
    riskSummary: {
      riskLevel: twinState.risk.riskLevel,
      riskScore: twinState.risk.riskScore,
      detectedIssues: twinState.risk.activeWarnings,
    },
    decisionTrace,
    integratedDecision,
    assumptions,
    limitations,
    provenanceMap,
    advisoryNotice: INTEGRATED_VALIDATION_DISCLAIMER,
  };
}
