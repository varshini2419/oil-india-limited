import type {
  IntegrationAuditEvent,
  QualityGateStatus,
  PilotGateStatus,
  TelemetryMode,
} from './types';
import type { ModelMode } from '../historicalCalibration/types';

export function createIntegrationAuditEvent(params: {
  source: TelemetryMode;
  wellId: string;
  inputQuality: QualityGateStatus;
  validationResult: string;
  modelMode: ModelMode;
  outputSummary: string;
  warnings?: string[];
  pilotState: PilotGateStatus;
  operatorStatus?: string;
  timestampIso?: string;
}): IntegrationAuditEvent {
  const timestamp = params.timestampIso || new Date().toISOString();
  const eventId = `EVD-INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    eventId,
    timestamp,
    source: params.source,
    wellId: params.wellId,
    inputQuality: params.inputQuality,
    validationResult: params.validationResult,
    modelMode: params.modelMode,
    modelVersion: 'v1.0.0-step6.1',
    outputSummary: params.outputSummary,
    warnings: params.warnings || [],
    pilotState: params.pilotState,
    operatorStatus: params.operatorStatus || 'ENGINEERING_REVIEW_PENDING',
    advisoryOnly: true, // Non-negotiable advisory-only safety constraint
  };
}
