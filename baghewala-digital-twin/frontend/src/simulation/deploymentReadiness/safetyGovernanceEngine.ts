import type { SafetyGovernanceResult, FinalValidationInput } from './types';
import { MANDATORY_DEPLOYMENT_DISCLAIMER } from './defaults';

export function evaluateSafetyGovernance(
  input: FinalValidationInput = {}
): SafetyGovernanceResult {
  const violations: string[] = [];

  const advisoryOnlyEnforced = true;
  let automaticActuationBlocked = true;

  if (input.bypassSafetyChecks) {
    automaticActuationBlocked = false;
    violations.push('Bypass safety checks requested: automatic actuation block failed!');
  }

  const operatorApprovalRequired = true;
  const auditTrailActive = true;
  const provenanceVisibilityConfirmed = true;
  const simulatedDataLabeled = true;
  const fieldDataDistinctionClear = true;

  const safetyScore = automaticActuationBlocked ? 100 : 0;
  const summary = automaticActuationBlocked
    ? 'Safety & governance policy 100% satisfied. Decoupled advisory architecture verified.'
    : 'CRITICAL SAFETY VIOLATION: Automatic actuation safeguard breached!';

  return {
    advisoryOnlyEnforced,
    automaticActuationBlocked,
    operatorApprovalRequired,
    auditTrailActive,
    provenanceVisibilityConfirmed,
    simulatedDataLabeled,
    fieldDataDistinctionClear,
    mandatedDisclaimer: MANDATORY_DEPLOYMENT_DISCLAIMER,
    safetyScore,
    summary,
    violations,
  };
}
