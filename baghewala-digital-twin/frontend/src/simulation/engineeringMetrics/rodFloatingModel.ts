export type RodFloatingRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RodFloatingInputs {
  viscosityCp: number;
  spm: number;
  strokeLengthM: number;
  rodStringWeightLbs?: number;
  pumpFillFraction?: number;
}

export interface RodFloatingResult {
  rodFloatingIndex: number;
  riskLevel: RodFloatingRisk;
  impactLoadingIndex: number;
  pumpFillEfficiency: number;
  cause: string;
  assumptions: string[];
  provenance: 'MODELED';
}

const DEFAULT_ROD_STRING_WEIGHT_LBS = 12_000;
const DEFAULT_PUMP_FILL_FRACTION = 0.82;

export function rodFloatingModel(inputs: RodFloatingInputs): RodFloatingResult {
  const viscosityPenalty = Math.min(42, Math.max(0, (inputs.viscosityCp - 2_000) / 700));
  const speedPenalty = Math.max(0, inputs.spm - 8) * 3.2;
  const fillFraction = inputs.pumpFillFraction ?? Math.max(0.45, Math.min(0.98, DEFAULT_PUMP_FILL_FRACTION - viscosityPenalty / 160 - speedPenalty / 220));
  const pumpFillEfficiency = Math.round(fillFraction * 1000) / 10;
  const rodWeight = inputs.rodStringWeightLbs ?? DEFAULT_ROD_STRING_WEIGHT_LBS;
  const weightFactor = Math.min(12, Math.max(0, (rodWeight - DEFAULT_ROD_STRING_WEIGHT_LBS) / 1_000));
  const rodFloatingIndex = Math.round(Math.min(100, Math.max(0, viscosityPenalty + speedPenalty + (1 - fillFraction) * 75 + weightFactor)));
  const impactLoadingIndex = Math.round(Math.min(100, Math.max(0, rodFloatingIndex * 0.72 + Math.max(0, inputs.strokeLengthM - 2.5) * 9)));
  const riskLevel: RodFloatingRisk = rodFloatingIndex >= 80 ? 'CRITICAL' : rodFloatingIndex >= 60 ? 'HIGH' : rodFloatingIndex >= 35 ? 'MODERATE' : 'LOW';

  return {
    rodFloatingIndex,
    riskLevel,
    impactLoadingIndex,
    pumpFillEfficiency,
    cause: rodFloatingIndex >= 35
      ? 'Cooling raises viscosity and reduces pump fill while speed and stroke demand remain high.'
      : 'Pump fill remains adequate for the modeled viscosity and pumping speed.',
    assumptions: [
      `Rod string weight assumed ${rodWeight.toLocaleString()} lb`,
      `Pump fill input assumed ${(fillFraction * 100).toFixed(1)}% when telemetry is unavailable`,
    ],
    provenance: 'MODELED',
  };
}
