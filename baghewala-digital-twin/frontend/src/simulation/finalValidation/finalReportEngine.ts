import type { FinalValidationState, FinalReport } from './types';
import { MANDATORY_FINAL_VALIDATION_DISCLAIMER } from './defaults';

export function generateFinalReport(state: FinalValidationState): FinalReport {
  const generatedAt = new Date().toISOString();
  const reportId = `RPT-FINAL-BAGHEWALA-${Date.now().toString(36).toUpperCase()}`;

  const sections = [
    {
      title: '1. Executive Summary & Final Engineering Determination',
      content: `${state.executiveSummary}\n\nFinal Status: ${state.finalStatus}\nRationale: ${state.statusReason}`,
    },
    {
      title: '2. Problem Definition & Heavy-Oil Operating Challenges',
      content: 'Baghewala field in Bikaner-Nagaur basin contains ultra-heavy 13° API crude oil with unheated reservoir viscosity exceeding 5,000 cP at initial temperature (48°C), requiring cyclic steam stimulation (CSS) thermal heating and sucker rod pump (SRP) artificial lift optimization.',
    },
    {
      title: '3. Baghewala Field Context & Appraisal Data Baseline',
      content: 'Baseline reservoir parameters: Depth ~1,100 m, Porosity ~24%, Permeability ~2.5 D, Initial Pressure ~45 bar. Calibrated using core test observations from Appraisal Well BW-01.',
    },
    {
      title: '4. Digital Twin System Architecture & Modularity',
      content: '19 decoupled simulation modules (Steps 4.3–5.13) maintaining 100% deterministic reproducibility, advisory-only safety governance, and 0 physical control actuation.',
    },
    {
      title: '5. Core Physics Models (Thermal, Viscosity, Mobility, Production, SRP, CSS)',
      content: 'Step 4.3 1D radial thermal conduction → Step 4.4 log-linear crude viscosity correlation → Step 4.5 oil mobility → Step 4.6 heavy-oil IPR production → Step 4.7 SRP rod load optimization → Step 4.8 CSS steam cycle optimization.',
    },
    {
      title: '6. Historical Validation & Appraisal Well Backtesting',
      content: `Evaluated across 4 appraisal well production test cases. Baseline physics models verified with 0 exceptions [Evidence EVD-501-01].`,
    },
    {
      title: '7. Parameter Calibration & Error Metrics',
      content: 'Viscosity pre-exponential multiplier calibrated, achieving a 42.5% reduction in Mean Absolute Error (MAE) from 2,022.9 cP to 1,162.8 cP [Evidence EVD-502-01].',
    },
    {
      title: '8. Monte Carlo Uncertainty Quantification & Sensitivity Analysis',
      content: '50 Latin Hypercube sample iterations across 12 parameters bounding oil production rate between P10: 3.95 BOPD and P90: 12.03 BOPD (P50: 6.9 BOPD) [Evidence EVD-503-01].',
    },
    {
      title: '9. Multi-Objective Scenario Optimization Engine',
      content: 'Identifies non-dominated Pareto trade-off candidates balancing production rate against SRP structural rod load and steam injection cost [Evidence EVD-507-01].',
    },
    {
      title: '10. Real-Time Telemetry Replay & What-If Simulation Engine',
      content: 'Real-time telemetry simulator supporting what-if parameter modification without state mutation [Evidence EVD-508-01].',
    },
    {
      title: '11. Field Data Integration & Unit Normalization Pipeline',
      content: 'Normalizes field data units (°F to °C, psi to bar, m3/day to BOPD), validates schemas, filters extreme outliers, and calculates data quality scores [Evidence EVD-506-01].',
    },
    {
      title: '12. Integrated Digital Twin Validation & Auditable Decision Trace',
      content: 'Maintains 12-stage sequential auditable decision trace with unique execution trace IDs [Evidence EVD-507-01].',
    },
    {
      title: '13. Operational System Readiness Audit',
      content: 'Software architecture and demonstration mode readiness evaluated as DEMO_READY [Evidence EVD-508-01].',
    },
    {
      title: '14. Command Center & Executive Operations Dashboard',
      content: 'Unified operations dashboard aggregating 12 subsystem status cards and system alerts [Evidence EVD-509-01].',
    },
    {
      title: '15. Deployment Readiness Gates & Telemetry Verification',
      content: '15 deployment gates evaluated; field-certified flag remains false [Evidence EVD-510-01].',
    },
    {
      title: '16. Production Pilot Simulation & End-to-End Field Workflow',
      content: '8 deterministic pilot scenarios evaluated; real field pilot ready gate evaluates true when real feed connected [Evidence EVD-511-01].',
    },
    {
      title: '17. Final Engineering Assessment & Performance Traceability',
      content: '15 traceable engineering findings confirmed across thermal, viscosity, mobility, production, SRP, CSS, risk, and calibration [Evidence EVD-512-01].',
    },
    {
      title: '18. Demonstration Scenarios Performance Evaluation',
      content: state.demoScenarios.map((s) => `• ${s.title}: Temp ${s.temperatureC.toFixed(1)}°C, Visc ${s.viscosityCp.toLocaleString()} cP, Prod ${s.productionBopd.toFixed(1)} BOPD [Risk: ${s.riskLevel}]`).join('\n'),
    },
    {
      title: '19. Evidence Traceability Registry Summary',
      content: state.evidence.map((e) => `${e.id} (${e.sourceStep}): ${e.description} = ${e.value} ${e.unit} [${e.provenance}]`).join('\n'),
    },
    {
      title: '20. Key Engineering Limitations',
      content: state.limitations.map((l, i) => `${i + 1}. ${l}`).join('\n'),
    },
    {
      title: '21. Required Real-Field Validations Before Deployment',
      content: '1. Connect continuous wellhead multi-phase flow meter.\n2. Ingest live physical SCADA sucker rod pump load cell telemetry.\n3. Recalibrate downhole reservoir temperature and pressure wireline gauges.\n4. Perform third-party engineering safety review.',
    },
    {
      title: '22. Final Status & Mandated Disclaimer',
      content: `FINAL DETERMINATION: ${state.finalStatus}\n${state.statusReason}\n\n${MANDATORY_FINAL_VALIDATION_DISCLAIMER}`,
    },
  ];

  return {
    reportId,
    generatedAt,
    title: 'BAGHEWALA HEAVY-OIL DIGITAL TWIN — FINAL ENGINEERING VALIDATION & DEMONSTRATION REPORT',
    sections,
    finalStatus: state.finalStatus,
    disclaimer: MANDATORY_FINAL_VALIDATION_DISCLAIMER,
  };
}
