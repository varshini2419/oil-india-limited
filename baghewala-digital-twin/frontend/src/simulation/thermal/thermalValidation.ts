import type { Scenario } from '../scenario/types';

export interface ThermalValidationCheck {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export const validateThermalInputs = (scenario: Scenario): ThermalValidationCheck => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!scenario || !scenario.inputs) {
    errors.push('No scenario inputs provided to thermal model.');
    return { isValid: false, warnings, errors };
  }

  const {
    ambientTemperatureC,
    reservoirTemperatureC,
    steamInjectionRateTpd,
    steamQualityPercent,
    soakDurationDays,
  } = scenario.inputs;

  // Numeric sanity check
  if (
    Number.isNaN(ambientTemperatureC) ||
    Number.isNaN(reservoirTemperatureC) ||
    Number.isNaN(steamInjectionRateTpd) ||
    Number.isNaN(steamQualityPercent) ||
    Number.isNaN(soakDurationDays)
  ) {
    errors.push('Thermal model input contains invalid non-numeric (NaN) parameters.');
    return { isValid: false, warnings, errors };
  }

  // Bounds checks & warning flags
  if (ambientTemperatureC > 55.0) {
    warnings.push(`High desert ambient temperature (${ambientTemperatureC}°C) detected. Surface equipment thermal stress warning.`);
  }

  if (steamInjectionRateTpd > 250.0) {
    warnings.push(`High steam injection rate (${steamInjectionRateTpd} tpd) approaching maximum steam generator capacity.`);
  }

  if (steamQualityPercent < 50.0 && steamInjectionRateTpd > 0) {
    warnings.push(`Low steam quality (${steamQualityPercent}%) will reduce effective thermal enthalpy delivery to formation.`);
  }

  if (soakDurationDays === 0 && steamInjectionRateTpd > 0) {
    warnings.push('Zero soak duration specified; thermal dissipation will occur rapidly without shut-in soak phase.');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};
