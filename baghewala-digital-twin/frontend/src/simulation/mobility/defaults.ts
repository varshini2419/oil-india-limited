import { JODHPUR_RESERVOIR_PROFILE } from '../../data/baghewala';

export const DEFAULT_PERMEABILITY_DARCY = JODHPUR_RESERVOIR_PROFILE.permeabilityDarcies.value ?? 2.5;
export const DEFAULT_RELATIVE_PERMEABILITY_OIL = 1.0; // Conceptual single-phase assumption

export const MOBILITY_DISCLAIMER_NOTES = [
  'Oil mobility (λ_o = k_eff / μ_o) is a conceptual screening representation of fluid flow potential through the Jodhpur Sandstone porous matrix.',
  'Relative permeability (k_ro = 1.0) is currently assumed as single-phase conceptual oil flow; multiphase water/steam relative permeability curves are not modeled.',
  'Permeability (2.5 D) is obtained directly from documented Baghewala reservoir core data (SRC_OIL_PUB_01).',
  'Oil viscosity is dynamically provided by the Step 4.4 viscosity model.',
  'Mobility indicates fluid transmissibility in units of D/cP; actual production rates (BOPD) belong to Step 4.6.',
];
