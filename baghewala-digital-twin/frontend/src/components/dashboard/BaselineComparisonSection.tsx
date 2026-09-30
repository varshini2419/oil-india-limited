import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { GitCompare, Sliders, TrendingUp, TrendingDown } from 'lucide-react';

export const BaselineComparisonSection: React.FC = () => {
  const tel = useTelemetryFluctuation();

  const resTempCur = tel.resTemp;
  const resTempBase = 48.0;
  const resTempOpt = 52.5;

  const visCur = tel.viscosity;
  const visBase = 5014.0;
  const visOpt = 3200.0;

  const steamRateCur = tel.steamRate;
  const steamRateBase = 50.0;
  const steamRateOpt = 60.0;

  const steamQualCur = tel.steamQuality;
  const steamQualBase = 75.0;
  const steamQualOpt = 85.0;

  const srpLoadCur = tel.srpLoad;
  const srpLoadBase = 58.0;
  const srpLoadOpt = 52.0;

  const oilProdCur = tel.oilProd;
  const oilProdBase = 0.75;
  const oilProdOpt = 1.15;

  const tempDiffPct = (((resTempCur - resTempBase) / resTempBase) * 100).toFixed(1);
  const visDiffPct = (((visCur - visBase) / visBase) * 100).toFixed(1);
  const steamRateDiffPct = (((steamRateCur - steamRateBase) / steamRateBase) * 100).toFixed(1);
  const steamQualDiffPct = (((steamQualCur - steamQualBase) / steamQualBase) * 100).toFixed(1);
  const srpLoadDiffPct = (((srpLoadCur - srpLoadBase) / srpLoadBase) * 100).toFixed(1);
  const oilProdDiffPct = (((oilProdCur - oilProdBase) / oilProdBase) * 100).toFixed(1);

  const comparisons = [
    { label: 'Reservoir Temp', base: `${resTempBase.toFixed(1)} °C`, cur: `${resTempCur.toFixed(1)} °C`, diff: `${Number(tempDiffPct) >= 0 ? '+' : ''}${tempDiffPct}%`, isPos: Number(tempDiffPct) >= 0 },
    { label: 'Crude Viscosity', base: `${visBase.toFixed(0)} cP`, cur: `${visCur.toFixed(0)} cP`, diff: `${Number(visDiffPct) >= 0 ? '+' : ''}${visDiffPct}%`, isPos: Number(visDiffPct) <= 0 },
    { label: 'Steam Injection', base: `${steamRateBase.toFixed(0)} TPD`, cur: `${steamRateCur.toFixed(0)} TPD`, diff: `${Number(steamRateDiffPct) >= 0 ? '+' : ''}${steamRateDiffPct}%`, isPos: Number(steamRateDiffPct) >= 0 },
    { label: 'Steam Quality', base: `${steamQualBase.toFixed(0)}%`, cur: `${steamQualCur.toFixed(1)}%`, diff: `${Number(steamQualDiffPct) >= 0 ? '+' : ''}${steamQualDiffPct}%`, isPos: Number(steamQualDiffPct) >= 0 },
    { label: 'SRP Load Index', base: `${srpLoadBase.toFixed(0)}%`, cur: `${srpLoadCur.toFixed(1)}%`, diff: `${Number(srpLoadDiffPct) >= 0 ? '+' : ''}${srpLoadDiffPct}%`, isPos: Number(srpLoadDiffPct) <= 0 },
    { label: 'Oil Production', base: `${oilProdBase.toFixed(2)} BOPD`, cur: `${oilProdCur.toFixed(2)} BOPD`, diff: `${Number(oilProdDiffPct) >= 0 ? '+' : ''}${oilProdDiffPct}%`, isPos: Number(oilProdDiffPct) >= 0 },
  ];

  const operatingTrios = [
    { label: 'Steam Rate (TPD)', base: steamRateBase, cur: steamRateCur, opt: steamRateOpt, max: 80 },
    { label: 'Steam Quality (%)', base: steamQualBase, cur: steamQualCur, opt: steamQualOpt, max: 100 },
    { label: 'Reservoir Temp (°C)', base: resTempBase, cur: resTempCur, opt: resTempOpt, max: 70 },
    { label: 'Viscosity (cP)', base: visBase, cur: visCur, opt: visOpt, max: 6000 },
    { label: 'Oil Production (BOPD)', base: oilProdBase, cur: oilProdCur, opt: oilProdOpt, max: 1.5 },
    { label: 'SRP Load Utilization (%)', base: srpLoadBase, cur: srpLoadCur, opt: srpLoadOpt, max: 100 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-400 text-sm">
          <GitCompare className="w-5 h-5 text-sky-400" />
          <span>NORMAL BASELINE VS CURRENT & RECOMMENDED STATE COMPARISON</span>
        </div>
        <span className="text-[10px] text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800 font-bold">
          PARETO OPTIMIZATION ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Section 15 Normal Baseline vs Current Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">NORMAL BASELINE VS CURRENT OPERATING STATE</span>
            <span className="text-[10px] text-slate-400 font-bold">FIELD BASELINE MATCH</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {comparisons.map((c, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">{c.label}</span>
                <div className="flex items-center justify-between text-[10.5px] font-bold">
                  <span className="text-slate-500">Base: {c.base}</span>
                  <span className="text-white">Cur: {c.cur}</span>
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${c.isPos ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {c.isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{c.diff} variance</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Section 18 Operating Performance Comparison */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>CURRENT VS RECOMMENDED (OPTIMAL) VS BASELINE</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">3-WAY BENCHMARK</span>
          </div>

          <div className="space-y-2.5">
            {operatingTrios.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-300">{t.label}</span>
                  <div className="flex items-center gap-2 text-[9.5px]">
                    <span className="text-slate-500">Base: {t.base}</span>
                    <span className="text-sky-400">Cur: {typeof t.cur === 'number' ? t.cur.toFixed(1) : t.cur}</span>
                    <span className="text-emerald-400">Opt: {t.opt}</span>
                  </div>
                </div>

                {/* Progress Comparison Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex relative">
                  <div className="bg-slate-700 h-full" style={{ width: `${(t.base / t.max) * 100}%` }} />
                  <div className="bg-sky-500 h-full -ml-1 opacity-80" style={{ width: `${(t.cur / t.max) * 100}%` }} />
                  <div className="bg-emerald-500 h-full -ml-1 opacity-90" style={{ width: `${(t.opt / t.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
