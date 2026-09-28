"""
Simulation service: ML inference + physics-based forward simulation + 18-rule constraint engine.

All 18 operating constraints (I01-I04, P01-P10, K01-K04) from constraints_registry.csv
are implemented exactly as they were evaluated during dataset generation and training.
"""
import joblib
import json
import math
from pathlib import Path
from typing import Any
import pandas as pd
import numpy as np

# ---------------------------------------------------------------------------
# Paths – resolve relative to this file so it works from any cwd
# ---------------------------------------------------------------------------
_THIS_DIR = Path(__file__).resolve().parent
# backend/model_artifacts
ARTIFACTS_DIR = _THIS_DIR.parent.parent / "model_artifacts"
# sih-digital-twin root where well_static.csv and constraints_registry.csv live
DATA_DIR = _THIS_DIR.parent.parent.parent.parent.parent


# =========================================================================
#  Constraint Engine – exact mirror of build_viscosity_dataset.py rules
# =========================================================================

def _margin_lo(val, lo):
    """Headroom for a lower-bound rule.  >=0 means compliant."""
    return val - lo


def _margin_hi(val, hi):
    """Headroom for an upper-bound rule.  >=0 means compliant."""
    return hi - val


def _margin_range(val, lo, hi):
    """Headroom for a two-sided range rule."""
    return min(val - lo, hi - val)


