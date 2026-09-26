import type { ValidationStatus } from './types';
import { VALIDATION_LIMITS } from './defaults';

export function determineValidationStatus(
  historicalValue: number | null,
  modeledValue: number | null,
  percentageError: number | null
): ValidationStatus {
  if (historicalValue === null || modeledValue === null || percentageError === null) {
    return 'INSUFFICIENT_DATA';
  }

  const absErr = Math.abs(percentageError);

  if (absErr <= VALIDATION_LIMITS.maxValidatedPercentError) {
    return 'VALIDATED';
  }

  if (absErr <= VALIDATION_LIMITS.maxPartiallyValidatedPercentError) {
    return 'PARTIALLY_VALIDATED';
  }

  return 'OUTSIDE_MODEL_RANGE';
}
