import type { ValueProvenance, DataQualityReport } from '../fieldDataIntegration/types';
import type { RiskLevel } from '../riskEngine/types';
import type { FinalValidationResult } from '../deploymentReadiness/types';
import type { IntegratedValidationState } from '../integratedValidation/types';
import type { OperationalReadinessState } from '../operationalReadiness/types';
import type { UnifiedCommandCenterState } from '../commandCenter/types';
import type { PilotWorkflowExecutionState, PilotReport } from '../productionPilot/types';
import type { UncertaintyResult } from '../uncertaintyAnalysis/types';

export type EvidenceStatus =
  | 'PASS'
  | 'PARTIAL'
  | 'WARNING'
  | 'FAIL'
  | 'NOT_AVAILABLE'
  | 'INSUFFICIENT_DATA';

export type UncertaintySupportLevel =
  | 'SUPPORTED_WITHIN_UNCERTAINTY'
  | 'PARTIALLY_SUPPORTED'
  | 'OUTSIDE_VALIDATED_RANGE'
  | 'INSUFFICIENT_DATA';

export type DeploymentEngineeringStatus =
  | 'DEMONSTRATION_SUPPORTED'
  | 'ENGINEERING_REVIEW_REQUIRED'
  | 'FIELD_VALIDATION_REQUIRED'
  | 'CONTROLLED_PILOT_REQUIRED'
  | 'NOT_SUPPORTED_FOR_DEPLOYMENT';

export type GapCategory =
  | 'FIELD_TELEMETRY'
  | 'DATA_QUALITY'
  | 'MODEL_VALIDATION'
  | 'CALIBRATION'
  | 'UNCERTAINTY'
  | 'OPERATIONAL_SAFETY'
  | 'TELEMETRY_INTEGRATION'
  | 'SCADA_INTEGRATION'
  | 'HUMAN_REVIEW'
  | 'CYBERSECURITY'
  | 'AUDITABILITY'
  | 'DOMAIN_VALIDATION'
  | 'EQUIPMENT_VALIDATION';

export interface AssessmentInput {
  pilotExecutionState?: PilotWorkflowExecutionState;
  pilotReport?: PilotReport;
  integratedValidationState?: IntegratedValidationState;
  operationalReadinessState?: OperationalReadinessState;
  deploymentReadinessState?: FinalValidationResult;
  commandCenterState?: UnifiedCommandCenterState;
  fieldDataReport?: DataQualityReport;
  uncertaintyResult?: UncertaintyResult;
  isRealTelemetryConnected?: boolean;
}

export interface AssessmentEvidence {
  evidenceId: string;
  sourceStep: string;
  sourceModule: string;
  metric: string;
  value: number | string;
  unit: string;
  status: EvidenceStatus;
  provenance: ValueProvenance;
  limitations: string[];
}

export interface PilotPerformanceMetric {
  key: string;
  label: string;
  observed?: number;
  predicted?: number;
  difference?: number;
  percentageError?: number;
  status: EvidenceStatus;
  provenance: ValueProvenance;
  unit: string;
  notes?: string;
}

export interface PilotPerformanceSummary {
  metrics: PilotPerformanceMetric[];
  productionPerformanceStatus: EvidenceStatus;
  thermalPerformanceStatus: EvidenceStatus;
  viscosityPerformanceStatus: EvidenceStatus;
  srpPerformanceStatus: EvidenceStatus;
  cssPerformanceStatus: EvidenceStatus;
  executionStabilityStatus: EvidenceStatus;
  kpiAchievementCount: number;
  totalKPICount: number;
  constraintViolationsCount: number;
  riskEventCount: number;
}

export interface ModelValidationSummary {
  baselineMae: number;
  calibratedMae: number;
  baselineRmse: number;
  calibratedRmse: number;
  baselineMape?: number;
  calibratedMape?: number;
  maxAbsoluteError: number;
  medianAbsoluteError: number;
  errorReductionPercent: number;
  sampleCount: number;
  status: EvidenceStatus;
  limitations: string[];
}

export interface UncertaintyAssessment {
  p10Bopd: number;
  p50Bopd: number;
  p90Bopd: number;
  meanBopd: number;
  stdDevBopd: number;
  intervalWidthBopd: number;
  supportLevel: UncertaintySupportLevel;
  summary: string;
  limitations: string[];
}

export interface OperationalAssessment {
  softwareReadinessStatus: EvidenceStatus;
  engineeringReviewStatus: EvidenceStatus;
  pilotValidationStatus: EvidenceStatus;
  telemetryReadinessStatus: EvidenceStatus;
  auditCompletenessStatus: EvidenceStatus;
  realFieldReadinessStatus: EvidenceStatus;
  humanReviewRequired: boolean;
  summary: string;
}

export interface RiskMetric {
  categoryId: string;
  categoryName: string;
  severity: RiskLevel;
  evidence: string;
  mitigation: string;
  isUnresolved: boolean;
  advisoryOnly: boolean;
}

export interface RiskAssessment {
  overallRiskLevel: RiskLevel;
  overallRiskScore: number;
  riskMetrics: RiskMetric[];
  activeWarningsCount: number;
  summary: string;
}

export interface GapItem {
  gapId: string;
  category: GapCategory;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiredAction: string;
}

export interface DeploymentAssessment {
  status: DeploymentEngineeringStatus;
  statusReason: string;
  supportingEvidenceIds: string[];
  missingEvidenceIds: string[];
  requiredHumanReview: string[];
  requiredNextValidationStage: string;
}

export interface AssessmentFinding {
  findingId: string;
  statement: string;
  status: EvidenceStatus;
  evidenceIds: string[];
  sourceSteps: string[];
  provenance: ValueProvenance;
  limitations: string[];
}

export interface FinalEngineeringAssessment {
  assessmentId: string;
  timestamp: string;
  executiveSummary: string;
  findings: AssessmentFinding[];
  pilotPerformance: PilotPerformanceSummary;
  modelValidation: ModelValidationSummary;
  uncertainty: UncertaintyAssessment;
  operational: OperationalAssessment;
  risk: RiskAssessment;
  gaps: GapItem[];
  deployment: DeploymentAssessment;
  evidenceRegistry: AssessmentEvidence[];
  limitations: string[];
  requiredFieldValidations: string[];
  mandatedDisclaimer: string;
  dataProvenanceLabel: string;
}

export interface AssessmentReport {
  reportId: string;
  generatedAt: string;
  title: string;
  sections: { title: string; content: string }[];
  finalStatus: DeploymentEngineeringStatus;
  disclaimer: string;
}
