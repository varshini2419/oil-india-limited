import { evaluateRiskModel } from './riskModel';
import { AI_RISK_DISCLAIMERS } from './defaults';
import type { AIRiskResult, DetectedIssue, RecommendedAction, RiskComparisonRow, RiskEvidence } from './types';

export function analyzeAIRisk(evidence: RiskEvidence): AIRiskResult {
  const evaluatedState = evaluateRiskModel(evidence);
  const { riskLevel, riskScore, detectedIssues, confidence } = evaluatedState;

  const recommendedActions: RecommendedAction[] = [];

  // Recommendation 1: High SRP Load
  const srpIssue = detectedIssues.find((i: DetectedIssue) => i.category === 'SRP_LOAD');
  if (srpIssue) {
    recommendedActions.push({
      id: 'REC_SRP_REDUCE_LOAD',
      title: 'Adjust SRP / VFD Operating Parameters (Speed & Stroke Reduction)',
      priority: srpIssue.severity === 'CRITICAL' || srpIssue.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      targetModule: 'SRP',
      actionText: `Reduce VFD frequency from ${evidence.vfdFrequencyHz} Hz down to ~40–45 Hz and surface SPM to 6.0–8.0 SPM.`,
      expectedImpact: 'Lowers Operating Load Index below 85.0 caution limit and prevents sucker rod mechanical fatigue.',
    });
  }

  // Recommendation 2: High Viscosity / Low Thermal Gain
  const viscIssue = detectedIssues.find((i: DetectedIssue) => i.category === 'VISCOSITY');
  const thermalIssue = detectedIssues.find((i: DetectedIssue) => i.category === 'THERMAL');

  if (viscIssue || thermalIssue) {
    recommendedActions.push({
      id: 'REC_CSS_BOOST_STEAM',
      title: 'Adjust CSS Thermal Soak Cycle (Increase Steam Rate & Quality)',
      priority: 'HIGH',
      targetModule: 'CSS',
      actionText: `Increase steam injection rate to 80–100 TPD @ >=80% steam quality with 5–7 days soak phase duration.`,
      expectedImpact: 'Elevates reservoir temperature above 75°C, reducing crude oil viscosity below 1,000 cP and boosting oil mobility by >10x.',
    });
  }

  // Fallback default recommendation
  if (recommendedActions.length === 0) {
    recommendedActions.push({
      id: 'REC_MAINTAIN_STABLE',
      title: 'Maintain Current Stable Operating Parameters',
      priority: 'LOW',
      targetModule: 'RESERVOIR',
      actionText: 'System operates within normal engineering thresholds. Continue routine thermal and dynamometer monitoring.',
      expectedImpact: 'Preserves balanced production rate and equipment longevity.',
    });
  }

  let summary = `Digital Twin AI Risk Engine evaluated system state as ${riskLevel} RISK (Score: ${riskScore}/100).`;
  if (detectedIssues.length > 0) {
    summary += ` Identified ${detectedIssues.length} active operational issue(s): ${detectedIssues.map((i: DetectedIssue) => i.title).join(', ')}.`;
  } else {
    summary += ' All physical parameters operate within normal engineering safety bounds.';
  }

  return {
    riskLevel,
    riskScore,
    detectedIssues,
    evidence,
    recommendedActions,
    confidence,
    summary,
    disclaimer: AI_RISK_DISCLAIMERS[0],
    modelType: 'Baghewala Digital Twin AI & Risk Advisory Engine',
    calculatedAt: new Date().toISOString(),
    inputSources: {
      riskAssessment: 'derived',
      issueDetection: 'derived',
      recommendationEngine: 'derived',
    },
  };
}

export function compareRiskResults(result: AIRiskResult): RiskComparisonRow[] {
  const ev = result.evidence;
  return [
    {
      metric: 'Reservoir Temperature',
      unit: '°C',
      baselineValue: 48.0,
      currentValue: ev.temperatureC,
      riskThreshold: '< 55.0 °C Target',
      status: ev.temperatureC < 55.0 ? 'MODERATE' : 'LOW',
      sourceType: 'derived',
    },
    {
      metric: 'Heavy Crude Viscosity',
      unit: 'cP',
      baselineValue: 15000.0,
      currentValue: ev.viscosityCp.toLocaleString(),
      riskThreshold: '> 10,000 cP Caution',
      status: ev.viscosityCp > 25000.0 ? 'HIGH' : ev.viscosityCp > 10000.0 ? 'MODERATE' : 'LOW',
      sourceType: 'derived',
    },
    {
      metric: 'Oil Transmissibility Mobility',
      unit: 'D/cP',
      baselineValue: 0.0005,
      currentValue: ev.mobilityDPerCp,
      riskThreshold: '< 0.001 D/cP Restricted',
      status: ev.mobilityDPerCp < 0.001 ? 'MODERATE' : 'LOW',
      sourceType: 'derived',
    },
    {
      metric: 'Estimated Oil Production Rate',
      unit: 'BOPD',
      baselineValue: 0.75,
      currentValue: ev.productionBopd,
      riskThreshold: '< 1.0 BOPD Restricted',
      status: ev.productionBopd < 1.0 ? 'MODERATE' : 'LOW',
      sourceType: 'derived',
    },
    {
      metric: 'SRP Operating Load Index',
      unit: '0-100',
      baselineValue: 50.0,
      currentValue: ev.srpLoadIndex,
      riskThreshold: '> 85.0 High Load',
      status: ev.srpLoadIndex > 85.0 ? 'HIGH' : ev.srpLoadIndex > 65.0 ? 'MODERATE' : 'LOW',
      sourceType: 'derived',
    },
    {
      metric: 'CSS Thermal Gain',
      unit: '°C',
      baselineValue: 0.0,
      currentValue: `+${ev.cssThermalGainC}`,
      riskThreshold: '< +15.0 °C Gain',
      status: ev.steamInjectionRateTpd > 0 && ev.cssThermalGainC < 15.0 ? 'HIGH' : 'LOW',
      sourceType: 'derived',
    },
  ];
}
