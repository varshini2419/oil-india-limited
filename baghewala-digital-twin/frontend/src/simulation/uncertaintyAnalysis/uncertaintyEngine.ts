import type {
  UncertaintyConfiguration,
  UncertaintyResult,
} from './types';
import {
  DEFAULT_UNCERTAINTY_CONFIG,
  UNCERTAINTY_DISCLAIMER,
} from './defaults';
import { validateUncertaintyConfig } from './validation';
import { runMonteCarloSampling } from './scenarioSampler';
import {
  computeOutputStatistics,
  computeProductionStatistics,
  computeModelCorrelations,
} from './aggregationEngine';
import { runFullSensitivityAnalysis } from './sensitivityEngine';

export function runUncertaintyAnalysis(
  customConfig?: Partial<UncertaintyConfiguration>
): UncertaintyResult {
  const config: UncertaintyConfiguration = {
    sampleCount: customConfig?.sampleCount ?? DEFAULT_UNCERTAINTY_CONFIG.sampleCount,
    seed: customConfig?.seed ?? DEFAULT_UNCERTAINTY_CONFIG.seed,
    parameters: customConfig?.parameters ?? DEFAULT_UNCERTAINTY_CONFIG.parameters,
  };

  const validation = validateUncertaintyConfig(config);

  if (!validation.isValid) {
    const emptyStats = {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      p10: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
    };

    return {
      config,
      samples: [],
      temperatureStats: emptyStats,
      viscosityStats: emptyStats,
      mobilityStats: emptyStats,
      productionStats: {
        ...emptyStats,
        probLessThanOneBopd: 0,
        probGreaterThanBaseline: 0,
        baselineProductionBopd: 0.75,
      },
      srpLoadStats: emptyStats,
      riskScoreStats: emptyStats,
      sensitivityResults: [],
      tornadoEntries: [],
      correlations: [],
      validation,
      calculatedAt: new Date().toISOString(),
      disclaimer: UNCERTAINTY_DISCLAIMER,
    };
  }

  // 1. Monte Carlo Sampling
  const samples = runMonteCarloSampling(config);

  // 2. Statistical Aggregations
  const temperatureStats = computeOutputStatistics(samples.map((s) => s.temperatureC));
  const viscosityStats = computeOutputStatistics(samples.map((s) => s.viscosityCp));
  const mobilityStats = computeOutputStatistics(samples.map((s) => s.mobilityDcP));
  const productionStats = computeProductionStatistics(samples, 0.75);
  const srpLoadStats = computeOutputStatistics(samples.map((s) => s.srpLoadIndex));
  const riskScoreStats = computeOutputStatistics(samples.map((s) => s.riskScore));

  // 3. One-at-a-time Sensitivity Analysis & Tornado Entries
  const { sensitivityResults, tornadoEntries } = runFullSensitivityAnalysis(config.parameters);

  // 4. Model Correlations
  const correlations = computeModelCorrelations(samples);

  return {
    config,
    samples,
    temperatureStats,
    viscosityStats,
    mobilityStats,
    productionStats,
    srpLoadStats,
    riskScoreStats,
    sensitivityResults,
    tornadoEntries,
    correlations,
    validation,
    calculatedAt: new Date().toISOString(),
    disclaimer: UNCERTAINTY_DISCLAIMER,
  };
}

import type { ScenarioInputValues } from '../scenario/types';
import type { CommittedUncertaintyResult, SensitivityRankingEntry, ParameterContribution } from './types';
import { simulateHistoricalRecordProduction } from '../historicalValidation/historicalValidationEngine';