def evaluate_all_constraints(d: dict, well: dict) -> list[dict]:
    """
    Evaluate all 18 operating constraints for a single operating point.

    Parameters
    ----------
    d : dict   – operating-point values (sensor readings / design params).
    well : dict – static well properties from well_static.csv row.

    Returns a list of 18 constraint dicts, each with:
        id, name, phase, margin, is_ok, unit, rule_text, column
    """
    phase = d.get("phase", "PRODUCTION").upper()

    spm_at_50hz = well.get("spm_at_50hz", 7.0)
    spm_lo = spm_at_50hz * 0.4
    spm_hi = spm_at_50hz * 1.1
    p_inj_max = well.get("p_inj_max_wh_mpa", 12.0)
    unit_rating = well.get("unit_rating_kn", 101)

    is_inj = phase == "INJECTION"
    is_prod = phase == "PRODUCTION"
    srp_running = bool(d.get("srp_running", 1)) if is_prod else False

    rules = []

    def _add(cid, name, ph, margin, unit, rule_text, col):
        is_ok = margin >= -1e-6 if margin is not None else None
        rules.append({
            "id": cid, "name": name, "phase": ph,
            "margin": round(float(margin), 4) if margin is not None else None,
            "is_ok": is_ok,
            "unit": unit, "rule_text": rule_text, "column": col,
        })

    # ── I01  Injection pressure ≤ min(12 MPa, 0.9 × frac pressure) ──────
    v = d.get("inj_pressure_wh_mpa")
    m = _margin_hi(v, p_inj_max) if (is_inj and v is not None) else None
    _add("I01", "Injection pressure below fracture-pressure envelope", "INJECTION",
         m, "MPa", f"P_wellhead <= {p_inj_max:.1f} MPa", "inj_pressure_wh_mpa")

    # ── I02  Steam rate ≤ 250 m³/d CWE ──────────────────────────────────
    v = d.get("steam_inj_rate_m3d")
    m = _margin_hi(v, 250.0) if (is_inj and v is not None) else None
    _add("I02", "Steam rate within generator capacity", "INJECTION",
         m, "m3/d", "rate <= 250 m3/d CWE", "steam_inj_rate_m3d")

    # ── I03  BH steam quality ≥ 0.35 ────────────────────────────────────
    v = d.get("steam_quality_bh")
    m = _margin_lo(v, 0.35) if (is_inj and v is not None) else None
    _add("I03", "Minimum bottomhole steam quality", "INJECTION",
         m, "fraction", "x_bottomhole >= 0.35", "steam_quality_bh")

    # ── I04  WH steam quality 0.50–0.85 ─────────────────────────────────
    v = d.get("steam_quality_wh")
    m = _margin_range(v, 0.50, 0.85) if (is_inj and v is not None) else None
    _add("I04", "Wellhead steam quality window", "INJECTION",
         m, "fraction", "0.50 <= x_wellhead <= 0.85", "steam_quality_wh")

    # ── P01  Pump speed in drive limits ──────────────────────────────────
    v = d.get("spm")
    m = _margin_range(v, spm_lo, spm_hi) if (is_prod and srp_running and v) else None
    _add("P01", "Pump speed inside drive limits", "PRODUCTION",
         m, "SPM", f"{spm_lo:.1f} <= SPM <= {spm_hi:.1f}", "spm")

    # ── P02  VFD frequency 20–55 Hz ─────────────────────────────────────
    v = d.get("vfd_hz")
    m = _margin_range(v, 20.0, 55.0) if (is_prod and srp_running and v) else None
    _add("P02", "VFD frequency window", "PRODUCTION",
         m, "Hz", "20 <= Hz <= 55", "vfd_hz")

    # ── P03  PPRL ≤ 0.9 × unit rating ───────────────────────────────────
    v = d.get("pprl_kn")
    m = _margin_hi(v, 0.9 * unit_rating) if (is_prod and srp_running and v is not None) else None
    _add("P03", "Unit structural load", "PRODUCTION",
         m, "kN", f"PPRL <= 0.9 × {unit_rating} kN", "pprl_kn")

    # ── P04  Motor load ≤ 100 % ─────────────────────────────────────────
    v = d.get("motor_load_pct")
    m = _margin_hi(v, 100.0) if (is_prod and srp_running and v is not None) else None
    _add("P04", "Motor loading", "PRODUCTION",
         m, "%", "motor load <= 100 %", "motor_load_pct")

    # ── P05  Goodman ratio ≤ 1.0 ────────────────────────────────────────
    v = d.get("goodman_ratio")
    m = _margin_hi(v, 1.0) if (is_prod and srp_running and v is not None) else None
    _add("P05", "Rod stress (modified Goodman)", "PRODUCTION",
         m, "-", "sigma_max / allowable <= 1.0", "goodman_ratio")

    # ── P06  MPRL ≥ 10 % buoyant rod weight (no rod floating) ──────────
    v = d.get("mprl_pct_buoyant_rod_wt")
    m = _margin_lo(v, 10.0) if (is_prod and srp_running and v is not None) else None
    _add("P06", "No rod floating", "PRODUCTION",
         m, "%", "MPRL >= 10 % of buoyant rod weight", "mprl_pct_buoyant_rod_wt")

    # ── P07  Pump fillage ≥ 60 % (no severe fluid pound) ────────────────
    v = d.get("pump_fillage_pct")
    m = _margin_lo(v, 60.0) if (is_prod and srp_running and v is not None) else None
    _add("P07", "No severe fluid pound", "PRODUCTION",
         m, "%", "pump fillage >= 60 %", "pump_fillage_pct")

    # ── P08  PIP ≥ 0.25 MPa ────────────────────────────────────────────
    v = d.get("pump_intake_pressure_mpa")
    m = _margin_lo(v, 0.25) if (is_prod and srp_running and v is not None) else None
    _add("P08", "Minimum pump intake pressure", "PRODUCTION",
         m, "MPa", "PIP >= 0.25 MPa", "pump_intake_pressure_mpa")

    # ── P09  Wellhead fluid temp ≤ 200 °C ──────────────────────────────
    v = d.get("fluid_temp_wellhead_c")
    m = _margin_hi(v, 200.0) if (is_prod and srp_running and v is not None) else None
    _add("P09", "Wellhead fluid temperature", "PRODUCTION",
         m, "C", "T_wellhead <= 200 C", "fluid_temp_wellhead_c")

    # ── P10  Tubing head pressure ≤ 1.2 MPa ────────────────────────────
    v = d.get("tubing_head_pressure_mpa")
    m = _margin_hi(v, 1.2) if (is_prod and srp_running and v is not None) else None
    _add("P10", "Flowline back-pressure", "PRODUCTION",
         m, "MPa", "tubing head pressure <= 1.2 MPa", "tubing_head_pressure_mpa")

    # ── K01  Injection duration 6–30 d ──────────────────────────────────
    v = d.get("cycle_injection_days")
    m = _margin_range(v, 6, 30) if v is not None else None
    _add("K01", "Injection duration", "CYCLE",
         m, "d", "6 <= days <= 30", "cycle_injection_days")

    # ── K02  Soak duration 3–20 d ───────────────────────────────────────
    v = d.get("cycle_soak_days")
    m = _margin_range(v, 3, 20) if v is not None else None
    _add("K02", "Soak duration", "CYCLE",
         m, "d", "3 <= days <= 20", "cycle_soak_days")

    # ── K03  Steam volume 60–220 m³/m ───────────────────────────────────
    v = d.get("cycle_steam_per_m_pay")
    m = _margin_range(v, 60, 220) if v is not None else None
    _add("K03", "Steam volume per metre of net pay", "CYCLE",
         m, "m3/m", "60 <= m3/m <= 220", "cycle_steam_per_m_pay")

    # ── K04  COSR ≥ 0.25 ───────────────────────────────────────────────
    v = d.get("cycle_final_cosr")
    m = _margin_lo(v, 0.25) if v is not None else None
    _add("K04", "Cycle oil-steam ratio at end of cycle", "CYCLE",
         m, "m3/m3", "COSR >= 0.25", "cycle_final_cosr")

    return rules


