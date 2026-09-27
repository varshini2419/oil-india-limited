/**
 * Telemetry Simulator for Demonstration & Testing
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 * NON-ACTUATING DECISION SUPPORT ONLY
 */

import type { TelemetryRecord, PilotSimulatorProfile } from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';

export function generateTelemetryStep(
  wellId: string = 'BGW-PILOT-01',
  profile: PilotSimulatorProfile = 'NORMAL',
  stepIndex: number = 0,
  baseInputs: ScenarioInputValues = BASELINE_INPUT_VALUES
): TelemetryRecord {
  const now = new Date(Date.now() + stepIndex * 60000).toISOString();

  let temp = baseInputs.reservoirTemperatureC;
  let pressure = baseInputs.reservoirPressureBar;
  let steamRate = baseInputs.steamInjectionRateTpd;
  let steamQuality = baseInputs.steamQualityPercent;
  let waterCut = baseInputs.waterCutPercent;
  let spm = baseInputs.spm;
  let stroke = baseInputs.strokeLengthMeters;
  let prodBopd = 0.75; // Default baseline expected production

  switch (profile) {
    case 'NORMAL':
      temp = baseInputs.reservoirTemperatureC;
      pressure = baseInputs.reservoirPressureBar;
      waterCut = baseInputs.waterCutPercent;
      prodBopd = Number((0.74 + Math.sin(stepIndex * 0.5) * 0.03).toFixed(2));
      break;

    case 'PRODUCTION_DECLINE':
      temp = baseInputs.reservoirTemperatureC;
      pressure = Math.max(25.0, baseInputs.reservoirPressureBar - stepIndex * 1.5);
      waterCut = Math.min(60.0, baseInputs.waterCutPercent + stepIndex * 2.0);
      prodBopd = Number(Math.max(0.1, 0.75 - stepIndex * 0.12).toFixed(2));
      break;

    case 'PRESSURE_DROP':
      pressure = Number(Math.max(15.0, 48.0 - stepIndex * 4.0 - 12.0).toFixed(1)); // Drops significantly > 10 bar
      prodBopd = Number(Math.max(0.2, 0.75 - stepIndex * 0.08).toFixed(2));
      break;

    case 'THERMAL_RESPONSE_FAILURE':
      steamRate = Math.max(100.0, baseInputs.steamInjectionRateTpd);
      temp = 42.0; // Stays cold despite high steam rate
      prodBopd = 0.45; // Low thermal response
      break;

    case 'HIGH_WATER_CUT':
      waterCut = Number(Math.min(85.0, 20.0 + 18.0 + stepIndex * 5.0).toFixed(1)); // High water cut > +15 points
      prodBopd = Number(Math.max(0.15, 0.75 - stepIndex * 0.05).toFixed(2));
      break;

    case 'STEAM_RESPONSE':
      steamRate = 120.0;
      steamQuality = 80.0;
      temp = 75.0;
      prodBopd = 4.85;
      break;

    case 'SENSOR_ANOMALY':
      if (stepIndex % 2 === 0) {
        temp = NaN; // Invalid NaN
      } else {
        prodBopd = -5.0; // Invalid negative production
      }
      break;
  }

  return {
    timestamp: now,
    wellId,
    reservoirTemperatureC: temp,
    reservoirPressureBar: pressure,
    steamInjectionRateTPD: steamRate,
    steamQualityPct: steamQuality,
    waterCutPct: waterCut,
    pumpingSpeedSPM: spm,
    strokeLengthM: stroke,
    observedProductionBOPD: prodBopd,
    source: 'DEMONSTRATION_TELEMETRY',
    dataQuality: profile === 'SENSOR_ANOMALY' ? 'INVALID' : 'VALID',
    latencyMs: 120,
  };
}
