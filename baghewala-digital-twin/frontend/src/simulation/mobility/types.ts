import type { SourceType } from '../../data/baghewala';

export type MobilityStatus = 'VALID' | 'INVALID' | 'WARNING';
export type MobilityConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MobilityInput {
  viscosityCp: number;
  permeabilityD: number;
  relativePermeability: number;
  temperatureC: number;
}

export interface MobilityBreakdown {
  temperatureC: number;
  viscosityCp: number;
  permeabilityD: number;
  relativePermeability: number;
  effectivePermeabilityD: number;
  mobilityDcP: number;
  baselineMobilityDcP: number;
  mobilityDeltaDcP: number;
  mobilityChangePercent: number;
}

export interface MobilityResult {
  mobilityDcP: number;
  mobilityUnit: string; // "D/cP"
  baselineMobilityDcP: number;
  mobilityDeltaDcP: number;
  mobilityChangePercent: number;
  viscosityCp: number;
  permeabilityD: number;
  relativePermeability: number;
  effectivePermeabilityD: number;
  temperatureC: number;
  status: MobilityStatus;
  confidence: MobilityConfidence;
  modelType: string;
  warnings: string[];
  breakdown: MobilityBreakdown;
  inputSources: {
    permeability: SourceType;
    viscosity: SourceType;
    relativePermeability: SourceType;
  };
  calculatedAt: string;
}

export interface MobilityComparisonRow {
  parameter: string;
  unit: string;
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  percentChange: number;
  sourceType: SourceType;
}
