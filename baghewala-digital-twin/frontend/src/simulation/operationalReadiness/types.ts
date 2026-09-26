import type { DataQualityReport } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { UncertaintyStatistics, ValidationResult, DecisionTrace } from '../integratedValidation/types';
import type { ScenarioCandidate } from '../scenarioOptimization/types';

export type ReadinessLevel =
  | 'DEMO_READY'
  | 'ENGINEERING_REVIEW_READY'
  | 'PILOT_VALIDATION_READY'
  | 'NOT_READY';

export type PipelineComponentStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE';

export type DataReadinessStatus = 'READY' | 'WARNING' | 'INSUFFICIENT_DATA' | 'INVALID';

export type ModelReadinessStatus = 'READY' | 'CALIBRATED' | 'UNCERTAIN' | 'NOT_AVAILABLE';

export type DecisionReadinessStatus = 'READY' | 'LIMITED' | 'UNAVAILABLE';

export interface PipelineHealthItem {
  componentId: string;
  componentName: string;
  stepReference: string;
  status: PipelineComponentStatus;
  evidence: string;
  limitation: string;
  provenance: string;
}

export interface PipelineHealthSummary {
  overallStatus: PipelineComponentStatus;
  passCount: number;
  warningCount: number;
  failCount: number;
  items: PipelineHealthItem[];
}

export interface DataReadinessEvaluation {
  status: DataReadinessStatus;
  qualityScore: number;
  recordCount: number;
  completenessPercent: number;
  missingMetricsCount: number;
  outlierCount: number;
  rangeViolationsCount: number;
  provenanceSummary: Record<string, number>;
  warnings: string[];
}

export interface ModelReadinessEvaluation {
  status: ModelReadinessStatus;
  baselineModelAvailable: boolean;
  calibratedModelAvailable: boolean;
  validationSampleCount: number;
  maeViscosityCp: number | null;
  maeProductionBopd: number | null;
  rmseProductionBopd: number | null;
  mapeProductionPercent: number | null;
  uncertaintyWidthBopd: number | null;
  warnings: string[];
}

export interface DecisionReadinessEvaluation {
  status: DecisionReadinessStatus;
  pipelineConnected: boolean;
  scenarioComparisonAvailable: boolean;
  productionEstimateAvailable: boolean;
  riskAdvisoryAvailable: boolean;
  uncertaintyRangeAvailable: boolean;
  decisionTraceAvailable: boolean;
  advisoryDisclaimer: string;
  warnings: string[];
}

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  stageNumber: number;
  stageName: string;
  inputSource: string;
  inputProvenance: string;
  modelUsed: string;
  outputSummary: Record<string, string | number>;
  warnings: string[];
  status: 'COMPLETED' | 'WARNING' | 'SKIPPED' | 'FAILED';
}

export interface AuditTrail {
  auditId: string;
  runTimestamp: string;
  events: AuditEvent[];
  overallStatus: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface DemonstrationResult {
  timestamp: string;
  telemetrySourceLabel: 'SIMULATED TELEMETRY' | 'REAL FIELD TELEMETRY' | 'HISTORICAL DATA';
  isSimulated: boolean;
  recordCount: number;
  twinState: DigitalTwinState;
  qualityReport: DataQualityReport;
  validationResult: ValidationResult;
  uncertaintyStats: UncertaintyStatistics;
  selectedScenario: ScenarioCandidate | null;
  decisionTrace: DecisionTrace;
  readinessLevel: ReadinessLevel;
  auditTrail: AuditTrail;
}

export interface OperationalReadinessState {
  timestamp: string;
  readinessLevel: ReadinessLevel;
  pipelineHealth: PipelineHealthSummary;
  dataReadiness: DataReadinessEvaluation;
  modelReadiness: ModelReadinessEvaluation;
  decisionReadiness: DecisionReadinessEvaluation;
  auditTrail: AuditTrail;
  lastDemoResult: DemonstrationResult | null;
  limitations: string[];
  disclaimer: string;
}
