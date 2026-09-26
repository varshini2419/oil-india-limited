import type { RiskEvidence } from './types';

export interface RiskInputValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRiskEvidence(evidence: Partial<RiskEvidence>): RiskInputValidationResult {
  const errors: string[] = [];

  if (evidence.temperatureC !== undefined && (evidence.temperatureC < 0 || evidence.temperatureC > 300)) {
    errors.push(`Reservoir temperature (${evidence.temperatureC}°C) out of physical bounds [0 - 300°C].`);
  }

  if (evidence.viscosityCp !== undefined && evidence.viscosityCp <= 0) {
    errors.push(`Heavy-oil viscosity (${evidence.viscosityCp} cP) must be strictly positive.`);
  }

  if (evidence.vfdFrequencyHz !== undefined && (evidence.vfdFrequencyHz < 10 || evidence.vfdFrequencyHz > 70)) {
    errors.push(`VFD frequency (${evidence.vfdFrequencyHz} Hz) out of physical equipment bounds [10 - 70 Hz].`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
