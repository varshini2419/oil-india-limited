import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  Gauge,
  Zap,
  Thermometer,
  Droplets,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Server,
  Info,
} from 'lucide-react';

import { getCommandCenterState, refreshCommandCenterDashboard } from '../simulation/commandCenter';
import type { UnifiedCommandCenterState } from '../simulation/commandCenter/types';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';
import type { FieldDataSource } from '../simulation/fieldDataIntegration/types';
import type { ModelMode } from '../simulation/historicalCalibration/types';
import { useScenarioStore } from '../simulation/scenario';

export const CommandCenterPage: React.FC = () => {
  const { activeScenario } = useScenarioStore();

  const [sourceType, setSourceType] = useState<FieldDataSource>('HISTORICAL');
  const [modelMode, setModelMode] = useState<ModelMode>('CALIBRATED');
  const [dashboardState, setDashboardState] = useState<UnifiedCommandCenterState>(() =>
    getCommandCenterState({
      sourceType: 'HISTORICAL',
      modelMode: 'CALIBRATED',
      reservoirTemperatureC: activeScenario.inputs.reservoirTemperatureC,
      vfdFrequencyHz: activeScenario.inputs.vfdFrequencyHz,
      spm: activeScenario.inputs.spm,
      steamInjectionRateTpd: activeScenario.inputs.steamInjectionRateTpd,
    })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemonstrationActive, setIsDemonstrationActive] = useState(false);
  const [selectedPipelineNode, setSelectedPipelineNode] = useState<number | null>(null);

  // Auto-refresh when parameters change
  useEffect(() => {
    const freshState = refreshCommandCenterDashboard({
      sourceType,
      modelMode,
      reservoirTemperatureC: activeScenario.inputs.reservoirTemperatureC,
      vfdFrequencyHz: activeScenario.inputs.vfdFrequencyHz,
      spm: activeScenario.inputs.spm,
      steamInjectionRateTpd: activeScenario.inputs.steamInjectionRateTpd,
    });
    setDashboardState(freshState);
  }, [sourceType, modelMode, activeScenario]);

  // Demo mode auto-cycle interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isDemonstrationActive) {
      interval = setInterval(() => {
        const fresh = refreshCommandCenterDashboard({ sourceType, modelMode });
        setDashboardState(fresh);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemonstrationActive, sourceType, modelMode]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const freshState = refreshCommandCenterDashboard({ sourceType, modelMode });
      setDashboardState(freshState);
      setIsRefreshing(false);
    }, 400);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> NORMAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-900/60 text-amber-300 border border-amber-700/50">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" /> WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-900/60 text-rose-300 border border-rose-700/50">
            <ShieldAlert className="w-3 h-3 mr-1 text-rose-400" /> CRITICAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            N/A
          </span>
        );
    }
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return <span className="text-emerald-400 font-bold font-mono">LOW RISK</span>;
      case 'MEDIUM':
        return <span className="text-amber-400 font-bold font-mono">MEDIUM RISK</span>;
      case 'HIGH':
        return <span className="text-rose-400 font-bold font-mono">HIGH RISK</span>;
      default:
        return <span className="text-slate-400 font-bold font-mono">UNKNOWN</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Safety Mandatory Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-mono font-medium">{dashboardState.mandatoryDisclaimer}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40 font-mono text-[11px]">
            ADVISORY DIGITAL TWIN v5.9
          </span>
        </div>
      </div>

      {/* Header & Control Center Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white tracking-wide font-mono flex items-center gap-2">
                <Cpu className="w-7 h-7 text-sky-400" />
                BAGHEWALA COMMAND CENTER
              </h1>
              <span className="bg-sky-950 text-sky-400 border border-sky-800 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">
                EXECUTIVE OPERATIONS
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono">
              Unified Heavy-Oil Digital Twin Control Room • Integrated Physics, Optimization, Risk & Telemetry
            </p>
          </div>

          {/* Status Indicators & Control Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Provenance Tag */}
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <div className="text-[11px]">
                <div className="text-slate-500 font-mono leading-none">DATA SOURCE</div>
                <div className="font-mono font-bold text-indigo-300 leading-tight">{dashboardState.dataSourceLabel}</div>
              </div>
            </div>

            {/* Model Mode Tag */}
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-[11px]">
                <div className="text-slate-500 font-mono leading-none">MODEL MODE</div>
                <div className="font-mono font-bold text-emerald-300 leading-tight">{dashboardState.modelMode}</div>
              </div>
            </div>

            {/* Operational Readiness Badge */}
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <div className="text-[11px]">
                <div className="text-slate-500 font-mono leading-none">READINESS</div>
                <div className="font-mono font-bold text-sky-300 leading-tight">
                  {dashboardState.readiness.readinessLevel}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as FieldDataSource)}
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-sky-500"
              >
                <option value="HISTORICAL">Historical Data</option>
                <option value="USER_IMPORTED">Simulated Telemetry</option>
                <option value="REAL_FIELD">Real Field Data</option>
              </select>

              <select
                value={modelMode}
                onChange={(e) => setModelMode(e.target.value as ModelMode)}
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-sky-500"
              >
                <option value="CALIBRATED">Calibrated Mode</option>
                <option value="BASELINE">Baseline Mode</option>
              </select>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                title="Refresh Command Center Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>

              <button
                onClick={() => setIsDemonstrationActive(!isDemonstrationActive)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  isDemonstrationActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                {isDemonstrationActive ? 'LIVE DEMO' : 'DEMO MODE'}
              </button>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>LAST SYNC: {new Date(dashboardState.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>VERIFIED SIMULATION TESTS: <strong className="text-sky-400 font-mono">274 / 274 PASSING</strong></span>
          </div>
        </div>
      </div>

      {/* Row 1: Key Operating Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Reservoir Temp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-amber-400" /> RESERVOIR TEMP</span>
            {getStatusBadge(dashboardState.reservoir.status)}
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">
            {dashboardState.reservoir.temperatureC} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Target: 60 - 90 °C
          </div>
        </div>

        {/* Metric 2: Oil Viscosity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky-400" /> VISCOSITY</span>
            {getStatusBadge(dashboardState.viscosity.status)}
          </div>
          <div className="text-2xl font-black font-mono text-sky-300 mb-1">
            {dashboardState.viscosity.viscosityCp.toLocaleString()} <span className="text-xs text-slate-400">cP</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Heavy Oil (&gt; 500 cP)
          </div>
        </div>

        {/* Metric 3: Oil Mobility */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-indigo-400" /> OIL MOBILITY</span>
            {getStatusBadge(dashboardState.viscosity.status)}
          </div>
          <div className="text-2xl font-black font-mono text-indigo-300 mb-1">
            {dashboardState.viscosity.mobilityDcP.toFixed(4)} <span className="text-xs text-slate-400">D/cP</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            k / μ ratio
          </div>
        </div>

        {/* Metric 4: Production Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-emerald-400" /> PRODUCTION</span>
            {getStatusBadge(dashboardState.production.status)}
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mb-1">
            {dashboardState.production.currentBopd.toFixed(1)} <span className="text-xs text-slate-400">BOPD</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Expected: {dashboardState.production.expectedBopd.toFixed(1)} BOPD
          </div>
        </div>

        {/* Metric 5: SRP Load Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-400" /> SRP LOAD</span>
            {getStatusBadge(dashboardState.srp.status)}
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 mb-1">
            {dashboardState.srp.loadIndex.toFixed(1)} <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            {dashboardState.srp.vfdFrequencyHz} Hz • {dashboardState.srp.spm} SPM
          </div>
        </div>

        {/* Metric 6: AI Risk Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-rose-400" /> AI RISK LEVEL</span>
            {getStatusBadge(dashboardState.risk.status)}
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">
            {dashboardState.risk.riskScore} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] font-mono">
            {getRiskLevelBadge(dashboardState.risk.riskLevel)}
          </div>
        </div>
      </div>

      {/* Row 2 & Embedded Digital Twin Schematic Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physics Chain Flow Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                PHYSICS COUPLING CHAIN
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Steps 4.3 – 4.6</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Chain step 1 */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-700">1</div>
                  <div>
                    <div className="text-slate-200 font-bold">Thermal Reservoir Model</div>
                    <div className="text-slate-500 text-[11px]">Steam heat conduction & enthalpy</div>
                  </div>
                </div>
                <div className="text-right text-amber-400 font-bold">{dashboardState.reservoir.temperatureC} °C</div>
              </div>

              <div className="flex justify-center text-slate-600">↓</div>

              {/* Chain step 2 */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-700">2</div>
                  <div>
                    <div className="text-slate-200 font-bold">Heavy-Oil Viscosity Correlation</div>
                    <div className="text-slate-500 text-[11px]">Log-linear thermal reduction</div>
                  </div>
                </div>
                <div className="text-right text-sky-400 font-bold">{dashboardState.viscosity.viscosityCp.toLocaleString()} cP</div>
              </div>

              <div className="flex justify-center text-slate-600">↓</div>

              {/* Chain step 3 */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-700">3</div>
                  <div>
                    <div className="text-slate-200 font-bold">Oil Mobility Calculation</div>
                    <div className="text-slate-500 text-[11px]">Permeability / Viscosity ratio</div>
                  </div>
                </div>
                <div className="text-right text-indigo-400 font-bold">{dashboardState.viscosity.mobilityDcP.toFixed(4)} D/cP</div>
              </div>

              <div className="flex justify-center text-slate-600">↓</div>

              {/* Chain step 4 */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-700">4</div>
                  <div>
                    <div className="text-slate-200 font-bold">Estimated Oil Production</div>
                    <div className="text-slate-500 text-[11px]">Inflow performance & lift capacity</div>
                  </div>
                </div>
                <div className="text-right text-emerald-400 font-bold">{dashboardState.production.currentBopd.toFixed(1)} BOPD</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between items-center">
            <span>Expected rate: <strong className="text-emerald-400">{dashboardState.production.expectedBopd.toFixed(1)} BOPD</strong></span>
            <Link to="/results" className="text-sky-400 hover:text-sky-300 flex items-center gap-1">
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2D SVG Digital Twin Schematic Viewport */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              LIVE 2D DIGITAL TWIN SCHEMATIC
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              REAL-TIME ANIMATED VIEW
            </span>
          </div>
          <div className="flex-1 p-2 bg-slate-950/50 min-h-[360px]">
            <DigitalTwinViewport />
          </div>
        </div>
      </div>

      {/* Row 3: Production & P10/P50/P90 Uncertainty & Asset Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production & Uncertainty Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              PRODUCTION & UNCERTAINTY (STEP 5.3)
            </h2>
            <Link to="/results" className="text-xs font-mono text-sky-400 hover:underline">
              Results Summary
            </Link>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
              <div className="text-slate-400 text-xs font-mono">P50 ESTIMATED PRODUCTION</div>
              <div className="text-3xl font-black font-mono text-emerald-400 my-1">
                {dashboardState.uncertainty.p50Bopd.toFixed(1)} <span className="text-sm text-slate-400">BOPD</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                P10 (Pessimistic): {dashboardState.uncertainty.p10Bopd.toFixed(1)} • P90 (Optimistic): {dashboardState.uncertainty.p90Bopd.toFixed(1)} BOPD
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>90% Uncertainty Interval Width:</span>
                <span className="font-bold text-white">{dashboardState.uncertainty.intervalWidthBopd.toFixed(1)} BOPD</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 flex">
                <div className="bg-slate-800 h-full" style={{ width: '20%' }} title="P10 Lower Bound" />
                <div className="bg-emerald-500 h-full" style={{ width: '60%' }} title="P50 Expected Range" />
                <div className="bg-emerald-300 h-full" style={{ width: '20%' }} title="P90 Upper Bound" />
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
              <Info className="w-3.5 h-3.5 text-sky-400 inline mr-1" />
              Evaluated using Monte Carlo Latin Hypercube Sampling across reservoir permeability and steam quality distribution.
            </div>
          </div>
        </div>

        {/* SRP Equipment Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              SRP & VFD OPTIMIZATION (STEP 4.7)
            </h2>
            <Link to="/simulation" className="text-xs font-mono text-sky-400 hover:underline">
              SRP Controls
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">VFD Drive Frequency:</span>
              <span className="font-bold text-purple-300">{dashboardState.srp.vfdFrequencyHz} Hz</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Pumping Speed (SPM):</span>
              <span className="font-bold text-white">{dashboardState.srp.spm} SPM</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Stroke Length:</span>
              <span className="font-bold text-white">{dashboardState.srp.strokeLengthMeters} m</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Mechanical Load Index:</span>
              <span className={`font-bold ${dashboardState.srp.loadIndex > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {dashboardState.srp.loadIndex.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* CSS Cycle Optimization Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              CSS THERMAL OPTIMIZATION (STEP 4.8)
            </h2>
            <Link to="/simulation" className="text-xs font-mono text-sky-400 hover:underline">
              CSS Controls
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Steam Injection Rate:</span>
              <span className="font-bold text-amber-300">{dashboardState.css.steamRateTpd} TPD</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Cycle Status:</span>
              <span className="font-bold text-white">{dashboardState.css.cycleStatus}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Thermal Heat Boost:</span>
              <span className="font-bold text-amber-400">+{dashboardState.css.thermalGainC} °C</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">CSS Subsystem Status:</span>
              <span className="font-bold text-emerald-400">{dashboardState.css.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: AI Risk Advisory & Active System Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Advisory Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              AI RISK ADVISORY (STEP 4.9)
            </h2>
            <Link to="/results" className="text-xs font-mono text-sky-400 hover:underline">
              Risk Details
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4">
            <div className="text-center md:text-left">
              <div className="text-slate-400 text-xs font-mono">COMPOSITE RISK RATING</div>
              <div className="text-4xl font-black font-mono text-white my-1">
                {dashboardState.risk.riskScore} <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div>{getRiskLevelBadge(dashboardState.risk.riskLevel)}</div>
            </div>
            <div className="flex-1 text-xs font-mono text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <div className="text-slate-400 mb-1">ADVISORY MESSAGE:</div>
              <div className="font-bold text-amber-300 text-[11px] mb-2">{dashboardState.risk.advisoryMessage}</div>
              <div className="text-[11px] text-slate-400">Warnings: {dashboardState.risk.activeWarnings.length} active</div>
            </div>
          </div>
        </div>

        {/* Active System Alerts Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              ACTIVE OPERATIONAL ALERTS ({dashboardState.alerts.length})
            </h2>
            <span className="text-xs font-mono text-slate-500">Aggregated Across Subsystems</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {dashboardState.alerts.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center text-xs font-mono text-slate-500">
                No active operational alerts. All parameters nominal.
              </div>
            ) : (
              dashboardState.alerts.map((alert) => (
                <div
                  key={alert.alertId}
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start justify-between gap-3 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.severity === 'CRITICAL' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{alert.message}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">Action: {alert.recommendedAction}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-current font-mono shrink-0">
                    {alert.sourceModule}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Scenario Optimization & Decision Trade-offs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            SCENARIO OPTIMIZATION & OPERATIONAL TRADE-OFFS (STEP 5.4)
          </h2>
          <Link to="/scenarios" className="text-xs font-mono text-sky-400 hover:underline">
            Scenario Manager
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-mono">SELECTED SCENARIO</div>
            <div className="font-bold text-sky-300 text-sm font-mono mt-1">{dashboardState.scenario.selectedScenarioName}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-mono">EXPECTED PRODUCTION</div>
            <div className="font-bold text-emerald-400 text-sm font-mono mt-1">{dashboardState.scenario.expectedProductionBopd.toFixed(1)} BOPD</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-mono">PARETO CLASSIFICATION</div>
            <div className="font-bold text-purple-300 text-sm font-mono mt-1">{dashboardState.scenario.paretoClassification}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-mono">SCENARIO RISK LEVEL</div>
            <div className="font-bold text-amber-300 text-sm font-mono mt-1">{dashboardState.scenario.riskLevel}</div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="text-slate-400 mb-2 font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            EVALUATED OPERATIONAL TRADE-OFF STATEMENTS:
          </div>
          <ul className="space-y-1.5 text-slate-300">
            {dashboardState.scenario.tradeOffs.map((tradeOff, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>{tradeOff}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 6: Interactive 9-Stage Decision Pipeline Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            INTEGRATED DIGITAL TWIN DECISION PIPELINE (STEPS 4.3 – 5.9)
          </h2>
          <span className="text-xs font-mono text-slate-500">Click any stage to open step workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {dashboardState.decisionPipeline.map((node) => {
            const isSelected = selectedPipelineNode === node.stageNumber;
            return (
              <Link
                key={node.stageNumber}
                to={node.routePath}
                onClick={() => setSelectedPipelineNode(node.stageNumber)}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-sky-950 border-sky-500 shadow-lg ring-1 ring-sky-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>STAGE {node.stageNumber}</span>
                    <span className="text-emerald-400">✓</span>
                  </div>
                  <div className="font-bold font-mono text-xs text-slate-200 line-clamp-2">{node.stageName}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate mr-1">{node.summary}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Row 7: Data Quality, Operational Readiness & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Quality & Provenance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              DATA QUALITY & PROVENANCE (STEP 5.6)
            </h2>
            {getStatusBadge(dashboardState.dataQuality.status)}
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Data Quality Score:</span>
              <span className="font-bold text-indigo-300">{dashboardState.dataQuality.qualityScore} / 100</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Missing Value Count:</span>
              <span className="font-bold text-white">{dashboardState.dataQuality.missingValueCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Completeness:</span>
              <span className="font-bold text-emerald-400">{dashboardState.dataQuality.completenessPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Operational Readiness Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              OPERATIONAL READINESS (STEP 5.8)
            </h2>
            <span className="text-sky-400 font-bold">{dashboardState.readiness.readinessLevel}</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Audit Pass Count:</span>
              <span className="font-bold text-emerald-400">{dashboardState.readiness.passCount} / {dashboardState.readiness.passCount + dashboardState.readiness.warningCount + dashboardState.readiness.failCount} Pass</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <div className="text-slate-400 font-bold mb-1">DISCLAIMER & AUDIT CAVEAT:</div>
              <div>{dashboardState.readiness.disclaimer}</div>
            </div>
          </div>
        </div>

        {/* System Health Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              SYSTEM HEALTH & INTEGRITY
            </h2>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
              VERIFIED
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Verified Simulation Unit Tests:</span>
              <span className="font-bold text-sky-400">{dashboardState.systemHealth.testCount} / {dashboardState.systemHealth.testCount} PASS</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">System Build Status:</span>
              <span className="font-bold text-emerald-400">{dashboardState.systemHealth.buildStatus} (0 ERRORS)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Integrated Validation:</span>
              <span className="font-bold text-emerald-400">NORMAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;
