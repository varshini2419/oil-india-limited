import type { ScenarioLimits, ScenarioInputValues } from './types';

export const SCENARIO_LIMITS: ScenarioLimits = {
  ambientTemperatureC: {
    min: 0,
    max: 60,
    unit: '°C',
    limitType: 'softwareValidationLimit',
    description: 'Thar desert ambient surface temperature range',
  },
  reservoirTemperatureC: {
    min: 30,
    max: 100,
    unit: '°C',
    limitType: 'documentedEngineeringLimit',
    description: 'Jodhpur Sandstone matrix initial temperature boundary',
  },
  steamInjectionRateTpd: {
    min: 0,
    max: 300,
    unit: 'tonne/day',
    limitType: 'softwareValidationLimit',
    description: 'Surface steam generator daily capacity limit',
  },
  steamQualityPercent: {
    min: 0,
    max: 100,
    unit: '%',
    limitType: 'softwareValidationLimit',
    description: 'Steam quality fraction percentage (0% to 100%)',
  },
  soakDurationDays: {
    min: 0,
    max: 30,
    unit: 'days',
    limitType: 'softwareValidationLimit',
    description: 'Shut-in steam soak phase duration',
  },
  vfdFrequencyHz: {
    min: 10,
    max: 70,
    unit: 'Hz',
    limitType: 'softwareValidationLimit',
    description: 'Variable frequency drive operating range',
  },
  spm: {
    min: 1,
    max: 20,
    unit: 'SPM',
    limitType: 'documentedEngineeringLimit',
    description: 'Sucker rod pump strokes per minute range',
  },
  strokeLengthMeters: {
    min: 0.5,
    max: 5.0,
    unit: 'm',
    limitType: 'softwareValidationLimit',
    description: 'Pumping unit physical stroke length boundary',
  },
};

export const BASELINE_INPUT_VALUES: ScenarioInputValues = {
  ambientTemperatureC: 35.0,
  reservoirTemperatureC: 48.0,
  steamInjectionRateTpd: 50.0,
  steamQualityPercent: 75.0,
  soakDurationDays: 7.0,
  vfdFrequencyHz: 50.0,
  spm: 8.0,
  strokeLengthMeters: 2.5,
};
