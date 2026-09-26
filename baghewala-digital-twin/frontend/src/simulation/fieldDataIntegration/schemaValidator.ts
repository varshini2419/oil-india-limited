import type { RawTelemetryInput, IngestionConfig } from './types';
import { MONITORING_BOUNDS } from '../realtimeMonitoring/defaults';

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Dangerous prototype pollution keys to block
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function validateTelemetryRecordSchema(
  record: RawTelemetryInput
): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Prototype Pollution Check
  const ownProps = Object.getOwnPropertyNames(record);
  for (const key of ownProps) {
    if (BLOCKED_KEYS.has(key)) {
      errors.push(`Security violation: Blocked dangerous object key "${key}".`);
      return { isValid: false, errors, warnings };
    }
  }
  if (Object.prototype.hasOwnProperty.call(record, '__proto__')) {
    errors.push(`Security violation: Blocked dangerous object key "__proto__".`);
    return { isValid: false, errors, warnings };
  }

  // 2. Timestamp Validation
  if (!record.timestamp || typeof record.timestamp !== 'string') {
    errors.push('Missing or invalid record timestamp.');
  } else {
    const parsedTs = Date.parse(record.timestamp);
    if (isNaN(parsedTs)) {
      errors.push(`Malformed timestamp string "${record.timestamp}". Must be a valid ISO 8601 date string.`);
    }
  }

  // 3. Numeric & Model Bound Checks
  const checkNumericField = (
    fieldName: string,
    val: unknown,
    minVal?: number,
    maxVal?: number,
    allowNegative = false
  ) => {
    if (val === undefined || val === null || val === '') return;
    const num = Number(val);
    if (isNaN(num)) {
      errors.push(`Field "${fieldName}" contains invalid non-numeric value "${val}".`);
      return;
    }
    if (!isFinite(num)) {
      errors.push(`Field "${fieldName}" contains non-finite numeric value (Infinity).`);
      return;
    }
    if (!allowNegative && num < 0) {
      errors.push(`Field "${fieldName}" cannot be negative (${num}).`);
      return;
    }
    if (minVal !== undefined && num < minVal) {
      warnings.push(`Field "${fieldName}" (${num}) is below model boundary (${minVal}).`);
    }
    if (maxVal !== undefined && num > maxVal) {
      warnings.push(`Field "${fieldName}" (${num}) exceeds model boundary (${maxVal}).`);
    }
  };

  checkNumericField('reservoirTemperature', record.reservoirTemperature, MONITORING_BOUNDS.minTemperatureC, MONITORING_BOUNDS.maxTemperatureC);
  checkNumericField('reservoirPressure', record.reservoirPressure, 0, 200.0);
  checkNumericField('flowingPressure', record.flowingPressure, 0, 200.0);
  checkNumericField('viscosity', record.viscosity, MONITORING_BOUNDS.minViscosityCp, MONITORING_BOUNDS.maxViscosityCp);
  checkNumericField('permeability', record.permeability, 0.001, 10.0);
  checkNumericField('steamRateTpd', record.steamRateTpd, MONITORING_BOUNDS.minSteamRateTpd, MONITORING_BOUNDS.maxSteamRateTpd);
  checkNumericField('steamQuality', record.steamQuality, 0, 100);
  checkNumericField('vfdHz', record.vfdHz, MONITORING_BOUNDS.minVfdHz, MONITORING_BOUNDS.maxVfdHz);
  checkNumericField('spm', record.spm, MONITORING_BOUNDS.minSpm, MONITORING_BOUNDS.maxSpm);
  checkNumericField('strokeM', record.strokeM, MONITORING_BOUNDS.minStrokeM, MONITORING_BOUNDS.maxStrokeM);
  checkNumericField('productionBopd', record.productionBopd, 0, MONITORING_BOUNDS.maxProductionBopd);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateRawDatasetPayload(
  payload: string,
  config: IngestionConfig
): { isValid: boolean; parsedData?: RawTelemetryInput[]; error?: string } {
  if (!payload || typeof payload !== 'string') {
    return { isValid: false, error: 'Empty or non-string payload provided.' };
  }

  // Security Check: Dataset Size Limit
  if (payload.length > config.maxDatasetSize * 1000) {
    return {
      isValid: false,
      error: `Payload size (${(payload.length / 1024).toFixed(1)} KB) exceeds configured maximum ingestion limit (${config.maxDatasetSize} records).`,
    };
  }

  // Safe JSON Parsing only (no eval)
  try {
    const trimmed = payload.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      const recordsArray: RawTelemetryInput[] = Array.isArray(parsed) ? parsed : [parsed];

      if (recordsArray.length > config.maxDatasetSize) {
        return {
          isValid: false,
          error: `Dataset contains ${recordsArray.length} records, exceeding maximum allowed count (${config.maxDatasetSize}).`,
        };
      }

      return { isValid: true, parsedData: recordsArray };
    }
  } catch (e) {
    // If not JSON, parse CSV below
  }

  // Safe CSV Parsing
  try {
    const lines = payload.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { isValid: false, error: 'CSV dataset must contain a header row and at least one data row.' };
    }

    if (lines.length - 1 > config.maxDatasetSize) {
      return {
        isValid: false,
        error: `CSV contains ${lines.length - 1} records, exceeding maximum allowed count (${config.maxDatasetSize}).`,
      };
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const recordsArray: RawTelemetryInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const obj: RawTelemetryInput = { timestamp: '' };

      headers.forEach((header, idx) => {
        if (values[idx] !== undefined && values[idx] !== '') {
          (obj as Record<string, unknown>)[header] = values[idx];
        }
      });

      recordsArray.push(obj);
    }

    return { isValid: true, parsedData: recordsArray };
  } catch (e) {
    return { isValid: false, error: 'Failed to parse payload. Untrusted or malformed format.' };
  }
}
