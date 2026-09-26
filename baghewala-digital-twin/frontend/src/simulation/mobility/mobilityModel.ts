import type {
  MobilityResult,
  MobilityStatus,
  MobilityConfidence,
  MobilityBreakdown,
  MobilityComparisonRow,
} from './types';
import {
  DEFAULT_PERMEABILITY_DARCY,
  DEFAULT_RELATIVE_PERMEABILITY_OIL,
} from './defaults';
import { validateMobilityInputs } from './validation';

export const calculateMobilityModel = (
  viscosityCp: number,
  temperatureC: number,
  permeabilityD: number = DEFAULT_PERMEABILITY_DARCY,
  relativePermeability: number = DEFAULT_RELATIVE_PERMEABILITY_OIL,
  baselineViscosityCp?: number
): MobilityResult => {
  const validation = validateMobilityInputs(viscosityCp, permeabilityD, relativePermeability);
  const warnings: string[] = [...validation.warnings];

  // Handle invalid input safely
  if (!validation.isValid) {
    const fallbackMobility = 0.0001;
    return {
      mobilityDcP: fallbackMobility,
      mobilityUnit: 'D/cP',
      baselineMobilityDcP: fallbackMobility,
      mobilityDeltaDcP: 0.0,
      mobilityChangePercent: 0.0,
      viscosityCp: Math.max(1.0, viscosityCp || 15000.0),
      permeabilityD: Math.max(0.0, permeabilityD || 2.5),
      relativePermeability: Math.max(0.0, Math.min(1.0, relativePermeability || 1.0)),
      effectivePermeabilityD: 2.5,
      temperatureC: temperatureC || 48.0,
      status: 'INVALID',
      confidence: 'LOW',
      modelType: 'Conceptual Single-Phase Darcy Oil Mobility Model',
      warnings: validation.errors,
      breakdown: {
        temperatureC: temperatureC || 48.0,
        viscosityCp: viscosityCp || 15000.0,
        permeabilityD: permeabilityD || 2.5,
        relativePermeability: relativePermeability || 1.0,
        effectivePermeabilityD: 2.5,
        mobilityDcP: fallbackMobility,
        baselineMobilityDcP: fallbackMobility,
        mobilityDeltaDcP: 0.0,
        mobilityChangePercent: 0.0,
      },
      inputSources: {
        permeability: 'documented',
        viscosity: 'derived',
        relativePermeability: 'assumption',
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  // Calculate effective permeability & oil mobility
  const effectivePermeabilityD = Number((permeabilityD * relativePermeability).toFixed(4));
  const mobilityDcP = Number((effectivePermeabilityD / viscosityCp).toFixed(6));

  // Baseline calculation
  const refBaselineVisc = baselineViscosityCp ?? viscosityCp;
  const baselineMobilityDcP = Number((effectivePermeabilityD / Math.max(0.1, refBaselineVisc)).toFixed(6));

  const mobilityDeltaDcP = Number((mobilityDcP - baselineMobilityDcP).toFixed(6));

  let mobilityChangePercent = 0.0;
  if (baselineMobilityDcP > 0) {
    mobilityChangePercent = Number((((mobilityDcP - baselineMobilityDcP) / baselineMobilityDcP) * 100).toFixed(1));
  }

  // Determine Status & Confidence
  const status: MobilityStatus = warnings.length > 0 ? 'WARNING' : 'VALID';
  const confidence: MobilityConfidence = relativePermeability === 1.0 ? 'MEDIUM' : 'HIGH';

  const breakdown: MobilityBreakdown = {
    temperatureC: Number(temperatureC.toFixed(1)),
    viscosityCp: Number(viscosityCp.toFixed(1)),
    permeabilityD: Number(permeabilityD.toFixed(2)),
    relativePermeability: Number(relativePermeability.toFixed(2)),
    effectivePermeabilityD,
    mobilityDcP,
    baselineMobilityDcP,
    mobilityDeltaDcP,
    mobilityChangePercent,
  };

  return {
    mobilityDcP,
    mobilityUnit: 'D/cP',
    baselineMobilityDcP,
    mobilityDeltaDcP,
    mobilityChangePercent,
    viscosityCp: Number(viscosityCp.toFixed(1)),
    permeabilityD: Number(permeabilityD.toFixed(2)),
    relativePermeability: Number(relativePermeability.toFixed(2)),
    effectivePermeabilityD,
    temperatureC: Number(temperatureC.toFixed(1)),
    status,
    confidence,
    modelType: 'Conceptual Single-Phase Darcy Oil Mobility Model',
    warnings,
    breakdown,
    inputSources: {
      permeability: 'documented',
      viscosity: 'derived',
      relativePermeability: 'assumption',
    },
    calculatedAt: new Date().toISOString(),
  };
};

export const compareMobilityResults = (
  baselineResult: MobilityResult,
  scenarioResult: MobilityResult
): MobilityComparisonRow[] => {
  return [
    {
      parameter: 'Reservoir Permeability',
      unit: 'D',
      baselineValue: baselineResult.permeabilityD,
      scenarioValue: scenarioResult.permeabilityD,
      delta: Number((scenarioResult.permeabilityD - baselineResult.permeabilityD).toFixed(2)),
      percentChange: 0,
      sourceType: 'documented',
    },
    {
      parameter: 'Effective Permeability',
      unit: 'D',
      baselineValue: baselineResult.effectivePermeabilityD,
      scenarioValue: scenarioResult.effectivePermeabilityD,
      delta: Number((scenarioResult.effectivePermeabilityD - baselineResult.effectivePermeabilityD).toFixed(2)),
      percentChange: 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Oil Mobility (λ_o)',
      unit: 'D/cP',
      baselineValue: baselineResult.mobilityDcP,
      scenarioValue: scenarioResult.mobilityDcP,
      delta: scenarioResult.mobilityDeltaDcP,
      percentChange: scenarioResult.mobilityChangePercent,
      sourceType: 'derived',
    },
  ];
};
