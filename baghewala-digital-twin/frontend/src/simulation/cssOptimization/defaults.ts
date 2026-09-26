import type { CSSOptimizationInput } from './types';

export const DEFAULT_CSS_OPTIMIZATION_INPUTS: CSSOptimizationInput = {
  steamInjectionRateTpd: 80.0,
  steamInjectionTemperatureC: 300.0,
  steamQualityFraction: 0.80,
  injectionDurationDays: 5.0,
  soakDurationDays: 7.0,
  productionDurationDays: 90.0,
  reservoirTemperatureC: 48.0,
  reservoirPressureBar: 90.0,
  baselineViscosityCp: 15000.0,
  baselineMobilityDPerCp: 0.0005,
  baselineProductionBopd: 0.75,
  vfdFrequencyHz: 45.0,
  spm: 8.0,
  strokeLengthMeters: 2.5,
  cycleNumber: 1,
  thermalEfficiency: 0.75,
  heatLossFactor: 0.15,
  recoveryFactor: 0.30,
};

export const CSS_OPERATION_BOUNDS = {
  steamRate: { min: 0.0, max: 200.0, step: 20.0, default: 80.0, unit: 't/day' },
  steamTemp: { min: 100.0, max: 350.0, step: 25.0, default: 300.0, unit: '°C' },
  steamQuality: { min: 0.1, max: 1.0, step: 0.1, default: 0.8, unit: 'fraction' },
  injectionDuration: { min: 1.0, max: 20.0, step: 2.0, default: 5.0, unit: 'days' },
  soakDuration: { min: 1.0, max: 30.0, step: 3.0, default: 7.0, unit: 'days' },
  productionDuration: { min: 10.0, max: 180.0, step: 10.0, default: 90.0, unit: 'days' },
  maxTempBound: 200.0,
  maxPressureBound: 200.0,
} as const;

export const CSS_MODEL_DISCLAIMERS = [
  'ENGINEERING SCREENING MODEL: These CSS thermal and production optimization results are derived from a reduced-order thermal-retention model.',
  'NOT A FIELD-CALIBRATED NUMERICAL RESERVOIR SIMULATOR.',
  'OPERATIONAL MANDATE: Field cyclic steam injection requires formation fracture pressure analysis and casing thermal stress evaluation prior to steam cycle changes.',
] as const;

export const CSS_MODEL_ASSUMPTIONS = [
  'Steam volume injected equals daily steam rate multiplied by injection duration.',
  'Thermal gain scales with steam volume, steam quality fraction, and soak retention factor exp(-soak / 30).',
  'CSS temperature directly feeds Step 4.4 log-linear viscosity model, Step 4.5 Darcy mobility model, Step 4.6 production model, and Step 4.7 SRP lift factor.',
  'CSS Efficiency Score balances incremental production against steam energy consumption and total cycle turn-around time.',
] as const;
