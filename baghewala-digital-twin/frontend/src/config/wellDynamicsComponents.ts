import type { WellComponentInfo, WellComponentId } from '../types/wellDynamics';

export const WELL_COMPONENTS: Record<WellComponentId, WellComponentInfo> = {
  motor: {
    id: 'motor',
    name: 'Prime Mover Electric Motor',
    category: 'surface',
    depthLabel: '0 m (Surface)',
    functionDescription: 'Provides rotational mechanical power to drive the surface pumping unit gear reducer through VFD speed control.',
    normalCondition: 'Operating within rated VFD frequency (50-60 Hz) with stable current draw.',
    relevantValues: ['VFD Frequency (Hz)', 'Motor Load (%)', 'Current Amps']
  },
  gearbox: {
    id: 'gearbox',
    name: 'Gear Reducer Box',
    category: 'surface',
    depthLabel: '0 m (Surface)',
    functionDescription: 'Reduces high-speed motor rotation to low-speed high-torque crank arm oscillation.',
    normalCondition: 'Smooth torque transmission below 80% gear reducer rating.',
    relevantValues: ['Gear Torque Utilization (%)', 'Pumping Speed (SPM)', 'VFD Frequency (Hz)']
  },
  walking_beam: {
    id: 'walking_beam',
    name: 'Walking Beam & Horsehead',
    category: 'surface',
    depthLabel: '0 m (Surface)',
    functionDescription: 'Converts rotary crank motion into vertical linear reciprocating motion attached to the polish rod.',
    normalCondition: 'Sinusoidal vertical displacement matching active SPM stroke frequency.',
    relevantValues: ['Strokes Per Minute (SPM)', 'Stroke Length (m)', 'Polish Rod Peak Load (lbs)']
  },
  wellhead: {
    id: 'wellhead',
    name: 'Surface Wellhead & Stuffing Box',
    category: 'surface',
    depthLabel: '0 m (Surface)',
    functionDescription: 'Seals fluid pressure at the surface while guiding the reciprocating polish rod into the tubing string.',
    normalCondition: 'Hermetic pressure seal with low friction packing wear.',
    relevantValues: ['Surface Flowline Pressure (bar)', 'Stuffing Box Friction (psi)', 'Ambient Temp (°C)']
  },
  polished_rod: {
    id: 'polished_rod',
    name: 'Polished Rod',
    category: 'surface',
    depthLabel: '0 - 10 m',
    functionDescription: 'High-strength smooth steel rod connecting the walking beam bridle to the subsurface sucker rod string.',
    normalCondition: 'Smooth vertical reciprocating stroke with minimal packing friction.',
    relevantValues: ['Stroke Length (m)', 'Polish Rod Peak Load (lbs)', 'Reciprocation Frequency (SPM)']
  },
  casing: {
    id: 'casing',
    name: 'Production Casing String',
    category: 'subsurface',
    depthLabel: '0 - 600 m',
    functionDescription: 'Steel pipe cemented into the borehole to stabilize the well and isolate formation pressures.',
    normalCondition: 'Structural integrity maintained with annular fluid seal.',
    relevantValues: ['Casing Outer Diameter (in)', 'Annular Pressure (bar)', 'Corrosion Index']
  },
  tubing: {
    id: 'tubing',
    name: 'Production Tubing String',
    category: 'subsurface',
    depthLabel: '0 - 580 m',
    functionDescription: 'Inner conduit through which produced heavy crude and thermal steam travel between reservoir and surface.',
    normalCondition: 'Open fluid conduit with minimal mineral scale deposition.',
    relevantValues: ['Tubing Diameter (in)', 'Fluid Velocity (m/s)', 'Tubing Friction Loss (psi)']
  },
  sucker_rod: {
    id: 'sucker_rod',
    name: 'Sucker Rod String',
    category: 'subsurface',
    depthLabel: '10 - 520 m',
    functionDescription: 'Transfers reciprocating mechanical motion from the surface pumping unit down to the plunger pump.',
    normalCondition: 'Tensile stress ratio < 75% yield limit under cyclic loading.',
    relevantValues: ['Peak Tensile Stress (psi)', 'Rod Load Index (%)', 'Dynamic Acceleration (m/s²)']
  },
  downhole_pump: {
    id: 'downhole_pump',
    name: 'Downhole Plunger Pump Assembly',
    category: 'subsurface',
    depthLabel: '520 m',
    functionDescription: 'Positive displacement pump consisting of barrel, standing valve, and travelling valve that lifts fluid on upstroke.',
    normalCondition: 'Volumetric pump filling efficiency > 80% without gas locking or fluid pound.',
    relevantValues: ['Volumetric Efficiency (%)', 'Pump Intake Pressure (bar)', 'Plunger Displacement (bpd)']
  },
  plunger: {
    id: 'plunger',
    name: 'Pump Plunger & Check Valves',
    category: 'subsurface',
    depthLabel: '520 - 525 m',
    functionDescription: 'Reciprocating plunger with travelling valve that traps fluid during upstroke and opens during downstroke.',
    normalCondition: 'Tight mechanical seal with standing and travelling valves seating cleanly.',
    relevantValues: ['Plunger Clearance (in)', 'Valve Seating Delay (ms)', 'Stroke Amplitude (m)']
  },
  perforations: {
    id: 'perforations',
    name: 'Perforated Interval',
    category: 'subsurface',
    depthLabel: '580 - 595 m',
    functionDescription: 'Explosively punched holes through casing and cement connecting the reservoir rock directly to the wellbore.',
    normalCondition: 'Unplugged perforation tunnels permitting maximum heavy crude inflow.',
    relevantValues: ['Perforation Density (spf)', 'Inflow Drawdown (bar)', 'Permeability (mD)']
  },
  reservoir: {
    id: 'reservoir',
    name: 'Jodhpur Sandstone Reservoir Formation',
    category: 'reservoir',
    depthLabel: '580 - 600 m',
    functionDescription: 'Baghewala heavy-oil carbonate/sandstone pay zone storing 17° API crude oil under thermal stimulation.',
    normalCondition: 'Permeable pay zone responding dynamically to cyclic steam heat injection.',
    relevantValues: ['Effective Temp (°C)', 'Crude Viscosity (cP)', 'Oil Mobility (D/cP)']
  },
  oil_zone: {
    id: 'oil_zone',
    name: 'Heavy Oil Production Zone',
    category: 'reservoir',
    depthLabel: '580 - 600 m',
    functionDescription: 'High-viscosity heavy crude fluid column flowing from formation pore throats into the pump intake.',
    normalCondition: 'Thermally mobilized heavy crude with reduced dynamic viscosity.',
    relevantValues: ['Estimated Production (BOPD)', 'Crude Viscosity (cP)', 'Water Cut (%)']
  },
  thermal_zone: {
    id: 'thermal_zone',
    name: 'Steam / Thermal Influence Envelope',
    category: 'reservoir',
    depthLabel: '550 - 600 m',
    functionDescription: 'Expanded heat propagation envelope around the wellbore generated by cyclic steam injection (CSS).',
    normalCondition: 'Uniform heat distribution lowering crude shear resistance across the pay zone.',
    relevantValues: ['Steam Zone Radius (m)', 'Steam Injection Rate (tpd)', 'Thermal Influence Ratio']
  }
};

export const getComponentInfo = (id: WellComponentId): WellComponentInfo => {
  return WELL_COMPONENTS[id] || WELL_COMPONENTS['sucker_rod'];
};
