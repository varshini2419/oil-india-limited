import React, { useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { runFullHistoricalValidation } from '../simulation/historicalValidation';
import {
  AlertCircle,
  Database,
} from 'lucide-react';

export const HistoricalValidationPage: React.FC = () => {
  const validationResult = useMemo(() => runFullHistoricalValidation(), []);
  const { cases, summary, disclaimer } = validationResult;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Baghewala Historical Data Validation & Backtesting"
        subtitle="Model validation against documented Baghewala field records, appraisal datasets, and SPE 100642 reference trials"
        badgeText="Step 5.1 Backtesting Active"
      />

      {/* A. HISTORICAL DATASET SUMMARY CARDS */}
      <Panel
        title="Historical Dataset & Backtesting Summary"
        subtitle="Summary statistics of backtested Baghewala historical reference cases"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-xs font-bold uppercase">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            {summary.totalCases} Backtest Cases
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Total Cases</span>
            <span className="text-lg font-bold text-slate-100 mt-0.5 block">{summary.totalCases}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Complete Cases</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{summary.completeCases}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Partial Cases</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">{summary.partialCases}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Mean Abs Error (MAE)</span>
            <span className="text-lg font-bold text-sky-300 mt-0.5 block">
              {summary.mae !== undefined ? `${summary.mae}` : 'Insufficient Obs'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Mean Abs % Error (MAPE)</span>
            <span className="text-lg font-bold text-sky-400 mt-0.5 block">
              {summary.mape !== undefined ? `${summary.mape}%` : 'Insufficient Obs'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">RMSE Error</span>
            <span className="text-lg font-bold text-purple-400 mt-0.5 block">
              {summary.rmse !== undefined ? `${summary.rmse}` : 'Insufficient Obs'}
            </span>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 italic">
          <strong>Validation Mandate:</strong> {disclaimer}
        </div>
      </Panel>

      {/* C. PIPELINE VALIDATION VIEW */}
      <Panel
        title="Multi-Module Pipeline Backtesting Flow (Steps 4.3 → 4.9)"
        subtitle="End-to-end simulation execution pipeline using documented historical case inputs"
      >
        <div className="space-y-4 font-mono text-xs">
          {cases.map((c) => (
            <div key={c.id} className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <div>
                  <span className="text-slate-100 font-bold text-sm">{c.name}</span>
                  <span className="ml-2 text-[10px] text-slate-400">[{c.yearOrDate}]</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border w-max ${
                  c.availability === 'COMPLETE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  c.availability === 'PARTIAL' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  Data Availability: {c.availability}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{c.description}</p>

              {c.outputs && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">1. Thermal (4.3)</span>
                    <span className="text-rose-400 font-bold mt-0.5 block">{c.outputs.thermalResult.predictedReservoirTemperatureC} °C</span>
                    <span className="text-[9px] text-emerald-400">VALIDATED</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">2. Viscosity (4.4)</span>
                    <span className="text-purple-400 font-bold mt-0.5 block">{c.outputs.viscosityResult.estimatedViscosityCp.toLocaleString()} cP</span>
                    <span className="text-[9px] text-emerald-400">VALIDATED</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">3. Mobility (4.5)</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">{c.outputs.mobilityResult.mobilityDcP} D/cP</span>
                    <span className="text-[9px] text-emerald-400">VALIDATED</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">4. Production (4.6)</span>
                    <span className="text-sky-300 font-bold mt-0.5 block">{c.outputs.productionResult.estimatedProductionBopd} BOPD</span>
                    <span className="text-[9px] text-amber-400">SCREENING</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">5. SRP Opt (4.7)</span>
                    <span className="text-sky-400 font-bold mt-0.5 block">Load: {c.outputs.srpResult.currentCandidate.loadIndex}</span>
                    <span className="text-[9px] text-slate-400">PARTIAL</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">6. CSS Opt (4.8)</span>
                    <span className="text-rose-300 font-bold mt-0.5 block">{c.outputs.cssResult.currentCandidate.steamVolumeTons}T Steam</span>
                    <span className="text-[9px] text-emerald-400">VALIDATED</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase">7. AI Risk (4.9)</span>
                    <span className="text-emerald-300 font-bold mt-0.5 block">{c.outputs.riskResult.riskLevel}</span>
                    <span className="text-[9px] text-sky-400">ADVISORY</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* B. HISTORICAL VS MODELED DETAILED COMPARISON TABLE */}
      <Panel
        title="Historical Observations vs Modeled Pipeline Outputs"
        subtitle="Side-by-side metric comparison, absolute error, percentage error, and validation status"
      >
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Backtest Case</th>
                <th className="pb-2.5 font-bold">Parameter</th>
                <th className="pb-2.5 font-bold">Historical Value</th>
                <th className="pb-2.5 font-bold">Modeled Output</th>
                <th className="pb-2.5 font-bold text-right">Abs Error</th>
                <th className="pb-2.5 font-bold text-right">Error %</th>
                <th className="pb-2.5 font-bold text-center">Validation Status</th>
                <th className="pb-2.5 font-bold text-center">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.flatMap((c) =>
                (c.comparisons ?? []).map((comp, idx) => (
                  <tr key={`${c.id}-${idx}`} className={comp.status === 'INSUFFICIENT_DATA' ? 'bg-slate-950/40 opacity-75' : ''}>
                    <td className="py-2.5 text-slate-300 font-medium">{c.name}</td>
                    <td className="py-2.5 text-slate-200">{comp.parameter}</td>
                    <td className="py-2.5 font-bold text-slate-100">
                      {comp.historicalValue !== null ? `${comp.historicalValue} ${comp.unit}` : 'UNAVAILABLE'}
                    </td>
                    <td className="py-2.5 font-bold text-sky-300">
                      {comp.modeledValue !== null ? `${comp.modeledValue} ${comp.unit}` : 'N/A'}
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      {comp.absoluteError !== null ? `${comp.absoluteError} ${comp.unit}` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-bold font-mono">
                      {comp.percentageError !== null ? (
                        <span className={Math.abs(comp.percentageError) <= 15 ? 'text-emerald-400' : 'text-amber-400'}>
                          {comp.percentageError > 0 ? `+${comp.percentageError}%` : `${comp.percentageError}%`}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                        comp.status === 'VALIDATED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        comp.status === 'PARTIALLY_VALIDATED' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        comp.status === 'OUTSIDE_MODEL_RANGE' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {comp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border bg-purple-950 text-purple-300 border-purple-800">
                        {comp.sourceType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* E. DATA GAPS & LIMITATIONS */}
      <Panel
        title="Documented Data Limitations & Known Gaps"
        subtitle="Explicit transparency on missing historical measurements in public Baghewala records"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
            <div className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Continuous Production Series
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Public literature (SPE 100642) contains snapshot pilot rates (120 BOPD peak) but lacks full continuous daily production histories.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
            <div className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Downhole Dynamometer Load Cards
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              SRP equipment configurations (50 Hz, 8 SPM) are documented, but continuous downhole dynamometer card data is unavailable.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
            <div className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Subsurface Temperature Radii
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Steam injection volumes (1500T) and soak durations (7d) are published, but radial temperature distribution logs are unrecorded.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
