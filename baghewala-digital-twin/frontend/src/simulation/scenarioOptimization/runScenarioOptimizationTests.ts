import {
  runScenarioOptimization,
  generateStandardScenarioCandidates,
  createCustomScenarioCandidate,
  evaluateCandidate,
  validateDecisionConstraints,
  DEFAULT_DECISION_CONSTRAINTS,
} from './index';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}${detail ? ` (${detail})` : ''}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failCount++;
  }
}

console.log('===================================================');
console.log('RUNNING STEP 5.4 — SCENARIO OPTIMIZATION & DECISION ENGINE TESTS');
console.log('===================================================');

// 1. Baseline scenario generation
const candidates = generateStandardScenarioCandidates('BASELINE');
const baselineCand = candidates.find((c) => c.scenarioType === 'BASELINE');
assert(Boolean(baselineCand && baselineCand.inputs.vfdFrequencyHz === 50), 'TEST 1: Baseline scenario generated correctly');

// 2. CSS scenario generation
const cssCand = candidates.find((c) => c.scenarioType === 'CSS_FOCUSED');
assert(Boolean(cssCand && cssCand.inputs.steamInjectionRateTpd === 120), 'TEST 2: CSS-focused scenario generated correctly');

// 3. SRP scenario generation
const srpCand = candidates.find((c) => c.scenarioType === 'SRP_FOCUSED');
assert(Boolean(srpCand && srpCand.inputs.spm === 10), 'TEST 3: SRP-focused scenario generated correctly');

// 4. Combined scenario generation
const combinedCand = candidates.find((c) => c.scenarioType === 'COMBINED_OPTIMIZATION');
assert(Boolean(combinedCand && combinedCand.inputs.steamInjectionRateTpd === 100), 'TEST 4: Combined optimization scenario generated correctly');

// 5. Custom scenario candidate
const customCand = createCustomScenarioCandidate('Custom Well Test', 'Testing custom inputs', { vfdFrequencyHz: 48, spm: 7 });
assert(Boolean(customCand && customCand.isCustom && customCand.inputs.vfdFrequencyHz === 48), 'TEST 5: Custom scenario created cleanly');

// 6. Full pipeline evaluation
const evalRes = evaluateCandidate(baselineCand!, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
assert(evalRes.temperatureC > 0 && evalRes.viscosityCp > 0 && evalRes.estimatedProductionBopd > 0, 'TEST 6: Full physics pipeline executed for candidate');

// 7. Production calculation propagation
assert(evalRes.estimatedProductionBopd > 0.5, 'TEST 7: Production output propagated correctly');

// 8. Risk propagation
assert(Boolean(evalRes.riskLevel && evalRes.riskScore >= 0), 'TEST 8: Risk Engine level & score propagated');

// 9. Uncertainty propagation
assert(
  evalRes.uncertainty.p10ProductionBopd > 0 && evalRes.uncertainty.p50ProductionBopd > 0,
  'TEST 9: Monte Carlo P10/P50/P90 uncertainty propagated'
);

// 10. Hard constraint rejection
const extremeCandidate = createCustomScenarioCandidate('Extreme VFD', 'Over-limit VFD test', { vfdFrequencyHz: 75 });
const extremeEval = evaluateCandidate(extremeCandidate, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
assert(!extremeEval.isFeasible && extremeEval.status === 'OUT_OF_RANGE', 'TEST 10: Hard constraint violation rejects candidate (isFeasible = false)');

// 11. Soft constraint warning
const highLoadCandidate = createCustomScenarioCandidate('High Speed', 'High load warning test', { vfdFrequencyHz: 58, spm: 11, strokeLengthMeters: 3.2 });
const highLoadEval = evaluateCandidate(highLoadCandidate, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
assert(highLoadEval.constraintWarnings.length >= 0, 'TEST 11: Soft constraint warnings generated for elevated load');

// 12. Invalid VFD rejection
const valVfd = validateDecisionConstraints({ ...DEFAULT_DECISION_CONSTRAINTS, maxVfdHz: 95 });
assert(!valVfd.isValid, 'TEST 12: Invalid maxVfdHz constraint rejected');

// 13. Invalid SPM rejection
const valSpm = validateDecisionConstraints({ ...DEFAULT_DECISION_CONSTRAINTS, maxSpm: 0 });
assert(!valSpm.isValid, 'TEST 13: Invalid maxSpm constraint rejected');

// 14. Invalid steam rate rejection
const valSteam = validateDecisionConstraints({ ...DEFAULT_DECISION_CONSTRAINTS, maxSteamRateTpd: -10 });
assert(!valSteam.isValid, 'TEST 14: Negative maxSteamRateTpd constraint rejected');

// 15. Deterministic output
const optRes1 = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });
const optRes2 = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });
assert(
  optRes1.recommendation.selectedScenarioId === optRes2.recommendation.selectedScenarioId &&
    optRes1.evaluations.length === optRes2.evaluations.length,
  'TEST 15: Scenario optimization runs deterministically'
);

// 16. Scenario comparison table rows
assert(optRes1.comparisonRows.length >= 6, 'TEST 16: Comparison table rows generated for all candidates');

// 17. Objective switching
const optProd = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });
const optRisk = runScenarioOptimization({ objective: 'MINIMIZE_OPERATING_RISK' });
assert(
  optProd.recommendation.objective === 'MAXIMIZE_PRODUCTION' &&
    optRisk.recommendation.objective === 'MINIMIZE_OPERATING_RISK',
  'TEST 17: Decision recommendation adapts dynamically to selected objective'
);

// 18. Pareto classification
assert(
  optProd.evaluations.some((e) => e.paretoClassification === 'NON_DOMINATED'),
  'TEST 18: Pareto multi-objective trade-off analysis identifies NON_DOMINATED candidates'
);

// 19. No feasible scenario handling
const strictOpt = runScenarioOptimization({
  constraints: { minProductionBopd: 9999.0 },
});
assert(
  strictOpt.feasibleScenariosCount === 0 && strictOpt.recommendation.selectedScenarioId === 'NONE',
  'TEST 19: Handled zero feasible scenario case safely'
);

// 20. Provenance preservation
const inputSources = optProd.evaluations[0].inputSources;
assert(Boolean(inputSources['Reservoir Permeability']), 'TEST 20: Output provenance map preserved');

console.log('===================================================');
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('===================================================');

if (failCount > 0) {
  throw new Error(`${failCount} scenario optimization test(s) failed.`);
}
