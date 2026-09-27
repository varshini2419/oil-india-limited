/**
 * Deterministic Deviation Detection Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 */

import type { ActualVsPredictedComparison, DeviationAlert, TelemetryValidationResult } from './types';

export const DEVIATION_THRESHOLDS = {
  PRODUCTION: {
    WARNING_PCT: 10.0,
    CRITICAL_PCT: 20.0,
  },
  PRESSURE: {
    WARNING_BAR: 5.0,
    CRITICAL_BAR: 10.0,
  },
  TEMPERATURE: {
    WARNING_C: 5.0,
    CRITICAL_C: 10.0,
  },
  WATER_CUT: {
    WARNING_PCT_POINTS: 5.0,
    CRITICAL_PCT_POINTS: 15.0,
  },
};

export function detectDeviations(
  comparison: ActualVsPredictedComparison,
  validation?: TelemetryValidationResult
): DeviationAlert[] {
  const alerts: DeviationAlert[] = [];
  const { timestamp, wellId } = comparison;

  // 1. Data Quality Deviation
  if (validation && validation.status !== 'VALID') {
    alerts.push({
      id: `DEV-DQ-${Date.now()}`,
      timestamp,
      wellId,
      severity: validation.status === 'INVALID' ? 'CRITICAL' : 'WARNING',
      type: 'DATA_QUALITY_DEVIATION',
      measuredValue: 0,
      expectedValue: 1,
      deviation: 1,
      threshold: 0,
      engineeringMessage: `Telemetry data quality anomaly detected: ${validation.reasons.join('; ')}`,
    });
  }

  // 2. Production Rate Deviation
  const prodErrPct = comparison.productionErrorPct;
  if (prodErrPct >= DEVIATION_THRESHOLDS.PRODUCTION.CRITICAL_PCT) {
    alerts.push({
      id: `DEV-PROD-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'CRITICAL',
      type: 'PRODUCTION_DEVIATION',
      measuredValue: comparison.actualProductionBOPD,
      expectedValue: comparison.predictedProductionBOPD,
      deviation: comparison.productionErrorBOPD,
      threshold: DEVIATION_THRESHOLDS.PRODUCTION.CRITICAL_PCT,
      engineeringMessage: `CRITICAL PRODUCTION DEVIATION: Observed production (${comparison.actualProductionBOPD} BOPD) deviates by ${prodErrPct}% from predicted (${comparison.predictedProductionBOPD} BOPD). Threshold: ${DEVIATION_THRESHOLDS.PRODUCTION.CRITICAL_PCT}%.`,
    });
  } else if (prodErrPct >= DEVIATION_THRESHOLDS.PRODUCTION.WARNING_PCT) {
    alerts.push({
      id: `DEV-PROD-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'WARNING',
      type: 'PRODUCTION_DEVIATION',
      measuredValue: comparison.actualProductionBOPD,
      expectedValue: comparison.predictedProductionBOPD,
      deviation: comparison.productionErrorBOPD,
      threshold: DEVIATION_THRESHOLDS.PRODUCTION.WARNING_PCT,
      engineeringMessage: `WARNING PRODUCTION DEVIATION: Observed production (${comparison.actualProductionBOPD} BOPD) deviates by ${prodErrPct}% from predicted (${comparison.predictedProductionBOPD} BOPD). Threshold: ${DEVIATION_THRESHOLDS.PRODUCTION.WARNING_PCT}%.`,
    });
  }

  // 3. Pressure Deviation
  const absPressDev = Math.abs(comparison.pressureDeviationBar);
  if (absPressDev >= DEVIATION_THRESHOLDS.PRESSURE.CRITICAL_BAR) {
    alerts.push({
      id: `DEV-PRESS-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'CRITICAL',
      type: 'PRESSURE_DEVIATION',
      measuredValue: comparison.actualPressureBar,
      expectedValue: comparison.predictedPressureBar,
      deviation: absPressDev,
      threshold: DEVIATION_THRESHOLDS.PRESSURE.CRITICAL_BAR,
      engineeringMessage: `CRITICAL PRESSURE DEVIATION: Observed pressure (${comparison.actualPressureBar} bar) deviates by ${absPressDev} bar from predicted (${comparison.predictedPressureBar} bar). Threshold: ${DEVIATION_THRESHOLDS.PRESSURE.CRITICAL_BAR} bar.`,
    });
  } else if (absPressDev >= DEVIATION_THRESHOLDS.PRESSURE.WARNING_BAR) {
    alerts.push({
      id: `DEV-PRESS-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'WARNING',
      type: 'PRESSURE_DEVIATION',
      measuredValue: comparison.actualPressureBar,
      expectedValue: comparison.predictedPressureBar,
      deviation: absPressDev,
      threshold: DEVIATION_THRESHOLDS.PRESSURE.WARNING_BAR,
      engineeringMessage: `WARNING PRESSURE DEVIATION: Observed pressure (${comparison.actualPressureBar} bar) deviates by ${absPressDev} bar from predicted (${comparison.predictedPressureBar} bar). Threshold: ${DEVIATION_THRESHOLDS.PRESSURE.WARNING_BAR} bar.`,
    });
  }

  // 4. Thermal Deviation
  const absTempDev = Math.abs(comparison.temperatureDeviationC);
  if (absTempDev >= DEVIATION_THRESHOLDS.TEMPERATURE.CRITICAL_C) {
    alerts.push({
      id: `DEV-TEMP-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'CRITICAL',
      type: 'THERMAL_DEVIATION',
      measuredValue: comparison.actualTemperatureC,
      expectedValue: comparison.predictedTemperatureC,
      deviation: absTempDev,
      threshold: DEVIATION_THRESHOLDS.TEMPERATURE.CRITICAL_C,
      engineeringMessage: `CRITICAL THERMAL DEVIATION: Observed temperature (${comparison.actualTemperatureC} °C) deviates by ${absTempDev} °C from predicted (${comparison.predictedTemperatureC} °C). Threshold: ${DEVIATION_THRESHOLDS.TEMPERATURE.CRITICAL_C} °C.`,
    });
  } else if (absTempDev >= DEVIATION_THRESHOLDS.TEMPERATURE.WARNING_C) {
    alerts.push({
      id: `DEV-TEMP-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'WARNING',
      type: 'THERMAL_DEVIATION',
      measuredValue: comparison.actualTemperatureC,
      expectedValue: comparison.predictedTemperatureC,
      deviation: absTempDev,
      threshold: DEVIATION_THRESHOLDS.TEMPERATURE.WARNING_C,
      engineeringMessage: `WARNING THERMAL DEVIATION: Observed temperature (${comparison.actualTemperatureC} °C) deviates by ${absTempDev} °C from predicted (${comparison.predictedTemperatureC} °C). Threshold: ${DEVIATION_THRESHOLDS.TEMPERATURE.WARNING_C} °C.`,
    });
  }

  // 5. Water-Cut Increase Deviation
  const wcDev = comparison.waterCutDeviationPct;
  if (wcDev >= DEVIATION_THRESHOLDS.WATER_CUT.CRITICAL_PCT_POINTS) {
    alerts.push({
      id: `DEV-WC-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'CRITICAL',
      type: 'WATER_CUT_DEVIATION',
      measuredValue: comparison.actualWaterCutPct,
      expectedValue: comparison.predictedWaterCutPct,
      deviation: wcDev,
      threshold: DEVIATION_THRESHOLDS.WATER_CUT.CRITICAL_PCT_POINTS,
      engineeringMessage: `CRITICAL WATER-CUT DEVIATION: Observed water cut (${comparison.actualWaterCutPct} %) exceeds predicted (${comparison.predictedWaterCutPct} %) by ${wcDev} percentage points. Threshold: ${DEVIATION_THRESHOLDS.WATER_CUT.CRITICAL_PCT_POINTS} points.`,
    });
  } else if (wcDev >= DEVIATION_THRESHOLDS.WATER_CUT.WARNING_PCT_POINTS) {
    alerts.push({
      id: `DEV-WC-${Date.now()}`,
      timestamp,
      wellId,
      severity: 'WARNING',
      type: 'WATER_CUT_DEVIATION',
      measuredValue: comparison.actualWaterCutPct,
      expectedValue: comparison.predictedWaterCutPct,
      deviation: wcDev,
      threshold: DEVIATION_THRESHOLDS.WATER_CUT.WARNING_PCT_POINTS,
      engineeringMessage: `WARNING WATER-CUT DEVIATION: Observed water cut (${comparison.actualWaterCutPct} %) exceeds predicted (${comparison.predictedWaterCutPct} %) by ${wcDev} percentage points. Threshold: ${DEVIATION_THRESHOLDS.WATER_CUT.WARNING_PCT_POINTS} points.`,
    });
  }

  return alerts;
}
