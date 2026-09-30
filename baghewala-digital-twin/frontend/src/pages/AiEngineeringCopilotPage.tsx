import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import {
  Sparkles,
  Send,
  Activity,
} from 'lucide-react';
import { useScenarioStore } from '../simulation/scenario';
import { buildFullEngineeringDecisionContext, analyzeWhyStateChanged } from '../simulation/copilot/decisionTraceEngine';
import { processCopilotEngineeringQuery, type CopilotQueryAnswer } from '../simulation/copilot/copilotQueryEngine';
import { buildScenarioComparisonMatrix } from '../simulation/scenarios/scenarioComparisonEngine';
import { evaluateDataGapPriorities } from '../simulation/copilot/dataGapPriorityEngine';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const AiEngineeringCopilotPage: React.FC = () => {
  useDocumentTitle({
    title: "AI Engineering Copilot",
    description:
      "Explainable AI decision trace grounded in RAG historical evidence.",
  });
  const { activeScenario, presets, savedScenarios, updateInput } = useScenarioStore();

  const allScenarios = useMemo(() => [...presets, ...savedScenarios], [presets, savedScenarios]);
  const previousScenario = useMemo(() => presets[0] || activeScenario, [presets, activeScenario]);

  // Full Copilot Context
  const context = useMemo(
    () => buildFullEngineeringDecisionContext(activeScenario),
    [activeScenario]
  );

  // Scenario Comparison Matrix for Advisor
  const matrix = useMemo(
    () => buildScenarioComparisonMatrix(allScenarios),
    [allScenarios]
  );

  // Data Gap Prioritization
  const prioritizedGaps = useMemo(
    () => evaluateDataGapPriorities(undefined, context.riskOutputs.riskLevel),
    [context.riskOutputs.riskLevel]
  );

  // Query State
  const [queryInput, setQueryInput] = useState<string>('');
  const [activeAnswer, setActiveAnswer] = useState<CopilotQueryAnswer | null>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{ time: string; query: string; summary: string }>>([]);

  // "WHY DID THIS CHANGE?" State
  const [showWhyChanged, setShowWhyChanged] = useState<boolean>(false);
  const whyChangedDeltas = useMemo(
    () => analyzeWhyStateChanged(previousScenario, activeScenario),
    [previousScenario, activeScenario]
  );

  const handleExecuteQuery = (textToRun?: string) => {
    const text = (textToRun || queryInput).trim();
    if (!text) return;

    const ans = processCopilotEngineeringQuery(text, activeScenario);
    setActiveAnswer(ans);

    // Apply Command Side-Effect if Matched
    if (ans.matchedCommand?.type === 'SET_TEMP' && ans.matchedCommand.targetValue) {
      updateInput('reservoirTemperatureC', ans.matchedCommand.targetValue);
    } else if (ans.matchedCommand?.type === 'SET_SPM' && ans.matchedCommand.targetValue) {
      updateInput('spm', ans.matchedCommand.targetValue);
    }

    // Add to History
    setQueryHistory((prev) => [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        query: text,
        summary: ans.sections[0].content,
      },
      ...prev.slice(0, 9),
    ]);

    if (!textToRun) setQueryInput('');
  };

  const presetQueries = [
    'What happens if reservoir temperature increases to 70°C?',
    'What happens if SPM is increased to 15?',
    'Compare thermal improvement with high SPM.',
    'What is causing the current risk?',
    'Which constraint is currently active?',
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <PageHeader
        title="BAGHEWALA AI ENGINEERING COPILOT"
        subtitle="Explainable decision support over the Digital Twin, historical evidence, constraints and uncertainty"
        badgeText="AI Engineering Command Center"
      />

      {/* TOP WELL STATE & LIVE PHYSICS SUMMARY */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-100 text-sm">Active Scenario: {activeScenario.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
              context.constraintResult.status === 'FEASIBLE'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              Status: {context.constraintResult.status}
            </span>

            <button
              onClick={() => setShowWhyChanged(!showWhyChanged)}
              className="px-3 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>WHY DID THIS CHANGE?</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-mono">
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">Reservoir Temp</span>
            <strong className="text-rose-400 text-sm">{context.inputs.reservoirTemperatureC} °C</strong>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">Viscosity</span>
            <strong className="text-purple-300 text-sm">{context.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</strong>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">Mobility (k/μ)</span>
            <strong className="text-sky-300 text-sm">{context.mobilityOutputs.mobilityDcP.toFixed(4)} D/cP</strong>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">Production</span>
            <strong className="text-emerald-400 text-sm">{context.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</strong>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">SRP Load Index</span>
            <strong className="text-amber-400 text-sm">{context.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</strong>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-[9px] block uppercase">System Risk Score</span>
            <strong className="text-slate-100 text-sm">{context.riskOutputs.riskScore} / 100 ({context.riskOutputs.riskLevel})</strong>
          </div>
        </div>
      </div>

      {/* "WHY DID THIS CHANGE?" PANEL / MODAL */}
      {showWhyChanged && (
        <Panel
          title="WHY DID THIS CHANGE? — Scenario Parameter Delta Analyzer"
          subtitle="Compares previous vs current scenario inputs and traces physical mechanism response"
        >
          {whyChangedDeltas.length === 0 ? (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-400 text-xs">
              No parameter changes detected relative to baseline. Modify reservoir temperature, steam rate, or SPM to view dynamic causal trace.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {whyChangedDeltas.map((d, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <strong className="text-sky-300">{d.parameterName} Changed</strong>
                    <span className="text-emerald-400 font-bold">{d.previousValue} → {d.currentValue} (Delta: {d.delta})</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase">Affected Physics Model:</span>
                    {d.affectedModel}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase">Intermediate Physics Effect:</span>
                    {d.intermediatePhysicsChange}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase">Final Output Delta:</span>
                    {d.finalOutputChange}
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-sky-200 font-sans text-xs border border-slate-800">
                    <strong>Causal Explanation:</strong> {d.causalExplanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* NATURAL LANGUAGE QUERY BOX & PRESET COMMANDS */}
      <Panel
        title="Natural Language Engineering Query Input"
        subtitle="Ask supported engineering questions or execute parameter commands"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
              placeholder="e.g. What happens if reservoir temperature increases to 70°C?"
              className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleExecuteQuery()}
              className="px-4 py-2 rounded bg-sky-900 hover:bg-sky-800 text-sky-100 font-bold border border-sky-700 flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>SUBMIT</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Preset Queries:</span>
            {presetQueries.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteQuery(pq)}
                className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono transition-colors"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* STRUCTURED COPILOT ANSWER VIEW (IF ACTIVE) */}
      {activeAnswer && (
        <Panel title={`Copilot Response: "${activeAnswer.question}"`}>
          <div className="space-y-3 font-mono text-xs">
            {activeAnswer.sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-sky-300 font-bold text-[11px] uppercase tracking-wider">{sec.title}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-amber-300 border border-slate-800">
                    [{sec.sourceTag}]
                  </span>
                </div>
                <div className="text-slate-300 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 1. EXPLAINABLE CAUSAL CHAIN VISUALIZATION */}
      <Panel title="Explainable Causal Chain (WHY THIS STATE?)">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {context.causalChain.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5 relative">
              <div className="text-[9px] text-slate-500 font-bold uppercase">{item.stage}</div>
              <div className="font-bold text-slate-200 text-xs truncate">{item.parameter}</div>
              <div className="text-sky-300 font-bold text-xs">{item.value}</div>
              <div className="text-[9px] text-slate-400 font-sans line-clamp-2">{item.description}</div>
              <div className="mt-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold">
                  [{item.sourceTag}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 2. 9-STEP ENGINEERING DECISION TRACE */}
      <Panel title="Structured 9-Step Engineering Decision Trace">
        <div className="space-y-2 font-mono text-xs">
          {context.decisionTrace.map((st) => (
            <div key={st.stepNumber} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-400 text-xs">{st.stepName}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    st.status === 'COMPLETE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : (st.status === 'VIOLATED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400 border border-slate-800')
                  }`}>
                    {st.status}
                  </span>
                  <span className="text-[8px] text-amber-300 font-bold">[{st.sourceTag}]</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{st.explanation}</div>
                <div className="text-[10px] text-slate-400">Evidence: {st.evidence}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 3. SCENARIO ADVISOR PANEL */}
      <Panel title="Scenario Advisor (Multi-Scenario Classification & Trade-Offs)">
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrix.snapshots.map((snap) => {
              const isFeasible = snap.constraintResult.status === 'FEASIBLE';
              return (
                <div
                  key={snap.scenarioId}
                  className={`p-3.5 rounded-lg border space-y-2.5 ${
                    isFeasible ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/20 border-rose-900/60'
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
                    <strong className="text-slate-100 font-bold">{snap.scenarioName}</strong>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isFeasible ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {snap.constraintResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>Prod: <strong className="text-emerald-400">{snap.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</strong></div>
                    <div>Viscosity: <strong className="text-purple-300">{snap.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</strong></div>
                    <div>Load Index: <strong className="text-amber-400">{snap.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</strong></div>
                    <div>Risk: <strong className="text-slate-200">{snap.riskOutputs.riskLevel}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-sans border-t border-slate-800/80 pt-1.5">
                    Trade-off: {snap.constraintResult.tradeoffs[0] || 'Standard envelope.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* 4. RAG HISTORICAL EVIDENCE & UNCERTAINTY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Grounded RAG Panel */}
        <Panel
          title="Grounded Historical RAG Evidence"
          subtitle="Persistent safety posture: HISTORICAL EVIDENCE — NOT A PREDICTION"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 text-[10px] font-sans">
              <strong>HISTORICAL EVIDENCE — NOT A PREDICTION:</strong> Grounded SPE/SHARP D4.1 records provide historical reference context.
            </div>

            {context.ragEvidence.map((ev, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-sky-300 text-xs">
                  <span>[{ev.category}] {ev.title}</span>
                  <span className="text-[9px] text-slate-400">Page {ev.provenance?.page ?? 'N/A'}</span>
                </div>
                <div className="text-[10px] text-slate-400">Document: {ev.provenance?.document ?? 'SHARP D4.1'} | Source: {ev.provenance?.source ?? 'Oil India'}</div>
                <div className="text-slate-300 font-sans text-xs">{ev.currentMatch?.explanation ?? 'Historical reference record'}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Data Gap Prioritization */}
        <Panel title="Prioritized Field Data Knowledge Gaps">
          <div className="space-y-2.5 font-mono text-xs">
            {prioritizedGaps.map((gap) => (
              <div key={gap.id} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-200 text-xs">{gap.title}</strong>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    gap.priority === 'HIGH PRIORITY'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : (gap.priority === 'MEDIUM PRIORITY' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400 border border-slate-800')
                  }`}>
                    {gap.priority}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">{gap.documentedGap}</div>
                <div className="text-[9px] text-slate-500">Source: {gap.sourceDocument} ({gap.sourcePage})</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 5. NON-ACTUATING ENGINEERING ADVISORIES */}
      <Panel title="Non-Actuating Engineering Decision-Support Advisories">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {context.advisories.map((adv) => (
            <div key={adv.id} className="p-3.5 bg-slate-950 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-sky-300 border border-slate-800">
                  [{adv.category}] {adv.title}
                </span>
                <span className="text-[9px] text-amber-300 font-bold">[{adv.sourceTag}]</span>
              </div>
              <div className="text-slate-200 font-sans text-xs leading-relaxed">{adv.recommendation}</div>
              <div className="text-[10px] text-slate-400 font-mono">Rationale: {adv.rationale}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* QUERY HISTORY LIST */}
      {queryHistory.length > 0 && (
        <Panel title="Recent Engineering Queries History">
          <div className="space-y-2 font-mono text-xs">
            {queryHistory.map((qh, i) => (
              <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-slate-200 text-xs">[{qh.time}] "{qh.query}"</strong>
                  <div className="text-[10px] text-slate-400 truncate max-w-xl">{qh.summary}</div>
                </div>
                <button
                  onClick={() => handleExecuteQuery(qh.query)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-bold"
                >
                  RE-RUN
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};
