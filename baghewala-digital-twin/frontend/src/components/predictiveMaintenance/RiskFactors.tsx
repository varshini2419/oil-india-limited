import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Sliders, Award } from 'lucide-react';

export const RiskFactors: React.FC = () => {
  const { srpOptimizationResult } = useScenarioStore();
  const cur = srpOptimizationResult.currentCandidate;

  const cycleSev = cur.cycleSeverity ?? 35;
  const strokeSev = cur.strokeSeverity ?? 30;
  const speedSev = cur.speedSeverity ?? 40;
  const fillagePct = Math.min(100, Math.max(10, (cur.pumpCapacityFactor ?? 0.82) * 100));

  // Risk contributors normalized out of 12.0
  const spmVal = Number((cycleSev * 0.12).toFixed(1));
  const stressVal = Number((strokeSev * 0.12).toFixed(1));
  const vfdVal = Number((speedSev * 0.12).toFixed(1));
  const fatigueVal = Number((cycleSev * 0.10 + strokeSev * 0.02).toFixed(1));
  const fillageVal = Number(((100 - fillagePct) * 0.12).toFixed(1));

  const factors = [
    { label: 'HIGH SPM', val: spmVal, desc: 'Pumping speed cycle rate' },
    { label: 'ROD STRESS', val: stressVal, desc: 'Peak stroke mechanical tension' },
    { label: 'HIGH VFD', val: vfdVal, desc: 'Motor frequency severity' },
    { label: 'ROD FATIGUE', val: fatigueVal, desc: 'Cyclic reversal stress accumulation' },
    { label: 'PUMP FILLAGE', val: fillageVal, desc: 'Plunger volumetric fill deficit' },
  ];

  // Identify highest contributor
  const maxFactor = factors.reduce((max, curr) => (curr.val > max.val ? curr : max), factors[0]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            FAILURE RISK CONTRIBUTORS BREAKDOWN
          </h3>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Normalized mechanical severity breakdown across operational parameters
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((f, idx) => {
          const isPrimary = f.label === maxFactor.label;
          const barWidthPct = Math.min(100, (f.val / 12) * 100);

          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-slate-200">{f.label}</span>
                  {isPrimary && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[9.5px] font-bold">
                      <Award className="w-3 h-3" /> PRIMARY CONTRIBUTOR
                    </span>
                  )}
                </div>
                <span className="text-sky-600 dark:text-sky-400 font-mono">{f.val} / 12.0</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    isPrimary ? 'bg-rose-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${barWidthPct}%` }}
                />
              </div>

              <div className="text-[9.5px] text-slate-400 font-sans">{f.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
