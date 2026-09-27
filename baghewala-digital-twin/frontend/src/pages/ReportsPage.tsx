import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Download, AlertTriangle, FileCode, Sparkles } from 'lucide-react';
import { executeFinalValidation } from '../simulation/finalValidation/finalValidationEngine';
import { generateFinalReport } from '../simulation/finalValidation/finalReportEngine';
import { executeFinalEngineeringAssessment } from '../simulation/finalEngineeringAssessment/finalAssessmentEngine';
import { generateAssessmentReport } from '../simulation/finalEngineeringAssessment/assessmentReportEngine';
import { executeProductionPilotWorkflow } from '../simulation/productionPilot/pilotWorkflowEngine';
import { generatePilotReport } from '../simulation/productionPilot/pilotReportEngine';
import { executeReleaseVerification } from '../release/releaseVerification';
import { evaluateReleaseChecklist } from '../release/releaseChecklist';
import { generateReleaseManifest } from '../release/releaseManifest';
import { useScenarioStore } from '../simulation/scenario/scenarioStore';
import { generateLiveSimulationReport } from '../simulation/reports/liveSimulationReportEngine';

import { generateScenarioComparisonReport } from '../simulation/scenarios/scenarioComparisonReportEngine';
import { generateHistoricalValidationReport } from '../simulation/validation/validationReportEngine';

interface ActiveReportView {
  title: string;
  id: string;
  timestamp: string;
  status: string;
  disclaimer: string;
  sections: { title: string; content: string }[];
  rawState: unknown;
  markdown: string;
}

