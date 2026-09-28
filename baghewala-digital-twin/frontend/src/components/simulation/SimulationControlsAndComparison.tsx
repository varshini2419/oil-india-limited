import React, { useState, useEffect, useRef } from 'react';
import {
  useScenarioStore,
  type ScenarioInputValues,
} from '../../simulation/scenario';
import {
  Thermometer,
  Zap,
  Wind,
  Droplet,
  RotateCcw,
  Play,
  ChevronDown,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Gauge,
  Flame,
} from 'lucide-react';

interface PremiumSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  accentColor: 'sky' | 'rose' | 'amber' | 'purple';
}

const colorMaps = {
  sky: {
    fill: 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-sky-500/30',
    thumb: 'border-sky-500 shadow-sky-500/40 text-sky-500',
    badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
    iconText: 'text-sky-500 dark:text-sky-400',
  },
  rose: {
    fill: 'bg-gradient-to-r from-rose-400 to-red-500 shadow-rose-500/30',
    thumb: 'border-rose-500 shadow-rose-500/40 text-rose-500',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
    iconText: 'text-rose-500 dark:text-rose-400',
  },
  amber: {
    fill: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30',
    thumb: 'border-amber-500 shadow-amber-500/40 text-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    iconText: 'text-amber-500 dark:text-amber-400',
  },
  purple: {
    fill: 'bg-gradient-to-r from-purple-400 to-indigo-500 shadow-purple-500/30',
    thumb: 'border-purple-500 shadow-purple-500/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
    badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
    iconText: 'text-purple-500 dark:text-purple-400',
  },
};

