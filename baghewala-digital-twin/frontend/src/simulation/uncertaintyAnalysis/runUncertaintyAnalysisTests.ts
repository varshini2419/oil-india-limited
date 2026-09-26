import {
  runUncertaintyAnalysis,
  createMulberry32,
  sampleParameterValue,
  evaluateSamplePipeline,
  validateUncertaintyConfig,
  validateSampledInputs,
  DEFAULT_UNCERTAINTY_CONFIG,
  DEFAULT_UNCERTAINTY_PARAMETERS,
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
console.log('RUNNING STEP 5.3 — UNCERTAINTY & SENSITIVITY ANALYSIS TESTS');
console.log('===================================================');

// 1. Baseline configuration
assert(
  DEFAULT_UNCERTAINTY_CONFIG.parameters.length >= 12,
  'TEST 1: Baseline configuration loads 12+ parameters',
  `Found ${DEFAULT_UNCERTAINTY_CONFIG.parameters.length} parameters`
);

// 2. Deterministic seed
const res1 = runUncertaintyAnalysis({ sampleCount: 50, seed: 42 });
assert(
  res1.samples.length === 50 && res1.validation.isValid,
  'TEST 2: Monte Carlo sampler generates requested 50 samples'
);

// 3. Same seed -> same samples
const res1Dup = runUncertaintyAnalysis({ sampleCount: 50, seed: 42 });
assert(
  res1.productionStats.p50 === res1Dup.productionStats.p50 &&
    res1.samples[0].productionBopd === res1Dup.samples[0].productionBopd,
  'TEST 3: Identical seed produces identical deterministic sample outputs'
);

// 4. Different seed -> different samples
const res2Diff = runUncertaintyAnalysis({ sampleCount: 50, seed: 99 });
assert(
  res1.samples[0].inputs.reservoirPermeabilityD !== res2Diff.samples[0].inputs.reservoirPermeabilityD,
  'TEST 4: Different seed produces different random sample values'
);

// 5. Sample count validation
const valLow = validateUncertaintyConfig({ ...DEFAULT_UNCERTAINTY_CONFIG, sampleCount: 1 });
const valHigh = validateUncertaintyConfig({ ...DEFAULT_UNCERTAINTY_CONFIG, sampleCount: 20000 });
assert(!valLow.isValid && !valHigh.isValid, 'TEST 5: Out-of-bounds sample count (<2 or >10000) rejected');

// 6. NaN rejection
const invalidInputsNaN = {
  reservoirPermeabilityD: NaN,
  reservoirTemperatureC: 48,
  crudeViscosityInputCp: 15000,
  steamInjectionRateTpd: 80,
  steamInjectionTemperatureC: 300,
  steamEffectivenessFactor: 1,
  thermalGainCoefficient: 0.2,
  effectiveDrawdownBar: 30,
  vfdFrequencyHz: 50,
  spm: 8,
  strokeLengthMeters: 2.5,
  productivityMobilityCoefficient: 250,
};
const valNaN = validateSampledInputs(invalidInputsNaN);
assert(!valNaN.isValid, 'TEST 6: NaN sampled input parameter rejected');

// 7. Infinity rejection
const invalidInputsInf = { ...invalidInputsNaN, reservoirPermeabilityD: Infinity };
const valInf = validateSampledInputs(invalidInputsInf);
assert(!valInf.isValid, 'TEST 7: Infinity sampled input parameter rejected');

// 8. Negative permeability rejection
const invalidInputsPerm = { ...invalidInputsNaN, reservoirPermeabilityD: -2.5 };
const valPerm = validateSampledInputs(invalidInputsPerm);
assert(!valPerm.isValid, 'TEST 8: Negative permeability rejected by validation');

// 9. Invalid temperature rejection
const invalidInputsTemp = { ...invalidInputsNaN, reservoirPermeabilityD: 2.5, reservoirTemperatureC: 400 };
const valTemp = validateSampledInputs(invalidInputsTemp);
assert(!valTemp.isValid, 'TEST 9: Extreme unphysical temperature (>350°C) rejected');

// 10. Invalid steam range rejection
const invalidInputsSteam = { ...invalidInputsNaN, reservoirPermeabilityD: 2.5, steamInjectionRateTpd: -50 };
const valSteam = validateSampledInputs(invalidInputsSteam);
assert(!valSteam.isValid, 'TEST 10: Negative steam injection rate rejected');

// 11. Invalid VFD rejection
const invalidInputsVfd = { ...invalidInputsNaN, reservoirPermeabilityD: 2.5, vfdFrequencyHz: 5 };
const valVfd = validateSampledInputs(invalidInputsVfd);
assert(!valVfd.isValid, 'TEST 11: Out-of-range VFD frequency (<10 Hz) rejected');

// 12. Invalid SPM rejection
const invalidInputsSpm = { ...invalidInputsNaN, reservoirPermeabilityD: 2.5, spm: 25 };
const valSpm = validateSampledInputs(invalidInputsSpm);
assert(!valSpm.isValid, 'TEST 12: Out-of-range SPM (>20) rejected');

// 13. Invalid stroke rejection
const invalidInputsStroke = { ...invalidInputsNaN, reservoirPermeabilityD: 2.5, strokeLengthMeters: 0.2 };
const valStroke = validateSampledInputs(invalidInputsStroke);
assert(!valStroke.isValid, 'TEST 13: Out-of-range stroke length (<0.5m) rejected');

// 14. Production statistics
assert(
  res1.productionStats.p10 > 0 &&
    res1.productionStats.p50 > 0 &&
    res1.productionStats.p90 > 0 &&
    res1.productionStats.probGreaterThanBaseline >= 0,
  'TEST 14: Production P10/P50/P90 statistics and probabilities computed',
  `P10: ${res1.productionStats.p10}, P50: ${res1.productionStats.p50}, P90: ${res1.productionStats.p90}`
);

// 15. Viscosity statistics
assert(
  res1.viscosityStats.mean > 0 && res1.viscosityStats.min > 0,
  'TEST 15: Viscosity statistical distribution computed'
);

// 16. Mobility statistics
assert(
  res1.mobilityStats.mean > 0 && res1.mobilityStats.max > 0,
  'TEST 16: Mobility statistical distribution computed'
);

// 17. Percentile ordering
const stats = res1.productionStats;
assert(
  stats.min <= stats.p10 &&
    stats.p10 <= stats.p25 &&
    stats.p25 <= stats.p50 &&
    stats.p50 <= stats.p75 &&
    stats.p75 <= stats.p90 &&
    stats.p90 <= stats.max,
  'TEST 17: Strict monotonic percentile ordering (Min <= P10 <= P25 <= P50 <= P75 <= P90 <= Max)'
);

// 18. Sensitivity calculation
assert(
  res1.sensitivityResults.length >= 10 && res1.sensitivityResults[0].rank === 1,
  'TEST 18: One-at-a-time sensitivity analysis computes parameter ranks'
);

// 19. Tornado data generation
assert(
  res1.tornadoEntries.length >= 10 && res1.tornadoEntries[0].totalRange >= 0,
  'TEST 19: Tornado chart entries generated with valid total ranges'
);

// 20. Correlation calculation
assert(
  res1.correlations.length >= 5 &&
    Math.abs(res1.correlations[0].correlationCoefficient) <= 1.0,
  'TEST 20: Model-sample correlation analysis computes valid coefficients [-1, 1]'
);

// 21. Full 4.3 -> 4.9 pipeline
const sampleEval = evaluateSamplePipeline({
  reservoirPermeabilityD: 2.5,
  reservoirTemperatureC: 48,
  crudeViscosityInputCp: 15000,
  steamInjectionRateTpd: 80,
  steamInjectionTemperatureC: 300,
  steamEffectivenessFactor: 1.0,
  thermalGainCoefficient: 0.2,
  effectiveDrawdownBar: 30,
  vfdFrequencyHz: 50,
  spm: 8,
  strokeLengthMeters: 2.5,
  productivityMobilityCoefficient: 250,
});
assert(
  sampleEval.temperatureC > 0 &&
    sampleEval.viscosityCp > 0 &&
    sampleEval.mobilityDcP > 0 &&
    sampleEval.productionBopd > 0 &&
    sampleEval.riskScore >= 0,
  'TEST 21: Full Steps 4.3 -> 4.9 physics pipeline executes seamlessly per sample'
);

// 22. Zero/edge-case safety
const prngTest = createMulberry32(12345);
const valSampled = sampleParameterValue(DEFAULT_UNCERTAINTY_PARAMETERS[0], prngTest);
assert(valSampled >= 0.5 && valSampled <= 10.0, 'TEST 22: PRNG parameter sampling strictly respects min/max bounds');

// 23. No mutation of scenario state
const origConfigCopy = JSON.stringify(DEFAULT_UNCERTAINTY_CONFIG);
runUncertaintyAnalysis();
assert(
  JSON.stringify(DEFAULT_UNCERTAINTY_CONFIG) === origConfigCopy,
  'TEST 23: Uncertainty execution preserves original configuration state without mutation'
);

// 24. Provenance propagation
const permParam = DEFAULT_UNCERTAINTY_PARAMETERS.find((p) => p.id === 'PARAM_PERMEABILITY');
assert(
  Boolean(permParam?.provenanceLabel.includes('DOCUMENTED')),
  'TEST 24: Parameter provenance tags preserved and propagated correctly'
);

console.log('===================================================');
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('===================================================');

if (failCount > 0) {
  throw new Error(`${failCount} uncertainty analysis test(s) failed.`);
}
