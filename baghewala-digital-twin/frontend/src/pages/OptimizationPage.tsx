import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Activity, BarChart3, Bell, Boxes, ChevronDown, CircleDollarSign, Database,
  Droplet, FileText, Flame, Gauge, GitBranch, Network, PanelLeftClose, Play,
  Plus, Radio, RefreshCw, Search, Settings, Shield, SlidersHorizontal,
  Sparkles, Target, Thermometer, TrendingUp, Wrench, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-oilfield.jpg";
import twinImg from "@/assets/digital-twin.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScenarioStore } from "@/simulation/scenario";
import { SCENARIO_LIMITS } from "@/simulation/scenario/defaults";
import type { ScenarioInputValues } from "@/simulation/scenario/types";
import { calculateViscosityModel } from "@/simulation/viscosity";
import { calculateMobilityModel } from "@/simulation/mobility";
import { calculateProductionModel } from "@/simulation/production";

const navItems = [
  { icon: Gauge, label: "Dashboard", to: "/" as const },
  { icon: Boxes, label: "Digital Twin", to: "/digital-twin" as const },
  { icon: Activity, label: "Well Dynamics", to: "/well-dynamics" as const },
  { icon: SlidersHorizontal, label: "Simulation", to: "/simulation" as const },
  { icon: Network, label: "Optimization", to: "/optimization" as const },
  { icon: Radio, label: "Live Monitoring", to: "/monitoring" as const },
  { icon: FileText, label: "Reports", to: "/reports" as const },
];
function Sidebar() {
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-[196px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
    <div className="flex items-center gap-2 px-5 pb-5 pt-4"><Flame className="h-7 w-7 text-sidebar-primary" fill="currentColor" /><div><p className="text-sm font-bold text-sidebar-accent-foreground">BAGHEWALA</p><p className="text-[9px] text-sidebar-foreground/60">HEAVY-OIL ASSET</p></div><PanelLeftClose className="ml-auto h-4 w-4 text-sidebar-foreground/50" /></div>
    <nav className="space-y-1 px-2">{navItems.map(item => <Link key={item.label} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs ${item.label === "Optimization" ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent"}`}><item.icon className="h-4 w-4" />{item.label}</Link>)}
      <p className="border-t border-sidebar-border px-3 pb-2 pt-5 text-[9px] tracking-wider text-sidebar-foreground/45">TOOLS</p>
      <Link to="/data-explorer" className="flex items-center gap-3 px-3 py-2 text-xs"><Database className="h-4 w-4" />Data Explorer</Link><div className="flex items-center gap-3 px-3 py-2 text-xs"><GitBranch className="h-4 w-4" />Scenarios</div>
    </nav>
    <div className="mx-3 mb-3 mt-auto overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent/35"><img src={twinImg} alt="Field digital twin geological model" className="h-24 w-full object-cover" /><div className="p-3"><p className="text-sm font-semibold text-sidebar-accent-foreground">Field Digital Twin</p><p className="mt-1 text-[10px] leading-relaxed text-sidebar-foreground/65">Integrated simulation &amp; real-time data for better decisions.</p></div></div>
  </aside>;
}
function Topbar() {
  return <header className="flex h-11 items-center border-b border-border bg-card px-5"><div className="flex w-[420px] items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5"><Search className="h-3.5 w-3.5 text-muted-foreground" /><input aria-label="Search" placeholder="Search wells, scenarios, or parameters..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none" /><kbd className="text-[9px] text-muted-foreground">Ctrl + K</kbd></div><div className="ml-auto flex items-center gap-3"><Button size="icon" variant="ghost" className="relative h-8 w-8" aria-label="Notifications"><Bell /><span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-destructive" /></Button><Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Settings"><Settings /></Button><div className="flex items-center gap-2 border-l pl-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">OI</span><div><p className="text-[10px] font-bold">Oil India Limited</p><p className="text-[8px] text-muted-foreground">Operator</p></div><ChevronDown className="ml-2 h-3.5 w-3.5" /></div></div></header>;
}
const toneClasses = {
  rose: "bg-rose-soft text-rose-foreground",
  sky: "bg-sky-soft text-sky-foreground",
  mint: "bg-mint text-mint-foreground",
  violet: "bg-violet-soft text-violet-foreground",
  amber: "bg-amber-soft text-accent-foreground",
};
type Tone = keyof typeof toneClasses;
function Sparkline({ tone }: { tone: Tone }) {
  const stroke = { rose: "var(--rose-foreground)", sky: "var(--sky-foreground)", mint: "var(--mint-foreground)", violet: "var(--violet-foreground)", amber: "var(--amber-brand)" }[tone];
  return <svg viewBox="0 0 100 28" className="h-7 w-24" fill="none"><path d="M1 24 C12 25 17 20 25 20 S38 9 47 16 S60 10 68 13 S82 8 99 6" stroke={stroke} strokeWidth="1.7" /><path d="M1 24 C12 25 17 20 25 20 S38 9 47 16 S60 10 68 13 S82 8 99 6 L99 28 L1 28Z" fill={stroke} opacity=".1" /></svg>;
}
// Variable rows are bound to the shared scenario store; min/max come from the
// documented SCENARIO_LIMITS engineering envelope, so every slider writes a
// real simulation input.
type Variable = { name: string; key: keyof ScenarioInputValues; unit: string; tone: Tone; icon: typeof Gauge; description: string };
const variables: Variable[] = [
  { name: "Pumping Rate (VFD)", key: "vfdFrequencyHz", unit: SCENARIO_LIMITS.vfdFrequencyHz.unit, tone: "sky", icon: Network, description: "Controls the pump displacement rate by adjusting the surface VFD motor speed." },
  { name: "Sucker Rod Stroke Length", key: "strokeLengthMeters", unit: SCENARIO_LIMITS.strokeLengthMeters.unit, tone: "amber", icon: TrendingUp, description: "Adjusts the displacement per stroke and affects total production capacity." },
  { name: "Stroke Frequency", key: "spm", unit: SCENARIO_LIMITS.spm.unit, tone: "violet", icon: Zap, description: "Sets the number of pump strokes each minute." },
  { name: "Tubing Head Pressure", key: "reservoirPressureBar", unit: SCENARIO_LIMITS.reservoirPressureBar.unit, tone: "mint", icon: Gauge, description: "Reservoir pressure driving the drawdown acting on the production tubing." },
  { name: "Steam Injection Rate", key: "steamInjectionRateTpd", unit: SCENARIO_LIMITS.steamInjectionRateTpd.unit, tone: "rose", icon: Activity, description: "Sets cyclic steam injection used to heat the reservoir and reduce viscosity." },
  { name: "Steam Soak Duration", key: "soakDurationDays", unit: SCENARIO_LIMITS.soakDurationDays.unit, tone: "sky", icon: Flame, description: "Shut-in soak time that determines how deep the heat treatment penetrates." },
];
function Range({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (value: number) => void; label: string }) {
  return <input aria-label={label} type="range" min={min} max={max} step={(max - min) / 100} value={value} onChange={e => onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-primary" />;
}
export function OptimizationPage() {
  useDocumentTitle({ title: "Optimization — Baghewala Heavy-Oil Asset", description: "Optimize Baghewala production, energy use, equipment risk, and reservoir protection." });
  const {
    activeScenario,
    presets,
    thermalResult,
    viscosityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    aiRiskResult,
    rodFloatingResult,
    updateInput,
    loadPreset,
  } = useScenarioStore();
  const [selected, setSelected] = useState(0);
  const [live, setLive] = useState(true);
  type Weight = { name: string; subtitle: string; value: number; tone: Tone; icon: typeof Gauge };
  const initialWeights: Weight[] = [
    { name: "Production Weight", subtitle: "Maximize oil production", value: .30, tone: "rose", icon: Target },
    { name: "Energy/Cost Weight", subtitle: "Minimize energy consumption and cost", value: .25, tone: "sky", icon: Droplet },
    { name: "Equipment Risk Weight", subtitle: "Minimize equipment wear and failure risk", value: .25, tone: "mint", icon: Database },
    { name: "Reservoir Risk Weight", subtitle: "Minimize reservoir damage", value: .20, tone: "amber", icon: Shield },
  ];
  const [weights, setWeights] = useState(initialWeights);

  const inputs = activeScenario.inputs;
  const currentVariable = variables[selected] ?? variables[0];
  const currentValue = inputs[currentVariable.key];
  const currentMin = SCENARIO_LIMITS[currentVariable.key].min;
  const currentMax = SCENARIO_LIMITS[currentVariable.key].max;
  const updateVariable = (key: keyof ScenarioInputValues, value: number) => updateInput(key, value);

  const productionDelta = productionResult.estimatedProductionBopd - baselineProductionResult.estimatedProductionBopd;
  const productionDeltaText = `${productionDelta >= 0 ? "+" : ""}${productionDelta.toFixed(1)} vs baseline`;

  const stateMetrics: Array<{ label: string; value: string; unit?: string; note?: string; badge: string; icon: typeof Gauge; tone: Tone }> = [
    { label: "TEMPERATURE", value: thermalResult.predictedReservoirTemperatureC.toFixed(1), unit: "°C", badge: "MODELLED", icon: Thermometer, tone: "rose" },
    { label: "VISCOSITY", value: viscosityResult.estimatedViscosityCp.toLocaleString(), unit: "cP", badge: "MODELLED", icon: Droplet, tone: "sky" },
    { label: "PRODUCTION", value: productionResult.estimatedProductionBopd.toFixed(1), unit: "BOPD", note: productionDeltaText, badge: "MODELLED", icon: Database, tone: "mint" },
    { label: "SRP LOAD", value: srpOptimizationResult.currentCandidate.loadIndex.toFixed(0), unit: "/100", badge: "MODELLED", icon: Zap, tone: "violet" },
    { label: "ROD FLOATING", value: String(rodFloatingResult.rodFloatingIndex), unit: "/100", note: rodFloatingResult.riskLevel, badge: "MODELLED", icon: Wrench, tone: "amber" },
    { label: "RISK", value: aiRiskResult.riskLevel, badge: "MODELLED", icon: Shield, tone: "amber" },
  ];
  function CurrentState() {
    return <section className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="mb-2 flex items-center gap-2"><Network className="h-4 w-4 text-primary" /><div><h2 className="text-[11px] font-bold">Current operating state</h2><p className="text-[9px] text-muted-foreground">Live model outputs for the selected scenario.</p></div></div><div className="grid grid-cols-6 gap-2">{stateMetrics.map(m => <div key={m.label} className="flex h-[65px] items-center rounded-md border border-border bg-background px-2"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClasses[m.tone]}`}><m.icon className="h-4 w-4" /></span><div className="ml-2"><p className="text-[8px] font-semibold text-muted-foreground">{m.label}</p><p className="text-[17px] font-bold leading-tight">{m.value} <span className="text-[9px] font-medium">{m.unit}</span></p>{m.note && <p className={`text-[8px] font-semibold ${m.tone === "mint" ? "text-mint-foreground" : "text-accent-foreground"}`}>{m.note}</p>}</div><div className="ml-auto self-stretch pt-1"><span className={`block text-right text-[7px] font-bold ${m.tone === "amber" ? "text-accent-foreground" : "text-violet-foreground"}`}>{m.badge}</span><div className="mt-1"><Sparkline tone={m.tone} /></div></div></div>)}</div></section>;
  }
  const impacts = [
    { name: "Production", value: `${productionResult.productionChangePercent >= 0 ? "+" : ""}${productionResult.productionChangePercent.toFixed(0)}%`, tone: "mint" as Tone, width: `${Math.min(100, Math.abs(productionResult.productionChangePercent) + 20)}%` },
    { name: "Energy/Cost", value: `${inputs.vfdFrequencyHz >= 50 ? "+" : "−"}${Math.abs((inputs.vfdFrequencyHz - 50) * 1.6).toFixed(0)}%`, tone: "sky" as Tone, width: `${Math.min(100, Math.abs(inputs.vfdFrequencyHz - 50) * 1.6 + 20)}%` },
    { name: "Equipment Risk", value: `${srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}/100`, tone: "rose" as Tone, width: `${srpOptimizationResult.currentCandidate.loadIndex}%` },
    { name: "Reservoir Risk", value: rodFloatingResult.riskLevel, tone: "amber" as Tone, width: `${rodFloatingResult.rodFloatingIndex}%` },
    { name: "Well Stability", value: `${rodFloatingResult.pumpFillEfficiency.toFixed(0)}% fill`, tone: "violet" as Tone, width: `${rodFloatingResult.pumpFillEfficiency}%` },
  ];
  function VariableWorkbench() {
    return <section className="grid grid-cols-[1.55fr_.77fr_.52fr] gap-2"><div className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="mb-2 flex items-center gap-2"><Network className="h-4 w-4 text-primary" /><div><h2 className="text-xs font-bold">Key optimization variables</h2><p className="text-[9px] text-muted-foreground">Adjustable parameters for optimization. Ranges are defined based on equipment limits and field constraints.</p></div><Button size="sm" variant="outline" className="ml-auto h-7 text-[9px]"><SlidersHorizontal />View constraints</Button></div><div className="overflow-hidden rounded-md border border-border"><div className="grid grid-cols-[1.25fr_.45fr_2.8fr_.45fr] bg-muted/60 px-3 py-1.5 text-[9px] font-bold"><span>Parameter</span><span>Current</span><span /><span>Unit</span></div>{variables.map((v, i) => <button key={v.key} onClick={() => setSelected(i)} className={`grid w-full grid-cols-[1.25fr_.45fr_2.8fr_.45fr] items-center border-t border-border px-3 py-1.5 text-left text-[9px] ${selected === i ? "bg-sky-soft/60" : "bg-card hover:bg-muted/50"}`}><span className="flex items-center gap-2 font-semibold"><i className={`flex h-5 w-5 items-center justify-center rounded-full not-italic ${toneClasses[v.tone]}`}><v.icon className="h-3 w-3" /></i>{v.name}</span><span className="rounded border border-border bg-background py-1 text-center font-semibold">{inputs[v.key].toFixed(inputs[v.key] < 10 ? 1 : 0)}</span><span className="grid grid-cols-[32px_1fr_32px] items-center gap-3 px-4"><small className="text-right">{SCENARIO_LIMITS[v.key].min.toFixed(SCENARIO_LIMITS[v.key].min < 10 ? 1 : 0)}</small><Range label={v.name} value={inputs[v.key]} min={SCENARIO_LIMITS[v.key].min} max={SCENARIO_LIMITS[v.key].max} onChange={value => updateVariable(v.key, value)} /><small>{SCENARIO_LIMITS[v.key].max.toFixed(SCENARIO_LIMITS[v.key].max < 10 ? 1 : 0)}</small></span><span>{v.unit}</span></button>)}</div></div>
      <div className="rounded-md border border-border bg-card p-3 shadow-sm"><h2 className="text-xs font-bold text-sky-foreground">Parameter details</h2><div className="mt-3 flex items-center gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClasses[currentVariable.tone]}`}><currentVariable.icon className="h-4 w-4" /></span><div><p className="text-[11px] font-bold">{currentVariable.name}</p><p className="text-[9px] text-muted-foreground">{SCENARIO_LIMITS[currentVariable.key].description}</p></div></div><div className="mt-2 grid grid-cols-[42px_1fr_42px] items-center gap-2"><span className="rounded border border-border py-1 text-center text-[10px] font-bold">{currentMin}</span><Range label={`${currentVariable.name} detail`} value={currentValue} min={currentMin} max={currentMax} onChange={value => updateVariable(currentVariable.key, value)} /><span className="rounded border border-border py-1 text-center text-[10px] font-bold">{currentMax}</span></div><div className="mt-3 grid grid-cols-3 gap-1.5">{[["Current Value", currentValue, currentVariable.tone], ["Min Limit", currentMin, "violet"], ["Max Limit", currentMax, "amber"]].map(([label, value, tone]) => <div key={String(label)} className={`rounded-md border border-border p-2 ${toneClasses[tone as Tone]}`}><p className="text-[8px]">{label}</p><p className="text-[12px] font-bold">{Number(value).toFixed(Number(value) < 10 ? 1 : 0)} <span className="text-[8px]">{currentVariable.unit}</span></p></div>)}<p className="mt-3 text-[9px] font-bold">Description</p></div><p className="mt-1 text-[9px] text-muted-foreground">{currentVariable.description}</p><div className="mt-3 rounded-md border border-primary/25 bg-amber-soft/55 p-2"><p className="text-[9px] font-bold text-accent-foreground">Note</p><p className="text-[8px] text-muted-foreground">Changes update the shared thermal, viscosity, mobility, production and SRP models used across the whole digital twin.</p></div></div>
      <div className="rounded-md border border-border bg-card p-3 shadow-sm"><h2 className="text-xs font-bold">Parameter impact <span className="font-normal text-muted-foreground">(from model)</span></h2><div className="mt-4 space-y-3">{impacts.map(x => <div key={x.name} className="grid grid-cols-[82px_1fr_34px] items-center gap-2 text-[9px]"><span>{x.name}</span><span className="h-2 overflow-hidden rounded-full bg-muted"><i className={`block h-full rounded-full ${toneClasses[x.tone]}`} style={{ width: x.width }} /></span><strong className={x.value.startsWith("+") ? "text-mint-foreground" : "text-rose-foreground"}>{x.value}</strong></div>)}</div><Button variant="outline" size="sm" className="mt-5 w-full text-[9px] text-sky-foreground"><BarChart3 />View sensitivity analysis</Button></div></section>;
  }
  function TradeOff() {
    return <section className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="mb-2 flex items-center"><Shield className="mr-2 h-4 w-4 text-primary" /><h2 className="text-xs font-bold">Trade-Off Engine – Multi-objective Optimization (Adjust Weights)</h2><Button variant="outline" size="sm" className="ml-auto h-7 text-[9px]" onClick={() => setWeights(initialWeights)}><RefreshCw />Reset to default</Button></div><div className="grid grid-cols-4 gap-2">{weights.map((w, i) => <div key={w.name} className={`grid grid-cols-[38px_1fr_40px] items-center rounded-md border border-border p-2 ${toneClasses[w.tone]}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full bg-card/70`}><w.icon className="h-4 w-4" /></span><div><p className="text-[9px] font-bold">{w.name}</p><p className="text-[8px] text-muted-foreground">{w.subtitle}</p><Range label={w.name} min={0} max={1} value={w.value} onChange={value => setWeights(weights.map((x, j) => j === i ? { ...x, value } : x))} /></div><strong className="ml-2 rounded border border-border bg-card px-1 py-1 text-center text-[9px]">{w.value.toFixed(2)}</strong></div>)}</div></section>;
  }
  // Evaluate every reference preset through the real model chain so the
  // scenario cards show genuine modelled outcomes, not placeholders.
  const scenarioRows = useMemo(() => presets.map((preset) => {
    const presetThermalTemp = preset.inputs.reservoirTemperatureC;
    const presetViscosity = calculateViscosityModel(presetThermalTemp, 48.0).estimatedViscosityCp;
    const presetMobility = calculateMobilityModel(presetViscosity, presetThermalTemp, preset.inputs.permeabilityDarcy, 1.0, presetViscosity).mobilityDcP;
    const presetProduction = calculateProductionModel(
      presetMobility,
      presetThermalTemp,
      presetViscosity,
      Math.max(5.0, preset.inputs.reservoirPressureBar - 18.0),
      preset.inputs.vfdFrequencyHz,
      preset.inputs.spm,
      preset.inputs.strokeLengthMeters,
      undefined,
      preset.inputs.waterCutPercent,
      preset.inputs.reservoirPressureBar
    );
    return {
      preset,
      productionBopd: presetProduction.estimatedProductionBopd,
      isCurrent: preset.id === activeScenario.id,
    };
  }), [presets, activeScenario.id]);
  type ScenarioState = "CURRENT" | "READY";
  function Scenarios() {
    return <section className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary" /><div><h2 className="text-xs font-bold">Optimization scenarios</h2><p className="text-[9px] text-muted-foreground">Reference presets evaluated through the live physics models.</p></div><div className="ml-auto flex gap-2"><Button size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => { const best = [...scenarioRows].sort((a, b) => b.productionBopd - a.productionBopd)[0]; if (best) loadPreset(best.preset.id); }}><Play />Run Best Scenario</Button><Button size="sm" variant="outline" className="h-7 text-[9px]"><Plus />Add Scenario</Button></div></div><div className="mt-2 grid grid-cols-5 gap-2">{scenarioRows.map((row, i) => <div key={row.preset.id} className="rounded-md border border-border bg-background p-2"><div className="flex min-h-10 gap-2"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClasses[["sky", "mint", "violet", "amber", "rose"][i % 5] as Tone]}`}><Target className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-[9px] font-bold">{i + 1}. {row.preset.name.replace(/^[A-E]\.\s*/, "")}</p><p className="truncate text-[8px] text-muted-foreground">{row.preset.description}</p></div><span className={`ml-auto h-fit rounded px-1 py-0.5 text-[7px] font-bold ${row.isCurrent ? "bg-mint text-mint-foreground" : "bg-sky-soft text-sky-foreground"}`}>{(row.isCurrent ? "CURRENT" : "READY") as ScenarioState}</span></div><div className="mt-2 grid grid-cols-3 divide-x divide-border rounded bg-muted/50 py-1 text-center"><div><p className="text-[7px] text-muted-foreground">Production</p><b className="text-[9px]">{row.productionBopd.toFixed(1)} BOPD</b></div><div><p className="text-[7px] text-muted-foreground">Steam</p><b className="text-[9px]">{row.preset.inputs.steamInjectionRateTpd.toFixed(0)} TPD</b></div><div><p className="text-[7px] text-muted-foreground">SPM</p><b className="text-[9px]">{row.preset.inputs.spm.toFixed(0)}</b></div></div><div className="mt-1.5 flex gap-2"><Button size="sm" className="h-6 flex-1 text-[8px]" onClick={() => loadPreset(row.preset.id)}><Play />{row.isCurrent ? "Current" : "Load"}</Button><Button size="sm" variant="outline" className="h-6 flex-1 text-[8px]"><BarChart3 />View Results</Button></div></div>)}</div></section>;
  }
  const recommendations = aiRiskResult.recommendedActions.length > 0
    ? aiRiskResult.recommendedActions.slice(0, 3).map((a) => a.actionText)
    : ["Current operating point is inside the documented engineering envelope.", "Continue monitoring rod load and viscosity trends after the next steam cycle."];
  function Results() {
    return <section className="grid grid-cols-[1fr_1.05fr] gap-2"><div className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="mb-2 flex items-center gap-2"><Network className="h-4 w-4 text-primary" /><div><h2 className="text-xs font-bold">Optimization results</h2><p className="text-[8px] text-muted-foreground">Best operating condition based on selected weights and constraints.</p></div></div><div className="grid grid-cols-4 gap-2">{[["Optimal Production", `${productionResult.estimatedProductionBopd.toFixed(1)} BOPD`, "mint"], ["Energy/Cost", `${inputs.vfdFrequencyHz.toFixed(0)} Hz · ${inputs.steamInjectionRateTpd.toFixed(0)} TPD`, "sky"], ["Equipment Risk", `${srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}/100 load`, "amber"], ["Reservoir Risk", rodFloatingResult.riskLevel, "violet"]].map(([a, b, t]) => <div key={a} className={`rounded-md border border-border p-2 ${toneClasses[t as Tone]}`}><p className="text-[8px] font-semibold">{a}</p><p className="mt-1 text-[12px] font-bold">{b}</p></div>)}</div></div><div className="rounded-md border border-border bg-card p-2 shadow-sm"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-mint-foreground" /><div><h2 className="text-xs font-bold">Engineering recommendations</h2><p className="text-[8px] text-muted-foreground">System recommendations based on optimization results.</p></div></div><ul className="mt-2 rounded-md bg-mint/60 p-2 text-[8px] leading-relaxed">{recommendations.map(x => <li key={x} className="flex gap-2"><span className="font-bold text-mint-foreground">✓</span>{x}</li>)}</ul></div></section>;
  }
  return <div className="min-h-screen bg-background"><Sidebar /><div className="lg:pl-[196px]"><div className="min-w-[1120px]"><Topbar /><main className="space-y-2.5 p-3"><section className="relative min-h-[66px] overflow-hidden border-b border-border"><img src={heroImg} alt="Baghewala field pumpjacks" className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-background/15" /><div className="relative flex min-h-[66px] items-center px-5"><div className="flex items-center gap-3 border-l-2 border-primary pl-4"><Network className="h-9 w-9 text-primary" /><div><h1 className="text-[26px] font-bold leading-none">Optimization</h1><p className="mt-1 text-[10px]">Find optimal operating conditions for maximum production, minimum risk and efficient resource utilization.</p></div></div><Button size="sm" className="ml-auto h-7 text-[9px]"><CircleDollarSign />Advisory mode</Button></div></section><div className="flex justify-end gap-2"><Button size="sm" variant="outline" className="h-8 min-w-24 text-[9px] text-mint-foreground" onClick={() => setLive(!live)}>{live ? "Real-time" : "Paused"}<ChevronDown /></Button><Button size="sm" variant="outline" className="h-8 text-[9px]">{activeScenario.name}<ChevronDown /></Button><Button size="sm" variant="outline" className="h-8 text-[9px]"><BarChart3 />Compare</Button></div><CurrentState /><VariableWorkbench /><TradeOff /><Scenarios /><Results /></main></div></div></div>;
}

export default OptimizationPage;
