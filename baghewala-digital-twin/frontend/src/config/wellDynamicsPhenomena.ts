import type { WellPhenomenon } from '../types/wellDynamics';

export const WELL_PHENOMENA: WellPhenomenon[] = [
  {
    id: 'normal_operation',
    title: 'Normal Operation',
    category: 'Baseline Dynamics',
    shortDescription: 'Balanced pumping conditions with nominal heavy crude inflow, stable rod load, and rated thermal influence.',
    affectedComponents: ['Surface Pumping Unit', 'Sucker Rod String', 'Downhole Plunger Pump', 'Tubing String', 'Perforations'],
    triggerCondition: 'Reservoir Temp >= 55°C, Viscosity <= 1,000 cP, SPM 6.0 - 9.0, Rod Load Index < 75%',
    simulationValuesUsed: ['reservoirTemperatureC', 'viscosityResult.effectiveViscosity', 'spm', 'productionResult.estimatedBopd', 'srpOptimizationResult.peakRodLoadLbs'],
    inputPreset: {
      reservoirTemperatureC: 58.0,
      steamInjectionRateTpd: 50.0,
      steamQualityPercent: 70.0,
      soakDurationDays: 5.0,
      spm: 8.0,
      strokeLengthMeters: 3.0,
      vfdFrequencyHz: 50.0
    },
    explanationText: {
      whatIsHappening: 'The well operates in a stable steady-state regime. Thermal EOR reduces heavy crude viscosity to manageable levels, permitting smooth plunger filling without excessive mechanical rod tension.',
      whyItIsHappening: 'Sufficient thermal energy in the near-wellhead formation enhances crude oil mobility. Sucker rod displacement rate matches reservoir inflow capacity efficiently.',
      parametersResponsible: [
        'Reservoir Temperature (nominal >= 55°C)',
        'Steam Injection Rate (30-50 tpd)',
        'Pumping Speed (6.0 - 9.0 SPM)',
        'Fluid Viscosity (< 1,000 cP)'
      ],
      expectedSimulatedEffect: 'Optimal oil production rate (120 - 165 BOPD), low rod fatigue, high volumetric efficiency (>85%), and minimal mechanical risk alerts.'
    },
    visualizationState: {
      statusColor: 'emerald',
      rodStressLevel: 0.35,
      thermalGlowIntensity: 0.6,
      fluidViscosityVisual: 'low',
      gasBubbleDensity: 0.1,
      frictionResistance: 0.2,
      motorLoadPercentage: 62,
      rodAnimationSpeedFactor: 1.0
    }
  },
  {
    id: 'temperature_thermal',
    title: 'Temperature / Thermal Behavior',
    category: 'EOR Heat Transfer',
    shortDescription: 'Thermal steam propagation raising reservoir temperature, driving exponential crude viscosity reduction.',
    affectedComponents: ['Steam Injection Tubing', 'Near-Wellhead Matrix', 'Perforations', 'Production Casing', 'Downhole Plunger'],
    triggerCondition: 'Steam Injection Rate > 50 tpd, Steam Quality > 70%, Reservoir Temp > 65°C',
    simulationValuesUsed: ['reservoirTemperatureC', 'thermalResult.steamZoneRadius', 'thermalResult.thermalInfluenceRatio', 'viscosityResult.effectiveViscosity'],
    inputPreset: {
      reservoirTemperatureC: 78.0,
      steamInjectionRateTpd: 120.0,
      steamQualityPercent: 85.0,
      soakDurationDays: 8.0,
      spm: 8.0,
      strokeLengthMeters: 3.0,
      vfdFrequencyHz: 50.0
    },
    explanationText: {
      whatIsHappening: 'Latent heat enthalpy from cyclic steam injection transfers into the dense carbonate formation, expanding the steam zone radius and rapidly reducing crude oil shear resistance.',
      whyItIsHappening: 'Heavy crude exhibits strong Andrade temperature dependency. Elevating reservoir temperature from 30°C to 75°C decreases dynamic viscosity by up to 95%.',
      parametersResponsible: [
        'Steam Injection Rate (tpd)',
        'Steam Quality (X_steam %)',
        'Thermal Soak Duration (days)',
        'Reservoir Matrix Thermal Conductivity'
      ],
      expectedSimulatedEffect: 'Expanded thermal plume radius (>30m), crude viscosity drop below 500 cP, mobility enhancement, and elevated inflow performance.'
    },
    visualizationState: {
      statusColor: 'orange',
      rodStressLevel: 0.25,
      thermalGlowIntensity: 1.0,
      fluidViscosityVisual: 'low',
      gasBubbleDensity: 0.2,
      frictionResistance: 0.15,
      motorLoadPercentage: 55,
      rodAnimationSpeedFactor: 1.1
    }
  },
  {
    id: 'high_viscosity',
    title: 'High Viscosity Restriction',
    category: 'Rheological Obstruction',
    shortDescription: 'Cold reservoir condition causing severe crude viscosity spike, fluid drag, and pump filling failure.',
    affectedComponents: ['Downhole Pump Barrel', 'Sucker Rod String', 'Production Tubing', 'Surface Wellhead'],
    triggerCondition: 'Reservoir Temp < 40°C, Steam Injection = 0 tpd, Viscosity > 8,000 cP',
    simulationValuesUsed: ['reservoirTemperatureC', 'viscosityResult.effectiveViscosity', 'mobilityResult.oilMobility', 'productionResult.estimatedBopd'],
    inputPreset: {
      reservoirTemperatureC: 32.0,
      steamInjectionRateTpd: 0.0,
      steamQualityPercent: 0.0,
      soakDurationDays: 0.0,
      spm: 6.0,
      strokeLengthMeters: 2.5,
      vfdFrequencyHz: 45.0
    },
    explanationText: {
      whatIsHappening: 'Extremely viscous heavy crude (8,000 to 18,000+ cP) creates severe viscous drag inside the production tubing, impeding the downward rod fall stroke and restricting fluid entry into the pump barrel.',
      whyItIsHappening: 'Absence of thermal stimulation leaves the Baghewala 17° API bitumen-like crude at unheated reservoir conditions (30°C - 35°C), where viscous resistance dominates reservoir flow.',
      parametersResponsible: [
        'Unheated Reservoir Temperature (< 40°C)',
        'Zero Steam Injection',
        'Heavy Crude API Gravity (17° API)',
        'High Viscous Shearing Resistance'
      ],
      expectedSimulatedEffect: 'Drastic oil production drop (<45 BOPD), pump valve floating, slow rod fall velocity, and elevated fluid column friction.'
    },
    visualizationState: {
      statusColor: 'purple',
      rodStressLevel: 0.75,
      thermalGlowIntensity: 0.1,
      fluidViscosityVisual: 'extreme',
      gasBubbleDensity: 0.05,
      frictionResistance: 0.85,
      motorLoadPercentage: 82,
      rodAnimationSpeedFactor: 0.5
    }
  },
  {
    id: 'rod_overload',
    title: 'Rod Mechanical Overload',
    category: 'Structural Mechanics',
    shortDescription: 'Excessive tension loads on the sucker rod string from high SPM and heavy fluid column weight exceeding fatigue limits.',
    affectedComponents: ['Sucker Rod Pins/Couplings', 'Polish Rod', 'Walking Beam', 'Horsehead', 'Stuffing Box'],
    triggerCondition: 'SPM > 11.5, Peak Rod Load > 85% Yield Limit, Viscosity > 3,000 cP',
    simulationValuesUsed: ['spm', 'strokeLengthMeters', 'srpOptimizationResult.peakRodLoadLbs', 'srpOptimizationResult.rodStressRatio'],
    inputPreset: {
      reservoirTemperatureC: 50.0,
      steamInjectionRateTpd: 30.0,
      spm: 18.0,
      strokeLengthMeters: 3.5,
      vfdFrequencyHz: 65.0
    },
    explanationText: {
      whatIsHappening: 'Peak tensile stress on the top sucker rod section approaches or exceeds safe endurance limits. Dynamic rod acceleration forces combined with heavy fluid column weight create mechanical fatigue.',
      whyItIsHappening: 'Operating at high stroke frequencies (SPM > 11.5) with viscous crude generates extreme inertial recoil and peak polish rod loads.',
      parametersResponsible: [
        'Pumping Speed (SPM > 11.5)',
        'Stroke Length (3.0m)',
        'Fluid Column Weight (Hydrostatic Head)',
        'Dynamic Acceleration Recoil (d²x/dt²)'
      ],
      expectedSimulatedEffect: 'Elevated structural failure risk, high rod stress ratio (>85%), gear reducer torque spikes, and AI risk alert triggered for rod overload.'
    },
    visualizationState: {
      statusColor: 'red',
      rodStressLevel: 0.95,
      thermalGlowIntensity: 0.3,
      fluidViscosityVisual: 'high',
      gasBubbleDensity: 0.15,
      frictionResistance: 0.7,
      motorLoadPercentage: 94,
      rodAnimationSpeedFactor: 1.4
    }
  },
  {
    id: 'motor_pump_overload',
    title: 'Motor / Pump Overload',
    category: 'Electrical & Drive System',
    shortDescription: 'Surface VFD motor current draw exceeding thermal rating due to heavy cyclic torque demand.',
    affectedComponents: ['Prime Mover Electric Motor', 'VFD Inverter Drive', 'Gear Reducer Box', 'Crank Counterweights'],
    triggerCondition: 'VFD Frequency > 60 Hz, Gear Reducer Torque > 90% Rating',
    simulationValuesUsed: ['vfdFrequencyHz', 'srpOptimizationResult.gearTorqueUtilizationPercent', 'srpOptimizationResult.motorCurrentAmps'],
    inputPreset: {
      reservoirTemperatureC: 48.0,
      steamInjectionRateTpd: 30.0,
      spm: 16.0,
      strokeLengthMeters: 3.0,
      vfdFrequencyHz: 68.0
    },
    explanationText: {
      whatIsHappening: 'The surface electric prime mover draws excessive amperage to overcome out-of-balance crank torque and peak fluid displacement loads during the upstroke cycle.',
      whyItIsHappening: 'High VFD operating frequency combined with improperly adjusted counterweights forces the motor to operate near its thermal trip breakdown torque.',
      parametersResponsible: [
        'VFD Inverter Frequency (Hz)',
        'Crank Counterweight Out-of-Balance Index',
        'Gear Reducer Torque Utilization (%)',
        'Electrical Line Voltage Drop'
      ],
      expectedSimulatedEffect: 'Motor current spikes (>90A), thermal overload warnings, high gear reducer torque stress, and VFD power factor degradation.'
    },
    visualizationState: {
      statusColor: 'amber',
      rodStressLevel: 0.8,
      thermalGlowIntensity: 0.4,
      fluidViscosityVisual: 'medium',
      gasBubbleDensity: 0.2,
      frictionResistance: 0.5,
      motorLoadPercentage: 98,
      rodAnimationSpeedFactor: 1.3
    }
  }
];

export const getPhenomenonById = (id: string): WellPhenomenon => {
  return WELL_PHENOMENA.find(p => p.id === id) || WELL_PHENOMENA[0];
};
