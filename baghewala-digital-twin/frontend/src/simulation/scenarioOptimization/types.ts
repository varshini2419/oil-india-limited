import type { ScenarioInputValues } from '../scenario/types';
import type { RiskLevel } from '../riskEngine/types';
import type { ModelMode } from '../historicalCalibration/types';

export type DecisionObjective =
  | 'MAXIMIZE_PRODUCTION'
  | 'MINIMIZE_OPERATING_RISK'
  | 'MAXIMIZE_EFFICIENCY'
  | 'BALANCED_OPERATION';

export type ScenarioStatus = 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'OUT_OF_RANGE';

export type ScenarioConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export type ParetoClassification = 'DOMINATED' | 'NON_DOMINATED';

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
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  estimatedProductionBopd: number;
  srpLoadIndex: number;
  cssPerformanceScore: number;
  riskLevel: RiskLevel;
  riskScore: number;
  status: ScenarioStatus;
  confidence: ScenarioConfidence;
  paretoClassification: ParetoClassification;
  isFeasible: boolean;
  constraintViolations: string[];
  constraintWarnings: string[];
  uncertainty: ScenarioEvaluationUncertainty;
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
  p10ProductionBopd: number;
  p50ProductionBopd: number;
  p90ProductionBopd: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthM: number;
  steamRateTpd: number;
  srpLoadIndex: number;
  cssEffectivenessScore: number;
  riskLevel: RiskLevel;
  confidence: ScenarioConfidence;
  constraintStatus: ScenarioStatus;
  paretoClassification: ParetoClassification;
  isRecommended: boolean;
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
  calculatedAt: string;
  disclaimer: string;
}

export interface ScenarioOptimizationInput {
  objective?: DecisionObjective;
  constraints?: Partial<DecisionConstraint>;
  modelMode?: ModelMode;
  customScenarios?: ScenarioCandidate[];
}
