import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { FileText, Download, ShieldCheck, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { executeFinalValidation } from '../simulation/finalValidation/finalValidationEngine';
import { generateFinalReport } from '../simulation/finalValidation/finalReportEngine';
import { executeFinalEngineeringAssessment } from '../simulation/finalEngineeringAssessment/finalAssessmentEngine';
import { generateAssessmentReport } from '../simulation/finalEngineeringAssessment/assessmentReportEngine';
import { executeProductionPilotWorkflow } from '../simulation/productionPilot/pilotWorkflowEngine';
import { generatePilotReport } from '../simulation/productionPilot/pilotReportEngine';
import { executeReleaseVerification } from '../release/releaseVerification';
import { evaluateReleaseChecklist } from '../release/releaseChecklist';
import { generateReleaseManifest } from '../release/releaseManifest';

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

import { useScenarioStore } from '../simulation/scenario/scenarioStore';

export const ReportsPage: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const [selectedReportKey, setSelectedReportKey] = useState<
    'final-validation' | 'assessment' | 'pilot' | 'release-freeze'
  >('final-validation');

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
        subtitle="Exportable engineering reports, executive summaries, audit traces, and release certificates"
        badgeText="Step 6.2 Certified Workstation"
      />

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <button
          onClick={() => setSelectedReportKey('final-validation')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            selectedReportKey === 'final-validation'
              ? 'bg-slate-900 border-sky-500 text-sky-300 ring-1 ring-sky-500'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">STEP 5.13 REPORT</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-bold text-slate-100">Final Validation</div>
          <div className="text-[10px] text-slate-500 mt-1">22-section engineering trace</div>
        </button>

        <button
          onClick={() => setSelectedReportKey('assessment')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            selectedReportKey === 'assessment'
              ? 'bg-slate-900 border-sky-500 text-sky-300 ring-1 ring-sky-500'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">STEP 5.12 REPORT</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-slate-100">Engineering Assessment</div>
          <div className="text-[10px] text-slate-500 mt-1">15 traceable findings</div>
        </button>

        <button
          onClick={() => setSelectedReportKey('pilot')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            selectedReportKey === 'pilot'
              ? 'bg-slate-900 border-sky-500 text-sky-300 ring-1 ring-sky-500'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">STEP 5.11 REPORT</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-bold text-slate-100">Production Pilot</div>
          <div className="text-[10px] text-slate-500 mt-1">8 pilot scenario matrix</div>
        </button>

        <button
          onClick={() => setSelectedReportKey('release-freeze')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            selectedReportKey === 'release-freeze'
              ? 'bg-slate-900 border-sky-500 text-sky-300 ring-1 ring-sky-500'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">STEP 6.2 CERTIFICATE</span>
            <FileCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-bold text-slate-100">Release Freeze Cert</div>
          <div className="text-[10px] text-slate-500 mt-1">484/484 verified test audit</div>
        </button>
      </div>

      {/* Active Report Header & Action Panel */}
      <Panel title={activeReport.title}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <span>REPORT ID:</span>
                <span className="font-bold text-slate-200">{activeReport.id}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>GENERATED:</span>
                <span className="text-slate-300">{activeReport.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-bold text-sky-400 uppercase">
                {activeReport.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadText(activeReport.markdown, `${activeReport.id}.md`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-sky-950 border border-sky-800 text-sky-300 hover:bg-sky-900 font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Markdown (.md)</span>
              </button>
              <button
                onClick={() => handleDownloadJSON(activeReport.rawState, `${activeReport.id}.json`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Data</span>
              </button>
            </div>
          </div>

          {/* Mandatory Advisory Governance Box */}
          <div className="flex items-start gap-3 p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs font-mono text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Safety & Advisory Governance</span>
              <span>{activeReport.disclaimer}</span>
            </div>
          </div>

          {/* Report Sections Content Preview */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            {activeReport.sections.map((sec, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2">
                <h4 className="font-bold text-sky-300 text-sm border-b border-slate-800 pb-1">
                  {sec.title}
                </h4>
                <p className="text-slate-300 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
};
