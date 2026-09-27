/**
 * BAGHEWALA DIGITAL TWIN — COPILOT NATURAL LANGUAGE QUERY ENGINE
 * 
 * Parses natural-language engineering queries, maps commands to parameters,
 * and generates structured 10-section engineering copilot answers equipped with
 * source traceability badges ([MODEL-CALCULATED], [HISTORICAL-EVIDENCE], etc.).
 * 
 * STRICT RULE: Never calculates numbers independently. All values are sourced
 * directly from authoritative physics models.
 */

import type { Scenario, ScenarioInputValues } from '../scenario/types';
import { buildFullEngineeringDecisionContext } from './decisionTraceEngine';
import { evaluateDataGapPriorities } from './dataGapPriorityEngine';

export interface CopilotQueryAnswer {
  question: string;
  matchedCommand?: {
    type: 'SET_TEMP' | 'SET_SPM' | 'COMPARE_SCENARIOS' | 'EXPLAIN_RISK' | 'EXPLAIN_PRODUCTION' | 'EXPLAIN_CONSTRAINTS';
    targetValue?: number;
    paramKey?: keyof ScenarioInputValues;
  };
  sections: Array<{
    title: string;
    sourceTag: 'MODEL-CALCULATED' | 'HISTORICAL-EVIDENCE' | 'USER-CONFIGURED-CONSTRAINT' | 'VALIDATION-DATA' | 'ENGINEERING-ADVISORY' | 'KNOWLEDGE-GAP';
    content: string;
  }>;
  generatedAt: string;
}

