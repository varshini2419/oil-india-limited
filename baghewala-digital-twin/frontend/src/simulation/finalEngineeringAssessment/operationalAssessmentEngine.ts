import type { AssessmentInput, OperationalAssessment, EvidenceStatus } from './types';

export function evaluateOperationalAssessment(input?: AssessmentInput): OperationalAssessment {
  const gates = input?.pilotExecutionState?.readinessGates;
  const isRealConn = input?.isRealTelemetryConnected ?? false;

  const softwareReadinessStatus: EvidenceStatus = gates?.modelReady ? 'PASS' : 'WARNING';
  const engineeringReviewStatus: EvidenceStatus = gates?.validationReady ? 'PASS' : 'PARTIAL';
  const pilotValidationStatus: EvidenceStatus = gates?.simulationPilotReady ? 'PASS' : 'WARNING';
  const telemetryReadinessStatus: EvidenceStatus = isRealConn ? 'PASS' : 'PARTIAL';
  const auditCompletenessStatus: EvidenceStatus = gates?.auditReady ? 'PASS' : 'WARNING';
  const realFieldReadinessStatus: EvidenceStatus = gates?.realFieldPilotReady ? 'PASS' : 'WARNING';

  const humanReviewRequired = true; // Always true for advisory-only decision support

  const summary = isRealConn
    ? 'Real field telemetry stream connected. Engineering review and physical field validation required before operational adjustments.'
    : 'System software and simulation pilot verified ready. Real field telemetry unconnected; operational execution limited to engineering demonstration and what-if simulation.';

  return {
    softwareReadinessStatus,
    engineeringReviewStatus,
    pilotValidationStatus,
    telemetryReadinessStatus,
    auditCompletenessStatus,
    realFieldReadinessStatus,
    humanReviewRequired,
    summary,
  };
}
