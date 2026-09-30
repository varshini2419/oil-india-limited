import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Search,
  Home,
  Boxes,
  Activity,
  SlidersHorizontal,
  Gauge,
  Radio,
  FileText,
  Database,
  GitBranch,
  MapPin,
  Layers,
  Flame,
  Thermometer,
  Droplet,
  Zap,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  PanelLeftClose,
  RefreshCw,
  Landmark,
  Compass,
  CircleDot,
  ArrowRight,
  TrendingUp,
  FileStack,
  FileClock,
  Waves,
  FileBarChart,
  Satellite,
} from "lucide-react";
import heroImg from "@/assets/hero-oilfield.jpg";
import twinImg from "@/assets/digital-twin.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScenarioStore } from "@/simulation/scenario";

/* ---------------- Sidebar ---------------- */
const navItems = [
  { icon: Home, label: "Dashboard", active: true, to: "/" as const },
  { icon: Boxes, label: "Digital Twin", to: "/digital-twin" as const },
  { icon: Activity, label: "Well Dynamics", to: "/well-dynamics" as const },
  { icon: SlidersHorizontal, label: "Simulation", to: "/simulation" as const },
  { icon: Gauge, label: "Optimization", to: "/optimization" as const },
  { icon: Radio, label: "Live Monitoring", to: "/monitoring" as const },
  { icon: FileText, label: "Reports", to: "/reports" as const },
];
const toolItems = [
  { icon: Database, label: "Data Explorer", to: "/data-explorer" as const },
  { icon: GitBranch, label: "Scenarios" },
];
function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <Flame className="h-6 w-6 text-sidebar-primary" fill="currentColor" />
        <div>
          <p className="text-sm font-bold tracking-wide text-sidebar-accent-foreground">
            BAGHEWALA
          </p>
          <p className="text-[10px] tracking-widest text-sidebar-foreground/60">
            HEAVY-OIL ASSET
          </p>
        </div>
        <PanelLeftClose className="ml-auto h-4 w-4 text-sidebar-foreground/50" />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={
                item.active
                  ? "flex items-center gap-3 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-semibold text-sidebar-primary-foreground"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
        ))}
        <p className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-widest text-sidebar-foreground/40">
          TOOLS
        </p>
        {toolItems.map((item) => item.to ? (
          <Link key={item.label} to={item.to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><item.icon className="h-4 w-4" />{item.label}</Link>
        ) : (
          <div key={item.label} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80"><item.icon className="h-4 w-4" />{item.label}</div>
        ))}
      </nav>
      <div className="m-3 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent/40">
        <img
          src={twinImg}
          alt="Subsurface geological model"
          className="h-28 w-full object-cover"
          loading="lazy"
          width={512}
          height={512}
        />
        <div className="p-3">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">
            Field Digital Twin
          </p>
          <p className="mt-1 text-[11px] leading-snug text-sidebar-foreground/60">
            Integrated simulation &amp; real-time data for better decisions.
          </p>
        </div>
      </div>
    </aside>
  );
}
/* ---------------- Topbar ---------------- */
function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/90 px-6 backdrop-blur">
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search wells, scenarios, or parameters..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Ctrl + K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent">
          <Settings className="h-4.5 w-4.5" />
        </button>
        <div className="ml-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            OI
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Oil India Limited</p>
            <p className="text-[11px] text-muted-foreground">Operator</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
