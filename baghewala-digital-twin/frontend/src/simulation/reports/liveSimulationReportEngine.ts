import type { Scenario } from '../scenario/types';
import type { ThermalResult } from '../thermal';
import type { ViscosityResult } from '../viscosity';
import type { MobilityResult } from '../mobility';
import type { ProductionResult } from '../production';
import type { OptimizationResult } from '../srpOptimization';
import type { CSSOptimizationResult } from '../cssOptimization';
import type { AIRiskResult } from '../riskEngine';
import { getLatestHistoricalIncidentState } from '../../components/simulation/SimulationHistoricalIncidents';

export interface LiveSimulationReportData {
  reportId: string;
  generatedAt: string;
  scenarioName: string;
  scenarioDescription: string;
  disclaimer: string;
  inputsSummary: {
    reservoirTemperatureC: number;
    steamInjectionRateTpd: number;
    steamQualityPercent: number;
    soakDurationDays: number;
    vfdFrequencyHz: number;
    spm: number;
    strokeLengthMeters: number;
    ambientTemperatureC: number;
  };
  calculatedResults: {
    predictedReservoirTempC: number;
    thermalState: string;
    estimatedViscosityCp: number;
    viscosityChangePercent: number;
    mobilityDcP: number;
    mobilityChangePercent: number;
    estimatedProductionBopd: number;
    productionChangePercent: number;
    srpLoadIndex: number;
    srpPprlLbs: number;
    riskLevel: string;
    riskScore: number;
  };
  parameterDeltas: {
    parameter: string;
    baselineValue: string;
    currentValue: string;
    delta: string;
  }[];
  activeRisks: {
    category: string;
    severity: string;
    title: string;
    explanation: string;
    advisory: string;
  }[];
  groundedEvidence: {
    id: string;
    title: string;
    category: string;
    document: string;
    page: string;
    section?: string;
    figure?: string;
    confidence: string;
    matchExplanation: string;
  }[];
  knowledgeGaps: {
    id: string;
    title: string;
    topic: string;
    documentedGap: string;
    source: string;
    impact: string;
  }[];
  aiExplanation: string;
  advisoryActions: {
    target: string;
    priority: string;
    title: string;
    action: string;
    expectedImpact: string;
  }[];
  markdownReport: string;
}

