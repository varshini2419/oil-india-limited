import type {
  UncertaintyParameter,
  SampledScenarioInputs,
  SensitivityResult,
  SensitivityStep,
  TornadoEntry,
} from './types';
import { evaluateSamplePipeline } from './scenarioSampler';

export function createBaselineInputs(parameters: UncertaintyParameter[]): SampledScenarioInputs {
  const pMap = new Map(parameters.map((p) => [p.id, p.baselineValue]));

  return {
    reservoirPermeabilityD: pMap.get('PARAM_PERMEABILITY') ?? 2.5,
    reservoirTemperatureC: pMap.get('PARAM_RES_TEMP') ?? 48.0,
    crudeViscosityInputCp: pMap.get('PARAM_CRUDE_VISCOSITY') ?? 15000.0,
    steamInjectionRateTpd: pMap.get('PARAM_STEAM_RATE') ?? 80.0,
    steamInjectionTemperatureC: pMap.get('PARAM_STEAM_TEMP') ?? 300.0,
    steamEffectivenessFactor: pMap.get('PARAM_STEAM_EFFECTIVENESS') ?? 1.0,
    thermalGainCoefficient: pMap.get('PARAM_THERMAL_GAIN_COEFF') ?? 0.2,
    effectiveDrawdownBar: pMap.get('PARAM_DRAWDOWN') ?? 30.0,
    vfdFrequencyHz: pMap.get('PARAM_VFD_FREQ') ?? 50.0,
    spm: pMap.get('PARAM_SPM') ?? 8.0,
    strokeLengthMeters: pMap.get('PARAM_STROKE_LEN') ?? 2.5,
    productivityMobilityCoefficient: pMap.get('PARAM_PROD_COEFF') ?? 250.0,
  };
}

export function computeParameterSensitivity(
  param: UncertaintyParameter,
  baseInputs: SampledScenarioInputs,
  perturbationsPercent: number[] = [-20, -10, 0, 10, 20]
): SensitivityResult {
  const steps: SensitivityStep[] = [];
  const baseVal = param.baselineValue;

  let maxProdDelta = 0.0;
  const baseEval = evaluateSamplePipeline(baseInputs);
  const baseProd = baseEval.productionBopd;

  for (const pPct of perturbationsPercent) {
    const perturbedVal = Number((baseVal * (1.0 + pPct / 100.0)).toFixed(4));
    const clampedVal = Math.min(param.maxAllowed, Math.max(param.minAllowed, perturbedVal));

    const sampleInputs: SampledScenarioInputs = { ...baseInputs };

    if (param.id === 'PARAM_PERMEABILITY') sampleInputs.reservoirPermeabilityD = clampedVal;
    else if (param.id === 'PARAM_RES_TEMP') sampleInputs.reservoirTemperatureC = clampedVal;
    else if (param.id === 'PARAM_CRUDE_VISCOSITY') sampleInputs.crudeViscosityInputCp = clampedVal;
    else if (param.id === 'PARAM_STEAM_RATE') sampleInputs.steamInjectionRateTpd = clampedVal;
    else if (param.id === 'PARAM_STEAM_TEMP') sampleInputs.steamInjectionTemperatureC = clampedVal;
    else if (param.id === 'PARAM_STEAM_EFFECTIVENESS') sampleInputs.steamEffectivenessFactor = clampedVal;
    else if (param.id === 'PARAM_THERMAL_GAIN_COEFF') sampleInputs.thermalGainCoefficient = clampedVal;
    else if (param.id === 'PARAM_DRAWDOWN') sampleInputs.effectiveDrawdownBar = clampedVal;
    else if (param.id === 'PARAM_VFD_FREQ') sampleInputs.vfdFrequencyHz = clampedVal;
    else if (param.id === 'PARAM_SPM') sampleInputs.spm = clampedVal;
    else if (param.id === 'PARAM_STROKE_LEN') sampleInputs.strokeLengthMeters = clampedVal;
    else if (param.id === 'PARAM_PROD_COEFF') sampleInputs.productivityMobilityCoefficient = clampedVal;

    const evalResult = evaluateSamplePipeline(sampleInputs);
    const prodDelta = Math.abs(evalResult.productionBopd - baseProd);
    if (prodDelta > maxProdDelta) {
      maxProdDelta = prodDelta;
    }

    steps.push({
      perturbationPercent: pPct,
      parameterValue: clampedVal,
      temperatureC: evalResult.temperatureC,
      viscosityCp: evalResult.viscosityCp,
      mobilityDcP: evalResult.mobilityDcP,
      productionBopd: evalResult.productionBopd,
      srpLoadIndex: evalResult.srpLoadIndex,
      riskScore: evalResult.riskScore,
    });
  }

  return {
    parameterId: param.id,
    parameterName: param.name,
    steps,
    maxOutputDelta: Number(maxProdDelta.toFixed(2)),
    normalizedSensitivity: 0, // Assigned after sorting
    rank: 0,
    provenanceLabel: param.provenanceLabel,
  };
}

export function runFullSensitivityAnalysis(
  parameters: UncertaintyParameter[]
): {
  sensitivityResults: SensitivityResult[];
  tornadoEntries: TornadoEntry[];
} {
  const baseInputs = createBaselineInputs(parameters);
  const baseEval = evaluateSamplePipeline(baseInputs);
  const baseProd = baseEval.productionBopd;

  const rawResults: SensitivityResult[] = [];
  const tornadoEntries: TornadoEntry[] = [];

  for (const param of parameters) {
    const sens = computeParameterSensitivity(param, baseInputs);
    rawResults.push(sens);

    // Compute Tornado Entry (-20% vs +20%)
    const stepMinus20 = sens.steps.find((s) => s.perturbationPercent === -20) ?? sens.steps[0];
    const stepPlus20 = sens.steps.find((s) => s.perturbationPercent === 20) ?? sens.steps[sens.steps.length - 1];

    const lowOut = stepMinus20.productionBopd;
    const highOut = stepPlus20.productionBopd;
    const range = Number(Math.abs(highOut - lowOut).toFixed(2));

    tornadoEntries.push({
      parameterId: param.id,
      parameterName: param.name,
      baselineOutput: baseProd,
      lowValueOutput: lowOut,
      highValueOutput: highOut,
      negativeEffect: Number((lowOut - baseProd).toFixed(2)),
      positiveEffect: Number((highOut - baseProd).toFixed(2)),
      totalRange: range,
      normalizedSensitivity: 0,
    });
  }

  // Sort and assign rankings
  const maxRange = Math.max(...tornadoEntries.map((t) => t.totalRange), 0.001);

  tornadoEntries.sort((a, b) => b.totalRange - a.totalRange);

  tornadoEntries.forEach((entry) => {
    entry.normalizedSensitivity = Number((entry.totalRange / maxRange).toFixed(3));
  });

  rawResults.sort((a, b) => b.maxOutputDelta - a.maxOutputDelta);

  rawResults.forEach((res, idx) => {
    res.rank = idx + 1;
    res.normalizedSensitivity = Number((res.maxOutputDelta / (maxRange || 1)).toFixed(3));
  });

  return {
    sensitivityResults: rawResults,
    tornadoEntries,
  };
}
