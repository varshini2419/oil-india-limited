import type { DemonstrationResult, ReadinessLevel } from './types';
import { executeIntegratedValidation } from '../integratedValidation';
import { generateAuditTrail } from './auditEngine';
import type { ValidationInput } from '../integratedValidation/types';

export function runEndToEndDemonstration(input: ValidationInput = {}): DemonstrationResult {
  const timestamp = new Date().toISOString();

  // Execute integrated validation pipeline (Step 5.7) which runs Steps 4.3–5.6
  const state = executeIntegratedValidation({
    ...input,
    uncertaintySampleCount: input.uncertaintySampleCount || 10,
  });

  const isSimulated = state.input.sourceType !== 'REAL_FIELD';
  const telemetrySourceLabel = state.input.sourceType === 'REAL_FIELD'
    ? 'REAL FIELD TELEMETRY'
    : (state.input.sourceType === 'HISTORICAL' ? 'HISTORICAL DATA' : 'SIMULATED TELEMETRY');

  // Determine readiness level for the demonstration result
  let readinessLevel: ReadinessLevel = 'DEMO_READY';
  if (state.validationResult.overallStatus === 'VALIDATED' && state.confidenceResult.confidence === 'HIGH') {
    readinessLevel = 'PILOT_VALIDATION_READY';
  } else if (state.confidenceResult.confidence === 'MEDIUM' || state.confidenceResult.confidence === 'HIGH') {
    readinessLevel = 'ENGINEERING_REVIEW_READY';
  } else if (state.qualityReport.overallStatus === 'INVALID' || state.qualityReport.recordCount === 0) {
    readinessLevel = 'NOT_READY';
  }

  // Generate 9-stage audit trail for this run
  const auditTrail = generateAuditTrail(
    state.normalizedRecords,
    state.qualityReport,
    state.currentTwinState,
    state.validationResult,
    state.uncertaintyStats,
    state.integratedDecision.selectedScenario,
    state.decisionTrace,
    isSimulated
  );

  return {
    timestamp,
    telemetrySourceLabel,
    isSimulated,
    recordCount: state.normalizedRecords.length,
    twinState: state.currentTwinState,
    qualityReport: state.qualityReport,
    validationResult: state.validationResult,
    uncertaintyStats: state.uncertaintyStats,
    selectedScenario: state.integratedDecision.selectedScenario,
    decisionTrace: state.decisionTrace,
    readinessLevel,
    auditTrail,
  };
}
