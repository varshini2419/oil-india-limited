import { MIN_CALIBRATED_TEMP_C, MAX_CALIBRATED_TEMP_C } from './defaults';

export interface ViscosityValidationCheck {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export const validateViscosityInputs = (temperatureC: number): ViscosityValidationCheck => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (temperatureC === undefined || temperatureC === null || Number.isNaN(temperatureC)) {
    errors.push('Viscosity model received non-numeric (NaN / undefined) temperature input.');
    return { isValid: false, warnings, errors };
  }

  if (!Number.isFinite(temperatureC)) {
    errors.push('Viscosity model received infinite temperature input.');
    return { isValid: false, warnings, errors };
  }

  if (temperatureC < MIN_CALIBRATED_TEMP_C) {
    warnings.push(
      `Temperature (${temperatureC}°C) is below minimum calibrated data boundary (${MIN_CALIBRATED_TEMP_C}°C). Viscosity estimate extrapolated using log-linear slope.`
    );
  } else if (temperatureC > MAX_CALIBRATED_TEMP_C) {
    warnings.push(
      `Temperature (${temperatureC}°C) exceeds maximum calibrated data boundary (${MAX_CALIBRATED_TEMP_C}°C). Viscosity estimate extrapolated using log-linear slope.`
    );
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};
