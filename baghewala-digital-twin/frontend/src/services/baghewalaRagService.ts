/**
 * BAGHEWALA DIGITAL TWIN — SIMULATION RAG SERVICE ADAPTER
 * 
 * Production client for querying remotely hosted historical Baghewala RAG knowledge endpoint,
 * backed by an embedded grounded RAG knowledge engine for offline/local simulation fallback.
 * 
 * PROMPT 3 REQUIREMENTS:
 * - Grounded document schema with mandatory provenance (doc, page, section, figure, source, confidence).
 * - 10 explicit evidence categories.
 * - Multi-factor weighted relevance scoring formula:
 *   relevanceScore = semanticScore * 0.30 + keywordScore * 0.20 + parameterSimilarity * 0.25 + riskCategoryMatch * 0.15 + sourceQuality * 0.10
 * - Mandatory disclaimer: "HISTORICAL EVIDENCE — NOT A PREDICTION"
 * - Decoupled from physics engines; strictly reads physics parameters and retrieves grounded evidence.
 */

import { queryBaghewalaKnowledgeBase } from './baghewalaRagEngine';

export type BaghewalaEvidenceCategory =
  | 'HISTORICAL_INCIDENT'
  | 'RESERVOIR_GEOLOGY'
  | 'THERMAL_CSS'
  | 'VISCOSITY_RHEOLOGY'
  | 'ARTIFICIAL_LIFT'
  | 'WELL_INTEGRITY_CASING'
  | 'SEISMIC_GEOMECHANICAL'
  | 'PRODUCTION'
  | 'OPERATIONAL_CONSTRAINT'
  | 'KNOWLEDGE_GAP';

export interface BaghewalaIncidentImage {
  imageUrl?: string;
  imagePath?: string;
  caption?: string;
  source?: string;
  imageAvailable?: boolean;
}

/**
 * Historical Incident/Event Data Contract (for backward compatibility)
 */
export interface BaghewalaHistoricalEvent {
  id: string;
  title: string;
  location?: string;
  date?: string;
  eventType?: string;
  trigger?: string;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  description: string;
  consequence?: string;
  productionLoss?: string | number;
  damage?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  images?: BaghewalaIncidentImage[];
  imageAvailable?: boolean;
  relevance?: number;
  category?: BaghewalaEvidenceCategory;
}

/**
 * Provenance metadata structure for evidence grounding
 */
export interface BaghewalaProvenance {
  document: string;
  page: string | number;
  section?: string;
  figure?: string;
  source: string;
  sourceUrl?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCategory: BaghewalaEvidenceCategory;
}

/**
 * Live vs Historical Parameter Comparison Match
 */
export interface BaghewalaCurrentMatch {
  parameterName: string;
  currentValue: number | string;
  historicalValue: number | string;
  unit?: string;
  delta?: number;
  explanation: string;
}

/**
 * Multi-Factor Scoring Breakdown
 */
export interface BaghewalaScoringBreakdown {
  semanticScore: number;
  keywordScore: number;
  parameterSimilarity: number;
  riskCategoryMatch: number;
  sourceQuality: number;
}

/**
 * Prompt 3 Grounded Evidence Item Structure
 */
export interface BaghewalaGroundedEvidence {
  id: string;
  title: string;
  category: BaghewalaEvidenceCategory;
  relevanceScore: number;
  scoringBreakdown: BaghewalaScoringBreakdown;
  currentMatch: BaghewalaCurrentMatch;
  documentedEvidence: {
    field: string;
    basin: string;
    reservoir: string;
    date?: string;
    location?: string;
    eventType?: string;
    trigger?: string;
    description: string;
    consequence?: string;
    productionLoss?: string;
    damage?: string;
    conditions: Record<string, string | null | undefined>;
  };
  provenance: BaghewalaProvenance;
  images: BaghewalaIncidentImage[];
}

/**
 * Documented Knowledge Gap Structure
 */
export interface BaghewalaKnowledgeGap {
  id: string;
  title: string;
  topic: string;
  documentedGap: string;
  sourceDocument: string;
  sourcePage: string;
  impactOnSimulation: string;
}

/**
 * Context payload sent with RAG query from Simulation state
 */
export interface BaghewalaRagQueryContext {
  reservoirTemp?: number;
  viscosity?: number;
  spm?: number;
  strokeLength?: number;
  steamInjectionRate?: number;
  steamTemp?: number;
  vfdFrequency?: number;
  waterCut?: number;
  reservoirPressure?: number;
  currentProductionBOPD?: number;
  currentRiskLevel?: string;
  riskCategory?: string;
}

/**
 * Multimodal Visual Evidence Item Schema
 */
