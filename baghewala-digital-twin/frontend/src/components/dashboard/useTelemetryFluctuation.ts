import { useState, useEffect, useRef } from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { calculatePredictiveRisks } from '../predictiveMaintenance/RiskGauges';

export interface TelemetryState {
  // Operational Inputs
  steamRate: number;
  steamRateDelta: string;
  steamQuality: number;
  steamQualityDelta: string;
  steamTemp: number;
  spm: number;
  spmDelta: string;
  strokeM: number;
  vfdHz: number;

  // Thermal & Reservoir Response
  resTemp: number;
  resTempDelta: string;
  deltaTimestep: string;
  resPressure: number;
  heatInputMw: number;

  // Crude Viscosity & Mobility
  viscosity: number;
  viscosityDelta: string;
  mobility: number;
  mobilityDelta: string;

  // SRP Lift & Mechanical
  srpLoad: number;
  srpLoadDelta: string;
  peakRodLoad: number;
  fillagePct: number;
  stressIndex: number;
  fatigueIndex: number;
  cycleTimeSec: string;

  // Production Yield
  oilProd: number;
  oilProdDelta: string;
  totalFluid: number;
  waterCut: number;
  prodEfficiency: number;

  // Risk & Health (Slow Fluctuation 5-8 seconds ±0.5/±1.0)
  riskScore: number;
  riskScoreDelta: string;
  healthPct: number;
  healthPctDelta: string;

  // Thermal Balance Flow
  producedFluidTemp: number;
  deltaSteamRes: number;
  deltaResProduced: number;
  totalGradient: number;

  // Historical Rolling Buffer Data Series (15 Timesteps)
  resTempHistory: number[];
  srpLoadHistory: number[];
  oilProdHistory: number[];
  metricHistory: (metric: string) => { points: number[]; unit: string; color: string; val: number };
}

// Staggered delta sequences for step updates
const TEMP_DELTAS = [2.0, -1.0, 3.0, -2.0, 1.0, 2.0, -1.0, 1.5, -2.5];
const VISC_DELTAS = [-120, 90, -100, 70, -80, 110, -60, 90];
const STEAM_DELTAS = [2.0, -1.0, 3.0, -2.0, 1.0, -2.5, 2.0];
const QUAL_DELTAS = [1.0, -1.0, 2.0, -1.5, 1.0, -1.0];
const SPM_DELTAS = [0.5, -0.3, 0.6, -0.4, 0.3, -0.5];
const LOAD_DELTAS = [2.0, -1.0, 3.0, -2.0, 1.0, 2.0, -1.5];
const OIL_DELTAS = [0.03, -0.02, 0.04, -0.03, 0.02, -0.04];
const RISK_DELTAS = [0.5, -0.5, 1.0, -0.5, 0.5, -1.0];

