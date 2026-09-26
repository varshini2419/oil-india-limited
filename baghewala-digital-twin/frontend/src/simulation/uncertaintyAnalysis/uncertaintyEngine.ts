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
