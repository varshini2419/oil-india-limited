import type { Scenario } from '../scenario/types';
import type {
  ThermalResult,
  ThermalModelParams,
  ThermalBreakdown,
  ThermalState,
  ThermalConfidence,
  ThermalComparisonRow,
} from './types';
import { DEFAULT_THERMAL_MODEL_PARAMS, THERMAL_MODEL_ASSUMPTIONS } from './constants';
import { validateThermalInputs } from './thermalValidation';
import { JODHPUR_RESERVOIR_PROFILE } from '../../data/baghewala';

export const calculateThermalModel = (
  scenario: Scenario,
  customParams?: Partial<ThermalModelParams>
): ThermalResult => {
  const params: ThermalModelParams = {
    ...DEFAULT_THERMAL_MODEL_PARAMS,
    ...customParams,
  };

  const validation = validateThermalInputs(scenario);
  const warnings: string[] = [...validation.warnings];

  // Baseline reservoir temperature from Baghewala documented dataset (48.0°C)
  const baselineReservoirTemperatureC = JODHPUR_RESERVOIR_PROFILE.reservoirTemperatureC.value ?? 48.0;
  const scenarioReservoirTemperatureC = scenario.inputs.reservoirTemperatureC;
  const ambientTemperatureC = scenario.inputs.ambientTemperatureC;
  const steamInjectionRateTpd = scenario.inputs.steamInjectionRateTpd;
  const steamQualityPercent = scenario.inputs.steamQualityPercent;
  const soakDurationDays = scenario.inputs.soakDurationDays;

  // 1. Surface Equipment Context
  const surfaceEquipmentTemperatureC = ambientTemperatureC + params.ambientSurfaceOffsetC;

  // 2. Steam Contribution
  const steamTemperatureC = params.steamGeneratorTempC;
  const effectiveSteamDeltaC = Math.max(0, steamTemperatureC - baselineReservoirTemperatureC);
  
  const steamQualityFraction = Math.max(0, Math.min(1.0, steamQualityPercent / 100.0));
  const normalizedSteamRate = Math.min(1.5, steamInjectionRateTpd / params.referenceSteamRateTpd);
  const steamEnergyFactor = normalizedSteamRate * steamQualityFraction;

  const maxSteamInfluenceC = effectiveSteamDeltaC * params.thermalResponseFactorK * steamEnergyFactor;

  // 3. Time / Soak Response
  let timeResponseFactor = 0.0;
  if (steamInjectionRateTpd > 0) {
    const timeRatio = Math.max(0, soakDurationDays) / Math.max(0.1, params.timeConstantTauDays);
    timeResponseFactor = 1.0 - Math.exp(-timeRatio);
  }
  const timeResponsePercent = Number((timeResponseFactor * 100).toFixed(1));

  // 4. Ambient Weather Coupling (Minimal impact on reservoir)
  const ambientDeltaFromRef = ambientTemperatureC - 35.0; // 35°C baseline ambient reference
  const ambientReservoirInfluenceC = ambientDeltaFromRef * params.ambientReservoirCoupling;

  // 5. Net Modeled Thermal Influence & Predicted Reservoir Temperature
  const modeledThermalInfluenceC = (maxSteamInfluenceC * timeResponseFactor) + ambientReservoirInfluenceC;
  
  let rawPredictedTemp = (scenarioReservoirTemperatureC ?? baselineReservoirTemperatureC) + modeledThermalInfluenceC;

  // Check bounds
  let predictedReservoirTemperatureC = rawPredictedTemp;
  if (rawPredictedTemp > params.maxTempBoundC) {
    predictedReservoirTemperatureC = params.maxTempBoundC;
    warnings.push(`Modeled predicted temperature (${rawPredictedTemp.toFixed(1)}°C) exceeded upper prototype bound (${params.maxTempBoundC}°C) and was clamped.`);
  } else if (rawPredictedTemp < params.minTempBoundC) {
    predictedReservoirTemperatureC = params.minTempBoundC;
    warnings.push(`Modeled predicted temperature (${rawPredictedTemp.toFixed(1)}°C) fell below minimum prototype bound (${params.minTempBoundC}°C) and was clamped.`);
  }

  const temperatureChangeC = Number((predictedReservoirTemperatureC - baselineReservoirTemperatureC).toFixed(1));

  // 6. Determine Thermal State
  let thermalState: ThermalState = 'BASELINE';
  if (temperatureChangeC < -2.0) {
    thermalState = 'COOL';
  } else if (Math.abs(temperatureChangeC) <= 2.0) {
    thermalState = 'BASELINE';
  } else if (temperatureChangeC <= 25.0) {
    thermalState = 'WARMING';
  } else if (temperatureChangeC <= 65.0) {
    thermalState = 'HOT';
  } else {
    thermalState = 'HIGH_THERMAL_RESPONSE';
  }

  // 7. Confidence Evaluation
  let confidence: ThermalConfidence = 'HIGH';
  if (steamInjectionRateTpd > 200 || warnings.length > 1) {
    confidence = 'LOW';
  } else if (steamInjectionRateTpd > 0 || Math.abs(ambientDeltaFromRef) > 10) {
    confidence = 'MEDIUM';
  }

  // Breakdown
  const breakdown: ThermalBreakdown = {
    baselineReservoirTempC: Number(baselineReservoirTemperatureC.toFixed(1)),
    ambientTempC: Number(ambientTemperatureC.toFixed(1)),
    surfaceEquipmentTempC: Number(surfaceEquipmentTemperatureC.toFixed(1)),
    steamTemperatureC: Number(steamTemperatureC.toFixed(1)),
    effectiveSteamDeltaC: Number(effectiveSteamDeltaC.toFixed(1)),
    steamEnergyFactor: Number(steamEnergyFactor.toFixed(3)),
    maxSteamInfluenceC: Number(maxSteamInfluenceC.toFixed(1)),
    timeResponsePercent,
    modeledThermalInfluenceC: Number(modeledThermalInfluenceC.toFixed(1)),
    predictedReservoirTempC: Number(predictedReservoirTemperatureC.toFixed(1)),
  };

  const isBaselineScenario = scenario.id === 'BAGHEWALA_BASELINE' || scenario.isPreset;

  return {
    baselineReservoirTemperatureC: Number(baselineReservoirTemperatureC.toFixed(1)),
    scenarioReservoirTemperatureC: Number(scenarioReservoirTemperatureC.toFixed(1)),
    predictedReservoirTemperatureC: Number(predictedReservoirTemperatureC.toFixed(1)),
    ambientTemperatureC: Number(ambientTemperatureC.toFixed(1)),
    surfaceEquipmentTemperatureC: Number(surfaceEquipmentTemperatureC.toFixed(1)),
    steamTemperatureC: Number(steamTemperatureC.toFixed(1)),
    thermalInfluenceC: Number(modeledThermalInfluenceC.toFixed(1)),
    temperatureChangeC,
    thermalState,
    confidence,
    modelType: 'Reduced-Order Thermal Response Model',
    assumptions: THERMAL_MODEL_ASSUMPTIONS,
    warnings,
    breakdown,
    inputSources: {
      baselineTemp: 'documented',
      ambientTemp: isBaselineScenario ? 'documented' : 'scenario',
      steamRate: isBaselineScenario ? 'documented' : 'scenario',
      steamQuality: isBaselineScenario ? 'documented' : 'scenario',
      soakDuration: isBaselineScenario ? 'documented' : 'scenario',
      thermalCoefficients: 'assumption',
    },
    calculatedAt: new Date().toISOString(),
  };
};