/* ---------------- Small pieces ---------------- */
function DocBadge() {
  return (
    <span className="rounded-md bg-mint px-2 py-0.5 text-[10px] font-bold tracking-wide text-mint-foreground">
      DOCUMENTED
    </span>
  );
}
function ModelledBadge() {
  return (
    <span className="rounded-md bg-violet-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-foreground">
      MODELLED
    </span>
  );
}
function Sparkline({ color, points }: { color: string; points: string }) {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
/* ---------------- Sections ---------------- */
const infoCards = [
  {
    icon: MapPin,
    tint: "bg-amber-soft text-accent-foreground",
    label: "Field",
    title: "Baghewala Field",
    sub: "Bikaner–Nagaur Basin",
  },
  {
    icon: Layers,
    tint: "bg-amber-soft text-accent-foreground",
    label: "Reservoir",
    title: "Jodhpur Group (Lower Paleozoic)",
    sub: "48 °C native temperature",
  },
  {
    icon: Flame,
    tint: "bg-amber-soft text-accent-foreground",
    label: "Representative well",
    title: "BGW-REP-01",
    sub: "CSS + sucker-rod pump",
  },
];
const readiness = [
  { icon: FileStack, label: "Production history", status: "Partially loaded", tone: "amber" },
  { icon: FileClock, label: "CSS cycle records", status: "Partially loaded", tone: "amber" },
  { icon: Waves, label: "Steam parameters", status: "Loaded", tone: "green" },
  { icon: FileBarChart, label: "VFD / SRP data", status: "Loaded", tone: "green" },
  { icon: MapPin, label: "Failure history", status: "Incident registry", tone: "green" },
  { icon: Satellite, label: "Live field telemetry", status: "Not loaded", tone: "red" },
];
const statusTone: Record<string, string> = {
  amber: "bg-amber-soft text-accent-foreground",
  green: "bg-mint text-mint-foreground",
  red: "bg-rose-soft text-rose-foreground",
};
const provenance = [
  { icon: Landmark, label: "Operator", value: "Oil India Limited (OIL)" },
  { icon: MapPin, label: "Basin", value: "Bikaner–Nagaur Basin" },
  { icon: Layers, label: "Formation", value: "Jodhpur Group (Lower Paleozoic)" },
];
const decisionSteps = [
  {
    n: 1,
    title: "Observe state",
    sub: "Use Digital Twin for physical behavior.",
    active: true,
  },
  {
    n: 2,
    title: "Compare conditions",
    sub: "Optimization for advisory setpoints.",
    active: false,
  },
  {
    n: 3,
    title: "Optimize setpoints",
    sub: "Live Monitoring for telemetry and deviations.",
    active: false,
  },
];
/* ---------------- Page ---------------- */
export function DashboardPage() {
  useDocumentTitle({ title: "Field Dashboard — Baghewala Heavy-Oil Asset", description: "One view of the current well state, modeled benefits and data confidence for the Baghewala heavy-oil asset." });
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    aiRiskResult,
    rodFloatingResult,
    commitSimulationRun,
    resetCurrentToBaseline,
  } = useScenarioStore();

  const productionDelta = productionResult.estimatedProductionBopd - baselineProductionResult.estimatedProductionBopd;
  const productionDeltaText = `${productionDelta >= 0 ? "↑" : "↓"} ${Math.abs(productionDelta).toFixed(1)} vs baseline`;
  const lastUpdated = new Date(new Date().getTime() - 2 * 60 * 1000);
  const lastUpdatedText = `${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const metrics = [
    {
      icon: Thermometer,
      tint: "bg-rose-soft text-rose-foreground",
      label: "TEMPERATURE",
      value: thermalResult.predictedReservoirTemperatureC.toFixed(1),
      unit: "°C",
      color: "oklch(0.65 0.2 25)",
      points: "0,14 10,12 20,15 30,10 40,13 50,9 60,12 70,8 80,10",
    },
    {
      icon: Droplet,
      tint: "bg-sky-soft text-sky-foreground",
      label: "VISCOSITY",
      value: viscosityResult.estimatedViscosityCp.toLocaleString(),
      unit: "cP",
      color: "oklch(0.55 0.14 250)",
      points: "0,16 10,14 20,15 30,11 40,13 50,10 60,12 70,9 80,11",
    },
    {
      icon: Database,
      tint: "bg-mint text-mint-foreground",
      label: "PRODUCTION",
      value: productionResult.estimatedProductionBopd.toFixed(1),
      unit: "BOPD",
      delta: productionDeltaText,
      color: "oklch(0.55 0.12 160)",
      points: "0,16 10,14 20,15 30,12 40,13 50,10 60,11 70,8 80,9",
    },
    {
      icon: Zap,
      tint: "bg-violet-soft text-violet-foreground",
      label: "SRP LOAD",
      value: srpOptimizationResult.currentCandidate.loadIndex.toFixed(0),
      unit: "/100",
      color: "oklch(0.55 0.18 300)",
      points: "0,12 10,14 20,10 30,13 40,9 50,12 60,10 70,13 80,9",
    },
    {
      icon: Flame,
      tint: "bg-amber-soft text-accent-foreground",
      label: "ROD FLOATING",
      value: String(rodFloatingResult.rodFloatingIndex),
      unit: "/100",
      tag: rodFloatingResult.riskLevel,
      color: "oklch(0.7 0.15 75)",
      points: "0,14 10,12 20,14 30,11 40,13 50,10 60,12 70,10 80,11",
    },
    {
      icon: AlertTriangle,
      tint: "bg-amber-soft text-accent-foreground",
      label: "RISK",
      value: aiRiskResult.riskLevel,
      unit: "",
      color: "oklch(0.72 0.16 75)",
      points: "0,18 10,18 20,18 30,18 40,18 50,18 60,18 70,18 80,18",
    },
  ];
  const benefitCards = [
    {
      icon: BarChart3,
      tint: "bg-mint text-mint-foreground",
      title: "Production",
      value: productionResult.estimatedProductionBopd.toFixed(1),
      unit: "BOPD",
      note: productionDeltaText,
      noteClass: "text-mint-foreground",
      area: "oklch(0.55 0.12 160)",
    },
    {
      icon: Droplet,
      tint: "bg-sky-soft text-sky-foreground",
      title: "Viscosity",
      value: viscosityResult.estimatedViscosityCp.toLocaleString(),
      unit: "cP",
      note: "Lower viscosity improves mobility",
      noteClass: "text-muted-foreground",
      area: "oklch(0.55 0.14 250)",
    },
    {
      icon: ShieldCheck,
      tint: "bg-violet-soft text-violet-foreground",
      title: "Equipment risk",
      value: aiRiskResult.riskLevel,
      unit: "",
      note: `${rodFloatingResult.impactLoadingIndex}/100 impact loading`,
      noteClass: "text-muted-foreground",
      area: "oklch(0.55 0.18 300)",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-56">
        <Topbar />
        <main className="space-y-4 p-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-border">
            <img
              src={heroImg}
              alt="Baghewala oil field at sunrise"
              className="absolute inset-0 h-full w-full object-cover"
              width={1920}
              height={640}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
            <div className="relative flex flex-wrap items-start justify-between gap-6 p-6">
              <div className="max-w-xl">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground">
                  <Zap className="h-3.5 w-3.5" /> Baghewala Heavy-Oil Asset
                </p>
                <h1 className="mt-1 text-4xl font-bold tracking-tight">Field Dashboard</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  One view of the current well state, modeled benefits and data confidence.
                </p>
              </div>
              <div className="w-64 rounded-xl border border-mint-foreground/20 bg-mint/80 p-4 backdrop-blur">
                <p className="text-xs font-semibold text-mint-foreground">
                  Live Production Forecast
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{productionResult.estimatedProductionBopd.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">BOPD</span>
                </div>
                <p className="text-xs font-medium text-mint-foreground">{productionDeltaText}</p>
                <svg viewBox="0 0 120 32" className="mt-2 h-8 w-full">
                  {[8, 12, 10, 16, 14, 20, 18, 24, 22, 28].map((h, i) => (
                    <rect
                      key={i}
                      x={i * 12}
                      y={32 - h}
                      width="7"
                      height={h}
                      rx="1.5"
                      className="fill-mint-foreground/70"
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div className="relative flex gap-3 px-6 pb-5">
              <button className="flex items-center gap-2 rounded-lg bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow" onClick={commitSimulationRun}>
                <CircleDot className="h-4 w-4" /> Model Active
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm" onClick={resetCurrentToBaseline}>
                <RefreshCw className="h-4 w-4" /> Reference Baseline
              </button>
            </div>
          </section>
          {/* Info cards */}
          <section className="grid grid-cols-3 gap-4">
            {infoCards.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tint}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">{c.label}</p>
                  <p className="truncate text-sm font-bold">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <DocBadge />
              </div>
            ))}
          </section>
          {/* Current engineering state */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Current engineering state</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-mint-foreground" />
                  Model running – Live outputs for the selected scenario.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Last updated</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-foreground" /> {lastUpdatedText}
                </span>
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium">
                  Active Scenario
                </span>
                <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  {activeScenario.name} <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.tint}`}>
                      <m.icon className="h-4 w-4" />
                    </div>
                    <ModelledBadge />
                  </div>
                  <p className="mt-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="text-lg font-bold">
                    {m.value}
                    {m.unit && (
                      <span className="ml-1 text-xs font-medium text-muted-foreground">
                        {m.unit}
                      </span>
                    )}
                  </p>
                  {m.delta && (
                    <p className="text-[10px] font-medium text-mint-foreground">{m.delta}</p>
                  )}
                  {m.tag && (
                    <p className="text-[10px] font-bold text-accent-foreground">{m.tag}</p>
                  )}
                  <div className="mt-1">
                    <Sparkline color={m.color} points={m.points} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Benefits + Data readiness */}
          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <BarChart3 className="h-4 w-4 text-accent-foreground" /> Benefits scorecard
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Baseline compared with the active modeled state.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {benefitCards.map((b, bi) => (
                  <div key={b.title} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${b.tint}`}>
                        <b.icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold">{b.title}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {b.value}
                      {b.unit && (
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          {b.unit}
                        </span>
                      )}
                    </p>
                    <p className={`text-[11px] font-medium ${b.noteClass}`}>{b.note}</p>
                    <svg viewBox="0 0 120 40" className="mt-2 h-10 w-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`bg-${bi}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={b.area} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={b.area} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,32 L15,28 L30,30 L45,22 L60,25 L75,16 L90,19 L105,10 L120,6 L120,40 L0,40 Z"
                        fill={`url(#bg-${bi})`}
                      />
                      <path
                        d="M0,32 L15,28 L30,30 L45,22 L60,25 L75,16 L90,19 L105,10 L120,6"
                        fill="none"
                        stroke={b.area}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Database className="h-4 w-4 text-sky-foreground" /> Data readiness
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                What is available for this decision view.
              </p>
              <ul className="mt-4 space-y-2.5">
                {readiness.map((r) => (
                  <li key={r.label} className="flex items-center gap-2.5 text-sm">
                    <r.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{r.label}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusTone[r.tone]}`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          {/* Provenance + Decision path */}
          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Layers className="h-4 w-4 text-accent-foreground" /> Provenance at a glance
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Documented source context for the active asset.
              </p>
              <ul className="mt-4 divide-y divide-border">
                {provenance.map((p) => (
                  <li key={p.label} className="flex items-center gap-3 py-3 text-sm">
                    <p.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="w-24 text-muted-foreground">{p.label}</span>
                    <span className="flex-1 font-medium">{p.value}</span>
                    <DocBadge />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Compass className="h-4 w-4 text-sky-foreground" /> Decision path
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Where to continue from this overview.
              </p>
              <div className="mt-6 flex items-start justify-between gap-2">
                {decisionSteps.map((s, i) => (
                  <div key={s.n} className="flex flex-1 items-start gap-2">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          s.active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.n}
                      </div>
                      <p className="mt-2 text-xs font-bold">{s.title}</p>
                      <p className="mt-0.5 max-w-28 text-[10px] leading-snug text-muted-foreground">
                        {s.sub}
                      </p>
                    </div>
                    {i < decisionSteps.length - 1 && (
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Continue to Optimization to compare advisory setpoints against the base case.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
