import type { RiskLevel } from '../riskEngine/types';
import type { ModelMode } from '../historicalCalibration/types';
import type { ScenarioConfidence } from '../scenarioOptimization/types';

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type ProductionTrend = 'STABLE' | 'INCREASING' | 'DECREASING';
export type SRPOperatingStatus = 'NORMAL' | 'HIGH_LOAD' | 'CAUTION' | 'OFFLINE';
export type CSSSoakStatus = 'IDLE' | 'INJECTING' | 'SOAKING' | 'PRODUCING';
export type TelemetrySimulatorState = 'STOPPED' | 'RUNNING' | 'PAUSED';

export interface ReservoirState {
  reservoirTemperatureC: number;
  reservoirPressureBar: number;
  permeabilityD: number;
  estimatedViscosityCp: number;
  oilMobilityDcP: number;
}

export interface ProductionState {
  estimatedProductionBopd: number;
  productionTrend: ProductionTrend;
  productionDeviationPercent: number;
}

export interface SRPState {
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
  srpLoadIndex: number;
  operatingStatus: SRPOperatingStatus;
}

export interface CSSState {
  steamInjectionRateTpd: number;
  steamTemperatureC: number;
  steamQualityPercent: number;
  thermalGainC: number;
  soakStatus: CSSSoakStatus;
  cycleStatus: string;
}

export interface RiskState {
  riskLevel: RiskLevel;
  riskScore: number;
  activeWarnings: string[];
  criticalConditions: string[];
}

export interface ModelMetadata {
  modelMode: ModelMode;
  confidence: ScenarioConfidence;
  provenance: Record<string, string>;
  lastUpdateTimestamp: string;
}

export interface DigitalTwinState {
  timestamp: string;
  reservoir: ReservoirState;
  production: ProductionState;
  srp: SRPState;
  css: CSSState;
  risk: RiskState;
  metadata: ModelMetadata;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  condition: string;
  observedValue: number | string;
  threshold: number | string;
  explanation: string;
  recommendedAction: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: AlertSeverity;
  value: string;
  status: string;
}

export interface WhatIfInputs {
  reservoirTemperatureC?: number;
  steamInjectionRateTpd?: number;
  steamTemperatureC?: number;
  steamQualityPercent?: number;
  vfdFrequencyHz?: number;
  spm?: number;
  strokeLengthMeters?: number;
  effectiveDrawdownBar?: number;
}

export interface WhatIfUncertainty {
  meanProductionBopd: number;
  p10ProductionBopd: number;
  p50ProductionBopd: number;
  p90ProductionBopd: number;
  stdDevProductionBopd: number;
  confidence: ScenarioConfidence;
  isAvailable: boolean;
}

export interface WhatIfResult {
  isFeasible: boolean;
  validationMessage?: string;
  violations: string[];
  warnings: string[];
  currentState: DigitalTwinState;
  whatIfState: DigitalTwinState;
  deltas: {
    reservoirTemperatureC: number;
    estimatedViscosityCp: number;
    oilMobilityDcP: number;
    estimatedProductionBopd: number;
    srpLoadIndex: number;
    thermalGainC: number;
    riskScore: number;
  };
  uncertainty: WhatIfUncertainty;
}

import type { ScenarioInputValues } from '../scenario/types';

export interface TelemetryConfig {
  updateIntervalMs: number;
  seed: number;
  modelMode: ModelMode;
  baseInputs?: ScenarioInputValues;
}
