import type { SourceType } from '../../data/baghewala';

export type CSSPhase = 'INJECTION' | 'SOAK' | 'PRODUCTION';

export type CSSOperatingStatus = 'NORMAL' | 'CAUTION' | 'HIGH_THERMAL_LOAD' | 'OUT_OF_RANGE';

export interface CSSOptimizationInput {
  steamInjectionRateTpd: number;
  steamInjectionTemperatureC: number;
  steamQualityFraction: number; // 0.0 to 1.0
  injectionDurationDays: number;
  soakDurationDays: number;
  productionDurationDays: number;
  reservoirTemperatureC: number;
  reservoirPressureBar: number;
  baselineViscosityCp: number;
  baselineMobilityDPerCp: number;
  baselineProductionBopd: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
  cycleNumber?: number;
  steamVolumeTons?: number;
  thermalEfficiency?: number;
  heatLossFactor?: number;
  recoveryFactor?: number;
  activePhase?: CSSPhase;
}

export interface CSSThermalBreakdown {
  baselineReservoirTempC: number;
  steamVolumeTons: number;
  thermalGain: number;
  heatRetention: number;
  deltaTemperatureC: number;
  predictedCssTemperatureC: number;
  thermalEfficiency: number;
}

export interface CSSHeavyOilBreakdown {
  baselineViscosityCp: number;
  cssViscosityCp: number;
  viscosityReductionPercent: number;
  baselineMobilityDPerCp: number;
  cssMobilityDPerCp: number;
  mobilityIncreasePercent: number;
}

export interface CSSProductionBreakdown {
  baselineProductionBopd: number;
  cssProductionBopd: number;
  productionIncreaseBopd: number;
  productionIncreasePercent: number;
  cumulativeOilRecoveredTons: number;
}

export interface CSSCandidate {
  steamInjectionRateTpd: number;
  steamInjectionTemperatureC: number;
  steamQualityFraction: number;
  injectionDurationDays: number;
  soakDurationDays: number;
  productionDurationDays: number;
  steamVolumeTons: number;
  predictedCssTemperatureC: number;
  cssViscosityCp: number;
  cssMobilityDPerCp: number;
  cssProductionBopd: number;
  productionIncreaseBopd: number;
  productionIncreasePercent: number;
  cycleDurationDays: number;
  efficiencyScore: number;
  status: CSSOperatingStatus;
  isValid: boolean;
  activePhase: CSSPhase;
  penaltyMessage?: string;
}

export interface CSSOperatingWindow {
  minSteamRate: number;
  maxSteamRate: number;
  minInjectionDuration: number;
  maxInjectionDuration: number;
  minSoakDuration: number;
  maxSoakDuration: number;
  safeCandidatesCount: number;
  cautionCandidatesCount: number;
  highThermalCandidatesCount: number;
  totalCandidatesCount: number;
}

export interface HistoricalCSSComparison {
  historicalCycleNumber: number;
  historicalSteamVolumeTons: number;
  historicalSoakDays: number;
  historicalOilRecoveredTons: number;
  modeledSteamVolumeTons: number;
  modeledSoakDays: number;
  modeledOilRecoveredTons: number;
  volumeDeltaTons: number;
  oilDeltaTons: number;
}

export interface CSSOptimizationResult {
  currentCandidate: CSSCandidate;
  optimalCandidate: CSSCandidate;
  candidates: CSSCandidate[];
  operatingWindow: CSSOperatingWindow;
  thermalBreakdown: CSSThermalBreakdown;
  heavyOilBreakdown: CSSHeavyOilBreakdown;
  productionBreakdown: CSSProductionBreakdown;
  historicalComparison: HistoricalCSSComparison;
  status: CSSOperatingStatus;
  isOptimized: boolean;
  warnings: string[];
  assumptions: string[];
  disclaimers: string[];
  modelType: string;
  calculatedAt: string;
  inputSources: {
    steamRate: SourceType;
    steamQuality: SourceType;
    soakDuration: SourceType;
    injectionDuration: SourceType;
    thermalModel: SourceType;
    viscosityModel: SourceType;
    mobilityModel: SourceType;
    productionModel: SourceType;
  };
}

export interface CSSComparisonRow {
  parameter: string;
  unit: string;
  baselineValue: number;
  currentValue: number;
  optimizedValue: number;
  delta: number;
  percentChange: number;
  sourceType: SourceType;
}
