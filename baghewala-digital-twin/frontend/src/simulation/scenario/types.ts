import type { SourceType } from '../../data/baghewala';

export type ScenarioStatus = 'DRAFT' | 'VALID' | 'INVALID' | 'READY_FOR_SIMULATION';

export interface ScenarioInputValues {
  ambientTemperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  reservoirTemperatureC: number;
  reservoirPressureBar: number;
  permeabilityDarcy: number;
  steamInjectionRateTpd: number;
  steamQualityPercent: number; // 0 to 100%
  steamInjectionTemperatureC: number;
  soakDurationDays: number;
  waterCutPercent: number; // 0 to 100%
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
}

export interface PressureModelResult {
  reservoirPressureBar: number;
  flowingPressureBar: number;
  drawdownBar: number;
  source: string;
}

export interface SimulationTrace {
  scenarioId: string;
  scenarioName: string;
  runId: string;
  inputs: ScenarioInputValues;
  derived: {
    predictedReservoirTemperatureC: number;
    estimatedViscosityCp: number;
    mobilityDcP: number;
    estimatedProductionBopd: number;
    totalFluidProductionBfpd: number;
    srpLoadIndex: number;
    riskScore: number;
    riskLevel: string;
  };
  calculatedAt: string;
}

export interface SimulationResult {
  thermal: import('../thermal').ThermalResult;
  viscosity: import('../viscosity').ViscosityResult;
  mobility: import('../mobility').MobilityResult;
  production: import('../production').ProductionResult;
  srp: import('../srpOptimization').OptimizationResult;
  css: import('../cssOptimization').CSSOptimizationResult;
  risk: import('../riskEngine').AIRiskResult;
  pressure: PressureModelResult;
  trace: SimulationTrace;
  inputs: ScenarioInputValues;
  calculatedAt: string;
}

export interface ScenarioInputMetadata {
  parameter: string;
  value: number;
  unit: string;
  sourceType: SourceType;
}

export interface ValidationErrorItem {
  field: keyof ScenarioInputValues | 'scenario';
  message: string;
  limitType: 'documentedEngineeringLimit' | 'softwareValidationLimit';
}

export interface ScenarioValidationResult {
  isValid: boolean;
  errors: ValidationErrorItem[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  fieldId: string;
  wellId: string;
  reservoirId: string;
  baseScenarioId: string;
  inputs: ScenarioInputValues;
  createdAt: string;
  updatedAt: string;
  status: ScenarioStatus;
  validation: ScenarioValidationResult;
  isPreset?: boolean;
}

export interface ParameterDelta {
  parameter: keyof ScenarioInputValues;
  label: string;
  unit: string;
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  hasChanged: boolean;
}

export interface LimitBoundary {
  min: number;
  max: number;
  unit: string;
  limitType: 'documentedEngineeringLimit' | 'softwareValidationLimit';
  description: string;
}

export type ScenarioLimits = Record<keyof ScenarioInputValues, LimitBoundary>;
