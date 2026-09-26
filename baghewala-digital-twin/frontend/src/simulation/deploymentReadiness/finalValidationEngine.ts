import type {
  FinalValidationInput,
  FinalValidationResult,
  DeploymentReadinessLevel,
} from './types';
import type { ValueProvenance } from '../fieldDataIntegration/types';
import { MANDATORY_DEPLOYMENT_DISCLAIMER } from './defaults';
import { executeIntegratedValidation } from '../integratedValidation';
import { evaluateDeploymentGates } from './deploymentGateEngine';
import { evaluateTelemetryConnectionReadiness } from './telemetryConnectionEngine';
import { evaluateFieldPilotDataAcceptance } from './dataAcceptanceEngine';
import { evaluateModelAcceptance } from './modelAcceptanceEngine';
import { evaluateSafetyGovernance } from './safetyGovernanceEngine';
import { evaluateFieldPilotChecklist } from './fieldPilotChecklistEngine';
import { generateDeploymentAuditTrail } from './deploymentAuditEngine';

export function executeFinalDeploymentValidation(
  input: FinalValidationInput = {}
): FinalValidationResult {
  const timestamp = new Date().toISOString();
  const sourceType = input.sourceType || 'HISTORICAL';

  // 1. Run Step 5.7 integrated validation (covers Steps 4.3–5.6)
  const validationState = executeIntegratedValidation({
    sourceType,
    modelMode: input.modelMode,
    reservoirTemperatureC: input.reservoirTemperatureC,
    steamInjectionRateTpd: input.steamInjectionRateTpd,
    vfdFrequencyHz: input.vfdFrequencyHz,
    spm: input.spm,
    strokeLengthMeters: input.strokeLengthMeters,
    soakDurationDays: input.soakDurationDays,
  });

  // 2. Evaluate Telemetry Connection Readiness (Step 5.10)
  const telemetry = evaluateTelemetryConnectionReadiness(sourceType, input.telemetryStatus);

  // 3. Evaluate Data Acceptance (Step 5.10)
  const dataAcceptance = evaluateFieldPilotDataAcceptance(telemetry);

  // 4. Evaluate Model Acceptance (Step 5.10)
  const modelAcceptance = evaluateModelAcceptance(validationState, input);

  // 5. Evaluate Safety & Governance (Step 5.10)
  const safetyGovernance = evaluateSafetyGovernance(input);

  // 6. Evaluate Deployment Gates (Step 5.10)
  const deploymentGates = evaluateDeploymentGates(
    { ...input, sourceType },
    {
      hasFieldData: dataAcceptance.status !== 'INSUFFICIENT_DATA',
    dataQualityScore: dataAcceptance.status === 'INSUFFICIENT_DATA' ? 0 : 90,
    hasCalibration: modelAcceptance.calibratedModelAvailable,
    hasUncertainty: modelAcceptance.uncertaintyWidthBopd > 0,
    isSimulatedTelemetry: telemetry.isSimulated,
    isRealTelemetryConnected: telemetry.status === 'REAL_FIELD_FEED',
    bypassSafetyChecks: input.bypassSafetyChecks,
  });

  // 7. Evaluate Field Pilot Checklist (Step 5.10)
  const fieldPilotChecklist = evaluateFieldPilotChecklist(
    deploymentGates,
    telemetry,
    dataAcceptance,
    safetyGovernance
  );

  // 8. Generate Audit Trail (Step 5.10)
  const auditTrail = generateDeploymentAuditTrail(
    telemetry,
    dataAcceptance,
    modelAcceptance,
    safetyGovernance,
    deploymentGates
  );

  // 9. Collect Blockers, Warnings, and Required Actions
  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredActions: string[] = [];

  deploymentGates.forEach((gate) => {
    if (gate.status === 'BLOCKED') {
      blockers.push(`${gate.name} [${gate.gateId}]: ${gate.evidence}`);
      requiredActions.push(gate.requiredAction);
    } else if (gate.status === 'WARNING') {
      warnings.push(`${gate.name} [${gate.gateId}]: ${gate.evidence}`);
      if (gate.requiredAction) requiredActions.push(gate.requiredAction);
    }
  });

  if (safetyGovernance.violations.length > 0) {
    safetyGovernance.violations.forEach((v) => blockers.push(`SAFETY VIOLATION: ${v}`));
  }

  // 10. Deterministic Readiness Level Determination
  let readinessLevel: DeploymentReadinessLevel = 'DEMO_READY';

  if (blockers.length > 0) {
    readinessLevel = 'NOT_READY';
  } else if (
    telemetry.status === 'REAL_FIELD_FEED' &&
    (dataAcceptance.status === 'ACCEPT' || dataAcceptance.status === 'ACCEPT_WITH_WARNINGS') &&
    fieldPilotChecklist.completionPercentage >= 80
  ) {
    readinessLevel = 'PILOT_VALIDATION_READY';
  } else if (modelAcceptance.status === 'ACCEPTED' || modelAcceptance.status === 'ACCEPTED_WITH_LIMITATIONS') {
    readinessLevel = 'ENGINEERING_REVIEW_READY';
  } else {
    readinessLevel = 'DEMO_READY';
  }

  const provenance: ValueProvenance = telemetry.provenance;

  return {
    timestamp,
    readinessLevel,
    deploymentGates,
    fieldPilotChecklist,
    telemetryConnection: telemetry,
    dataAcceptance,
    modelAcceptance,
    safetyGovernance,
    auditTrail,
    blockers,
    warnings,
    requiredActions: Array.from(new Set(requiredActions)),
    provenance,
    disclaimer: MANDATORY_DEPLOYMENT_DISCLAIMER,
    fieldCertified: false, // Explicitly false per mandate
  };
}
