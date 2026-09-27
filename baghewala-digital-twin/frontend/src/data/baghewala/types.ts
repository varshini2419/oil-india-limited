export type SourceType =
  | 'documented'
  | 'derived'
  | 'assumption'
  | 'scenario'
  | 'publication'
  | 'report'
  | 'reference'
  | 'FIELD_LOG'
  | 'PRODUCTION_TEST'
  | 'CORE_ANALYSIS';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DataSource {
  id: string;
  title: string;
  publisher: string;
  year?: number;
  url: string | null;
  notes: string;
}

export interface ParameterMetadata<T = number | string | null> {
  parameter: string;
  value: T;
  unit?: string;
  sourceType: SourceType;
  sourceId?: string;
  confidence: ConfidenceLevel;
  notes?: string;
  lastVerified?: string;
}

export interface FieldProfile {
  fieldName: ParameterMetadata<string>;
  location: ParameterMetadata<string>;
  basin: ParameterMetadata<string>;
  operator: ParameterMetadata<string>;
  reservoirName: ParameterMetadata<string>;
  developmentStatus: ParameterMetadata<string>;
  primaryRecoveryMethod: ParameterMetadata<string>;
  artificialLiftMethod: ParameterMetadata<string>;
  thermalRecoveryMethod: ParameterMetadata<string>;
}

export interface ReservoirProfile {
  reservoirName: ParameterMetadata<string>;
  formation: ParameterMetadata<string>;
  depthMinMeters: ParameterMetadata<number | null>;
  depthMaxMeters: ParameterMetadata<number | null>;
  reservoirTemperatureC: ParameterMetadata<number | null>;
  initialPressureBar: ParameterMetadata<number | null>;
  porosityFraction: ParameterMetadata<number | null>;
  permeabilityDarcies: ParameterMetadata<number | null>;
  oilSaturationFraction: ParameterMetadata<number | null>;
  geologicalNotes: ParameterMetadata<string>;
}

export interface ViscosityDataPoint {
  temperatureC: number;
  viscosityCp: number;
  sourceType: SourceType;
  sourceId?: string;
}

export interface CrudeProfile {
  apiGravityMin: ParameterMetadata<number | null>;
  apiGravityMax: ParameterMetadata<number | null>;
  asphalteneContentPercent: ParameterMetadata<number | null>;
  densityGcm3: ParameterMetadata<number | null>;
  classification: ParameterMetadata<string>;
  viscosityDataPoints: ViscosityDataPoint[];
  notes: ParameterMetadata<string>;
}

export interface WellProfile {
  wellId: string;
  wellName: string;
  reservoir: string;
  completionStatus: ParameterMetadata<string>;
  artificialLiftMethod: ParameterMetadata<string>;
  cssStatus: ParameterMetadata<string>;
  productionStatus: ParameterMetadata<string>;
  totalDepthMeters: ParameterMetadata<number | null>;
  sourceType: SourceType;
  notes: string;
}

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  category: 'discovery' | 'appraisal' | 'pilot_trial' | 'development' | 'milestone';
  description: string;
  sourceId?: string;
  sourceType: SourceType;
}

export interface ProductionRecord {
  id: string;
  date: string;
  wellId: string;
  oilProductionBpd: ParameterMetadata<number | null>;
  waterCutPercent: ParameterMetadata<number | null>;
  isSnapshot: boolean;
  notes: string;
}

export interface CSSCycleRecord {
  id: string;
  wellId: string;
  cycleNumber: number;
  injectionDate: string | null;
  steamVolumeTons: ParameterMetadata<number | null>;
  injectionPressureBar: ParameterMetadata<number | null>;
  soakDurationDays: ParameterMetadata<number | null>;
  productionPeriodDays: ParameterMetadata<number | null>;
  oilRecoveredTons: ParameterMetadata<number | null>;
  notes: string;
}

export interface ScenarioInput {
  ambientTemperatureC: number;
  reservoirTemperatureC: number;
  steamInjectionRateTpd: number;
  steamQualityFraction: number;
  soakDurationDays: number;
  vfdFrequencyHz: number;
  spm: number;
  strokeLengthMeters: number;
}
