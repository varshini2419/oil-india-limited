import React, { useState, useMemo } from 'react';
import { AnimationProvider } from '../digital-twin/animations';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from '../predictiveMaintenance/RiskGauges';
import { AlertSummaryCards } from '../alertsEvents/AlertSummaryCards';
import { AlertRiskGauges } from '../alertsEvents/AlertRiskGauges';
import { EventFilters } from '../alertsEvents/EventFilters';
import type { ViewTab, SeverityFilter, CategoryFilter } from '../alertsEvents/EventFilters';
import { LiveEventFeed } from '../alertsEvents/LiveEventFeed';
import type { SystemEvent } from '../alertsEvents/LiveEventFeed';
import { EventTimeline } from '../alertsEvents/EventTimeline';
import { EventDetailsModal } from '../alertsEvents/EventDetailsModal';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const AlertsEventsPanel: React.FC = () => {
  const { committedSimulationResult, srpOptimizationResult, aiRiskResult, productionResult } = useScenarioStore();

  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ViewTab>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventModal, setSelectedEventModal] = useState<SystemEvent | null>(null);

  // Generate dynamic system events strictly derived from canonical simulation state
  const events = useMemo<SystemEvent[]>(() => {
    const curCandidate = srpOptimizationResult.currentCandidate;
    const inputs = committedSimulationResult.inputs;
    const predictiveRisks = calculatePredictiveRisks(curCandidate, aiRiskResult.riskScore);
    const pumpFillagePct = Number(Math.min(100, Math.max(10, curCandidate.pumpCapacityFactor * 100)).toFixed(1));

    const now = new Date();
    const timeStr = (offsetSec: number) => {
      const d = new Date(now.getTime() - offsetSec * 1000);
      return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
    };

    const evts: SystemEvent[] = [];

    // 1. SRP SPM Rule
    if (curCandidate.spm > 12) {
      evts.push({
        id: 'evt-srp-spm-high',
        timestamp: timeStr(12),
        severity: 'HIGH',
        category: 'SRP',
        title: 'SRP SPM Operating Above High Threshold',
        parameter: 'SPM',
        currentValue: `${curCandidate.spm.toFixed(1)} SPM`,
        threshold: '12.0 SPM Limit',
        delta: `+${(curCandidate.spm - 10).toFixed(1)} SPM`,
        cause: 'High SPM setting increases rod fatigue stress and power consumption beyond API RP 11L baseline.',
        action: 'Lower SPM to 8.0 - 10.0 range or enable auto-optimization candidate.',
        isAcknowledged: acknowledgedIds.has('evt-srp-spm-high'),
      });
    } else if (curCandidate.spm > 10) {
      evts.push({
        id: 'evt-srp-spm-warn',
        timestamp: timeStr(45),
        severity: 'WARNING',
        category: 'SRP',
        title: 'SRP Operating Speed In Moderate Range',
        parameter: 'SPM',
        currentValue: `${curCandidate.spm.toFixed(1)} SPM`,
        threshold: '10.0 SPM Target',
        delta: `+${(curCandidate.spm - 8).toFixed(1)} SPM`,
        cause: 'Increased stroke rate near upper recommended operating boundary.',
        action: 'Monitor peak rod load and fluid fillage for potential gas interference.',
        isAcknowledged: acknowledgedIds.has('evt-srp-spm-warn'),
      });
    } else {
      evts.push({
        id: 'evt-srp-spm-norm',
        timestamp: timeStr(120),
        severity: 'NORMAL',
        category: 'SRP',
        title: 'SRP Operating Speed Nominal',
        parameter: 'SPM',
        currentValue: `${curCandidate.spm.toFixed(1)} SPM`,
        threshold: '8.0 - 10.0 SPM Nominal',
        cause: 'Stroke rate fully compliant with well fluid inflow capacity.',
        action: 'Maintain current SPM setting.',
        isAcknowledged: acknowledgedIds.has('evt-srp-spm-norm'),
      });
    }

    // 2. SRP Load Index Rule
    if (curCandidate.loadIndex > 80) {
      evts.push({
        id: 'evt-srp-load-crit',
        timestamp: timeStr(28),
        severity: 'CRITICAL',
        category: 'SRP',
        title: 'Peak Rod Stress Approaching Material Yield Limit',
        parameter: 'Load Index',
        currentValue: `${curCandidate.loadIndex.toFixed(1)}%`,
        threshold: '80.0% Max Design',
        delta: `+${(curCandidate.loadIndex - 65).toFixed(1)}%`,
        cause: 'Excessive fluid weight or rod friction causing peak rod load to exceed safe structural endurance limit.',
        action: 'Immediate SPM reduction or hot water flush to reduce heavy oil viscosity drag.',
        isAcknowledged: acknowledgedIds.has('evt-srp-load-crit'),
      });
    } else if (curCandidate.loadIndex > 65) {
      evts.push({
        id: 'evt-srp-load-warn',
        timestamp: timeStr(90),
        severity: 'WARNING',
        category: 'SRP',
        title: 'Elevated Rod Load Index',
        parameter: 'Load Index',
        currentValue: `${curCandidate.loadIndex.toFixed(1)}%`,
        threshold: '65.0% Caution Boundary',
        delta: `+${(curCandidate.loadIndex - 60).toFixed(1)}%`,
        cause: 'High fluid viscosity drag in upper tubing section.',
        action: 'Inspect dynamometer load card and optimize steam injection thermal heating.',
        isAcknowledged: acknowledgedIds.has('evt-srp-load-warn'),
      });
    }

    // 3. Pump Fillage Rule
    if (pumpFillagePct < 60) {
      evts.push({
        id: 'evt-srp-fill-high',
        timestamp: timeStr(65),
        severity: 'HIGH',
        category: 'SRP',
        title: 'Low Pump Fillage / Fluid Pound Risk',
        parameter: 'Pump Fillage',
        currentValue: `${pumpFillagePct.toFixed(1)}%`,
        threshold: '65.0% Minimum Safe',
        delta: `-${(65 - pumpFillagePct).toFixed(1)}%`,
        cause: 'Pumping speed exceeds well fluid inflow rate, causing gas lock or fluid pound.',
        action: 'Reduce SPM or adjust cyclic pumping interval.',
        isAcknowledged: acknowledgedIds.has('evt-srp-fill-high'),
      });
    }

    // 4. CSS Steam Quality Rule
    if (inputs.steamQualityPercent < 65) {
      evts.push({
        id: 'evt-css-qual-warn',
        timestamp: timeStr(150),
        severity: 'WARNING',
        category: 'CSS',
        title: 'Sub-Optimal Steam Quality at Wellhead',
        parameter: 'Steam Quality',
        currentValue: `${inputs.steamQualityPercent.toFixed(1)}%`,
        threshold: '70.0% Target Quality',
        delta: `-${(70 - inputs.steamQualityPercent).toFixed(1)}%`,
        cause: 'Thermal insulation loss in steam delivery line or generator efficiency drop.',
        action: 'Inspect steam separator and adjust boiler fuel/feedwater ratio.',
        isAcknowledged: acknowledgedIds.has('evt-css-qual-warn'),
      });
    } else {
      evts.push({
        id: 'evt-css-qual-norm',
        timestamp: timeStr(210),
        severity: 'NORMAL',
        category: 'CSS',
        title: 'CSS Steam Thermal Efficiency Nominal',
        parameter: 'Steam Quality',
        currentValue: `${inputs.steamQualityPercent.toFixed(1)}%`,
        threshold: '70.0% Minimum Target',
        cause: 'Steam enthalpy sufficient for optimal reservoir viscosity reduction.',
        action: 'Continue scheduled steam injection cycle.',
        isAcknowledged: acknowledgedIds.has('evt-css-qual-norm'),
      });
    }

    // 5. Predictive Rod Failure & Equipment Health Rules
    if (predictiveRisks.rodFailurePct > 30) {
      evts.push({
        id: 'evt-pred-rod-warn',
        timestamp: timeStr(75),
        severity: 'WARNING',
        category: 'PREDICTIVE',
        title: 'Rod String Fatigue Damage Accumulation',
        parameter: 'Rod Failure Risk',
        currentValue: `${predictiveRisks.rodFailurePct.toFixed(1)}%`,
        threshold: '25.0% Action Threshold',
        delta: `+${(predictiveRisks.rodFailurePct - 25).toFixed(1)}%`,
        cause: 'Cyclic load stress reversal accumulation over extended operating cycles.',
        action: 'Schedule NDT inspection for sucker rod string during next maintenance window.',
        isAcknowledged: acknowledgedIds.has('evt-pred-rod-warn'),
      });
    }

    // 6. AI Risk Score Rule
    if (aiRiskResult.riskScore > 60) {
      evts.push({
        id: 'evt-ai-risk-crit',
        timestamp: timeStr(15),
        severity: 'CRITICAL',
        category: 'AI_RISK',
        title: 'Composite Wellhead Risk Index Alert',
        parameter: 'System Risk Score',
        currentValue: `${aiRiskResult.riskScore.toFixed(1)} / 100`,
        threshold: '60.0 Upper Limit',
        delta: `+${(aiRiskResult.riskScore - 60).toFixed(1)}`,
        cause: 'Multi-parameter anomaly combining high load index, low fillage, and elevated temperature variance.',
        action: 'Execute multi-variable optimization plan in SPM & CSS Optimizers.',
        isAcknowledged: acknowledgedIds.has('evt-ai-risk-crit'),
      });
    } else if (aiRiskResult.riskScore > 35) {
      evts.push({
        id: 'evt-ai-risk-warn',
        timestamp: timeStr(110),
        severity: 'WARNING',
        category: 'AI_RISK',
        title: 'Moderate Anomaly Detected by Physics-AI Engine',
        parameter: 'System Risk Score',
        currentValue: `${aiRiskResult.riskScore.toFixed(1)} / 100`,
        threshold: '35.0 Nominal Limit',
        delta: `+${(aiRiskResult.riskScore - 35).toFixed(1)}`,
        cause: 'Minor operational variance between thermal mobility model and actual production response.',
        action: 'Review predictive maintenance breakdown and system risk factors.',
        isAcknowledged: acknowledgedIds.has('evt-ai-risk-warn'),
      });
    }

    // 7. Production Metric Rule
    evts.push({
      id: 'evt-prod-norm',
      timestamp: timeStr(300),
      severity: 'NORMAL',
      category: 'PRODUCTION',
      title: 'Net Oil Flow Synchronized with Thermal Viscosity Model',
      parameter: 'Production Rate',
      currentValue: `${productionResult.estimatedProductionBopd.toFixed(1)} BOPD`,
      threshold: 'Target Production Achieved',
      cause: 'Heated reservoir heavy oil viscosity optimized for pump intake.',
      action: 'Maintain thermal injection balance.',
      isAcknowledged: acknowledgedIds.has('evt-prod-norm'),
    });

    return evts;
  }, [srpOptimizationResult, committedSimulationResult, aiRiskResult, productionResult, acknowledgedIds]);

  const activeCount = useMemo(() => events.filter((e) => !e.isAcknowledged).length, [events]);
  const historyCount = useMemo(() => events.length, [events]);

  const handleAcknowledge = (eventId: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  };

  return (
    <AnimationProvider>
      <div className="space-y-5 font-sans">
        {/* Top Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
              <span>Phase 4.10 • Real-Time Anomaly Stream & Audit Management</span>
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">
              ALERTS, EVENTS & AUDIT LOG WORKSTATION
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
              Live operational event feed, multi-variable parameter deltas, severity classification & system risk audit traces.
            </p>
          </div>

          <button
            onClick={() => setAcknowledgedIds(new Set())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
            <span>Reset Acknowledgments</span>
          </button>
        </div>

        {/* 1. Summary Cards */}
        <AlertSummaryCards events={events} />

        {/* 2. Live Risk Radials */}
        <AlertRiskGauges />

        {/* 3. Event Filters & Controls */}
        <EventFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCount={activeCount}
          historyCount={historyCount}
        />

        {/* 4. Live Event Stream Feed */}
        <LiveEventFeed
          events={events}
          activeTab={activeTab}
          severityFilter={severityFilter}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          onAcknowledge={handleAcknowledge}
          onSelectEvent={setSelectedEventModal}
        />

        {/* 5. Chronological Event Timeline */}
        <EventTimeline events={events} onSelectEvent={setSelectedEventModal} />

        {/* 6. Event Audit Detail Modal */}
        <EventDetailsModal
          event={selectedEventModal}
          onClose={() => setSelectedEventModal(null)}
          onAcknowledge={handleAcknowledge}
        />
      </div>
    </AnimationProvider>
  );
};
