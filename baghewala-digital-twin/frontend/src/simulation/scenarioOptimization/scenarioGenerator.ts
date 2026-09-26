import type { ScenarioCandidate } from './types';
import type { ModelMode } from '../historicalCalibration/types';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';

export function generateStandardScenarioCandidates(
  modelMode: ModelMode = 'BASELINE'
): ScenarioCandidate[] {
  return [
    {
      id: 'SCENARIO_BASELINE',
      name: 'Baghewala Reference Baseline',
      description: 'Standard baseline operational state for Baghewala Jodhpur Sandstone well BGW-REP-01.',
      scenarioType: 'BASELINE',
      inputs: { ...BASELINE_INPUT_VALUES },
      modelMode,
    },
    {
      id: 'SCENARIO_CSS_FOCUSED',
      name: 'CSS Thermal Intensification',
      description: 'Increased steam injection rate and extended soak duration for heavy crude viscosity reduction.',
      scenarioType: 'CSS_FOCUSED',
      inputs: {
        ...BASELINE_INPUT_VALUES,
        steamInjectionRateTpd: 120.0,
        steamQualityPercent: 80.0,
        soakDurationDays: 10.0,
        vfdFrequencyHz: 50.0,
        spm: 8.0,
        strokeLengthMeters: 2.5,
      },
      modelMode,
    },
    {
      id: 'SCENARIO_SRP_FOCUSED',
      name: 'SRP + VFD Mechanical Optimization',
      description: 'Optimized surface pumping speed, VFD frequency, and stroke length from Step 4.7 grid search.',
      scenarioType: 'SRP_FOCUSED',
      inputs: {
        ...BASELINE_INPUT_VALUES,
        vfdFrequencyHz: 55.0,
        spm: 10.0,
        strokeLengthMeters: 2.8,
        steamInjectionRateTpd: 80.0,
      },
      modelMode,
    },
    {
      id: 'SCENARIO_COMBINED_OPTIMIZATION',
      name: 'Combined CSS + SRP Dual Optimization',
      description: 'Synchronized thermal CSS steam soak paired with optimized SRP surface lift efficiency.',
      scenarioType: 'COMBINED_OPTIMIZATION',
      inputs: {
        ...BASELINE_INPUT_VALUES,
        steamInjectionRateTpd: 100.0,
        steamQualityPercent: 80.0,
        soakDurationDays: 8.0,
        vfdFrequencyHz: 55.0,
        spm: 10.0,
        strokeLengthMeters: 2.8,
      },
      modelMode,
    },
    {
      id: 'SCENARIO_CONSERVATIVE_LOW_RISK',
      name: 'Conservative Low-Risk Operation',
      description: 'Reduced operating VFD frequency and steam rate to minimize mechanical fatigue and thermal stress.',
      scenarioType: 'CONSERVATIVE_LOW_RISK',
      inputs: {
        ...BASELINE_INPUT_VALUES,
        steamInjectionRateTpd: 50.0,
        soakDurationDays: 5.0,
        vfdFrequencyHz: 45.0,
        spm: 6.0,
        strokeLengthMeters: 2.0,
      },
      modelMode,
    },
    {
      id: 'SCENARIO_THERMAL_RECOVERY',
      name: 'Extended Thermal Recovery Soak',
      description: 'Maximum thermal enthalpy input state within validated model limits to evaluate peak viscosity drop.',
      scenarioType: 'THERMAL_RECOVERY',
      inputs: {
        ...BASELINE_INPUT_VALUES,
        steamInjectionRateTpd: 150.0,
        steamQualityPercent: 85.0,
        soakDurationDays: 12.0,
        vfdFrequencyHz: 50.0,
        spm: 8.0,
        strokeLengthMeters: 2.5,
      },
      modelMode,
    },
  ];
}

export function createCustomScenarioCandidate(
  name: string,
  description: string,
  partialInputs: Partial<typeof BASELINE_INPUT_VALUES>,
  modelMode: ModelMode = 'BASELINE'
): ScenarioCandidate {
  return {
    id: `SCENARIO_CUSTOM_${Date.now()}`,
    name,
    description,
    scenarioType: 'CUSTOM',
    inputs: {
      ...BASELINE_INPUT_VALUES,
      ...partialInputs,
    },
    modelMode,
    isCustom: true,
  };
}
