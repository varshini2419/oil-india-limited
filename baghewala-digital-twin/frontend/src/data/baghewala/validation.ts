import type { ParameterMetadata, SourceType, ConfidenceLevel } from './types';
import { SOURCES_REGISTRY } from './sources';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

const VALID_SOURCE_TYPES: SourceType[] = ['documented', 'derived', 'assumption', 'scenario'];
const VALID_CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low'];

export const validateParameterMetadata = (
  meta: ParameterMetadata<any>,
  fieldName: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check valid SourceType
  if (!VALID_SOURCE_TYPES.includes(meta.sourceType)) {
    errors.push({
      field: fieldName,
      message: `Invalid sourceType '${meta.sourceType}'. Must be one of: ${VALID_SOURCE_TYPES.join(', ')}`,
      severity: 'error',
    });
  }

  // Check valid ConfidenceLevel
  if (!VALID_CONFIDENCE_LEVELS.includes(meta.confidence)) {
    errors.push({
      field: fieldName,
      message: `Invalid confidence level '${meta.confidence}'. Must be one of: ${VALID_CONFIDENCE_LEVELS.join(', ')}`,
      severity: 'error',
    });
  }

  // Check registered sourceId if provided
  if (meta.sourceId && !SOURCES_REGISTRY[meta.sourceId]) {
    errors.push({
      field: fieldName,
      message: `Unregistered sourceId '${meta.sourceId}'. Source must exist in SOURCES_REGISTRY.`,
      severity: 'warning',
    });
  }

  // Check for negative numerical values where impossible
  if (
    typeof meta.value === 'number' &&
    meta.value < 0 &&
    !['ambientTemperatureC', 'reservoirTemperatureC'].includes(fieldName)
  ) {
    errors.push({
      field: fieldName,
      message: `Numerical value ${meta.value} ${meta.unit || ''} cannot be negative.`,
      severity: 'error',
    });
  }

  return errors;
};

export const validateFieldDataRegistry = (): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenSourceIds = new Set<string>();

  // Check duplicate source IDs
  Object.keys(SOURCES_REGISTRY).forEach((id) => {
    if (seenSourceIds.has(id)) {
      errors.push({
        field: 'SOURCES_REGISTRY',
        message: `Duplicate source ID '${id}' detected in source registry.`,
        severity: 'error',
      });
    }
    seenSourceIds.add(id);
  });

  return errors;
};
