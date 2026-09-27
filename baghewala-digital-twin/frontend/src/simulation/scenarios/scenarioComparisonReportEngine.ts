/**
 * BAGHEWALA DIGITAL TWIN — SCENARIO COMPARISON REPORT ENGINE
 * 
 * Generates an exportable Scenario Comparison Report (Markdown & JSON)
 * summarizing side-by-side what-if scenario snapshots, parameter deltas,
 * constraint feasibility determinations, and engineering trade-offs.
 */

import type { Scenario } from '../scenario/types';
import { buildScenarioComparisonMatrix, type ScenarioComparisonMatrix } from './scenarioComparisonEngine';
import type { EngineeringConstraintConfig } from './engineeringConstraintEngine';

export const SCENARIO_COMPARISON_DISCLAIMER =
  "DECISION SUPPORT — ENGINEERING REVIEW REQUIRED. All comparisons are generated from reduced-order thermal-viscosity-Darcy-SRP models. Physical engineering review required prior to field operational changes.";

export interface ScenarioComparisonReportData {
  reportId: string;
  generatedAt: string;
  disclaimer: string;
  status: string;
  matrix: ScenarioComparisonMatrix;
  markdownReport: string;
  sections: Array<{ title: string; content: string }>;
}

export function generateScenarioComparisonReport(
  presets: Scenario[],
  savedScenarios: Scenario[] = [],
  constraintConfig?: EngineeringConstraintConfig
): ScenarioComparisonReportData {
  const allScenarios = [...presets, ...savedScenarios.filter((s) => !presets.some((p) => p.id === s.id))];
  const matrix = buildScenarioComparisonMatrix(allScenarios, constraintConfig);
  const reportId = `SCENARIO-COMP-${Date.now()}`;
  const generatedAt = new Date().toISOString();

  const matrixRows = matrix.snapshots
    .map((s) => {
      const isFeasible = s.constraintResult.status === 'FEASIBLE';
      const feas = isFeasible ? 'FEASIBLE' : 'CONSTRAINT_VIOLATED';
      const violations =
        s.constraintResult.violations.length > 0 ? s.constraintResult.violations.join('; ') : 'None';
      const tradeoffsStr =
        s.constraintResult.tradeoffs.length > 0 ? s.constraintResult.tradeoffs.join(' ') : 'Balanced operational envelope.';
      return (
        `### ${s.scenarioName}\n` +
        `- **Feasibility Status:** ${feas}\n` +
        `- **Violations:** ${violations}\n` +
        `- **Inputs:** Temp: ${s.inputs.reservoirTemperatureC}°C | Steam: ${s.inputs.steamInjectionRateTpd} TPD (${s.inputs.steamQualityPercent}%) | VFD: ${s.inputs.vfdFrequencyHz} Hz | SPM: ${s.inputs.spm} | Stroke: ${s.inputs.strokeLengthMeters}m | Soak: ${s.inputs.soakDurationDays}d\n` +
        `- **Physics Outputs:** Modeled Temp: ${s.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)}°C | Viscosity: ${s.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP | Mobility: ${s.mobilityOutputs.mobilityDcP.toFixed(4)} D/cP | Production: ${s.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD | SRP Load Index: ${s.srpOutputs.currentCandidate.loadIndex.toFixed(1)}/100 | Risk: ${s.riskOutputs.riskLevel} (${s.riskOutputs.riskScore}/100)\n` +
        `- **Deltas vs Baseline:** Temp: ${s.deltas.tempC >= 0 ? '+' : ''}${s.deltas.tempC}°C | Viscosity: ${s.deltas.viscosityChangePercent}% | Mobility: +${s.deltas.mobilityChangePercent}% | Production: ${s.deltas.productionBopd >= 0 ? '+' : ''}${s.deltas.productionBopd} BOPD (${s.deltas.productionChangePercent >= 0 ? '+' : ''}${s.deltas.productionChangePercent}%) | Load Index: ${s.deltas.loadIndex >= 0 ? '+' : ''}${s.deltas.loadIndex}\n` +
        `- **Trade-off Analysis:** ${tradeoffsStr}`
      );
    })
    .join('\n\n');

  const markdownReport = `# BAGHEWALA DIGITAL TWIN — WHAT-IF SCENARIO COMPARISON REPORT

**Report ID:** ${reportId}  
**Generated:** ${generatedAt}  
**Assessment Type:** Multi-Scenario Optimization & Constraint Evaluation  

---

## 1. Executive Summary & Feasibility Determination
This report presents a side-by-side comparative analysis of ${matrix.snapshots.length} operating scenarios for the Baghewala Heavy-Oil Field. All snapshots are computed directly from authoritative physics models (Thermal-Viscosity-Darcy-SRP) and evaluated against user-defined engineering constraints.

> **MANDATED SAFETY DISCLAIMER:** ${SCENARIO_COMPARISON_DISCLAIMER}

---

## 2. Scenario Comparison Matrix

${matrixRows}

---

## 3. Engineering Decision Support Summary
- Scenarios marked **FEASIBLE** satisfy all configured operating thresholds (SPM, Load Index, Steam Temp, Risk Score).
- Scenarios marked **CONSTRAINT_VIOLATED** exceed specified mechanical or operational safety boundaries and require parameter adjustment prior to field implementation.
- Trade-offs between crude oil production (BOPD) and pumping rod load index are highlighted explicitly without applying arbitrary weighting scores.

---
> **AUTHORITATIVE SIGN-OFF:** DIGITAL TWIN SIMULATION ENGINE (PROMPT 5 DECISION SUPPORT)
`;

  const sections = [
    {
      title: '1. Executive Summary & Scenario Inventory',
      content: `Evaluated ${matrix.snapshots.length} scenarios against baseline. Baseline production: ${matrix.baselineSnapshot.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD.`,
    },
    {
      title: '2. Scenario Side-by-Side Performance Matrix',
      content: matrix.snapshots
        .map(
          (s) =>
            `[${s.constraintResult.status === 'FEASIBLE' ? 'FEASIBLE' : 'VIOLATED'}] ${s.scenarioName}:\n` +
            `  • Prod: ${s.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD (Δ: ${s.deltas.productionBopd >= 0 ? '+' : ''}${s.deltas.productionBopd} BOPD, ${s.deltas.productionChangePercent >= 0 ? '+' : ''}${s.deltas.productionChangePercent}%)\n` +
            `  • Viscosity: ${s.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP (Δ: ${s.deltas.viscosityChangePercent}%)\n` +
            `  • Load Index: ${s.srpOutputs.currentCandidate.loadIndex.toFixed(1)}/100 (Δ: ${s.deltas.loadIndex >= 0 ? '+' : ''}${s.deltas.loadIndex})\n` +
            `  • Risk: ${s.riskOutputs.riskLevel} (${s.riskOutputs.riskScore}/100)\n` +
            `  • Trade-off: ${s.constraintResult.tradeoffs[0] || 'Standard operation.'}`
        )
        .join('\n\n'),
    },
    {
      title: '3. Engineering Constraints & Compliance Violations',
      content: matrix.snapshots
        .map(
          (s) =>
            `${s.scenarioName}: ${s.constraintResult.status === 'FEASIBLE' ? '✓ FEASIBLE (All constraints passed)' : '❌ CONSTRAINT VIOLATED'}` +
            (s.constraintResult.violations.length > 0 ? `\n   Violations: ${s.constraintResult.violations.join('; ')}` : '')
        )
        .join('\n\n'),
    },
    {
      title: '4. Physical Trade-off & Pareto Analysis',
      content:
        'Multi-objective trade-offs are reported directly:\n' +
        matrix.snapshots.map((s) => `- ${s.scenarioName}: ${s.constraintResult.tradeoffs.join(' ')}`).join('\n'),
    },
    {
      title: '5. Decision Support & Engineering Review Guidance',
      content:
        'This decision-support matrix requires engineering review prior to field implementation. Do NOT execute field parameter changes solely based on automated output.',
    },
  ];

  return {
    reportId,
    generatedAt,
    disclaimer: SCENARIO_COMPARISON_DISCLAIMER,
    status: matrix.snapshots.some((s) => s.constraintResult.status !== 'FEASIBLE')
      ? 'CONSTRAINTS_VIOLATED_IN_SOME_SCENARIOS'
      : 'ALL_SCENARIOS_FEASIBLE',
    matrix,
    markdownReport,
    sections,
  };
}