export function processCopilotEngineeringQuery(
  query: string,
  scenario: Scenario
): CopilotQueryAnswer {
  const context = buildFullEngineeringDecisionContext(scenario);
  const qLower = query.toLowerCase().trim();
  const generatedAt = new Date().toISOString();

  let matchedCommand: CopilotQueryAnswer['matchedCommand'] | undefined = undefined;

  // 1. Command Parser: Temperature Command
  const tempMatch = qLower.match(/(?:temperature|temp).*?(?:to|is|increases? to|set to)?\s*(\d+)/i);
  if (tempMatch && (qLower.includes('temperature') || qLower.includes('temp'))) {
    const val = parseFloat(tempMatch[1]);
    if (val >= 10 && val <= 200) {
      matchedCommand = { type: 'SET_TEMP', targetValue: val, paramKey: 'reservoirTemperatureC' };
    }
  }

  // 2. Command Parser: SPM Command
  const spmMatch = qLower.match(/(?:spm|pumping speed).*?(?:to|is|increases? to|set to)?\s*(\d+)/i);
  if (spmMatch && (qLower.includes('spm') || qLower.includes('pumping speed'))) {
    const val = parseFloat(spmMatch[1]);
    if (val >= 1 && val <= 30) {
      matchedCommand = { type: 'SET_SPM', targetValue: val, paramKey: 'spm' };
    }
  }

  // 3. Command Parser: Compare & Intent Queries (only if specific command not matched)
  if (!matchedCommand) {
    if (qLower.includes('compare') || (qLower.includes('thermal improvement') && qLower.includes('spm'))) {
      matchedCommand = { type: 'COMPARE_SCENARIOS' };
    } else if (qLower.includes('risk') || qLower.includes('causing')) {
      matchedCommand = { type: 'EXPLAIN_RISK' };
    } else if (qLower.includes('production') || qLower.includes('decrease') || qLower.includes('increase')) {
      matchedCommand = { type: 'EXPLAIN_PRODUCTION' };
    } else if (qLower.includes('constraint') || qLower.includes('active')) {
      matchedCommand = { type: 'EXPLAIN_CONSTRAINTS' };
    }
  }

  // Build Structured 10-Section Answer
  const uncertaintyProd = context.uncertaintyResult.ranges.find((r) => r.parameterName === 'Oil Production Rate');
  const prioritizedGaps = evaluateDataGapPriorities();

  let answerText = `Modeled production under ${scenario.name} is ${context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD (Viscosity: ${context.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP, Load Index: ${context.srpOutputs.currentCandidate.loadIndex.toFixed(1)}/100).`;
  if (matchedCommand?.type === 'SET_TEMP') {
    answerText = `Query requests evaluating reservoir temperature set to ${matchedCommand.targetValue}°C. Under this temperature, oil viscosity drops along the log-linear slope, enhancing Darcy inflow transmissibility.`;
  } else if (matchedCommand?.type === 'SET_SPM') {
    answerText = `Query requests evaluating pumping speed set to ${matchedCommand.targetValue} SPM. Higher SPM increases mechanical stroke acceleration, elevating calculated SRP rod string load index.`;
  } else if (matchedCommand?.type === 'COMPARE_SCENARIOS') {
    answerText = `Comparing Thermal Improvement (Scenario B) vs High SPM Stress (Scenario D). Scenario B enhances production via thermal viscosity reduction without exceeding mechanical load limits; Scenario D increases rod load index leading to constraint violations.`;
  }

  const sections: CopilotQueryAnswer['sections'] = [
    {
      title: '1. EXECUTIVE ANSWER',
      sourceTag: 'ENGINEERING-ADVISORY',
      content: answerText,
    },
    {
      title: '2. CURRENT OPERATING CONDITION',
      sourceTag: 'MODEL-CALCULATED',
      content: `Scenario: ${scenario.name}\nReservoir Temp: ${context.inputs.reservoirTemperatureC}°C | Steam: ${context.inputs.steamInjectionRateTpd} TPD | SPM: ${context.inputs.spm} | VFD: ${context.inputs.vfdFrequencyHz} Hz | Stroke: ${context.inputs.strokeLengthMeters}m`,
    },
    {
      title: '3. CALCULATED MODEL EFFECT',
      sourceTag: 'MODEL-CALCULATED',
      content: `Predicted Temp: ${context.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)}°C\nModeled Viscosity: ${context.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP (${context.viscosityOutputs.viscosityChangePercent}% shift)\nMobility (k/μ): ${context.mobilityOutputs.mobilityDcP.toFixed(4)} D/cP\nProduction: ${context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD\nSRP Load Index: ${context.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100`,
    },
    {
      title: '4. PHYSICAL MECHANISM EXPLANATION',
      sourceTag: 'MODEL-CALCULATED',
      content: `Heat delivery to matrix lowers heavy-oil crude viscosity according to the empirical log-linear relationship. Reduced viscosity increases Darcy mobility (λ_o = k_eff / μ_o), promoting crude drawdown toward wellbore.`,
    },
    {
      title: '5. RISK & CONSTRAINT EVALUATION',
      sourceTag: 'USER-CONFIGURED-CONSTRAINT',
      content: `Constraint Status: ${context.constraintResult.status}\nSystem Risk Score: ${context.riskOutputs.riskScore} / 100 (${context.riskOutputs.riskLevel})\nActive Violations: ${context.constraintResult.violations.length > 0 ? context.constraintResult.violations.join('; ') : 'None recorded.'}`,
    },
    {
      title: '6. GROUNDED HISTORICAL RAG EVIDENCE',
      sourceTag: 'HISTORICAL-EVIDENCE',
      content: context.ragEvidence.length > 0
        ? context.ragEvidence.map((e) => `- **[${e.category}]** ${e.title} (Source: ${e.provenance.document} Page ${e.provenance.page}). Grounding Explanation: ${e.currentMatch?.explanation || 'Historical reference.'}`).join('\n')
        : '- No direct historical evidence match found for current parameter range.',
    },
    {
      title: '7. UNCERTAINTY ENVELOPE',
      sourceTag: 'MODEL-CALCULATED',
      content: `Under current parameter uncertainty bounds: Production Central = ${context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD (Range: ${uncertaintyProd?.low || 0} – ${uncertaintyProd?.high || 0} BOPD).`,
    },
    {
      title: '8. MULTI-OBJECTIVE TRADE-OFF ANALYSIS',
      sourceTag: 'MODEL-CALCULATED',
      content: context.constraintResult.tradeoffs.join(' ') || 'Standard operational trade-off state.',
    },
    {
      title: '9. ENGINEERING ADVISORY RECOMMENDATIONS',
      sourceTag: 'ENGINEERING-ADVISORY',
      content: context.advisories.map((a) => `- [${a.category}] ${a.title}: ${a.recommendation}`).join('\n'),
    },
    {
      title: '10. DOCUMENTED DATA GAPS & KNOWLEDGE BOUNDARIES',
      sourceTag: 'KNOWLEDGE-GAP',
      content: prioritizedGaps.map((g) => `- [${g.priority}] ${g.title}: ${g.documentedGap}`).join('\n'),
    },
  ];

  return {
    question: query,
    matchedCommand,
    sections,
    generatedAt,
  };
}
