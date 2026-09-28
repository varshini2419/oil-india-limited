import { calculateThermalModel } from './thermal';
import { calculateViscosityModel } from './viscosity';
import { calculateMobilityModel } from './mobility';
import { calculateProductionModel } from './production';
import { optimizeSRP } from './srpOptimization';
import { optimizeCSS } from './cssOptimization';
import { analyzeAIRisk } from './riskEngine';
import { queryBaghewalaKnowledgeBase } from '../services/baghewalaRagEngine';
import { generateLiveSimulationReport } from './reports/liveSimulationReportEngine';
import { setLatestHistoricalIncidentStateForTest } from '../components/simulation/SimulationHistoricalIncidents';
import { loadBaseline, createScenario } from './scenario/scenarioEngine';
import type { Scenario } from './scenario/types';

export function testCompleteEndToEndFlow(): { success: boolean; logs: string[] } {
  const logs: string[] = [];
  let success = true;
  const log = (msg: string) => logs.push(msg);

  log('=== BAGHEWALA DIGITAL TWIN — COMPLETE END-TO-END FLOW VERIFICATION ===');

  try {
    // 1. Define Baseline Scenario
    const baselineScenario: Scenario = loadBaseline();

    // Calculate baseline physics
    const baseThermal = calculateThermalModel(baselineScenario);
    const baseViscosity = calculateViscosityModel(baseThermal.predictedReservoirTemperatureC, 48.0);
    const baseMobility = calculateMobilityModel(baseViscosity.estimatedViscosityCp, baseThermal.predictedReservoirTemperatureC, 1.2);
    const baseProduction = calculateProductionModel(baseMobility.mobilityDcP, baseThermal.predictedReservoirTemperatureC, baseViscosity.estimatedViscosityCp, 30.0, 50, 8.0, 3.4, 0.69, 34, 48.0);

    log('\n[STEP 1] Initialized Baseline Scenario Physics:');
    log(`  - Reservoir Temp: ${baseThermal.predictedReservoirTemperatureC}°C`);
    log(`  - Viscosity: ${baseViscosity.estimatedViscosityCp} cP`);
    log(`  - Production: ${baseProduction.estimatedProductionBopd.toFixed(2)} BOPD`);

    // 2. User Changes Parameters & Triggers RUN SIMULATION
    log('\n[STEP 2] User Changes Parameters (Thermal CSS + SRP Optimization) & Clicks RUN SIMULATION:');
    const modifiedScenario: Scenario = createScenario(
      'Commercial CSS Cycle 1 + High SPM Lift',
      'Thermal steam injection at 60 TPD, 310°C with 10.0 SPM lift',
      {
        ...baselineScenario.inputs,
        reservoirTemperatureC: 82.0,
        steamInjectionRateTpd: 60,
        steamQualityPercent: 75,
        soakDurationDays: 14,
        vfdFrequencyHz: 45,
        spm: 10.0,
        strokeLengthMeters: 3.4,
        steamInjectionTemperatureC: 310
      }
    );

    // Calculate modified scenario physics
    const modThermal = calculateThermalModel(modifiedScenario);
    const modViscosity = calculateViscosityModel(modThermal.predictedReservoirTemperatureC, baseThermal.predictedReservoirTemperatureC);
    const modMobility = calculateMobilityModel(modViscosity.estimatedViscosityCp, modThermal.predictedReservoirTemperatureC, 1.2, 1.0, baseViscosity.estimatedViscosityCp);
    const modProduction = calculateProductionModel(modMobility.mobilityDcP, modThermal.predictedReservoirTemperatureC, modViscosity.estimatedViscosityCp, 30.0, 45, 10.0, 3.4, baseProduction.estimatedProductionBopd, 34, 48.0);
    const modSrp = optimizeSRP({
      vfdFrequencyHz: 45,
      spm: 10.0,
      strokeLengthM: 3.4,
      oilMobilityDcp: modMobility.mobilityDcP,
      effectiveDrawdownBar: 30.0,
      temperatureC: modThermal.predictedReservoirTemperatureC,
      viscosityCp: modViscosity.estimatedViscosityCp
    });
    const modRisk = analyzeAIRisk({
      temperatureC: modThermal.predictedReservoirTemperatureC,
      viscosityCp: modViscosity.estimatedViscosityCp,
      mobilityDPerCp: modMobility.mobilityDcP,
      productionBopd: modProduction.estimatedProductionBopd,
      vfdFrequencyHz: 45,
      spm: 10.0,
      strokeLengthMeters: 3.4,
      steamInjectionRateTpd: 60,
      srpLoadIndex: modSrp.currentCandidate.loadIndex,
      cssThermalGainC: modThermal.thermalInfluenceC
    });

    log('  - Committed Physics Outputs Recalculated:');
    log(`    • Modeled Reservoir Temp: ${modThermal.predictedReservoirTemperatureC.toFixed(1)}°C (Thermal Gain: +${modThermal.thermalInfluenceC.toFixed(1)}°C)`);
    log(`    • Crude Viscosity: ${modViscosity.estimatedViscosityCp} cP (${modViscosity.viscosityChangePercent}% change)`);
    log(`    • Fluid Mobility: ${modMobility.mobilityDcP.toFixed(4)} D/cP (+${modMobility.mobilityChangePercent}%)`);
    log(`    • Estimated Production: ${modProduction.estimatedProductionBopd.toFixed(2)} BOPD (+${modProduction.productionChangePercent}%)`);
    log(`    • SRP Load Index: ${modSrp.currentCandidate.loadIndex.toFixed(1)} / 100`);
    log(`    • Operational Risk Level: ${modRisk.riskLevel} (${modRisk.riskScore}/100)`);

    if (modViscosity.estimatedViscosityCp >= baseViscosity.estimatedViscosityCp) {
      log('FAIL: Viscosity did not decrease with increased reservoir temperature.');
      success = false;
    } else {
      log('PASS: Physics outputs shifted reactively to parameter changes.');
    }

    // 3. System Automatically Constructs RAG Query & Queries Knowledge Base
    log('\n[STEP 3] System Automatically Constructs RAG Query from Scenario Physics & Retrieves Multimodal Evidence:');
    const queryParts = [
      `Baghewala historical field evidence associated with high steam injection temperature 310°C, viscosity reduction from ${baseViscosity.estimatedViscosityCp} cP to ${modViscosity.estimatedViscosityCp} cP, and pumping speed 10.0 SPM.`
    ];
    const queryStr = queryParts[0];
    log(`  - RAG Query String: "${queryStr}"`);

    const ragResponse = queryBaghewalaKnowledgeBase(queryStr, {
      reservoirTemp: modThermal.predictedReservoirTemperatureC,
      viscosity: modViscosity.estimatedViscosityCp,
      spm: 10.0,
      steamTemp: 310,
      currentRiskLevel: modRisk.riskLevel
    });

    if (!ragResponse.success) {
      log('FAIL: RAG query execution failed.');
      success = false;
    } else {
      log(`PASS: RAG Query executed successfully. Summary: "${ragResponse.summary}"`);
      log(`  - Grounded Text Evidence Items: ${ragResponse.evidence.length}`);
      log(`  - Multimodal Image Evidence Assets: ${ragResponse.imageEvidence?.length || 0}`);

      // Update global RAG state store (as done by SimulationHistoricalIncidents component)
      setLatestHistoricalIncidentStateForTest({
        incidents: ragResponse.events || [],
        evidence: ragResponse.evidence || [],
        imageEvidence: ragResponse.imageEvidence || [],
        knowledgeGaps: ragResponse.knowledgeGaps || [],
        disclaimer: ragResponse.disclaimer,
        query: queryStr,
        retrievedAt: new Date().toLocaleTimeString(),
        simulationContext: {
          reservoirTemp: modThermal.predictedReservoirTemperatureC,
          viscosity: modViscosity.estimatedViscosityCp,
          spm: 10.0
        },
        status: 'SUCCESS'
      });
    }

    // Check FIG-007 PNG asset retrieval
    const fig007Asset = ragResponse.imageEvidence?.find((img) => img.imageId === 'FIG-007');
    if (!fig007Asset || !fig007Asset.imageAvailable) {
      log('FAIL: FIG-007 real PNG asset was not retrieved or marked available.');
      success = false;
    } else {
      log(`PASS: Real PNG Asset Retrieved: [${fig007Asset.imageId}] ${fig007Asset.title}`);
      log(`  - URL: ${fig007Asset.imageUrl}`);
      log(`  - Document: ${fig007Asset.document} | Page: ${fig007Asset.page}`);
      log(`  - Extracted Pixel OCR: ${fig007Asset.extractedOcrText.slice(0, 75)}...`);
    }

    // 4. Pass Results into Report Engine & Generate Grounded Decision Report
    log('\n[STEP 4] Passing Results to Live Simulation Report Engine & Generating Grounded Report:');
    const modCss = optimizeCSS({
      steamInjectionRateTpd: 60,
      steamInjectionTemperatureC: 310,
      steamQualityFraction: 0.75,
      injectionDurationDays: 10,
      soakDurationDays: 14,
      productionDurationDays: 90,
      reservoirTemperatureC: 82.0,
      reservoirPressureBar: 48.0,
      baselineViscosityCp: baseViscosity.estimatedViscosityCp,
      baselineMobilityDPerCp: baseMobility.mobilityDcP,
      baselineProductionBopd: baseProduction.estimatedProductionBopd,
      vfdFrequencyHz: 45,
      spm: 10.0,
      strokeLengthMeters: 3.4
    });

    const reportData = generateLiveSimulationReport({
      activeScenario: modifiedScenario,
      thermalResult: modThermal,
      baselineThermalResult: baseThermal,
      viscosityResult: modViscosity,
      baselineViscosityResult: baseViscosity,
      mobilityResult: modMobility,
      baselineMobilityResult: baseMobility,
      productionResult: modProduction,
      baselineProductionResult: baseProduction,
      srpOptimizationResult: modSrp,
      cssOptimizationResult: modCss,
      aiRiskResult: modRisk
    });

    log(`  - Generated Report ID: ${reportData.reportId}`);
    log(`  - Disclaimer: "${reportData.disclaimer}"`);

    // Verify Sections in generated markdown
    const hasSectionE1 = reportData.markdownReport.includes('## E.1 GROUNDED HISTORICAL RAG EVIDENCE');
    const hasSectionE2 = reportData.markdownReport.includes('## E.2 MULTIMODAL IMAGE EVIDENCE & VISUAL GROUNDING');
    const hasFig007Citation = reportData.markdownReport.includes('FIG-007') && reportData.markdownReport.includes('sharp-d4.1-report-final.pdf');

    if (hasSectionE1 && hasSectionE2 && hasFig007Citation) {
      log('PASS: Report contains Section E.1, Section E.2, and explicit FIG-007 document/page citations.');
    } else {
      log(`FAIL: Missing sections or citations in generated report. E1: ${hasSectionE1}, E2: ${hasSectionE2}, FIG-007: ${hasFig007Citation}`);
      success = false;
    }

  } catch (err: unknown) {
    log(`FATAL ERROR IN COMPLETE END-TO-END FLOW TEST: ${err instanceof Error ? err.message : String(err)}`);
    success = false;
  }

  log(`\n=== FINAL RESULT: ${success ? 'COMPLETE END-TO-END SIMULATION & RAG FLOW PASSED' : 'TEST FAILED'} ===`);
  return { success, logs };
}

// Self-run if executed directly
const g = globalThis as unknown as { process?: { argv?: string[]; exit?: (code: number) => void } };
if (g.process?.argv?.[1]?.includes('testCompleteEndToEndFlow')) {
  const result = testCompleteEndToEndFlow();
  console.log(result.logs.join('\n'));
  if (!result.success && g.process?.exit) g.process.exit(1);
}
