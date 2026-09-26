import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Scenario, ScenarioInputValues } from './types';
import { loadBaseline, createScenario, cloneScenario, updateScenario } from './scenarioEngine';
import { BASELINE_INPUT_VALUES } from './defaults';
import type { ThermalResult } from '../thermal';
import { calculateThermalModel } from '../thermal';
import type { ViscosityResult } from '../viscosity';
import { calculateViscosityModel } from '../viscosity';
import type { MobilityResult } from '../mobility';
import { calculateMobilityModel } from '../mobility';
import type { ProductionResult } from '../production';
import { calculateProductionModel } from '../production';
import type { OptimizationResult } from '../srpOptimization';
import { optimizeSRP } from '../srpOptimization';
import type { CSSOptimizationResult } from '../cssOptimization';
import { optimizeCSS } from '../cssOptimization';
import type { AIRiskResult } from '../riskEngine';
import { analyzeAIRisk } from '../riskEngine';

import { validateScenarioInputs } from './validation';

const LOCAL_STORAGE_KEY = 'baghewala_digital_twin_scenarios_v1';
const ACTIVE_SCENARIO_ID_KEY = 'baghewala_digital_twin_active_scenario_id_v1';
const ACTIVE_SCENARIO_KEY = 'baghewala_digital_twin_active_scenario_inputs_v1';

export function validateScenarioObject(sc: any): sc is Scenario {
  if (!sc || typeof sc !== 'object') return false;
  if (typeof sc.id !== 'string' || typeof sc.name !== 'string') return false;
  return validateScenarioInputs(sc.inputs).isValid;
}

export interface ScenarioContextType {
  activeScenario: Scenario;
  savedScenarios: Scenario[];
  presets: Scenario[];
  thermalResult: ThermalResult;
  baselineThermalResult: ThermalResult;
  viscosityResult: ViscosityResult;
  baselineViscosityResult: ViscosityResult;
  mobilityResult: MobilityResult;
  baselineMobilityResult: MobilityResult;
  productionResult: ProductionResult;
  baselineProductionResult: ProductionResult;
  srpOptimizationResult: OptimizationResult;
  baselineSRPOptimizationResult: OptimizationResult;
  cssOptimizationResult: CSSOptimizationResult;
  baselineCSSOptimizationResult: CSSOptimizationResult;
  aiRiskResult: AIRiskResult;
  baselineAIRiskResult: AIRiskResult;
  updateInput: (key: keyof ScenarioInputValues, value: number) => void;
  updateDetails: (name: string, description?: string) => void;
  saveCurrentScenario: () => void;
  loadScenario: (scenarioId: string) => void;
  resetCurrentToBaseline: () => void;
  duplicateCurrentScenario: () => void;
  deleteScenario: (scenarioId: string) => void;
  loadPreset: (presetId: string) => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export const useScenarioStore = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenarioStore must be used within a ScenarioProvider');
  }
  return context;
};

