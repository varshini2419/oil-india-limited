export type FieldDataSource =
  | 'REAL_FIELD'
  | 'HISTORICAL'
  | 'USER_IMPORTED'
  | 'SIMULATED'
  | 'UNKNOWN';

export type DataQualityStatus =
  | 'VALID'
  | 'PARTIALLY_VALID'
  | 'INVALID'
  | 'INSUFFICIENT_DATA'
  | 'OUTSIDE_MODEL_RANGE';

export type ValueProvenance =
  | 'MEASURED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'IMPUTED'
  | 'SIMULATED'
  | 'UNIT_UNKNOWN';

export type OutlierClassification =
  | 'NORMAL'
  | 'POSSIBLE_OUTLIER'
  | 'EXTREME_OUTLIER';

export type MissingValuePolicy =
  | 'KEEP_MISSING'
  | 'LINEAR_INTERPOLATION'
  | 'FORWARD_FILL'
  | 'REJECT_RECORD';

export interface TelemetryValue<T = number> {
  value: T;
  unit?: string;
  provenance: ValueProvenance;
  isImputed?: boolean;
  originalUnit?: string;
  originalValue?: T;
  outlierStatus?: OutlierClassification;
  outlierReason?: string;
}

export interface RawTelemetryInput {
  timestamp: string;
  wellId?: string;
  source?: string;
  reservoirPressure?: number | string;
  reservoirPressureUnit?: string;
  flowingPressure?: number | string;
  flowingPressureUnit?: string;
  reservoirTemperature?: number | string;
  reservoirTemperatureUnit?: string;
  oilTemperature?: number | string;
  oilTemperatureUnit?: string;
  viscosity?: number | string;
  viscosityUnit?: string;
  permeability?: number | string;
  permeabilityUnit?: string;
  steamRateTpd?: number | string;
  steamRateUnit?: string;
  steamQuality?: number | string;
  steamQualityUnit?: string;
  steamTemperature?: number | string;
  steamTemperatureUnit?: string;
  vfdHz?: number | string;
  vfdUnit?: string;
  spm?: number | string;
  spmUnit?: string;
  strokeM?: number | string;
  strokeUnit?: string;
  productionBopd?: number | string;
  productionUnit?: string;
  waterCut?: number | string;
  motorLoad?: number | string;
  pumpLoad?: number | string;
  [key: string]: unknown;
}

export interface NormalizedTelemetryRecord {
  recordId: string;
  timestamp: string;
  source: FieldDataSource;
  wellId: string;
  qualityStatus: DataQualityStatus;
  reservoirPressure?: TelemetryValue<number>;
  flowingPressure?: TelemetryValue<number>;
  reservoirTemperature?: TelemetryValue<number>;
  oilTemperature?: TelemetryValue<number>;
  viscosity?: TelemetryValue<number>;
  permeability?: TelemetryValue<number>;
  steamRateTpd?: TelemetryValue<number>;
  steamQuality?: TelemetryValue<number>;
  steamTemperature?: TelemetryValue<number>;
  vfdHz?: TelemetryValue<number>;
  spm?: TelemetryValue<number>;
  strokeM?: TelemetryValue<number>;
  productionBopd?: TelemetryValue<number>;
  waterCut?: TelemetryValue<number>;
  motorLoad?: TelemetryValue<number>;
  pumpLoad?: TelemetryValue<number>;
  warnings: string[];
  errors: string[];
  metadata?: Record<string, string>;
}

export interface DataQualityReport {
  overallStatus: DataQualityStatus;
  qualityScore: number; // 0 to 100
  recordCount: number;
  validRecordCount: number;
  invalidRecordCount: number;
  missingValueCount: number;
  outlierCount: number;
  rangeViolationCount: number;
  completenessPercent: number;
  warnings: string[];
  errors: string[];
  timestampRange?: {
    start: string;
    end: string;
  };
}

export interface IngestionConfig {
  sourceType: FieldDataSource;
  missingValuePolicy: MissingValuePolicy;
  maxDatasetSize: number;
  allowInterpolation: boolean;
  rejectOutliers: boolean;
}

export interface IngestionResult {
  isSuccess: boolean;
  qualityReport: DataQualityReport;
  records: NormalizedTelemetryRecord[];
  disclaimer: string;
  error?: string;
}

export interface FieldDataBackendAdapter {
  fetchLatestTelemetry: () => Promise<NormalizedTelemetryRecord | null>;
  fetchTelemetryRange: (start: string, end: string) => Promise<NormalizedTelemetryRecord[]>;
  subscribeToTelemetry: (callback: (record: NormalizedTelemetryRecord) => void) => () => void;
}
