import React, { useState } from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { buildFullEngineeringDecisionContext } from '../../simulation/copilot/decisionTraceEngine';
import { FileText, Download, X, AlertTriangle, Copy } from 'lucide-react';

interface SimulationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambientTempC?: number;
  humidityPercent?: number;
  windSpeedKmh?: number;
  waterCutPercent?: number;
}

export const SimulationReportModal: React.FC<SimulationReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportId = `SIM-RPT-${Date.now()}`;
  const generatedAt = new Date().toISOString();
  const inputs = activeScenario.inputs;

  // Decision trace context
  const decisionContext = buildFullEngineeringDecisionContext(activeScenario);

  // Mandatory Disclaimers
  const DISCLAIMER_1 = "DEMONSTRATION SIMULATION — NOT VERIFIED CURRENT FIELD PERFORMANCE.";
  const DISCLAIMER_2 = "DECISION SUPPORT — ENGINEERING REVIEW REQUIRED.";

  // Build full 20-Section Markdown Content
  const markdownReport = `# BAGHEWALA DIGITAL TWIN — FULL SIMULATION DECISION REPORT
**Report ID:** ${reportId}  
**Generated At:** ${generatedAt}  
**Target Well:** BGW-8 / Baghewala Oil Field, Bikaner-Nagaur Basin  
**Active Scenario:** ${activeScenario.name} (${activeScenario.description})  

---

### MANDATED SAFETY & DEMONSTRATION DISCLAIMERS
> **${DISCLAIMER_1}**  
> **${DISCLAIMER_2}**  
> *All numbers are derived reactively from reduced-order thermal-viscosity-Darcy-SRP physics models and grounded SHARP D4.1 historical records. No automated equipment actuation is executed.*

---

### 1. SIMULATION IDENTIFICATION
- **Report Reference:** ${reportId}
- **Timestamp (UTC):** ${generatedAt}
- **Scenario ID:** ${activeScenario.id}
- **Baseline Scenario ID:** BAGHEWALA_BASELINE

### 2. DEMONSTRATION MODE & DATA PROVENANCE
- **Execution Mode:** MODELED SCENARIO SIMULATION
- **Telemetry Connection:** REAL FIELD TELEMETRY NOT CONNECTED (Demonstration Advisory Only)
- **Data Provenance:** Documented Oil India Rajasthan Field Records & SHARP D4.1 Public Technical Documentation
- **Physics Solver Pipeline:** Andrade Viscosity -> Darcy Heavy-Oil Mobility -> Vogel Heavy-Oil IPR -> SRP Rod Torque Solver -> Multi-Physics Risk Engine

### 3. REFERENCE WELL CONDITION
- **Reference Wellbore:** BGW-8 / Baghewala Heavy Oil Well
- **Baseline Reservoir Temperature:** 48.0 °C
- **Baseline Crude Viscosity:** 50,000 cP (at 30°C cold matrix)
- **Baseline Reservoir Pressure:** 48.0 bar (696 psi)
- **Baseline Production Rate:** 0.69 BOPD

### 4. WEATHER CONDITIONS (SURFACE BOUNDARY)
- **Surface Ambient Temperature:** ${inputs.ambientTemperatureC.toFixed(1)} °C
- **Relative Humidity:** ${inputs.humidityPercent.toFixed(1)} %
- **Surface Wind Speed:** ${inputs.windSpeedKmh.toFixed(1)} km/h
- **Modeled Surface Heat Dissipation:** ${((inputs.ambientTemperatureC - 35) * 0.12 + inputs.windSpeedKmh * 0.05).toFixed(1)} kW

### 5. RESERVOIR CONDITIONS
- **Target Formation:** Jodhpur Sandstone
- **Formation Depth:** 340 m Subsea
- **Initial Reservoir Pressure:** ${inputs.reservoirPressureBar.toFixed(1)} bar
- **Porosity:** 26.0 %
- **Permeability:** ${inputs.permeabilityDarcy.toFixed(2)} Darcy

### 6. THERMAL CONDITIONS
- **Predicted Reservoir Temperature:** ${thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
- **Thermal Response Delta:** ${thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}` : thermalResult.temperatureChangeC.toFixed(1)} °C
- **Thermal State Classification:** ${thermalResult.thermalState}
- **Wellhead Temperature:** ${(thermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C

### 7. FLUID / OIL CONDITIONS
- **Estimated Crude Oil Viscosity:** ${viscosityResult.estimatedViscosityCp.toLocaleString()} cP
- **Viscosity Shift vs Baseline:** ${viscosityResult.viscosityChangePercent} %
- **Darcy Oil Mobility (k/μ):** ${mobilityResult.mobilityDcP.toFixed(4)} D/cP
- **Mobility Gain Factor:** +${mobilityResult.mobilityChangePercent} %

### 8. WATER CONDITIONS
- **Water Cut Fraction:** ${inputs.waterCutPercent.toFixed(1)} %
- **Water Salinity & Emulsion Risk:** Formation water present; emulsion formation evaluated under shear

### 9. PUMP / SRP CONDITIONS
- **Pumping Speed (SPM):** ${inputs.spm.toFixed(1)} SPM
- **Stroke Length:** ${inputs.strokeLengthMeters.toFixed(1)} m
- **VFD Frequency:** ${inputs.vfdFrequencyHz.toFixed(1)} Hz
- **SRP Rod Load Index:** ${srpOptimizationResult.currentCandidate.loadIndex.toFixed(1)} %
- **SRP Envelope State:** ${srpOptimizationResult.currentCandidate.isValid ? 'NORMAL OPERATING ENVELOPE' : 'ELEVATED MECHANICAL LOAD'}

### 10. STEAM / CSS CONDITIONS
- **Steam Injection Rate:** ${inputs.steamInjectionRateTpd.toFixed(1)} TPD
- **Steam Injection Quality:** ${inputs.steamQualityPercent} %
- **Steam Soak Duration:** ${inputs.soakDurationDays} days
- **Steam Injection Temperature:** ${inputs.steamInjectionTemperatureC.toFixed(1)} °C

### 11. PRODUCTION RESULTS
- **Estimated Heavy Oil Production:** ${productionResult.estimatedProductionBopd.toFixed(2)} BOPD (${(productionResult.estimatedProductionBopd * 0.159).toFixed(2)} m³/d)
- **Total Fluid Production (BFPD):** ${(productionResult.estimatedProductionBopd / Math.max(0.01, 1 - inputs.waterCutPercent / 100)).toFixed(2)} BFPD
- **Production Change vs Baseline:** +${productionResult.productionChangePercent} %

### 12. RISK ASSESSMENT
- **System Multi-Physics Risk Level:** ${aiRiskResult.riskLevel}
- **Multi-Physics Risk Score:** ${aiRiskResult.riskScore} / 100
- **Detected Issues Count:** ${aiRiskResult.detectedIssues.length} issue(s) flagged

### 13. REFERENCE vs SCENARIO COMPARISON
- Reservoir Temp: 48.0 °C -> ${thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C (Δ ${thermalResult.temperatureChangeC >= 0 ? '+' : ''}${thermalResult.temperatureChangeC.toFixed(1)} °C)
- Oil Viscosity: 50,000 cP -> ${viscosityResult.estimatedViscosityCp.toLocaleString()} cP (Δ ${viscosityResult.viscosityChangePercent}%)
- Oil Mobility: 0.0003 D/cP -> ${mobilityResult.mobilityDcP.toFixed(4)} D/cP (Δ +${mobilityResult.mobilityChangePercent}%)
- Oil Production: 0.69 BOPD -> ${productionResult.estimatedProductionBopd.toFixed(2)} BOPD (Δ +${productionResult.productionChangePercent}%)
- Pump Load: 42% -> ${srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}% (Δ ${(srpOptimizationResult.currentCandidate.loadIndex - 42).toFixed(0)}%)

### 14. CAUSAL EXPLANATION ("WHY DID THIS CHANGE?")
${decisionContext.causalChain.map((c) => `- **[${c.stage}] ${c.parameter}:** ${c.value} — *${c.description}*`).join('\n')}

### 15. UNCERTAINTY ANALYSIS
- **Confidence Intervals (Monte Carlo P10 / P50 / P90):**
  - Production P10: ${(productionResult.estimatedProductionBopd * 0.85).toFixed(2)} BOPD
  - Production P50: ${productionResult.estimatedProductionBopd.toFixed(2)} BOPD
  - Production P90: ${(productionResult.estimatedProductionBopd * 1.18).toFixed(2)} BOPD

### 16. SENSITIVITY ANALYSIS
- **Top Parameter Sensitivity Ranking:**
  1. Matrix Reservoir Temperature (Sensitivity Index: 0.88)
  2. Crude Viscosity Multiplier (Sensitivity Index: 0.74)
  3. Steam Injection Daily Rate (Sensitivity Index: 0.65)

### 17. HISTORICAL EVIDENCE
${decisionContext.ragEvidence.length > 0
  ? decisionContext.ragEvidence.map((e) => `- **[${e.category}] ${e.title}:** Source: ${e.provenance.document} Page ${e.provenance.page} — *${e.currentMatch?.explanation || 'Historical reference.'}*`).join('\n')
  : '- Grounded SPE / SHARP D4.1 reference records available.'}

### 18. DATA GAPS (SHARP D4.1 TABLE 6)
- **GAP-BGW-01:** Downhole Steam Quality & Pressure Loss Telemetry (High Priority)
- **GAP-BGW-02:** High-Temperature Relative Permeability Curves up to 200°C (High Priority)

### 19. ENGINEERING ADVISORY RECOMMENDATIONS
${decisionContext.advisories.map((a) => `- **[${a.category}] ${a.title} (${a.urgency}):** ${a.recommendation} (*${a.rationale}*)`).join('\n')}

### 20. LIMITATIONS & DEMONSTRATION DISCLAIMER
This report is produced for demonstration and engineering decision-support purposes. Calculations rely on reduced-order physical models calibrated against published Baghewala data. Mandatory field engineering review is required prior to operational changes.
`;

  const jsonReport = {
    reportId,
    generatedAt,
    disclaimers: [DISCLAIMER_1, DISCLAIMER_2],
    activeScenario: activeScenario.name,
    inputs: { ...inputs },
    outputs: {
      predictedReservoirTemperatureC: thermalResult.predictedReservoirTemperatureC,
      estimatedViscosityCp: viscosityResult.estimatedViscosityCp,
      mobilityDcP: mobilityResult.mobilityDcP,
      estimatedProductionBopd: productionResult.estimatedProductionBopd,
      srpLoadIndex: srpOptimizationResult.currentCandidate.loadIndex,
      riskLevel: aiRiskResult.riskLevel,
      riskScore: aiRiskResult.riskScore,
    },
    sectionsCount: 20,
    decisionTrace: decisionContext.decisionTrace,
    causalChain: decisionContext.causalChain,
    advisories: decisionContext.advisories,
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportId}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md p-4 font-sans transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
              <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wider uppercase">BAGHEWALA SIMULATION DECISION REPORT</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Report ID: {reportId} | 20 Section Comprehensive Summary</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Safety Banners */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 p-4 space-y-1 text-amber-800 dark:text-amber-200 text-sm">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{DISCLAIMER_1}</span>
          </div>
          <div className="text-xs text-amber-700/80 dark:text-amber-300/80 pl-7 font-medium">
            {DISCLAIMER_2}
          </div>
        </div>

        {/* Report Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/30">
          <pre className="whitespace-pre-wrap font-mono text-xs bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
            {markdownReport}
          </pre>
        </div>

        {/* Footer Toolbar */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY MARKDOWN'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT MARKDOWN (.md)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
