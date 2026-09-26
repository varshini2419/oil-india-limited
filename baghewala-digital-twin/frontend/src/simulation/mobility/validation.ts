export interface MobilityValidationCheck {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export const validateMobilityInputs = (
  viscosityCp: number,
  permeabilityD: number,
  relativePermeability: number
): MobilityValidationCheck => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Non-numeric or NaN check
  if (
    Number.isNaN(viscosityCp) ||
    Number.isNaN(permeabilityD) ||
    Number.isNaN(relativePermeability) ||
    !Number.isFinite(viscosityCp) ||
    !Number.isFinite(permeabilityD) ||
    !Number.isFinite(relativePermeability)
  ) {
    errors.push('Mobility model received invalid non-numeric or infinite inputs.');
    return { isValid: false, warnings, errors };
  }

  // Viscosity bounds check
  if (viscosityCp <= 0) {
    errors.push(`Invalid non-positive viscosity (${viscosityCp} cP) provided to mobility model.`);
  }

  // Permeability bounds check
  if (permeabilityD < 0) {
    errors.push(`Negative reservoir permeability (${permeabilityD} D) is physically impossible.`);
  }

  // Relative permeability bounds check
  if (relativePermeability < 0 || relativePermeability > 1.0) {
    errors.push(`Relative permeability (${relativePermeability}) must be between 0.0 and 1.0.`);
  }

  // Conceptual warnings
  if (relativePermeability === 1.0) {
    warnings.push(
      'Relative permeability is currently assumed as 1.0 (conceptual single-phase assumption); multiphase saturation effects are not modeled.'
    );
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};
