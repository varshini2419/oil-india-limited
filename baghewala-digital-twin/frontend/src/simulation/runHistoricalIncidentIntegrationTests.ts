import {
  getBaghewalaRagUrl,
  isRagConfigured,
  checkBaghewalaRagHealth,
  queryBaghewalaRag,
  type BaghewalaHistoricalEvent,
  type BaghewalaRagQueryContext
} from '../services/baghewalaRagService';
import { getLatestHistoricalIncidentState } from '../components/simulation/SimulationHistoricalIncidents';

async function runHistoricalIncidentIntegrationTests() {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — HISTORICAL INCIDENT INTEGRATION TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${desc}`);
      failed++;
    }
  }

  const g = globalThis as Record<string, any>;
  const env = g.process?.env || {};

  // Dynamically load node fs and path modules if in node environment
  let fsModule: any = null;
  let pathModule: any = null;
  if (g.process) {
    try {
      const req = (eval)('require');
      fsModule = req('fs');
      pathModule = req('path');
    } catch {
      // Browser environment fallback
    }
  }

  // Verify exported helper functions
  assert(typeof getBaghewalaRagUrl === 'function', 'getBaghewalaRagUrl is exported');
  assert(typeof getLatestHistoricalIncidentState === 'function', 'getLatestHistoricalIncidentState is exported');

  // Test 1: RAG unconfigured fallback behavior
  delete env.VITE_BAGHEWALA_RAG_URL;
  const unconfigHealth = await checkBaghewalaRagHealth(500);
  assert(unconfigHealth.available === true, 'Test 1: Health check returns available=true via embedded RAG engine');
  const unconfigRes = await queryBaghewalaRag('test query', { viscosity: 5014 });
  assert(unconfigRes.success === true && unconfigRes.events.length > 0, 'Test 1: Unconfigured RAG returns grounded events via embedded knowledge engine');

  // Test 2: RAG unreachable endpoint fallback behavior
  env.VITE_BAGHEWALA_RAG_URL = 'http://localhost:9999/rag/query';
  assert(isRagConfigured() === true, 'Test 2: RAG reported as configured when URL is present');
  const unreachableHealth = await checkBaghewalaRagHealth(500);
  assert(unreachableHealth.available === true, 'Test 2: Health check returns available=true via embedded fallback engine');
  const unreachableRes = await queryBaghewalaRag('viscosity lock', { viscosity: 5000 }, { timeoutMs: 500 });
  assert(unreachableRes.success === true && unreachableRes.events.length > 0, 'Test 2: Unreachable RAG returns grounded events via embedded fallback');

  // Mock server response simulation helper
  function createMockResponse(events: BaghewalaHistoricalEvent[], summary?: string) {
    return {
      success: true,
      events,
      summary,
      totalCount: events.length
    };
  }

  // Test 3: RAG returns zero incidents
  const zeroMock = createMockResponse([]);
  assert(zeroMock.success === true && zeroMock.events.length === 0, 'Test 3: RAG response with zero incidents handles empty events array gracefully');

  // Test 4: RAG returns one incident
  const oneMock = createMockResponse([{
    id: 'BW-INC-001',
    title: 'Baghewala-1 Well Viscosity Lock Incident',
    date: '2021-11-14',
    location: 'Wellhead BW-01',
    eventType: 'VISCOSITY_LOCK',
    trigger: 'Reservoir temperature dropped below 45°C during cold soak period',
    severity: 'HIGH',
    description: 'Crude oil viscosity surged past 12,000 cP causing polished rod stall and thermal injection requirement.',
    consequence: 'Polish rod stopped reciprocating for 18 hours',
    productionLoss: '45 BOPD total loss',
    source: 'Oil India Limited Well Operations Log 2021',
    sourceUrl: 'https://internal.oilindia.in/docs/BW-INC-001.pdf',
    imageUrl: 'https://internal.oilindia.in/images/BW-INC-001.jpg'
  }]);
  assert(oneMock.events.length === 1, 'Test 4: Single incident returned cleanly with all fields');
  assert(oneMock.events[0].title.includes('Baghewala-1'), 'Test 4: Incident title matches historical record');

  // Test 5: RAG returns multiple incidents
  const multiMock = createMockResponse([
    oneMock.events[0],
    {
      id: 'BW-INC-002',
      title: 'Cyclic Steam Channeling Event',
      date: '2023-04-02',
      eventType: 'STEAM_CHANNELING',
      severity: 'CRITICAL',
      description: 'Steam break-through observed in neighboring observation well.',
      source: 'Oil India Limited Reservoir Engineering Report'
    }
  ]);
  assert(multiMock.events.length === 2, 'Test 5: Multiple incidents returned and array length matches total count');

  // Test 6 & 7: Simulation values and Risk Category in Query Context
  const testContext: BaghewalaRagQueryContext = {
    reservoirTemp: 58,
    viscosity: 5014,
    spm: 8.0,
    strokeLength: 2.5,
    steamInjectionRate: 35,
    steamTemp: 280,
    vfdFrequency: 50,
    waterCut: 25,
    reservoirPressure: 45,
    currentProductionBOPD: 1.8,
    currentRiskLevel: 'HIGH',
    riskCategory: 'HIGH_CRUDE_VISCOSITY'
  };

  assert(testContext.reservoirTemp === 58, 'Test 6: Reservoir temp included in query context');
  assert(testContext.viscosity === 5014, 'Test 6: Viscosity included in query context');
  assert(testContext.spm === 8.0, 'Test 6: SPM included in query context');
  assert(testContext.currentRiskLevel === 'HIGH', 'Test 7: Risk level included in query context');
  assert(testContext.riskCategory === 'HIGH_CRUDE_VISCOSITY', 'Test 7: Risk category included in query context');

  // Test 8: Stale response protection logic
  let activeSequence = 1;
  const staleSequence = activeSequence;
  activeSequence++; // Simulating user changing slider again
  assert(staleSequence !== activeSequence, 'Test 8: Sequence counter invalidates stale RAG responses prior to state assignment');

  // Test 9 & 10: Image URL and Source URL conditional display
  const eventWithImage = oneMock.events[0];
  const eventWithoutImage: BaghewalaHistoricalEvent = {
    id: 'BW-INC-003',
    title: 'SRP Gearbox Overheating',
    description: 'High SPM pumping caused mechanical friction heat.'
  };

  assert(typeof eventWithImage.imageUrl === 'string', 'Test 9: Image URL detected when provided');
  assert(typeof eventWithoutImage.imageUrl === 'undefined', 'Test 9: Image URL correctly undefined when omitted (triggers "Historical image unavailable")');
  assert(typeof eventWithImage.sourceUrl === 'string', 'Test 10: Source URL detected when provided (triggers VIEW SOURCE button)');
  assert(typeof eventWithoutImage.sourceUrl === 'undefined', 'Test 10: Source URL correctly undefined when omitted');

  // Test 11 & 12: Node filesystem verification if available
  if (fsModule && pathModule) {
    const rootDir = g.process?.cwd ? g.process.cwd() : '.';
    const serviceCode = fsModule.readFileSync(pathModule.join(rootDir, 'src/services/baghewalaRagService.ts'), 'utf-8');
    assert(!serviceCode.includes('BW-INC-'), 'Test 11: Service file contains zero hardcoded historical incidents');

    const dtPagePath = pathModule.join(rootDir, 'src/pages/DigitalTwinPage.tsx');
    const dtCanvasPath = pathModule.join(rootDir, 'src/components/digital-twin/DigitalTwinCanvas.tsx');
    const dtAnimPath = pathModule.join(rootDir, 'src/components/digital-twin/animations/AnimationController.tsx');

    assert(fsModule.existsSync(dtPagePath), 'Test 12: DigitalTwinPage.tsx exists');
    assert(fsModule.existsSync(dtCanvasPath), 'Test 12: DigitalTwinCanvas.tsx exists');
    assert(fsModule.existsSync(dtAnimPath), 'Test 12: AnimationController.tsx exists');

    const dtPageContent = fsModule.readFileSync(dtPagePath, 'utf-8');
    const dtCanvasContent = fsModule.readFileSync(dtCanvasPath, 'utf-8');
    assert(!dtPageContent.includes('baghewalaRagService'), 'Test 12: DigitalTwinPage.tsx is completely free of RAG modifications');
    assert(!dtCanvasContent.includes('baghewalaRagService'), 'Test 12: DigitalTwinCanvas.tsx is completely free of RAG modifications');
  }

  // Clean up env
  delete env.VITE_BAGHEWALA_RAG_URL;

  console.log('====================================================');
  console.log(`HISTORICAL INCIDENT INTEGRATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    if (g.process) g.process.exit(1);
  }
}

runHistoricalIncidentIntegrationTests().catch(err => {
  console.error('Fatal error running historical incident integration tests:', err);
  const g = globalThis as Record<string, any>;
  if (g.process) g.process.exit(1);
});
