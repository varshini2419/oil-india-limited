import type { FieldDataSource, ValueProvenance } from '../fieldDataIntegration/types';
import type { ModelMode } from '../historicalCalibration/types';

export type DeploymentReadinessLevel =
  | 'DEMO_READY'
  | 'ENGINEERING_REVIEW_READY'
  | 'PILOT_VALIDATION_READY'
  | 'NOT_READY';

export type DeploymentGateStatus = 'PASS' | 'WARNING' | 'BLOCKED' | 'NOT_AVAILABLE';

export type DeploymentGateSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DeploymentGate {
  gateId: string;
  category: string;
  name: string;
  status: DeploymentGateStatus;
  severity: DeploymentGateSeverity;
  evidence: string;
  limitation: string;
  requiredAction: string;
}

export type TelemetryConnectionStatus = 'DISCONNECTED' | 'SIMULATED' | 'TEST_FEED' | 'REAL_FIELD_FEED';

export interface TelemetryConnectionInfo {
  status: TelemetryConnectionStatus;
  connectionLabel: string;
  lastTimestamp: string;
  recordCount: number;
  latencySeconds: number;
  schemaValid: boolean;
  unitStatus: string;
  provenance: ValueProvenance;
  isSimulated: boolean;
}

export type DataAcceptanceStatus = 'ACCEPT' | 'ACCEPT_WITH_WARNINGS' | 'REJECT' | 'INSUFFICIENT_DATA';

export interface DataAcceptanceResult {
  status: DataAcceptanceStatus;
  completenessPercent: number;
  validTimestampCount: number;
  missingValueCount: number;
  outlierCount: number;
  physicalBoundViolations: number;
  sensorCoverageScore: number;
  provenance: ValueProvenance;
  summary: string;
  warnings: string[];
}

export type ModelAcceptanceStatus = 'ACCEPTED' | 'ACCEPTED_WITH_LIMITATIONS' | 'REJECTED' | 'THRESHOLD_NOT_DEFINED';

export interface ModelAcceptanceResult {
  status: ModelAcceptanceStatus;
  historicalSampleCount: number;
  baselineModelAvailable: boolean;
  calibratedModelAvailable: boolean;
  modelMode: ModelMode;
  errorMetricMae: number;
  uncertaintyWidthBopd: number;
  outOfRangeCondition: boolean;
  summary: string;
  limitations: string[];
}

export interface SafetyGovernanceResult {
  advisoryOnlyEnforced: boolean;
  automaticActuationBlocked: boolean;
  operatorApprovalRequired: boolean;
  auditTrailActive: boolean;
  provenanceVisibilityConfirmed: boolean;
  simulatedDataLabeled: boolean;
  fieldDataDistinctionClear: boolean;
  mandatedDisclaimer: string;
  safetyScore: number; // 0 - 100
  summary: string;
  violations: string[];
}

export interface FieldPilotChecklist {
  telemetryConnection: boolean;
  dataQuality: boolean;
  timestampSynchronization: boolean;
  unitConsistency: boolean;
  sensorCoverage: boolean;
  historicalValidation: boolean;
  calibration: boolean;
  uncertainty: boolean;
  scenarioValidation: boolean;
  riskAdvisory: boolean;
  operatorReview: boolean;
  safetyReview: boolean;
  auditLogging: boolean;
  totalPassed: number;
  totalChecks: number;
  completionPercentage: number;
}

export interface DeploymentAuditEvent {
  eventId: string;
  timestamp: string;
  stage: string;
  inputProvenance: ValueProvenance;
  component: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'INFO';
  summary: string;
  warnings: string[];
  limitations: string[];
}

export interface FinalValidationInput {
  sourceType?: FieldDataSource;
  modelMode?: ModelMode;
  telemetryStatus?: TelemetryConnectionStatus;
  reservoirTemperatureC?: number;
  steamInjectionRateTpd?: number;
  vfdFrequencyHz?: number;
  spm?: number;
  strokeLengthMeters?: number;
  soakDurationDays?: number;
  bypassSafetyChecks?: boolean;
}

export interface FinalValidationResult {
  timestamp: string;
  readinessLevel: DeploymentReadinessLevel;
  deploymentGates: DeploymentGate[];
  fieldPilotChecklist: FieldPilotChecklist;
  telemetryConnection: TelemetryConnectionInfo;
  dataAcceptance: DataAcceptanceResult;
  modelAcceptance: ModelAcceptanceResult;
  safetyGovernance: SafetyGovernanceResult;
  auditTrail: DeploymentAuditEvent[];
  blockers: string[];
  warnings: string[];
  requiredActions: string[];
  provenance: ValueProvenance;
  disclaimer: string;
  fieldCertified: boolean;
}
