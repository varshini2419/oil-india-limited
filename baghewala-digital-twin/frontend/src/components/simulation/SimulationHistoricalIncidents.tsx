import React, { useEffect, useState, useRef } from 'react';
import { Panel } from '../ui/Panel';
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
    <Panel
      title="Historical Baghewala Grounded Evidence (RAG Integration)"
      subtitle="Retrieved document evidence, rheology measurements, and historical incident benchmarks matching active simulation physics"
      action={
        <div className="flex items-center gap-2 font-mono text-xs">
          {state.status === 'LOADING' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
              <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
              QUERYING RAG...
            </span>
          )}
          {state.status === 'SUCCESS' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              <History className="w-3 h-3 text-emerald-400" />
              {state.evidence.length} GROUNDED RECORDS
            </span>
          )}
          {state.status === 'UNCONFIGURED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
              RAG UNCONFIGURED
            </span>
          )}
          {state.status === 'ERROR' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              RAG OFFLINE
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Mandatory Safety Disclaimer Banner */}
        <div className="bg-amber-950/40 border border-amber-800/80 p-3.5 rounded text-amber-200 space-y-1">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-amber-300">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{state.disclaimer || 'HISTORICAL EVIDENCE — NOT A PREDICTION'}</span>
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              EVIDENCE GROUNDED ONLY
            </span>
          </div>
          <p className="text-[11px] font-sans leading-relaxed text-amber-100/90">
            Historical incidents and documented measurements are retrieved from official Baghewala field reports (SHARP D4.1, OIL EOIs, SPE papers). They provide contextual evidence only and do not guarantee or predict that current simulation conditions will reproduce identical outcomes.
          </p>
        </div>

        {/* Current Modeled Simulation Physics vs Historical Benchmark Comparison Grid */}
        {state.status === 'SUCCESS' && (
          <div className="bg-slate-950 p-3.5 rounded border border-sky-900/60 space-y-2.5">
            <div className="flex items-center justify-between text-sky-400 font-bold text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>CURRENT SIMULATION vs HISTORICAL GROUNDED EVIDENCE MATRIX</span>
              </span>
              <span className="text-[10px] text-slate-400">PARAMETER COMPARISON</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              {/* Viscosity & Temp */}
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">1. Crude Rheology</div>
                <div className="text-slate-200">
                  <span className="text-slate-400">Modeled:</span> <strong className="text-purple-300">{viscosityResult.estimatedViscosityCp} cP @ {thermalResult.predictedReservoirTemperatureC}°C</strong>
                </div>
                <div className="text-slate-300 text-[10px]">
                  <span className="text-slate-500">Historical BGW-1:</span> 1,700 cP @ 60°C (DST Page 64)
                </div>
              </div>

              {/* Steam & Thermal */}
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">2. Thermal Injection</div>
                <div className="text-slate-200">
                  <span className="text-slate-400">Modeled Steam Rate:</span> <strong className="text-rose-300">{inputs.steamInjectionRateTpd} TPD</strong>
                </div>
                <div className="text-slate-300 text-[10px]">
                  <span className="text-slate-500">Historical Limit:</span> 320°C - 350°C @ 11 MPa (TWCCEP ISO/PAS 12835)
                </div>
              </div>

              {/* SRP Pumping Speed */}
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">3. Artificial Lift SPM</div>
                <div className="text-slate-200">
                  <span className="text-slate-400">Modeled SPM:</span> <strong className="text-emerald-300">{inputs.spm} SPM</strong>
                </div>
                <div className="text-slate-300 text-[10px]">
                  <span className="text-slate-500">Historical Benchmark:</span> BGW#8 8.0 - 12.0 SPM
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Selector Tabs & Knowledge Gap Toggle */}
        {state.status === 'SUCCESS' && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-sky-400" />
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
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-sky-900 text-sky-200 border border-sky-700'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowKnowledgeGaps(!showKnowledgeGaps)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                showKnowledgeGaps
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>KNOWLEDGE GAPS ({state.knowledgeGaps.length})</span>
            </button>
          </div>
        )}

        {/* Documented Knowledge Gaps Section (When Toggled) */}
        {showKnowledgeGaps && state.knowledgeGaps.length > 0 && (
          <div className="bg-slate-950 p-4 rounded border border-amber-900/80 space-y-3">
            <div className="flex items-center justify-between text-amber-300 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>DOCUMENTED FIELD DATA GAPS & LIMITATIONS (SHARP D4.1 TABLE 6)</span>
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                EMPIRICAL GAPS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.knowledgeGaps.map((gap) => (
                <div key={gap.id} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1.5 text-xs font-sans">
                  <div className="font-bold text-amber-200 flex items-center justify-between font-mono text-[11px]">
                    <span>{gap.title}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {gap.topic}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{gap.documentedGap}</p>
                  <div className="text-[10px] font-mono text-sky-300 bg-sky-950/40 p-1.5 rounded border border-sky-900/40">
                    <strong>Impact:</strong> {gap.impactOnSimulation}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Source: {gap.sourceDocument} | Page: {gap.sourcePage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grounded Evidence Items */}
        {state.status === 'SUCCESS' && filteredEvidence.length > 0 && (
          <div className="space-y-3">
            {filteredEvidence.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded p-4 space-y-3 transition-colors"
              >
                {/* Evidence Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{item.title}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-sky-950 text-sky-300 border border-sky-800">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {item.documentedEvidence.date && <span>📅 Date: {item.documentedEvidence.date}</span>}
                      {item.documentedEvidence.location && <span>📍 Location: {item.documentedEvidence.location}</span>}
                      <span>🎯 Relevance Score: <strong className="text-emerald-400">{(item.relevanceScore * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {/* External Source Link */}
                  {item.provenance.sourceUrl && (
                    <a
                      href={item.provenance.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 transition-colors shrink-0 font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      VIEW SOURCE
                    </a>
                  )}
                </div>

                {/* Parameter Match Delta Banner */}
                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>WHY RELEVANT:</strong> {item.currentMatch.explanation}</span>
                  </div>
                  <div className="text-[10px] font-mono shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                    Delta: <strong className="text-sky-300">{item.currentMatch.delta}</strong>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column: Description & Provenance */}
                  <div className="md:col-span-2 space-y-2 text-xs font-sans">
                    <p className="text-slate-300 leading-relaxed">{item.documentedEvidence.description}</p>

                    {item.documentedEvidence.trigger && (
                      <div className="text-[11px] text-amber-300 font-mono bg-amber-950/20 p-2 rounded border border-amber-900/40">
                        <strong>Trigger Condition:</strong> {item.documentedEvidence.trigger}
                      </div>
                    )}

                    {/* Provenance Metadata Box */}
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-mono space-y-1">
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Grounded Provenance Metadata</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-300">
                        <span>📄 Doc: <strong className="text-slate-200">{item.provenance.document}</strong></span>
                        <span>📍 Page: <strong className="text-slate-200">{item.provenance.page}</strong></span>
                        <span>📑 Section: <strong className="text-slate-200">{item.provenance.section}</strong></span>
                        {item.provenance.figure && <span>🖼️ Figure: <strong className="text-slate-200">{item.provenance.figure}</strong></span>}
                        <span>Confidence: <strong className="text-emerald-400">{item.provenance.confidence}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Historical Media / Photo Attachment */}
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-center items-center text-center">
                    {item.images && item.images.length > 0 ? (
                      <div className="space-y-2 w-full">
                        <div className={`grid ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                          {item.images.map((img, idx) => {
                            const imgSrc = img.imageUrl || img.imagePath;
                            return (
                              <div key={idx} className="space-y-1">
                                {img.imageAvailable && imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={img.caption || item.title}
                                    className="w-full h-24 object-cover rounded border border-slate-800"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                      const fallback = (e.target as HTMLElement).nextElementSibling;
                                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`${img.imageAvailable && imgSrc ? 'hidden' : 'flex'} flex-col items-center justify-center p-3 text-slate-500 text-[10px] bg-slate-950 rounded border border-slate-800`}>
                                  <ImageOff className="w-4 h-4 mb-1 text-slate-600" />
                                  <span className="font-bold text-slate-400">Historical image unavailable</span>
                                </div>
                                {img.caption && <span className="text-[8px] text-slate-400 block truncate">{img.caption}</span>}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[9px] text-slate-500 block">Sourced Historical Photo ({item.images.length})</span>
                      </div>
                    ) : (
                      <div className="p-3 text-slate-500 text-[10px] space-y-1 flex flex-col items-center">
                        <ImageOff className="w-5 h-5 text-slate-600" />
                        <span className="font-bold text-slate-400">Historical image unavailable</span>
                        <span className="text-[9px] text-slate-600 font-sans">No verified field photograph attached to record.</span>
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
          <div className="bg-slate-950 p-4 rounded border border-sky-900/60 space-y-3 mt-4">
            <div className="flex items-center justify-between text-sky-300 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>MULTIMODAL IMAGE EVIDENCE & VISUAL GROUNDING CATALOG ({state.imageEvidence.length})</span>
              </span>
              <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                VISION & OCR INGESTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.imageEvidence.map((img) => (
                <div key={img.imageId} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold text-sky-200 border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px]">
                        {img.imageId}
                      </span>
                      <span className="truncate max-w-[200px]">{img.title}</span>
                    </span>
                    <span className="text-[9px] text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      Relevance: {(img.visualRelevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>📄 {img.document} ({img.page})</span>
                    <span className="truncate max-w-[150px]">Source: {img.source}</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">{img.visualAnalysisSummary}</p>

                  {/* OCR Callout Box */}
                  {img.extractedOcrText && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                      <span className="text-[9px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
                        <Eye className="w-3 h-3 text-amber-400" />
                        Extracted OCR Diagram Callouts & Text Labels:
                      </span>
                      <p className="text-[10px] font-mono text-slate-300 leading-snug">{img.extractedOcrText}</p>
                    </div>
                  )}

                  {/* Visual Features list */}
                  {img.visualFeatures && img.visualFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {img.visualFeatures.map((feat, fidx) => (
                        <span key={fidx} className="text-[9px] font-mono bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
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
    </Panel>
  );
};
