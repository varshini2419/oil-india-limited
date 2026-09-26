import type { FieldDataSource } from '../fieldDataIntegration/types';
import type { ModelMode } from '../historicalCalibration/types';
import type { RiskLevel } from '../riskEngine/types';
import type { ReadinessLevel } from '../operationalReadiness/types';

export type SubsystemStatus = 'NORMAL' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL' | 'NOT_AVAILABLE';

export interface SubsystemStatusItem {
  subsystemId: string;
  subsystemName: string;
  metricName: string;
  value: string | number;
  status: SubsystemStatus;
  explanation: string;
  provenance: string;
  stepReference: string;
}

export interface CommandCenterAlert {
  alertId: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  sourceModule: string;
  metricName: string;
  message: string;
  recommendedAction: string;
}

export interface ReservoirSummary {
  temperatureC: number;
  pressureBar: number;
  drawdownBar: number;
  status: SubsystemStatus;
}

export interface ViscositySummary {
  viscosityCp: number;
  mobilityDcP: number;
  temperatureC: number;
  status: SubsystemStatus;
}

export interface ProductionSummary {
  currentBopd: number;
  expectedBopd: number;
  p10Bopd: number;
  p50Bopd: number;
  p90Bopd: number;
  trend: string;
  status: SubsystemStatus;
}

export interface SRPSummary {
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
  loadIndex: number;
  status: SubsystemStatus;
}

export interface CSSSummary {
  steamRateTpd: number;
  cycleStatus: string;
  thermalGainC: number;
  status: SubsystemStatus;
}

export interface RiskSummary {
  riskLevel: RiskLevel;
  riskScore: number;
  activeWarnings: string[];
  criticalConditions: string[];
  advisoryMessage: string;
  status: SubsystemStatus;
}

export interface UncertaintySummary {
  p10Bopd: number;
  p50Bopd: number;
  p90Bopd: number;
  intervalWidthBopd: number;
  confidence: string;
  status: SubsystemStatus;
}

export interface ScenarioSummary {
  selectedScenarioName: string;
  paretoClassification: string;
  expectedProductionBopd: number;
  riskLevel: RiskLevel;
  tradeOffs: string[];
  status: SubsystemStatus;
}

export interface DataQualitySummary {
  sourceType: FieldDataSource;
  sourceLabel: string;
  qualityScore: number;
  completenessPercent: number;
  outlierCount: number;
  missingValueCount: number;
  provenanceBreakdown: Record<string, number>;
  status: SubsystemStatus;
}

export interface ReadinessSummary {
  readinessLevel: ReadinessLevel;
  overallHealth: string;
  passCount: number;
  warningCount: number;
  failCount: number;
  disclaimer: string;
  status: SubsystemStatus;
}

export interface DecisionPipelineNode {
  stageNumber: number;
  stageName: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE';
  summary: string;
  routePath: string;
}

export interface SystemHealthSummary {
  physicsStatus: SubsystemStatus;
  backtestStatus: SubsystemStatus;
  calibrationStatus: SubsystemStatus;
  uncertaintyStatus: SubsystemStatus;
  optimizationStatus: SubsystemStatus;
  monitoringStatus: SubsystemStatus;
  fieldIngestionStatus: SubsystemStatus;
  integratedValidationStatus: SubsystemStatus;
  operationalReadinessStatus: SubsystemStatus;
  testCount: number;
  testStatus: 'PASS' | 'FAIL';
  buildStatus: 'PASS' | 'FAIL';
}

export interface UnifiedCommandCenterState {
  timestamp: string;
  modelMode: ModelMode;
  dataSourceType: FieldDataSource;
  dataSourceLabel: string;
  isSimulated: boolean;
  reservoir: ReservoirSummary;
  viscosity: ViscositySummary;
  production: ProductionSummary;
  srp: SRPSummary;
  css: CSSSummary;
  risk: RiskSummary;
  uncertainty: UncertaintySummary;
  scenario: ScenarioSummary;
  dataQuality: DataQualitySummary;
  readiness: ReadinessSummary;
  decisionPipeline: DecisionPipelineNode[];
  systemHealth: SystemHealthSummary;
  alerts: CommandCenterAlert[];
  statusItems: SubsystemStatusItem[];
  mandatoryDisclaimer: string;
}
