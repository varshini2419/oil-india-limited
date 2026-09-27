import type { SourceType } from '../../data/baghewala';
import type { ScenarioInputValues } from '../scenario/types';
import type { ThermalResult } from '../thermal/types';
import type { ViscosityResult } from '../viscosity/types';
import type { MobilityResult } from '../mobility/types';
import type { ProductionResult } from '../production/types';
import type { OptimizationResult as SRPOptimizationResult } from '../srpOptimization/types';
import type { CSSOptimizationResult } from '../cssOptimization/types';
import type { AIRiskResult } from '../riskEngine/types';

export type HistoricalDataProvenance = 'MEASURED_FIELD_DATA' | 'DEMONSTRATION_DATA' | 'SYNTHETIC_DATA';

export type ValidationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type DataAvailability = 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT_DATA';

export interface HistoricalObservation {
  id: string;
  date: string;
  wellId: string;
  reservoirTemperatureC: number;
  reservoirPressureBar: number;
  steamInjectionRateTpd: number;
  steamQualityPercent: number;
  waterCutPercent: number;
  spm: number;
  strokeLengthMeters: number;
  permeabilityDarcy: number;
  observedProductionBopd: number;
  observedViscosityCp?: number;
  observedTemperatureC?: number;
  source: HistoricalDataProvenance;
  notes?: string;
  name?: string;
  dateOrYear?: string | number;
  parameter?: string;
  observedValue?: number | null;
  unit?: string;
  sourceId?: string;
  sourceType?: SourceType;
  confidence?: ValidationConfidence;
}

export type ValidationStatus =
  | 'VALIDATED'
  | 'LIMITED_DATA'
  | 'OUTSIDE_HISTORICAL_RANGE'
  | 'PARTIALLY_VALIDATED'
  | 'INSUFFICIENT_DATA'
  | 'OUTSIDE_MODEL_RANGE'
  | 'INVALID';

export type EngineeringConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface HistoricalMatchResult {
  record: HistoricalObservation;
  distance: number;
  matchQualityPercent: number;
  parameterDeviations: Record<string, number>;
}

export interface HistoricalModelOutput {
  historicalCaseId: string;
  scenarioInputs: ScenarioInputValues;
  thermalResult: ThermalResult;
  viscosityResult: ViscosityResult;
  mobilityResult: MobilityResult;
  productionResult: ProductionResult;
  srpResult: SRPOptimizationResult;
  cssResult: CSSOptimizationResult;
  riskResult: AIRiskResult;
}

export interface HistoricalComparison {
  parameter: string;
  historicalValue: number | null;
  modeledValue: number | null;
  absoluteError: number | null;
  percentageError: number | null;
  unit: string;
  availability: DataAvailability;
  status: ValidationStatus;
  sourceType: SourceType;
  interpretation: string;
}

export interface BacktestCase {
  id: string;
  name: string;
  description: string;
  yearOrDate: string;
  availability: DataAvailability;
  observations: HistoricalObservation[];
  inputs: ScenarioInputValues;
  outputs?: HistoricalModelOutput;
  comparisons?: HistoricalComparison[];
}

export interface BacktestSummary {
  totalCases: number;
  completeCases: number;
  partialCases: number;
  insufficientDataCases: number;
  mae?: number;
  mape?: number;
  rmse?: number;
}

export interface HistoricalValidationResult {
  matchedRecords: HistoricalMatchResult[];
  topMatch?: HistoricalMatchResult;
  predictedProductionBopd: number;
  observedProductionBopd: number;
  absoluteErrorBopd: number;
  absolutePercentageError: number;
  mae: number;
  mape: number;
  rmse: number;
  bias: number;
  validationStatus: ValidationStatus;
  confidenceBand: EngineeringConfidenceLevel;
  uncertaintySources: string[];
  dataProvenanceLabel: string;
  disclaimer: string;
  calculatedAt: string;
  cases?: BacktestCase[];
  summary?: BacktestSummary;
}

export interface ConfidenceEvaluation {
  level: EngineeringConfidenceLevel;
  score: number;
  positiveReasons: string[];
  warningReasons: string[];
  isWithinOperatingEnvelope: boolean;
  historicalDistance: number;
}
