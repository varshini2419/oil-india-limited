export const HISTORICAL_VALIDATION_DISCLAIMERS = [
  'HISTORICAL DATA VALIDATION & BACKTESTING: Evaluates existing simulation pipeline outputs (Steps 4.3–4.9) against documented Baghewala reference data.',
  'NO AUTOMATIC COEFFICIENT RETUNING: Model calibration parameters are preserved as established in Steps 4.1–4.8. Discrepancies reflect screening model assumptions and are reported transparently without artificial curve fitting.',
  'PROVENANCE NOTICE: Every value is explicitly tagged as DOCUMENTED, DERIVED, ASSUMED, SCENARIO, MODELED, or INSUFFICIENT DATA.',
] as const;

export const VALIDATION_LIMITS = {
  maxValidatedPercentError: 15.0,
  maxPartiallyValidatedPercentError: 50.0,
  minObservationsForMetrics: 2,
} as const;
