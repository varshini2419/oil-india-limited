import type { CalibrationParameter } from './types';

export interface ParameterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCalibrationParameterValue(
  param: CalibrationParameter,
  candidateValue: number
): ParameterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof candidateValue !== 'number' || isNaN(candidateValue) || !isFinite(candidateValue)) {
    errors.push(`Candidate value for parameter ${param.name} is non-numeric (NaN/Infinity).`);
    return { isValid: false, errors, warnings };
  }

  // Enforce boundary constraints
  if (candidateValue < param.minAllowed) {
    errors.push(
      `Candidate value ${candidateValue} ${param.unit} is below minimum allowed bound (${param.minAllowed} ${param.unit}) for ${param.name}.`
    );
  }

  if (candidateValue > param.maxAllowed) {
    errors.push(
      `Candidate value ${candidateValue} ${param.unit} exceeds maximum allowed bound (${param.maxAllowed} ${param.unit}) for ${param.name}.`
    );
  }

  // Prevent modifying immutable documented field parameters
  if (param.sourceType === 'documented') {
    errors.push(`Documented parameter ${param.name} (Source: ${param.sourceId}) is immutable and cannot be calibrated.`);
  }

  // Specific domain physics safety checks
  if (param.category === 'production' && candidateValue < 0) {
    errors.push(`Production parameter ${param.name} cannot be negative.`);
  }

  if (param.category === 'viscosity' && candidateValue <= 0) {
    errors.push(`Viscosity parameter ${param.name} must be strictly positive.`);
  }

  if (param.category === 'thermal' && (candidateValue < -50 || candidateValue > 350)) {
    errors.push(`Thermal parameter ${param.name} value ${candidateValue} is physically unviable.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateObservationData(
  observedValue: number | null,
  predictedValue: number | null
): { isValid: boolean; reason?: string } {
  if (observedValue === null || predictedValue === null) {
    return { isValid: false, reason: 'Missing observation or prediction value.' };
  }

  if (isNaN(observedValue) || !isFinite(observedValue) || isNaN(predictedValue) || !isFinite(predictedValue)) {
    return { isValid: false, reason: 'Observation or prediction value is non-numeric.' };
  }

  return { isValid: true };
}
