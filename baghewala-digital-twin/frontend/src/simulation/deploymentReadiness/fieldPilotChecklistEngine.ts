import type { FieldPilotChecklist, DeploymentGate, TelemetryConnectionInfo, DataAcceptanceResult, SafetyGovernanceResult } from './types';

export function evaluateFieldPilotChecklist(
  gates: DeploymentGate[],
  telemetry: TelemetryConnectionInfo,
  dataAcceptance: DataAcceptanceResult,
  safety: SafetyGovernanceResult
): FieldPilotChecklist {
  const isGatePassed = (gateId: string) => {
    const gate = gates.find((g) => g.gateId === gateId);
    return gate ? gate.status === 'PASS' : false;
  };

  const checklist: Omit<FieldPilotChecklist, 'totalPassed' | 'totalChecks' | 'completionPercentage'> = {
    telemetryConnection: telemetry.status === 'REAL_FIELD_FEED' || telemetry.status === 'SIMULATED' || telemetry.status === 'TEST_FEED',
    dataQuality: dataAcceptance.status === 'ACCEPT' || dataAcceptance.status === 'ACCEPT_WITH_WARNINGS',
    timestampSynchronization: telemetry.lastTimestamp.length > 0 && dataAcceptance.validTimestampCount > 0,
    unitConsistency: isGatePassed('GATE-07'),
    sensorCoverage: dataAcceptance.sensorCoverageScore >= 70,
    historicalValidation: isGatePassed('GATE-04'),
    calibration: isGatePassed('GATE-05'),
    uncertainty: isGatePassed('GATE-06'),
    scenarioValidation: isGatePassed('GATE-10'),
    riskAdvisory: isGatePassed('GATE-11'),
    operatorReview: isGatePassed('GATE-13'),
    safetyReview: safety.advisoryOnlyEnforced && safety.automaticActuationBlocked,
    auditLogging: isGatePassed('GATE-12'),
  };

  const checksArray = Object.values(checklist);
  const totalChecks = checksArray.length;
  const totalPassed = checksArray.filter(Boolean).length;
  const completionPercentage = Math.round((totalPassed / totalChecks) * 100);

  return {
    ...checklist,
    totalPassed,
    totalChecks,
    completionPercentage,
  };
}
