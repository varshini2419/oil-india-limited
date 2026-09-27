import { createScenario } from '../scenario/scenarioEngine';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { optimizeSRP } from '../srpOptimization/optimizationEngine';
import { optimizeCSS } from '../cssOptimization/optimizationEngine';
import { analyzeAIRisk } from '../riskEngine/recommendationEngine';
import { validateSampledInputs } from './validation';
import type {
  UncertaintyParameter,
  UncertaintyConfiguration,
  SampledScenarioInputs,
  UncertaintySample,
} from './types';

// Deterministic Mulberry32 Pseudo-Random Number Generator
export function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleParameterValue(param: UncertaintyParameter, prng: () => number): number {
  const rand = prng(); // uniformly distributed between 0.0 and 1.0

  let lowBound = param.minAllowed;
  let highBound = param.maxAllowed;

  if (param.uncertaintyType === 'PERCENTAGE') {
    const deltaFraction = param.uncertaintyValue / 100.0;
    lowBound = Math.max(param.minAllowed, param.baselineValue * (1.0 - deltaFraction));
    highBound = Math.min(param.maxAllowed, param.baselineValue * (1.0 + deltaFraction));
  } else if (param.uncertaintyType === 'ABSOLUTE_RANGE') {
    lowBound = Math.max(param.minAllowed, param.baselineValue - param.uncertaintyValue);
    highBound = Math.min(param.maxAllowed, param.baselineValue + param.uncertaintyValue);
  }

  const sampledRaw = lowBound + rand * (highBound - lowBound);
  return Number(sampledRaw.toFixed(4));
}

export function evaluateSamplePipeline(inputs: SampledScenarioInputs): {
  temperatureC: number;
  viscosityCp: number;
  mobilityDcP: number;
  productionBopd: number;
  srpLoadIndex: number;
  cssPerformanceScore: number;
  riskLevel: UncertaintySample['riskLevel'];
  riskScore: number;
} {
  // Construct transient scenario for Step 4.3 Thermal Model
  const tempScenario = createScenario(
    'UNCERTAINTY_SAMPLE',
    'Transient scenario for Monte Carlo uncertainty evaluation',
    {
      ...BASELINE_INPUT_VALUES,
      ambientTemperatureC: 35.0,
      reservoirTemperatureC: inputs.reservoirTemperatureC,
      steamInjectionRateTpd: inputs.steamInjectionRateTpd,
      steamQualityPercent: 75.0,
      soakDurationDays: 7.0,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
    }
  );

  // 1. Step 4.3 Thermal Model
  const thermalResult = calculateThermalModel(tempScenario);

  // Apply thermal gain coefficient & steam effectiveness scaling if modified
  const scaledThermalGain = thermalResult.thermalInfluenceC * inputs.steamEffectivenessFactor * (inputs.thermalGainCoefficient / 0.2);
  const predictedTemp = Number((inputs.reservoirTemperatureC + scaledThermalGain).toFixed(1));

  // 2. Step 4.4 Viscosity Model
  const viscosityResult = calculateViscosityModel(predictedTemp, inputs.reservoirTemperatureC);
  // Scale viscosity proportionally to initial crude viscosity input ratio
  const viscRatio = inputs.crudeViscosityInputCp / 15000.0;
  const estimatedVisc = Number((viscosityResult.estimatedViscosityCp * viscRatio).toFixed(1));

  // 3. Step 4.5 Mobility Model
  const mobilityResult = calculateMobilityModel(
    estimatedVisc,
    predictedTemp,
    inputs.reservoirPermeabilityD,
    1.0,
    inputs.crudeViscosityInputCp
  );

  // 4. Step 4.6 Production Model
  // Custom J_o = C_prod * mobility
  const customProdIndex = inputs.productivityMobilityCoefficient * mobilityResult.mobilityDcP;
  const normSpm = inputs.spm / 8.0;
  const normStroke = inputs.strokeLengthMeters / 2.5;
  const normVfd = Math.sqrt(Math.max(0.1, inputs.vfdFrequencyHz / 50.0));
  const pumpFactor = Math.min(2.5, Math.max(0.2, normSpm * normStroke * normVfd));

  const unconstrainedFlow = customProdIndex * inputs.effectiveDrawdownBar;
  const rawProduction = unconstrainedFlow * pumpFactor;
  const estimatedProdBopd = Number(Math.min(5000.0, Math.max(0.0, rawProduction)).toFixed(2));

  // 5. Step 4.7 SRP Optimization
  const srpResult = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: mobilityResult.mobilityDcP,
    effectiveDrawdownBar: inputs.effectiveDrawdownBar,
    temperatureC: predictedTemp,
    viscosityCp: estimatedVisc,
  });

  // 6. Step 4.8 CSS Optimization
  const cssResult = optimizeCSS({
    steamInjectionRateTpd: inputs.steamInjectionRateTpd,
    steamInjectionTemperatureC: inputs.steamInjectionTemperatureC,
    steamQualityFraction: 0.75,
    injectionDurationDays: 5.0,
    soakDurationDays: 7.0,
    productionDurationDays: 90.0,
    reservoirTemperatureC: predictedTemp,
    reservoirPressureBar: 90.0,
    baselineViscosityCp: inputs.crudeViscosityInputCp,
    baselineMobilityDPerCp: mobilityResult.baselineMobilityDcP,
    baselineProductionBopd: 0.75,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthMeters: inputs.strokeLengthMeters,
  });

  // 7. Step 4.9 AI Risk Engine
  const riskResult = analyzeAIRisk({
    temperatureC: predictedTemp,
    viscosityCp: estimatedVisc,
    mobilityDPerCp: mobilityResult.mobilityDcP,
    productionBopd: estimatedProdBopd,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthMeters: inputs.strokeLengthMeters,
    steamInjectionRateTpd: inputs.steamInjectionRateTpd,
    srpLoadIndex: srpResult.currentCandidate.loadIndex,
    cssThermalGainC: cssResult.thermalBreakdown.deltaTemperatureC,
  });

  return {
    temperatureC: predictedTemp,
    viscosityCp: estimatedVisc,
    mobilityDcP: mobilityResult.mobilityDcP,
    productionBopd: estimatedProdBopd,
    srpLoadIndex: srpResult.currentCandidate.loadIndex,
    cssPerformanceScore: cssResult.currentCandidate.efficiencyScore,
    riskLevel: riskResult.riskLevel,
    riskScore: riskResult.riskScore,
  };
}

