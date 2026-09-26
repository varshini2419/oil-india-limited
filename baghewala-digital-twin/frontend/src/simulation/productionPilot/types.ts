import type { FieldDataSource, ValueProvenance } from '../fieldDataIntegration/types';
import type { RiskLevel } from '../riskEngine/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { DeploymentReadinessLevel } from '../deploymentReadiness/types';

export type PilotWorkflowState =
  | 'IDLE'
  | 'DATA_RECEIVED'
  | 'DATA_VALIDATED'
  | 'SIMULATION_RUNNING'
  | 'ANALYSIS_COMPLETE'
  | 'RISK_REVIEW'
  | 'ENGINEERING_REVIEW'
  | 'PILOT_READY'
  | 'BLOCKED';

export type PilotScenarioId =
  | 'SCENARIO_A_NORMAL'
  | 'SCENARIO_B_VISCOSITY_SPIKE'
  | 'SCENARIO_C_PRESSURE_DROP'
  | 'SCENARIO_D_SRP_DEGRADATION'
  | 'SCENARIO_E_CSS_THERMAL_GAIN'
  | 'SCENARIO_F_COMBINED_ADVERSE'
  | 'SCENARIO_G_SENSOR_DEGRADATION'
  | 'SCENARIO_H_RECOVERY_INTERVENTION';

export interface PilotScenarioConfig {
  id: PilotScenarioId;
  name: string;
  code: string;
  description: string;
  provenanceTag: ValueProvenance;
  sourceType: FieldDataSource;
  isSimulatedWhatIf: boolean;
  overrides: {
    reservoirTemperatureC?: number;
    reservoirPressureBar?: number;
    steamRateTpd?: number;
    vfdFrequencyHz?: number;
    spm?: number;
    strokeLengthMeters?: number;
    soakDurationDays?: number;
    noiseLevel?: number;
    corruptSensor?: boolean;
  };
}

export interface ReplayEngineState {
  isPlaying: boolean;
  currentFrameIndex: number;
  totalFrames: number;
  replaySpeed: number; // 0.5x, 1x, 2x, 5x
  currentTimestamp: string;
}

export interface PilotKPIItem {
  key: string;
  label: string;
  value: number | string;
  formattedValue: string;
  unit: string;
  timestamp: string;
  provenance: ValueProvenance;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INFO' | 'NOT_AVAILABLE';
  warning?: string;
  sourceModule: string;
}

export interface PilotRiskEvent {
  eventId: string;
  inputCondition: string;
  detectedIssue: string;
  affectedParameter: string;
  riskLevel: RiskLevel;
  riskScore: number;
  supportingEvidence: string;
  uncertaintyWidthBopd: number;
  recommendedAction: string;
  sourceModule: string;
  advisoryOnly: boolean;
}

export interface PilotAuditEvent {
  eventId: string;
  timestamp: string;
  stageNumber: number;
  stageName: string;
  inputProvenance: ValueProvenance;
  moduleName: string;
  inputSummary: string;
  outputSummary: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'INFO';
  warning?: string;
  decisionAdvisory: string;
  traceId: string;
}

export interface PilotReadinessGates {
  dataReady: boolean;
  modelReady: boolean;
  telemetryReady: boolean;
  validationReady: boolean;
  safetyReady: boolean;
  auditReady: boolean;
  simulationPilotReady: boolean;
  realFieldPilotReady: boolean;
  deploymentReadinessLevel: DeploymentReadinessLevel;
  disclaimer: string;
}

export interface PilotWorkflowExecutionState {
  timestamp: string;
  workflowState: PilotWorkflowState;
  activeScenario: PilotScenarioConfig;
  replayState: ReplayEngineState;
  twinState: DigitalTwinState;
  kpis: Record<string, PilotKPIItem>;
  riskEvents: PilotRiskEvent[];
  auditTrail: PilotAuditEvent[];
  readinessGates: PilotReadinessGates;
  blockers: string[];
  warnings: string[];
  mandatedDisclaimer: string;
  isRealTelemetryConnected: boolean;
  dataProvenanceLabel: string;
}

export interface PilotReport {
  reportId: string;
  generatedAt: string;
  title: string;
  workflowState: PilotWorkflowState;
  scenarioName: string;
  dataProvenance: ValueProvenance;
  telemetryQualityScore: number;
  twinStateSummary: string;
  physicsResultsSummary: string;
  validationStatus: string;
  uncertaintyP50Bopd: number;
  riskRating: string;
  decisionTraceSummary: string;
  readinessLevel: string;
  auditEventCount: number;
  limitations: string[];
  requiredFieldInputs: string[];
  finalPilotStatus: string;
  disclaimer: string;
}
