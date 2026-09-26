import type { SourceType } from '../../data/baghewala';

export type ProductionStatus = 'VALID' | 'WARNING' | 'INVALID';

export type ProductionConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProductionInput {
  oilMobilityDcp: number;
  effectiveDrawdownBar: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthM: number;
  temperatureC: number;
  viscosityCp: number;
}

export interface ProductionBreakdown {
  temperatureC: number;
  viscosityCp: number;
  oilMobilityDcp: number;
  productivityIndexBopdBar: number;
  effectiveDrawdownBar: number;
  pumpOperationFactor: number;
  unconstrainedFlowBopd: number;
  estimatedProductionBopd: number;
  baselineProductionBopd: number;
  productionChangeBopd: number;
  productionChangePercent: number;
}

export interface ProductionResult {
  estimatedProductionBopd: number;
  productionUnit: string; // "BOPD"
  baselineProductionBopd: number;
  productionChangeBopd: number;
  productionChangePercent: number;
  oilMobilityDcp: number;
  effectiveDrawdownBar: number;
  productivityIndexBopdBar: number;
  pumpOperationFactor: number;
  temperatureC: number;
  viscosityCp: number;
  status: ProductionStatus;
  confidence: ProductionConfidence;
  modelType: string;
  warnings: string[];
  assumptions: string[];
  breakdown: ProductionBreakdown;
  inputSources: {
    mobility: SourceType;
    drawdown: SourceType;
    pumpOperation: SourceType;
    calibrationFactor: SourceType;
  };
  calculatedAt: string;
}

export interface ProductionComparisonRow {
  parameter: string;
  unit: string;
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  percentChange: number;
  sourceType: SourceType;
}
