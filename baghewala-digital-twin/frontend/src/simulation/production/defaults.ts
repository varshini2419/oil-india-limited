export const PRODUCTIVITY_MOBILITY_COEFFICIENT = 50.0; // (BOPD/bar)/(D/cP) - ASSUMED CALIBRATION PARAMETER
export const DEFAULT_EFFECTIVE_DRAWDOWN_BAR = 30.0;     // bar - ASSUMED SCREENING PARAMETER

export const REFERENCE_SPM = 8.0;
export const REFERENCE_STROKE_LENGTH_M = 2.5;
export const REFERENCE_VFD_HZ = 50.0;

export const MAX_ESTIMATED_PRODUCTION_BOPD = 500.0;
export const MIN_ESTIMATED_PRODUCTION_BOPD = 0.0;

export const PRODUCTION_MODEL_ASSUMPTIONS = [
  'Productivity index J_o (BOPD/bar) is proportional to oil mobility (J_o = C_prod * λ_o) with C_prod = 50.0 (BOPD/bar)/(D/cP) [ASSUMED CALIBRATION PARAMETER].',
  'Effective reservoir drawdown (ΔP = 30.0 bar) is an assumed screening parameter because measured flowing bottom-hole pressure and pressure-transient data are not currently available [ASSUMED SCREENING PARAMETER].',
  'Mechanical pump operation factor (F_pump) is normalized relative to Baghewala baseline (8 SPM, 2.5m stroke, 50 Hz VFD) and bounded between 0.2 and 2.5 [ASSUMED PUMP OPERATIONAL FACTOR].',
  'This is a deterministic engineering screening estimate, not a substitute for a calibrated reservoir simulator, well test, pressure-transient analysis, or field production history [MODEL DISCLAIMER].',
];
