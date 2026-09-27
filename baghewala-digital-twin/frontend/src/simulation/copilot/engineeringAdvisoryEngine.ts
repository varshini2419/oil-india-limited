/**
 * BAGHEWALA DIGITAL TWIN — ENGINEERING ADVISORY ENGINE
 * 
 * Generates non-actuating engineering decision-support advisory actions.
 * 
 * STRICT RULE: Never issues automated SCADA/control commands (START PUMP, INCREASE STEAM, OPEN VALVE).
 * All recommendations are advisory and classified into: MONITOR, REVIEW, INVESTIGATE, CALIBRATE, COMPARE, COLLECT DATA.
 */

import type { ScenarioInputValues } from '../scenario/types';
import type { AIRiskResult } from '../riskEngine';
import type { ConstraintEvaluationResult } from '../scenarios/engineeringConstraintEngine';
import type { UncertaintyAnalysisResult } from '../validation/uncertaintyEngine';

export interface EngineeringAdvisoryAction {
  id: string;
  category: 'MONITOR' | 'REVIEW' | 'INVESTIGATE' | 'CALIBRATE' | 'COMPARE' | 'COLLECT DATA';
  title: string;
  recommendation: string;
  rationale: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceTag: 'ENGINEERING-ADVISORY' | 'USER-CONFIGURED-CONSTRAINT' | 'HISTORICAL-EVIDENCE';
}

export function generateEngineeringAdvisories(
  inputs: ScenarioInputValues,
  riskResult: AIRiskResult,
  constraintResult?: ConstraintEvaluationResult,
  uncertaintyResult?: UncertaintyAnalysisResult
): EngineeringAdvisoryAction[] {
  const actions: EngineeringAdvisoryAction[] = [];

  // 1. High Mechanical Load / SPM Review
  if (inputs.spm > 10.0 || (constraintResult && constraintResult.violations.some((v) => v.toLowerCase().includes('spm')))) {
    actions.push({
      id: 'ADV-01',
      category: 'REVIEW',
      title: 'Review Pumping Speed (SPM) Operating Point',
      recommendation: `Review SPM reduction scenario (current: ${inputs.spm} SPM). Consider evaluating lower speed settings to mitigate calculated rod string load index.`,
      rationale: `Calculated SRP rod load index is elevated under current speed setting. Engineering review required prior to field adjustment.`,
      urgency: 'HIGH',
      sourceTag: 'ENGINEERING-ADVISORY',
    });
  }

  // 2. High Viscosity / Thermal Soak Review
  if (riskResult.detectedIssues.some((i) => i.title.toLowerCase().includes('viscosity')) || inputs.reservoirTemperatureC < 40) {
    actions.push({
      id: 'ADV-02',
      category: 'COMPARE',
      title: 'Compare Thermal Response against Historical Reference',
      recommendation: `Compare current matrix temperature (${inputs.reservoirTemperatureC}°C) and crude viscosity against historical cyclic steam stimulation records (e.g., BGW-8 peak thermal response).`,
      rationale: `Crude viscosity remains elevated (>10,000 cP), restricting inflow mobility. Evaluating thermal soak duration extension is advised.`,
      urgency: 'MEDIUM',
      sourceTag: 'HISTORICAL-EVIDENCE',
    });
  }

  // 3. Steam Injection Rate & Generator Capacity
  if (inputs.steamInjectionRateTpd > 100) {
    actions.push({
      id: 'ADV-03',
      category: 'MONITOR',
      title: 'Monitor Steam Generator Operating Envelope',
      recommendation: `Monitor surface steam delivery manifold pressure and thermal generator fuel consumption for steam rate setting of ${inputs.steamInjectionRateTpd} TPD.`,
      rationale: `High steam injection rate approaches documented field steam generator operational boundaries.`,
      urgency: 'MEDIUM',
      sourceTag: 'USER-CONFIGURED-CONSTRAINT',
    });
  }

  // 4. Data Collection / Downhole Telemetry
  actions.push({
    id: 'ADV-04',
    category: 'COLLECT DATA',
    title: 'Collect Additional Bottomhole Pressure Data',
    recommendation: `Plan memory gauge survey or acoustic fluid level measurement to validate bottomhole drawdown pressure under current VFD frequency (${inputs.vfdFrequencyHz} Hz).`,
    rationale: `Downhole pressure telemetry gap (SHARP D4.1 Table 6) introduces residual uncertainty in inflow performance relationship (IPR).`,
    urgency: 'MEDIUM',
    sourceTag: 'ENGINEERING-ADVISORY',
  });

  // 5. Model Calibration Check
  actions.push({
    id: 'ADV-05',
    category: 'CALIBRATE',
    title: 'Calibrate Reduced-Order Viscosity Multiplier',
    recommendation: `Validate modeled heavy-oil viscosity reduction against latest lab rheology core test data in Historical Validation workspace.`,
    rationale: `Field calibration parameters tune model output scale without altering baseline physics solver equations.`,
    urgency: 'LOW',
    sourceTag: 'ENGINEERING-ADVISORY',
  });

  // 6. Uncertainty Check
  if (uncertaintyResult && uncertaintyResult.ranges.some((r) => r.high - r.low > r.central * 0.2)) {
    const mainRange = uncertaintyResult.ranges[0];
    actions.push({
      id: 'ADV-06',
      category: 'INVESTIGATE',
      title: 'Investigate Output Uncertainty Range',
      recommendation: `Elevated output variance detected for ${mainRange?.parameterName ?? 'key parameters'} (Range: ${mainRange?.low.toFixed(1)} - ${mainRange?.high.toFixed(1)} ${mainRange?.unit ?? ''}). Perform sensitivity sweep across key reservoir parameters.`,
      rationale: `Multi-point boundary uncertainty propagation indicates wider operational confidence intervals.`,
      urgency: 'HIGH',
      sourceTag: 'ENGINEERING-ADVISORY',
    });
  }

  return actions;
}
