import type { ValueProvenance } from '../fieldDataIntegration/types';
import type { RiskLevel } from '../riskEngine/types';
import type { AssessmentInput } from '../finalEngineeringAssessment/types';

export type TestVerificationStatus = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_RUN' | 'NOT_AVAILABLE';

export type FinalValidationEngineeringStatus =
  | 'DEMONSTRATION_VALIDATED'
  | 'ENGINEERING_REVIEW_REQUIRED'
  | 'FIELD_VALIDATION_REQUIRED'
  | 'CONTROLLED_PILOT_REQUIRED'
  | 'NOT_VALIDATED';

export type ReadinessCategoryStatus =
  | 'DEMONSTRATION_READY'
  | 'ENGINEERING_REVIEW'
  | 'FIELD_VALIDATION'
  | 'CONTROLLED_PILOT'
  | 'REAL_FIELD_DEPLOYMENT';

export interface SuiteVerificationItem {
  suiteId: string;
  stepReference: string;
  moduleName: string;
  testCount: number;
  passed: number;
  failed: number;
  status: TestVerificationStatus;
  buildStatus: 'PASS' | 'FAIL';
  limitations: string[];
}

export interface SystemVerificationSummary {
  suites: SuiteVerificationItem[];
  totalTestCount: number;
  totalPassedCount: number;
  totalFailedCount: number;
  overallBuildStatus: 'PASS' | 'FAIL';
  overallVerificationStatus: TestVerificationStatus;
}

export interface EvidenceItem {
  id: string;
  sourceStep: string;
  sourceModule: string;
  description: string;
  value: number | string;
  unit: string;
  provenance: ValueProvenance | 'NOT_AVAILABLE';
  status: 'PASS' | 'PARTIAL' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE';
  limitations: string[];
}

export interface PerformanceMetricItem {
  key: string;
  label: string;
  observed?: number;
  predicted?: number;
  difference?: number;
  percentageError?: number;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE';
  provenance: ValueProvenance | 'NOT_AVAILABLE';
  unit: string;
}

export interface ReadinessSummary {
  operationalReadiness: ReadinessCategoryStatus;
  deploymentReadiness: ReadinessCategoryStatus;
  finalEngineeringStatus: ReadinessCategoryStatus;
  summary: string;
  gaps: string[];
}

export interface PilotSummary {
  configurationName: string;
  telemetrySource: string;
  scenarioName: string;
  kpis: Record<string, string | number>;
  riskEventCount: number;
  constraintViolationsCount: number;
  auditEventCount: number;
  pilotExecutionMode: 'SIMULATED_PILOT' | 'REAL_FIELD_PILOT';
  disclaimer: string;
}

export interface DemoScenario {
  scenarioId: string;
  title: string;
  description: string;
  inputs: Record<string, number>;
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  productionBopd: number;
  srpLoadIndex: number;
  cssThermalGainC: number;
  riskLevel: RiskLevel;
  riskScore: number;
  p10Bopd: number;
  p50Bopd: number;
  p90Bopd: number;
  decisionSupportSummary: string;
}

export interface FinalValidationState {
  validationId: string;
  timestamp: string;
  executiveSummary: string;
  verification: SystemVerificationSummary;
  evidence: EvidenceItem[];
  performance: PerformanceMetricItem[];
  readiness: ReadinessSummary;
  pilot: PilotSummary;
  limitations: string[];
  demoScenarios: DemoScenario[];
  finalStatus: FinalValidationEngineeringStatus;
  statusReason: string;
  mandatedDisclaimer: string;
  dataProvenanceLabel: string;
}

export interface FinalReport {
  reportId: string;
  generatedAt: string;
  title: string;
  sections: { title: string; content: string }[];
  finalStatus: FinalValidationEngineeringStatus;
  disclaimer: string;
}

export interface FinalValidationInput extends AssessmentInput {}