export const ReportsPage: React.FC = () => {
  const scenarioStore = useScenarioStore();
  const { activeScenario, presets, savedScenarios } = scenarioStore;

  const [selectedReportKey, setSelectedReportKey] = useState<
    'live-simulation' | 'scenario-comparison' | 'historical-validation' | 'final-validation' | 'assessment' | 'pilot' | 'release-freeze'
  >('live-simulation');

  // Live simulation report
  const liveSimReport = generateLiveSimulationReport(scenarioStore);
  const scenarioCompReport = generateScenarioComparisonReport(presets, savedScenarios);
  const historicalValReport = generateHistoricalValidationReport(activeScenario.inputs);

  // Other system reports
  const pilotState = executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, false, activeScenario.inputs);
  const pilotReport = generatePilotReport(pilotState);

  const finalValState = executeFinalValidation({ pilotExecutionState: pilotState });
  const finalValReport = generateFinalReport(finalValState);

  const assessmentState = executeFinalEngineeringAssessment({ pilotExecutionState: pilotState });
  const assessmentReport = generateAssessmentReport(assessmentState);

  const releaseCert = executeReleaseVerification();
  const releaseChecklist = evaluateReleaseChecklist();
  const manifest = generateReleaseManifest();

  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActiveReportData = (): ActiveReportView => {
    switch (selectedReportKey) {
      case 'live-simulation':
        const liveSections = [
          {
            title: '1. Active Scenario Inputs Summary',
            content: `Scenario: ${liveSimReport.scenarioName}\nTemp: ${liveSimReport.inputsSummary.reservoirTemperatureC}°C | Steam: ${liveSimReport.inputsSummary.steamInjectionRateTpd} TPD (${liveSimReport.inputsSummary.steamQualityPercent}%) | VFD: ${liveSimReport.inputsSummary.vfdFrequencyHz} Hz | SPM: ${liveSimReport.inputsSummary.spm} SPM | Stroke: ${liveSimReport.inputsSummary.strokeLengthMeters} m`
          },
          {
            title: '2. Calculated Physics Results',
            content: `Modeled Temp: ${liveSimReport.calculatedResults.predictedReservoirTempC.toFixed(1)}°C (${liveSimReport.calculatedResults.thermalState})\nCrude Viscosity: ${liveSimReport.calculatedResults.estimatedViscosityCp.toLocaleString()} cP (${liveSimReport.calculatedResults.viscosityChangePercent}%)\nMobility (k/μ): ${liveSimReport.calculatedResults.mobilityDcP.toFixed(4)} D/cP (+${liveSimReport.calculatedResults.mobilityChangePercent}%)\nEstimated Production: ${liveSimReport.calculatedResults.estimatedProductionBopd.toFixed(2)} BOPD (+${liveSimReport.calculatedResults.productionChangePercent}%)\nSRP Load Index: ${liveSimReport.calculatedResults.srpLoadIndex.toFixed(1)} / 100 (${liveSimReport.calculatedResults.srpPprlLbs.toLocaleString()} lbs PPRL)\nSystem Risk Level: ${liveSimReport.calculatedResults.riskLevel} (${liveSimReport.calculatedResults.riskScore}/100)`
          },
          {
            title: '3. Parameter Transition Matrix (Baseline vs Current)',
            content: liveSimReport.parameterDeltas.map(d => `${d.parameter}: Baseline ${d.baselineValue} -> Current ${d.currentValue} (Delta: ${d.delta})`).join('\n')
          },
          {
            title: '4. Active Risks & System Constraints',
            content: liveSimReport.activeRisks.length > 0
              ? liveSimReport.activeRisks.map(r => `[${r.severity}] ${r.title}: ${r.explanation}\nAdvisory: ${r.advisory}`).join('\n\n')
              : '✓ All parameters operating safely within documented bounds.'
          },
          {
            title: '5. Grounded Historical RAG Evidence',
            content: liveSimReport.groundedEvidence.map(e => `[${e.category}] ${e.title}\nSource: ${e.document} Page ${e.page} (Confidence: ${e.confidence})\nWhy Relevant: ${e.matchExplanation}`).join('\n\n')
          },
          {
            title: '6. Documented Knowledge Gaps (SHARP D4.1 Table 6)',
            content: liveSimReport.knowledgeGaps.map(g => `${g.id}: ${g.title} (${g.topic})\nGap: ${g.documentedGap}\nSource: ${g.source} | Impact: ${g.impact}`).join('\n\n')
          },
          {
            title: '7. AI Engineering Explanation & Advisory Actions',
            content: `${liveSimReport.aiExplanation}\n\nRecommended Actions:\n` + liveSimReport.advisoryActions.map(a => `- ${a.title} [Priority: ${a.priority}]\n  Action: ${a.action}\n  Expected Impact: ${a.expectedImpact}`).join('\n')
          }
        ];
        return {
          title: `LIVE SIMULATION ENGINEERING REPORT — ${liveSimReport.scenarioName.toUpperCase()}`,
          id: liveSimReport.reportId,
          timestamp: liveSimReport.generatedAt,
          status: liveSimReport.calculatedResults.riskLevel === 'CRITICAL' ? 'CRITICAL_RISK' : (liveSimReport.calculatedResults.riskLevel === 'HIGH' ? 'HIGH_RISK' : 'OPTIMAL_OPERATION'),
          disclaimer: liveSimReport.disclaimer,
          sections: liveSections,
          rawState: liveSimReport,
          markdown: liveSimReport.markdownReport
        };

      case 'scenario-comparison':
        return {
          title: `WHAT-IF SCENARIO COMPARISON REPORT (${scenarioCompReport.matrix.snapshots.length} SCENARIOS)`,
          id: scenarioCompReport.reportId,
          timestamp: scenarioCompReport.generatedAt,
          status: scenarioCompReport.status,
          disclaimer: scenarioCompReport.disclaimer,
          sections: scenarioCompReport.sections,
          rawState: scenarioCompReport.matrix,
          markdown: scenarioCompReport.markdownReport,
        };

      case 'historical-validation':
        return {
          title: `HISTORICAL VALIDATION REPORT (PROTOTYPE FIELD DATA)`,
          id: historicalValReport.reportId,
          timestamp: historicalValReport.generatedAt,
          status: historicalValReport.status,
          disclaimer: historicalValReport.disclaimer,
          sections: historicalValReport.sections,
          rawState: historicalValReport.calibrationMetrics,
          markdown: historicalValReport.markdownReport,
        };

      case 'final-validation':
        return {
          title: finalValReport.title,
          id: finalValReport.reportId,
          timestamp: finalValReport.generatedAt,
          status: finalValReport.finalStatus,
          disclaimer: finalValReport.disclaimer,
          sections: finalValReport.sections,
          rawState: finalValState,
          markdown: `# ${finalValReport.title}\n\n**Report ID:** ${finalValReport.reportId}\n**Generated:** ${finalValReport.generatedAt}\n**Status:** ${finalValReport.finalStatus}\n\n---\n\n` +
            finalValReport.sections.map((s) => `## ${s.title}\n${s.content}\n`).join('\n') +
            `\n---\n> **MANDATED SAFETY DISCLAIMER:** ${finalValReport.disclaimer}\n`
        };
      case 'assessment':
        return {
          title: assessmentReport.title,
          id: assessmentReport.reportId,
          timestamp: assessmentReport.generatedAt,
          status: assessmentReport.finalStatus,
          disclaimer: assessmentReport.disclaimer,
          sections: assessmentReport.sections,
          rawState: assessmentState,
          markdown: `# ${assessmentReport.title}\n\n**Report ID:** ${assessmentReport.reportId}\n**Generated:** ${assessmentReport.generatedAt}\n**Status:** ${assessmentReport.finalStatus}\n\n---\n\n` +
            assessmentReport.sections.map((s) => `## ${s.title}\n${s.content}\n`).join('\n') +
            `\n---\n> **MANDATED SAFETY DISCLAIMER:** ${assessmentReport.disclaimer}\n`
        };
      case 'pilot':
        const pilotSections = [
          { title: '1. Pilot Scenario & Data Provenance', content: `Scenario: ${pilotReport.scenarioName}\nData Provenance: ${pilotReport.dataProvenance}\nTelemetry Quality Score: ${pilotReport.telemetryQualityScore}/100` },
          { title: '2. Digital Twin State Summary', content: pilotReport.twinStateSummary },
          { title: '3. Core Physics & Production Results', content: pilotReport.physicsResultsSummary },
          { title: '4. Decision Trace & Risk Assessment', content: `${pilotReport.decisionTraceSummary}\n${pilotReport.riskRating}` },
          { title: '5. Pilot Engineering Limitations', content: pilotReport.limitations.map((l, i) => `${i + 1}. ${l}`).join('\n') },
          { title: '6. Required Physical Field Inputs', content: pilotReport.requiredFieldInputs.map((r, i) => `${i + 1}. ${r}`).join('\n') },
          { title: '7. Final Pilot Determination', content: `${pilotReport.finalPilotStatus}\n\n${pilotReport.disclaimer}` },
        ];
        return {
          title: pilotReport.title,
          id: pilotReport.reportId,
          timestamp: pilotReport.generatedAt,
          status: pilotReport.finalPilotStatus,
          disclaimer: pilotReport.disclaimer,
          sections: pilotSections,
          rawState: pilotState,
          markdown: `# ${pilotReport.title}\n\n**Report ID:** ${pilotReport.reportId}\n**Generated:** ${pilotReport.generatedAt}\n**Status:** ${pilotReport.finalPilotStatus}\n\n---\n\n` +
            pilotSections.map((s) => `## ${s.title}\n${s.content}\n`).join('\n') +
            `\n---\n> **MANDATED SAFETY DISCLAIMER:** ${pilotReport.disclaimer}\n`
        };
      case 'release-freeze':
        const releaseMarkdown = `# ${manifest.projectName} — RELEASE VERIFICATION\n\n` +
          `**System Version:** ${manifest.version}\n` +
          `**Application Mode:** ${manifest.appMode}\n` +
          `**Verification Status:** ${releaseCert.isReleaseReady ? 'RELEASE_READY' : 'RELEASE_BLOCKED'}\n` +
          `**Verified Test Suites:** ${manifest.verifiedTestSuitesCount}\n` +
          `**Verified Individual Tests:** ${manifest.verifiedTotalTestsCount}\n` +
          `**Checklist:** ${releaseCert.checklistPassedCount} / ${releaseCert.checklistTotalCount} passed\n` +
          `**Demonstration Scenarios:** ${releaseCert.demoScenariosCount}\n\n` +
          `## Blockers\n${releaseCert.blockers.length ? releaseCert.blockers.map((item) => `- ${item}`).join('\n') : 'None recorded.'}\n\n` +
          `## Warnings\n${releaseCert.warnings.length ? releaseCert.warnings.map((item) => `- ${item}`).join('\n') : 'None recorded.'}\n\n` +
          `## Limitations\n${manifest.limitations.map((item) => `- ${item}`).join('\n')}\n\n` +
          `---\n> **MANDATED SAFETY DISCLAIMER:** ${manifest.disclaimer}\n`;
        return {
          title: `RELEASE VERIFICATION — VERSION ${manifest.version}`,
          id: `REL-${manifest.releaseId}`,
          timestamp: manifest.generatedAt,
          status: releaseCert.isReleaseReady ? 'RELEASE_READY' : 'RELEASE_BLOCKED',
          disclaimer: manifest.disclaimer,
          sections: [
            { title: '1. Verification Summary', content: `${releaseCert.isReleaseReady ? 'RELEASE_READY' : 'RELEASE_BLOCKED'}; ${releaseCert.demoScenariosCount} demonstration scenarios evaluated.` },
            { title: '2. Test Verification', content: `${manifest.verifiedTestSuitesCount} suites and ${manifest.verifiedTotalTestsCount} individual tests are recorded in the manifest.` },
            { title: '3. Release Checklist', content: `${releaseCert.checklistPassedCount} / ${releaseCert.checklistTotalCount} checks passed. ${releaseChecklist.filter((item) => !item.passed).map((item) => item.description).join('; ') || 'No checklist blockers recorded.'}` },
            { title: '4. Real-Field Connectivity', content: `${manifest.realFieldConnectivityStatus}. ${releaseCert.warnings.join('\n') || 'No connectivity warnings recorded.'}` },
            { title: '5. Engineering Limitations', content: manifest.limitations.join('\n') },
          ],
          rawState: releaseCert,
          markdown: releaseMarkdown,
        };
    }
  };

  const activeReport = getActiveReportData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulation Reports & Engineering Documentation"
        subtitle="Dynamic live scenario report, exportable engineering summaries, audit traces, and release certificates"
        badgeText="Step 6.2 Certified Workstation"
      />

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setSelectedReportKey('live-simulation')}
          className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
            selectedReportKey === 'live-simulation'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Live Simulation Report</span>
        </button>

        <button
          onClick={() => setSelectedReportKey('scenario-comparison')}
          className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
            selectedReportKey === 'scenario-comparison'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>Scenario Comparison Report</span>
        </button>

        <button
          onClick={() => setSelectedReportKey('historical-validation')}
          className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
            selectedReportKey === 'historical-validation'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>Historical Validation Report</span>
        </button>

        <button
          onClick={() => setSelectedReportKey('final-validation')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            selectedReportKey === 'final-validation'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Final Validation Package
        </button>

        <button
          onClick={() => setSelectedReportKey('assessment')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            selectedReportKey === 'assessment'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Final Engineering Assessment
        </button>

        <button
          onClick={() => setSelectedReportKey('pilot')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            selectedReportKey === 'pilot'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Production Pilot Audit
        </button>

        <button
          onClick={() => setSelectedReportKey('release-freeze')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            selectedReportKey === 'release-freeze'
              ? 'bg-sky-900 text-sky-200 border border-sky-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Release & Freeze Manifest
        </button>
      </div>

      {/* Main Report View Panel */}
      <Panel
        title={activeReport.title}
        subtitle={`ID: ${activeReport.id} | Generated: ${activeReport.timestamp}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadText(activeReport.markdown, `${activeReport.id}.md`)}
              className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 font-mono text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Markdown (.md)
            </button>
            <button
              onClick={() => handleDownloadJSON(activeReport.rawState, `${activeReport.id}.json`)}
              className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700 font-mono text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              JSON (.json)
            </button>
          </div>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          {/* Status Header */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-slate-400 text-xs">Report Status Determination:</span>
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
              activeReport.status.includes('OPTIMAL') || activeReport.status.includes('READY') || activeReport.status.includes('PASSED')
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {activeReport.status}
            </span>
          </div>

          {/* Report Content Sections */}
          <div className="space-y-3">
            {activeReport.sections.map((section, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="text-slate-300 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded text-amber-200 text-xs font-sans">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mandated Safety Disclaimer</span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              {activeReport.disclaimer}
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
