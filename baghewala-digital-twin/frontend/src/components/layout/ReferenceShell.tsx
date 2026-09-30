import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  Boxes,
  ChevronDown,
  Database,
  FileText,
  Flame,
  GitBranch,
  Home,
  LogOut,
  Menu,
  Network,
  PanelLeftClose,
  Radio,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import twinImg from "@/assets/digital-twin.jpg";
import { useAuth } from "@/context/AuthContext";

/** Primary navigation — every entry routes to a real screen. */
const navItems = [
  { icon: Home, label: "Dashboard", to: "/" },
  { icon: Boxes, label: "Digital Twin", to: "/digital-twin" },
  { icon: Activity, label: "Well Dynamics", to: "/well-dynamics" },
  { icon: SlidersHorizontal, label: "Simulation", to: "/simulation" },
  { icon: Network, label: "Optimization", to: "/optimization" },
  { icon: Radio, label: "Live Monitoring", to: "/monitoring" },
  { icon: FileText, label: "Reports", to: "/reports" },
];
const toolItems = [
  { icon: Database, label: "Data Explorer", to: "/data-explorer" },
  { icon: GitBranch, label: "Scenarios", to: "/scenarios" },
];

export function ReferenceSidebar({
  open,
  onCloseMobile,
}: {
  open: boolean;
  onCloseMobile: () => void;
}) {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const linkClass = (to: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive(to)
        ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Flame className="h-5 w-5" fill="currentColor" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide text-sidebar-accent-foreground">BAGHEWALA</p>
            <p className="text-[10px] tracking-widest text-sidebar-foreground/60">HEAVY-OIL ASSET</p>
          </div>
          <PanelLeftClose className="ml-auto h-4 w-4 text-sidebar-foreground/50" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} onClick={onCloseMobile} className={linkClass(item.to)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <p className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-widest text-sidebar-foreground/40">
            TOOLS
          </p>
          {toolItems.map((item) => (
            <Link key={item.label} to={item.to} onClick={onCloseMobile} className={linkClass(item.to)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
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
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Field Digital Twin</p>
            <p className="mt-1 text-[11px] leading-snug text-sidebar-foreground/60">
              Integrated simulation &amp; real-time data for better decisions.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export function ReferenceTopbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
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
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent" aria-label="Settings">
          <Settings className="h-4.5 w-4.5" />
        </button>
        <div className="ml-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            OI
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">Oil India Limited</p>
            <p className="text-[11px] text-muted-foreground">{user?.name || "Operator"}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

/**
 * Unified application shell: one sidebar and topbar for every screen.
 * `children` render inside the scrollable content area; `footer` pins
 * content (e.g. StatusBar) below it.
 */
export function ReferenceShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <ReferenceSidebar open={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex h-full min-w-0 flex-1 flex-col lg:pl-56">
        <ReferenceTopbar onOpenMobile={() => setMobileOpen(true)} />
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        {footer}
      </div>
    </div>
  );
}
