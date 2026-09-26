export const DEFAULT_SRP_OPTIMIZATION_INPUTS = {
  vfdFrequencyHz: 45.0,
  spm: 8.0,
  strokeLengthM: 2.5,
} as const;

export const OPERATION_BOUNDS = {
  vfd: { min: 25.0, max: 60.0, step: 5.0, default: 45.0, unit: 'Hz' },
  spm: { min: 4.0, max: 12.0, step: 1.0, default: 8.0, unit: 'SPM' },
  stroke: { min: 1.5, max: 3.0, step: 0.5, default: 2.5, unit: 'm' },
} as const;

export const SEVERITY_WEIGHTS = {
  speed: 0.40,
  cycle: 0.35,
  stroke: 0.25,
} as const;

export const LOAD_INDEX_THRESHOLDS = {
  normalMax: 65.0,
  cautionMax: 85.0,
  highLoadMax: 100.0,
} as const;

export const MODEL_DISCLAIMERS = [
  'MODELED OPERATING WINDOW & OPTIMUM: These results are derived from a normalized engineering load-efficiency model.',
  'NOT REAL-TIME SCADA OR ACTUAL ROD-LOAD SENSOR MEASUREMENTS.',
  'OPERATIONAL SAFETY MANDATE: Field operations require physical dynamometer analysis and rod fatigue evaluation before applying VFD/SPM setpoint changes.',
] as const;

export const MODEL_ASSUMPTIONS = [
  'Pump capacity scales linearly with SPM (vfdFrequency / 50 * spm) and stroke length (strokeLength / 2.5).',
  'Operating Load Index combines normalized VFD speed severity (40%), SPM cycle rate severity (35%), and stroke length mechanical stress severity (25%).',
  'Efficiency Index penalizes production rate based on Load Index to reflect mechanical wear and stress penalties.',
  'Fluid mobility and drawdown remain governed by Step 4.5 Darcy formulation.',
] as const;
