import type { ScenarioLimits, ScenarioInputValues } from './types';

export const SCENARIO_LIMITS: ScenarioLimits = {
  ambientTemperatureC: {
    min: 0,
    max: 60,
    unit: '°C',
    limitType: 'softwareValidationLimit',
    description: 'Thar desert ambient surface temperature range',
  },
  humidityPercent: {
    min: 10,
    max: 90,
    unit: '%',
    limitType: 'softwareValidationLimit',
    description: 'Surface ambient relative humidity percentage',
  },
  windSpeedKmh: {
    min: 0,
    max: 60,
    unit: 'km/h',
    limitType: 'softwareValidationLimit',
    description: 'Surface wind velocity for convective heat loss',
  },
  reservoirTemperatureC: {
    min: 30,
    max: 100,
    unit: '°C',
    limitType: 'documentedEngineeringLimit',
    description: 'Jodhpur Sandstone matrix initial temperature boundary',
  },
  reservoirPressureBar: {
    min: 10,
    max: 150,
    unit: 'bar',
    limitType: 'documentedEngineeringLimit',
    description: 'Initial Jodhpur Sandstone reservoir static pressure',
  },
  permeabilityDarcy: {
    min: 0.1,
    max: 10.0,
    unit: 'Darcy',
    limitType: 'documentedEngineeringLimit',
    description: 'Effective pay sandstone matrix absolute permeability',
  },
  steamInjectionRateTpd: {
    min: 0,
    max: 300,
    unit: 't/day',
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
  steamInjectionTemperatureC: {
    min: 100,
    max: 350,
    unit: '°C',
    limitType: 'documentedEngineeringLimit',
    description: 'Downhole steam injection line generator temperature',
  },
  soakDurationDays: {
    min: 0,
    max: 30,
    unit: 'days',
    limitType: 'softwareValidationLimit',
    description: 'Shut-in steam soak phase duration',
  },
  waterCutPercent: {
    min: 0,
    max: 100,
    unit: '%',
    limitType: 'softwareValidationLimit',
    description: 'Produced water cut volume fraction percentage',
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

/**
 * Authoritative Canonical Baghewala Reference Baseline Input Values.
 * 
 * Engineering Baseline Disambiguation:
 * - Reservoir Temperature: 48.0 °C (Jodhpur Sandstone matrix initial temperature)
 * - Reservoir Pressure: 48.0 bar (Initial static reservoir pressure)
 * - Steam Injection Temp: 300.0 °C (Canonical steam generator output temperature)
 * - Water Cut: 20.0 % (Documented baseline formation water cut)
 * - Permeability: 2.5 Darcy (Core lab analysis benchmark)
 * - Surface Weather: 35.0 °C ambient, 45.0 % humidity, 18.0 km/h wind speed
 */
export const BASELINE_INPUT_VALUES: ScenarioInputValues = {
  ambientTemperatureC: 35.0,
  humidityPercent: 45.0,
  windSpeedKmh: 18.0,
  reservoirTemperatureC: 48.0,
  reservoirPressureBar: 48.0,
  permeabilityDarcy: 2.5,
  steamInjectionRateTpd: 50.0,
  steamQualityPercent: 75.0,
  steamInjectionTemperatureC: 300.0,
  soakDurationDays: 7.0,
  waterCutPercent: 20.0,
  vfdFrequencyHz: 50.0,
  spm: 8.0,
  strokeLengthMeters: 2.5,
};