export function runMonteCarloSampling(config: UncertaintyConfiguration): UncertaintySample[] {
  const prng = createMulberry32(config.seed);
  const samples: UncertaintySample[] = [];

  const paramMap = new Map<string, UncertaintyParameter>(config.parameters.map((p) => [p.id, p]));

  const getParam = (id: string, defaultVal: number) => {
    const p = paramMap.get(id);
    return p ? sampleParameterValue(p, prng) : defaultVal;
  };

  for (let i = 0; i < config.sampleCount; i++) {
    const inputs: SampledScenarioInputs = {
      reservoirPermeabilityD: getParam('PARAM_PERMEABILITY', 2.5),
      reservoirTemperatureC: getParam('PARAM_RES_TEMP', 48.0),
      crudeViscosityInputCp: getParam('PARAM_CRUDE_VISCOSITY', 15000.0),
      steamInjectionRateTpd: getParam('PARAM_STEAM_RATE', 80.0),
      steamInjectionTemperatureC: getParam('PARAM_STEAM_TEMP', 300.0),
      steamEffectivenessFactor: getParam('PARAM_STEAM_EFFECTIVENESS', 1.0),
      thermalGainCoefficient: getParam('PARAM_THERMAL_GAIN_COEFF', 0.2),
      effectiveDrawdownBar: getParam('PARAM_DRAWDOWN', 30.0),
      vfdFrequencyHz: getParam('PARAM_VFD_FREQ', 50.0),
      spm: getParam('PARAM_SPM', 8.0),
      strokeLengthMeters: getParam('PARAM_STROKE_LEN', 2.5),
      productivityMobilityCoefficient: getParam('PARAM_PROD_COEFF', 250.0),
    };

    const pVal = validateSampledInputs(inputs);
    if (!pVal.isValid) {
      continue; // Skip invalid sample safely
    }

    const outputs = evaluateSamplePipeline(inputs);

    samples.push({
      sampleIndex: i + 1,
      inputs,
      ...outputs,
    });
  }

  return samples;
}
