import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Brain, CheckCircle2, Info, RefreshCw, ShieldAlert, Sliders, Sparkles, Thermometer, Wand2, Zap } from 'lucide-react';
import { fetchWells, runMLSimulation, type MLSimulateResponse, type WellRecord } from '../../services/simulationApi';

export const MLViscosityControlPanel: React.FC = () => {
  const [wells, setWells] = useState<WellRecord[]>([]);
  const [wellId, setWellId] = useState('CSS-001');
  const [phase, setPhase] = useState('PRODUCTION');
  const [spm, setSpm] = useState(7.5);
  const [vfdHz, setVfdHz] = useState(45);
  const [pumpTemp, setPumpTemp] = useState(65);
  const [steamRate, setSteamRate] = useState(120);
  const [soakDays, setSoakDays] = useState(6);
  const [pprl, setPprl] = useState(78);
  const [mprl, setMprl] = useState(22);
  const [waterCut, setWaterCut] = useState(45);
  const [result, setResult] = useState<MLSimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWells().then((items) => {
      setWells(items);
      if (items[0]) setWellId(items[0].well_id);
    }).catch((err: Error) => setError(err.message));
  }, []);

  const simulate = () => {
    setLoading(true);
    setError(null);
    runMLSimulation({
      well_id: wellId,
      phase,
      spm,
      vfd_hz: vfdHz,
      fluid_temp_pump_c: pumpTemp,
      fluid_temp_wellhead_c: Math.max(30, pumpTemp - 15),
      steam_inj_rate_m3d: steamRate,
      cycle_soak_days: soakDays,
      pprl_kn: pprl,
      mprl_kn: mprl,
      water_cut_pct: waterCut,
    }).then(setResult).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (wells.length) simulate();
  }, [wells.length, wellId, phase, spm, vfdHz, pumpTemp, steamRate, soakDays, pprl, mprl, waterCut]);

  const applyOptimal = () => {
    setPumpTemp(78);
    setSpm(7);
    setVfdHz(42);
    setSteamRate(160);
    setSoakDays(8);
    setPprl(70);
    setMprl(25);
    setWaterCut(40);
  };

  const testSurge = () => {
    setPumpTemp(32);
    setSpm(9.5);
    setVfdHz(52);
    setSteamRate(30);
    setSoakDays(2);
    setPprl(98);
    setMprl(8);
  };

  const well = wells.find((item) => item.well_id === wellId);
  const criticalViscosity = well?.mu_crit_cP ?? 822;
  const currentViscosity = result?.prediction.nowcast_viscosity_cp ?? 0;
  const actionRequired = Boolean(result?.advisory.viscosity_control_action_required);
  const firstIncrease = result?.advisory.actions_to_increase[0];
  const firstDecrease = result?.advisory.actions_to_decrease[0];

  return (
    <section className="simulation-reveal bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm font-sans space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/80 shadow-sm"><Brain className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-wide">TRAINED ML VISCOSITY ADVISORY</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live inference from 30 CSS-SRP wells and the trained 18-rule operating envelope.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select value={wellId} onChange={(event) => setWellId(event.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sky-700 dark:text-sky-300 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-sm cursor-pointer transition-all">
            {wells.map((item) => <option key={item.well_id} value={item.well_id}>{item.well_id} | crit {item.mu_crit_cP} cP</option>)}
          </select>
          <select value={phase} onChange={(event) => setPhase(event.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-emerald-700 dark:text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm cursor-pointer transition-all">
            <option>PRODUCTION</option><option>INJECTION</option><option>SOAK</option>
          </select>
          <button onClick={simulate} disabled={loading} title="Recalculate inference" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-700"><RefreshCw className={loading ? 'w-5 h-5 animate-spin text-sky-500' : 'w-5 h-5'} /></button>
        </div>
      </header>

      {error && <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-sm font-medium flex gap-3 shadow-sm"><AlertTriangle className="w-5 h-5 shrink-0" />{error}</div>}

      {result && <div className={`rounded-2xl border p-5 shadow-sm transition-all ${actionRequired ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700/80' : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-800/70'}`}>
        <div className="flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-sky-500" /><h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">AI OPERATING SUMMARY</h3><span className="text-[10px] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono font-bold bg-white dark:bg-slate-900 shadow-sm">ML + CONSTRAINT GROUNDED</span></div>
        <div className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-inner">
          <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <p><strong>This is happening: </strong>the model estimates <strong className="text-purple-600 dark:text-purple-300">{currentViscosity.toLocaleString()} cP</strong> now and <strong className="text-purple-600 dark:text-purple-300">{result.prediction.forecast_7d_viscosity_cp.toLocaleString()} cP</strong> in 7 days, with a <strong className="text-amber-600 dark:text-amber-400">{(result.prediction.alarm_7d_probability * 100).toFixed(1)}%</strong> onset probability. <strong>This needs to be done: </strong>{actionRequired ? `increase ${firstIncrease?.parameter ?? 'thermal support'} and reduce ${firstDecrease?.parameter ?? 'pump load'} using the recommended values below, then recalculate.` : 'maintain the current setpoints and continue monitoring the 7-day forecast and evaluated constraints.'}</p>
        </div>
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-3 uppercase tracking-wider"><Sliders className="w-5 h-5 text-sky-500" /> OPERATING INPUTS</div>
          <Slider label="Pump temperature" value={pumpTemp} min={25} max={150} unit="°C" onChange={setPumpTemp} icon={<Thermometer className="w-4 h-4 text-orange-500" />} />
          <Slider label="Pumping speed" value={spm} min={3} max={12} step={0.1} unit="SPM" onChange={setSpm} icon={<Activity className="w-4 h-4 text-sky-500" />} />
          <Slider label="VFD frequency" value={vfdHz} min={20} max={55} step={0.5} unit="Hz" onChange={setVfdHz} icon={<Zap className="w-4 h-4 text-amber-500" />} />
          <Slider label="Steam rate (I02)" value={steamRate} min={0} max={250} step={5} unit="m³/d" onChange={setSteamRate} />
          <Slider label="Soak duration (K02)" value={soakDays} min={0} max={20} unit="days" onChange={setSoakDays} />
          <Slider label="Water cut" value={waterCut} min={5} max={95} unit="%" onChange={setWaterCut} />
          <div className="grid grid-cols-2 gap-4"><Slider label="PPRL" value={pprl} min={30} max={140} unit="kN" onChange={setPprl} /><Slider label="MPRL" value={mprl} min={0} max={50} unit="kN" onChange={setMprl} /></div>
          <div className="flex gap-3 pt-2"><button onClick={applyOptimal} className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"><Wand2 className="w-4 h-4" /> APPLY AI SETPOINTS</button><button onClick={testSurge} className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-sm">TEST SURGE</button></div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {result && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="ML NOWCAST" value={result.prediction.nowcast_viscosity_cp} unit="cP" color="text-sky-600 dark:text-sky-400" />
            <Metric label="SOFT SENSOR" value={result.prediction.nowcast_softsensor_cp} unit="cP" color="text-emerald-600 dark:text-emerald-400" />
            <Metric label="+7D FORECAST" value={result.prediction.forecast_7d_viscosity_cp} unit="cP" color="text-purple-600 dark:text-purple-400" />
            <div className={`p-4 rounded-2xl border shadow-sm transition-all ${result.prediction.alarm_7d_triggered ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80' : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'}`}><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">7D ALARM</span><strong className={`block text-2xl mt-1 font-mono ${result.prediction.alarm_7d_triggered ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{(result.prediction.alarm_7d_probability * 100).toFixed(1)}%</strong><span className={`text-xs font-bold ${result.prediction.alarm_7d_triggered ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{result.prediction.alarm_level}</span></div>
          </div>}

          {result && <div className={`p-5 rounded-2xl border shadow-sm transition-all ${actionRequired ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60' : 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/80'}`}>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4"><ShieldAlert className="w-5 h-5 text-amber-500" /><h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Operator actions</h3><span className="ml-auto text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60 shadow-sm">Critical: {criticalViscosity} cP</span></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 font-medium leading-relaxed">{result.advisory.engineering_rationale}</p>
            <div className="grid md:grid-cols-2 gap-4"><ActionList title="INCREASE" icon={<ArrowUpRight className="w-4 h-4" />} actions={result.advisory.actions_to_increase} color="text-emerald-600 dark:text-emerald-400" /><ActionList title="DECREASE" icon={<ArrowDownRight className="w-4 h-4" />} actions={result.advisory.actions_to_decrease} color="text-amber-600 dark:text-amber-400" /></div>
          </div>}

          {result && <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 shadow-sm transition-all"><div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 uppercase tracking-wider"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 18 OPERATING CONSTRAINTS <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium normal-case bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">{result.constraints.n_constraints_violated} violations / {result.constraints.n_evaluated} evaluated</span></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">{result.constraints.constraints.map((constraint) => <div key={constraint.id} className={`p-3 rounded-xl border text-xs shadow-sm font-mono flex flex-col justify-center items-center text-center ${constraint.margin === null ? 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400' : constraint.is_ok ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400' : 'border-rose-200 bg-rose-50/50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-400'}`}><strong className="mb-1">{constraint.id}</strong><span className="block truncate font-bold text-[10px] opacity-80">{constraint.margin === null ? 'N/A' : `${constraint.margin} ${constraint.unit}`}</span></div>)}</div></div>}
        </div>
      </div>
    </section>
  );
};
function Slider({ label, value, min, max, step = 1, unit, onChange, icon }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void; icon?: React.ReactNode }) {
  return <label className="block text-sm font-medium"><span className="flex justify-between text-slate-600 dark:text-slate-400 mb-2"><span className="flex items-center gap-1.5">{icon}{label}</span><strong className="text-sky-600 dark:text-sky-400 font-mono font-bold">{value} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none" /></label>;
}

function Metric({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 shadow-sm"><span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span><strong className={`block text-2xl mt-1 font-mono ${color}`}>{value.toLocaleString()}<small className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-sans">{unit}</small></strong></div>;
}

function ActionList({ title, icon, actions, color }: { title: string; icon: React.ReactNode; actions: MLSimulateResponse['advisory']['actions_to_increase']; color: string }) {
  return <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"><span className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider mb-2 ${color}`}>{icon}{title}</span>{actions.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">No action required.</p> : actions.map((action) => <div key={action.parameter} className="mt-3 text-sm bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80"><div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 mb-1"><span>{action.parameter}</span><span className={`font-mono ${color}`}>{action.current} → {action.recommended} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">{action.unit}</span></span></div><p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{action.impact}</p><div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500 font-mono font-medium">Bound: {action.constraint}</div></div>)}</div>;
}
