import { HISTORICAL_CSS_CYCLES } from '../../data/baghewala';
import { CSS_MODEL_ASSUMPTIONS, CSS_MODEL_DISCLAIMERS, CSS_OPERATION_BOUNDS } from './defaults';
import { evaluateCSSCandidate } from './cssOptimizationModel';
import type {
  CSSCandidate,
  CSSComparisonRow,
  CSSHeavyOilBreakdown,
  CSSOperatingWindow,
  CSSOptimizationInput,
  CSSOptimizationResult,
  CSSProductionBreakdown,
  CSSThermalBreakdown,
  HistoricalCSSComparison,
} from './types';

export function optimizeCSS(input: CSSOptimizationInput): CSSOptimizationResult {
  const currentCandidate = evaluateCSSCandidate(input);
  const candidates: CSSCandidate[] = [];

  let safeCandidatesCount = 0;
  let cautionCandidatesCount = 0;
  let highThermalCandidatesCount = 0;

  let minSteamRate: number = CSS_OPERATION_BOUNDS.steamRate.max;
  let maxSteamRate: number = CSS_OPERATION_BOUNDS.steamRate.min;
  let minInjectionDuration: number = CSS_OPERATION_BOUNDS.injectionDuration.max;
  let maxInjectionDuration: number = CSS_OPERATION_BOUNDS.injectionDuration.min;
  let minSoakDuration: number = CSS_OPERATION_BOUNDS.soakDuration.max;
  let maxSoakDuration: number = CSS_OPERATION_BOUNDS.soakDuration.min;

  // Discrete grid search (750 candidates)
  for (let rate = 20.0; rate <= 120.0; rate += 20.0) {
    for (let injDays = 2.0; injDays <= 10.0; injDays += 2.0) {
      for (let soakDays = 2.0; soakDays <= 14.0; soakDays += 3.0) {
        for (let qual = 0.60; qual <= 1.01; qual += 0.10) {
          const candidateInput: CSSOptimizationInput = {
            ...input,
            steamInjectionRateTpd: rate,
            injectionDurationDays: injDays,
            soakDurationDays: soakDays,
            steamQualityFraction: Number(qual.toFixed(2)),
          };

          const candidate = evaluateCSSCandidate(candidateInput);
          candidates.push(candidate);

          if (candidate.status === 'NORMAL') safeCandidatesCount++;
          else if (candidate.status === 'CAUTION') cautionCandidatesCount++;
          else if (candidate.status === 'HIGH_THERMAL_LOAD') highThermalCandidatesCount++;

          if (candidate.isValid) {
            if (rate < minSteamRate) minSteamRate = rate;
            if (rate > maxSteamRate) maxSteamRate = rate;
            if (injDays < minInjectionDuration) minInjectionDuration = injDays;
            if (injDays > maxInjectionDuration) maxInjectionDuration = injDays;
            if (soakDays < minSoakDuration) minSoakDuration = soakDays;
            if (soakDays > maxSoakDuration) maxSoakDuration = soakDays;
          }
        }
      }
    }
  }

  // Find optimal candidate
  const validCandidates = candidates.filter((c) => c.isValid);
  let optimalCandidate: CSSCandidate;

  if (validCandidates.length > 0) {
    optimalCandidate = validCandidates.reduce((best, curr) =>
      curr.efficiencyScore > best.efficiencyScore ? curr : best
    );
  } else {
    optimalCandidate = candidates.reduce((best, curr) =>
      curr.efficiencyScore > best.efficiencyScore ? curr : best
    );
  }

  const operatingWindow: CSSOperatingWindow = {
    minSteamRate: minSteamRate <= maxSteamRate ? minSteamRate : 20.0,
    maxSteamRate: minSteamRate <= maxSteamRate ? maxSteamRate : 120.0,
    minInjectionDuration: minInjectionDuration <= maxInjectionDuration ? minInjectionDuration : 2.0,
    maxInjectionDuration: minInjectionDuration <= maxInjectionDuration ? maxInjectionDuration : 10.0,
    minSoakDuration: minSoakDuration <= maxSoakDuration ? minSoakDuration : 2.0,
    maxSoakDuration: minSoakDuration <= maxSoakDuration ? maxSoakDuration : 14.0,
    safeCandidatesCount,
    cautionCandidatesCount,
    highThermalCandidatesCount,
    totalCandidatesCount: candidates.length,
  };

  // Thermal breakdown
  const soakBuildup = 1.0 - Math.exp(-Math.max(0, currentCandidate.soakDurationDays) / 3.0);
  const soakDecay = Math.exp(-Math.max(0, currentCandidate.soakDurationDays) / 30.0);
  const heatRetention = Number((soakBuildup * soakDecay).toFixed(3));
  const normalizedSteamVolume = currentCandidate.steamVolumeTons / 500.0;
  const thermalGain = Number((normalizedSteamVolume * currentCandidate.steamQualityFraction * 60.0).toFixed(1));
  const deltaTemperatureC = Number((currentCandidate.predictedCssTemperatureC - input.reservoirTemperatureC).toFixed(1));

  const thermalBreakdown: CSSThermalBreakdown = {
    baselineReservoirTempC: input.reservoirTemperatureC,
    steamVolumeTons: currentCandidate.steamVolumeTons,
    thermalGain,
    heatRetention,
    deltaTemperatureC,
    predictedCssTemperatureC: currentCandidate.predictedCssTemperatureC,
    thermalEfficiency: input.thermalEfficiency ?? 0.75,
  };

  // Heavy oil breakdown
  let viscosityReductionPercent = 0.0;
  if (input.baselineViscosityCp > 0) {
    viscosityReductionPercent = Number(
      (((input.baselineViscosityCp - currentCandidate.cssViscosityCp) / input.baselineViscosityCp) * 100).toFixed(1)
    );
  }

  let mobilityIncreasePercent = 0.0;
  if (input.baselineMobilityDPerCp > 0) {
    mobilityIncreasePercent = Number(
      (((currentCandidate.cssMobilityDPerCp - input.baselineMobilityDPerCp) / input.baselineMobilityDPerCp) * 100).toFixed(1)
    );
  }

  const heavyOilBreakdown: CSSHeavyOilBreakdown = {
    baselineViscosityCp: input.baselineViscosityCp,
    cssViscosityCp: currentCandidate.cssViscosityCp,
    viscosityReductionPercent,
    baselineMobilityDPerCp: input.baselineMobilityDPerCp,
    cssMobilityDPerCp: currentCandidate.cssMobilityDPerCp,
    mobilityIncreasePercent,
  };

  // Production breakdown
  const cumulativeOilRecoveredTons = Number(
    (currentCandidate.cssProductionBopd * currentCandidate.productionDurationDays * 0.14).toFixed(1)
  );

  const productionBreakdown: CSSProductionBreakdown = {
    baselineProductionBopd: input.baselineProductionBopd,
    cssProductionBopd: currentCandidate.cssProductionBopd,
    productionIncreaseBopd: currentCandidate.productionIncreaseBopd,
    productionIncreasePercent: currentCandidate.productionIncreasePercent,
    cumulativeOilRecoveredTons,
  };

  // Historical CSS comparison with Cycle 1
  const histCycle1 = HISTORICAL_CSS_CYCLES[0];
  const historicalSteamVolumeTons = histCycle1?.steamVolumeTons?.value ?? 1500;
  const historicalSoakDays = histCycle1?.soakDurationDays?.value ?? 7;
  const historicalOilRecoveredTons = histCycle1?.oilRecoveredTons?.value ?? 1850;

  const historicalComparison: HistoricalCSSComparison = {
    historicalCycleNumber: histCycle1?.cycleNumber ?? 1,
    historicalSteamVolumeTons,
    historicalSoakDays,
    historicalOilRecoveredTons,
    modeledSteamVolumeTons: currentCandidate.steamVolumeTons,
    modeledSoakDays: currentCandidate.soakDurationDays,
    modeledOilRecoveredTons: cumulativeOilRecoveredTons,
    volumeDeltaTons: Number((currentCandidate.steamVolumeTons - historicalSteamVolumeTons).toFixed(1)),
    oilDeltaTons: Number((cumulativeOilRecoveredTons - historicalOilRecoveredTons).toFixed(1)),
  };

  const isOptimized =
    optimalCandidate.steamInjectionRateTpd !== currentCandidate.steamInjectionRateTpd ||
    optimalCandidate.injectionDurationDays !== currentCandidate.injectionDurationDays ||
    optimalCandidate.soakDurationDays !== currentCandidate.soakDurationDays ||
    optimalCandidate.steamQualityFraction !== currentCandidate.steamQualityFraction;

  const warnings: string[] = [];
  if (currentCandidate.status === 'HIGH_THERMAL_LOAD') {
    warnings.push(`Current CSS cycle operates under HIGH THERMAL LOAD (${currentCandidate.predictedCssTemperatureC}°C). Optimization recommended.`);
  }

  return {
    currentCandidate,
    optimalCandidate,
    candidates,
    operatingWindow,
    thermalBreakdown,
    heavyOilBreakdown,
    productionBreakdown,
    historicalComparison,
    status: currentCandidate.status,
    isOptimized,
    warnings,
    assumptions: [...CSS_MODEL_ASSUMPTIONS],
    disclaimers: [...CSS_MODEL_DISCLAIMERS],
    modelType: 'Baghewala CSS Cycle Optimization Engine',
    calculatedAt: new Date().toISOString(),
    inputSources: {
      steamRate: 'scenario',
      steamQuality: 'scenario',
      soakDuration: 'scenario',
      injectionDuration: 'scenario',
      thermalModel: 'derived',
      viscosityModel: 'derived',
      mobilityModel: 'derived',
      productionModel: 'derived',
    },
  };
}

