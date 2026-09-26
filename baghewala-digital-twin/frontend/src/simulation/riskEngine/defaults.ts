export const RISK_THRESHOLDS = {
  viscosity: {
    moderateCp: 10000.0,
    highCp: 25000.0,
    criticalCp: 50000.0,
  },
  srpLoad: {
    moderateIndex: 65.0,
    highIndex: 85.0,
    criticalIndex: 95.0,
  },
  thermal: {
    minSufficientGainC: 15.0,
    lowReservoirTempC: 55.0,
    highThermalTempC: 150.0,
  },
  production: {
    lowProductionBopd: 1.0,
    veryLowProductionBopd: 0.5,
  },
} as const;

export const AI_RISK_DISCLAIMERS = [
  'RULE-BASED / MODEL-BASED RISK ADVISORY: Risk levels, detected issues, and recommended actions are generated from multi-variable engineering thresholds.',
  'NOT AN AUTOMATED SCADA COMMAND OR REAL-TIME EMERGENCY SHUTDOWN SYSTEM.',
  'OPERATIONAL MANDATE: Field operators must verify physical dynamometer cards, wellhead pressure gauges, and thermal logs before adjusting operating setpoints.',
] as const;

export const AI_RISK_ASSUMPTIONS = [
  'Risk level evaluates combined severity across SRP mechanical load, heavy-oil viscosity, thermal soak gain, and production rate.',
  'Confidence rating is classified as Model-based when multi-variable physics engines agree, or Rule-based when governed by deterministic threshold rules.',
  'Recommended actions prioritize physical equipment safety (reducing SRP speed/stroke) and reservoir heating efficiency (increasing steam quality/soak time).',
] as const;
