export interface ProductionValidationCheck {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export const validateProductionInputs = (
  oilMobilityDcp: number,
  effectiveDrawdownBar: number,
  vfdFrequencyHz: number,
  spm: number,
  strokeLengthM: number
): ProductionValidationCheck => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Non-numeric check
  if (
    Number.isNaN(oilMobilityDcp) ||
    Number.isNaN(effectiveDrawdownBar) ||
    Number.isNaN(vfdFrequencyHz) ||
    Number.isNaN(spm) ||
    Number.isNaN(strokeLengthM) ||
    !Number.isFinite(oilMobilityDcp) ||
    !Number.isFinite(effectiveDrawdownBar) ||
    !Number.isFinite(vfdFrequencyHz) ||
    !Number.isFinite(spm) ||
    !Number.isFinite(strokeLengthM)
  ) {
    errors.push('Production model received invalid non-numeric or infinite parameters.');
    return { isValid: false, warnings, errors };
  }

  // Negative mobility check
  if (oilMobilityDcp <= 0) {
    errors.push(`Invalid non-positive oil mobility (${oilMobilityDcp} D/cP) provided to production model.`);
  }

  // Drawdown check
  if (effectiveDrawdownBar < 0) {
    errors.push(`Negative effective drawdown pressure (${effectiveDrawdownBar} bar) is physically impossible.`);
  }

  // Mechanical pump parameters check
  if (spm <= 0) {
    errors.push(`Strokes per minute (${spm} SPM) must be positive.`);
  }
  if (strokeLengthM <= 0) {
    errors.push(`Stroke length (${strokeLengthM} m) must be positive.`);
  }
  if (vfdFrequencyHz <= 0) {
    errors.push(`VFD operating frequency (${vfdFrequencyHz} Hz) must be positive.`);
  }

  // Screening warnings
  warnings.push(
    'Effective drawdown (30.0 bar) is an assumed screening parameter; bottom-hole flowing pressure data not available.'
  );

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};
