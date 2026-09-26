import type { FieldDataSource, ValueProvenance, DataQualityReport, NormalizedTelemetryRecord } from '../fieldDataIntegration/types';
import type { ModelMode } from '../historicalCalibration/types';
import type { ScenarioConfidence } from '../scenarioOptimization/types';
import type { RiskLevel } from '../riskEngine/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ScenarioCandidate } from '../scenarioOptimization/types';

export interface UncertaintyStatistics {
  p10Bopd: number;
  p50Bopd: number;
  p90Bopd: number;
  meanBopd: number;
  stdDevBopd: number;
  sampleCount: number;
}

export type IntegratedValidationStatus =
  | 'VALIDATED'
  | 'PARTIALLY_VALIDATED'
  | 'INSUFFICIENT_DATA'
  | 'OUTSIDE_MODEL_RANGE';

export type ComparisonMetricStatus =
  | 'MATCH'
  | 'DEVIATION'
  | 'OUT_OF_BOUNDS'
  | 'NOT_AVAILABLE';

export interface MetricComparison {
  metricKey: string;
  metricLabel: string;
  observedValue?: number;
  predictedBaselineValue?: number;
  predictedCalibratedValue?: number;
  absoluteError?: number;
  relativeError?: number; // 0.0 to 1.0
  percentageError?: number; // 0% to 100%+
  unit: string;
  provenance: ValueProvenance;
  status: ComparisonMetricStatus;
  warning?: string;
}

export interface ModelPerformanceSummary {
  metricKey: string;
  metricLabel: string;
  maeBaseline: number;
  maeCalibrated: number;
  rmseBaseline: number;
  rmseCalibrated: number;
  mapeBaseline?: number; // undefined if mathematically invalid
  mapeCalibrated?: number; // undefined if mathematically invalid
  maxAbsoluteError: number;
  medianAbsoluteError: number;
  sampleCount: number;
  validObservationCount: number;
  errorReductionPercent: number;
  insufficientData: boolean;
  notes: string[];
}

export interface ValidationResult {
  overallStatus: IntegratedValidationStatus;
  dataCoveragePercent: number;
  qualityScore: number;
  performanceSummary: ModelPerformanceSummary[];
  metricComparisons: MetricComparison[];
  limitations: string[];
  warnings: string[];
}

export interface ConfidenceResult {
  confidence: ScenarioConfidence; // 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA'
  confidenceScore: number; // 0 to 100
  factors: {
    dataQualityScore: number;
    dataCoveragePercent: number;
    calibrationAvailable: boolean;
    uncertaintyWidthBopd: number;
    validationSampleCount: number;
    provenanceRating: string;
  };
  explanation: string;
}

export interface DecisionTraceStage {
  stageNumber: number;
  stageName: string;
  status: 'COMPLETED' | 'WARNING' | 'SKIPPED' | 'FAILED';
  description: string;
  inputsSummary: Record<string, string | number>;
  outputsSummary: Record<string, string | number>;
  timestamp: string;
  warnings: string[];
  provenance: string;
}

export interface DecisionTrace {
  traceId: string;
  generatedAt: string;
  stages: DecisionTraceStage[];
  overallTraceStatus: 'COMPLETE' | 'INCOMPLETE' | 'FAILED';
}

export interface IntegratedDecision {
  selectedScenario: ScenarioCandidate | null;
  scenarioMetrics: {
    baselineProductionBopd: number;
    optimizedProductionBopd: number;
    productionGainPercent: number;
    srpLoadIndexPercent: number;
    cssThermalGainC: number;
  };
  riskSummary: {
    riskLevel: RiskLevel;
    riskScore: number;
    criticalIssuesCount: number;
  };
  uncertaintySummary: {
    p10ProductionBopd: number;
    p50ProductionBopd: number;
    p90ProductionBopd: number;
    uncertaintyWidthBopd: number;
    uncertaintyRating: 'NARROW' | 'MODERATE' | 'WIDE';
  };
  confidence: ConfidenceResult;
  decisionReasons: string[];
  tradeoffs: string[];
  constraints: string[];
  limitations: string[];
  advisoryDisclaimer: string;
}

export interface ValidationInput {
  fieldRecords?: NormalizedTelemetryRecord[];
  rawPayload?: string;
  sourceType?: FieldDataSource;
  modelMode?: ModelMode;
  reservoirTemperatureC?: number;
  steamInjectionRateTpd?: number;
  vfdFrequencyHz?: number;
  spm?: number;
  strokeLengthMeters?: number;
  soakDurationDays?: number;
  effectiveDrawdownBar?: number;
  uncertaintySampleCount?: number;
}

export interface IntegratedReport {
  reportId: string;
  generatedAt: string;
  title: string;
  executiveSummary: string;
  currentTwinState: DigitalTwinState;
  dataQualityReport: DataQualityReport;
  modelMode: ModelMode;
  calibrationStatus: string;
  validationMetrics: MetricComparison[];
  performanceSummaries: ModelPerformanceSummary[];
  uncertaintyStats: UncertaintyStatistics;
  candidateScenarios: ScenarioCandidate[];
  riskSummary: {
    riskLevel: RiskLevel;
    riskScore: number;
    detectedIssues: string[];
  };
  decisionTrace: DecisionTrace;
  integratedDecision: IntegratedDecision;
  assumptions: string[];
  limitations: string[];
  provenanceMap: Record<string, string>;
  advisoryNotice: string;
}

export interface IntegratedValidationState {
  timestamp: string;
  input: ValidationInput;
  qualityReport: DataQualityReport;
  normalizedRecords: NormalizedTelemetryRecord[];
  currentTwinState: DigitalTwinState;
  baselineTwinState: DigitalTwinState;
  validationResult: ValidationResult;
  confidenceResult: ConfidenceResult;
  uncertaintyStats: UncertaintyStatistics;
  scenarioCandidates: ScenarioCandidate[];
  decisionTrace: DecisionTrace;
  integratedDecision: IntegratedDecision;
  report: IntegratedReport;
}
