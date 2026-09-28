from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class SimulationInput(BaseModel):
    """Operating-point input aligned with viscosity_prediction_dataset.csv columns."""
    well_id: str = Field(..., description="Well identifier from well_static.csv, e.g. CSS-001")

    # Phase of the current CSS cycle
    phase: str = Field(default="PRODUCTION", description="INJECTION, SOAK, or PRODUCTION")

    # ── Cycle Design Parameters (K-constraints) ─────────────────────────
    cycle: Optional[int] = 1
    cycle_injection_days: Optional[int] = None
    cycle_soak_days: Optional[int] = None
    cycle_steam_per_m_pay: Optional[float] = None
    cycle_final_cosr: Optional[float] = None

    # ── Injection Phase Parameters (I-constraints) ──────────────────────
    inj_pressure_wh_mpa: Optional[float] = None
    steam_inj_rate_m3d: Optional[float] = None
    steam_quality_bh: Optional[float] = None
    steam_quality_wh: Optional[float] = None

    # ── Production Phase Parameters (P-constraints & Features) ──────────
    days_since_steam_off: Optional[float] = 30
    spm: Optional[float] = None
    vfd_hz: Optional[float] = None
    pump_fillage_pct: Optional[float] = None
    pump_intake_pressure_mpa: Optional[float] = None
    fluid_temp_pump_c: Optional[float] = None
    fluid_temp_wellhead_c: Optional[float] = None
    tubing_head_pressure_mpa: Optional[float] = None
    casing_pressure_mpa: Optional[float] = None

    # ── Dynamometer & Electrical ────────────────────────────────────────
    pprl_kn: Optional[float] = None
    mprl_kn: Optional[float] = None
    motor_kw: Optional[float] = None
    motor_load_pct: Optional[float] = None
    goodman_ratio: Optional[float] = None

    # ── Production Rates ────────────────────────────────────────────────
    oil_rate_m3d: Optional[float] = None
    water_cut_pct: Optional[float] = None
    liquid_rate_m3d: Optional[float] = None

    # ── Lab Sample ──────────────────────────────────────────────────────
    lab_visc_last: Optional[float] = None
    days_since_lab: Optional[float] = None

    # SRP running flag
    srp_running: Optional[int] = 1

    class Config:
        extra = "allow"


class ConstraintResult(BaseModel):
    id: str
    name: str
    phase: str
    margin: Optional[float]
    is_ok: Optional[bool]
    unit: str
    rule_text: str
    column: str


class ConstraintCheckResponse(BaseModel):
    n_evaluated: int
    n_constraints_violated: int
    all_constraints_ok: bool
    constraints: List[ConstraintResult]


class PredictionResponse(BaseModel):
    nowcast_viscosity_cp: float
    nowcast_log10: float
    nowcast_softsensor_cp: float
    softsensor_log10: float
    forecast_7d_viscosity_cp: float
    forecast_7d_log10: float
    alarm_7d_probability: float
    alarm_7d_triggered: bool
    alarm_level: str
    f2_threshold: float


class SimulateResponse(BaseModel):
    prediction: PredictionResponse
    constraints: ConstraintCheckResponse
    well_id: str
    phase: str