export function compareCSSResults(result: CSSOptimizationResult): CSSComparisonRow[] {
  const cur = result.currentCandidate;
  const opt = result.optimalCandidate;
  const baseTemp = result.thermalBreakdown.baselineReservoirTempC;
  const baseVisc = result.heavyOilBreakdown.baselineViscosityCp;
  const baseMob = result.heavyOilBreakdown.baselineMobilityDPerCp;
  const baseProd = result.productionBreakdown.baselineProductionBopd;

  return [
    {
      parameter: 'Reservoir Temperature',
      unit: '°C',
      baselineValue: baseTemp,
      currentValue: cur.predictedCssTemperatureC,
      optimizedValue: opt.predictedCssTemperatureC,
      delta: Number((opt.predictedCssTemperatureC - cur.predictedCssTemperatureC).toFixed(1)),
      percentChange: cur.predictedCssTemperatureC > 0 ? Number((((opt.predictedCssTemperatureC - cur.predictedCssTemperatureC) / cur.predictedCssTemperatureC) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Heavy-Oil Viscosity',
      unit: 'cP',
      baselineValue: baseVisc,
      currentValue: cur.cssViscosityCp,
      optimizedValue: opt.cssViscosityCp,
      delta: Number((opt.cssViscosityCp - cur.cssViscosityCp).toFixed(1)),
      percentChange: cur.cssViscosityCp > 0 ? Number((((opt.cssViscosityCp - cur.cssViscosityCp) / cur.cssViscosityCp) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Oil Mobility (λ_o)',
      unit: 'D/cP',
      baselineValue: baseMob,
      currentValue: cur.cssMobilityDPerCp,
      optimizedValue: opt.cssMobilityDPerCp,
      delta: Number((opt.cssMobilityDPerCp - cur.cssMobilityDPerCp).toFixed(6)),
      percentChange: cur.cssMobilityDPerCp > 0 ? Number((((opt.cssMobilityDPerCp - cur.cssMobilityDPerCp) / cur.cssMobilityDPerCp) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Estimated Oil Production',
      unit: 'BOPD',
      baselineValue: baseProd,
      currentValue: cur.cssProductionBopd,
      optimizedValue: opt.cssProductionBopd,
      delta: Number((opt.cssProductionBopd - cur.cssProductionBopd).toFixed(2)),
      percentChange: cur.cssProductionBopd > 0 ? Number((((opt.cssProductionBopd - cur.cssProductionBopd) / cur.cssProductionBopd) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Steam Injection Rate',
      unit: 't/day',
      baselineValue: 0,
      currentValue: cur.steamInjectionRateTpd,
      optimizedValue: opt.steamInjectionRateTpd,
      delta: Number((opt.steamInjectionRateTpd - cur.steamInjectionRateTpd).toFixed(1)),
      percentChange: cur.steamInjectionRateTpd > 0 ? Number((((opt.steamInjectionRateTpd - cur.steamInjectionRateTpd) / cur.steamInjectionRateTpd) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Steam Volume Injected',
      unit: 'tons',
      baselineValue: 0,
      currentValue: cur.steamVolumeTons,
      optimizedValue: opt.steamVolumeTons,
      delta: Number((opt.steamVolumeTons - cur.steamVolumeTons).toFixed(1)),
      percentChange: cur.steamVolumeTons > 0 ? Number((((opt.steamVolumeTons - cur.steamVolumeTons) / cur.steamVolumeTons) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Injection Duration',
      unit: 'days',
      baselineValue: 0,
      currentValue: cur.injectionDurationDays,
      optimizedValue: opt.injectionDurationDays,
      delta: Number((opt.injectionDurationDays - cur.injectionDurationDays).toFixed(1)),
      percentChange: cur.injectionDurationDays > 0 ? Number((((opt.injectionDurationDays - cur.injectionDurationDays) / cur.injectionDurationDays) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Soak Duration',
      unit: 'days',
      baselineValue: 0,
      currentValue: cur.soakDurationDays,
      optimizedValue: opt.soakDurationDays,
      delta: Number((opt.soakDurationDays - cur.soakDurationDays).toFixed(1)),
      percentChange: cur.soakDurationDays > 0 ? Number((((opt.soakDurationDays - cur.soakDurationDays) / cur.soakDurationDays) * 100).toFixed(1)) : 0,
      sourceType: 'scenario',
    },
    {
      parameter: 'Total Cycle Duration',
      unit: 'days',
      baselineValue: 90,
      currentValue: cur.cycleDurationDays,
      optimizedValue: opt.cycleDurationDays,
      delta: Number((opt.cycleDurationDays - cur.cycleDurationDays).toFixed(1)),
      percentChange: cur.cycleDurationDays > 0 ? Number((((opt.cycleDurationDays - cur.cycleDurationDays) / cur.cycleDurationDays) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'CSS Efficiency Score',
      unit: 'score',
      baselineValue: 0,
      currentValue: cur.efficiencyScore,
      optimizedValue: opt.efficiencyScore,
      delta: Number((opt.efficiencyScore - cur.efficiencyScore).toFixed(2)),
      percentChange: cur.efficiencyScore > 0 ? Number((((opt.efficiencyScore - cur.efficiencyScore) / cur.efficiencyScore) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
  ];
}