export interface BaghewalaImageEvidence {
  imageId: string;
  title: string;
  description: string;
  caption: string;
  document: string;
  page: string;
  imageUrl: string;
  relatedIncidentId: string | null;
  relatedTopic: string;
  source: string;
  imageAvailable: boolean;
  extractedOcrText: string;
  visualAnalysisSummary: string;
  visualFeatures: string[];
  domainTags: string[];
  visualRelevanceScore: number;
  provenance: BaghewalaProvenance;
}

/**
 * Standard structured response from Baghewala RAG Query
 */
export interface BaghewalaRagResponse {
  success: boolean;
  events: BaghewalaHistoricalEvent[];
  evidence: BaghewalaGroundedEvidence[];
  imageEvidence?: BaghewalaImageEvidence[];
  currentSimulation?: BaghewalaRagQueryContext;
  knowledgeGaps?: BaghewalaKnowledgeGap[];
  disclaimer: string;
  summary?: string;
  query?: string;
  totalCount?: number;
  error?: string;
}

/**
 * Health Check status response for remote RAG service
 */
export interface BaghewalaRagHealth {
  available: boolean;
  message: string;
  endpoint?: string;
  timestamp?: string;
}

/**
 * Reads the configured RAG URL from Vite environment variables or global process env.
 */
export function getBaghewalaRagUrl(): string {
  let url: string | undefined;
  if (typeof import.meta !== 'undefined' && import.meta?.env) {
    url = import.meta.env.VITE_BAGHEWALA_RAG_URL;
  }
  if (!url && typeof globalThis !== 'undefined') {
    const g = globalThis as Record<string, unknown>;
    const proc = g.process as { env?: Record<string, string> } | undefined;
    if (proc?.env?.VITE_BAGHEWALA_RAG_URL) {
      url = proc.env.VITE_BAGHEWALA_RAG_URL;
    }
  }
  return typeof url === 'string' ? url.trim() : '';
}

/**
 * Validates whether the RAG endpoint is properly configured.
 */
export function isRagConfigured(): boolean {
  const url = getBaghewalaRagUrl();
  return url.length > 0 && (url.startsWith('http://') || url.startsWith('https://') || url === 'local' || url === 'embedded');
}

/**
 * Performs a health check on the configured RAG service endpoint or embedded fallback.
 */
export async function checkBaghewalaRagHealth(timeoutMs: number = 3000): Promise<BaghewalaRagHealth> {
  const url = getBaghewalaRagUrl();

  if (!url || url === 'local' || url === 'embedded') {
    return {
      available: true,
      message: 'Baghewala RAG Embedded Knowledge Engine is online.',
      endpoint: 'EMBEDDED_LOCAL_ENGINE',
      timestamp: new Date().toISOString()
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const healthUrl = url.endsWith('/') ? `${url}health` : (url.includes('/query') ? url.replace('/query', '/health') : `${url}/health`);
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        available: true,
        message: 'Hosted Baghewala RAG service is online and accessible.',
        endpoint: url,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        available: true,
        message: `Remote HTTP returned ${response.status}. Active fallback: Embedded Baghewala Knowledge Base.`,
        endpoint: url,
        timestamp: new Date().toISOString()
      };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errMessage = err instanceof Error ? err.message : 'Connection failed';
    return {
      available: true,
      message: `Remote RAG unreachable (${errMessage}). Active fallback: Embedded Baghewala Knowledge Base.`,
      endpoint: url,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Executes Simulation RAG query against remote HTTP service endpoint with automatic fallback to embedded engine.
 */
export async function queryBaghewalaRag(
  query: string,
  context?: BaghewalaRagQueryContext,
  options: { timeoutMs?: number } = {}
): Promise<BaghewalaRagResponse> {
  const url = getBaghewalaRagUrl();

  // If no URL or local/embedded explicitly selected, use local embedded engine directly
  if (!url || url === 'local' || url === 'embedded') {
    return queryBaghewalaKnowledgeBase(query, context);
  }

  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const queryUrl = url.endsWith('/') ? `${url}query` : (url.includes('/query') ? url : `${url}/query`);
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, context }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object' && Array.isArray(data.events)) {
        return {
          success: true,
          events: data.events || [],
          evidence: data.evidence || [],
          imageEvidence: data.imageEvidence || [],
          currentSimulation: context,
          knowledgeGaps: data.knowledgeGaps || [],
          disclaimer: 'HISTORICAL EVIDENCE — NOT A PREDICTION',
          summary: data.summary || `Retrieved ${data.events.length} historical records via hosted RAG API.`,
          query: data.query || query,
          totalCount: data.totalCount ?? data.events.length
        };
      }
    }

    // Graceful fallback to embedded engine if HTTP API returned non-OK or bad structure
    return queryBaghewalaKnowledgeBase(query, context);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    // Graceful fallback to embedded engine if network timed out or failed
    return queryBaghewalaKnowledgeBase(query, context);
  }
}
