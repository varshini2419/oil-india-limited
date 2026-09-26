import { CSS_OPERATION_BOUNDS } from './defaults';
import type { CSSOperatingStatus, CSSOptimizationInput } from './types';

export interface CSSValidationResult {
  isValid: boolean;
  status: CSSOperatingStatus;
  errors: string[];
  warnings: string[];
}

export function validateCSSInput(input: Partial<CSSOptimizationInput>): CSSValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const rate = input.steamInjectionRateTpd ?? CSS_OPERATION_BOUNDS.steamRate.default;
  const quality = input.steamQualityFraction ?? CSS_OPERATION_BOUNDS.steamQuality.default;
  const injDuration = input.injectionDurationDays ?? CSS_OPERATION_BOUNDS.injectionDuration.default;
  const soakDuration = input.soakDurationDays ?? CSS_OPERATION_BOUNDS.soakDuration.default;
  const prodDuration = input.productionDurationDays ?? CSS_OPERATION_BOUNDS.productionDuration.default;
  const temp = input.reservoirTemperatureC ?? 48.0;
  const pressure = input.reservoirPressureBar ?? 90.0;

  if (rate < 0) {
    errors.push(`Steam injection rate cannot be negative (${rate} t/day).`);
  } else if (rate > CSS_OPERATION_BOUNDS.steamRate.max) {
    errors.push(`Steam injection rate (${rate} t/day) exceeds maximum operational limit (${CSS_OPERATION_BOUNDS.steamRate.max} t/day).`);
  }

  if (quality <= 0 || quality > 1.0) {
    errors.push(`Steam quality fraction (${quality}) must be strictly between 0.0 and 1.0.`);
  }

  if (injDuration < 0) {
    errors.push(`Steam injection duration cannot be negative (${injDuration} days).`);
  }

  if (soakDuration < 0) {
    errors.push(`Soak duration cannot be negative (${soakDuration} days).`);
  }

  if (prodDuration < 0) {
    errors.push(`Production duration cannot be negative (${prodDuration} days).`);
  }

  if (temp > CSS_OPERATION_BOUNDS.maxTempBound) {
    errors.push(`Reservoir temperature (${temp}°C) exceeds maximum prototype safety bound (${CSS_OPERATION_BOUNDS.maxTempBound}°C).`);
  }

  if (pressure > CSS_OPERATION_BOUNDS.maxPressureBound) {
    errors.push(`Reservoir pressure (${pressure} bar) exceeds maximum formation fracture limit (${CSS_OPERATION_BOUNDS.maxPressureBound} bar).`);
  }

  const isValid = errors.length === 0;
  let status: CSSOperatingStatus = 'NORMAL';

  if (!isValid) {
    status = 'OUT_OF_RANGE';
  } else if (rate > 120.0 || temp > 150.0) {
    status = 'HIGH_THERMAL_LOAD';
  } else if (quality < 0.70 || soakDuration > 14.0 || (rate * injDuration) > 1500.0) {
    status = 'CAUTION';
  }

  return { isValid, status, errors, warnings };
}

export function determineCSSStatus(
  inputValid: boolean,
  steamRate: number,
  steamQuality: number,
  soakDays: number,
  steamVolume: number,
  predictedTemp: number
): CSSOperatingStatus {
  if (!inputValid || steamRate < 0 || steamQuality <= 0 || steamQuality > 1.0 || predictedTemp > 200.0) {
    return 'OUT_OF_RANGE';
  }
  if (steamRate > 120.0 || predictedTemp > 150.0) {
    return 'HIGH_THERMAL_LOAD';
  }
  if (steamQuality < 0.70 || soakDays > 14.0 || steamVolume > 1500.0) {
    return 'CAUTION';
  }
  return 'NORMAL';
}