// Built-in Prompt 6 What-If Demonstration Presets (Scenarios A through E)
const buildPresets = (): Scenario[] => {
  // Scenario A: Baseline
  const baseline = loadBaseline();
  baseline.id = 'BAGHEWALA_BASELINE';
  baseline.name = 'A. Reference Baseline';
  baseline.description = 'Normal Baghewala initial operating condition (48°C matrix, 50 TPD steam, 50 Hz VFD, 8.0 SPM).';

  // Scenario B: Thermal Improvement
  const thermalImp = createScenario(
    'B. Thermal Improvement',
    'Increased steam injection (120 TPD @ 85% quality, 75°C) driving thermal penetration, viscosity drop & oil mobility boost.',
    {
      ...BASELINE_INPUT_VALUES,
      reservoirTemperatureC: 75.0,
      steamInjectionRateTpd: 120.0,
      steamQualityPercent: 85.0,
      soakDurationDays: 8.0,
    }
  );
  thermalImp.id = 'BAGHEWALA_THERMAL_IMPROVEMENT';
  thermalImp.isPreset = true;

  // Scenario C: Cooling / High Viscosity
  const coolingVisc = createScenario(
    'C. Cooling / High Viscosity',
    'Reduced reservoir temperature (32°C, 0 TPD steam), producing high crude viscosity (>25,000 cP), choked mobility & production flow restriction.',
    {
      ...BASELINE_INPUT_VALUES,
      reservoirTemperatureC: 32.0,
      steamInjectionRateTpd: 0.0,
      steamQualityPercent: 0.0,
      soakDurationDays: 0.0,
    }
  );
  coolingVisc.id = 'BAGHEWALA_COOLING_HIGH_VISCOSITY';
  coolingVisc.isPreset = true;

  // Scenario D: High SRP Load
  const highSrp = createScenario(
    'D. High SRP Mechanical Load',
    'Elevated SPM/VFD pumping speed (18 SPM, 68 Hz VFD), pushing sucker rod mechanical load index > 85/100.',
    {
      ...BASELINE_INPUT_VALUES,
      vfdFrequencyHz: 68.0,
      spm: 18.0,
      strokeLengthMeters: 3.5,
    }
  );
  highSrp.id = 'BAGHEWALA_HIGH_SRP_LOAD';
  highSrp.isPreset = true;

  // Scenario E: Combined Condition
  const combined = createScenario(
    'E. Combined Thermal & High Lift',
    'Thermal steam boost (140 TPD, 80°C) paired with high pumping speed (16 SPM, 65 Hz), driving production gains alongside mechanical stress alerts.',
    {
      ...BASELINE_INPUT_VALUES,
      reservoirTemperatureC: 80.0,
      steamInjectionRateTpd: 140.0,
      steamQualityPercent: 85.0,
      soakDurationDays: 8.0,
      vfdFrequencyHz: 65.0,
      spm: 16.0,
      strokeLengthMeters: 3.0,
    }
  );
  combined.id = 'BAGHEWALA_COMBINED_OPTIMIZATION';
  combined.isPreset = true;

  return [baseline, thermalImp, coolingVisc, highSrp, combined];
};

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const presets = useRef<Scenario[]>(buildPresets()).current;
  const baseline = presets[0];

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario>(baseline);

  // Load from localStorage safely on mount
  useEffect(() => {
    try {
      const storedScenariosRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedActiveScenarioRaw = localStorage.getItem(ACTIVE_SCENARIO_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_SCENARIO_ID_KEY);

      let parsedSavedScenarios: Scenario[] = [];
      if (storedScenariosRaw) {
        const parsed = JSON.parse(storedScenariosRaw);
        if (Array.isArray(parsed)) {
          parsedSavedScenarios = parsed.filter(validateScenarioObject);
        }
      }
      setSavedScenarios(parsedSavedScenarios);

      // Restore active scenario if valid inputs exist
      if (storedActiveScenarioRaw) {
        const parsedActive = JSON.parse(storedActiveScenarioRaw);
        if (validateScenarioObject(parsedActive)) {
          setActiveScenario(parsedActive);
          return;
        }
      }

      if (storedActiveId) {
        const foundPreset = presets.find((p: Scenario) => p.id === storedActiveId);
        const foundSaved = parsedSavedScenarios.find((s: Scenario) => s.id === storedActiveId);

        if (foundPreset) {
          setActiveScenario(foundPreset);
        } else if (foundSaved) {
          setActiveScenario(foundSaved);
        }
      }
    } catch (e) {
      console.warn('Corrupted localStorage data encountered. Falling back to default baseline.', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SCENARIO_KEY);
      localStorage.removeItem(ACTIVE_SCENARIO_ID_KEY);
      setActiveScenario(baseline);
    }
  }, [baseline, presets]);

  // Auto-persist activeScenario whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SCENARIO_KEY, JSON.stringify(activeScenario));
      localStorage.setItem(ACTIVE_SCENARIO_ID_KEY, activeScenario.id);
    } catch (e) {
      console.warn('Failed to auto-persist active scenario to localStorage', e);
    }
  }, [activeScenario]);

  // Save scenarios to localStorage
  const saveToLocalStorage = (scenariosList: Scenario[], activeId: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenariosList));
      localStorage.setItem(ACTIVE_SCENARIO_ID_KEY, activeId);
    } catch (e) {
      console.warn('Failed to persist scenarios to localStorage', e);
    }
  };

  const updateInput = useCallback(
    (key: keyof ScenarioInputValues, value: number) => {
      setActiveScenario((prev) => updateScenario(prev, { [key]: value }));
    },
    []
  );

  const updateDetails = useCallback((name: string, description?: string) => {
    setActiveScenario((prev) => updateScenario(prev, {}, name, description));
  }, []);

  const saveCurrentScenario = useCallback(() => {
    setSavedScenarios((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === activeScenario.id);
      let updated: Scenario[];

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = activeScenario;
      } else {
        updated = [...prev, activeScenario];
      }

      saveToLocalStorage(updated, activeScenario.id);
      return updated;
    });
  }, [activeScenario]);

  const loadScenario = useCallback(
    (scenarioId: string) => {
      const foundPreset = presets.find((p: Scenario) => p.id === scenarioId);
      const foundSaved = savedScenarios.find((s: Scenario) => s.id === scenarioId);

      if (foundPreset) {
        setActiveScenario(foundPreset);
        saveToLocalStorage(savedScenarios, foundPreset.id);
      } else if (foundSaved) {
        setActiveScenario(foundSaved);
        saveToLocalStorage(savedScenarios, foundSaved.id);
      }
    },
    [presets, savedScenarios]
  );

  const resetCurrentToBaseline = useCallback(() => {
    setActiveScenario(baseline);
    saveToLocalStorage(savedScenarios, baseline.id);
  }, [baseline, savedScenarios]);

  const duplicateCurrentScenario = useCallback(() => {
    const cloned = cloneScenario(activeScenario);
    setActiveScenario(cloned);
  }, [activeScenario]);

  const deleteScenario = useCallback(
    (scenarioId: string) => {
      setSavedScenarios((prev) => {
        const updated = prev.filter((s: Scenario) => s.id !== scenarioId);
        const nextActive = activeScenario.id === scenarioId ? baseline : activeScenario;
        setActiveScenario(nextActive);
        saveToLocalStorage(updated, nextActive.id);
        return updated;
      });
    },
    [activeScenario, baseline]
  );

  const loadPreset = useCallback(
    (presetId: string) => {
      const found = presets.find((p: Scenario) => p.id === presetId);
      if (found) {
        setActiveScenario(found);
        saveToLocalStorage(savedScenarios, found.id);
      }
    },
    [presets, savedScenarios]
  );

  const baselineThermalResult = useMemo(
    () => calculateThermalModel(baseline),
    [baseline]
  );

  const thermalResult = useMemo(
    () => calculateThermalModel(activeScenario),
    [activeScenario]
  );

  const baselineViscosityResult = useMemo(
    () => calculateViscosityModel(baselineThermalResult.predictedReservoirTemperatureC, 48.0),
    [baselineThermalResult]
  );

  const viscosityResult = useMemo(
    () =>
      calculateViscosityModel(
        thermalResult.predictedReservoirTemperatureC,
        baselineThermalResult.predictedReservoirTemperatureC
      ),
    [thermalResult, baselineThermalResult]
  );

  const baselineMobilityResult = useMemo(
    () =>
      calculateMobilityModel(
        baselineViscosityResult.estimatedViscosityCp,
        baselineThermalResult.predictedReservoirTemperatureC
      ),
    [baselineViscosityResult, baselineThermalResult]
  );

  const mobilityResult = useMemo(
    () =>
      calculateMobilityModel(
        viscosityResult.estimatedViscosityCp,
        thermalResult.predictedReservoirTemperatureC,
        2.5,
        1.0,
        baselineViscosityResult.estimatedViscosityCp
      ),
    [viscosityResult, thermalResult, baselineViscosityResult]
  );

  const baselineProductionResult = useMemo(
    () =>
      calculateProductionModel(
        baselineMobilityResult.mobilityDcP,
        baselineThermalResult.predictedReservoirTemperatureC,
        baselineViscosityResult.estimatedViscosityCp
      ),
    [baselineMobilityResult, baselineThermalResult, baselineViscosityResult]
  );

  const baselineSRPOptimizationResult = useMemo(
    () =>
      optimizeSRP({
        vfdFrequencyHz: baseline.inputs.vfdFrequencyHz,
        spm: baseline.inputs.spm,
        strokeLengthM: baseline.inputs.strokeLengthMeters,
        oilMobilityDcp: baselineMobilityResult.mobilityDcP,
        effectiveDrawdownBar: 30.0,
        temperatureC: baselineThermalResult.predictedReservoirTemperatureC,
        viscosityCp: baselineViscosityResult.estimatedViscosityCp,
      }),
    [baseline, baselineMobilityResult, baselineThermalResult, baselineViscosityResult]
  );

  const productionResult = useMemo(
    () =>
      calculateProductionModel(
        mobilityResult.mobilityDcP,
        thermalResult.predictedReservoirTemperatureC,
        viscosityResult.estimatedViscosityCp,
        30.0,
        activeScenario.inputs.vfdFrequencyHz,
        activeScenario.inputs.spm,
        activeScenario.inputs.strokeLengthMeters,
        baselineProductionResult.estimatedProductionBopd
      ),
    [mobilityResult, thermalResult, viscosityResult, activeScenario, baselineProductionResult]
  );

  const srpOptimizationResult = useMemo(
    () =>
      optimizeSRP({
        vfdFrequencyHz: activeScenario.inputs.vfdFrequencyHz,
        spm: activeScenario.inputs.spm,
        strokeLengthM: activeScenario.inputs.strokeLengthMeters,
        oilMobilityDcp: mobilityResult.mobilityDcP,
        effectiveDrawdownBar: 30.0,
        temperatureC: thermalResult.predictedReservoirTemperatureC,
        viscosityCp: viscosityResult.estimatedViscosityCp,
      }),
    [activeScenario, mobilityResult, thermalResult, viscosityResult]
  );

  const baselineCSSOptimizationResult = useMemo(
    () =>
      optimizeCSS({
        steamInjectionRateTpd: baseline.inputs.steamInjectionRateTpd,
        steamInjectionTemperatureC: 300.0,
        steamQualityFraction: baseline.inputs.steamQualityPercent / 100.0,
        injectionDurationDays: 5.0,
        soakDurationDays: baseline.inputs.soakDurationDays,
        productionDurationDays: 90.0,
        reservoirTemperatureC: baselineThermalResult.predictedReservoirTemperatureC,
        reservoirPressureBar: 90.0,
        baselineViscosityCp: baselineViscosityResult.estimatedViscosityCp,
        baselineMobilityDPerCp: baselineMobilityResult.mobilityDcP,
        baselineProductionBopd: baselineProductionResult.estimatedProductionBopd,
        vfdFrequencyHz: baseline.inputs.vfdFrequencyHz,
        spm: baseline.inputs.spm,
        strokeLengthMeters: baseline.inputs.strokeLengthMeters,
      }),
    [baseline, baselineThermalResult, baselineViscosityResult, baselineMobilityResult, baselineProductionResult]
  );

  const cssOptimizationResult = useMemo(
    () =>
      optimizeCSS({
        steamInjectionRateTpd: activeScenario.inputs.steamInjectionRateTpd,
        steamInjectionTemperatureC: 300.0,
        steamQualityFraction: activeScenario.inputs.steamQualityPercent / 100.0,
        injectionDurationDays: 5.0,
        soakDurationDays: activeScenario.inputs.soakDurationDays,
        productionDurationDays: 90.0,
        reservoirTemperatureC: thermalResult.predictedReservoirTemperatureC,
        reservoirPressureBar: 90.0,
        baselineViscosityCp: baselineViscosityResult.estimatedViscosityCp,
        baselineMobilityDPerCp: baselineMobilityResult.mobilityDcP,
        baselineProductionBopd: baselineProductionResult.estimatedProductionBopd,
        vfdFrequencyHz: activeScenario.inputs.vfdFrequencyHz,
        spm: activeScenario.inputs.spm,
        strokeLengthMeters: activeScenario.inputs.strokeLengthMeters,
      }),
    [activeScenario, thermalResult, baselineViscosityResult, baselineMobilityResult, baselineProductionResult]
  );

  const baselineAIRiskResult = useMemo(
    () =>
      analyzeAIRisk({
        temperatureC: baselineThermalResult.predictedReservoirTemperatureC,
        viscosityCp: baselineViscosityResult.estimatedViscosityCp,
        mobilityDPerCp: baselineMobilityResult.mobilityDcP,
        productionBopd: baselineProductionResult.estimatedProductionBopd,
        vfdFrequencyHz: baseline.inputs.vfdFrequencyHz,
        spm: baseline.inputs.spm,
        strokeLengthMeters: baseline.inputs.strokeLengthMeters,
        steamInjectionRateTpd: baseline.inputs.steamInjectionRateTpd,
        srpLoadIndex: baselineSRPOptimizationResult.currentCandidate.loadIndex,
        cssThermalGainC: baselineCSSOptimizationResult.thermalBreakdown.deltaTemperatureC,
      }),
    [baselineThermalResult, baselineViscosityResult, baselineMobilityResult, baselineProductionResult, baseline, baselineSRPOptimizationResult, baselineCSSOptimizationResult]
  );

  const aiRiskResult = useMemo(
    () =>
      analyzeAIRisk({
        temperatureC: thermalResult.predictedReservoirTemperatureC,
        viscosityCp: viscosityResult.estimatedViscosityCp,
        mobilityDPerCp: mobilityResult.mobilityDcP,
        productionBopd: productionResult.estimatedProductionBopd,
        vfdFrequencyHz: activeScenario.inputs.vfdFrequencyHz,
        spm: activeScenario.inputs.spm,
        strokeLengthMeters: activeScenario.inputs.strokeLengthMeters,
        steamInjectionRateTpd: activeScenario.inputs.steamInjectionRateTpd,
        srpLoadIndex: srpOptimizationResult.currentCandidate.loadIndex,
        cssThermalGainC: cssOptimizationResult.thermalBreakdown.deltaTemperatureC,
      }),
    [thermalResult, viscosityResult, mobilityResult, productionResult, activeScenario, srpOptimizationResult, cssOptimizationResult]
  );

  return React.createElement(
    ScenarioContext.Provider,
    {
      value: {
        activeScenario,
        savedScenarios,
        presets,
        thermalResult,
        baselineThermalResult,
        viscosityResult,
        baselineViscosityResult,
        mobilityResult,
        baselineMobilityResult,
        productionResult,
        baselineProductionResult,
        srpOptimizationResult,
        baselineSRPOptimizationResult,
        cssOptimizationResult,
        baselineCSSOptimizationResult,
        aiRiskResult,
        baselineAIRiskResult,
        updateInput,
        updateDetails,
        saveCurrentScenario,
        loadScenario,
        resetCurrentToBaseline,
        duplicateCurrentScenario,
        deleteScenario,
        loadPreset,
      },
    },
    children
  );
};

