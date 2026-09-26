import type { ScenarioInput } from './types';
import { JODHPUR_RESERVOIR_PROFILE } from './reservoir';
import { BAGHEWALA_CRUDE_PROFILE } from './crude';

export interface BaghewalaBaselineScenario {
  id: string;
  name: string;
  description: string;
  reservoirTemperatureC: number | null;
  reservoirPressureBar: number | null;
  crudeApiGravity: number | null;
  crudeViscosityCpAtNativeTemp: number | null;
  steamState: string;
  cssCycleState: string;
  vfdState: string;
  spmState: string;
}

export const BAGHEWALA_BASELINE: BaghewalaBaselineScenario = {
  id: 'BAGHEWALA_BASELINE',
  name: 'Baghewala Reference Baseline',
  description: 'Current reference operational state of the representative Jodhpur Sandstone CSS well.',
  reservoirTemperatureC: JODHPUR_RESERVOIR_PROFILE.reservoirTemperatureC.value,
  reservoirPressureBar: JODHPUR_RESERVOIR_PROFILE.initialPressureBar.value,
  crudeApiGravity: BAGHEWALA_CRUDE_PROFILE.apiGravityMin.value, // 12.0 API
  crudeViscosityCpAtNativeTemp: 15000, // 15,000 cP at 48°C
  steamState: 'Post-Soak Thermal Matrix',
  cssCycleState: 'Cycle 1 Active Production',
  vfdState: '50 Hz Standard Frequency',
  spmState: '8 SPM Standard Pumping Rate',
};

/**
 * SCENARIO INPUT SCHEMA (Step 4.1 Schema Definition ONLY)
 * 
 * Note: These fields define the input schema for future engineering simulation models (Step 4.2+).
 * No physics calculations are executed from these values in Step 4.1.
 */
export const DEFAULT_SCENARIO_INPUT: ScenarioInput = {
  ambientTemperatureC: 35.0,
  reservoirTemperatureC: 48.0,
  steamInjectionRateTpd: 50.0,
  steamQualityFraction: 0.75,
  soakDurationDays: 7.0,
  vfdFrequencyHz: 50.0,
  spm: 8.0,
  strokeLengthMeters: 2.5,
};