export function generateLiveSimulationReport(params: {
  activeScenario: Scenario;
  thermalResult: ThermalResult;
  baselineThermalResult: ThermalResult;
  viscosityResult: ViscosityResult;
  baselineViscosityResult: ViscosityResult;
  mobilityResult: MobilityResult;
  baselineMobilityResult: MobilityResult;
  productionResult: ProductionResult;
  baselineProductionResult: ProductionResult;
  srpOptimizationResult: OptimizationResult;
  cssOptimizationResult: CSSOptimizationResult;
  aiRiskResult: AIRiskResult;
}): LiveSimulationReportData {
  const {
    activeScenario,
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = params;

  const timestamp = new Date().toISOString();
  const reportId = `RPT-LIVE-${Date.now()}`;
  const inputs = activeScenario.inputs;
  const disclaimer = 'HISTORICAL EVIDENCE — NOT A PREDICTION';

  const srpLoad = srpOptimizationResult.currentCandidate.loadIndex;
  const estimatedPprlLbs = Math.round(srpLoad * 220);

  // Compute Baseline vs Current Parameter Changes
  const tempDelta = (thermalResult.predictedReservoirTemperatureC - baselineThermalResult.predictedReservoirTemperatureC).toFixed(1);
  const viscDelta = (viscosityResult.estimatedViscosityCp - baselineViscosityResult.estimatedViscosityCp).toFixed(1);
  const prodDelta = (productionResult.estimatedProductionBopd - baselineProductionResult.estimatedProductionBopd).toFixed(2);
  const spmDelta = (inputs.spm - 8.0).toFixed(1);
  const loadDelta = (srpLoad - 58.0).toFixed(1);

  const parameterDeltas = [
    {
      parameter: 'Reservoir Temperature',
      baselineValue: `${baselineThermalResult.predictedReservoirTemperatureC.toFixed(1)} °C`,
      currentValue: `${thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C`,
      delta: `${parseFloat(tempDelta) >= 0 ? '+' : ''}${tempDelta} °C`,
    },
    {
      parameter: 'Crude Oil Viscosity',
      baselineValue: `${baselineViscosityResult.estimatedViscosityCp.toLocaleString()} cP`,
      currentValue: `${viscosityResult.estimatedViscosityCp.toLocaleString()} cP`,
      delta: `${parseFloat(viscDelta) >= 0 ? '+' : ''}${viscDelta} cP (${viscosityResult.viscosityChangePercent}%)`,
    },
    {
      parameter: 'Fluid Darcy Mobility (k/μ)',
      baselineValue: `${baselineMobilityResult.mobilityDcP.toFixed(4)} D/cP`,
      currentValue: `${mobilityResult.mobilityDcP.toFixed(4)} D/cP`,
      delta: `+${mobilityResult.mobilityChangePercent}%`,
    },
    {
      parameter: 'Estimated Production Rate',
      baselineValue: `${baselineProductionResult.estimatedProductionBopd.toFixed(2)} BOPD`,
      currentValue: `${productionResult.estimatedProductionBopd.toFixed(2)} BOPD`,
      delta: `${parseFloat(prodDelta) >= 0 ? '+' : ''}${prodDelta} BOPD (${productionResult.productionChangePercent}%)`,
    },
    {
      parameter: 'SRP Mechanical Load Index',
      baselineValue: '58.0 / 100',
      currentValue: `${srpLoad.toFixed(1)} / 100`,
      delta: `${parseFloat(loadDelta) >= 0 ? '+' : ''}${loadDelta}`,
    },
    {
      parameter: 'Sucker Rod Pumping Speed',
      baselineValue: '8.0 SPM',
      currentValue: `${inputs.spm.toFixed(1)} SPM`,
      delta: `${parseFloat(spmDelta) >= 0 ? '+' : ''}${spmDelta} SPM`,
    },
  ];

  // Map Active Risks
  const activeRisks = aiRiskResult.detectedIssues.map((issue) => ({
    category: issue.category,
    severity: issue.severity,
    title: issue.title,
    explanation: issue.description,
    advisory: `Threshold: ${issue.threshold} (Actual: ${issue.actualValue})`,
  }));

  // Retrieve RAG Historical Evidence
  const historicalState = getLatestHistoricalIncidentState();
  const groundedEvidence = historicalState.evidence.map((ev) => ({
    id: ev.id,
    title: ev.title,
    category: ev.category,
    document: ev.provenance.document,
    page: String(ev.provenance.page),
    section: ev.provenance.section,
    figure: ev.provenance.figure,
    confidence: ev.provenance.confidence,
    matchExplanation: ev.currentMatch.explanation,
  }));

  const knowledgeGaps = historicalState.knowledgeGaps.map((gap) => ({
    id: gap.id,
    title: gap.title,
    topic: gap.topic,
    documentedGap: gap.documentedGap,
    source: gap.sourceDocument,
    impact: gap.impactOnSimulation,
  }));

  // AI Explanation text
  const aiExplanationText = `The current simulation operating at reservoir temp ${thermalResult.predictedReservoirTemperatureC.toFixed(1)}°C and ${inputs.spm} SPM yields an estimated crude viscosity of ${viscosityResult.estimatedViscosityCp.toLocaleString()} cP and production rate of ${productionResult.estimatedProductionBopd.toFixed(2)} BOPD. Fluid mobility shifted by ${mobilityResult.mobilityChangePercent}%, placing the system risk status at ${aiRiskResult.riskLevel} (${aiRiskResult.riskScore}/100).`;

  const advisoryActions = [
    {
      target: 'Thermal / CSS Injection',
      priority: inputs.steamInjectionRateTpd > 100 ? 'HIGH' : 'NORMAL',
      title: 'Optimize Steam Soak Duration & Enforce TWCCEP Connections',
      action: 'Maintain steam injection quality >=80% and inspect surface wellhead thermal expansion joints before cycle 2.',
      expectedImpact: 'Prevents thermal casing elongation leak while sustaining temperature gain.',
    },
    {
      target: 'SRP Artificial Lift',
      priority: srpLoad > 80 ? 'HIGH' : 'NORMAL',
      title: 'Regulate Pumping Speed & Polished Rod Load Index',
      action: `Adjust VFD frequency to keep SPM between 7.0 and 10.0 SPM to avoid rod fatigue parting.`,
      expectedImpact: 'Extends sucker rod string fatigue endurance life.',
    },
  ];

  // Build markdown representation
  const markdownReport = `# BAGHEWALA DIGITAL TWIN — LIVE SIMULATION ENGINEERING REPORT
**Report ID:** ${reportId}
**Generated:** ${timestamp}
**Scenario Name:** ${activeScenario.name}
**System Risk Level:** ${aiRiskResult.riskLevel} (${aiRiskResult.riskScore}/100)

---

## A. SCENARIO INPUT PARAMETERS
- **Reservoir Temperature Input:** ${inputs.reservoirTemperatureC} °C
- **Steam Injection Rate:** ${inputs.steamInjectionRateTpd} TPD
- **Steam Quality:** ${inputs.steamQualityPercent} %
- **Soak Duration:** ${inputs.soakDurationDays} days
- **VFD Operating Frequency:** ${inputs.vfdFrequencyHz} Hz
- **Sucker Rod Pumping Speed (SPM):** ${inputs.spm} SPM
- **Stroke Length:** ${inputs.strokeLengthMeters} m
- **Ambient Site Temperature:** ${inputs.ambientTemperatureC} °C

## B. CALCULATED PHYSICS RESULTS
- **Modeled Reservoir Temperature:** ${thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C (${thermalResult.thermalState})
- **Estimated Crude Viscosity:** ${viscosityResult.estimatedViscosityCp.toLocaleString()} cP (${viscosityResult.viscosityChangePercent}%)
- **Darcy Fluid Mobility (k/μ):** ${mobilityResult.mobilityDcP.toFixed(4)} D/cP (+${mobilityResult.mobilityChangePercent}%)
- **Estimated Production Rate:** ${productionResult.estimatedProductionBopd.toFixed(2)} BOPD (+${productionResult.productionChangePercent}%)
- **SRP Estimated Peak Polished Rod Load:** ${estimatedPprlLbs.toLocaleString()} lbs
- **SRP Operating Load Index:** ${srpLoad.toFixed(1)} / 100

## C. PARAMETER TRANSITION MATRIX (BASELINE vs CURRENT)
${parameterDeltas.map((d) => `| **${d.parameter}** | Baseline: ${d.baselineValue} | Current: ${d.currentValue} | Δ: ${d.delta} |`).join('\n')}

## D. ACTIVE RISK CATEGORIES & CONSTRAINTS
${activeRisks.length > 0 ? activeRisks.map((r) => `- **[${r.severity}] ${r.title}**: ${r.explanation} (Advisory: ${r.advisory})`).join('\n') : '✓ All parameters operating safely within documented bounds.'}

## E. GROUNDED HISTORICAL RAG EVIDENCE
${groundedEvidence.map((ev) => `- **${ev.title}** [Category: ${ev.category} \| Document: ${ev.document} \| Page: ${ev.page} \| Confidence: ${ev.confidence}]\n  *Why Relevant:* ${ev.matchExplanation}`).join('\n')}

## F. DOCUMENTED FIELD KNOWLEDGE GAPS (SHARP D4.1 TABLE 6)
${knowledgeGaps.map((g) => `- **${g.title}** (${g.topic}): ${g.documentedGap} [Source: ${g.source} \| Impact: ${g.impact}]`).join('\n')}

## G. AI ENGINEERING EXPLANATION & INTERPRETATION
${aiExplanationText}

## H. RECOMMENDED ADVISORY ACTIONS (DECISION SUPPORT ONLY)
${advisoryActions.map((a) => `- **${a.title}** [Target: ${a.target} \| Priority: ${a.priority}]\n  *Action:* ${a.action}\n  *Expected Impact:* ${a.expectedImpact}`).join('\n')}

---
> **MANDATED SAFETY DISCLAIMER:** ${disclaimer}
`;

  return {
    reportId,
    generatedAt: timestamp,
    scenarioName: activeScenario.name,
    scenarioDescription: activeScenario.description,
    disclaimer,
    inputsSummary: {
      reservoirTemperatureC: inputs.reservoirTemperatureC,
      steamInjectionRateTpd: inputs.steamInjectionRateTpd,
      steamQualityPercent: inputs.steamQualityPercent,
      soakDurationDays: inputs.soakDurationDays,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
      ambientTemperatureC: inputs.ambientTemperatureC,
    },
    calculatedResults: {
      predictedReservoirTempC: thermalResult.predictedReservoirTemperatureC,
      thermalState: thermalResult.thermalState,
      estimatedViscosityCp: viscosityResult.estimatedViscosityCp,
      viscosityChangePercent: viscosityResult.viscosityChangePercent,
      mobilityDcP: mobilityResult.mobilityDcP,
      mobilityChangePercent: mobilityResult.mobilityChangePercent,
      estimatedProductionBopd: productionResult.estimatedProductionBopd,
      productionChangePercent: productionResult.productionChangePercent,
      srpLoadIndex: srpLoad,
      srpPprlLbs: estimatedPprlLbs,
      riskLevel: aiRiskResult.riskLevel,
      riskScore: aiRiskResult.riskScore,
    },
    parameterDeltas,
    activeRisks,
    groundedEvidence,
    knowledgeGaps,
    aiExplanation: aiExplanationText,
    advisoryActions,
    markdownReport,
  };
}
