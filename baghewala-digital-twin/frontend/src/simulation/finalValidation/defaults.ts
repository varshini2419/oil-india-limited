export const MANDATORY_FINAL_VALIDATION_DISCLAIMER =
  'Decision support only — no automatic field actuation. Software verification confirms execution path integrity, NOT physical field certification or autonomous equipment control capability.';

export const TOTAL_VERIFIED_SIMULATION_TESTS_FINAL_VALIDATION = 424;

export const DEFAULT_VERIFIED_SUITES = [
  { suiteId: 'SUITE-403', stepReference: 'Step 4.3', moduleName: 'Thermal Model', testCount: 8, passed: 8, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['1D radial conduction'] },
  { suiteId: 'SUITE-404', stepReference: 'Step 4.4', moduleName: 'Viscosity Model', testCount: 7, passed: 7, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Log-linear slope <= 180°C'] },
  { suiteId: 'SUITE-405', stepReference: 'Step 4.5', moduleName: 'Mobility Model', testCount: 12, passed: 12, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Constant relative perm'] },
  { suiteId: 'SUITE-406', stepReference: 'Step 4.6', moduleName: 'Production Model', testCount: 14, passed: 14, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Quasi-steady IPR'] },
  { suiteId: 'SUITE-407', stepReference: 'Step 4.7', moduleName: 'SRP Optimization', testCount: 15, passed: 15, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Grid search discrete candidates'] },
  { suiteId: 'SUITE-408', stepReference: 'Step 4.8', moduleName: 'CSS Optimization', testCount: 22, passed: 22, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Single cycle thermal decay'] },
  { suiteId: 'SUITE-409', stepReference: 'Step 4.9', moduleName: 'AI Risk Advisory', testCount: 10, passed: 10, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Rule matrix advisory-only'] },
  { suiteId: 'SUITE-501', stepReference: 'Step 5.1', moduleName: 'Historical Validation', testCount: 14, passed: 14, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['4 appraisal well cases'] },
  { suiteId: 'SUITE-502', stepReference: 'Step 5.2', moduleName: 'Historical Calibration', testCount: 16, passed: 16, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Viscosity pre-exponential multiplier'] },
  { suiteId: 'SUITE-503', stepReference: 'Step 5.3', moduleName: 'Uncertainty Analysis', testCount: 22, passed: 22, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['50 Latin Hypercube samples'] },
  { suiteId: 'SUITE-504', stepReference: 'Step 5.4', moduleName: 'Scenario Optimization', testCount: 20, passed: 20, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Pareto non-dominated trade-offs'] },
  { suiteId: 'SUITE-505', stepReference: 'Step 5.5', moduleName: 'Real-Time Monitoring', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Simulated telemetry replay'] },
  { suiteId: 'SUITE-506', stepReference: 'Step 5.6', moduleName: 'Field Data Integration', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Unit normalization & schema validation'] },
  { suiteId: 'SUITE-507', stepReference: 'Step 5.7', moduleName: 'Integrated Validation', testCount: 22, passed: 22, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['12-stage decision trace'] },
  { suiteId: 'SUITE-508', stepReference: 'Step 5.8', moduleName: 'Operational Readiness', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Demo mode readiness'] },
  { suiteId: 'SUITE-509', stepReference: 'Step 5.9', moduleName: 'Command Center', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['Executive dashboard aggregation'] },
  { suiteId: 'SUITE-510', stepReference: 'Step 5.10', moduleName: 'Deployment Readiness', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['15 readiness gates'] },
  { suiteId: 'SUITE-511', stepReference: 'Step 5.11', moduleName: 'Production Pilot', testCount: 32, passed: 32, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['8 pilot scenarios'] },
  { suiteId: 'SUITE-512', stepReference: 'Step 5.12', moduleName: 'Final Engineering Assessment', testCount: 30, passed: 30, failed: 0, status: 'PASS' as const, buildStatus: 'PASS' as const, limitations: ['15 traceable findings'] },
];
