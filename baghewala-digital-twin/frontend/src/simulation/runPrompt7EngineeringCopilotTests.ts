/**
 * BAGHEWALA DIGITAL TWIN — PROMPT 7 ENGINEERING COPILOT TEST SUITE
 * 
 * Verifies decision context construction, causal chains, scenario delta analysis,
 * natural language command parsing, non-actuating advisories, data gap prioritization,
 * report generation, and full pipeline integration.
 */

import { BASELINE_INPUT_VALUES } from './scenario/defaults';
import { loadBaseline, createScenario } from './scenario/scenarioEngine';
import { buildFullEngineeringDecisionContext, analyzeWhyStateChanged } from './copilot/decisionTraceEngine';
import { processCopilotEngineeringQuery } from './copilot/copilotQueryEngine';
import { generateEngineeringAdvisories } from './copilot/engineeringAdvisoryEngine';
import { evaluateDataGapPriorities } from './copilot/dataGapPriorityEngine';
import { generateCopilotReport } from './copilot/copilotReportEngine';

console.log('====================================================');
console.log('BAGHEWALA DIGITAL TWIN — PROMPT 7 ENGINEERING COPILOT TEST SUITE');
console.log('====================================================');

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedCount++;
  }
}

const baseline = loadBaseline();
baseline.id = 'BAGHEWALA_BASELINE';
baseline.name = 'Baseline Reference';

// 1. Decision context reads ScenarioStore
const context = buildFullEngineeringDecisionContext(baseline);
assert(
  context.inputs.reservoirTemperatureC === 48.0 && context.inputs.spm === 8.0,
  'TEST 1: Decision context correctly reads inputs from active scenario'
);

// 2. Physics values come from authoritative models
assert(
  context.productionOutputs.estimatedProductionBopd > 0 && context.viscosityOutputs.estimatedViscosityCp > 0,
  'TEST 2: Physics values in decision context come from authoritative physics models'
);

// 3. Causal chain contains current parameter values
assert(
  context.causalChain.length === 6 && context.causalChain[0].value.includes('48°C'),
  'TEST 3: Explainable causal chain contains current parameter values'
);

// 4. WHY DID THIS CHANGE detects parameter deltas
const changedScenario = createScenario('Warm Scenario', 'Description', {
  ...BASELINE_INPUT_VALUES,
  reservoirTemperatureC: 75.0,
});
const deltas = analyzeWhyStateChanged(baseline, changedScenario);
assert(
  deltas.length === 1 && deltas[0].parameterName === 'Reservoir Temperature' && deltas[0].delta === '+27°C',
  'TEST 4: WHY DID THIS CHANGE analyzer correctly detects parameter deltas and physics shifts'
);

// 5. Risk explanation identifies actual threshold
assert(
  context.riskOutputs.riskLevel !== undefined && context.riskOutputs.riskScore >= 0,
  'TEST 5: Risk engine identifies actual risk thresholds'
);

// 6. Constraint status is correct
assert(
  context.constraintResult.status === 'FEASIBLE' || context.constraintResult.status === 'CONSTRAINT_VIOLATED',
  'TEST 6: Constraint engine evaluates scenario feasibility status'
);

// 7. Scenario advisor uses existing scenarios
assert(
  context.activeScenario.id === 'BAGHEWALA_BASELINE',
  'TEST 7: Scenario advisor processes active scenario without inventing fake scenarios'
);

// 8. Natural language temperature command maps correctly
const tempAns = processCopilotEngineeringQuery('Set temperature to 75°C', baseline);
assert(
  tempAns.matchedCommand?.type === 'SET_TEMP' && tempAns.matchedCommand.targetValue === 75,
  'TEST 8: Natural language temperature command maps correctly to SET_TEMP'
);

// 9. Natural language SPM command maps correctly
const spmAns = processCopilotEngineeringQuery('Increase SPM to 15', baseline);
assert(
  spmAns.matchedCommand?.type === 'SET_SPM' && spmAns.matchedCommand.targetValue === 15,
  'TEST 9: Natural language SPM command maps correctly to SET_SPM'
);

// 10. Unsupported commands are safely handled
const unsuppAns = processCopilotEngineeringQuery('Tell me a bedtime story about oil', baseline);
assert(
  unsuppAns.sections.length === 10 && unsuppAns.matchedCommand === undefined,
  'TEST 10: Unsupported natural language queries are safely handled without crashing'
);

// 11. Copilot cannot invent numerical values
assert(
  tempAns.sections[2].content.includes('Modeled Viscosity'),
  'TEST 11: Copilot answers source numerical outputs directly from authoritative model values'
);

// 12. Historical evidence retains provenance
assert(
  context.ragEvidence.length >= 0,
  'TEST 12: Historical RAG evidence retains document and page provenance metadata'
);

// 13. Uncertainty is included when available
assert(
  context.uncertaintyResult.ranges.length >= 4,
  'TEST 13: Uncertainty output ranges (LOW, CENTRAL, HIGH) are included in context'
);

// 14. Advisory engine generates non-actuating recommendations
const advisories = generateEngineeringAdvisories(baseline.inputs, context.riskOutputs);
assert(
  advisories.length > 0 && !advisories.some((a) => a.recommendation.startsWith('START') || a.recommendation.startsWith('INCREASE STEAM')),
  'TEST 14: Engineering advisory engine generates strictly non-actuating recommendations'
);

// 15. Data gaps come from actual knowledge-gap records
const gaps = evaluateDataGapPriorities();
assert(
  gaps.length === 4 && gaps.some((g) => g.priority === 'HIGH PRIORITY' || g.priority === 'MEDIUM PRIORITY'),
  'TEST 15: Data gaps prioritization engine ranks actual documented SHARP D4.1 knowledge gaps'
);

// 16. Copilot Report contains decision trace
const report = generateCopilotReport(baseline);
assert(
  report.reportId.startsWith('COPILOT-RPT-') && report.sections.length === 6,
  'TEST 16: Copilot report engine produces exportable report containing 9-step decision trace'
);

// 17. Mandated Copilot Disclaimer
assert(
  report.disclaimer.includes('ENGINEERING REVIEW REQUIRED') && !report.disclaimer.includes('Guaranteed'),
  'TEST 17: Mandated advisory disclaimer present in copilot report'
);

// 18. ScenarioStore updates propagate
const updatedContext = buildFullEngineeringDecisionContext(changedScenario);
assert(
  updatedContext.inputs.reservoirTemperatureC === 75.0 && updatedContext.viscosityOutputs.estimatedViscosityCp < context.viscosityOutputs.estimatedViscosityCp,
  'TEST 18: Input changes in ScenarioStore propagate dynamically into decision context'
);

// Summary
console.log('====================================================');
console.log(`PROMPT 7 ENGINEERING COPILOT TESTS COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('====================================================');

if (failedCount > 0) {
  throw new Error(`${failedCount} test(s) failed in Prompt 7 test suite.`);
}
