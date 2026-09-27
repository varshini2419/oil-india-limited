/**
 * Telemetry Validation Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 */

import type { TelemetryRecord, TelemetryValidationResult, TelemetryDataQuality } from './types';

export const VALIDATION_LIMITS = {
  MIN_TEMP_C: 30.0,
  MAX_TEMP_C: 120.0,
  MIN_PRESSURE_BAR: 20.0,
  MAX_PRESSURE_BAR: 100.0,
  MIN_STEAM_RATE_TPD: 0.0,
  MAX_STEAM_RATE_TPD: 150.0,
  MIN_STEAM_QUALITY_PCT: 0.0,
  MAX_STEAM_QUALITY_PCT: 100.0,
  MIN_WATER_CUT_PCT: 0.0,
  MAX_WATER_CUT_PCT: 100.0,
  MIN_SPM: 0.0,
  MAX_SPM: 20.0,
  MIN_STROKE_LENGTH_M: 0.0,
  MAX_STROKE_LENGTH_M: 5.0,
  MIN_PRODUCTION_BOPD: 0.0,
  MAX_PRODUCTION_BOPD: 1000.0,
};

export function validateTelemetry(record: Partial<TelemetryRecord> | null | undefined): TelemetryValidationResult {
  const reasons: string[] = [];
  const diagnosticDetails: Record<string, string> = {};

  if (!record) {
    return {
      status: 'INVALID',
      reasons: ['Telemetry record is missing or null.'],
      diagnosticDetails: { record: 'NULL_OR_UNDEFINED' },
      isValid: false,
    };
  }

  // Helper for numeric validity check (reject NaN, Infinity, null, undefined)
  const isInvalidNum = (val: unknown): boolean => {
    return val === null || val === undefined || typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val);
  };

  const fieldsToCheck: (keyof TelemetryRecord)[] = [
    'reservoirTemperatureC',
    'reservoirPressureBar',
    'steamInjectionRateTPD',
    'steamQualityPct',
    'waterCutPct',
    'pumpingSpeedSPM',
    'strokeLengthM',
    'observedProductionBOPD',
  ];

  let hasInvalidNum = false;
  for (const field of fieldsToCheck) {
    if (isInvalidNum(record[field])) {
      hasInvalidNum = true;
      reasons.push(`Field '${field}' contains invalid non-numeric value (NaN, Infinity, or missing).`);
      diagnosticDetails[field] = 'INVALID_NUMBER_TYPE';
    }
  }

  if (hasInvalidNum) {
    return {
      status: 'INVALID',
      reasons,
      diagnosticDetails,
      isValid: false,
    };
  }

  // Check required metadata
  if (!record.timestamp || typeof record.timestamp !== 'string') {
    reasons.push('Telemetry record missing valid timestamp.');
    diagnosticDetails.timestamp = 'MISSING';
  }
  if (!record.wellId || typeof record.wellId !== 'string') {
    reasons.push('Telemetry record missing valid wellId.');
    diagnosticDetails.wellId = 'MISSING';
  }

  const temp = record.reservoirTemperatureC!;
  const pressure = record.reservoirPressureBar!;
  const steamRate = record.steamInjectionRateTPD!;
  const steamQual = record.steamQualityPct!;
  const waterCut = record.waterCutPct!;
  const spm = record.pumpingSpeedSPM!;
  const stroke = record.strokeLengthM!;
  const production = record.observedProductionBOPD!;

  // Strict negative & range checks
  if (temp < 0) {
    reasons.push(`Negative temperature value (${temp} °C) is physically invalid.`);
    diagnosticDetails.reservoirTemperatureC = 'NEGATIVE';
  } else if (temp < VALIDATION_LIMITS.MIN_TEMP_C || temp > VALIDATION_LIMITS.MAX_TEMP_C) {
    reasons.push(`Reservoir temperature (${temp} °C) is outside valid operating envelope [${VALIDATION_LIMITS.MIN_TEMP_C} - ${VALIDATION_LIMITS.MAX_TEMP_C} °C].`);
    diagnosticDetails.reservoirTemperatureC = 'OUT_OF_RANGE';
  }

  if (pressure < 0) {
    reasons.push(`Negative pressure value (${pressure} bar) is physically invalid.`);
    diagnosticDetails.reservoirPressureBar = 'NEGATIVE';
  } else if (pressure < VALIDATION_LIMITS.MIN_PRESSURE_BAR || pressure > VALIDATION_LIMITS.MAX_PRESSURE_BAR) {
    reasons.push(`Reservoir pressure (${pressure} bar) is outside valid operating envelope [${VALIDATION_LIMITS.MIN_PRESSURE_BAR} - ${VALIDATION_LIMITS.MAX_PRESSURE_BAR} bar].`);
    diagnosticDetails.reservoirPressureBar = 'OUT_OF_RANGE';
  }

  if (steamRate < 0) {
    reasons.push(`Negative steam injection rate (${steamRate} TPD) is invalid.`);
    diagnosticDetails.steamInjectionRateTPD = 'NEGATIVE';
  } else if (steamRate > VALIDATION_LIMITS.MAX_STEAM_RATE_TPD) {
    reasons.push(`Steam injection rate (${steamRate} TPD) exceeds maximum capacity (${VALIDATION_LIMITS.MAX_STEAM_RATE_TPD} TPD).`);
    diagnosticDetails.steamInjectionRateTPD = 'OUT_OF_RANGE';
  }

  if (steamQual < 0 || steamQual > 100) {
    reasons.push(`Steam quality (${steamQual} %) must be between 0% and 100%.`);
    diagnosticDetails.steamQualityPct = 'OUT_OF_RANGE';
  }

  if (waterCut < 0 || waterCut > 100) {
    reasons.push(`Water cut (${waterCut} %) must be between 0% and 100%.`);
    diagnosticDetails.waterCutPct = 'OUT_OF_RANGE';
  }

  if (spm < 0 || spm > VALIDATION_LIMITS.MAX_SPM) {
    reasons.push(`Pumping speed (${spm} SPM) is outside allowable range [0 - ${VALIDATION_LIMITS.MAX_SPM} SPM].`);
    diagnosticDetails.pumpingSpeedSPM = 'OUT_OF_RANGE';
  }

  if (stroke < 0 || stroke > VALIDATION_LIMITS.MAX_STROKE_LENGTH_M) {
    reasons.push(`Stroke length (${stroke} m) is outside allowable range [0 - ${VALIDATION_LIMITS.MAX_STROKE_LENGTH_M} m].`);
    diagnosticDetails.strokeLengthM = 'OUT_OF_RANGE';
  }

  if (production < 0) {
    reasons.push(`Negative production rate (${production} BOPD) is physically invalid.`);
    diagnosticDetails.observedProductionBOPD = 'NEGATIVE';
  } else if (production > VALIDATION_LIMITS.MAX_PRODUCTION_BOPD) {
    reasons.push(`Observed production (${production} BOPD) exceeds maximum valid sensor bound (${VALIDATION_LIMITS.MAX_PRODUCTION_BOPD} BOPD).`);
    diagnosticDetails.observedProductionBOPD = 'OUT_OF_RANGE';
  }

  // Categorize status: any validation error or envelope failure yields INVALID
  let status: TelemetryDataQuality = 'VALID';
  if (reasons.length > 0) {
    status = 'INVALID';
  }

  return {
    status,
    reasons,
    diagnosticDetails,
    isValid: status !== 'INVALID',
  };
}