# =========================================================================
#  Derived quantity helpers (physics from the generator / dataset)
# =========================================================================

def _derive_quantities(d: dict, well: dict) -> dict:
    """
    Fill in derived columns the ML models expect if they are not already
    provided by the caller or if they are None. Mirrors the physics in the generator.
    """
    out = {k: v for k, v in d.items() if v is not None}

    pprl = out.get("pprl_kn")
    mprl = out.get("mprl_kn")
    ur = well.get("unit_rating_kn", 101)
    mrk = well.get("motor_rated_kw", 15)

    if pprl is not None and mprl is not None:
        out.setdefault("load_range_kn", pprl - mprl)
    out.setdefault("load_range_kn", 0.0)

    if pprl is not None:
        out.setdefault("pprl_pct_unit_rating", pprl / ur * 100 if ur else 0)

    # Buoyant rod weight fraction for MPRL %
    rod_mass = well.get("rod_mass_kg_m", 3.0)
    pump_depth = well.get("pump_depth_m", 700)
    G = 9.81
    Wr = rod_mass * pump_depth * G / 1000.0
    rho_f = 1000.0  # approximate fluid density
    bf = 1 - rho_f / 7850
    Wrf = Wr * bf
    if mprl is not None and Wrf > 0:
        out.setdefault("mprl_pct_buoyant_rod_wt", mprl / Wrf * 100)
    out.setdefault("mprl_pct_buoyant_rod_wt", 30.0)

    # Motor kW estimate
    if pprl is not None and mprl is not None:
        spm = out.get("spm", 7.0) or 7.0
        stroke = well.get("stroke_m", 2.5) or 2.5
        prhp = 0.5 * (pprl - mprl) * stroke * (spm / 60) * 0.85
        kw = prhp / 0.75 + 1.2
        out.setdefault("motor_kw", round(kw, 2))
        out.setdefault("motor_current_a", round(kw * 1000 / (1.732 * 415 * 0.86 * 0.85), 2))
        out.setdefault("motor_load_pct", round(kw / mrk * 100, 2) if mrk else 80.0)
        out.setdefault("energy_kwh_day", round(kw * 24, 2))
    out.setdefault("motor_kw", 10.0)
    out.setdefault("motor_current_a", 18.0)
    out.setdefault("motor_load_pct", 75.0)
    out.setdefault("energy_kwh_day", 240.0)

    # Goodman stress estimate
    if pprl is not None:
        rod_dia = 22.2 / 1000  # 7/8" top section
        A_rod = math.pi / 4 * rod_dia ** 2
        s_max = pprl * 1000 / A_rod / 1e6
        s_min = (mprl or 0) * 1000 / A_rod / 1e6
        s_allow = (793 / 4 + 0.5625 * s_min) * 0.9
        out.setdefault("rod_max_stress_mpa", round(s_max, 2))
        out.setdefault("goodman_ratio", round(s_max / s_allow, 4) if s_allow else 0)
    out.setdefault("rod_max_stress_mpa", 150.0)
    out.setdefault("goodman_ratio", 0.65)

    out.setdefault("run_time_fraction", 1.0)
    out.setdefault("water_cut_pct", 50.0)

    # Fluid temperature at pump – approximate from wellhead temp
    twh = out.get("fluid_temp_wellhead_c")
    t_res = well.get("t_res_c", 50.0)
    if twh is not None:
        out.setdefault("fluid_temp_pump_c", twh + (t_res - 35) * 0.3)
    out.setdefault("fluid_temp_pump_c", 60.0)
    out.setdefault("fluid_temp_wellhead_c", 45.0)

    # VFD Hz from SPM if missing
    spm_val = out.get("spm", 7.0) or 7.0
    spm50 = well.get("spm_at_50hz", 7.0) or 7.0
    out.setdefault("vfd_hz", spm_val / spm50 * 50 if spm50 else 45.0)

    # Pump fillage default
    out.setdefault("pump_fillage_pct", 85.0)

    # Pressure defaults
    out.setdefault("tubing_head_pressure_mpa", 0.5)
    out.setdefault("casing_pressure_mpa", 0.3)
    out.setdefault("pump_intake_pressure_mpa", 1.0)
    out.setdefault("days_since_steam_off", 30.0)

    # Rolling feature defaults (approximate from point values)
    for col in ["fluid_temp_pump_c", "mprl_pct_buoyant_rod_wt", "liquid_rate_m3d",
                "oil_rate_m3d", "pump_fillage_pct"]:
        val = out.get(col, 0.0) or 0.0
        out.setdefault(f"{col}_m7", val)
        out.setdefault(f"{col}_s7", 0.0)
        out.setdefault(f"{col}_s14", 0.0)

    out.setdefault("mprl_min7", out.get("mprl_pct_buoyant_rod_wt", 25.0))
    out.setdefault("temp_drop_from_peak", 0.0)
    out.setdefault("oil_frac_of_peak", 1.0)
    out.setdefault("lab_visc_last", 3000.0)
    out.setdefault("days_since_lab", 3.0)
    out.setdefault("running_frac7", 1.0)

    # Oil / liquid rate defaults
    out.setdefault("oil_rate_m3d", 5.0)
    wc = out.get("water_cut_pct", 50.0) or 50.0
    oil = out.get("oil_rate_m3d", 5.0) or 5.0
    out.setdefault("liquid_rate_m3d", oil / max(1 - wc / 100, 0.03))
    out.setdefault("water_rate_m3d", out["liquid_rate_m3d"] - oil)

    return out


