import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { Thermometer, Droplet, Flame, CloudRain, Cpu, ShieldAlert, HeartPulse, TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardKpiCards: React.FC = () => {
  const tel = useTelemetryFluctuation();

  const kpis = [
    {
      label: 'RESERVOIR TEMP',
      value: `${tel.resTemp.toFixed(1)} °C`,
      sub: 'Jodhpur Sandstone Zone',
      delta: tel.resTempDelta,
      isPositive: !tel.resTempDelta.startsWith('↓'),
      icon: Thermometer,
      tone: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60',
    },
    {
      label: 'CRUDE VISCOSITY',
      value: `${tel.viscosity.toLocaleString(undefined, { maximumFractionDigits: 1 })} cP`,
      sub: 'Heated Dynamic Drag',
      delta: tel.viscosityDelta,
      isPositive: tel.viscosityDelta.startsWith('↓'), // Viscosity drop is positive
      icon: Droplet,
      tone: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60',
    },
    {
      label: 'OIL PRODUCTION',
      value: `${tel.oilProd.toFixed(2)} BOPD`,
      sub: 'Vogel Heavy Inflow',
      delta: tel.oilProdDelta,
      isPositive: !tel.oilProdDelta.startsWith('↓'),
      icon: TrendingUp,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60',
    },
    {
      label: 'STEAM INJECTION',
      value: `${tel.steamRate.toFixed(0)} TPD`,
      sub: 'CSS Thermal Mass',
      delta: tel.steamRateDelta,
      isPositive: !tel.steamRateDelta.startsWith('↓'),
      icon: Flame,
      tone: 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60',
    },
    {
      label: 'STEAM QUALITY',
      value: `${tel.steamQuality.toFixed(1)}%`,
      sub: 'Vapor Fraction',
      delta: tel.steamQualityDelta,
      isPositive: !tel.steamQualityDelta.startsWith('↓'),
      icon: CloudRain,
      tone: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900/60',
    },
    {
      label: 'SRP LOAD INDEX',
      value: `${tel.srpLoad.toFixed(1)}%`,
      sub: 'API RP 11L Structural',
      delta: tel.srpLoadDelta,
      isPositive: tel.srpLoadDelta.startsWith('↓'), // Lower load is positive
      icon: Cpu,
      tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60',
    },
    {
      label: 'SYSTEM RISK',
      value: `${tel.riskScore.toFixed(1)} / 100`,
      sub: tel.riskScore > 35 ? 'CAUTION' : 'LOW RISK',
      delta: tel.riskScoreDelta,
      isPositive: tel.riskScoreDelta.startsWith('↓'), // Lower risk is positive
      icon: ShieldAlert,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60',
    },
    {
      label: 'EQUIPMENT HEALTH',
      value: `${tel.healthPct.toFixed(1)}%`,
      sub: 'Pumping Unit Integrity',
      delta: tel.healthPctDelta,
      isPositive: !tel.healthPctDelta.startsWith('↓'),
      icon: HeartPulse,
      tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`border rounded-2xl p-3.5 shadow-sm space-y-1.5 transition-all hover:scale-[1.02] ${kpi.tone}`}
          >
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider opacity-80">
              <span className="truncate">{kpi.label}</span>
              <Icon className="w-3.5 h-3.5 shrink-0" />
            </div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {kpi.value}
            </div>
            <div className="flex items-center justify-between text-[9.5px]">
              <span className="opacity-75 font-sans truncate">{kpi.sub}</span>
              <span className="font-bold shrink-0 ml-1 flex items-center gap-0.5">
                {kpi.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 text-rose-500" />
                )}
                {kpi.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
