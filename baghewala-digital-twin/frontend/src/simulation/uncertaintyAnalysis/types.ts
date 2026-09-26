import type { SourceType } from '../../data/baghewala';
import type { RiskLevel } from '../riskEngine/types';

export type UncertaintyType = 'PERCENTAGE' | 'ABSOLUTE_RANGE' | 'UNIFORM_BOUNDED';

export type UncertaintyStatus = 'VALID' | 'WARNING' | 'INVALID';

export type UncertaintyConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface UncertaintyParameter {
  id: string;
  name: string;
  unit: string;
  baselineValue: number;
  minAllowed: number;
  maxAllowed: number;
  uncertaintyType: UncertaintyType;
  uncertaintyValue: number; // e.g., ±15% or ±range
  sourceType: SourceType | 'calibrated';
  sourceId: string;
  isCalibrated: boolean;
  provenanceLabel: string;
  description: string;
  category: 'reservoir' | 'fluid' | 'thermal' | 'production' | 'srp' | 'css';
}

export interface UncertaintyConfiguration {
  sampleCount: number; // default 500
  seed: number; // default 42
  parameters: UncertaintyParameter[];
  minImprovementThresholdPercent?: number;
}

export interface SampledScenarioInputs {
  reservoirPermeabilityD: number;
  reservoirTemperatureC: number;
  crudeViscosityInputCp: number;
  steamInjectionRateTpd: number;
  steamInjectionTemperatureC: number;
  steamEffectivenessFactor: number;
  thermalGainCoefficient: number;
  effectiveDrawdownBar: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
  productivityMobilityCoefficient: number;
}

export interface UncertaintySample {
  sampleIndex: number;
  inputs: SampledScenarioInputs;
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  productionBopd: number;
  srpLoadIndex: number;
  cssPerformanceScore: number;
  riskLevel: RiskLevel;
  riskScore: number;
}

export interface OutputStatistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface ProductionStatistics extends OutputStatistics {
  probLessThanOneBopd: number; // Percentage probability q < 1 BOPD
  probGreaterThanBaseline: number; // Percentage probability q > baseline
  baselineProductionBopd: number;
}

export interface SensitivityStep {
  perturbationPercent: number; // -20, -10, 0, +10, +20
  parameterValue: number;
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  productionBopd: number;
  srpLoadIndex: number;
  riskScore: number;
}

export interface SensitivityResult {
  parameterId: string;
  parameterName: string;
  steps: SensitivityStep[];
  maxOutputDelta: number;
  normalizedSensitivity: number; // 0 to 1
  rank: number;
  provenanceLabel: string;
}

export interface TornadoEntry {
  parameterId: string;
  parameterName: string;
  baselineOutput: number;
  lowValueOutput: number;
  highValueOutput: number;
  negativeEffect: number; // delta when parameter is low
  positiveEffect: number; // delta when parameter is high
  totalRange: number;
  normalizedSensitivity: number;
}

export interface CorrelationResult {
  inputParameterId: string;
  inputParameterName: string;
  outputMetricName: string;
  correlationCoefficient: number; // -1.0 to +1.0
  interpretation: string;
}

export interface UncertaintyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UncertaintyResult {
  config: UncertaintyConfiguration;
  samples: UncertaintySample[];
  temperatureStats: OutputStatistics;
  viscosityStats: OutputStatistics;
  mobilityStats: OutputStatistics;
  productionStats: ProductionStatistics;
  srpLoadStats: OutputStatistics;
  riskScoreStats: OutputStatistics;
  sensitivityResults: SensitivityResult[];
  tornadoEntries: TornadoEntry[];
  correlations: CorrelationResult[];
  validation: UncertaintyValidationResult;
  calculatedAt: string;
  disclaimer: string;
}
