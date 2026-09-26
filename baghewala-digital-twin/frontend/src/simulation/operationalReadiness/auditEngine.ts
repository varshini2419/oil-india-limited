import type { AuditTrail, AuditEvent } from './types';
import type { DataQualityReport, NormalizedTelemetryRecord } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { UncertaintyStatistics, ValidationResult, DecisionTrace } from '../integratedValidation/types';
import type { ScenarioCandidate } from '../scenarioOptimization/types';

export function generateAuditTrail(
  records: NormalizedTelemetryRecord[],
  qualityReport: DataQualityReport,
  twinState: DigitalTwinState,
  validationResult: ValidationResult,
  uncertaintyStats: UncertaintyStatistics,
  selectedScenario: ScenarioCandidate | null,
  decisionTrace: DecisionTrace,
  isSimulated: boolean = true
): AuditTrail {
  const timestamp = new Date().toISOString();
  const events: AuditEvent[] = [];

  const sourceLabel = isSimulated ? 'SIMULATED TELEMETRY' : 'REAL FIELD TELEMETRY';
  const provenanceTag = isSimulated ? 'SIMULATED' : 'MEASURED';

  // Stage 1: FIELD_DATA
  events.push({
    eventId: 'audit-stage-1',
    timestamp,
    stageNumber: 1,
    stageName: 'FIELD_DATA',
    inputSource: sourceLabel,
    inputProvenance: provenanceTag,
    modelUsed: 'FIELD_DATA_INTEGRATION_INGESTION',
    outputSummary: { recordCount: records.length, isSimulated: String(isSimulated) },
    warnings: records.length === 0 ? ['Empty field dataset ingested.'] : [],
    status: records.length > 0 ? 'COMPLETED' : 'WARNING',
  });

  // Stage 2: DATA_QUALITY
  events.push({
    eventId: 'audit-stage-2',
    timestamp,
    stageNumber: 2,
    stageName: 'DATA_QUALITY',
    inputSource: sourceLabel,
    inputProvenance: provenanceTag,
    modelUsed: 'SCHEMA_AND_QUALITY_ENGINE',
    outputSummary: { qualityScore: qualityReport.qualityScore, status: qualityReport.overallStatus },
    warnings: qualityReport.warnings,
    status: qualityReport.overallStatus === 'VALID' ? 'COMPLETED' : 'WARNING',
  });

  // Stage 3: UNIT_NORMALIZATION
  events.push({
    eventId: 'audit-stage-3',
    timestamp,
    stageNumber: 3,
    stageName: 'UNIT_NORMALIZATION',
    inputSource: sourceLabel,
    inputProvenance: 'UNIT_NORMALIZER',
    modelUsed: 'UNIT_NORMALIZATION_ENGINE',
    outputSummary: { normalizedUnits: '°C, bar, BOPD, TPD, Hz, SPM, m' },
    warnings: [],
    status: 'COMPLETED',
  });

  // Stage 4: PHYSICS
  events.push({
    eventId: 'audit-stage-4',
    timestamp,
    stageNumber: 4,
    stageName: 'PHYSICS',
    inputSource: 'NORMALIZED_TELEMETRY',
    inputProvenance: 'DOCUMENTED_PHYSICS_MODELS',
    modelUsed: 'STEPS_4.3_TO_4.8_PHYSICS_CHAIN',
    outputSummary: {
      temperatureC: twinState.reservoir?.reservoirTemperatureC ?? 58,
      viscosityCp: twinState.reservoir?.estimatedViscosityCp ?? 5000,
      mobilityDcP: twinState.reservoir?.oilMobilityDcP ?? 0.0005,
      productionBopd: twinState.production?.estimatedProductionBopd ?? 0.75,
      srpLoadIndex: twinState.srp?.srpLoadIndex ?? 50,
      cssThermalGainC: twinState.css?.thermalGainC ?? 10,
    },
    warnings: [],
    status: 'COMPLETED',
  });

  // Stage 5: CALIBRATION
  events.push({
    eventId: 'audit-stage-5',
    timestamp,
    stageNumber: 5,
    stageName: 'CALIBRATION',
    inputSource: 'BAGHEWALA_HISTORICAL_APPRAISAL_DATA',
    inputProvenance: 'CALIBRATED_ENGINE',
    modelUsed: 'STEP_5.2_HISTORICAL_CALIBRATION_ENGINE',
    outputSummary: {
      status: validationResult.overallStatus,
      coveragePercent: validationResult.dataCoveragePercent,
    },
    warnings: validationResult.overallStatus === 'INSUFFICIENT_DATA' ? ['Fewer than 3 historical samples.'] : [],
    status: validationResult.overallStatus === 'VALIDATED' ? 'COMPLETED' : 'WARNING',
  });

  // Stage 6: UNCERTAINTY
  events.push({
    eventId: 'audit-stage-6',
    timestamp,
    stageNumber: 6,
    stageName: 'UNCERTAINTY',
    inputSource: 'PARAMETRIC_DISTRIBUTIONS',
    inputProvenance: 'MONTE_CARLO_ENGINE',
    modelUsed: 'STEP_5.3_UNCERTAINTY_ENGINE',
    outputSummary: {
      p10Bopd: uncertaintyStats.p10Bopd,
      p50Bopd: uncertaintyStats.p50Bopd,
      p90Bopd: uncertaintyStats.p90Bopd,
      sampleCount: uncertaintyStats.sampleCount,
    },
    warnings: [],
    status: 'COMPLETED',
  });

  // Stage 7: OPTIMIZATION
  events.push({
    eventId: 'audit-stage-7',
    timestamp,
    stageNumber: 7,
    stageName: 'OPTIMIZATION',
    inputSource: 'OPERATIONAL_CONSTRAINTS',
    inputProvenance: 'GRID_SEARCH_PARETO_ENGINE',
    modelUsed: 'STEP_5.4_SCENARIO_OPTIMIZATION_ENGINE',
    outputSummary: {
      selectedScenario: selectedScenario ? selectedScenario.name : 'NONE',
    },
    warnings: selectedScenario ? [] : ['No feasible scenario candidate found.'],
    status: selectedScenario ? 'COMPLETED' : 'WARNING',
  });

  // Stage 8: RISK
  events.push({
    eventId: 'audit-stage-8',
    timestamp,
    stageNumber: 8,
    stageName: 'RISK',
    inputSource: 'TWIN_STATE_METRICS',
    inputProvenance: 'STEP_4.9_AI_RISK_ENGINE',
    modelUsed: 'AI_RISK_ADVISORY_ENGINE',
    outputSummary: {
      riskLevel: twinState.risk.riskLevel,
      riskScore: twinState.risk.riskScore,
    },
    warnings: twinState.risk.riskLevel === 'HIGH' || twinState.risk.riskLevel === 'CRITICAL' ? ['Elevated risk detected.'] : [],
    status: twinState.risk.riskLevel === 'HIGH' || twinState.risk.riskLevel === 'CRITICAL' ? 'WARNING' : 'COMPLETED',
  });

  // Stage 9: DECISION
  events.push({
    eventId: 'audit-stage-9',
    timestamp,
    stageNumber: 9,
    stageName: 'DECISION',
    inputSource: 'AUDITABLE_DECISION_TRACE',
    inputProvenance: 'INTEGRATED_VALIDATION_ENGINE',
    modelUsed: 'STEP_5.7_DECISION_TRACE_ENGINE',
    outputSummary: {
      traceStages: decisionTrace.stages.length,
      traceStatus: decisionTrace.overallTraceStatus,
    },
    warnings: [],
    status: decisionTrace.overallTraceStatus === 'COMPLETE' ? 'COMPLETED' : 'WARNING',
  });

  let overallStatus: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS';
  if (events.some((e) => e.status === 'FAILED')) overallStatus = 'FAILED';
  else if (events.some((e) => e.status === 'WARNING')) overallStatus = 'WARNING';

  return {
    auditId: `audit-run-${Date.now()}`,
    runTimestamp: timestamp,
    events,
    overallStatus,
  };
}
