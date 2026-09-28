import type { ScenarioInputValues } from '../simulation/scenario/types';

export type PhenomenonId =
  | 'normal_operation'
  | 'temperature_thermal'
  | 'high_viscosity'
  | 'rod_overload'
  | 'motor_pump_overload';

export type WellComponentId =
  | 'motor'
  | 'gearbox'
  | 'walking_beam'
  | 'wellhead'
  | 'polished_rod'
  | 'casing'
  | 'tubing'
  | 'sucker_rod'
  | 'downhole_pump'
  | 'plunger'
  | 'perforations'
  | 'reservoir'
  | 'oil_zone'
  | 'thermal_zone';

export interface PhenomenonVisualState {
  statusColor: 'emerald' | 'amber' | 'red' | 'cyan' | 'purple' | 'orange';
  rodStressLevel: number; // 0 to 1
  thermalGlowIntensity: number; // 0 to 1
  fluidViscosityVisual: 'low' | 'medium' | 'high' | 'extreme';
  gasBubbleDensity: number; // 0 to 1
  frictionResistance: number; // 0 to 1
  motorLoadPercentage: number; // 0 to 100
  rodAnimationSpeedFactor: number;
}

export interface WellPhenomenon {
  id: PhenomenonId;
  title: string;
  category: string;
  shortDescription: string;
  affectedComponents: string[];
  triggerCondition: string;
  simulationValuesUsed: string[];
  inputPreset?: Partial<ScenarioInputValues>;
  explanationText: {
    whatIsHappening: string;
    whyItIsHappening: string;
    parametersResponsible: string[];
    expectedSimulatedEffect: string;
  };
  visualizationState: PhenomenonVisualState;
}

export interface WellComponentInfo {
  id: WellComponentId;
  name: string;
  category: 'surface' | 'subsurface' | 'reservoir';
  depthLabel: string;
  functionDescription: string;
  normalCondition: string;
  relevantValues: string[];
}
