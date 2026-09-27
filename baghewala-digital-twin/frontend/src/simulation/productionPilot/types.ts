/**
 * Canonical Telemetry and Production Pilot Types
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 * NON-ACTUATING DECISION SUPPORT ONLY
 */

export type TelemetrySource = 'DEMONSTRATION_TELEMETRY' | 'SYNTHETIC_TELEMETRY';

export type TelemetryDataQuality = 'VALID' | 'WARNING' | 'INVALID';

export interface TelemetryRecord {
  timestamp: string;
  wellId: string;
  reservoirTemperatureC: number;
  reservoirPressureBar: number;
  steamInjectionRateTPD: number;
  steamQualityPct: number;
  waterCutPct: number;
  pumpingSpeedSPM: number;
  strokeLengthM: number;
  observedProductionBOPD: number;
  dataQuality?: TelemetryDataQuality;
  source?: TelemetrySource;
  latencyMs?: number;
}

export interface TelemetryValidationResult {
  status: TelemetryDataQuality;
  reasons: string[];
  diagnosticDetails: Record<string, string>;
  isValid: boolean;
}

export type PilotSimulatorProfile =
  | 'NORMAL'
  | 'PRODUCTION_DECLINE'
  | 'PRESSURE_DROP'
  | 'THERMAL_RESPONSE_FAILURE'
  | 'HIGH_WATER_CUT'
  | 'STEAM_RESPONSE'
  | 'SENSOR_ANOMALY';

export interface PredictedPilotState {
  predictedProductionBOPD: number;
  predictedTemperatureC: number;
  predictedPressureBar: number;
  predictedViscosityCp: number;
  predictedMobilityDcP: number;
  predictedWaterCutPct: number;
  totalFluidBfpd: number;
}

export interface ActualVsPredictedComparison {
  timestamp: string;
  wellId: string;
  predictedProductionBOPD: number;
  actualProductionBOPD: number;
  productionErrorBOPD: number;
  productionErrorPct: number;
  predictedTemperatureC: number;
  actualTemperatureC: number;
  temperatureDeviationC: number;
  predictedPressureBar: number;
  actualPressureBar: number;
  pressureDeviationBar: number;
  predictedWaterCutPct: number;
  actualWaterCutPct: number;
  waterCutDeviationPct: number;
  steamResponseDeviation: number;
}

export type DeviationSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type DeviationType =
  | 'PRODUCTION_DEVIATION'
  | 'PRESSURE_DEVIATION'
  | 'THERMAL_DEVIATION'
  | 'WATER_CUT_DEVIATION'
  | 'STEAM_RESPONSE_DEVIATION'
  | 'DATA_QUALITY_DEVIATION';

export interface DeviationAlert {
  id: string;
  timestamp: string;
  wellId: string;
  severity: DeviationSeverity;
  type: DeviationType;
  measuredValue: number;
  expectedValue: number;
  deviation: number;
  threshold: number;
  engineeringMessage: string;
}

export type PilotRiskLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';

export type PilotConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface PilotConfidenceEvaluation {
  level: PilotConfidenceLevel;
  score: number;
  supportingFactors: string[];
  riskWarnings: string[];
  isWithinOperatingEnvelope: boolean;
}

export interface PilotState {
  wellId: string;
  status: 'LIVE' | 'PAUSED' | 'STOPPED';
  currentProfile: PilotSimulatorProfile;
  lastTelemetry?: TelemetryRecord;
  lastValidation?: TelemetryValidationResult;
  lastPrediction?: PredictedPilotState;
  lastComparison?: ActualVsPredictedComparison;
  telemetryHistory: TelemetryRecord[];
  comparisonHistory: ActualVsPredictedComparison[];
  activeDeviations: DeviationAlert[];
  riskLevel: PilotRiskLevel;
  confidence: PilotConfidenceEvaluation;
  lastUpdated: string;
  stepCount: number;
}

export interface PilotDecisionTrace {
  traceId: string;
  timestamp: string;
  wellId: string;
  profile: PilotSimulatorProfile;
  inputTelemetry: TelemetryRecord;
  predictedProductionBOPD: number;
  actualProductionBOPD: number;
  productionErrorBOPD: number;
  productionErrorPct: number;
  riskLevel: PilotRiskLevel;
  confidenceLevel: PilotConfidenceLevel;
  activeDeviations: DeviationAlert[];
  engineeringInsight: string;
  disclaimer: string;
}

// Legacy Type Backwards Compatibility Definitions
export type PilotScenarioId =
  | 'SCENARIO_A_NORMAL'
  | 'SCENARIO_B_VISCOSITY_SPIKE'
  | 'SCENARIO_C_PRESSURE_DEPLETION'
  | 'SCENARIO_D_CSS_THERMAL_BOOST'
  | 'SCENARIO_E_HIGH_SRP_SPEED'
  | 'SCENARIO_F_ELEVATED_RISK'
  | string;

export interface PilotScenarioConfig {
  id: PilotScenarioId;
  name: string;
  code: string;
  description: string;
  provenanceTag: string;
  sourceType: string;
  isSimulatedWhatIf: boolean;
  overrides: Record<string, any>;
}

export interface PilotAuditEvent {
  eventId?: string;
  traceId?: string;
  stageNumber?: number;
  stageName?: string;
  inputProvenance?: string;
  inputSummary?: string;
  outputSummary?: string;
  moduleName?: string;
  status?: string;
  decisionAdvisory?: string;
  timestamp: string;
  type?: string;
  description?: string;
  actor?: string;
  metadata?: Record<string, any>;
}

export interface PilotKPIItem {
  key?: string;
  id?: string;
  label: string;
  value: number | string;
  formattedValue?: string;
  timestamp?: string;
  provenance?: string;
  warning?: string;
  sourceModule?: string;
  unit?: string;
  status?: string;
  trend?: string;
}

export interface PilotReport {
  reportId: string;
  generatedAt: string;
  title: string;
  workflowState: string;
  scenarioName: string;
  dataProvenance: string;
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

export interface PilotWorkflowExecutionState {
  workflowState: string;
  activeScenario: {
    id: string;
    name: string;
    provenanceTag: string;
    description?: string;
  };
  isRealTelemetryConnected: boolean;
  dataProvenanceLabel?: string;
  riskEvents?: any[];
  twinState: {
    reservoir: {
      reservoirTemperatureC: number;
      estimatedViscosityCp: number;
      reservoirPressureBar: number;
      oilMobilityDcP?: number;
    };
    production: {
      estimatedProductionBopd: number;
    };
    srp: {
      srpLoadIndex: number;
      vfdFrequencyHz: number;
      spm: number;
      strokeLengthMeters: number;
    };
    css: {
      steamInjectionRateTpd: number;
      thermalGainC: number;
    };
    risk: {
      riskLevel: string;
      riskScore: number;
    };
  };
  kpis: Record<string, any>;
  readinessGates: {
    deploymentReadinessLevel: string;
    modelReady?: boolean;
    validationReady?: boolean;
    simulationPilotReady?: boolean;
    auditReady?: boolean;
    realFieldPilotReady?: boolean;
    telemetryReady?: boolean;
  };
  auditTrail: any[];
  mandatedDisclaimer: string;
}

export interface ReplayEngineState {
  isPlaying: boolean;
  currentStep?: number;
  totalSteps?: number;
  speedMultiplier?: number;
  currentFrameIndex?: number;
  totalFrames?: number;
  replaySpeed?: number;
  currentTimestamp?: string;
}
