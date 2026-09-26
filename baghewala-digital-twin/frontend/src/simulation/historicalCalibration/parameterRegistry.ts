import type { CalibrationParameter, ModelMode } from './types';
import { INITIAL_CANDIDATE_PARAMETERS } from './defaults';

let activeModelMode: ModelMode = 'BASELINE';

let parameterRegistryMap: Map<string, CalibrationParameter> = new Map(
  INITIAL_CANDIDATE_PARAMETERS.map((param) => [param.id, { ...param }])
);

export function getActiveModelMode(): ModelMode {
  return activeModelMode;
}

export function setActiveModelMode(mode: ModelMode): void {
  activeModelMode = mode;
}

export function getParameterRegistry(): CalibrationParameter[] {
  return Array.from(parameterRegistryMap.values());
}

export function getParameterById(id: string): CalibrationParameter | undefined {
  return parameterRegistryMap.get(id);
}

export function updateParameterInRegistry(updatedParam: CalibrationParameter): void {
  parameterRegistryMap.set(updatedParam.id, { ...updatedParam });
}

export function resetParameterRegistryToBaseline(): void {
  activeModelMode = 'BASELINE';
  parameterRegistryMap = new Map(
    INITIAL_CANDIDATE_PARAMETERS.map((param) => [param.id, { ...param }])
  );
}
