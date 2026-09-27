/**
 * BAGHEWALA DIGITAL TWIN — COPILOT REPORT ENGINE
 * 
 * Generates an exportable AI Engineering Decision Report (Markdown & JSON)
 * containing full decision traces, causal chains, risk explanations,
 * scenario trade-offs, and non-actuating engineering advisories.
 */

import type { Scenario } from '../scenario/types';
import { buildFullEngineeringDecisionContext, type FullEngineeringDecisionContext } from './decisionTraceEngine';

export const COPILOT_REPORT_DISCLAIMER =
  "DECISION SUPPORT — ENGINEERING REVIEW REQUIRED. All AI Copilot explanations are derived from reduced-order thermal-viscosity-Darcy-SRP physics models and grounded historical evidence. No automated equipment actuation is executed.";

export interface CopilotReportData {
  reportId: string;
  generatedAt: string;
  disclaimer: string;
  status: string;
  context: FullEngineeringDecisionContext;
  markdownReport: string;
  sections: Array<{ title: string; content: string }>;
}

export function generateCopilotReport(
  scenario: Scenario
): CopilotReportData {
  const reportId = `COPILOT-RPT-${Date.now()}`;
  const generatedAt = new Date().toISOString();
  const context = buildFullEngineeringDecisionContext(scenario);

  const markdownReport = `# BAGHEWALA DIGITAL TWIN — AI ENGINEERING DECISION REPORT

**Report ID:** ${reportId}  
**Generated At:** ${generatedAt}  
**Active Scenario:** ${scenario.name}  
**Feasibility Status:** ${context.constraintResult.status}  

---

## Mandated Safety Disclaimer
> **${COPILOT_REPORT_DISCLAIMER}**

---

## 1. Live Operating Context & Calculated Physics
- **Reservoir Temperature:** ${context.inputs.reservoirTemperatureC}°C (Modeled: ${context.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)}°C)
- **Steam Injection Rate:** ${context.inputs.steamInjectionRateTpd} TPD (${context.inputs.steamQualityPercent}% Quality)
- **Crude Oil Viscosity:** ${context.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP (${context.viscosityOutputs.viscosityChangePercent}% Shift)
- **Fluid Mobility (k/μ):** ${context.mobilityOutputs.mobilityDcP.toFixed(4)} D/cP
- **Estimated Oil Production:** ${context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD
- **SRP Rod Load Index:** ${context.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100
- **System Risk Score:** ${context.riskOutputs.riskScore} / 100 (${context.riskOutputs.riskLevel})

---

## 2. Explainable Causal Chain (Input → Physical Effect → Inflow → Advisory)
${context.causalChain
  .map((c) => `- **[${c.stage}] ${c.parameter}:** ${c.value} — *${c.description}*`)
  .join('\n')}

---

## 3. Structured 9-Step Engineering Decision Trace
${context.decisionTrace
  .map((t) => `### Step ${t.stepNumber}: ${t.stepName} [${t.status}]\n- **Evidence:** ${t.evidence}\n- **Explanation:** ${t.explanation}`)
  .join('\n\n')}

---

## 4. Engineering Advisory Recommendations
${context.advisories
  .map((a) => `- **[${a.category}] ${a.title} (Urgency: ${a.urgency}):** ${a.recommendation}\n  *Rationale:* ${a.rationale}`)
  .join('\n\n')}

---

## 5. Grounded RAG Historical Evidence
${context.ragEvidence.length > 0
  ? context.ragEvidence.map((e) => `- **[${e.category}]** ${e.title} (Source: ${e.provenance.document} Page ${e.provenance.page})\n  *Why Relevant:* ${e.currentMatch?.explanation || 'Historical reference.'}`).join('\n\n')
  : '- No direct historical evidence match found for current parameter range.'}

---

## 6. Engineering Sign-Off & Review Requirements
This AI Engineering Decision Report requires formal petroleum engineer sign-off prior to field implementation.
`;

  const sections = [
    {
      title: '1. Executive Decision Summary',
      content: `Active Scenario: ${scenario.name}. Status: ${context.constraintResult.status}. Production: ${context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD (Viscosity: ${context.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP, Risk: ${context.riskOutputs.riskLevel}).`,
    },
    {
      title: '2. Explainable Causal Chain',
      content: context.causalChain.map((c) => `${c.stage} -> ${c.parameter}: ${c.value}`).join('\n'),
    },
    {
      title: '3. 9-Step Engineering Decision Trace',
      content: context.decisionTrace.map((t) => `${t.stepName}: ${t.evidence} (${t.explanation})`).join('\n'),
    },
    {
      title: '4. Non-Actuating Engineering Advisories',
      content: context.advisories.map((a) => `[${a.category}] ${a.title}: ${a.recommendation}`).join('\n'),
    },
    {
      title: '5. Grounded RAG Evidence Summary',
      content: context.ragEvidence.map((e) => `[${e.category}] ${e.title} (Source: ${e.provenance.document} Page ${e.provenance.page})`).join('\n'),
    },
    {
      title: '6. Engineering Sign-off Requirements',
      content: 'Mandated engineering sign-off required prior to field parameter changes.',
    },
  ];

  return {
    reportId,
    generatedAt,
    disclaimer: COPILOT_REPORT_DISCLAIMER,
    status: context.constraintResult.status === 'FEASIBLE' ? 'DECISION_TRACE_OPTIMAL' : 'DECISION_TRACE_CONSTRAINED',
    context,
    markdownReport,
    sections,
  };
}
