import { API_BASE_URL } from '../config';

export interface MLPrediction {
  nowcast_viscosity_cp: number;
  nowcast_log10: number;
  nowcast_softsensor_cp: number;
  softsensor_log10: number;
  forecast_7d_viscosity_cp: number;
  forecast_7d_log10: number;
  alarm_7d_probability: number;
  alarm_7d_triggered: boolean;
  alarm_level: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL';
  f2_threshold: number;
}

export interface ConstraintResult {
  id: string;
  name: string;
  phase: string;
  margin: number | null;
  is_ok: boolean | null;
  unit: string;
  rule_text: string;
  column: string;
}

export interface ConstraintsResponse {
  n_evaluated: number;
  n_constraints_violated: number;
  all_constraints_ok: boolean;
  constraints: ConstraintResult[];
}

export interface AdvisoryAction {
  parameter: string;
  current: number;
  recommended: number;
  unit: string;
  constraint: string;
  impact: string;
}

export interface MLAdvisory {
  viscosity_control_action_required: boolean;
  actions_to_increase: AdvisoryAction[];
  actions_to_decrease: AdvisoryAction[];
  engineering_rationale: string;
  critical_viscosity_threshold_cp: number;
}

export interface MLSimulateResponse {
  prediction: MLPrediction;
  constraints: ConstraintsResponse;
  advisory: MLAdvisory;
  well_id: string;
  phase: string;
}

export interface WellRecord {
  well_id: string;
  depth_m: number;
  net_pay_m: number;
  porosity: number;
  api_gravity: number;
  rho_oil: number;
  t_res_c: number;
  mu_res_cP: number;
  mu_100c_cP: number;
  pump_depth_m: number;
  stroke_m: number;
  plunger_mm: number;
  spm_at_50hz: number;
  unit_rating_kn: number;
  motor_rated_kw: number;
  ctrl_mode: string;
  p_inj_max_wh_mpa: number;
  mu_crit_cP: number;
  split: string;
}

export async function fetchWells(): Promise<WellRecord[]> {
  const res = await fetch(`${API_BASE_URL}/api/simulation/wells`);
  if (!res.ok) throw new Error('Failed to fetch wells list');
  return res.json();
}

export async function runMLSimulation(payload: {
  well_id: string;
  phase?: string;
  spm?: number;
  vfd_hz?: number;
  fluid_temp_pump_c?: number;
  fluid_temp_wellhead_c?: number;
  pprl_kn?: number;
  mprl_kn?: number;
  steam_inj_rate_m3d?: number;
  inj_pressure_wh_mpa?: number;
  cycle_soak_days?: number;
  cycle_injection_days?: number;
  cycle_steam_per_m_pay?: number;
  water_cut_pct?: number;
  oil_rate_m3d?: number;
  days_since_steam_off?: number;
}): Promise<MLSimulateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/simulation/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Simulation failed: ${errorText}`);
  }
  return res.json();
}
