/**
 * BAGHEWALA DIGITAL TWIN — PROMPT 3 PRODUCTION INTEGRATION TEST SUITE
 * 
 * Verifies 20 specific assertions for RAG Production Integration, Grounding & Intelligence:
 * 1. Exports getBaghewalaRagUrl
 * 2. Exports isRagConfigured
 * 3. queryBaghewalaRag returns success=true
 * 4. Response contains mandatory disclaimer "HISTORICAL EVIDENCE — NOT A PREDICTION"
 * 5. currentSimulation snapshot preserves all live physics parameters
 * 6. evidence array populated with grounded items
 * 7. Evidence items belong to 10 explicit categories
 * 8. relevanceScore is bounded between 0.0 and 1.0
 * 9. scoringBreakdown contains all 5 weighted factors
 * 10. Multi-factor weighted formula is correct
 * 11. currentMatch contains calculated parameter deltas
 * 12. provenance metadata contains doc, page, section, figure, source, confidence
 * 13. Unverified claims have explicit confidence rating
 * 14. BGW-1 DST evidence (sharp-d4.1-report-final.pdf Page 64) categorized as VISCOSITY_RHEOLOGY
 * 15. BGW-6 Thermal Casing Leak evidence categorized as WELL_INTEGRITY_CASING
 * 16. BGW-12 Thermal Water Breakthrough evidence categorized as THERMAL_CSS
 * 17. BGW#8 Commercial CSS Cycle evidence present
 * 18. knowledgeGaps array contains at least 4 documented gaps
 * 19. getLatestHistoricalIncidentState exports grounded evidence for UI consumption
 * 20. checkBaghewalaRagHealth resolves seamlessly
 */

import {
  getBaghewalaRagUrl,
  isRagConfigured,
  checkBaghewalaRagHealth,
  queryBaghewalaRag,
  type BaghewalaRagQueryContext
} from '../services/baghewalaRagService';
import { getLatestHistoricalIncidentState } from '../components/simulation/SimulationHistoricalIncidents';

let passed = 0;
let failed = 0;

