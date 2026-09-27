import {
  getBaghewalaRagUrl,
  isRagConfigured,
  checkBaghewalaRagHealth,
  queryBaghewalaRag
} from '../services/baghewalaRagService';

async function runRagFoundationTests() {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — RAG SERVICE FOUNDATION TEST SUITE');
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

  // Test 1: Function exports
  assert(typeof getBaghewalaRagUrl === 'function', 'getBaghewalaRagUrl is exported and callable');
  assert(typeof isRagConfigured === 'function', 'isRagConfigured is exported and callable');
  assert(typeof checkBaghewalaRagHealth === 'function', 'checkBaghewalaRagHealth is exported and callable');
  assert(typeof queryBaghewalaRag === 'function', 'queryBaghewalaRag is exported and callable');

  // Test 2: Behavior when unconfigured (empty URL)
  delete env.VITE_BAGHEWALA_RAG_URL;
  const unconfiguredHealth = await checkBaghewalaRagHealth(500);
  assert(unconfiguredHealth.available === true, 'checkBaghewalaRagHealth returns available=true via embedded engine');
  assert(unconfiguredHealth.message.includes('Embedded'), 'Health message indicates embedded engine active');

  const unconfiguredQuery = await queryBaghewalaRag('viscosity lock', { viscosity: 5014 }, { timeoutMs: 500 });
  assert(unconfiguredQuery.success === true, 'queryBaghewalaRag returns success=true via embedded engine');
  assert(unconfiguredQuery.events.length > 0, 'queryBaghewalaRag returns grounded events array via embedded engine');

  // Test 3: Behavior when configured with an unreachable endpoint
  env.VITE_BAGHEWALA_RAG_URL = 'http://localhost:9999/rag/query';
  assert(isRagConfigured() === true, 'isRagConfigured() returns true when URL is configured');
  assert(getBaghewalaRagUrl() === 'http://localhost:9999/rag/query', 'getBaghewalaRagUrl returns configured URL');

  const unreachableHealth = await checkBaghewalaRagHealth(500);
  assert(unreachableHealth.available === true, 'checkBaghewalaRagHealth returns available=true via fallback engine');

  const unreachableQuery = await queryBaghewalaRag('steam channeling', { steamTemp: 280 }, { timeoutMs: 500 });
  assert(unreachableQuery.success === true, 'queryBaghewalaRag returns success=true via fallback engine');
  assert(unreachableQuery.events.length > 0, 'queryBaghewalaRag returns grounded events array via fallback engine');

  // Cleanup env
  delete env.VITE_BAGHEWALA_RAG_URL;

  console.log('====================================================');
  console.log(`RAG FOUNDATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    if (g.process) g.process.exit(1);
  }
}

runRagFoundationTests().catch(err => {
  console.error('Fatal error running RAG foundation tests:', err);
  const g = globalThis as Record<string, any>;
  if (g.process) g.process.exit(1);
});