const PremiumSlider: React.FC<PremiumSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  icon,
  accentColor,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const colors = colorMaps[accentColor];

  const handleStepDown = () => {
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleStepUp = () => {
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {icon && <span className={colors.iconText}>{icon}</span>}
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs border shadow-sm ${colors.badge}`}>
            {value} <span className="text-[10px] font-sans opacity-70 font-semibold">{unit}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleStepDown}
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
          title="Decrease"
        >
          -
        </button>

        <div className="relative flex-1 h-5 flex items-center">
          {/* Track background */}
          <div className="absolute w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            {/* Active filled bar */}
            <div
              className={`h-full rounded-full transition-all duration-75 shadow-sm ${colors.fill}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Native HTML input overlay for smooth touch/drag */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          />

          {/* Custom thumb */}
          <div
            className={`absolute w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 shadow-md pointer-events-none transition-transform duration-100 group-hover:scale-125 z-10 ${colors.thumb}`}
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>

        <button
          type="button"
          onClick={handleStepUp}
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
          title="Increase"
        >
          +
        </button>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 px-7">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

export const SimulationControlsAndComparison: React.FC = () => {
  const {
    activeScenario,
    presets,
    updateInput,
    updateDetails,
    saveCurrentScenario,
    resetCurrentToBaseline,
    loadPreset,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    commitSimulationRun,
  } = useScenarioStore();

  const [localInputs, setLocalInputs] = useState<ScenarioInputValues>(activeScenario.inputs);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalInputs(activeScenario.inputs);
  }, [activeScenario.inputs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const inputs = localInputs;

  const handleSliderChange = (key: keyof ScenarioInputValues, val: number) => {
    setLocalInputs((prev) => ({ ...prev, [key]: val }));
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateInput(key, val);
    }, 120);
  };

  const handleReset = () => {
    resetCurrentToBaseline();
  };

  const handleSave = () => {
    saveCurrentScenario();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSimulateClick = () => {
    if (!activeScenario.validation.isValid) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    (Object.keys(localInputs) as Array<keyof ScenarioInputValues>).forEach((key) => {
      updateInput(key, localInputs[key]);
    });
    commitSimulationRun();
  };

  const heatLossKw = ((inputs.ambientTemperatureC - 35) * 0.12 + inputs.windSpeedKmh * 0.05).toFixed(1);

  return (
    <div className="space-y-4 font-sans text-sm">
      {/* 1. TOP CONTROL CARD: SCENARIO SELECTOR & RUN ACTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Header Title & Status */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              SIMULATION CONTROLS
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            INTERACTIVE
          </span>
        </div>

        {/* Preset Selector Dropdown - Cleanly Fitted Full Width */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Reference Presets</span>
            <span className="text-[10px] font-mono text-slate-400">({presets.length} available)</span>
          </label>
          <div className="relative w-full">
            <select
              value={activeScenario.id}
              onChange={(e) => {
                if (e.target.value) loadPreset(e.target.value);
              }}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer shadow-sm pr-9 transition-all truncate"
            >
              <option value="" disabled>Select a Preset Scenario...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id} className="py-1">
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Scenario Name & Action Buttons Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Active Scenario Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeScenario.name}
              onChange={(e) => updateDetails(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
              placeholder="Custom Scenario Name"
            />
            <button
              onClick={handleSave}
              className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Save Scenario Changes"
            >
              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs transition-all shadow-sm cursor-pointer"
              title="Reset to Baghewala Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prominent Run Simulation Button */}
        <button
          onClick={handleSimulateClick}
          disabled={!activeScenario.validation.isValid}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            activeScenario.validation.isValid
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN SIMULATION</span>
        </button>

        {!activeScenario.validation.isValid && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-500 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Parameters outside physical limits. Correct sliders before running.</span>
          </div>
        )}
      </div>

      {/* 2. PARAMETER SECTIONS */}
      <div className="space-y-4">
        {/* SECTION 1: SURFACE WEATHER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider text-xs">
              <Wind className="w-4 h-4" />
              <span>Surface Weather</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 font-mono font-bold">
              BOUNDARY
            </span>
          </div>

          <div className="space-y-3.5">
            <PremiumSlider
              label="Ambient Temperature"
              value={inputs.ambientTemperatureC}
              min={0}
              max={55}
              step={1}
              unit="°C"
              onChange={(v) => handleSliderChange('ambientTemperatureC', v)}
              icon={<Thermometer className="w-3.5 h-3.5" />}
              accentColor="sky"
            />
            <PremiumSlider
              label="Surface Humidity"
              value={inputs.humidityPercent}
              min={10}
              max={90}
              step={5}
              unit="%"
              onChange={(v) => handleSliderChange('humidityPercent', v)}
              icon={<Droplet className="w-3.5 h-3.5" />}
              accentColor="sky"
            />
            <PremiumSlider
              label="Surface Wind Speed"
              value={inputs.windSpeedKmh}
              min={0}
              max={60}
              step={2}
              unit="km/h"
              onChange={(v) => handleSliderChange('windSpeedKmh', v)}
              icon={<Wind className="w-3.5 h-3.5" />}
              accentColor="sky"
            />
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/50 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>Heat Dissipation:</span>
            <strong className="text-sky-600 dark:text-sky-400 font-mono font-bold">
              {heatLossKw} kW
            </strong>
          </div>
        </div>

        {/* SECTION 2: THERMAL & STEAM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-xs">
              <Flame className="w-4 h-4" />
              <span>Thermal & Steam</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 font-mono font-bold">
              THERMAL
            </span>
          </div>

          <div className="space-y-3.5">
            <PremiumSlider
              label="Reservoir Temp"
              value={inputs.reservoirTemperatureC}
              min={30}
              max={100}
              step={1}
              unit="°C"
              onChange={(v) => handleSliderChange('reservoirTemperatureC', v)}
              icon={<Thermometer className="w-3.5 h-3.5" />}
              accentColor="rose"
            />
            <PremiumSlider
              label="Steam Injection Rate"
              value={inputs.steamInjectionRateTpd}
              min={0}
              max={200}
              step={5}
              unit="t/d"
              onChange={(v) => handleSliderChange('steamInjectionRateTpd', v)}
              icon={<Zap className="w-3.5 h-3.5" />}
              accentColor="rose"
            />
            <PremiumSlider
              label="Steam Quality"
              value={inputs.steamQualityPercent}
              min={10}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => handleSliderChange('steamQualityPercent', v)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
              accentColor="rose"
            />
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/50 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>Matrix Modeled Temp:</span>
            <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
              {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
            </strong>
          </div>
        </div>

        {/* SECTION 3: SRP LIFT CONTROL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-xs">
              <Gauge className="w-4 h-4" />
              <span>SRP Lift Control</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-mono font-bold">
              KINEMATICS
            </span>
          </div>

          <div className="space-y-3.5">
            <PremiumSlider
              label="Pumping Speed"
              value={inputs.spm}
              min={1}
              max={20}
              step={0.5}
              unit="SPM"
              onChange={(v) => handleSliderChange('spm', v)}
              icon={<Sliders className="w-3.5 h-3.5" />}
              accentColor="amber"
            />
            <PremiumSlider
              label="Stroke Length"
              value={inputs.strokeLengthMeters}
              min={0.5}
              max={4.5}
              step={0.1}
              unit="m"
              onChange={(v) => handleSliderChange('strokeLengthMeters', v)}
              icon={<Gauge className="w-3.5 h-3.5" />}
              accentColor="amber"
            />
            <PremiumSlider
              label="VFD Frequency"
              value={inputs.vfdFrequencyHz}
              min={15}
              max={65}
              step={1}
              unit="Hz"
              onChange={(v) => handleSliderChange('vfdFrequencyHz', v)}
              icon={<Zap className="w-3.5 h-3.5" />}
              accentColor="amber"
            />
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/50 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>SRP Rod Load Index:</span>
            <strong className={`font-mono font-bold ${
              srpOptimizationResult.currentCandidate.loadIndex > 80
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %
            </strong>
          </div>
        </div>

        {/* SECTION 4: FLUID & WATER CUT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-xs">
              <Droplet className="w-4 h-4" />
              <span>Fluid & Water Cut</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 font-mono font-bold">
              RHEOLOGY
            </span>
          </div>

          <div className="space-y-3.5">
            <PremiumSlider
              label="Water Cut"
              value={inputs.waterCutPercent}
              min={0}
              max={80}
              step={2}
              unit="%"
              onChange={(v) => handleSliderChange('waterCutPercent', v)}
              icon={<Droplet className="w-3.5 h-3.5" />}
              accentColor="purple"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs font-medium">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Viscosity:</span>
              <strong className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Darcy Mobility:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {mobilityResult.mobilityDcP.toFixed(4)} D/cP
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Prod Rate:</span>
              <strong className="text-sky-600 dark:text-sky-400 font-mono font-bold">
                {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
