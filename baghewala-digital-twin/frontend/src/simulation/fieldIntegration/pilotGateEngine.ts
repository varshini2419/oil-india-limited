import type {
  PilotGateEvaluation,
  PilotGateConditions,
  PilotGateStatus,
  QualityGateResult,
  TelemetryConnectionStatus,
  TelemetryMode,
} from './types';
import { MANDATORY_FIELD_INTEGRATION_DISCLAIMER } from './defaults';

export function evaluatePilotGate(input: {
  mode: TelemetryMode;
  connectionStatus: TelemetryConnectionStatus;
  qualityResult: QualityGateResult;
  modelReady: boolean;
  uncertaintyAvailable: boolean;
  riskEngineAvailable: boolean;
  operatorApproved?: boolean;
  forcePilotPause?: boolean;
}): PilotGateEvaluation {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  const telemetryConnected = input.connectionStatus !== 'NOT_CONNECTED' && input.connectionStatus !== 'ERROR';
  const acceptableQuality = input.qualityResult.status === 'ACCEPTED' || input.qualityResult.status === 'ACCEPTED_WITH_WARNING';
  const advisoryOnlyConfirmed = true; // Hardcoded safety governance constraint
  const auditLoggingActive = true;
  const operatorApproved = Boolean(input.operatorApproved);

  if (!telemetryConnected) {
    blockingIssues.push('Telemetry connection is NOT_CONNECTED or in ERROR state.');
  }

  if (!acceptableQuality) {
    blockingIssues.push(`Telemetry data quality is ${input.qualityResult.status}. Must be ACCEPTED or ACCEPTED_WITH_WARNING.`);
  }

  if (input.qualityResult.freshness === 'STALE') {
    warnings.push('Telemetry data freshness is STALE (> 300s old). Proceed with caution.');
  } else if (input.qualityResult.freshness === 'OFFLINE') {
    blockingIssues.push('Telemetry stream is OFFLINE (> 3600s old).');
  }

  if (!input.modelReady) {
    blockingIssues.push('Baseline/Calibrated physics model engine is not ready.');
  }

  if (!input.uncertaintyAvailable) {
    warnings.push('Uncertainty engine Monte Carlo analysis is unavailable; defaulting to baseline deterministic confidence.');
  }

  if (!input.riskEngineAvailable) {
    blockingIssues.push('AI Risk Advisory engine is unavailable.');
  }

  const conditions: PilotGateConditions = {
    telemetryConnected,
    acceptableQuality,
    modelReady: input.modelReady,
    uncertaintyAvailable: input.uncertaintyAvailable,
    riskEngineAvailable: input.riskEngineAvailable,
    advisoryOnlyConfirmed,
    auditLoggingActive,
    operatorApproved,
  };

  let status: PilotGateStatus = 'NOT_CONNECTED';

  if (!telemetryConnected) {
    status = 'NOT_CONNECTED';
  } else if (!acceptableQuality || input.qualityResult.freshness === 'OFFLINE' || !input.modelReady || !input.riskEngineAvailable) {
    status = 'DATA_NOT_READY';
  } else if (input.forcePilotPause) {
    status = 'PILOT_PAUSED';
  } else if (!operatorApproved) {
    status = 'ENGINEERING_REVIEW_REQUIRED';
  } else if (operatorApproved && blockingIssues.length === 0) {
    status = 'PILOT_READY';
  } else {
    status = 'DATA_NOT_READY';
  }

  return {
    status,
    conditions,
    blockingIssues,
    warnings,
    mandatedDisclaimer: MANDATORY_FIELD_INTEGRATION_DISCLAIMER,
  };
}
