import type { MetricComparison, ComparisonMetricStatus } from './types';
import type { NormalizedTelemetryRecord, ValueProvenance } from '../fieldDataIntegration/types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';

export function compareFieldDataWithModel(
  records: NormalizedTelemetryRecord[],
  calibratedState: DigitalTwinState,
  baselineState: DigitalTwinState
): MetricComparison[] {
  const comparisons: MetricComparison[] = [];

  if (records.length === 0) {
    return comparisons;
  }

  records.forEach((rec, idx) => {
    const recordLabel = records.length > 1 ? ` (Rec #${idx + 1})` : '';

    const checkMetric = (
      metricKey: string,
      metricLabel: string,
      unit: string,
      observedVal: number | undefined,
      provenance: ValueProvenance | undefined,
      predCalibrated: number,
      predBaseline: number,
      tolerancePercent = 10.0
    ) => {
      if (observedVal === undefined || isNaN(observedVal)) {
        comparisons.push({
          metricKey,
          metricLabel: `${metricLabel}${recordLabel}`,
          unit,
          provenance: provenance || 'UNIT_UNKNOWN',
          status: 'NOT_AVAILABLE',
          predictedBaselineValue: predBaseline,
          predictedCalibratedValue: predCalibrated,
          warning: `Metric "${metricLabel}" not observed in input field data.`,
        });
        return;
      }

      const absErrCal = Number(Math.abs(observedVal - predCalibrated).toFixed(2));
      let relErrCal: number | undefined;
      let pctErrCal: number | undefined;

      if (Math.abs(observedVal) > 0.0001) {
        relErrCal = Number((absErrCal / Math.abs(observedVal)).toFixed(4));
        pctErrCal = Number((relErrCal * 100).toFixed(1));
      }

      let status: ComparisonMetricStatus = 'MATCH';
      let warning: string | undefined;

      if (pctErrCal !== undefined && pctErrCal > tolerancePercent) {
        status = 'DEVIATION';
        warning = `Observed (${observedVal} ${unit}) deviates by ${pctErrCal}% from calibrated prediction (${predCalibrated} ${unit}).`;
      }

      comparisons.push({
        metricKey,
        metricLabel: `${metricLabel}${recordLabel}`,
        observedValue: observedVal,
        predictedBaselineValue: predBaseline,
        predictedCalibratedValue: predCalibrated,
        absoluteError: absErrCal,
        relativeError: relErrCal,
        percentageError: pctErrCal,
        unit,
        provenance: provenance || 'MEASURED',
        status,
        warning,
      });
    };

    // 1. Reservoir Temperature (°C)
    checkMetric(
      'reservoirTemperatureC',
      'Reservoir Temperature',
      '°C',
      rec.reservoirTemperature?.value,
      rec.reservoirTemperature?.provenance,
      calibratedState.reservoir.reservoirTemperatureC,
      baselineState.reservoir.reservoirTemperatureC,
      5.0
    );

    // 2. Reservoir Pressure (bar)
    checkMetric(
      'reservoirPressureBar',
      'Reservoir Pressure',
      'bar',
      rec.reservoirPressure?.value,
      rec.reservoirPressure?.provenance,
      calibratedState.reservoir.reservoirPressureBar,
      baselineState.reservoir.reservoirPressureBar,
      10.0
    );

    // 3. Oil Viscosity (cP)
    checkMetric(
      'estimatedViscosityCp',
      'Oil Viscosity',
      'cP',
      rec.viscosity?.value,
      rec.viscosity?.provenance,
      calibratedState.reservoir.estimatedViscosityCp,
      baselineState.reservoir.estimatedViscosityCp,
      15.0
    );

    // 4. SRP VFD Frequency (Hz)
    checkMetric(
      'vfdFrequencyHz',
      'SRP VFD Frequency',
      'Hz',
      rec.vfdHz?.value,
      rec.vfdHz?.provenance,
      calibratedState.srp.vfdFrequencyHz,
      baselineState.srp.vfdFrequencyHz,
      2.0
    );

    // 5. SRP SPM
    checkMetric(
      'spm',
      'Pumping Speed (SPM)',
      'SPM',
      rec.spm?.value,
      rec.spm?.provenance,
      calibratedState.srp.spm,
      baselineState.srp.spm,
      2.0
    );

    // 6. SRP Stroke Length (m)
    checkMetric(
      'strokeLengthMeters',
      'Stroke Length',
      'm',
      rec.strokeM?.value,
      rec.strokeM?.provenance,
      calibratedState.srp.strokeLengthMeters,
      baselineState.srp.strokeLengthMeters,
      2.0
    );

    // 7. CSS Steam Rate (TPD)
    checkMetric(
      'steamInjectionRateTpd',
      'Steam Injection Rate',
      'TPD',
      rec.steamRateTpd?.value,
      rec.steamRateTpd?.provenance,
      calibratedState.css.steamInjectionRateTpd,
      baselineState.css.steamInjectionRateTpd,
      10.0
    );

    // 8. Oil Production Rate (BOPD)
    checkMetric(
      'estimatedProductionBopd',
      'Oil Production Rate',
      'BOPD',
      rec.productionBopd?.value,
      rec.productionBopd?.provenance,
      calibratedState.production.estimatedProductionBopd,
      baselineState.production.estimatedProductionBopd,
      15.0
    );
  });

  return comparisons;
}
