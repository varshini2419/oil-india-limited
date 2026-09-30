import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Activity, ArrowLeft, BarChart3, Bell, Box, Boxes, Check, ChevronDown,
  Database, Droplet, FileText, Flame, Gauge, GitBranch, Home,
  Lightbulb, PanelLeftClose, Radio, RefreshCw, Search, Settings,
  SlidersHorizontal, SquareActivity, Thermometer, TrendingDown,
  TrendingUp, Waves, Wrench, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-oilfield.jpg";
import twinImg from "@/assets/digital-twin.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScenarioStore } from "@/simulation/scenario";
import { WELL_PHENOMENA } from "@/config/wellDynamicsPhenomena";
import { WellVisualizationCanvas } from "@/components/wellDynamics/WellVisualizationCanvas";
import type { PhenomenonId, WellComponentId } from "@/types/wellDynamics";
import type { ScenarioInputValues } from "@/simulation/scenario/types";

type Condition = PhenomenonId;
type ConditionConfig = {
  label: string;
  description: string;
  icon: typeof Activity;
  tint: string;
};
// Condition cards map 1:1 onto the documented well-dynamics phenomena; each
// selection pushes the phenomenon's input preset into the shared store, which
// drives both the animated well canvas and the physics models.
const conditions: Array<[Condition, ConditionConfig]> = WELL_PHENOMENA.map((phenomenon, index) => [
  phenomenon.id,
  {
    label: phenomenon.title,
    description: phenomenon.shortDescription,
    icon: [TrendingUp, Thermometer, Droplet, Wrench, Zap][index % 5],
    tint: ["bg-amber-soft text-accent-foreground", "bg-rose-soft text-rose-foreground", "bg-sky-soft text-sky-foreground", "bg-violet-soft text-violet-foreground", "bg-mint text-mint-foreground"][index % 5],
  },
]);
const navItems = [
  { icon: Home, label: "Dashboard", to: "/" as const },
  { icon: Activity, label: "Well Dynamics", to: "/well-dynamics" as const },
  { icon: Boxes, label: "Digital Twin", to: "/digital-twin" as const },
  { icon: SlidersHorizontal, label: "Simulation", to: "/simulation" as const },
  { icon: Gauge, label: "Optimization", to: "/optimization" as const },
  { icon: Radio, label: "Live Monitoring", to: "/monitoring" as const },
  { icon: FileText, label: "Reports", to: "/reports" as const },
];
function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[208px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-4">
        <Flame className="h-6 w-6 text-sidebar-primary" fill="currentColor" />
        <div><p className="text-sm font-bold text-sidebar-accent-foreground">BAGHEWALA</p><p className="text-[9px] text-sidebar-foreground/60">HEAVY-OIL ASSET</p></div>
        <PanelLeftClose className="ml-auto h-4 w-4 text-sidebar-foreground/50" />
      </div>
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <Link key={item.label} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs ${item.label === "Well Dynamics" ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent"}`}>
            <item.icon className="h-4 w-4" />{item.label}
          </Link>
        ))}
        <p className="border-t border-sidebar-border px-3 pb-2 pt-5 text-[9px] tracking-wider text-sidebar-foreground/45">TOOLS</p>
        <Link to="/data-explorer" className="flex items-center gap-3 px-3 py-2 text-xs"><Database className="h-4 w-4" />Data Explorer</Link>
        <div className="flex items-center gap-3 px-3 py-2 text-xs"><GitBranch className="h-4 w-4" />Scenarios</div>
      </nav>
      <div className="mx-3 mb-3 mt-auto overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-accent/35">
        <img src={twinImg} alt="Field digital twin geological model" className="h-24 w-full object-cover" />
        <div className="p-3"><p className="text-sm font-semibold text-sidebar-accent-foreground">Field Digital Twin</p><p className="mt-1 text-[10px] leading-relaxed text-sidebar-foreground/65">Integrated simulation &amp; real-time data for better decisions.</p></div>
      </div>
    </aside>
  );
}
function Topbar() {
  return (
    <header className="flex h-14 items-center border-b border-border bg-card/95 px-4 lg:px-7">
      <div className="flex w-full max-w-[430px] items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5">
        <Search className="h-4 w-4 text-muted-foreground" /><input aria-label="Search" placeholder="Search wells, parameters, or scenarios..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /><kbd className="rounded border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">Ctrl + K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-destructive" /></Button><Button variant="ghost" size="icon" aria-label="Settings"><Settings /></Button><div className="hidden items-center gap-2 border-l border-border pl-4 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">OI</div><div><p className="text-xs font-bold">Oil India Limited</p><p className="text-[9px] text-muted-foreground">Operator</p></div><ChevronDown className="ml-3 h-4 w-4" /></div></div>
    </header>
  );
}
function SoftSparkline({ tone }: { tone: "red" | "blue" | "green" | "amber" }) {
  const colors = { red: "var(--rose-foreground)", blue: "var(--sky-foreground)", green: "var(--mint-foreground)", amber: "var(--amber-brand)" };
  return <svg viewBox="0 0 140 34" className="h-8 w-36" fill="none"><path d="M2 27 C12 28 16 18 27 20 S40 11 50 18 S65 26 74 18 S88 22 98 15 S112 18 122 12 S133 12 139 8" stroke={colors[tone]} strokeWidth="1.8" /><path d="M2 27 C12 28 16 18 27 20 S40 11 50 18 S65 26 74 18 S88 22 98 15 S112 18 122 12 S133 12 139 8 L139 34 L2 34 Z" fill={colors[tone]} opacity=".1" /></svg>;
}
export function WellDynamicsPage() {
  useDocumentTitle({ title: "Well Dynamics — Baghewala Heavy-Oil Asset", description: "Analyze Baghewala well performance, flow behavior, operating conditions, and model recommendations." });
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
    updateInput,
    resetCurrentToBaseline,
  } = useScenarioStore();
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState<Condition>("normal_operation");
  const [selectedComponentId, setSelectedComponentId] = useState<WellComponentId | null>(null);
  const [mode, setMode] = useState<"model" | "combined">("combined");

  const activePhenomenon = useMemo(
    () => WELL_PHENOMENA.find((p) => p.id === selectedPhenomenonId) ?? WELL_PHENOMENA[0],
    [selectedPhenomenonId]
  );

  // Selecting a condition pushes its input preset into the shared simulation
  // store; every model (thermal, viscosity, mobility, production, SRP, risk)
  // recomputes from it and the animated canvas reacts to the same inputs.
  const applyCondition = (next: Condition) => {
    setSelectedPhenomenonId(next);
    setSelectedComponentId(null);
    const phenomenon = WELL_PHENOMENA.find((p) => p.id === next);
    if (phenomenon?.inputPreset) {
      Object.entries(phenomenon.inputPreset).forEach(([key, value]) =>
        updateInput(key as keyof ScenarioInputValues, value as number)
      );
    }
  };
  const reset = () => { resetCurrentToBaseline(); setSelectedPhenomenonId("normal_operation"); setSelectedComponentId(null); };

  const chosen = conditions.find(([id]) => id === selectedPhenomenonId)?.[1];
  const inputs = activeScenario.inputs;
  const bblToCubm = (bbl: number) => (bbl * 0.158987).toFixed(0);
  const thermalGradient = (thermalResult.predictedReservoirTemperatureC / 30).toFixed(1);

  const liveMetrics = [
    { label: "BHT / TEMPERATURE", value: thermalResult.predictedReservoirTemperatureC.toFixed(1), unit: "°C", icon: Thermometer, tint: "bg-rose-soft text-rose-foreground", tone: "red" as const },
    { label: "VISCOSITY", value: viscosityResult.estimatedViscosityCp.toLocaleString(), unit: "cP", icon: Droplet, tint: "bg-sky-soft text-sky-foreground", tone: "blue" as const },
    { label: "ANNULAR PRESSURE", value: inputs.reservoirPressureBar.toFixed(1), unit: "bar", icon: Gauge, tint: "bg-mint text-mint-foreground", tone: "green" as const },
    { label: "WELL RATE", value: bblToCubm(productionResult.totalFluidProductionBfpd), unit: "m³/d", detail: `${productionResult.estimatedProductionBopd.toFixed(0)} bbl/d (OIL)`, icon: Waves, tint: "bg-amber-soft text-accent-foreground", tone: "amber" as const },
  ];
  function MetricCards() {
    return <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{liveMetrics.map((m) => <div key={m.label} className="flex min-h-[82px] items-center rounded-lg border border-border bg-card px-4 shadow-sm"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${m.tint}`}><m.icon className="h-5 w-5" /></div><div className="ml-3"><p className="text-[9px] font-semibold text-muted-foreground">{m.label}</p><p className="text-xl font-bold">{m.value} <span className="text-xs font-medium text-muted-foreground">{m.unit}</span></p>{m.detail && <p className="text-[10px] font-medium text-muted-foreground">{m.detail}</p>}</div><div className="ml-auto self-end pb-2"><span className="mb-2 block text-right text-[8px] font-bold text-violet-foreground">MODELLED</span><SoftSparkline tone={m.tone} /></div></div>)}</section>;
  }
  function Conditions({ active, onChange }: { active: Condition; onChange: (value: Condition) => void }) {
    return <section className="rounded-lg border border-border bg-card p-2.5 shadow-sm"><div className="mb-2 flex items-center"><div className="mr-2 flex h-7 w-7 items-center justify-center rounded-md bg-amber-soft text-accent-foreground"><SquareActivity className="h-4 w-4" /></div><div><h2 className="text-xs font-bold">Choose an operating condition</h2><p className="text-[9px] text-muted-foreground">Select a scenario to analyze well performance under different conditions.</p></div><Button variant="outline" size="sm" className="ml-auto h-7 text-[10px]" onClick={reset}><RefreshCw />Reset to default</Button></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">{conditions.map(([id, c]) => <button key={id} onClick={() => onChange(id)} className={`relative flex min-h-[66px] items-center gap-3 rounded-md border p-2 text-left transition-colors ${active === id ? "border-primary bg-amber-soft/35" : "border-border bg-background hover:bg-muted"}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.tint}`}><c.icon className="h-5 w-5" /></div><div><p className="text-[10px] font-bold leading-tight">{c.label}</p><p className="mt-1 text-[9px] leading-tight text-muted-foreground">{c.description}</p></div>{active === id && <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-2.5 w-2.5" /></span>}</button>)}</div></section>;
  }
  const statusRow = useMemo(() => {
    if (aiRiskResult.riskLevel === "CRITICAL") return { label: "Critical", dot: "bg-rose-foreground", note: "Model risk engine reports critical deviations." };
    if (aiRiskResult.riskLevel === "HIGH") return { label: "Elevated", dot: "bg-rose-foreground", note: "Model risk engine reports high deviations." };
    if (aiRiskResult.riskLevel === "MODERATE") return { label: "Watch", dot: "bg-amber-brand", note: "Model risk engine reports moderate deviations." };
    return { label: "Stable", dot: "bg-mint-foreground", note: "Current operation is stable with no critical deviations." };
  }, [aiRiskResult.riskLevel]);
  function OperationCard() {
    return <section className="rounded-lg border border-border bg-card p-3 shadow-sm"><div className="flex items-start gap-2"><span className="mt-0.5 h-3 w-3 rounded-full bg-mint-foreground ring-8 ring-mint" /><div><h2 className="text-sm font-bold">Current well operation</h2><p className="text-[10px] text-muted-foreground">Live model outputs for the selected scenario.</p></div></div><div className="mt-2 rounded-md border border-mint-foreground/10 bg-mint/70 p-3"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-mint-foreground"><TrendingUp /></div><div><span className="rounded bg-mint px-2 py-1 text-[9px] font-bold text-mint-foreground">{chosen?.label.toUpperCase()}</span><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">The well is operating under {chosen?.label.toLowerCase()} conditions. The current BHT is {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C and the modelled flow is {productionResult.estimatedProductionBopd.toFixed(1)} BOPD ({aiRiskResult.riskLevel} risk).</p></div></div></div><div className="mt-2 divide-y divide-border text-[10px]">{[
  ["Status", statusRow.label, statusRow.note, "status"],
  ["Expected behavior", activePhenomenon.explanationText.expectedSimulatedEffect, "trend"],
  ["Remarks", "", "Continue monitoring key parameters for early detection of anomalies.", "note"],
].map(([label, value, text, kind]) => <div key={label} className="grid grid-cols-[84px_70px_1fr] items-center gap-2 py-3"><strong>{label}</strong><span className="flex items-center gap-2 font-semibold">{kind === "status" ? <span className={`h-3 w-3 rounded-full ${statusRow.dot}`} /> : kind === "trend" ? <TrendingUp className="h-4 w-4 text-sky-foreground" /> : <FileText className="h-4 w-4 text-accent-foreground" />}{value}</span><span className="text-muted-foreground">{text}</span></div>)}</div>{selectedComponentId && <div className="mt-2 rounded-md border border-primary/25 bg-amber-soft/55 p-2 text-[9px]"><strong className="text-accent-foreground">Selected component</strong><p className="mt-0.5 text-muted-foreground">{selectedComponentId.replaceAll("_", " ")} — part of the affected equipment for {activePhenomenon.title}.</p></div>}</section>;
  }
  const scores = [
    { label: "Production rate", value: bblToCubm(productionResult.totalFluidProductionBfpd), unit: "m³/d", detail: `${productionResult.estimatedProductionBopd.toFixed(0)} bbl/d`, icon: SquareActivity, tint: "bg-amber-soft text-accent-foreground", tone: "green" as const },
    { label: "Drawdown", value: productionResult.effectiveDrawdownBar.toFixed(0), unit: "bar", icon: TrendingDown, tint: "bg-sky-soft text-sky-foreground", tone: "blue" as const },
    { label: "Reservoir pressure", value: inputs.reservoirPressureBar.toFixed(0), unit: "bar", icon: Gauge, tint: "bg-amber-soft text-accent-foreground", tone: "amber" as const },
    { label: "Thermal gradient", value: thermalGradient, unit: "°C/100m", icon: Thermometer, tint: "bg-rose-soft text-rose-foreground", tone: "blue" as const },
  ];
  const suggestions = [
    ...aiRiskResult.recommendedActions.slice(0, 2).map((a) => a.actionText),
    `Rod load index is ${srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}/100 at ${inputs.spm.toFixed(1)} SPM / ${inputs.vfdFrequencyHz.toFixed(0)} Hz.`,
    "Monitor temperature trends for early detection of heavy oil viscosity increase.",
  ];
  function BottomPanels() {
    return <section className="grid gap-2 xl:grid-cols-[1.35fr_1fr]"><div className="rounded-lg border border-border bg-card p-3 shadow-sm"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-soft text-accent-foreground"><SquareActivity className="h-4 w-4" /></div><div><h2 className="text-xs font-bold">Well performance scorecard</h2><p className="text-[9px] text-muted-foreground">Key indicators for the selected operating condition.</p></div></div><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{scores.map(s => <div key={s.label} className="flex min-h-[65px] items-center rounded-md border border-border bg-background p-2"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}><s.icon className="h-5 w-5" /></div><div className="ml-2"><p className="text-[9px] text-muted-foreground">{s.label}</p><p className="text-sm font-bold">{s.value} <span className="text-[9px] font-medium text-muted-foreground">{s.unit}</span></p>{s.detail && <p className="text-[8px] text-muted-foreground">{s.detail}</p>}</div><div className="ml-auto self-end"><SoftSparkline tone={s.tone} /></div></div>)}</div></div><div className="rounded-lg border border-border bg-card p-3 shadow-sm"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-soft text-accent-foreground"><Lightbulb className="h-4 w-4" /></div><div><h2 className="text-xs font-bold">Suggestions / Recommendations</h2><p className="text-[9px] text-muted-foreground">Model based insights for improved performance.</p></div></div><ul className="mt-2 rounded-md border border-sky-foreground/10 bg-sky-soft/45 px-4 py-2 text-[9px] leading-relaxed text-muted-foreground">{suggestions.map(t => <li key={t} className="flex gap-2"><span className="text-sky-foreground">•</span>{t}</li>)}</ul></div></section>;
  }
  return <div className="min-h-screen bg-background"><Sidebar /><div className="lg:pl-[208px]"><Topbar /><main className="min-w-[720px] space-y-2.5 p-3"><section className="relative min-h-[100px] overflow-hidden border-b border-border"><img src={heroImg} alt="Baghewala oil field" className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" /><div className="relative flex h-full items-center justify-between gap-6 px-6 py-3"><div className="border-l-2 border-primary pl-6"><Link to="/" className="flex items-center gap-2 text-xs font-semibold text-accent-foreground"><ArrowLeft className="h-4 w-4" />Baghewala Heavy-Oil Asset</Link><h1 className="mt-1 text-3xl font-bold">Well Dynamics</h1><p className="text-xs text-muted-foreground">Track well performance, understand flow behavior and predict operating conditions.</p></div><div className="flex gap-2 rounded-lg border border-border bg-card/85 p-1.5 shadow-sm backdrop-blur"><Button variant={mode === "model" ? "default" : "ghost"} size="sm" onClick={() => setMode("model")}><Box />Model only view</Button><Button variant={mode === "combined" ? "default" : "ghost"} size="sm" onClick={() => setMode("combined")}><BarChart3 />Data + Model view</Button></div></div></section><Conditions active={selectedPhenomenonId} onChange={applyCondition} /><MetricCards /><section className="grid gap-2 xl:grid-cols-[34%_66%]"><OperationCard /><div className="min-h-[440px]"><WellVisualizationCanvas phenomenon={activePhenomenon} selectedComponentId={selectedComponentId} onSelectComponent={setSelectedComponentId} /></div></section><BottomPanels /></main></div></div>;
}

export default WellDynamicsPage;
