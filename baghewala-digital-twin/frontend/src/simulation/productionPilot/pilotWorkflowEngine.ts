import type {
  PilotWorkflowExecutionState,
  PilotWorkflowState,
  PilotScenarioId,
  PilotReadinessGates,
} from './types';
import { MANDATORY_PILOT_DISCLAIMER, REAL_FIELD_NOT_CONNECTED_LABEL } from './defaults';
import { getPilotScenarioById } from './pilotScenarioEngine';
import { PilotTelemetryReplayEngine } from './telemetryReplayEngine';
import { computePilotKPIs } from './pilotKPIEngine';
import { evaluatePilotRiskWorkflow } from './pilotRiskEngine';
import { generatePilotAuditTrail } from './pilotAuditEngine';
import { executeIntegratedValidation } from '../integratedValidation';
import { executeFinalDeploymentValidation } from '../deploymentReadiness';

import type { ScenarioInputValues } from '../scenario/types';

export function executeProductionPilotWorkflow(
  scenarioId: PilotScenarioId = 'SCENARIO_A_NORMAL',
  frameIndex = 0,
  isRealTelemetryConnected = false,
  activeInputs?: ScenarioInputValues
): PilotWorkflowExecutionState {
  const timestamp = new Date().toISOString();
  const scenario = getPilotScenarioById(scenarioId);

  const effectiveOverrides =
    scenarioId === 'SCENARIO_A_NORMAL' && activeInputs
      ? {
          reservoirTemperatureC: activeInputs.reservoirTemperatureC,
          steamRateTpd: activeInputs.steamInjectionRateTpd,
          vfdFrequencyHz: activeInputs.vfdFrequencyHz,
          spm: activeInputs.spm,
          strokeLengthMeters: activeInputs.strokeLengthMeters,
          soakDurationDays: activeInputs.soakDurationDays,
        }
      : scenario.overrides;

  // 1. Telemetry Replay engine setup
  const replayEngine = new PilotTelemetryReplayEngine(50);
  replayEngine.loadScenarioFrame(scenario, frameIndex);
  const replayState = replayEngine.getState();

  // 2. Execute Step 5.7 integrated validation & physics chain
  const validationState = executeIntegratedValidation({
    sourceType: scenario.sourceType,
    modelMode: 'CALIBRATED',
    reservoirTemperatureC: effectiveOverrides.reservoirTemperatureC,
    steamInjectionRateTpd: effectiveOverrides.steamRateTpd,
    vfdFrequencyHz: effectiveOverrides.vfdFrequencyHz,
    spm: effectiveOverrides.spm,
    strokeLengthMeters: effectiveOverrides.strokeLengthMeters,
    soakDurationDays: effectiveOverrides.soakDurationDays,
  });

  const twinState = validationState.currentTwinState;

  // 3. Execute Step 5.10 Deployment Readiness evaluation
  const deploymentValidation = executeFinalDeploymentValidation({
    sourceType: scenario.sourceType,
    modelMode: 'CALIBRATED',
    telemetryStatus: isRealTelemetryConnected ? 'REAL_FIELD_FEED' : 'SIMULATED',
  });

  // 4. Compute KPIs
  const kpis = computePilotKPIs(twinState, validationState, scenario.provenanceTag);

  // 5. Evaluate Pilot Risk Events
  const riskEvents = evaluatePilotRiskWorkflow(twinState, validationState);

  // 6. Generate Audit Trail
  const auditTrail = generatePilotAuditTrail(scenario, twinState, validationState, scenario.provenanceTag);

  // 7. Evaluate Readiness Gates
  const blockers: string[] = [...deploymentValidation.blockers];
  const warnings: string[] = [...deploymentValidation.warnings];

  if (!isRealTelemetryConnected && scenario.sourceType === 'REAL_FIELD') {
    warnings.push(REAL_FIELD_NOT_CONNECTED_LABEL);
  }

  const readinessGates: PilotReadinessGates = {
    dataReady: (validationState.qualityReport?.qualityScore ?? 85) >= 70,
    modelReady: true,
    telemetryReady: isRealTelemetryConnected || scenario.sourceType === 'HISTORICAL' || scenario.sourceType === 'USER_IMPORTED',
    validationReady: validationState.validationResult.overallStatus === 'VALIDATED' || validationState.validationResult.overallStatus === 'PARTIALLY_VALIDATED',
    safetyReady: deploymentValidation.safetyGovernance.automaticActuationBlocked,
    auditReady: auditTrail.length === 12,
    simulationPilotReady: blockers.length === 0,
    realFieldPilotReady: isRealTelemetryConnected && blockers.length === 0,
    deploymentReadinessLevel: deploymentValidation.readinessLevel,
    disclaimer: MANDATORY_PILOT_DISCLAIMER,
  };

  // 8. Determine Workflow State
  let workflowState: PilotWorkflowState = 'IDLE';

  if (blockers.length > 0) {
    workflowState = 'BLOCKED';
  } else if (readinessGates.realFieldPilotReady) {
    workflowState = 'PILOT_READY';
  } else if (readinessGates.simulationPilotReady) {
    workflowState = 'ENGINEERING_REVIEW';
  } else {
    workflowState = 'SIMULATION_RUNNING';
  }

  const dataProvenanceLabel = isRealTelemetryConnected
    ? 'REAL FIELD TELEMETRY'
    : scenario.sourceType === 'HISTORICAL'
    ? 'HISTORICAL APPRAISAL DATASET'
    : 'SIMULATED / WHAT-IF TELEMETRY';

  return {
    timestamp,
    workflowState,
    activeScenario: scenario,
    replayState,
    twinState,
    kpis,
    riskEvents,
    auditTrail,
    readinessGates,
    blockers,
    warnings,
    mandatedDisclaimer: MANDATORY_PILOT_DISCLAIMER,
    isRealTelemetryConnected,
    dataProvenanceLabel,
  };
}
