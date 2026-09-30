import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Bell, Boxes, ChevronDown, ClipboardCheck, Database, Download,
  FileBarChart, FileCheck2, FileJson, FileText, FlaskConical, Flame, Gauge,
  GitBranch, Info, Network, PanelLeftClose, Radio, Search, Settings, ShieldCheck,
  SlidersHorizontal, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import twinImg from "@/assets/digital-twin.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

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
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[196px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2 px-4 pb-5 pt-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Flame className="h-6 w-6" fill="currentColor" /></span>
        <div><p className="text-sm font-bold text-sidebar-accent-foreground">BAGHEWALA</p><p className="text-[9px] text-sidebar-foreground/60">HEAVY-OIL ASSET</p></div>
        <PanelLeftClose className="ml-auto h-4 w-4 text-sidebar-foreground/50" />
      </div>
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <Link key={item.label} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs ${item.label === "Reports" ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow" : "text-sidebar-foreground/85 hover:bg-sidebar-accent"}`}>
            <item.icon className="h-4 w-4" />{item.label}{item.label === "Reports" && <span className="ml-auto">›</span>}
          </Link>
        ))}
        <p className="border-t border-sidebar-border px-3 pb-2 pt-5 text-[9px] tracking-wider text-sidebar-foreground/45">TOOLS</p>
        <Link to="/data-explorer" className="flex items-center gap-3 px-3 py-2 text-xs"><Database className="h-4 w-4" />Data Explorer</Link>
        <div className="flex items-center gap-3 px-3 py-2 text-xs"><GitBranch className="h-4 w-4" />Scenarios</div>
      </nav>
      <div className="mx-3 mb-3 mt-auto overflow-hidden rounded-md border border-sidebar-border bg-sidebar-accent/35">
        <img src={twinImg} alt="Field digital twin geological model" className="h-24 w-full object-cover" />
        <div className="p-3"><p className="text-sm font-semibold text-sidebar-accent-foreground">Field Digital Twin</p><p className="mt-1 text-[10px] leading-relaxed text-sidebar-foreground/65">Integrated simulation &amp; real-time data for better decisions.</p></div>
      </div>
    </aside>
  );
}
function Topbar() {
  return (
    <header className="flex h-12 items-center border-b border-border bg-card px-5">
      <PanelLeftClose className="mr-5 h-4 w-4 rotate-180 text-muted-foreground" />
      <div className="flex w-[405px] items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" /><input aria-label="Search" placeholder="Search wells, scenarios, or parameters..." className="min-w-0 flex-1 bg-transparent text-[9px] outline-none" /><kbd className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">Ctrl + K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-3"><Button size="icon" variant="ghost" className="relative h-8 w-8" aria-label="Notifications"><Bell /><span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-destructive" /></Button><Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Settings"><Settings /></Button><div className="flex items-center gap-2 border-l border-border pl-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">OI</span><div><p className="text-[10px] font-bold">Oil India Limited</p><p className="text-[8px] text-muted-foreground">Administrator</p></div><ChevronDown className="ml-2 h-3.5 w-3.5" /></div></div>
    </header>
  );
}
type ReportKey = "live" | "scenario" | "validation" | "pilot";
type ReportDefinition = {
  title: string;
  subtitle: string;
  id: string;
  risk: string;
  icon: typeof FileText;
  sections: Array<{ title: string; body: string; detail?: string; icon: typeof FileText; tone: string }>;
};
const reports: Record<ReportKey, ReportDefinition> = {
  live: {
    title: "Live Simulation Report", subtitle: "Current operating state and model outputs", id: "RPT-LIVE-1790730734403 · 2026-09-30T01:12:14.403Z", risk: "HIGH", icon: FileText,
    sections: [
      { title: "Physics results", body: "The current simulation operating at reservoir temp 65.8°C and 8 SPM yields an estimated crude viscosity of 2,133 cP and production rate of 2.11 BOPD. Fluid mobility shifted by 134.9%, placing the system risk status at HIGH (40/100).", icon: FlaskConical, tone: "bg-sky-soft text-sky-foreground" },
      { title: "Optimize Steam Soak Duration & Enforce TWCCEP Connections", body: "Maintain steam injection quality >=80% and inspect surface wellhead thermal expansion joints before cycle 2.", detail: "Expected impact: Prevents thermal casing elongation leak while sustaining temperature gain.", icon: Settings, tone: "bg-mint text-mint-foreground" },
      { title: "Regulate Pumping Speed & Polished Rod Load Index", body: "Adjust VFD frequency to keep SPM between 7.0 and 10.0 SPM to avoid rod fatigue parting.", detail: "Expected impact: Extends sucker rod string fatigue endurance life.", icon: Network, tone: "bg-violet-soft text-violet-foreground" },
    ],
  },
  scenario: {
    title: "Scenario Comparison Report", subtitle: "Compare multiple scenarios and outcomes", id: "RPT-SCENARIO-1790730734404 · 2026-09-30T01:12:14.403Z", risk: "MEDIUM", icon: FileBarChart,
    sections: [
      { title: "Scenario comparison", body: "Five operating scenarios were evaluated against the current baseline. Max Production improves output by 12% while maintaining equipment risk within the approved operating envelope.", icon: FileBarChart, tone: "bg-sky-soft text-sky-foreground" },
      { title: "Preferred operating case", body: "The balanced optimization case provides the best weighted outcome across production, energy cost, and equipment protection.", detail: "Expected impact: Stable production with lower intervention frequency.", icon: Network, tone: "bg-mint text-mint-foreground" },
      { title: "Trade-off summary", body: "Higher stroke frequency improves production but increases polished rod load and energy demand.", detail: "Recommendation: Retain 8–10 SPM and review after the next telemetry window.", icon: Wrench, tone: "bg-violet-soft text-violet-foreground" },
    ],
  },
  validation: {
    title: "Validation & Readiness Report", subtitle: "Model validation and data readiness", id: "RPT-VALIDATION-1790730734405 · 2026-09-30T01:12:14.403Z", risk: "READY", icon: ShieldCheck,
    sections: [
      { title: "Model validation", body: "The physics model is aligned with the latest pressure, temperature, viscosity, and production measurements at 94% confidence.", icon: FlaskConical, tone: "bg-sky-soft text-sky-foreground" },
      { title: "Data readiness", body: "Telemetry coverage is 99.7%. All required inputs are available and within accepted recency limits.", detail: "No blocking data-quality issues were detected.", icon: ClipboardCheck, tone: "bg-mint text-mint-foreground" },
      { title: "Readiness decision", body: "The current model package is ready for engineering review and controlled field validation.", detail: "Maintain operator approval before applying recommendations.", icon: ShieldCheck, tone: "bg-violet-soft text-violet-foreground" },
    ],
  },
  pilot: {
    title: "Production Pilot Audit", subtitle: "Field pilot analysis and lessons learned", id: "RPT-PILOT-1790730734406 · 2026-09-30T01:12:14.403Z", risk: "REVIEW", icon: FileCheck2,
    sections: [
      { title: "Pilot performance", body: "The production pilot maintained stable operation through the monitored interval with no unplanned shutdowns.", icon: FileBarChart, tone: "bg-sky-soft text-sky-foreground" },
      { title: "Operational observations", body: "Temperature response remained within the expected envelope while viscosity improved after thermal intervention.", detail: "Field observations support the modelled mobility trend.", icon: ClipboardCheck, tone: "bg-mint text-mint-foreground" },
      { title: "Lessons learned", body: "Earlier rod-load review and tighter thermal inspection gates should be included in the next pilot cycle.", detail: "Action owners should confirm closure before restart.", icon: Wrench, tone: "bg-violet-soft text-violet-foreground" },
    ],
  },
};
function downloadReport(report: ReportDefinition, format: "md" | "json") {
  const data = format === "json"
    ? JSON.stringify({ title: report.title, id: report.id, risk: report.risk, sections: report.sections.map(({ title, body, detail }) => ({ title, body, detail })) }, null, 2)
    : `# ${report.title}\n\n${report.id}\n\nRisk: ${report.risk}\n\n${report.sections.map((section) => `## ${section.title}\n\n${section.body}${section.detail ? `\n\n${section.detail}` : ""}`).join("\n\n")}`;
  const url = URL.createObjectURL(new Blob([data], { type: format === "json" ? "application/json" : "text/markdown" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.title.toLowerCase().replaceAll(" ", "-")}.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
export function ReportsPage() {
  useDocumentTitle({ title: "Engineering Reports — Baghewala Heavy-Oil Asset", description: "Review Baghewala live simulations, scenario comparisons, validation evidence, and production pilot audits." });
  const [selected, setSelected] = useState<ReportKey>("live");
  const report = reports[selected];
  const tabs = Object.entries(reports) as Array<[ReportKey, ReportDefinition]>;
  return (
    <div className="min-h-screen bg-background"><Sidebar /><div className="lg:pl-[196px]"><div className="min-w-[1080px]"><Topbar /><main className="px-5 pb-4 pt-3">
      <section className="relative overflow-hidden py-3">
        <div className="absolute inset-0 opacity-30 [background-image:repeating-radial-gradient(ellipse_at_60%_80%,transparent_0,transparent_7px,var(--amber-soft)_8px,transparent_9px)]" />
        <div className="relative border-l-4 border-primary pl-3"><div className="flex items-center gap-3"><h1 className="text-[26px] font-bold leading-none">Reports</h1><span className="rounded-md border border-border bg-card/80 px-3 py-1 text-[8px] font-bold tracking-widest text-muted-foreground">ENGINEERING EVIDENCE</span></div><p className="mt-2 text-[11px] text-muted-foreground">Live simulation, scenario comparison, validation and pilot audit.</p></div>
      </section>
      <section className="grid grid-cols-4 gap-2">
        {tabs.map(([key, item]) => <Button key={key} variant="outline" onClick={() => setSelected(key)} className={`h-[62px] justify-start px-3 text-left ${selected === key ? "border-primary bg-amber-soft/40" : "bg-card"}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-soft text-accent-foreground"><item.icon className="h-5 w-5" /></span><span className="min-w-0"><strong className="block truncate text-[10px]">{item.title}</strong><span className="block truncate text-[9px] font-normal text-muted-foreground">{item.subtitle}</span></span></Button>)}
      </section>
      <section className="mt-4 min-h-[430px] rounded-lg border border-primary bg-card px-5 py-4 shadow-sm">
        <div className="flex items-start border-b border-border pb-3"><div><h2 className="text-[15px] font-bold">{report.title}</h2><p className="mt-1 text-[10px] text-muted-foreground">{report.id}</p></div><span className={`ml-auto rounded-md border px-3 py-2 text-[9px] font-bold tracking-widest ${report.risk === "HIGH" ? "border-rose-foreground/20 bg-rose-soft text-rose-foreground" : report.risk === "READY" ? "border-mint-foreground/20 bg-mint text-mint-foreground" : "border-primary/20 bg-amber-soft text-accent-foreground"}`}>● {report.risk}</span></div>
        <div className="flex gap-2 py-3"><Button size="sm" className="h-8 text-[10px]" onClick={() => downloadReport(report, "md")}><Download />Markdown (.md)</Button><Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => downloadReport(report, "json")}><FileJson />JSON (.json)</Button></div>
        <div className="space-y-5 pt-2">{report.sections.map((section) => <article key={section.title} className="flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${section.tone}`}><section.icon className="h-5 w-5" /></span><div><h3 className="text-[13px] font-bold">{section.title}</h3><p className="mt-1 max-w-[900px] text-[10px] leading-relaxed text-muted-foreground">{section.body}</p>{section.detail && <p className="text-[10px] leading-relaxed text-muted-foreground">{section.detail}</p>}</div></article>)}</div>
        <div className="mt-4 flex items-center gap-3 rounded-md border border-primary/30 bg-amber-soft/45 px-3 py-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Info className="h-4 w-4" /></span><div><p className="text-[9px] font-bold text-accent-foreground">HISTORICAL EVIDENCE — NOT A PREDICTION</p><p className="text-[9px] text-muted-foreground">This report is based on documented field data and model outputs from the selected simulation state.</p></div></div>
      </section>
    </main></div></div></div>
  );
}

export default ReportsPage;
