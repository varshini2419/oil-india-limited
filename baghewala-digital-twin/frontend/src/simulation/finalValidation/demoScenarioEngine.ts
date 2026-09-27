import type { DemoScenario } from './types';
import { createScenario } from '../scenario/scenarioEngine';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';
import { evaluateRiskModel } from '../riskEngine/riskModel';

import type { ScenarioInputValues } from '../scenario/types';

export function generateDemoScenarios(activeInputs?: ScenarioInputValues): DemoScenario[] {
  const scenarios: DemoScenario[] = [];

  // Helper to run full physics pipeline
  const runPipeline = (title: string, desc: string, inputs: {
    reservoirTemperatureC: number;
    reservoirPressureBar: number;
    steamRateTpd: number;
    vfdFrequencyHz: number;
    spm: number;
    strokeLengthMeters: number;
    effectiveDrawdownBar: number;
    permeabilityD: number;
  }) => {
    const scenarioObj = createScenario(title, desc, {
      ...BASELINE_INPUT_VALUES,
      ambientTemperatureC: 40,
      reservoirTemperatureC: inputs.reservoirTemperatureC,
      reservoirPressureBar: inputs.reservoirPressureBar,
      permeabilityDarcy: inputs.permeabilityD,
      steamInjectionRateTpd: inputs.steamRateTpd,
      steamQualityPercent: 80,
      soakDurationDays: 3,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
    });

    const thermal = calculateThermalModel(scenarioObj);
    const tempC = thermal.predictedReservoirTemperatureC;
    const visc = calculateViscosityModel(tempC);
    const mob = calculateMobilityModel(visc.estimatedViscosityCp, tempC, inputs.permeabilityD);

    const prod = calculateProductionModel(
      mob.mobilityDcP,
      tempC,
      visc.estimatedViscosityCp,
      inputs.effectiveDrawdownBar,
      inputs.vfdFrequencyHz,
      inputs.spm,
      inputs.strokeLengthMeters
    );

    const srpLoadIndex = Math.min(100, Math.max(10, (inputs.vfdFrequencyHz / 50) * (inputs.spm / 10) * 78.5));

    const risk = evaluateRiskModel({
      temperatureC: tempC,
      viscosityCp: visc.estimatedViscosityCp,
      mobilityDPerCp: mob.mobilityDcP,
      productionBopd: prod.estimatedProductionBopd,
      vfdFrequencyHz: inputs.vfdFrequencyHz,
      spm: inputs.spm,
      strokeLengthMeters: inputs.strokeLengthMeters,
      steamInjectionRateTpd: inputs.steamRateTpd,
      srpLoadIndex,
      cssThermalGainC: tempC - inputs.reservoirTemperatureC,
    });

    const p50 = prod.estimatedProductionBopd;
    const p10 = p50 * 0.6;
    const p90 = p50 * 1.7;

    return {
      tempC,
      viscCp: visc.estimatedViscosityCp,
      mobDcP: mob.mobilityDcP,
      prodBopd: prod.estimatedProductionBopd,
      srpLoadIndex,
      cssGainC: tempC - inputs.reservoirTemperatureC,
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      p10,
      p50,
      p90,
      riskSummary: `Risk Score: ${risk.riskScore}/100 (${risk.riskLevel})`,
    };
  };

  // 1. SCENARIO 1: Active Operating Baseline
  const s1Inputs = activeInputs
    ? {
        reservoirTemperatureC: activeInputs.reservoirTemperatureC,
        reservoirPressureBar: 45,
        steamRateTpd: activeInputs.steamInjectionRateTpd,
        vfdFrequencyHz: activeInputs.vfdFrequencyHz,
        spm: activeInputs.spm,
        strokeLengthMeters: activeInputs.strokeLengthMeters,
        effectiveDrawdownBar: 20,
        permeabilityD: 2.5,
      }
    : { reservoirTemperatureC: 58, reservoirPressureBar: 45, steamRateTpd: 100, vfdFrequencyHz: 45, spm: 8.5, strokeLengthMeters: 2.5, effectiveDrawdownBar: 20, permeabilityD: 2.5 };

  const s1 = runPipeline('Scenario 1', 'Active Operating Baseline', s1Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-01',
    title: 'Scenario 1: Active Operating Baseline',
    description: 'Active operational state evaluated from current scenario parameters.',
    inputs: s1Inputs,
    temperatureC: s1.tempC,
    viscosityCp: s1.viscCp,
    mobilityDcP: s1.mobDcP,
    productionBopd: s1.prodBopd,
    srpLoadIndex: s1.srpLoadIndex,
    cssThermalGainC: s1.cssGainC,
    riskLevel: s1.riskLevel,
    riskScore: s1.riskScore,
    p10Bopd: s1.p10,
    p50Bopd: s1.p50,
    p90Bopd: s1.p90,
    decisionSupportSummary: 'Active operating point. Maintain current steam injection and pump operating speed.',
  });

  // 2. SCENARIO 2: High-viscosity condition
  const s2Inputs = { reservoirTemperatureC: 48, reservoirPressureBar: 45, steamRateTpd: 0, vfdFrequencyHz: 45, spm: 8.5, strokeLengthMeters: 2.5, effectiveDrawdownBar: 20, permeabilityD: 2.5 };
  const s2 = runPipeline('Scenario 2', 'Unheated High-Viscosity', s2Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-02',
    title: 'Scenario 2: Unheated High-Viscosity Inflow Impedance',
    description: 'Cool reservoir temperature (48°C) causing crude viscosity spike above 10,000 cP and severe inflow restriction.',
    inputs: s2Inputs,
    temperatureC: s2.tempC,
    viscosityCp: s2.viscCp,
    mobilityDcP: s2.mobDcP,
    productionBopd: s2.prodBopd,
    srpLoadIndex: s2.srpLoadIndex,
    cssThermalGainC: s2.cssGainC,
    riskLevel: s2.riskLevel,
    riskScore: s2.riskScore,
    p10Bopd: s2.p10,
    p50Bopd: s2.p50,
    p90Bopd: s2.p90,
    decisionSupportSummary: 'High viscosity warning. Recommended Action: Conduct CSS steam thermal injection cycle to lower viscosity.',
  });

  // 3. SCENARIO 3: Low reservoir pressure
  const s3Inputs = { reservoirTemperatureC: 58, reservoirPressureBar: 30, steamRateTpd: 100, vfdFrequencyHz: 45, spm: 8.5, strokeLengthMeters: 2.5, effectiveDrawdownBar: 10, permeabilityD: 2.5 };
  const s3 = runPipeline('Scenario 3', 'Low Reservoir Pressure', s3Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-03',
    title: 'Scenario 3: Low Reservoir Pressure & Drawdown Depletion',
    description: 'Depleted reservoir pressure limiting effective drawdown to 10 bar, reducing fluid inflow rate.',
    inputs: s3Inputs,
    temperatureC: s3.tempC,
    viscosityCp: s3.viscCp,
    mobilityDcP: s3.mobDcP,
    productionBopd: s3.prodBopd,
    srpLoadIndex: s3.srpLoadIndex,
    cssThermalGainC: s3.cssGainC,
    riskLevel: s3.riskLevel,
    riskScore: s3.riskScore,
    p10Bopd: s3.p10,
    p50Bopd: s3.p50,
    p90Bopd: s3.p90,
    decisionSupportSummary: 'Low drawdown pressure. Recommended Action: Adjust SRP stroke speed to prevent fluid pound or pump cavitation.',
  });

  // 4. SCENARIO 4: Thermal/CSS intervention scenario
  const s4Inputs = { reservoirTemperatureC: 58, reservoirPressureBar: 45, steamRateTpd: 180, vfdFrequencyHz: 45, spm: 8.5, strokeLengthMeters: 2.5, effectiveDrawdownBar: 20, permeabilityD: 2.5 };
  const s4 = runPipeline('Scenario 4', 'CSS Thermal Boost', s4Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-04',
    title: 'Scenario 4: High-Rate CSS Thermal Injection Boost',
    description: 'High steam rate (180 tpd) heating reservoir to ~76°C, dropping crude viscosity to ~600 cP and boosting production.',
    inputs: s4Inputs,
    temperatureC: s4.tempC,
    viscosityCp: s4.viscCp,
    mobilityDcP: s4.mobDcP,
    productionBopd: s4.prodBopd,
    srpLoadIndex: s4.srpLoadIndex,
    cssThermalGainC: s4.cssGainC,
    riskLevel: s4.riskLevel,
    riskScore: s4.riskScore,
    p10Bopd: s4.p10,
    p50Bopd: s4.p50,
    p90Bopd: s4.p90,
    decisionSupportSummary: 'High thermal response. Optimal production inflow achieved while maintaining mechanical rod load bounds.',
  });

  // 5. SCENARIO 5: SRP operating change
  const s5Inputs = { reservoirTemperatureC: 58, reservoirPressureBar: 45, steamRateTpd: 100, vfdFrequencyHz: 55, spm: 11.5, strokeLengthMeters: 2.8, effectiveDrawdownBar: 20, permeabilityD: 2.5 };
  const s5 = runPipeline('Scenario 5', 'SRP Mechanical Load Testing', s5Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-05',
    title: 'Scenario 5: High-Speed SRP Mechanical Load Testing',
    description: 'Elevated VFD drive frequency (55 Hz) and SPM speed (11.5) testing sucker rod mechanical load limits.',
    inputs: s5Inputs,
    temperatureC: s5.tempC,
    viscosityCp: s5.viscCp,
    mobilityDcP: s5.mobDcP,
    productionBopd: s5.prodBopd,
    srpLoadIndex: s5.srpLoadIndex,
    cssThermalGainC: s5.cssGainC,
    riskLevel: s5.riskLevel,
    riskScore: s5.riskScore,
    p10Bopd: s5.p10,
    p50Bopd: s5.p50,
    p90Bopd: s5.p90,
    decisionSupportSummary: 'SRP mechanical load index approaching caution threshold (~88%). Recommended Action: Reduce VFD frequency to 48 Hz.',
  });

  // 6. SCENARIO 6: Elevated operational risk
  const s6Inputs = { reservoirTemperatureC: 45, reservoirPressureBar: 45, steamRateTpd: 0, vfdFrequencyHz: 60, spm: 13.0, strokeLengthMeters: 3.0, effectiveDrawdownBar: 20, permeabilityD: 2.5 };
  const s6 = runPipeline('Scenario 6', 'Adverse Combined Risk', s6Inputs);
  scenarios.push({
    scenarioId: 'DEMO-SCENARIO-06',
    title: 'Scenario 6: Adverse Combined Viscosity Spike & High Rod Stress',
    description: 'Unheated reservoir crude combined with excessive pumping speed triggering multi-variable AI risk warning.',
    inputs: s6Inputs,
    temperatureC: s6.tempC,
    viscosityCp: s6.viscCp,
    mobilityDcP: s6.mobDcP,
    productionBopd: s6.prodBopd,
    srpLoadIndex: s6.srpLoadIndex,
    cssThermalGainC: s6.cssGainC,
    riskLevel: s6.riskLevel,
    riskScore: s6.riskScore,
    p10Bopd: s6.p10,
    p50Bopd: s6.p50,
    p90Bopd: s6.p90,
    decisionSupportSummary: 'Elevated operational risk level. Multi-variable advisory triggers priority intervention recommendations.',
  });

  return scenarios;
}
