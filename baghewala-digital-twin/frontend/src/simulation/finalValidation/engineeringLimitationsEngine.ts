export function collectEngineeringLimitations(): string[] {
  return [
    'Digital twin relies on log-linear viscosity extrapolation above 180°C boundary.',
    'Single-well reservoir model assumes quasi-steady-state inflow and does not model multi-well reservoir interference.',
    'Physical SCADA hardware telemetry is currently unconnected; all inputs are derived from simulated what-if or historical appraisal data.',
    'Decoupled advisory-only architecture requires human engineer authorization before any physical operational adjustment.',
    'Monte Carlo uncertainty bounds reflect model probabilistic parameter spread, NOT a physical production guarantee.',
    'Cyclic steam stimulation (CSS) thermal response uses exponential soak decay and does not simulate 3D steam chamber growth.',
  ];
}
