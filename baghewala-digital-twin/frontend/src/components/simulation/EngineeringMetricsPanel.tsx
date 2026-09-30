import React, { useMemo } from 'react';
import { AlertTriangle, CircleHelp } from 'lucide-react';
import { MetricStrip, MetricTile } from '../ui/MetricTile';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { calculateCycleEconomics, buildCssCoolingTimeline } from '../../simulation/engineeringMetrics';

export const EngineeringMetricsPanel: React.FC<{ showTimeline?: boolean }> = ({ showTimeline = true }) => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    srpOptimizationResult,
    rodFloatingResult,
    baselineRodFloatingResult,
    cssOptimizationResult,
    baselineCSSOptimizationResult,
    baselineProductionResult,
  } = useScenarioStore();
  const inputs = activeScenario.inputs;
  const economics = useMemo(() => calculateCycleEconomics({
    steamInjectedTonnes: cssOptimizationResult.currentCandidate.steamVolumeTons,
    oilProducedBarrels: productionResult.estimatedProductionBopd * 90,
    steamRateTpd: inputs.steamInjectionRateTpd,
    steamQualityFraction: inputs.steamQualityPercent / 100,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    loadIndex: srpOptimizationResult.currentCandidate.loadIndex,
    productionBopd: productionResult.estimatedProductionBopd,
  }), [cssOptimizationResult, productionResult, inputs, srpOptimizationResult]);
  const baselineEconomics = useMemo(() => calculateCycleEconomics({
    steamInjectedTonnes: baselineCSSOptimizationResult.currentCandidate.steamVolumeTons,
    oilProducedBarrels: baselineProductionResult.estimatedProductionBopd * 90,
    steamRateTpd: 50,
    steamQualityFraction: 0.85,
    vfdFrequencyHz: 50,
    loadIndex: 50,
    productionBopd: baselineProductionResult.estimatedProductionBopd,
  }), [baselineCSSOptimizationResult, baselineProductionResult]);
  const timeline = useMemo(() => buildCssCoolingTimeline({
    initialTemperatureC: thermalResult.predictedReservoirTemperatureC,
    initialViscosityCp: viscosityResult.estimatedViscosityCp,
    initialProductionBopd: productionResult.estimatedProductionBopd,
    baselineSpm: inputs.spm,
    baselineStrokeLengthM: inputs.strokeLengthMeters,
    baselineVfdHz: inputs.vfdFrequencyHz,
  }), [thermalResult, viscosityResult, productionResult, inputs]);
  const delta = (current: number, baseline: number) => {
    const pct = baseline === 0 ? 0 : ((current - baseline) / Math.abs(baseline)) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  return (
    <div className="space-y-4">
      <Panel title="Well-to-surface engineering metrics" subtitle="Live model outputs; assumptions are separated from documented field values.">
        <MetricStrip>
          <MetricTile label="Steam-oil ratio" value={economics.sor.toFixed(2)} unit="t/bbl" provenance="MODELED" icon="production" hint={`Baseline ${baselineEconomics.sor.toFixed(2)} · ${delta(economics.sor, baselineEconomics.sor)}`} />
          <MetricTile label="Energy per barrel" value={economics.energyKwhPerBarrel.toFixed(1)} unit="kWh/bbl" provenance="MODELED" icon="production" hint={`Baseline ${baselineEconomics.energyKwhPerBarrel.toFixed(1)}`} />
          <MetricTile label="Operating cost" value={economics.operatingCostPerBarrel.toFixed(2)} unit="/bbl" provenance="ASSUMPTION" icon="production" hint="Steam and power tariffs are editable assumptions" />
          <MetricTile label="Pump efficiency" value={rodFloatingResult.pumpFillEfficiency.toFixed(1)} unit="% fill" provenance="MODELED" icon="srpLoad" hint={`Baseline ${baselineRodFloatingResult.pumpFillEfficiency.toFixed(1)}%`} />
          <MetricTile label="Rod floating index" value={rodFloatingResult.rodFloatingIndex} unit="/100" provenance="MODELED" icon="risk" hint={`${rodFloatingResult.riskLevel} · impact ${rodFloatingResult.impactLoadingIndex}/100`} />
          <MetricTile label="Production" value={productionResult.estimatedProductionBopd.toFixed(1)} unit="BOPD" provenance="MODELED" icon="production" hint={`Baseline ${baselineProductionResult.estimatedProductionBopd.toFixed(1)}`} />
        </MetricStrip>
        <div className="mt-4 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{rodFloatingResult.cause} Rod weight and fill constants are ASSUMPTION inputs when no field telemetry is loaded.</span>
        </div>
      </Panel>

      {showTimeline && (
        <Panel title="CSS cooling timeline and recommended setpoints" subtitle="Modeled days after steam injection; each row is advisory and must be reviewed by an engineer.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr><th className="px-2 py-2">Days after steam</th><th className="px-2 py-2">Temp</th><th className="px-2 py-2">Viscosity</th><th className="px-2 py-2">Production</th><th className="px-2 py-2">Recommended SPM / stroke / VFD</th><th className="px-2 py-2">Reason</th></tr>
              </thead>
              <tbody>
                {timeline.map((point) => (
                  <tr key={point.daysAfterSteam} className="border-b border-gray-100">
                    <td className="px-2 py-2 font-mono">{point.daysAfterSteam} d <span className="ml-1 text-[10px] text-amber-700">{point.provenance}</span></td>
                    <td className="px-2 py-2 font-mono">{point.temperatureC} °C</td>
                    <td className="px-2 py-2 font-mono">{point.viscosityCp.toLocaleString()} cP</td>
                    <td className="px-2 py-2 font-mono">{point.productionBopd} BOPD</td>
                    <td className="px-2 py-2 font-mono">{point.recommendedSpm} / {point.recommendedStrokeLengthM} m / {point.recommendedVfdHz} Hz</td>
                    <td className="px-2 py-2 text-gray-600">{point.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><CircleHelp className="h-3.5 w-3.5" />Cooling rate is an ASSUMPTION until cycle temperature history is imported.</div>
        </Panel>
      )}
    </div>
  );
};