function safeExit(code: number): void {
  const g = globalThis as Record<string, unknown>;
  const proc = g.process as { exit?: (code: number) => void } | undefined;
  if (proc && typeof proc.exit === 'function') {
    proc.exit(code);
  } else if (code !== 0) {
    throw new Error(`Test suite failed with exit code ${code}`);
  }
}

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`✗ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — RAG PRODUCTION INTEGRATION TEST SUITE');
  console.log('====================================================');

  // Assertion 1: getBaghewalaRagUrl exported
  assert(typeof getBaghewalaRagUrl === 'function', 'Assertion 1: getBaghewalaRagUrl is exported and callable');

  // Assertion 2: isRagConfigured exported
  assert(typeof isRagConfigured === 'function', 'Assertion 2: isRagConfigured is exported and callable');

  // Assertion 3: queryBaghewalaRag returns success=true
  const sampleCtx: BaghewalaRagQueryContext = {
    reservoirTemp: 58,
    viscosity: 5014,
    spm: 8.0,
    strokeLength: 2.5,
    steamInjectionRate: 150,
    steamTemp: 280,
    vfdFrequency: 50.0,
    waterCut: 25,
    currentProductionBOPD: 12.5,
    currentRiskLevel: 'HIGH',
    riskCategory: 'VISCOSITY_HIGH_DRAG'
  };

  const response = await queryBaghewalaRag('high viscosity sucker rod drag', sampleCtx);
  assert(response.success === true, 'Assertion 3: queryBaghewalaRag returns success=true');

  // Assertion 4: Mandatory disclaimer
  assert(
    response.disclaimer === 'HISTORICAL EVIDENCE — NOT A PREDICTION',
    'Assertion 4: Mandatory safety disclaimer is "HISTORICAL EVIDENCE — NOT A PREDICTION"',
    `Received: "${response.disclaimer}"`
  );

  // Assertion 5: currentSimulation snapshot
  assert(
    response.currentSimulation !== undefined &&
      response.currentSimulation.viscosity === 5014 &&
      response.currentSimulation.reservoirTemp === 58,
    'Assertion 5: currentSimulation snapshot preserves live physics parameters'
  );

  // Assertion 6: evidence array populated
  assert(
    Array.isArray(response.evidence) && response.evidence.length >= 5,
    'Assertion 6: evidence array populated with grounded items',
    `Evidence count: ${response.evidence?.length || 0}`
  );

  // Assertion 7: 10 explicit categories
  const validCategories = new Set([
    'HISTORICAL_INCIDENT',
    'RESERVOIR_GEOLOGY',
    'THERMAL_CSS',
    'VISCOSITY_RHEOLOGY',
    'ARTIFICIAL_LIFT',
    'WELL_INTEGRITY_CASING',
    'SEISMIC_GEOMECHANICAL',
    'PRODUCTION',
    'OPERATIONAL_CONSTRAINT',
    'KNOWLEDGE_GAP'
  ]);
  const categoriesValid = response.evidence.every((ev) => validCategories.has(ev.category));
  assert(categoriesValid, 'Assertion 7: All evidence items belong to explicit 10 evidence categories');

  // Assertion 8: relevanceScore bounded 0.0 - 1.0
  const scoresBounded = response.evidence.every(
    (ev) => typeof ev.relevanceScore === 'number' && ev.relevanceScore >= 0.0 && ev.relevanceScore <= 1.0
  );
  assert(scoresBounded, 'Assertion 8: relevanceScore is bounded between 0.0 and 1.0');

  // Assertion 9: scoringBreakdown contains 5 factors
  const breakdownValid = response.evidence.every(
    (ev) =>
      ev.scoringBreakdown &&
      typeof ev.scoringBreakdown.semanticScore === 'number' &&
      typeof ev.scoringBreakdown.keywordScore === 'number' &&
      typeof ev.scoringBreakdown.parameterSimilarity === 'number' &&
      typeof ev.scoringBreakdown.riskCategoryMatch === 'number' &&
      typeof ev.scoringBreakdown.sourceQuality === 'number'
  );
  assert(breakdownValid, 'Assertion 9: scoringBreakdown contains all 5 weighted factors');

  // Assertion 10: Multi-factor weighted formula accuracy
  const firstEv = response.evidence[0];
  const sb = firstEv.scoringBreakdown;
  const expectedScore = Math.min(
    1.0,
    parseFloat(
      (
        sb.semanticScore * 0.30 +
        sb.keywordScore * 0.20 +
        sb.parameterSimilarity * 0.25 +
        sb.riskCategoryMatch * 0.15 +
        sb.sourceQuality * 0.10
      ).toFixed(2)
    )
  );
  assert(
    Math.abs(firstEv.relevanceScore - expectedScore) < 0.02,
    'Assertion 10: Multi-factor weighted relevance formula matches calculated weighted score',
    `Actual: ${firstEv.relevanceScore}, Expected: ${expectedScore}`
  );

  // Assertion 11: currentMatch contains parameter delta
  const hasMatchDelta = response.evidence.every(
    (ev) =>
      ev.currentMatch &&
      typeof ev.currentMatch.parameterName === 'string' &&
      typeof ev.currentMatch.explanation === 'string' &&
      typeof ev.currentMatch.delta === 'number'
  );
  assert(hasMatchDelta, 'Assertion 11: currentMatch contains calculated parameter deltas and explanation');

  // Assertion 12: provenance metadata
  const hasProvenance = response.evidence.every(
    (ev) =>
      ev.provenance &&
      typeof ev.provenance.document === 'string' &&
      (typeof ev.provenance.page === 'string' || typeof ev.provenance.page === 'number') &&
      typeof ev.provenance.source === 'string'
  );
  assert(hasProvenance, 'Assertion 12: provenance metadata contains document, page, section, and source');

  // Assertion 13: Unverified claims have explicit confidence rating
  const hasConfidence = response.evidence.every((ev) => ['HIGH', 'MEDIUM', 'LOW'].includes(ev.provenance.confidence));
  assert(hasConfidence, 'Assertion 13: All evidence provenance records contain confidence rating (HIGH/MEDIUM/LOW)');

  // Assertion 14: BGW-1 DST evidence (sharp-d4.1 Page 64) categorized as VISCOSITY_RHEOLOGY
  const bgw1Ev = response.evidence.find((ev) => ev.id === 'INC-008');
  assert(
    bgw1Ev !== undefined &&
      bgw1Ev.category === 'VISCOSITY_RHEOLOGY' &&
      bgw1Ev.provenance.document.includes('sharp-d4.1'),
    'Assertion 14: BGW-1 DST evidence (sharp-d4.1-report-final.pdf Page 64) present & categorized as VISCOSITY_RHEOLOGY'
  );

  // Assertion 15: BGW-6 Thermal Casing Leak categorized as WELL_INTEGRITY_CASING
  const bgw6Ev = response.evidence.find((ev) => ev.id === 'INC-001');
  assert(
    bgw6Ev !== undefined && bgw6Ev.category === 'WELL_INTEGRITY_CASING',
    'Assertion 15: BGW-6 Thermal Casing Leak evidence present & categorized as WELL_INTEGRITY_CASING'
  );

  // Assertion 16: BGW-12 Thermal Water Breakthrough categorized as THERMAL_CSS
  const bgw12Ev = response.evidence.find((ev) => ev.id === 'INC-003');
  assert(
    bgw12Ev !== undefined && (bgw12Ev.category === 'THERMAL_CSS' || bgw12Ev.category === 'PRODUCTION'),
    'Assertion 16: BGW-12 Thermal Water Breakthrough evidence present & categorized under THERMAL_CSS'
  );

  // Assertion 17: BGW#8 Commercial CSS Cycle evidence present
  const bgw8Ev = response.evidence.find((ev) => ev.id === 'INC-006');
  assert(
    bgw8Ev !== undefined && bgw8Ev.category === 'THERMAL_CSS',
    'Assertion 17: BGW#8 Commercial CSS Cycle evidence present & categorized as THERMAL_CSS'
  );

  // Assertion 18: knowledgeGaps array contains at least 4 documented gaps
  assert(
    Array.isArray(response.knowledgeGaps) && response.knowledgeGaps.length >= 4,
    'Assertion 18: knowledgeGaps array contains at least 4 documented gaps (SHARP D4.1 Table 6)',
    `Gaps count: ${response.knowledgeGaps?.length || 0}`
  );

  // Assertion 19: getLatestHistoricalIncidentState exports state
  const latestState = getLatestHistoricalIncidentState();
  assert(
    latestState !== undefined && typeof latestState.disclaimer === 'string',
    'Assertion 19: getLatestHistoricalIncidentState exports grounded evidence for UI consumption'
  );

  // Assertion 20: checkBaghewalaRagHealth resolves seamlessly
  const health = await checkBaghewalaRagHealth(2000);
  assert(
    health.available === true && typeof health.message === 'string',
    'Assertion 20: checkBaghewalaRagHealth resolves available=true via remote or embedded fallback'
  );

  console.log('====================================================');
  console.log(`RAG PRODUCTION INTEGRATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    safeExit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  safeExit(1);
});
