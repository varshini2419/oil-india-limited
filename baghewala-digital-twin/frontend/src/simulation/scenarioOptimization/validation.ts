import type {
  DecisionConstraint,
  ScenarioCandidate,
  ScenarioStatus,
} from './types';

export interface ConstraintCheckResult {
  isFeasible: boolean;
  status: ScenarioStatus;
  violations: string[];
  warnings: string[];
}

export function validateDecisionConstraints(constraints: DecisionConstraint): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (constraints.maxVfdHz < 10 || constraints.maxVfdHz > 80) {
    errors.push(`maxVfdHz (${constraints.maxVfdHz}) must be between 10 and 80 Hz.`);
  }

  if (constraints.maxSpm < 1 || constraints.maxSpm > 20) {
    errors.push(`maxSpm (${constraints.maxSpm}) must be between 1 and 20 SPM.`);
  }

  if (constraints.maxStrokeM < 0.5 || constraints.maxStrokeM > 6.0) {
    errors.push(`maxStrokeM (${constraints.maxStrokeM}) must be between 0.5 and 6.0 m.`);
  }

  if (constraints.maxSteamRateTpd < 0 || constraints.maxSteamRateTpd > 1000) {
    errors.push(`maxSteamRateTpd (${constraints.maxSteamRateTpd}) must be between 0 and 1000 TPD.`);
  }

  if (constraints.maxLoadIndex < 0 || constraints.maxLoadIndex > 100) {
    errors.push(`maxLoadIndex (${constraints.maxLoadIndex}) must be between 0 and 100.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function evaluateScenarioConstraints(
  candidate: ScenarioCandidate,
  outputs: {
    temperatureC: number;
    viscosityCp: number;
    estimatedProductionBopd: number;
    srpLoadIndex: number;
    riskLevel: string;
  },
  constraints: DecisionConstraint
): ConstraintCheckResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  const inputs = candidate.inputs;

  // 1. Hard Constraints
  if (inputs.vfdFrequencyHz > constraints.maxVfdHz) {
    violations.push(`VFD Frequency (${inputs.vfdFrequencyHz} Hz) exceeds limit (${constraints.maxVfdHz} Hz).`);
  }

  if (inputs.spm > constraints.maxSpm) {
    violations.push(`Pumping speed (${inputs.spm} SPM) exceeds limit (${constraints.maxSpm} SPM).`);
  }

  if (inputs.strokeLengthMeters > constraints.maxStrokeM) {
    violations.push(`Stroke length (${inputs.strokeLengthMeters} m) exceeds limit (${constraints.maxStrokeM} m).`);
  }

  if (inputs.steamInjectionRateTpd > constraints.maxSteamRateTpd) {
    violations.push(`Steam injection rate (${inputs.steamInjectionRateTpd} TPD) exceeds limit (${constraints.maxSteamRateTpd} TPD).`);
  }

  if (outputs.srpLoadIndex > constraints.maxLoadIndex) {
    violations.push(`SRP Load Index (${outputs.srpLoadIndex}) exceeds load limit (${constraints.maxLoadIndex}).`);
  }

  if (outputs.estimatedProductionBopd < constraints.minProductionBopd) {
    violations.push(`Estimated production (${outputs.estimatedProductionBopd} BOPD) below minimum requirement (${constraints.minProductionBopd} BOPD).`);
  }

  if (outputs.viscosityCp > constraints.maxViscosityCp) {
    violations.push(`Modeled viscosity (${outputs.viscosityCp} cP) exceeds maximum bound (${constraints.maxViscosityCp} cP).`);
  }

  if (outputs.temperatureC < constraints.minTemperatureC) {
    violations.push(`Modeled temperature (${outputs.temperatureC} °C) below minimum required (${constraints.minTemperatureC} °C).`);
  }

  // Risk Level constraint
  const riskSeverityMap: Record<string, number> = {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  const currentRiskSev = riskSeverityMap[outputs.riskLevel] ?? 1;
  const maxRiskSev = riskSeverityMap[constraints.maxRiskLevel] ?? 3;

  if (currentRiskSev > maxRiskSev) {
    violations.push(`Risk Level (${outputs.riskLevel}) exceeds maximum allowed risk threshold (${constraints.maxRiskLevel}).`);
  }

  // 2. Soft Warnings
  if (outputs.srpLoadIndex > 75.0 && outputs.srpLoadIndex <= constraints.maxLoadIndex) {
    warnings.push(`Elevated SRP Load Index (${outputs.srpLoadIndex}) — monitor mechanical rod fatigue.`);
  }

  if (outputs.riskLevel === 'HIGH' && maxRiskSev >= 3) {
    warnings.push('High operational risk level detected — caution advised.');
  }

  const isFeasible = violations.length === 0;

  let status: ScenarioStatus = 'SAFE';
  if (!isFeasible) {
    status = 'OUT_OF_RANGE';
  } else if (outputs.riskLevel === 'HIGH' || outputs.srpLoadIndex > 75.0 || warnings.length > 0) {
    status = 'CAUTION';
  }

  return {
    isFeasible,
    status,
    violations,
    warnings,
  };
}
