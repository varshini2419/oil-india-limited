import type { ScenarioInputValues, ScenarioValidationResult, ValidationErrorItem } from './types';
import { SCENARIO_LIMITS } from './defaults';

export const validateScenarioInputs = (
  inputs: Partial<ScenarioInputValues>
): ScenarioValidationResult => {
  if (!inputs || typeof inputs !== 'object') {
    return {
      isValid: false,
      errors: [
        {
          field: 'scenario',
          message: 'Scenario inputs must be a valid object.',
          limitType: 'softwareValidationLimit',
        },
      ],
    };
  }

  const errors: ValidationErrorItem[] = [];

  const keys = Object.keys(SCENARIO_LIMITS) as (keyof ScenarioInputValues)[];

  keys.forEach((key) => {
    const val = inputs[key];
    const boundary = SCENARIO_LIMITS[key];

    if (val === undefined || val === null || typeof val !== 'number' || Number.isNaN(val)) {
      errors.push({
        field: key,
        message: `${key} must be a valid numeric value.`,
        limitType: 'softwareValidationLimit',
      });
      return;
    }

    if (!Number.isFinite(val)) {
      errors.push({
        field: key,
        message: `${key} cannot be Infinity.`,
        limitType: 'softwareValidationLimit',
      });
      return;
    }

    if (val < boundary.min) {
      errors.push({
        field: key,
        message: `${key} (${val} ${boundary.unit}) is below minimum limit of ${boundary.min} ${boundary.unit}.`,
        limitType: boundary.limitType,
      });
    } else if (val > boundary.max) {
      errors.push({
        field: key,
        message: `${key} (${val} ${boundary.unit}) exceeds maximum limit of ${boundary.max} ${boundary.unit}.`,
        limitType: boundary.limitType,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
