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
    <section className="simulation-reveal bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl font-mono space-y-5">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30"><Brain className="w-5 h-5" /></div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">TRAINED ML VISCOSITY ADVISORY</h2>
            <p className="text-xs text-slate-400 mt-1">Live inference from 30 CSS-SRP wells and the trained 18-rule operating envelope.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select value={wellId} onChange={(event) => setWellId(event.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-sky-300">
            {wells.map((item) => <option key={item.well_id} value={item.well_id}>{item.well_id} | crit {item.mu_crit_cP} cP</option>)}
          </select>
          <select value={phase} onChange={(event) => setPhase(event.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-emerald-300">
            <option>PRODUCTION</option><option>INJECTION</option><option>SOAK</option>
          </select>
          <button onClick={simulate} disabled={loading} title="Recalculate inference" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"><RefreshCw className={loading ? 'w-4 h-4 animate-spin text-sky-400' : 'w-4 h-4'} /></button>
        </div>
      </header>

      {error && <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

      {result && <div className={`rounded-xl border p-4 ${actionRequired ? 'bg-amber-950/30 border-amber-700/80' : 'bg-sky-950/20 border-sky-800/70'}`}>
        <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-sky-300" /><h3 className="text-xs font-bold uppercase tracking-wider text-white">AI OPERATING SUMMARY</h3><span className="text-[9px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">ML + CONSTRAINT GROUNDED</span></div>
        <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-200">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p><strong>This is happening: </strong>the model estimates <strong className="text-purple-300">{currentViscosity.toLocaleString()} cP</strong> now and <strong className="text-purple-300">{result.prediction.forecast_7d_viscosity_cp.toLocaleString()} cP</strong> in 7 days, with a <strong className="text-amber-300">{(result.prediction.alarm_7d_probability * 100).toFixed(1)}%</strong> onset probability. <strong>This needs to be done: </strong>{actionRequired ? `increase ${firstIncrease?.parameter ?? 'thermal support'} and reduce ${firstDecrease?.parameter ?? 'pump load'} using the recommended values below, then recalculate.` : 'maintain the current setpoints and continue monitoring the 7-day forecast and evaluated constraints.'}</p>
        </div>
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-2"><Sliders className="w-4 h-4 text-sky-400" /> OPERATING INPUTS</div>
          <Slider label="Pump temperature" value={pumpTemp} min={25} max={150} unit="°C" onChange={setPumpTemp} icon={<Thermometer className="w-3.5 h-3.5 text-orange-400" />} />
          <Slider label="Pumping speed" value={spm} min={3} max={12} step={0.1} unit="SPM" onChange={setSpm} icon={<Activity className="w-3.5 h-3.5 text-sky-400" />} />
          <Slider label="VFD frequency" value={vfdHz} min={20} max={55} step={0.5} unit="Hz" onChange={setVfdHz} icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} />
          <Slider label="Steam rate (I02)" value={steamRate} min={0} max={250} step={5} unit="m³/d" onChange={setSteamRate} />
          <Slider label="Soak duration (K02)" value={soakDays} min={0} max={20} unit="days" onChange={setSoakDays} />
          <Slider label="Water cut" value={waterCut} min={5} max={95} unit="%" onChange={setWaterCut} />
          <div className="grid grid-cols-2 gap-3"><Slider label="PPRL" value={pprl} min={30} max={140} unit="kN" onChange={setPprl} /><Slider label="MPRL" value={mprl} min={0} max={50} unit="kN" onChange={setMprl} /></div>
          <div className="flex gap-2"><button onClick={applyOptimal} className="flex-1 px-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1"><Wand2 className="w-3.5 h-3.5" /> APPLY AI SETPOINTS</button><button onClick={testSurge} className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold">TEST SURGE</button></div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {result && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="ML NOWCAST" value={result.prediction.nowcast_viscosity_cp} unit="cP" color="text-sky-300" />
            <Metric label="SOFT SENSOR" value={result.prediction.nowcast_softsensor_cp} unit="cP" color="text-emerald-300" />
            <Metric label="+7D FORECAST" value={result.prediction.forecast_7d_viscosity_cp} unit="cP" color="text-purple-300" />
            <div className={`p-3 rounded-xl border ${result.prediction.alarm_7d_triggered ? 'bg-red-950/50 border-red-800' : 'bg-emerald-950/40 border-emerald-800'}`}><span className="text-[10px] font-bold text-slate-300">7D ALARM</span><strong className="block text-xl mt-1">{(result.prediction.alarm_7d_probability * 100).toFixed(1)}%</strong><span className="text-[10px]">{result.prediction.alarm_level}</span></div>
          </div>}

          {result && <div className={`p-4 rounded-xl border ${actionRequired ? 'bg-amber-950/30 border-amber-800/80' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3"><ShieldAlert className="w-4 h-4 text-amber-400" /><h3 className="text-xs font-bold text-white uppercase">Operator actions</h3><span className="ml-auto text-[10px] text-purple-300">Critical: {criticalViscosity} cP</span></div>
            <p className="text-xs text-slate-300 mb-3">{result.advisory.engineering_rationale}</p>
            <div className="grid md:grid-cols-2 gap-3"><ActionList title="INCREASE" icon={<ArrowUpRight className="w-3.5 h-3.5" />} actions={result.advisory.actions_to_increase} color="text-emerald-400" /><ActionList title="DECREASE" icon={<ArrowDownRight className="w-3.5 h-3.5" />} actions={result.advisory.actions_to_decrease} color="text-amber-400" /></div>
          </div>}

          {result && <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50"><div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 18 OPERATING CONSTRAINTS <span className="ml-auto text-[10px]">{result.constraints.n_constraints_violated} violations / {result.constraints.n_evaluated} evaluated</span></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">{result.constraints.constraints.map((constraint) => <div key={constraint.id} className={`p-2 rounded border text-[10px] ${constraint.margin === null ? 'border-slate-800 text-slate-500' : constraint.is_ok ? 'border-emerald-800/60 text-emerald-300' : 'border-red-800 text-red-300'}`}><strong>{constraint.id}</strong><span className="block truncate">{constraint.margin === null ? 'N/A' : `${constraint.margin} ${constraint.unit}`}</span></div>)}</div></div>}
        </div>
      </div>
    </section>
  );
};

function Slider({ label, value, min, max, step = 1, unit, onChange, icon }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void; icon?: React.ReactNode }) {
  return <label className="block text-xs"><span className="flex justify-between text-slate-400 mb-1"><span className="flex items-center gap-1">{icon}{label}</span><strong className="text-sky-300">{value} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-sky-500" /></label>;
}

function Metric({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/50"><span className="text-[10px] text-slate-400 font-bold">{label}</span><strong className={`block text-xl mt-1 ${color}`}>{value.toLocaleString()}<small className="text-xs text-slate-400 ml-1">{unit}</small></strong></div>;
}

function ActionList({ title, icon, actions, color }: { title: string; icon: React.ReactNode; actions: MLSimulateResponse['advisory']['actions_to_increase']; color: string }) {
  return <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800"><span className={`text-[11px] font-bold flex items-center gap-1 ${color}`}>{icon}{title}</span>{actions.length === 0 ? <p className="text-[10px] text-slate-500 mt-2">No action required.</p> : actions.map((action) => <div key={action.parameter} className="mt-2 text-[11px]"><div className="flex justify-between font-bold text-slate-200"><span>{action.parameter}</span><span className={color}>{action.current} → {action.recommended} {action.unit}</span></div><p className="text-[10px] text-slate-400 mt-1">{action.impact}</p><span className="text-[9px] text-slate-500">Bound: {action.constraint}</span></div>)}</div>;
}
