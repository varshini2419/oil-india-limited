import type { SourceType } from '../../data/baghewala';

export type ViscosityModelStatus = 'CALIBRATED' | 'EXTRAPOLATED' | 'INVALID';

export type ViscosityConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ViscosityCalibrationPoint {
  temperatureC: number;
  viscosityCp: number;
  sourceType: SourceType;
  sourceId?: string;
}

export interface ViscosityBreakdown {
  temperatureC: number;
  estimatedViscosityCp: number;
  baselineViscosityCp: number;
  viscosityChangeCp: number;
  viscosityChangePercent: number;
  interpolationSegment: string;
}

export interface ViscosityResult {
  temperatureC: number;
  estimatedViscosityCp: number;
  baselineViscosityCp: number;
  viscosityChangeCp: number;
  viscosityChangePercent: number;
  modelStatus: ViscosityModelStatus;
  provenance: SourceType;
  confidence: ViscosityConfidence;
  modelType: string;
  warnings: string[];
  breakdown: ViscosityBreakdown;
  calibrationPoints: ViscosityCalibrationPoint[];
  calculatedAt: string;
}

export interface ViscosityComparisonRow {
  parameter: string;
  unit: string;
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  percentChange: number;
  sourceType: SourceType;
}