export const compareThermalScenarios = (
  baselineResult: ThermalResult,
  scenarioResult: ThermalResult
): ThermalComparisonRow[] => {
  return [
    {
      parameter: 'Ambient Temperature',
      unit: '°C',
      baselineValue: baselineResult.ambientTemperatureC,
      scenarioValue: scenarioResult.ambientTemperatureC,
      delta: Number((scenarioResult.ambientTemperatureC - baselineResult.ambientTemperatureC).toFixed(1)),
      sourceType: scenarioResult.inputSources.ambientTemp,
    },
    {
      parameter: 'Surface Equipment Temperature',
      unit: '°C',
      baselineValue: baselineResult.surfaceEquipmentTemperatureC,
      scenarioValue: scenarioResult.surfaceEquipmentTemperatureC,
      delta: Number((scenarioResult.surfaceEquipmentTemperatureC - baselineResult.surfaceEquipmentTemperatureC).toFixed(1)),
      sourceType: 'derived',
    },
    {
      parameter: 'Steam Thermal Influence',
      unit: '°C',
      baselineValue: baselineResult.thermalInfluenceC,
      scenarioValue: scenarioResult.thermalInfluenceC,
      delta: Number((scenarioResult.thermalInfluenceC - baselineResult.thermalInfluenceC).toFixed(1)),
      sourceType: 'derived',
    },
    {
      parameter: 'Modeled Reservoir Temperature',
      unit: '°C',
      baselineValue: baselineResult.predictedReservoirTemperatureC,
      scenarioValue: scenarioResult.predictedReservoirTemperatureC,
      delta: Number((scenarioResult.predictedReservoirTemperatureC - baselineResult.predictedReservoirTemperatureC).toFixed(1)),
      sourceType: 'derived',
    },
  ];
};
