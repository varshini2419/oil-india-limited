import { RISK_THRESHOLDS } from './defaults';
import type { AIConfidence, DetectedIssue, RiskEvidence, RiskLevel } from './types';

export interface EvaluatedRiskState {
  riskLevel: RiskLevel;
  riskScore: number;
  detectedIssues: DetectedIssue[];
  confidence: AIConfidence;
}

export function evaluateRiskModel(evidence: RiskEvidence): EvaluatedRiskState {
  const detectedIssues: DetectedIssue[] = [];
  let cumulativeScore = 0;

  // Issue 1: SRP Load Elevated
  if (evidence.srpLoadIndex > RISK_THRESHOLDS.srpLoad.criticalIndex) {
    detectedIssues.push({
      id: 'ISSUE_SRP_CRITICAL',
      title: '1. SRP Load Severely Elevated (Critical Mechanical Stress)',
      severity: 'CRITICAL',
      category: 'SRP_LOAD',
      description: `Sucker Rod Pump operating load index (${evidence.srpLoadIndex}/100) exceeds maximum safety limit (95.0). Severe fatigue risk to sucker rod string.`,
      threshold: '> 95.0 Load Index',
      actualValue: `${evidence.srpLoadIndex} Load Index`,
    });
    cumulativeScore += 45;
  } else if (evidence.srpLoadIndex > RISK_THRESHOLDS.srpLoad.highIndex) {
    detectedIssues.push({
      id: 'ISSUE_SRP_HIGH',
      title: '1. SRP Load Elevated',
      severity: 'HIGH',
      category: 'SRP_LOAD',
      description: `Sucker Rod Pump operating load index (${evidence.srpLoadIndex}/100) exceeds caution threshold (85.0). High speed or stroke length severity.`,
      threshold: '> 85.0 Load Index',
      actualValue: `${evidence.srpLoadIndex} Load Index`,
    });
    cumulativeScore += 30;
  } else if (evidence.srpLoadIndex > RISK_THRESHOLDS.srpLoad.moderateIndex) {
    detectedIssues.push({
      id: 'ISSUE_SRP_MODERATE',
      title: '1. SRP Load Moderately Elevated',
      severity: 'MODERATE',
      category: 'SRP_LOAD',
      description: `Sucker Rod Pump load index (${evidence.srpLoadIndex}/100) is in normal caution range (65.0 - 85.0).`,
      threshold: '> 65.0 Load Index',
      actualValue: `${evidence.srpLoadIndex} Load Index`,
    });
    cumulativeScore += 15;
  }

  if ((evidence.rodFloatingIndex ?? 0) >= 80) {
    detectedIssues.push({
      id: 'ISSUE_ROD_FLOATING_CRITICAL',
      title: 'Rod Floating and Impact Loading Risk',
      severity: 'CRITICAL',
      category: 'ROD_FLOATING',
      description: 'Modeled rod floating index indicates incomplete pump fill and elevated impact loading risk.',
      threshold: '>= 80 Rod Floating Index',
      actualValue: `${evidence.rodFloatingIndex} / 100`,
    });
    cumulativeScore += 30;
  } else if ((evidence.rodFloatingIndex ?? 0) >= 60) {
    detectedIssues.push({
      id: 'ISSUE_ROD_FLOATING_HIGH',
      title: 'Rod Floating Risk Elevated',
      severity: 'HIGH',
      category: 'ROD_FLOATING',
      description: 'Modeled rod floating index indicates pump fill loss as viscosity rises.',
      threshold: '>= 60 Rod Floating Index',
      actualValue: `${evidence.rodFloatingIndex} / 100`,
    });
    cumulativeScore += 20;
  }

  // Issue 2: Oil Viscosity Remains High
  if (evidence.viscosityCp > RISK_THRESHOLDS.viscosity.criticalCp) {
    detectedIssues.push({
      id: 'ISSUE_VISC_CRITICAL',
      title: '2. Oil Viscosity Critically High (Flow Stagnation)',
      severity: 'CRITICAL',
      category: 'VISCOSITY',
      description: `Heavy crude oil viscosity (${evidence.viscosityCp.toLocaleString()} cP) is near unheated baseline state (>50,000 cP). Fluid mobility severely restricted.`,
      threshold: '> 50,000 cP',
      actualValue: `${evidence.viscosityCp.toLocaleString()} cP`,
    });
    cumulativeScore += 40;
  } else if (evidence.viscosityCp > RISK_THRESHOLDS.viscosity.highCp) {
    detectedIssues.push({
      id: 'ISSUE_VISC_HIGH',
      title: '2. Oil Viscosity Remains High',
      severity: 'HIGH',
      category: 'VISCOSITY',
      description: `Heavy crude oil viscosity (${evidence.viscosityCp.toLocaleString()} cP) exceeds high resistance threshold (25,000 cP). Transmissibility is severely choked.`,
      threshold: '> 25,000 cP',
      actualValue: `${evidence.viscosityCp.toLocaleString()} cP`,
    });
    cumulativeScore += 25;
  } else if (evidence.viscosityCp > RISK_THRESHOLDS.viscosity.moderateCp) {
    detectedIssues.push({
      id: 'ISSUE_VISC_MODERATE',
      title: '2. Oil Viscosity Moderately Elevated',
      severity: 'MODERATE',
      category: 'VISCOSITY',
      description: `Heavy crude oil viscosity (${evidence.viscosityCp.toLocaleString()} cP) remains above optimal pumping viscosity (<10,000 cP).`,
      threshold: '> 10,000 cP',
      actualValue: `${evidence.viscosityCp.toLocaleString()} cP`,
    });
    cumulativeScore += 15;
  }

  // Issue 3: CSS Thermal Gain Insufficient
  if (evidence.steamInjectionRateTpd > 0 && evidence.cssThermalGainC < RISK_THRESHOLDS.thermal.minSufficientGainC) {
    detectedIssues.push({
      id: 'ISSUE_THERMAL_INSUFFICIENT',
      title: '3. CSS Thermal Gain Insufficient',
      severity: 'HIGH',
      category: 'THERMAL',
      description: `Cyclic steam stimulation thermal gain (+${evidence.cssThermalGainC}°C) is below minimum expected soak threshold (+15.0°C). Steam energy is dissipated or soak duration insufficient.`,
      threshold: '< +15.0 °C Gain',
      actualValue: `+${evidence.cssThermalGainC} °C Gain`,
    });
    cumulativeScore += 25;
  } else if (evidence.temperatureC < RISK_THRESHOLDS.thermal.lowReservoirTempC) {
    detectedIssues.push({
      id: 'ISSUE_THERMAL_LOW_TEMP',
      title: '3. Reservoir Temperature Below Soak Target',
      severity: 'MODERATE',
      category: 'THERMAL',
      description: `Reservoir matrix temperature (${evidence.temperatureC}°C) remains near native unheated baseline (48.0°C).`,
      threshold: '< 55.0 °C',
      actualValue: `${evidence.temperatureC} °C`,
    });
    cumulativeScore += 15;
  }

  // Issue 4: Low Production Rate
  if (evidence.productionBopd < RISK_THRESHOLDS.production.veryLowProductionBopd) {
    detectedIssues.push({
      id: 'ISSUE_PROD_LOW',
      title: '4. Production Rate Severely Restricted',
      severity: 'HIGH',
      category: 'PRODUCTION',
      description: `Estimated oil production (${evidence.productionBopd} BOPD) is near zero baseline. Viscosity choking or pump capacity bottleneck.`,
      threshold: '< 0.5 BOPD',
      actualValue: `${evidence.productionBopd} BOPD`,
    });
    cumulativeScore += 20;
  }

  const riskScore = Math.min(100, Math.max(0, cumulativeScore));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 75 || detectedIssues.some((i) => i.severity === 'CRITICAL')) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 50 || detectedIssues.some((i) => i.severity === 'HIGH')) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 25 || detectedIssues.some((i) => i.severity === 'MODERATE')) {
    riskLevel = 'MODERATE';
  }

  const confidence: AIConfidence = detectedIssues.length >= 2 ? 'Model-based' : 'Rule-based';

  return {
    riskLevel,
    riskScore,
    detectedIssues,
    confidence,
  };
}
