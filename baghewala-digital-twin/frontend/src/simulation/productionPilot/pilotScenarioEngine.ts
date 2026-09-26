import type { PilotScenarioConfig, PilotScenarioId } from './types';
import { PILOT_SCENARIOS } from './defaults';

export function getPilotScenarioById(id: PilotScenarioId): PilotScenarioConfig {
  const found = PILOT_SCENARIOS.find((s) => s.id === id);
  if (found) return { ...found };
  return { ...PILOT_SCENARIOS[0] };
}

export function getAllPilotScenarios(): PilotScenarioConfig[] {
  return PILOT_SCENARIOS.map((s) => ({ ...s }));
}
