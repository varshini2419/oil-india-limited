import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import {
  GitBranch,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { useScenarioStore, type Scenario } from '../simulation/scenario';
import { calculateThermalModel } from '../simulation/thermal';
import { calculateViscosityModel } from '../simulation/viscosity';
import { calculateMobilityModel } from '../simulation/mobility';
import { calculateProductionModel } from '../simulation/production';
import { optimizeSRP } from '../simulation/srpOptimization';
import { optimizeCSS } from '../simulation/cssOptimization';
import { analyzeAIRisk } from '../simulation/riskEngine';

export const ScenariosPage: React.FC = () => {
  const { presets, activeScenario, loadPreset } = useScenarioStore();
  const navigate = useNavigate();

  const handleSelectScenario = (preset: Scenario) => {
    loadPreset(preset.id);
    navigate('/simulation');
  };

  // Helper to compute deterministic preview pipeline for a scenario preset card
  const getScenarioChain = (preset: Scenario) => {
    const thermal = calculateThermalModel(preset);
    const evalTemp = Math.max(preset.inputs.reservoirTemperatureC, thermal.predictedReservoirTemperatureC);
    const viscosity = calculateViscosityModel(evalTemp, 48.0);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, evalTemp);
    const production = calculateProductionModel(
      mobility.mobilityDcP,
      evalTemp,
      viscosity.estimatedViscosityCp,
      30.0,
      preset.inputs.vfdFrequencyHz,
      preset.inputs.spm,
      preset.inputs.strokeLengthMeters
    );
    const srp = optimizeSRP({
      vfdFrequencyHz: preset.inputs.vfdFrequencyHz,
      spm: preset.inputs.spm,
      strokeLengthM: preset.inputs.strokeLengthMeters,
      oilMobilityDcp: mobility.mobilityDcP,
      effectiveDrawdownBar: 30.0,
      temperatureC: evalTemp,
      viscosityCp: viscosity.estimatedViscosityCp,
    });
    const css = optimizeCSS({
      steamInjectionRateTpd: preset.inputs.steamInjectionRateTpd,
      steamInjectionTemperatureC: 300.0,
      steamQualityFraction: preset.inputs.steamQualityPercent / 100.0,
      injectionDurationDays: 5.0,
      soakDurationDays: preset.inputs.soakDurationDays,
      productionDurationDays: 90.0,
      reservoirTemperatureC: evalTemp,
      reservoirPressureBar: 90.0,
      baselineViscosityCp: viscosity.estimatedViscosityCp,
      baselineMobilityDPerCp: mobility.mobilityDcP,
      baselineProductionBopd: production.estimatedProductionBopd,
      vfdFrequencyHz: preset.inputs.vfdFrequencyHz,
      spm: preset.inputs.spm,
      strokeLengthMeters: preset.inputs.strokeLengthMeters,
    });
    const risk = analyzeAIRisk({
      temperatureC: evalTemp,
      viscosityCp: viscosity.estimatedViscosityCp,
      mobilityDPerCp: mobility.mobilityDcP,
      productionBopd: production.estimatedProductionBopd,
      vfdFrequencyHz: preset.inputs.vfdFrequencyHz,
      spm: preset.inputs.spm,
      strokeLengthMeters: preset.inputs.strokeLengthMeters,
      steamInjectionRateTpd: preset.inputs.steamInjectionRateTpd,
      srpLoadIndex: srp.currentCandidate.loadIndex,
      cssThermalGainC: css.thermalBreakdown.deltaTemperatureC,
    });

    // Consequence Text Summary
    let consequence = '';
    if (preset.id === 'BAGHEWALA_BASELINE') {
      consequence = 'Nominal unheated baseline: Viscosity ~5,014 cP, steady oil production 6.90 BOPD under standard 8 SPM lift.';
    } else if (preset.id === 'BAGHEWALA_THERMAL_IMPROVEMENT') {
      consequence = 'Thermal gain (+17.9°C) reduces crude viscosity to ~778 cP, boosting fluid mobility +407% & oil rate to 14.50 BOPD.';
    } else if (preset.id === 'BAGHEWALA_COOLING_HIGH_VISCOSITY') {
      consequence = 'Cold reservoir (32°C, 0 TPD steam) spikes crude viscosity to >25,000 cP, severely choking wellbore inflow.';
    } else if (preset.id === 'BAGHEWALA_HIGH_SRP_LOAD') {
      consequence = 'High pumping speed (18 SPM, 68 Hz VFD) pushes sucker rod mechanical load index to 86.8/100, accelerating rod stress.';
    } else if (preset.id === 'BAGHEWALA_COMBINED_OPTIMIZATION') {
      consequence = 'Steam soak (140 TPD, 80°C) paired with 16 SPM lift delivers 23.40 BOPD while elevating mechanical & thermal risk alerts.';
    } else {
      consequence = `Evaluated at ${evalTemp.toFixed(1)}°C, producing ${production.estimatedProductionBopd.toFixed(2)} BOPD.`;
    }

    return { thermal, viscosity, mobility, production, srp, css, risk, evalTemp, consequence };
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-sky-950/60 border border-sky-800/80 rounded-lg p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-sky-200">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span>DEMO MODE — SIMULATED DEMONSTRATION DATA</span>
        </div>
        <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>REAL FIELD DATA: NOT CONNECTED (Advisory Support Only)</span>
        </div>
      </div>

      <PageHeader
        title="Interactive What-If Scenario Demonstration Workstation"
        subtitle="5 core operational scenarios evaluating physical causal chain: INPUT → RESULT → CONSEQUENCE → RISK → ADVISORY"
        badgeText="Step 5.4 What-If Scenarios"
      />

      {/* Overview Card Banner */}
      <Panel title="Scenario Demonstration Causal Flow Pipeline">
        <div className="space-y-3 font-mono text-xs">
          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            Every scenario runs through the exact same validated physics pipeline (Thermal Conduction $\rightarrow$ Log-Linear Viscosity $\rightarrow$ Mobility $\rightarrow$ Heavy-Oil IPR Production $\rightarrow$ SRP Dynamometer Load $\rightarrow$ CSS Soak Optimization $\rightarrow$ AI Risk Advisory). Select any scenario to update the global <strong className="text-sky-300 font-mono">ScenarioStore</strong> state.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
            <div className="p-2.5 bg-slate-950 rounded border border-sky-900/60 text-sky-400">
              <span className="font-bold block">1. INPUT</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">Res Temp / Steam / VFD / SPM</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-purple-900/60 text-purple-400">
              <span className="font-bold block">2. RESULT</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">Temp / Viscosity / Mobility / BOPD</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-emerald-900/60 text-emerald-400">
              <span className="font-bold block">3. CONSEQUENCE</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">Physical Shift & Transport Effect</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-amber-900/60 text-amber-400">
              <span className="font-bold block">4. RISK</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">Mechanical / Viscosity Alerts</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-rose-900/60 text-rose-400">
              <span className="font-bold block">5. ADVISORY</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">0 Actuation Decision Support</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* 5 Scenario Presets Cards */}
      <div className="space-y-4 font-mono text-xs">
        {presets.map((preset) => {
          const isActive = activeScenario.id === preset.id;
          const chain = getScenarioChain(preset);
          const riskLevel = chain.risk.riskLevel;

          return (
            <div
              key={preset.id}
              className={`bg-slate-900 border rounded-lg p-5 transition-all space-y-4 ${
                isActive
                  ? 'border-sky-500 ring-1 ring-sky-500 shadow-2xl bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Info & Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-slate-950 text-sky-400 rounded border border-sky-800/60 font-bold">
                    {preset.id.replace('BAGHEWALA_', '')}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <span>{preset.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isActive && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ACTIVE SIMULATION STATE</span>
                    </span>
                  )}
                  <button
                    onClick={() => handleSelectScenario(preset)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg'
                        : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isActive ? 'RE-SIMULATE ACTIVE' : 'LOAD & SIMULATE SCENARIO'}</span>
                  </button>
                </div>
              </div>

              {/* 5-STAGE CAUSAL CHAIN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* 1. INPUT */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Sliders className="w-3 h-3 text-sky-400" />
                    <span>1. INPUT</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between"><span>Res Temp:</span><strong className="text-rose-400">{preset.inputs.reservoirTemperatureC}°C</strong></div>
                    <div className="flex justify-between"><span>Steam:</span><strong className="text-amber-400">{preset.inputs.steamInjectionRateTpd} t/d</strong></div>
                    <div className="flex justify-between"><span>VFD:</span><strong className="text-slate-200">{preset.inputs.vfdFrequencyHz} Hz</strong></div>
                    <div className="flex justify-between"><span>SPM:</span><strong className="text-slate-200">{preset.inputs.spm} SPM</strong></div>
                  </div>
                </div>

                {/* 2. RESULT */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span>2. RESULT</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between"><span>Eval Temp:</span><strong className="text-rose-400">{chain.evalTemp.toFixed(1)}°C</strong></div>
                    <div className="flex justify-between"><span>Viscosity:</span><strong className="text-purple-300">{chain.viscosity.estimatedViscosityCp.toLocaleString()} cP</strong></div>
                    <div className="flex justify-between"><span>Mobility:</span><strong className="text-emerald-400">{chain.mobility.mobilityDcP.toFixed(4)} D/cP</strong></div>
                    <div className="flex justify-between"><span>Oil Rate:</span><strong className="text-sky-300">{chain.production.estimatedProductionBopd.toFixed(2)} BOPD</strong></div>
                  </div>
                </div>

                {/* 3. CONSEQUENCE */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5 md:col-span-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>3. CONSEQUENCE</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {chain.consequence}
                  </p>
                </div>

                {/* 4. RISK */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>4. RISK</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">Level:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        riskLevel === 'MODERATE' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {riskLevel} ({chain.risk.riskScore}/100)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Load Index: <strong className="text-amber-300">{chain.srp.currentCandidate.loadIndex.toFixed(0)}/100</strong>
                    </div>
                    {chain.risk.detectedIssues.length > 0 ? (
                      <div className="text-[9px] text-amber-400 font-mono line-clamp-2">
                        Alert: {chain.risk.detectedIssues[0].title}
                      </div>
                    ) : (
                      <div className="text-[9px] text-emerald-400 font-mono">
                        ✓ Within safe limits
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. ADVISORY */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>5. ADVISORY</span>
                    <span className="text-[9px] text-slate-500">0 ACTUATION</span>
                  </div>
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="text-sky-300 font-bold">
                      SRP Target: {chain.srp.optimalCandidate.vfdFrequencyHz} Hz / {chain.srp.optimalCandidate.spm} SPM
                    </div>
                    <div className="text-amber-300">
                      CSS Target: {chain.css.optimalCandidate.steamInjectionRateTpd} TPD @ {chain.css.optimalCandidate.soakDurationDays}d soak
                    </div>
                    <div className="text-slate-400 text-[9px] font-sans italic border-t border-slate-900 pt-1">
                      Advisory support only — requires field engineer review.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="Scenario Synchronization Note">
        <div className="flex items-start gap-3 text-xs text-slate-400 font-mono">
          <GitBranch className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <p>
            Selecting a scenario loads its initial inputs into the application-wide shared simulation state (<strong className="text-sky-300">ScenarioStore</strong>). Model updates, 2D Digital Twin schematic animations, viscosity-mobility curves, AI risk advisories, and report exports update synchronously across all 21 routes.
          </p>
        </div>
      </Panel>
    </div>
  );
};
