import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useScenarioStore } from '../simulation/scenario';
import { DEMO_FIELD_OBSERVATIONS } from '../simulation/validation/demoData';
import { performDataQualityCheck } from '../simulation/validation/dataQualityEngine';
import {
  evaluateModelAgainstObservation,
  computeCalibrationMetricsSummary,
  DEFAULT_CALIBRATION_MULTIPLIERS,
  type CalibrationMultipliers,
} from '../simulation/validation/fieldCalibrationEngine';
import { propagateUncertainty, DEFAULT_UNCERTAINTY_RANGES } from '../simulation/validation/uncertaintyEngine';
import { performSensitivityAnalysis } from '../simulation/validation/sensitivityEngine';

export const HistoricalValidationPage: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const inputs = activeScenario.inputs;

  // Selected Reference Observation
  const [selectedObsId, setSelectedObsId] = useState<string>(DEMO_FIELD_OBSERVATIONS[0].id);
  const selectedObs = useMemo(
    () => DEMO_FIELD_OBSERVATIONS.find((o) => o.id === selectedObsId) || DEMO_FIELD_OBSERVATIONS[0],
    [selectedObsId]
  );

  // Calibration Multipliers State (Prototype Only)
  const [multipliers, setMultipliers] = useState<CalibrationMultipliers>(DEFAULT_CALIBRATION_MULTIPLIERS);

  // Residual Analysis Selected Parameter State
  const [residualParameter, setResidualParameter] = useState<'Reservoir Temperature' | 'Crude Viscosity' | 'Production Rate' | 'SRP Load Index'>('Production Rate');

  // Active Workflow Stage State
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<number>(3); // Default Model Replay

  // 1. Data Quality Evaluation
  const dataQuality = useMemo(() => performDataQualityCheck(DEMO_FIELD_OBSERVATIONS), []);

  // 2. Evaluated Residuals for Selected Observation
  const currentObsResiduals = useMemo(
    () => evaluateModelAgainstObservation(inputs, selectedObs, multipliers),
    [inputs, selectedObs, multipliers]
  );

  // 3. Calibration Summary Across Dataset
  const calibrationSummary = useMemo(
    () => computeCalibrationMetricsSummary(DEMO_FIELD_OBSERVATIONS, inputs, multipliers),
    [inputs, multipliers]
  );

  // 4. Uncertainty Envelopes
  const uncertaintyResult = useMemo(
    () => propagateUncertainty(inputs, DEFAULT_UNCERTAINTY_RANGES),
    [inputs]
  );

  // 5. Sensitivity Ranking
  const sensitivityResult = useMemo(
    () => performSensitivityAnalysis(inputs),
    [inputs]
  );

  const handleMultiplierChange = (key: keyof CalibrationMultipliers, val: string) => {
    const num = parseFloat(val);
    setMultipliers((prev) => ({
      ...prev,
      [key]: Number.isNaN(num) ? 1.0 : num,
    }));
  };

  const handleResetMultipliers = () => {
    setMultipliers(DEFAULT_CALIBRATION_MULTIPLIERS);
  };

  const workflowStages = [
    { step: 1, name: 'REFERENCE DATA', status: 'PASS', detail: '4 Reference Records Loaded' },
    { step: 2, name: 'DATA QUALITY CHECK', status: dataQuality.status, detail: `Quality Score: ${dataQuality.score}/100` },
    { step: 3, name: 'MODEL REPLAY', status: 'ACTIVE', detail: `Scenario: ${activeScenario.name}` },
    { step: 4, name: 'RESIDUAL CALCULATION', status: 'COMPLETE', detail: `Observed vs Modeled Deltas` },
    { step: 5, name: 'CALIBRATION', status: 'PROTOTYPE', detail: `Multipliers Active` },
    { step: 6, name: 'VALIDATION', status: 'COMPLETE', detail: `Error Metrics Computed` },
    { step: 7, name: 'UNCERTAINTY', status: 'COMPLETE', detail: `Low / Central / High Envelopes` },
    { step: 8, name: 'ENGINEERING REVIEW', status: 'REQUIRED', detail: `Advisory Determination` },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="Field Data Calibration & Historical Validation Workspace"
        subtitle="Compare reduced-order Digital Twin physics against historical field reference data, tune prototype calibration parameters, analyze residual errors, and evaluate output uncertainty"
        badgeText="PROMPT 6 HISTORICAL VALIDATION"
      />

      {/* PROTOTYPE & DEMO DATA SAFETY BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        <div className="bg-amber-950/40 border border-amber-800/80 p-3.5 rounded-lg flex items-center gap-3 text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              FIELD DATA / HISTORICAL VALIDATION — PROTOTYPE
            </div>
            <div className="text-[10px] text-amber-200/80 mt-0.5 font-sans">
              Validation workspace for comparing Digital Twin outputs against documented reference points. Model outputs require engineering review prior to field operational deployment.
            </div>
          </div>
        </div>

        <div className="bg-sky-950/40 border border-sky-800/80 p-3.5 rounded-lg flex items-center gap-3 text-sky-200">
          <Info className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <div className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">
              DEMONSTRATION DATA — NOT VERIFIED FIELD MEASUREMENTS
            </div>
            <div className="text-[10px] text-sky-200/80 mt-0.5 font-sans">
              All reference records are explicitly derived from published SPE/SHARP D4.1 reports or synthetic demonstration logs. Not live SCADA telemetry.
            </div>
          </div>
        </div>
      </div>

      {/* 1. DATA QUALITY AUDIT BANNER */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded font-bold text-xs uppercase flex items-center gap-1.5 ${
            dataQuality.status === 'PASS'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>DATA QUALITY: {dataQuality.status}</span>
          </div>

          <div className="text-slate-300">
            <span className="text-slate-400 text-[10px] block">Dataset Quality Score:</span>
            <strong className="text-sky-300 text-sm">{dataQuality.score} / 100</strong>
          </div>

          <div className="text-slate-300 border-l border-slate-800 pl-3">
            <span className="text-slate-400 text-[10px] block">Verified Records:</span>
            <strong className="text-slate-100">{dataQuality.validRecordsCount} / {dataQuality.totalRecordsChecked} Records</strong>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-400 font-sans">
          {dataQuality.issues.length > 0 ? (
            <span className="text-amber-300">{dataQuality.issues.length} Data Quality Warning(s) Logged</span>
          ) : (
            <span className="text-emerald-400">✓ All reference observations passed automated unit & range verification checks.</span>
          )}
        </div>
      </div>

      {/* 2. HISTORICAL VALIDATION WORKFLOW STEPPER */}
      <Panel title="Historical Validation Workflow Trace (Step 6.1)">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[10px]">
          {workflowStages.map((st) => (
            <div
              key={st.step}
              onClick={() => setActiveWorkflowStage(st.step)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                activeWorkflowStage === st.step
                  ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[9px] text-slate-500 font-bold">STAGE {st.step}</div>
              <div className="font-bold text-slate-200 mt-0.5 truncate">{st.name}</div>
              <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-900 text-sky-300 border border-slate-800">
                {st.status}
              </div>
              <div className="text-[8px] text-slate-400 mt-1 truncate">{st.detail}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 3. HISTORICAL VALIDATION TABLE & OBSERVATION SELECTOR */}
      <Panel
        title="Historical Validation Comparison Matrix (Step 6.2)"
        subtitle="Compare reference observation parameters against live Digital Twin physics outputs"
        action={
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold">Reference Observation:</span>
            <select
              value={selectedObsId}
              onChange={(e) => setSelectedObsId(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs font-bold focus:outline-none focus:border-sky-500"
            >
              {DEMO_FIELD_OBSERVATIONS.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.wellName} ({obs.sourceType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          {/* Observation Details Card */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Source Document:</span>
              <strong className="text-sky-300">{selectedObs.sourceDocument || 'Synthetic Log'}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Source Category:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-amber-300">
                {selectedObs.sourceType}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Observation Notes:</span>
              <span className="text-slate-300 font-sans text-xs">{selectedObs.notes}</span>
            </div>
          </div>

          {/* Detailed Validation Table */}
          <div className="overflow-x-auto rounded border border-slate-800">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5 text-right">Observed / Reference</th>
                  <th className="p-2.5 text-right">Twin Model (Modeled)</th>
                  <th className="p-2.5 text-right">Absolute Error</th>
                  <th className="p-2.5 text-right">Relative Error (%)</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5">Source Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-200 text-xs">
                {currentObsResiduals.map((res, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-slate-100">{res.parameterName}</td>
                    <td className="p-2.5 text-right text-slate-300 font-bold">
                      {res.observed.toLocaleString()} {res.unit}
                    </td>
                    <td className="p-2.5 text-right font-bold text-sky-400">
                      {res.modeledCalibrated.toLocaleString()} {res.unit}
                    </td>
                    <td className="p-2.5 text-right text-amber-300 font-bold">
                      {res.absErrorCalibrated.toLocaleString()} {res.unit}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-400">
                      {res.relErrorPercentCalibrated}%
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        res.relErrorPercentCalibrated < 15
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {res.relErrorPercentCalibrated < 15 ? 'LOW RESIDUAL' : 'HIGH RESIDUAL'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400 text-[10px] uppercase">{res.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      {/* 4. CALIBRATION ENGINE & BEFORE VS AFTER COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Calibration Multipliers Controls */}
        <Panel
          title="Calibration Multiplier Configurator (Step 6.3)"
          subtitle="Prototype calibration multipliers tune model output scale without altering physics equations"
          action={
            <button
              onClick={handleResetMultipliers}
              className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700 font-bold flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              RESET MULTIPLIERS
            </button>
          }
        >
          <div className="space-y-4">
            <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/60 text-[10px] text-amber-200">
              <strong className="text-amber-300 uppercase">Calibration Parameters — Prototype Only:</strong> Multipliers explicitly adjust reduced-order scaling. Physics solver equations remain unchanged.
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-300">Thermal Gain Multiplier:</span>
                  <span className="text-rose-400">{multipliers.thermalGainMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={multipliers.thermalGainMultiplier}
                  onChange={(e) => handleMultiplierChange('thermalGainMultiplier', e.target.value)}
                  className="w-full accent-rose-500 bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-300">Viscosity Multiplier:</span>
                  <span className="text-purple-300">{multipliers.viscosityMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={multipliers.viscosityMultiplier}
                  onChange={(e) => handleMultiplierChange('viscosityMultiplier', e.target.value)}
                  className="w-full accent-purple-500 bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-300">Production Rate Multiplier:</span>
                  <span className="text-emerald-400">{multipliers.productionMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={multipliers.productionMultiplier}
                  onChange={(e) => handleMultiplierChange('productionMultiplier', e.target.value)}
                  className="w-full accent-emerald-500 bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-300">SRP Rod Load Multiplier:</span>
                  <span className="text-amber-400">{multipliers.srpLoadMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={multipliers.srpLoadMultiplier}
                  onChange={(e) => handleMultiplierChange('srpLoadMultiplier', e.target.value)}
                  className="w-full accent-amber-500 bg-slate-900"
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Before vs After Calibration Metrics */}
        <Panel
          title="Before vs After Calibration Metrics (Step 6.4)"
          subtitle="MAE, RMSE, MAPE, Bias, and Error Reduction % across full dataset"
        >
          <div className="space-y-3 font-mono text-xs">
            {Object.entries(calibrationSummary).map(([param, metrics]) => (
              <div key={param} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <strong className="text-sky-300 font-bold">{param}</strong>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    metrics.improvementPercentage >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {metrics.improvementPercentage >= 0 ? `-${metrics.improvementPercentage}% Error` : `+${Math.abs(metrics.improvementPercentage)}% Error`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">BEFORE (UNCALIBRATED)</span>
                    <div className="text-slate-300">MAE: <strong className="text-amber-300">{metrics.uncalibratedMetrics.mae}</strong></div>
                    <div className="text-slate-300">RMSE: {metrics.uncalibratedMetrics.rmse}</div>
                    <div className="text-slate-300">MAPE: {metrics.uncalibratedMetrics.mape}%</div>
                    <div className="text-slate-300">Bias: {metrics.uncalibratedMetrics.bias}</div>
                  </div>

                  <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-0.5">
                    <span className="text-emerald-400 block uppercase font-bold text-[9px]">AFTER (CALIBRATED)</span>
                    <div className="text-slate-300">MAE: <strong className="text-emerald-400">{metrics.calibratedMetrics.mae}</strong></div>
                    <div className="text-slate-300">RMSE: {metrics.calibratedMetrics.rmse}</div>
                    <div className="text-slate-300">MAPE: {metrics.calibratedMetrics.mape}%</div>
                    <div className="text-slate-300">Bias: {metrics.calibratedMetrics.bias}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 5. INTERACTIVE RESIDUAL ANALYSIS CHART */}
      <Panel
        title="Model Residual Analysis (Step 6.5)"
        subtitle="Residual = Observed - Model (Positive: Model underpredicts | Negative: Model overpredicts)"
        action={
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold">Parameter:</span>
            <select
              value={residualParameter}
              onChange={(e) => setResidualParameter(e.target.value as any)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs font-bold focus:outline-none focus:border-sky-500"
            >
              <option value="Reservoir Temperature">Reservoir Temperature (°C)</option>
              <option value="Crude Viscosity">Crude Viscosity (cP)</option>
              <option value="Production Rate">Production Rate (BOPD)</option>
              <option value="SRP Load Index">SRP Load Index (/100)</option>
            </select>
          </div>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800 pb-1">
              <span>Reference Observations ({residualParameter})</span>
              <span>Zero Residual Base Reference</span>
            </div>

            {DEMO_FIELD_OBSERVATIONS.map((obs) => {
              const resList = evaluateModelAgainstObservation(inputs, obs, multipliers);
              const target = resList.find((r) => r.parameterName === residualParameter);
              const val = target ? target.residualCalibrated : 0;
              const isPositive = val >= 0;

              return (
                <div key={obs.id} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-200">{obs.wellName}:</span>
                    <span className={isPositive ? 'text-amber-400' : 'text-sky-400'}>
                      Residual: {val >= 0 ? `+${val}` : val} {target?.unit} ({isPositive ? 'Underpredicts' : 'Overpredicts'})
                    </span>
                  </div>

                  {/* Residual Visual Bar */}
                  <div className="h-4 bg-slate-900 rounded relative overflow-hidden flex items-center border border-slate-800">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />
                    {isPositive ? (
                      <div
                        className="h-full bg-amber-500/60 border-l border-amber-400 absolute left-1/2"
                        style={{ width: `${Math.min(45, Math.abs(val) * 2)}%` }}
                      />
                    ) : (
                      <div
                        className="h-full bg-sky-500/60 border-r border-sky-400 absolute right-1/2"
                        style={{ width: `${Math.min(45, Math.abs(val) * 2)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* 6. UNCERTAINTY & SENSITIVITY PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Uncertainty Envelopes */}
        <Panel
          title="Uncertainty Range Envelopes (LOW / CENTRAL / HIGH)"
          subtitle="Deterministic multi-point boundary evaluation under parameter bounds"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold bg-slate-900 p-2 rounded border border-slate-800 text-slate-400">
              <div>LOW BOUND</div>
              <div className="text-sky-400">CENTRAL CASE</div>
              <div>HIGH BOUND</div>
            </div>

            {uncertaintyResult.ranges.map((rng) => (
              <div key={rng.parameterName} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-[11px] text-slate-200">
                  <span>{rng.parameterName}</span>
                  <span className="text-slate-400 text-[10px]">{rng.unit}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-bold">
                  <div className="p-1.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-xs">
                    {rng.low}
                  </div>
                  <div className="p-1.5 rounded bg-sky-950 text-sky-200 border border-sky-800 text-xs">
                    {rng.central}
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-xs">
                    {rng.high}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Sensitivity Rankings */}
        <Panel
          title="Input Sensitivity Ranking (Step 6.7)"
          subtitle="Perturbation impact evaluation (+5°C, +20 TPD, +2 SPM)"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-sky-950/40 border border-sky-800/80 text-[10px] text-sky-200">
              <strong className="text-sky-300 block">Highest Calculated Sensitivity under Current Scenario:</strong>
              <span className="text-emerald-400 font-bold text-xs">{sensitivityResult.highestSensitivityParameter}</span>
            </div>

            <div className="space-y-2">
              {sensitivityResult.records.map((rec) => (
                <div key={rec.parameterName} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-200 text-xs">
                      #{rec.rank} {rec.parameterName} <span className="text-sky-400 text-[10px]">({rec.deltaInput})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ΔProd: <span className="text-emerald-400 font-bold">{rec.deltaProductionBopd >= 0 ? `+${rec.deltaProductionBopd}` : rec.deltaProductionBopd} BOPD</span> | ΔVisc: {rec.deltaViscosityPercent}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-bold text-xs border border-slate-800">
                      Score: {rec.normalizedSensitivityScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* 7. DOCUMENTED KNOWLEDGE GAPS & LIMITATIONS */}
      <Panel title="Documented Field Data Knowledge Gaps (SHARP D4.1 Table 6)">
        <div className="p-4 bg-slate-950 rounded border border-slate-800 space-y-2 text-slate-300 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Validation Boundaries & Unavailable Measurements</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Validation limited by unavailable continuous bottomhole pressure telemetry, steam front distribution logs, and downhole steam quality measurements. The Digital Twin engine does not fabricate missing observations.
          </p>
        </div>
      </Panel>
    </div>
  );
};
