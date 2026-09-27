import type { ScenarioInputValues } from '../scenario/types';
import type { RiskLevel } from '../riskEngine/types';
import type { ModelMode } from '../historicalCalibration/types';

export type DecisionObjective =
  | 'MAXIMIZE_PRODUCTION'
  | 'MINIMIZE_STEAM'
  | 'MINIMIZE_WATER_CUT'
  | 'MINIMIZE_OPERATING_RISK'
  | 'MAXIMIZE_EFFICIENCY'
  | 'TARGET_PRODUCTION'
  | 'BALANCED_OPERATION';

export type ScenarioStatus = 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'OUT_OF_RANGE';

export type ScenarioConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export type ParetoClassification = 'DOMINATED' | 'NON_DOMINATED';

export type FeasibilityStatus = 'FEASIBLE' | 'INVALID';

export type ScenarioType =
  | 'BASELINE'
  | 'CSS_FOCUSED'
  | 'SRP_FOCUSED'
  | 'COMBINED_OPTIMIZATION'
  | 'CONSERVATIVE_LOW_RISK'
  | 'THERMAL_RECOVERY'
  | 'CUSTOM';

export interface DecisionConstraint {
  maxVfdHz: number; // e.g. 60 Hz
  maxSpm: number; // e.g. 12 SPM
  maxStrokeM: number; // e.g. 3.5 m
  maxSteamRateTpd: number; // e.g. 150 TPD
  maxLoadIndex: number; // e.g. 85.0
  minProductionBopd: number; // e.g. 0.5 BOPD
  maxViscosityCp: number; // e.g. 20000 cP
  minTemperatureC: number; // e.g. 40 °C
  maxRiskLevel: RiskLevel; // e.g. HIGH or MODERATE
  targetProductionBopd?: number;
}

export interface ScenarioCandidate {
  id: string;
  name: string;
  description: string;
  scenarioType: ScenarioType;
  inputs: ScenarioInputValues;
  modelMode: ModelMode;
  isCustom?: boolean;
}

export interface ScenarioEvaluationUncertainty {
  meanProductionBopd: number;
  p10ProductionBopd: number;
  p50ProductionBopd: number;
  p90ProductionBopd: number;
  stdDevProductionBopd: number;
  probGreaterThanBaseline: number;
  probLessThanOneBopd: number;
}

export interface ScenarioEvaluation {
  candidate: ScenarioCandidate;
  scenarioId: string;
  name: string;
  inputs: ScenarioInputValues;
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  estimatedProductionBopd: number;
  totalFluidProductionBfpd: number;
  srpLoadIndex: number;
  cssPerformanceScore: number;
  riskLevel: RiskLevel;
  riskScore: number;
  status: ScenarioStatus;
  confidence: ScenarioConfidence;
  paretoClassification: ParetoClassification;
  isFeasible: boolean;
  feasibility: FeasibilityStatus;
  feasibilityReasons: string[];
  constraintViolations: string[];
  constraintWarnings: string[];
  uncertainty: ScenarioEvaluationUncertainty;
  uncertaintyLabel?: string;
  historicalError?: number;
  historicalValidationScore?: number;
  uncertaintyRangeBopd?: number;
  confidenceLevel?: string;
  inputSources: Record<string, string>;
}

export interface ScenarioComparisonRow {
  scenarioId: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  estimatedProductionBopd: number;
  totalFluidProductionBfpd: number;
  p10ProductionBopd: number;
  p50ProductionBopd: number;
  p90ProductionBopd: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthM: number;
  steamRateTpd: number;
  waterCutPercent: number;
  srpLoadIndex: number;
  cssEffectivenessScore: number;
  riskLevel: RiskLevel;
  confidence: ScenarioConfidence;
  constraintStatus: ScenarioStatus;
  paretoClassification: ParetoClassification;
  feasibility: FeasibilityStatus;
  isRecommended: boolean;
  historicalError?: number;
  uncertaintyRangeBopd?: number;
  confidenceLevel?: string;
}

export interface ScenarioRecommendation {
  selectedScenarioId: string;
  selectedScenarioName: string;
  objective: DecisionObjective;
  reasons: string[];
  confidence: ScenarioConfidence;
  warnings: string[];
  limitations: string[];
  tradeOffAnalysisText: string;
}

export interface PredictionResult {
  currentInputs: ScenarioInputValues;
  futureInputs: ScenarioInputValues;
  currentProductionBopd: number;
  predictedProductionBopd: number;
  bopdDelta: number;
  bopdPercentChange: number;
  currentViscosityCp: number;
  predictedViscosityCp: number;
  viscosityDeltaCp: number;
  viscosityPercentChange: number;
  currentTemperatureC: number;
  predictedTemperatureC: number;
  temperatureDeltaC: number;
  currentFluidBfpd: number;
  predictedFluidBfpd: number;
  uncertaintyNotice: string;
  calculatedAt: string;
}

export interface EngineeringDecisionTrace {
  traceId: string;
  timestamp: string;
  objective: DecisionObjective;
  constraintsDescription: string;
  candidateScenariosCount: number;
  feasibleScenariosCount: number;
  selectedScenarioId: string;
  selectedScenarioName: string;
  baselineProductionBopd: number;
  selectedProductionBopd: number;
  productionDeltaBopd: number;
  productionPercentChange: number;
  steamDeltaTpd: number;
  riskChangeText: string;
  historicalValidationErrorPercent: number;
  uncertaintyRange?: number;
  confidenceLevel?: string;
  disclaimer: string;
}

export interface ScenarioOptimizationResult {
  objective: DecisionObjective;
  constraints: DecisionConstraint;
  modelMode: ModelMode;
  evaluatedCandidatesCount: number;
  feasibleScenariosCount: number;
  nonDominatedScenariosCount: number;
  evaluations: ScenarioEvaluation[];
  comparisonRows: ScenarioComparisonRow[];
  recommendation: ScenarioRecommendation;
  trace?: EngineeringDecisionTrace;
  calculatedAt: string;
  disclaimer: string;
}

export interface ScenarioOptimizationInput {
  objective?: DecisionObjective;
  constraints?: Partial<DecisionConstraint>;
  modelMode?: ModelMode;
  customScenarios?: ScenarioCandidate[];
}
