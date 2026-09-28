import React, { useEffect, useState, useRef } from 'react';
import {
  useScenarioStore,
  type ScenarioInputValues
} from '../../simulation/scenario';
import {
  queryBaghewalaRag,
  isRagConfigured,
  type BaghewalaGroundedEvidence,
  type BaghewalaHistoricalEvent,
  type BaghewalaImageEvidence,
  type BaghewalaKnowledgeGap,
  type BaghewalaRagQueryContext,
  type BaghewalaRagResponse
} from '../../services/baghewalaRagService';
import {
  History,
  ExternalLink,
  AlertTriangle,
  ImageOff,
  ShieldAlert,
  Loader2,
  FileText,
  Filter,
  Layers,
  Sparkles,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

/**
 * Shared interface for global/report consumption of historical incident evidence
 */
export interface HistoricalIncidentState {
  incidents: BaghewalaHistoricalEvent[];
  evidence: BaghewalaGroundedEvidence[];
  imageEvidence: BaghewalaImageEvidence[];
  knowledgeGaps: BaghewalaKnowledgeGap[];
  disclaimer: string;
  query: string;
  retrievedAt: string | null;
  simulationContext: BaghewalaRagQueryContext;
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'UNCONFIGURED';
  errorMessage?: string;
}

// Session cache to prevent duplicate network calls for identical simulation contexts
const sessionCache = new Map<string, BaghewalaRagResponse>();

// Singleton state store for cross-component (e.g. Report Generator, AI Explanation Panel) access
let latestIncidentState: HistoricalIncidentState = {
  incidents: [],
  evidence: [],
  imageEvidence: [],
  knowledgeGaps: [],
  disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
  query: '',
  retrievedAt: null,
  simulationContext: {},
  status: 'IDLE'
};

export function getLatestHistoricalIncidentState(): HistoricalIncidentState {
  return latestIncidentState;
}

export function setLatestHistoricalIncidentStateForTest(state: HistoricalIncidentState): void {
  latestIncidentState = state;
}

export const SimulationHistoricalIncidents: React.FC = () => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult
  } = useScenarioStore();

  const inputs: ScenarioInputValues = activeScenario.inputs;

  const [state, setState] = useState<HistoricalIncidentState>({
    incidents: [],
    evidence: [],
    imageEvidence: [],
    knowledgeGaps: [],
    disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
    query: '',
    retrievedAt: null,
    simulationContext: {},
    status: isRagConfigured() ? 'IDLE' : 'UNCONFIGURED'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showKnowledgeGaps, setShowKnowledgeGaps] = useState<boolean>(false);

  const requestSeqRef = useRef<number>(0);

  // Construct readable Baghewala-focused query from active simulation physics
  const buildBaghewalaQuery = (ctx: BaghewalaRagQueryContext): string => {
    const parts: string[] = [];

    if (ctx.viscosity && ctx.viscosity > 4000) {
      parts.push('high crude viscosity', 'low reservoir temperature', 'flow resistance');
    } else if (ctx.viscosity && ctx.viscosity < 1000) {
      parts.push('thermal viscosity reduction', 'steam soak response');
    }

    if (ctx.spm && ctx.spm > 10) {
      parts.push('high SPM pumping', 'sucker rod mechanical load overload');
    }

    if (ctx.steamTemp && ctx.steamTemp > 300) {
      parts.push('high steam injection temperature', 'thermal breakthrough');
    }

    if (ctx.currentRiskLevel === 'CRITICAL' || ctx.currentRiskLevel === 'HIGH') {
      parts.push('operational risk', 'production drawdown failure');
    }

    if (parts.length === 0) {
      parts.push('heavy oil production operating conditions');
    }

    return `Baghewala historical field evidence associated with ${parts.join(', ')}.`;
  };

  useEffect(() => {
    const isConfigured = isRagConfigured();
    if (!isConfigured) {
      const newState: HistoricalIncidentState = {
        incidents: [],
        evidence: [],
        imageEvidence: [],
        knowledgeGaps: [],
        disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
        query: '',
        retrievedAt: null,
        simulationContext: {},
        status: 'UNCONFIGURED',
        errorMessage: 'Historical evidence unavailable — configure VITE_BAGHEWALA_RAG_URL in .env.'
      };
      setState(newState);
      latestIncidentState = newState;
      return;
    }

    const topIssue = aiRiskResult.detectedIssues[0];
    const riskCat = topIssue ? topIssue.category : (aiRiskResult.riskLevel === 'CRITICAL' || aiRiskResult.riskLevel === 'HIGH' ? 'HIGH_RISK_OPERATIONS' : 'NORMAL_OPERATIONS');

    const context: BaghewalaRagQueryContext = {
      reservoirTemp: thermalResult.predictedReservoirTemperatureC,
      viscosity: viscosityResult.estimatedViscosityCp,
      spm: inputs.spm,
      strokeLength: inputs.strokeLengthMeters,
      steamInjectionRate: inputs.steamInjectionRateTpd,
      steamTemp: inputs.steamInjectionTemperatureC,
      vfdFrequency: inputs.vfdFrequencyHz,
      waterCut: inputs.waterCutPercent,
      reservoirPressure: inputs.reservoirPressureBar,
      currentProductionBOPD: productionResult.estimatedProductionBopd,
      currentRiskLevel: aiRiskResult.riskLevel,
      riskCategory: riskCat
    };

    const queryStr = buildBaghewalaQuery(context);
    const cacheKey = JSON.stringify({ queryStr, context });

    if (sessionCache.has(cacheKey)) {
      const cached = sessionCache.get(cacheKey)!;
      const newState: HistoricalIncidentState = {
        incidents: cached.events || [],
        evidence: cached.evidence || [],
        imageEvidence: cached.imageEvidence || [],
        knowledgeGaps: cached.knowledgeGaps || [],
        disclaimer: cached.disclaimer || 'HISTORICAL EVIDENCE — NOT A PREDICTION',
        query: queryStr,
        retrievedAt: new Date().toLocaleTimeString(),
        simulationContext: context,
        status: 'SUCCESS'
      };
      setState(newState);
      latestIncidentState = newState;
      return;
    }

    setState(prev => ({
      ...prev,
      query: queryStr,
      simulationContext: context,
      status: 'LOADING'
    }));

    const currentSeq = ++requestSeqRef.current;

    const timerId = setTimeout(async () => {
      try {
        const res = await queryBaghewalaRag(queryStr, context, { timeoutMs: 5000 });

        if (currentSeq !== requestSeqRef.current) return;

        if (res.success) {
          sessionCache.set(cacheKey, res);
          const newState: HistoricalIncidentState = {
            incidents: res.events || [],
            evidence: res.evidence || [],
            imageEvidence: res.imageEvidence || [],
            knowledgeGaps: res.knowledgeGaps || [],
            disclaimer: res.disclaimer || 'HISTORICAL EVIDENCE — NOT A PREDICTION',
            query: queryStr,
            retrievedAt: new Date().toLocaleTimeString(),
            simulationContext: context,
            status: 'SUCCESS'
          };
          setState(newState);
          latestIncidentState = newState;
        } else {
          const newState: HistoricalIncidentState = {
            incidents: [],
            evidence: [],
            imageEvidence: [],
            knowledgeGaps: [],
            disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
            query: queryStr,
            retrievedAt: new Date().toLocaleTimeString(),
            simulationContext: context,
            status: 'ERROR',
            errorMessage: res.summary || res.error || 'Historical evidence temporarily unavailable.'
          };
          setState(newState);
          latestIncidentState = newState;
        }
      } catch (err: unknown) {
        if (currentSeq !== requestSeqRef.current) return;
        const errStr = err instanceof Error ? err.message : 'Network error';
        const newState: HistoricalIncidentState = {
          incidents: [],
          evidence: [],
          imageEvidence: [],
          knowledgeGaps: [],
          disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
          query: queryStr,
          retrievedAt: new Date().toLocaleTimeString(),
          simulationContext: context,
          status: 'ERROR',
          errorMessage: `Historical evidence connection failed: ${errStr}`
        };
        setState(newState);
        latestIncidentState = newState;
      }
    }, 800);

    return () => clearTimeout(timerId);
  }, [
    inputs.spm,
    inputs.strokeLengthMeters,
    inputs.steamInjectionRateTpd,
    inputs.steamQualityPercent,
    inputs.soakDurationDays,
    inputs.vfdFrequencyHz,
    inputs.reservoirTemperatureC,
    inputs.ambientTemperatureC,
    thermalResult.predictedReservoirTemperatureC,
    viscosityResult.estimatedViscosityCp,
    productionResult.estimatedProductionBopd,
    srpOptimizationResult.currentCandidate.loadIndex,
    aiRiskResult.riskLevel
  ]);

  // Filter evidence based on active category pill
  const filteredEvidence = state.evidence.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Historical Baghewala Grounded Evidence (RAG Integration)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Retrieved document evidence, rheology measurements, and historical incident benchmarks matching active simulation physics</p>
        <div className="flex items-center gap-2 mt-4 font-mono text-xs">
          {state.status === 'LOADING' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 font-bold shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500 dark:text-sky-400" />
              QUERYING RAG...
            </span>
          )}
          {state.status === 'SUCCESS' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold shadow-sm">
              <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {state.evidence.length} GROUNDED RECORDS
            </span>
          )}
          {state.status === 'UNCONFIGURED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold shadow-sm">
              RAG UNCONFIGURED
            </span>
          )}
          {state.status === 'ERROR' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              RAG OFFLINE
            </span>
          )}
        </div>
      </div>
      <div className="space-y-6 font-sans">
        {/* Mandatory Safety Disclaimer Banner */}
        <div className="bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-5 rounded-2xl text-amber-800 dark:text-amber-200 space-y-2 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 border-b border-amber-200/50 dark:border-amber-800/50 pb-3 mb-2">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm">{state.disclaimer || 'HISTORICAL EVIDENCE — NOT A PREDICTION'}</span>
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 font-mono tracking-wider shadow-sm">
              EVIDENCE GROUNDED ONLY
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-amber-800/80 dark:text-amber-100/90 pl-7">
            Historical incidents and documented measurements are retrieved from official Baghewala field reports (SHARP D4.1, OIL EOIs, SPE papers). They provide contextual evidence only and do not guarantee or predict that current simulation conditions will reproduce identical outcomes.
          </p>
        </div>

        {/* Current Modeled Simulation Physics vs Historical Benchmark Comparison Grid */}
        {state.status === 'SUCCESS' && (
          <div className="bg-sky-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-sky-100 dark:border-sky-900/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wider border-b border-sky-200 dark:border-sky-800/50 pb-3">
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span className="text-sm">CURRENT SIMULATION vs HISTORICAL GROUNDED EVIDENCE MATRIX</span>
              </span>
              <span className="text-[10px] text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-sky-200 dark:border-sky-800 shadow-sm font-mono tracking-wider">PARAMETER COMPARISON</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm font-medium">
              {/* Viscosity & Temp */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-all hover:shadow-md">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">1. Crude Rheology</div>
                <div className="text-slate-700 dark:text-slate-200">
                  <span className="text-slate-500">Modeled:</span> <strong className="text-purple-700 dark:text-purple-400 font-mono text-base ml-1">{viscosityResult.estimatedViscosityCp} cP @ {thermalResult.predictedReservoirTemperatureC.toFixed(1)}°C</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg mt-2 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <span className="font-bold text-slate-700 dark:text-slate-400 block mb-1">Historical BGW-1:</span> 1,700 cP @ 60°C (DST Page 64)
                </div>
              </div>

              {/* Steam & Thermal */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-all hover:shadow-md">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">2. Thermal Injection</div>
                <div className="text-slate-700 dark:text-slate-200">
                  <span className="text-slate-500">Modeled Steam Rate:</span> <strong className="text-rose-600 dark:text-rose-400 font-mono text-base ml-1">{inputs.steamInjectionRateTpd} TPD</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg mt-2 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <span className="font-bold text-slate-700 dark:text-slate-400 block mb-1">Historical Limit:</span> 320°C - 350°C @ 11 MPa (TWCCEP ISO/PAS 12835)
                </div>
              </div>

              {/* SRP Pumping Speed */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm transition-all hover:shadow-md">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">3. Artificial Lift SPM</div>
                <div className="text-slate-700 dark:text-slate-200">
                  <span className="text-slate-500">Modeled SPM:</span> <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-base ml-1">{inputs.spm} SPM</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg mt-2 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <span className="font-bold text-slate-700 dark:text-slate-400 block mb-1">Historical Benchmark:</span> BGW#8 8.0 - 12.0 SPM
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Selector Tabs & Knowledge Gap Toggle */}
        {state.status === 'SUCCESS' && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mr-2 flex items-center gap-2 tracking-wider">
                <Filter className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                CATEGORY:
              </span>
              {[
                { key: 'ALL', label: 'ALL EVIDENCE' },
                { key: 'VISCOSITY_RHEOLOGY', label: 'VISCOSITY & RHEOLOGY' },
                { key: 'THERMAL_CSS', label: 'THERMAL CSS' },
                { key: 'WELL_INTEGRITY_CASING', label: 'CASING & WELL INTEGRITY' },
                { key: 'ARTIFICIAL_LIFT', label: 'ARTIFICIAL LIFT' }
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all shadow-sm ${
                    selectedCategory === cat.key
                      ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700/80'
                      : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowKnowledgeGaps(!showKnowledgeGaps)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all shadow-sm flex items-center gap-2 ${
                showKnowledgeGaps
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80'
                  : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>KNOWLEDGE GAPS ({state.knowledgeGaps.length})</span>
            </button>
          </div>
        )}

        {/* Documented Knowledge Gaps Section (When Toggled) */}
        {showKnowledgeGaps && state.knowledgeGaps.length > 0 && (
          <div className="bg-amber-50/50 dark:bg-slate-950/50 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/80 space-y-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider border-b border-amber-200/50 dark:border-amber-800/50 pb-3">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <span>DOCUMENTED FIELD DATA GAPS & LIMITATIONS (SHARP D4.1 TABLE 6)</span>
              </span>
              <span className="text-[10px] text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 font-mono tracking-wider shadow-sm">
                EMPIRICAL GAPS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {state.knowledgeGaps.map((gap) => (
                <div key={gap.id} className="p-5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-sm font-medium shadow-sm transition-all hover:shadow-md">
                  <div className="font-bold text-amber-800 dark:text-amber-200 flex items-center justify-between text-base">
                    <span>{gap.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 tracking-wider shadow-sm">
                      {gap.topic}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{gap.documentedGap}</p>
                  <div className="text-xs font-mono text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 p-3 rounded-lg border border-sky-100 dark:border-sky-900/40 shadow-inner">
                    <strong className="text-sky-900 dark:text-sky-400">Impact:</strong> <br/>{gap.impactOnSimulation}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <span>Source: {gap.sourceDocument}</span>
                    <span>Page: {gap.sourcePage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grounded Evidence Items */}
        {state.status === 'SUCCESS' && filteredEvidence.length > 0 && (
          <div className="space-y-5">
            {filteredEvidence.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-sm hover:shadow-lg transition-all"
              >
                {/* Evidence Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">{item.title}</span>
                      <span className="text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-wrap gap-x-5 gap-y-2">
                      {item.documentedEvidence.date && <span className="flex items-center gap-1.5">📅 {item.documentedEvidence.date}</span>}
                      {item.documentedEvidence.location && <span className="flex items-center gap-1.5">📍 {item.documentedEvidence.location}</span>}
                      <span className="flex items-center gap-1.5">🎯 Relevance: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{(item.relevanceScore * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {/* External Source Link */}
                  {item.provenance.sourceUrl && (
                    <a
                      href={item.provenance.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors shrink-0 font-bold tracking-wider shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      VIEW SOURCE
                    </a>
                  )}
                </div>

                {/* Parameter Match Delta Banner */}
                <div className="bg-amber-50/50 dark:bg-slate-900/90 p-4 rounded-xl border border-amber-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium"><strong className="text-amber-700 dark:text-amber-400 mr-2 uppercase tracking-wider text-xs">WHY RELEVANT:</strong> {item.currentMatch.explanation}</span>
                  </div>
                  <div className="text-[11px] font-mono shrink-0 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm font-bold uppercase tracking-wider">
                    Delta: <strong className="text-sky-600 dark:text-sky-400">{item.currentMatch.delta}</strong>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Description & Provenance */}
                  <div className="md:col-span-2 space-y-4 text-sm font-sans">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.documentedEvidence.description}</p>

                    {item.documentedEvidence.trigger && (
                      <div className="text-sm text-amber-800 dark:text-amber-300 font-mono bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-inner">
                        <strong className="text-amber-900 dark:text-amber-400 block mb-1">Trigger Condition:</strong> {item.documentedEvidence.trigger}
                      </div>
                    )}

                    {/* Provenance Metadata Box */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-3 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Grounded Provenance Metadata</span>
                      <div className="flex flex-wrap gap-x-5 gap-y-3 text-slate-600 dark:text-slate-300">
                        <span>📄 Doc: <strong className="text-slate-800 dark:text-slate-200">{item.provenance.document}</strong></span>
                        <span>📍 Page: <strong className="text-slate-800 dark:text-slate-200">{item.provenance.page}</strong></span>
                        <span>📑 Section: <strong className="text-slate-800 dark:text-slate-200">{item.provenance.section}</strong></span>
                        {item.provenance.figure && <span>🖼️ Figure: <strong className="text-slate-800 dark:text-slate-200">{item.provenance.figure}</strong></span>}
                        <span>Confidence: <strong className="text-emerald-700 dark:text-emerald-400">{item.provenance.confidence}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Historical Media / Photo Attachment */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm">
                    {item.images && item.images.length > 0 ? (
                      <div className="space-y-3 w-full">
                        <div className={`grid ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                          {item.images.map((img, idx) => {
                            const imgSrc = img.imageUrl || img.imagePath;
                            return (
                              <div key={idx} className="space-y-2">
                                {img.imageAvailable && imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={img.caption || item.title}
                                    className="w-full h-32 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                      const fallback = (e.target as HTMLElement).nextElementSibling;
                                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`${img.imageAvailable && imgSrc ? 'hidden' : 'flex'} flex-col items-center justify-center p-5 text-slate-400 dark:text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner`}>
                                  <ImageOff className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-600" />
                                  <span className="font-bold">Historical image unavailable</span>
                                </div>
                                {img.caption && <span className="text-[10px] text-slate-500 block truncate px-2 font-medium">{img.caption}</span>}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-slate-500 font-bold block pt-2 border-t border-slate-200 dark:border-slate-800/50 uppercase tracking-wider">Sourced Historical Photo ({item.images.length})</span>
                      </div>
                    ) : (
                      <div className="p-6 text-slate-400 dark:text-slate-500 text-sm space-y-3 flex flex-col items-center bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 w-full shadow-inner">
                        <ImageOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        <span className="font-bold uppercase tracking-wider text-xs">Historical image unavailable</span>
                        <span className="text-xs text-slate-500 font-medium px-4">No verified field photograph attached to record.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Multimodal Visual Evidence Catalog Grid */}
        {state.status === 'SUCCESS' && state.imageEvidence && state.imageEvidence.length > 0 && (
          <div className="bg-sky-50/50 dark:bg-slate-950/40 p-6 rounded-2xl border border-sky-100 dark:border-sky-900/60 space-y-5 mt-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-bold text-sm uppercase tracking-wider border-b border-sky-200 dark:border-sky-800/50 pb-3">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span>MULTIMODAL IMAGE EVIDENCE & VISUAL GROUNDING CATALOG ({state.imageEvidence.length})</span>
              </span>
              <span className="text-[10px] text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-sky-200 dark:border-sky-800 tracking-widest shadow-sm font-mono">
                VISION & OCR INGESTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {state.imageEvidence.map((img) => (
                <div key={img.imageId} className="p-5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-sm font-sans shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-sky-800 dark:text-sky-300 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <span className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80 text-[10px] shadow-sm tracking-wider uppercase">
                        {img.imageId}
                      </span>
                      <span className="truncate max-w-[200px] text-sm">{img.title}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-slate-800 tracking-wider font-bold">
                      Relevance: {(img.visualRelevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between mt-2 font-bold uppercase tracking-wider">
                    <span>📄 {img.document} ({img.page})</span>
                    <span className="truncate max-w-[150px]">Source: {img.source}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{img.visualAnalysisSummary}</p>

                  {/* OCR Callout Box */}
                  {img.extractedOcrText && (
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-inner">
                      <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase font-bold flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        Extracted OCR Diagram Callouts & Text Labels:
                      </span>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">{img.extractedOcrText}</p>
                    </div>
                  )}

                  {/* Visual Features list */}
                  {img.visualFeatures && img.visualFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50 mt-3">
                      {img.visualFeatures.map((feat, fidx) => (
                        <span key={fidx} className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
