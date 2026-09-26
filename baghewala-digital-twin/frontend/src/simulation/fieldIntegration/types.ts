import type { RiskLevel } from '../riskEngine/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ModelMode } from '../historicalCalibration/types';

export type TelemetryMode = 'SIMULATED' | 'REPLAY' | 'REAL_FIELD';

export type TelemetryConnectionStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'REPLAYING'
  | 'SIMULATING'
  | 'ERROR';

export type TelemetryProvenanceLabel =
  | 'SIMULATED TELEMETRY'
  | 'REPLAY TELEMETRY'
  | 'REAL FIELD TELEMETRY'
  | 'UNKNOWN TELEMETRY';

export type QualityGateStatus =
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_WARNING'
  | 'REJECTED';

export type TelemetryFreshness = 'LIVE' | 'STALE' | 'OFFLINE';

export interface NormalizedFieldTelemetryRecord {
  recordId: string;
  timestamp: string;
  wellId: string;
  mode: TelemetryMode;
  provenanceLabel: TelemetryProvenanceLabel;
  temperatureC: number | null;
  pressureBar: number | null;
  productionBopd: number | null;
  viscosityCp: number | null;
  mobilityDcP: number | null;
  vfdFrequencyHz: number | null;
  spm: number | null;
  strokeLengthMeters: number | null;
  steamRateTpd: number | null;
  steamQuality: number | null;
  waterCutPercent: number | null;
  motorLoadPercent: number | null;
  rawInput?: Record<string, unknown>;
  missingFields: string[];
  warnings: string[];
}

export interface QualityGateResult {
  status: QualityGateStatus;
  qualityScore: number; // 0 to 100
  freshness: TelemetryFreshness;
  ageSeconds: number;
  schemaValid: boolean;
  timestampValid: boolean;
  unitValid: boolean;
  completenessPercent: number;
  missingFields: string[];
  rangeViolations: string[];
  outliers: string[];
  rejectionReasons: string[];
  warnings: string[];
}

export type PilotGateStatus =
  | 'NOT_CONNECTED'
  | 'DATA_NOT_READY'
  | 'ENGINEERING_REVIEW_REQUIRED'
  | 'PILOT_READY'
  | 'PILOT_ACTIVE'
  | 'PILOT_PAUSED'
  | 'PILOT_COMPLETE';

export interface PilotGateConditions {
  telemetryConnected: boolean;
  acceptableQuality: boolean;
  modelReady: boolean;
  uncertaintyAvailable: boolean;
  riskEngineAvailable: boolean;
  advisoryOnlyConfirmed: boolean;
  auditLoggingActive: boolean;
  operatorApproved: boolean;
}

export interface PilotGateEvaluation {
  status: PilotGateStatus;
  conditions: PilotGateConditions;
  blockingIssues: string[];
  warnings: string[];
  mandatedDisclaimer: string;
}

export interface IntegrationAuditEvent {
  eventId: string;
  timestamp: string;
  source: TelemetryMode;
  wellId: string;
  inputQuality: QualityGateStatus;
  validationResult: string;
  modelMode: ModelMode;
  modelVersion: string;
  outputSummary: string;
  warnings: string[];
  pilotState: PilotGateStatus;
  operatorStatus: string;
  advisoryOnly: boolean;
}

export interface FieldIntegrationTelemetryHealth {
  lastReceivedAt: string | null;
  freshness: TelemetryFreshness;
  ageSeconds: number;
  completenessPercent: number;
  missingMetrics: string[];
  acceptedCount: number;
  warningCount: number;
  rejectedCount: number;
}

export interface FieldIntegrationState {
  timestamp: string;
  mode: TelemetryMode;
  connectionStatus: TelemetryConnectionStatus;
  provenanceLabel: TelemetryProvenanceLabel;
  latestTelemetry: NormalizedFieldTelemetryRecord | null;
  telemetryHistory: NormalizedFieldTelemetryRecord[];
  telemetryHealth: FieldIntegrationTelemetryHealth;
  qualityResult: QualityGateResult;
  twinState: DigitalTwinState | null;
  modelStatus: {
    baselineAvailable: boolean;
    calibratedAvailable: boolean;
    uncertaintyAvailable: boolean;
    riskEngineAvailable: boolean;
    modelMode: ModelMode;
  };
  pilotGate: PilotGateEvaluation;
  advisorySummary: {
    recommendations: string[];
    riskLevel: RiskLevel;
    riskScore: number;
    disclaimer: string;
    advisoryOnly: boolean;
  };
  auditTrail: IntegrationAuditEvent[];
  limitations: string[];
  mandatedDisclaimer: string;
}

export interface IntegrationReport {
  reportId: string;
  generatedAt: string;
  title: string;
  mode: TelemetryMode;
  connectionStatus: TelemetryConnectionStatus;
  provenanceLabel: TelemetryProvenanceLabel;
  dataQualityScore: number;
  freshness: TelemetryFreshness;
  pilotStatus: PilotGateStatus;
  twinStateSummary: string;
  advisorySummary: string;
  auditEventCount: number;
  limitations: string[];
  disclaimer: string;
}

export interface FieldIntegrationOptions {
  mode?: TelemetryMode;
  realFieldConnected?: boolean;
  realFieldConfig?: {
    endpointUrl?: string;
    apiKey?: string;
  };
  modelMode?: ModelMode;
  customTelemetryInput?: Record<string, unknown>;
  operatorApproved?: boolean;
  forcePilotPause?: boolean;
  nowIso?: string;
}