export function runCommittedScenarioUncertaintyAnalysis(
  committedInputs: ScenarioInputValues
): CommittedUncertaintyResult {
  const baseSim = simulateHistoricalRecordProduction(committedInputs);
  const baseProd = baseSim.predictedProductionBopd;

  const targetParams: { key: keyof ScenarioInputValues; name: string; unit: string }[] = [
    { key: 'reservoirTemperatureC', name: 'Reservoir Temperature', unit: '°C' },
    { key: 'reservoirPressureBar', name: 'Reservoir Pressure', unit: 'bar' },
    { key: 'permeabilityDarcy', name: 'Permeability', unit: 'D' },
    { key: 'steamInjectionRateTpd', name: 'Steam Injection Rate', unit: 'TPD' },
    { key: 'steamQualityPercent', name: 'Steam Quality', unit: '%' },
    { key: 'waterCutPercent', name: 'Water Cut', unit: '%' },
    { key: 'spm', name: 'SPM', unit: 'strokes/min' },
    { key: 'strokeLengthMeters', name: 'Stroke Length', unit: 'm' },
  ];

  const rawEntries: Omit<SensitivityRankingEntry, 'rank' | 'normalizedSensitivity'>[] = [];
  const allOutputs: number[] = [baseProd];

  for (const p of targetParams) {
    const baseVal = (committedInputs[p.key] as number) ?? 1.0;

    const pLowVal = Number((baseVal * 0.9).toFixed(2));
    const pHighVal = Number((baseVal * 1.1).toFixed(2));

    const lowInputs: ScenarioInputValues = { ...committedInputs, [p.key]: pLowVal };
    const highInputs: ScenarioInputValues = { ...committedInputs, [p.key]: pHighVal };

    const lowSim = simulateHistoricalRecordProduction(lowInputs);
    const highSim = simulateHistoricalRecordProduction(highInputs);

    allOutputs.push(lowSim.predictedProductionBopd, highSim.predictedProductionBopd);

    const delta = Math.abs(highSim.predictedProductionBopd - lowSim.predictedProductionBopd);

    rawEntries.push({
      parameterId: p.key,
      parameterName: p.name,
      unit: p.unit,
      lowValue: pLowVal,
      baselineValue: baseVal,
      highValue: pHighVal,
      lowProductionBopd: lowSim.predictedProductionBopd,
      baselineProductionBopd: baseProd,
      highProductionBopd: highSim.predictedProductionBopd,
      productionDeltaBopd: Number(delta.toFixed(2)),
    });
  }

  // Sort by productionDeltaBopd descending (dynamic calculation, not hardcoded!)
  rawEntries.sort((a, b) => b.productionDeltaBopd - a.productionDeltaBopd);

  const maxDelta = Math.max(0.001, rawEntries[0]?.productionDeltaBopd || 1.0);
  const totalDeltaSum = Math.max(0.001, rawEntries.reduce((sum, e) => sum + e.productionDeltaBopd, 0));

  const sensitivityRanking: SensitivityRankingEntry[] = rawEntries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
    normalizedSensitivity: Number((e.productionDeltaBopd / maxDelta).toFixed(2)),
  }));

  const parameterContributions: ParameterContribution[] = sensitivityRanking.map((e) => ({
    parameterName: e.parameterName,
    contributionPercent: Number(((e.productionDeltaBopd / totalDeltaSum) * 100.0).toFixed(1)),
  }));

  allOutputs.sort((a, b) => a - b);
  const minProd = Number(allOutputs[0].toFixed(2));
  const maxProd = Number(allOutputs[allOutputs.length - 1].toFixed(2));
  const p10 = Number(allOutputs[Math.floor(allOutputs.length * 0.1)].toFixed(2));
  const p50 = Number(allOutputs[Math.floor(allOutputs.length * 0.5)].toFixed(2));
  const p90 = Number(allOutputs[Math.floor(allOutputs.length * 0.9)].toFixed(2));

  return {
    baselineInputs: committedInputs,
    baselineProductionBopd: baseProd,
    minimumProductionBopd: minProd,
    maximumProductionBopd: maxProd,
    p10,
    p50,
    p90,
    productionRangeBopd: Number((maxProd - minProd).toFixed(2)),
    boundsTypeLabel: 'engineering sensitivity bounds',
    sensitivityRanking,
    parameterContributions,
    calculatedAt: new Date().toISOString(),
    disclaimer:
      'ENGINEERING SENSITIVITY NOTICE: Bounds (P10, P50, P90) represent deterministic engineering sensitivity ranges across key parameter perturbations (-10% to +10%) and are not statistically derived field confidence intervals.',
  };
}
