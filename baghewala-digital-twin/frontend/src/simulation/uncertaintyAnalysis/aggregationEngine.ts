import type {
  UncertaintySample,
  OutputStatistics,
  ProductionStatistics,
  CorrelationResult,
} from './types';

export function formatStatValue(val: number): number {
  if (Math.abs(val) > 0 && Math.abs(val) < 0.01) {
    return Number(val.toFixed(6));
  }
  return Number(val.toFixed(2));
}

export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0.0;
  if (sortedValues.length === 1) return formatStatValue(sortedValues[0]);

  const index = (percentile / 100.0) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  const value = sortedValues[lower] * (1.0 - weight) + sortedValues[upper] * weight;
  return formatStatValue(value);
}

export function computeOutputStatistics(values: number[]): OutputStatistics {
  if (values.length === 0) {
    return {
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
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / sorted.length;

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: formatStatValue(mean),
    median: calculatePercentile(sorted, 50),
    min: formatStatValue(sorted[0]),
    max: formatStatValue(sorted[sorted.length - 1]),
    stdDev: formatStatValue(stdDev),
    p10: calculatePercentile(sorted, 10),
    p25: calculatePercentile(sorted, 25),
    p50: calculatePercentile(sorted, 50),
    p75: calculatePercentile(sorted, 75),
    p90: calculatePercentile(sorted, 90),
  };
}

export function computeProductionStatistics(
  samples: UncertaintySample[],
  baselineProductionBopd: number = 0.75
): ProductionStatistics {
  const prodValues = samples.map((s) => s.productionBopd);
  const baseStats = computeOutputStatistics(prodValues);

  if (samples.length === 0) {
    return {
      ...baseStats,
      probLessThanOneBopd: 0.0,
      probGreaterThanBaseline: 0.0,
      baselineProductionBopd,
    };
  }

  const countLessOne = samples.filter((s) => s.productionBopd < 1.0).length;
  const countGreaterBase = samples.filter((s) => s.productionBopd > baselineProductionBopd).length;

  return {
    ...baseStats,
    probLessThanOneBopd: Number(((countLessOne / samples.length) * 100).toFixed(1)),
    probGreaterThanBaseline: Number(((countGreaterBase / samples.length) * 100).toFixed(1)),
    baselineProductionBopd,
  };
}

export function calculatePearsonCorrelation(xArr: number[], yArr: number[]): number {
  if (xArr.length !== yArr.length || xArr.length < 2) return 0.0;

  const n = xArr.length;
  const xMean = xArr.reduce((a, b) => a + b, 0) / n;
  const yMean = yArr.reduce((a, b) => a + b, 0) / n;

  let num = 0.0;
  let denomX = 0.0;
  let denomY = 0.0;

  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - xMean;
    const dy = yArr[i] - yMean;
    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX <= 1e-9 || denomY <= 1e-9) return 0.0;

  const r = num / Math.sqrt(denomX * denomY);
  return Number(Math.max(-1.0, Math.min(1.0, r)).toFixed(3));
}

export function computeModelCorrelations(samples: UncertaintySample[]): CorrelationResult[] {
  if (samples.length < 2) return [];

  const getCol = (fn: (s: UncertaintySample) => number) => samples.map(fn);

  const correlationPairs: {
    inputName: string;
    inputId: string;
    outputName: string;
    x: number[];
    y: number[];
  }[] = [
    {
      inputName: 'Steam Injection Rate',
      inputId: 'PARAM_STEAM_RATE',
      outputName: 'Estimated Production (BOPD)',
      x: getCol((s) => s.inputs.steamInjectionRateTpd),
      y: getCol((s) => s.productionBopd),
    },
    {
      inputName: 'Reservoir Temperature',
      inputId: 'PARAM_RES_TEMP',
      outputName: 'Crude Oil Viscosity (cP)',
      x: getCol((s) => s.temperatureC),
      y: getCol((s) => s.viscosityCp),
    },
    {
      inputName: 'Crude Oil Viscosity',
      inputId: 'PARAM_CRUDE_VISCOSITY',
      outputName: 'Oil Mobility (D/cP)',
      x: getCol((s) => s.viscosityCp),
      y: getCol((s) => s.mobilityDcP),
    },
    {
      inputName: 'Oil Mobility',
      inputId: 'PARAM_MOBILITY',
      outputName: 'Estimated Production (BOPD)',
      x: getCol((s) => s.mobilityDcP),
      y: getCol((s) => s.productionBopd),
    },
    {
      inputName: 'VFD Frequency',
      inputId: 'PARAM_VFD_FREQ',
      outputName: 'Estimated Production (BOPD)',
      x: getCol((s) => s.inputs.vfdFrequencyHz),
      y: getCol((s) => s.productionBopd),
    },
    {
      inputName: 'VFD Frequency',
      inputId: 'PARAM_VFD_FREQ',
      outputName: 'SRP Load Index',
      x: getCol((s) => s.inputs.vfdFrequencyHz),
      y: getCol((s) => s.srpLoadIndex),
    },
    {
      inputName: 'Reservoir Permeability',
      inputId: 'PARAM_PERMEABILITY',
      outputName: 'Oil Mobility (D/cP)',
      x: getCol((s) => s.inputs.reservoirPermeabilityD),
      y: getCol((s) => s.mobilityDcP),
    },
    {
      inputName: 'Effective Drawdown',
      inputId: 'PARAM_DRAWDOWN',
      outputName: 'Estimated Production (BOPD)',
      x: getCol((s) => s.inputs.effectiveDrawdownBar),
      y: getCol((s) => s.productionBopd),
    },
  ];

  return correlationPairs.map((pair) => {
    const coeff = calculatePearsonCorrelation(pair.x, pair.y);
    let interp = 'Strong positive correlation';
    if (coeff >= 0.7) interp = 'Strong positive correlation (Model-Sample)';
    else if (coeff >= 0.3) interp = 'Moderate positive correlation (Model-Sample)';
    else if (coeff > -0.3 && coeff < 0.3) interp = 'Weak / negligible correlation (Model-Sample)';
    else if (coeff <= -0.7) interp = 'Strong negative correlation (Model-Sample)';
    else if (coeff <= -0.3) interp = 'Moderate negative correlation (Model-Sample)';

    return {
      inputParameterId: pair.inputId,
      inputParameterName: pair.inputName,
      outputMetricName: pair.outputName,
      correlationCoefficient: coeff,
      interpretation: interp,
    };
  });
}
