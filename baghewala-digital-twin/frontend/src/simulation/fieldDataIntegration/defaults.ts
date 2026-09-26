import type { IngestionConfig } from './types';

export const DEFAULT_INGESTION_CONFIG: IngestionConfig = {
  sourceType: 'USER_IMPORTED',
  missingValuePolicy: 'LINEAR_INTERPOLATION',
  maxDatasetSize: 5000,
  allowInterpolation: true,
  rejectOutliers: false,
};

export const TARGET_UNITS = {
  temperature: '°C',
  pressure: 'bar',
  production: 'BOPD',
  steamRate: 'TPD',
  vfd: 'Hz',
  spm: 'SPM',
  stroke: 'm',
  viscosity: 'cP',
  permeability: 'D',
};

export const DATA_SOURCE_LABELS = {
  REAL_FIELD: 'REAL FIELD DATA',
  HISTORICAL: 'HISTORICAL APPRAISAL DATA',
  USER_IMPORTED: 'USER IMPORTED DATASET',
  SIMULATED: 'SIMULATED TELEMETRY',
  UNKNOWN: 'UNKNOWN DATA SOURCE',
};

export const FIELD_DATA_DISCLAIMER =
  'DATA INGESTION & PROVENANCE NOTICE: Imported field and telemetry data pass through unit normalization, schema validation, quality scoring, and outlier detection before state estimation. Values are explicitly tagged by provenance (MEASURED, DERIVED, ESTIMATED, IMPUTED, SIMULATED, or UNIT_UNKNOWN). Simulated telemetry and imported demonstration data are never presented as measured Baghewala field records.';