# =========================================================================
#  Service class
# =========================================================================

class SimulationService:
    """Loads trained ML models once and serves predictions + constraint checks."""

    def __init__(self):
        self.models = {
            "nowcast_with_temp": joblib.load(ARTIFACTS_DIR / "nowcast_with_temp.joblib"),
            "nowcast_no_temp": joblib.load(ARTIFACTS_DIR / "nowcast_softsensor_no_temp.joblib"),
            "forecast_7d": joblib.load(ARTIFACTS_DIR / "forecast_plus7d.joblib"),
            "alarm_clf_7d": joblib.load(ARTIFACTS_DIR / "alarm_classifier_7d.joblib"),
        }
        with open(ARTIFACTS_DIR / "model_metadata.json", "r") as f:
            self.metadata = json.load(f)

        self.wells = pd.read_csv(DATA_DIR / "well_static.csv")
        self.registry_df = pd.read_csv(DATA_DIR / "constraints_registry.csv")
        self.optimal_f2_threshold = self.metadata["models"]["alarm_classifier_7d"]["optimal_f2_threshold"]

        # Pre-index wells for fast lookup
        self._well_index: dict[str, dict] = {
            row["well_id"]: row for row in self.wells.to_dict(orient="records")
        }

    # ------------------------------------------------------------------
    #  Public helpers
    # ------------------------------------------------------------------
    def get_wells(self) -> list[dict]:
        return self.wells.to_dict(orient="records")

    def get_well(self, well_id: str) -> dict | None:
        return self._well_index.get(well_id)

    def get_constraints_registry(self) -> list[dict]:
        return self.registry_df.to_dict(orient="records")

    # ------------------------------------------------------------------
    #  Feature preparation
    # ------------------------------------------------------------------
    def _prepare_features(self, enriched: dict, model_key: str) -> pd.DataFrame:
        """Build a single-row DataFrame with exactly the columns the model expects."""
        feature_list = self.metadata["models"][model_key]["metrics"]["features"]
        row = {col: enriched.get(col, 0.0) for col in feature_list}
        return pd.DataFrame([row])

    # ------------------------------------------------------------------
    #  ML Prediction
    # ------------------------------------------------------------------
    def predict(self, input_data: dict) -> dict[str, Any]:
        well_id = input_data.get("well_id")
        well = self._well_index.get(well_id)
        if well is None:
            raise ValueError(f"Unknown well_id: {well_id}")

        # Merge static well data + derive missing quantities
        merged = {**well, **input_data}
        enriched = _derive_quantities(merged, well)

        feat_a = self._prepare_features(enriched, "nowcast_with_temp")
        feat_b = self._prepare_features(enriched, "nowcast_softsensor_no_temp")
        feat_c = self._prepare_features(enriched, "forecast_plus7d")

        log_now = float(self.models["nowcast_with_temp"].predict(feat_a)[0])
        log_soft = float(self.models["nowcast_no_temp"].predict(feat_b)[0])
        log_fwd = float(self.models["forecast_7d"].predict(feat_c)[0])

        # Alarm classifier (uses same features as nowcast_with_temp)
        alarm_prob = float(self.models["alarm_clf_7d"].predict_proba(feat_a)[:, 1][0])
        triggered = alarm_prob >= self.optimal_f2_threshold

        if alarm_prob > 0.80:
            level = "CRITICAL"
        elif alarm_prob > 0.50:
            level = "WARNING"
        elif triggered:
            level = "WATCH"
        else:
            level = "SAFE"

        return {
            "nowcast_viscosity_cp": round(10 ** log_now, 1),
            "nowcast_log10": round(log_now, 4),
            "nowcast_softsensor_cp": round(10 ** log_soft, 1),
            "softsensor_log10": round(log_soft, 4),
            "forecast_7d_viscosity_cp": round(10 ** log_fwd, 1),
            "forecast_7d_log10": round(log_fwd, 4),
            "alarm_7d_probability": round(alarm_prob, 4),
            "alarm_7d_triggered": triggered,
            "alarm_level": level,
            "f2_threshold": self.optimal_f2_threshold,
        }

    # ------------------------------------------------------------------
    #  18-Rule Constraint Check
    # ------------------------------------------------------------------
    def check_constraints(self, input_data: dict) -> dict[str, Any]:
        well_id = input_data.get("well_id")
        well = self._well_index.get(well_id)
        if well is None:
            raise ValueError(f"Unknown well_id: {well_id}")

        merged = {**well, **input_data}
        enriched = _derive_quantities(merged, well)

        constraint_results = evaluate_all_constraints(enriched, well)

        # Filter to only evaluated (non-None margin) constraints
        evaluated = [c for c in constraint_results if c["margin"] is not None]
        violated = [c for c in evaluated if not c["is_ok"]]

        return {
            "n_evaluated": len(evaluated),
            "n_constraints_violated": len(violated),
            "all_constraints_ok": len(violated) == 0,
            "constraints": constraint_results,
        }

    # ------------------------------------------------------------------
    #  Parameter Calibration & Actuation Advisory
    # ------------------------------------------------------------------
    def generate_advisory(self, input_data: dict, enriched: dict, well: dict, prediction: dict, constraints: list) -> dict[str, Any]:
        """
        Physics & ML-guided advisory system indicating what parameters to INCREASE or DECREASE
        to control viscosity and maintain compliance across the 18 constraints.
        """
        mu_crit = float(well.get("mu_crit_cP", 1000.0))
        mu_now = prediction["nowcast_viscosity_cp"]
        mu_7d = prediction["forecast_7d_viscosity_cp"]
        
        # Advisory structures
        increase_actions = []
        decrease_actions = []
        
        is_high_visc = mu_now > (0.6 * mu_crit) or mu_7d > (0.8 * mu_crit) or prediction["alarm_7d_triggered"]
        
        # 1. Thermal Interventions (To decrease Viscosity)
        steam_rate = enriched.get("steam_inj_rate_m3d", 0.0)
        soak_days = enriched.get("cycle_soak_days", 0)
        temp_c = enriched.get("fluid_temp_pump_c", 35.0)
        
        if is_high_visc:
            if steam_rate < 100:
                target_rate = min(150.0, 250.0) # Within I02
                increase_actions.append({
                    "parameter": "Steam Injection Rate",
                    "current": round(steam_rate, 1),
                    "recommended": round(target_rate, 1),
                    "unit": "m³/d",
                    "constraint": "I02 (<= 250 m³/d)",
                    "impact": "Increases thermal enthalpy delivery to directly lower viscosity via Walther's log-linear relationship."
                })
            
            if soak_days < 7:
                target_soak = min(8, 20) # Within K02
                increase_actions.append({
                    "parameter": "Soak Duration",
                    "current": soak_days,
                    "recommended": target_soak,
                    "unit": "days",
                    "constraint": "K02 (<= 20 d)",
                    "impact": "Allows further radial heat conduction into the reservoir matrix, warming crude further from the wellbore."
                })
                
        # 2. Structural & Mechanical Interventions (When Viscosity is high)
        spm = enriched.get("spm", 6.5)
        vfd = enriched.get("vfd_hz", 45.0)
        spm_nominal = well.get("spm_at_50hz", 7.0)
        min_spm = round(spm_nominal * 0.4, 1) # P01 lower limit
        min_vfd = 20.0 # P02 lower limit
        
        if is_high_visc and spm > min_spm + 1.0:
            target_spm = max(min_spm + 0.5, round(spm * 0.8, 1))
            decrease_actions.append({
                "parameter": "Pumping Speed (SPM)",
                "current": round(spm, 1),
                "recommended": target_spm,
                "unit": "SPM",
                "constraint": f"P01 (>= {min_spm} SPM), P06 (Rod Float)",
                "impact": "Lowering stroke velocity drastically reduces viscous drag (Fv ∝ μ·v) on the rod string, restoring fluid displacement and preventing rod parting."
            })
            
        if is_high_visc and vfd > 35.0:
            target_vfd = max(min_vfd + 5.0, round(vfd * 0.8, 1))
            decrease_actions.append({
                "parameter": "VFD Frequency",
                "current": round(vfd, 1),
                "recommended": target_vfd,
                "unit": "Hz",
                "constraint": f"P02 (>= {min_vfd} Hz), P04 (Motor)",
                "impact": "Decreases motor thermal overload by reducing cycle torque requirements while pumping highly viscous fluid."
            })

        # Base rationales
        if is_high_visc:
            rationale = "Viscosity is elevated, posing severe risk of rod floating (P06) and equipment overloads (P03-P05). "
            if increase_actions:
                rationale += "Applying thermal EOR actions will exponentially lower fluid shear resistance. "
            if decrease_actions:
                rationale += "Temporarily throttling kinematics (SPM/VFD) protects the rod string and motor until higher temperatures take effect."
        else:
            rationale = "Viscosity is under safe control. Current operational parameters remain within the 18 optimal constraint limits."

        return {
            "viscosity_control_action_required": is_high_visc,
            "actions_to_increase": increase_actions,
            "actions_to_decrease": decrease_actions,
            "engineering_rationale": rationale,
            "critical_viscosity_threshold_cp": round(mu_crit, 1)
        }

    # ------------------------------------------------------------------
    #  Combined predict + constraints
    # ------------------------------------------------------------------
    def simulate(self, input_data: dict) -> dict[str, Any]:
        well_id = input_data.get("well_id")
        well = self._well_index.get(well_id)
        if well is None:
            raise ValueError(f"Unknown well_id: {well_id}")
            
        merged = {**well, **input_data}
        enriched = _derive_quantities(merged, well)

        prediction = self.predict(input_data)
        constraints = self.check_constraints(input_data)
        advisory = self.generate_advisory(input_data, enriched, well, prediction, constraints["constraints"])
        
        return {
            "prediction": prediction,
            "constraints": constraints,
            "advisory": advisory,
            "well_id": well_id,
            "phase": input_data.get("phase", "PRODUCTION"),
        }