export function useTelemetryFluctuation(): TelemetryState {
  const { committedSimulationResult, thermalResult, viscosityResult, mobilityResult, productionResult, srpOptimizationResult, aiRiskResult } = useScenarioStore();

  const inputs = committedSimulationResult.inputs;
  const curCandidate = srpOptimizationResult.currentCandidate;
  const baseRisks = calculatePredictiveRisks(curCandidate, aiRiskResult.riskScore);

  const baseSteam = inputs.steamInjectionRateTpd ?? 50;
  const baseQual = inputs.steamQualityPercent ?? 75;
  const baseSpm = inputs.spm ?? 8.0;
  const baseResTemp = thermalResult.predictedReservoirTemperatureC ?? inputs.reservoirTemperatureC;
  const baseViscosity = viscosityResult.estimatedViscosityCp ?? 5014.1;
  const baseMobility = mobilityResult.mobilityDcP ?? 0.0005;
  const baseLoad = curCandidate.loadIndex ?? 58;
  const baseOil = productionResult.estimatedProductionBopd ?? 0.75;
  const baseRisk = aiRiskResult.riskScore ?? 0;
  const baseHealth = baseRisks.overallHealthPct ?? 94;

  // Discrete target step states
  const [targetSteam, setTargetSteam] = useState(baseSteam);
  const [targetQual, setTargetQual] = useState(baseQual);
  const [targetSpm, setTargetSpm] = useState(baseSpm);
  const [targetTemp, setTargetTemp] = useState(baseResTemp);
  const [targetVisc, setTargetVisc] = useState(baseViscosity);
  const [targetMob, setTargetMob] = useState(baseMobility);
  const [targetLoad, setTargetLoad] = useState(baseLoad);
  const [targetOil, setTargetOil] = useState(baseOil);
  const [targetRisk, setTargetRisk] = useState(baseRisk);
  const [targetHealth, setTargetHealth] = useState(baseHealth);

  // Displayed lerped values
  const [displayedSteam, setDisplayedSteam] = useState(baseSteam);
  const [displayedQual, setDisplayedQual] = useState(baseQual);
  const [displayedSpm, setDisplayedSpm] = useState(baseSpm);
  const [displayedTemp, setDisplayedTemp] = useState(baseResTemp);
  const [displayedVisc, setDisplayedVisc] = useState(baseViscosity);
  const [displayedMob, setDisplayedMob] = useState(baseMobility);
  const [displayedLoad, setDisplayedLoad] = useState(baseLoad);
  const [displayedOil, setDisplayedOil] = useState(baseOil);
  const [displayedRisk, setDisplayedRisk] = useState(baseRisk);
  const [displayedHealth, setDisplayedHealth] = useState(baseHealth);

  // Rolling 15-timestep history buffers for live line charts
  const [tempHist, setTempHist] = useState<number[]>(() => Array(15).fill(baseResTemp));
  const [loadHist, setLoadHist] = useState<number[]>(() => Array(15).fill(baseLoad));
  const [oilHist, setOilHist] = useState<number[]>(() => Array(15).fill(baseOil));

  // Sequence indices
  const idxSteam = useRef(0);
  const idxQual = useRef(0);
  const idxSpm = useRef(0);
  const idxTemp = useRef(0);
  const idxVisc = useRef(0);
  const idxLoad = useRef(0);
  const idxOil = useRef(0);
  const idxRisk = useRef(0);

  // Target refs for lerp loop
  const targetsRef = useRef({
    steam: baseSteam,
    qual: baseQual,
    spm: baseSpm,
    temp: baseResTemp,
    visc: baseViscosity,
    mob: baseMobility,
    load: baseLoad,
    oil: baseOil,
    risk: baseRisk,
    health: baseHealth,
  });

  // Independent timers for each metric with 2-3s gap between consecutive value changes
  useEffect(() => {
    // Helper to schedule recursive timeout with 2-3s variation (default ~2.5s)
    const scheduleNext = (callback: () => void, minMs: number = 2300, maxMs: number = 2800) => {
      let timerId: ReturnType<typeof setTimeout>;
      const loop = () => {
        callback();
        const delay = minMs + Math.random() * (maxMs - minMs);
        timerId = setTimeout(loop, delay);
      };
      const initialDelay = minMs + Math.random() * (maxMs - minMs);
      timerId = setTimeout(loop, initialDelay);
      return () => clearTimeout(timerId);
    };

    // 1. Reservoir Temp: ~2.5s gap
    const cancelTemp = scheduleNext(() => {
      const delta = TEMP_DELTAS[idxTemp.current % TEMP_DELTAS.length];
      idxTemp.current++;
      const val = Number(Math.min(95, Math.max(35, baseResTemp + delta)).toFixed(1));
      setTargetTemp(val);
      targetsRef.current.temp = val;
      setTempHist((prev) => [...prev.slice(1), val]);
    }, 2300, 2800);

    // 2. Steam Injection Rate: ~2.6s gap
    const cancelSteam = scheduleNext(() => {
      const delta = STEAM_DELTAS[idxSteam.current % STEAM_DELTAS.length];
      idxSteam.current++;
      const val = Math.min(150, Math.max(20, baseSteam + delta));
      setTargetSteam(val);
      targetsRef.current.steam = val;
    }, 2400, 2900);

    // 3. Steam Quality: ~2.4s gap
    const cancelQual = scheduleNext(() => {
      const delta = QUAL_DELTAS[idxQual.current % QUAL_DELTAS.length];
      idxQual.current++;
      const val = Math.min(95, Math.max(50, baseQual + delta));
      setTargetQual(val);
      targetsRef.current.qual = val;
    }, 2200, 2700);

    // 4. SPM: ~2.5s gap
    const cancelSpm = scheduleNext(() => {
      const delta = SPM_DELTAS[idxSpm.current % SPM_DELTAS.length];
      idxSpm.current++;
      const val = Math.min(20, Math.max(4, baseSpm + delta));
      setTargetSpm(val);
      targetsRef.current.spm = val;
    }, 2300, 2800);

    // 5. Crude Viscosity & Mobility: ~2.7s gap
    const cancelVisc = scheduleNext(() => {
      const delta = VISC_DELTAS[idxVisc.current % VISC_DELTAS.length];
      idxVisc.current++;
      const tempDiff = targetsRef.current.temp - baseResTemp;
      const val = Number(Math.min(15000, Math.max(200, baseViscosity - tempDiff * 110 + delta)).toFixed(1));
      setTargetVisc(val);
      targetsRef.current.visc = val;

      const mobVal = Number(Math.min(0.05, Math.max(0.0001, baseMobility * (1 + (-tempDiff * 0.08)))).toFixed(5));
      setTargetMob(mobVal);
      targetsRef.current.mob = mobVal;
    }, 2500, 3000);

    // 6. SRP Load: ~2.4s gap
    const cancelLoad = scheduleNext(() => {
      const delta = LOAD_DELTAS[idxLoad.current % LOAD_DELTAS.length];
      idxLoad.current++;
      const val = Number(Math.min(85, Math.max(20, baseLoad + delta)).toFixed(1));
      setTargetLoad(val);
      targetsRef.current.load = val;
      setLoadHist((prev) => [...prev.slice(1), val]);
    }, 2200, 2700);

    // 7. Oil Production: ~2.6s gap
    const cancelOil = scheduleNext(() => {
      const delta = OIL_DELTAS[idxOil.current % OIL_DELTAS.length];
      idxOil.current++;
      const val = Number(Math.min(10, Math.max(0.1, baseOil + delta)).toFixed(2));
      setTargetOil(val);
      targetsRef.current.oil = val;
      setOilHist((prev) => [...prev.slice(1), val]);
    }, 2400, 2900);

    // 8. Risk Score & Health: ~5.5s - 7.5s gap (Slower 5-8s interval)
    const cancelRisk = scheduleNext(() => {
      const delta = RISK_DELTAS[idxRisk.current % RISK_DELTAS.length];
      idxRisk.current++;
      const val = Number(Math.min(100, Math.max(0, baseRisk + delta)).toFixed(1));
      setTargetRisk(val);
      targetsRef.current.risk = val;

      const healthVal = Number(Math.min(100, Math.max(0, baseHealth - delta * 0.5)).toFixed(1));
      setTargetHealth(healthVal);
      targetsRef.current.health = healthVal;
    }, 5500, 7500);

    return () => {
      cancelTemp();
      cancelSteam();
      cancelQual();
      cancelSpm();
      cancelVisc();
      cancelLoad();
      cancelOil();
      cancelRisk();
    };
  }, [baseSteam, baseQual, baseSpm, baseResTemp, baseViscosity, baseMobility, baseLoad, baseOil, baseRisk, baseHealth]);

  // Smooth lerp animation loop: transition completes within ~0.5s - 0.7s, then holds steady for remaining ~2.0s
  useEffect(() => {
    let animId: number;

    const lerp = (start: number, end: number, speed: number = 0.18) => {
      if (Math.abs(end - start) < 0.005) return end;
      return start + (end - start) * speed;
    };

    const tick = () => {
      setDisplayedSteam((prev) => lerp(prev, targetsRef.current.steam));
      setDisplayedQual((prev) => lerp(prev, targetsRef.current.qual));
      setDisplayedSpm((prev) => lerp(prev, targetsRef.current.spm));
      setDisplayedTemp((prev) => lerp(prev, targetsRef.current.temp));
      setDisplayedVisc((prev) => lerp(prev, targetsRef.current.visc));
      setDisplayedMob((prev) => lerp(prev, targetsRef.current.mob));
      setDisplayedLoad((prev) => lerp(prev, targetsRef.current.load));
      setDisplayedOil((prev) => lerp(prev, targetsRef.current.oil));
      setDisplayedRisk((prev) => lerp(prev, targetsRef.current.risk));
      setDisplayedHealth((prev) => lerp(prev, targetsRef.current.health));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute delta indicators
  const steamDiff = targetSteam - baseSteam;
  const steamRateDelta = steamDiff >= 0 ? `↑ +${steamDiff.toFixed(1)} TPD` : `↓ ${steamDiff.toFixed(1)} TPD`;

  const qualDiff = targetQual - baseQual;
  const steamQualityDelta = qualDiff >= 0 ? `↑ +${qualDiff.toFixed(1)}%` : `↓ ${qualDiff.toFixed(1)}%`;

  const spmDiff = targetSpm - baseSpm;
  const spmDelta = spmDiff >= 0 ? `↑ +${spmDiff.toFixed(1)} SPM` : `↓ ${spmDiff.toFixed(1)} SPM`;

  const tempDiff = targetTemp - baseResTemp;
  const resTempDelta = tempDiff >= 0 ? `↑ +${tempDiff.toFixed(1)} °C` : `↓ ${tempDiff.toFixed(1)} °C`;

  const viscDiffPct = Number((((targetVisc - baseViscosity) / baseViscosity) * 100).toFixed(1));
  const viscosityDelta = viscDiffPct >= 0 ? `↑ +${viscDiffPct}%` : `↓ ${viscDiffPct}%`;

  const mobDiffPct = Number((((targetMob - baseMobility) / baseMobility) * 100).toFixed(1));
  const mobilityDelta = mobDiffPct >= 0 ? `↑ +${mobDiffPct}%` : `↓ ${mobDiffPct}%`;

  const loadDiff = targetLoad - baseLoad;
  const srpLoadDelta = loadDiff >= 0 ? `↑ +${loadDiff.toFixed(1)}%` : `↓ ${loadDiff.toFixed(1)}%`;

  const oilDiffPct = Number((((targetOil - baseOil) / baseOil) * 100).toFixed(1));
  const oilProdDelta = oilDiffPct >= 0 ? `↑ +${oilDiffPct}%` : `↓ ${oilDiffPct}%`;

  const riskDiff = targetRisk - baseRisk;
  const riskScoreDelta = riskDiff >= 0 ? `↑ +${riskDiff.toFixed(1)}` : `↓ ${riskDiff.toFixed(1)}`;

  const healthDiff = targetHealth - baseHealth;
  const healthPctDelta = healthDiff >= 0 ? `↑ +${healthDiff.toFixed(1)}%` : `↓ ${healthDiff.toFixed(1)}%`;

  const steamTemp = inputs.steamInjectionTemperatureC ?? 300;
  const heatInputMw = Number((displayedSteam * 2.76).toFixed(0));
  const strokeM = inputs.strokeLengthMeters ?? 2.5;
  const vfdHz = inputs.vfdFrequencyHz ?? 50;
  const cycleTimeSec = displayedSpm > 0 ? (60 / displayedSpm).toFixed(1) : '7.5';
  const peakRodLoad = Number((displayedLoad * 0.08 + 1.2).toFixed(1));
  const fillagePct = Number(Math.min(100, Math.max(10, curCandidate.pumpCapacityFactor * 100)).toFixed(1));
  const stressIndex = Number(Math.min(100, displayedLoad * 0.95 + 5).toFixed(0));
  const fatigueIndex = Number(Math.min(100, displayedLoad * 0.6 + 8).toFixed(0));
  const totalFluid = Number((displayedOil * 1.66).toFixed(2));
  const waterCut = inputs.waterCutPercent ?? 40;
  const prodEfficiency = Number(Math.min(100, (displayedOil / totalFluid) * 100 + 25).toFixed(1));
  const resPressure = inputs.reservoirPressureBar ?? 48;
  const producedFluidTemp = Number((displayedTemp - 5.5).toFixed(1));
  const deltaSteamRes = Number((steamTemp - displayedTemp).toFixed(1));
  const deltaResProduced = Number((displayedTemp - producedFluidTemp).toFixed(1));
  const totalGradient = Number((steamTemp - producedFluidTemp).toFixed(1));
  const deltaTimestep = `+0.4 °C`;

  const metricHistory = (metric: string) => {
    if (metric === 'Viscosity') {
      const points = tempHist.map((tVal) => Number((baseViscosity - (tVal - baseResTemp) * 110).toFixed(0)));
      return { points, unit: 'cP', color: '#c084fc', val: displayedVisc };
    } else if (metric === 'Oil Production') {
      return { points: oilHist, unit: 'BOPD', color: '#10b981', val: displayedOil };
    } else if (metric === 'Steam Rate') {
      const points = Array.from({ length: 15 }, (_, i) => baseSteam + (STEAM_DELTAS[i % STEAM_DELTAS.length] || 0));
      return { points, unit: 'TPD', color: '#fb7185', val: displayedSteam };
    } else if (metric === 'Steam Quality') {
      const points = Array.from({ length: 15 }, (_, i) => baseQual + (QUAL_DELTAS[i % QUAL_DELTAS.length] || 0));
      return { points, unit: '%', color: '#38bdf8', val: displayedQual };
    } else if (metric === 'SRP Load') {
      return { points: loadHist, unit: '%', color: '#f59e0b', val: displayedLoad };
    } else if (metric === 'Risk Score') {
      const points = Array.from({ length: 15 }, (_, i) => Math.max(0, baseRisk + (RISK_DELTAS[i % RISK_DELTAS.length] || 0)));
      return { points, unit: '/ 100', color: '#10b981', val: displayedRisk };
    }
    // Default Reservoir Temp
    return { points: tempHist, unit: '°C', color: '#f43f5e', val: displayedTemp };
  };

  return {
    steamRate: displayedSteam,
    steamRateDelta,
    steamQuality: displayedQual,
    steamQualityDelta,
    steamTemp,
    spm: displayedSpm,
    spmDelta,
    strokeM,
    vfdHz,
    resTemp: displayedTemp,
    resTempDelta,
    deltaTimestep,
    resPressure,
    heatInputMw,
    viscosity: displayedVisc,
    viscosityDelta,
    mobility: displayedMob,
    mobilityDelta,
    srpLoad: displayedLoad,
    srpLoadDelta,
    peakRodLoad,
    fillagePct,
    stressIndex,
    fatigueIndex,
    cycleTimeSec,
    oilProd: displayedOil,
    oilProdDelta,
    totalFluid,
    waterCut,
    prodEfficiency,
    riskScore: displayedRisk,
    riskScoreDelta,
    healthPct: displayedHealth,
    healthPctDelta,
    producedFluidTemp,
    deltaSteamRes,
    deltaResProduced,
    totalGradient,
    resTempHistory: tempHist,
    srpLoadHistory: loadHist,
    oilProdHistory: oilHist,
    metricHistory,
  };
}
