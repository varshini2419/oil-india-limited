import type { SourceType } from '../../data/baghewala';

export type OperatingStatus = 'NORMAL' | 'CAUTION' | 'HIGH_LOAD' | 'OUT_OF_RANGE';

export interface SRPOptimizationInput {
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthM: number;
  oilMobilityDcp: number;
  effectiveDrawdownBar: number;
  temperatureC: number;
  viscosityCp: number;
}

export interface OptimizationCandidate {
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthM: number;
  pumpCapacityFactor: number;
  estimatedProductionBopd: number;
  speedSeverity: number;
  cycleSeverity: number;
  strokeSeverity: number;
  loadIndex: number; // 0 to 100
  efficiencyIndex: number; // BOPD / (1 + 0.015 * loadIndex)
  status: OperatingStatus;
  isValid: boolean;
  penaltyMessage?: string;
}

export interface OperatingWindow {
  minVFD: number;
  maxVFD: number;
  minSPM: number;
  maxSPM: number;
  minStroke: number;
  maxStroke: number;
  safeCandidatesCount: number;
  cautionCandidatesCount: number;
  highLoadCandidatesCount: number;
  totalCandidatesCount: number;
}

export interface OptimizationResult {
  currentCandidate: OptimizationCandidate;
  optimalCandidate: OptimizationCandidate;
  candidates: OptimizationCandidate[];
  operatingWindow: OperatingWindow;
  productionDeltaBopd: number;
  productionDeltaPercent: number;
  loadDeltaIndex: number;
  efficiencyDelta: number;
  status: OperatingStatus;
  isOptimized: boolean;
  warnings: string[];
  assumptions: string[];
  disclaimers: string[];
  modelType: string;
  calculatedAt: string;
  inputSources: {
    vfdFrequency: SourceType;
    spm: SourceType;
    strokeLength: SourceType;
    loadIndexModel: SourceType;
    gridSearchModel: SourceType;
  };
}

export interface OptimizationComparisonRow {
  parameter: string;
  unit: string;
  currentValue: number;
  optimizedValue: number;
  delta: number;
  percentChange: number;
  sourceType: SourceType;
}
