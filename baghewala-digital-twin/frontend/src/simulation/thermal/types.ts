import type { SourceType } from '../../data/baghewala';

export type ThermalState = 'COOL' | 'BASELINE' | 'WARMING' | 'HOT' | 'HIGH_THERMAL_RESPONSE';

export type ThermalConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ThermalBreakdown {
  baselineReservoirTempC: number;
  ambientTempC: number;
  surfaceEquipmentTempC: number;
  steamTemperatureC: number;
  effectiveSteamDeltaC: number;
  steamEnergyFactor: number;
  maxSteamInfluenceC: number;
  timeResponsePercent: number;
  modeledThermalInfluenceC: number;
  predictedReservoirTempC: number;
}

export interface ThermalInputSources {
  baselineTemp: SourceType;
  ambientTemp: SourceType;
  steamRate: SourceType;
  steamQuality: SourceType;
  soakDuration: SourceType;
  thermalCoefficients: SourceType;
}

export interface ThermalResult {
  baselineReservoirTemperatureC: number;
  scenarioReservoirTemperatureC: number;
  predictedReservoirTemperatureC: number;
  ambientTemperatureC: number;
  surfaceEquipmentTemperatureC: number;
  steamTemperatureC: number;
  thermalInfluenceC: number;
  temperatureChangeC: number;
  thermalState: ThermalState;
  confidence: ThermalConfidence;
  modelType: string;
  assumptions: string[];
  warnings: string[];
  breakdown: ThermalBreakdown;
  inputSources: ThermalInputSources;
  calculatedAt: string;
}

export interface ThermalModelParams {
  steamGeneratorTempC: number;
  thermalResponseFactorK: number; // k_steam
  timeConstantTauDays: number;   // tau
  referenceSteamRateTpd: number;
  ambientSurfaceOffsetC: number;
  ambientReservoirCoupling: number;
  reservoirDepthM: number;
  minTempBoundC: number;
  maxTempBoundC: number;
}

export interface ThermalComparisonRow {
  parameter: string;
  unit: string;
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  sourceType: SourceType;
}
