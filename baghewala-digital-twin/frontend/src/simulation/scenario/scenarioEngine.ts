import type {
  Scenario,
  ScenarioInputValues,
  ParameterDelta,
} from './types';
import { BASELINE_INPUT_VALUES } from './defaults';
import { validateScenarioInputs } from './validation';

export const loadBaseline = (): Scenario => {
  const inputs = { ...BASELINE_INPUT_VALUES };
  const validation = validateScenarioInputs(inputs);

  return {
    id: 'BAGHEWALA_BASELINE',
    name: 'Baghewala Reference Baseline',
    description: 'Immutable reference operational state of Baghewala Jodhpur Sandstone well BGW-REP-01.',
    fieldId: 'Baghewala Field',
    wellId: 'BGW-REP-01',
    reservoirId: 'Jodhpur Sandstone',
    baseScenarioId: 'BAGHEWALA_BASELINE',
    inputs,
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
    status: validation.isValid ? 'READY_FOR_SIMULATION' : 'INVALID',
    validation,
    isPreset: true,
  };
};

export const createScenario = (
  name: string,
  description: string,
  inputs: ScenarioInputValues = { ...BASELINE_INPUT_VALUES }
): Scenario => {
  const validation = validateScenarioInputs(inputs);
  const now = new Date().toISOString();

  return {
    id: `SCENARIO_${Date.now()}`,
    name,
    description,
    fieldId: 'Baghewala Field',
    wellId: 'BGW-REP-01',
    reservoirId: 'Jodhpur Sandstone',
    baseScenarioId: 'BAGHEWALA_BASELINE',
    inputs: { ...inputs },
    createdAt: now,
    updatedAt: now,
    status: validation.isValid ? 'READY_FOR_SIMULATION' : 'INVALID',
    validation,
    isPreset: false,
  };
};

export const cloneScenario = (source: Scenario, newName?: string): Scenario => {
  const name = newName || `${source.name} (Copy)`;
  return createScenario(name, `Cloned from ${source.name}`, { ...source.inputs });
};

export const updateScenario = (
  scenario: Scenario,
  partialInputs: Partial<ScenarioInputValues>,
  name?: string,
  description?: string
): Scenario => {
  const updatedInputs: ScenarioInputValues = {
    ...scenario.inputs,
    ...partialInputs,
  };

  const validation = validateScenarioInputs(updatedInputs);
  const now = new Date().toISOString();

  return {
    ...scenario,
    name: name !== undefined ? name : scenario.name,
    description: description !== undefined ? description : scenario.description,
    inputs: updatedInputs,
    updatedAt: now,
    status: validation.isValid ? 'READY_FOR_SIMULATION' : 'INVALID',
    validation,
  };
};

export const compareScenarios = (
  baselineInputs: ScenarioInputValues,
  currentInputs: ScenarioInputValues
): ParameterDelta[] => {
  const parameterMap: { key: keyof ScenarioInputValues; label: string; unit: string }[] = [
    { key: 'ambientTemperatureC', label: 'Ambient Temperature', unit: '°C' },
    { key: 'reservoirTemperatureC', label: 'Reservoir Temperature', unit: '°C' },
    { key: 'steamInjectionRateTpd', label: 'Steam Injection Rate', unit: 't/day' },
    { key: 'steamQualityPercent', label: 'Steam Quality', unit: '%' },
    { key: 'soakDurationDays', label: 'Soak Duration', unit: 'days' },
    { key: 'vfdFrequencyHz', label: 'VFD Frequency', unit: 'Hz' },
    { key: 'spm', label: 'Strokes Per Minute (SPM)', unit: 'SPM' },
    { key: 'strokeLengthMeters', label: 'Stroke Length', unit: 'm' },
  ];

  return parameterMap.map((item) => {
    const baseVal = baselineInputs[item.key] ?? 0;
    const currVal = currentInputs[item.key] ?? 0;
    const delta = Number((currVal - baseVal).toFixed(2));

    return {
      parameter: item.key,
      label: item.label,
      unit: item.unit,
      baselineValue: baseVal,
      scenarioValue: currVal,
      delta,
      hasChanged: Math.abs(delta) > 0.001,
    };
  });
};

export const serializeScenario = (scenario: Scenario): string => {
  return JSON.stringify(scenario, null, 2);
};
