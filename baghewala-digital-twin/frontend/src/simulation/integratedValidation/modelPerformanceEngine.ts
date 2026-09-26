import type { ModelPerformanceSummary, MetricComparison } from './types';

export function computeModelPerformanceSummaries(
  comparisons: MetricComparison[]
): ModelPerformanceSummary[] {
  const summaries: ModelPerformanceSummary[] = [];

  // Group comparisons by metric key
  const availableComparisons = comparisons.filter(
    (c) => c.status !== 'NOT_AVAILABLE' && c.observedValue !== undefined && !isNaN(c.observedValue)
  );

  if (availableComparisons.length === 0) {
    return summaries;
  }

  // Create a performance summary for Production (BOPD) and overall primary metrics
  const productionComps = availableComparisons.filter((c) => c.metricKey === 'estimatedProductionBopd');
  const tempComps = availableComparisons.filter((c) => c.metricKey === 'reservoirTemperatureC');
  const viscosityComps = availableComparisons.filter((c) => c.metricKey === 'estimatedViscosityCp');

  const processMetricGroup = (metricKey: string, metricLabel: string, comps: MetricComparison[]) => {
    const validObs = comps.map((c) => c.observedValue!).filter((v) => typeof v === 'number' && !isNaN(v));
    const count = validObs.length;

    if (count === 0) return;

    const absErrorsBase = comps.map((c) => Math.abs(c.observedValue! - (c.predictedBaselineValue ?? c.observedValue!)));
    const absErrorsCal = comps.map((c) => Math.abs(c.observedValue! - (c.predictedCalibratedValue ?? c.observedValue!)));

    const maeBase = Number((absErrorsBase.reduce((a, b) => a + b, 0) / count).toFixed(2));
    const maeCal = Number((absErrorsCal.reduce((a, b) => a + b, 0) / count).toFixed(2));

    const sqErrorsBase = comps.map((c) => Math.pow(c.observedValue! - (c.predictedBaselineValue ?? c.observedValue!), 2));
    const sqErrorsCal = comps.map((c) => Math.pow(c.observedValue! - (c.predictedCalibratedValue ?? c.observedValue!), 2));

    const rmseBase = Number(Math.sqrt(sqErrorsBase.reduce((a, b) => a + b, 0) / count).toFixed(2));
    const rmseCal = Number(Math.sqrt(sqErrorsCal.reduce((a, b) => a + b, 0) / count).toFixed(2));

    // Safe MAPE Calculation (avoid 0 denominator)
    let mapeBase: number | undefined;
    let mapeCal: number | undefined;

    const hasZeroObs = validObs.some((v) => Math.abs(v) < 0.0001);
    if (!hasZeroObs) {
      const pctErrsBase = comps.map((c) => Math.abs((c.observedValue! - (c.predictedBaselineValue ?? c.observedValue!)) / c.observedValue!) * 100);
      const pctErrsCal = comps.map((c) => Math.abs((c.observedValue! - (c.predictedCalibratedValue ?? c.observedValue!)) / c.observedValue!) * 100);
      mapeBase = Number((pctErrsBase.reduce((a, b) => a + b, 0) / count).toFixed(1));
      mapeCal = Number((pctErrsCal.reduce((a, b) => a + b, 0) / count).toFixed(1));
    }

    const sortedAbsCal = [...absErrorsCal].sort((a, b) => a - b);
    const maxAbsErr = Number(sortedAbsCal[sortedAbsCal.length - 1].toFixed(2));
    const medAbsErr = Number(sortedAbsCal[Math.floor(sortedAbsCal.length / 2)].toFixed(2));

    const errReduction = maeBase > 0
      ? Number((((maeBase - maeCal) / maeBase) * 100).toFixed(1))
      : 0.0;

    const insufficientData = count < 3;
    const notes: string[] = [];

    if (insufficientData) {
      notes.push(`Limited validation data: Only ${count} valid observation(s) available for metric "${metricLabel}".`);
    }
    if (hasZeroObs) {
      notes.push(`MAPE calculation omitted due to zero or near-zero observation values.`);
    }

    summaries.push({
      metricKey,
      metricLabel,
      maeBaseline: maeBase,
      maeCalibrated: maeCal,
      rmseBaseline: rmseBase,
      rmseCalibrated: rmseCal,
      mapeBaseline: mapeBase,
      mapeCalibrated: mapeCal,
      maxAbsoluteError: maxAbsErr,
      medianAbsoluteError: medAbsErr,
      sampleCount: count,
      validObservationCount: count,
      errorReductionPercent: errReduction,
      insufficientData,
      notes,
    });
  };

  if (productionComps.length > 0) processMetricGroup('estimatedProductionBopd', 'Oil Production Rate (BOPD)', productionComps);
  if (tempComps.length > 0) processMetricGroup('reservoirTemperatureC', 'Reservoir Temperature (°C)', tempComps);
  if (viscosityComps.length > 0) processMetricGroup('estimatedViscosityCp', 'Oil Viscosity (cP)', viscosityComps);

  // If no metric groups matched specifically, process all available comparisons
  if (summaries.length === 0 && availableComparisons.length > 0) {
    processMetricGroup('overallMetrics', 'All Observed Metrics', availableComparisons);
  }

  return summaries;
}
