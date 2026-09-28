"""
FastAPI router for ML-powered simulation, prediction, and 18-rule constraint checking.

Endpoints:
  GET  /simulation/wells              – list calibrated wells
  GET  /simulation/wells/{well_id}    – single well detail
  GET  /simulation/constraints        – 18-rule constraint registry
  POST /simulation/predict            – ML inference (nowcast, soft-sensor, 7d forecast, alarm)
  POST /simulation/check-constraints  – evaluate 18 rules for an operating point
  POST /simulation/simulate           – combined prediction + constraint check
  GET  /simulation/model-info         – model metadata and performance metrics
"""

from fastapi import APIRouter, HTTPException
from app.schemas.simulation_schemas import (
    SimulationInput,
    PredictionResponse,
    ConstraintCheckResponse,
    SimulateResponse,
)
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["simulation"])

# Initialise service once (models loaded into memory)
_svc: SimulationService | None = None


def _get_svc() -> SimulationService:
    global _svc
    if _svc is None:
        _svc = SimulationService()
    return _svc


# ── Wells ───────────────────────────────────────────────────────────────

@router.get("/wells")
def list_wells():
    """Return all 30 calibrated wells from well_static.csv."""
    return _get_svc().get_wells()


@router.get("/wells/{well_id}")
def get_well(well_id: str):
    """Return static properties for a single well."""
    well = _get_svc().get_well(well_id)
    if well is None:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")
    return well


# ── Constraints Registry ────────────────────────────────────────────────

@router.get("/constraints")
def list_constraints():
    """Return the full 18-rule operating constraint registry."""
    return _get_svc().get_constraints_registry()


# ── ML Prediction ───────────────────────────────────────────────────────

@router.post("/predict")
def predict(body: SimulationInput):
    """
    Run ML inference for a single operating point.

    Returns nowcast viscosity (with and without temperature), 7-day forecast,
    and alarm probability with F2-calibrated alert level.
    """
    try:
        result = _get_svc().predict(body.model_dump(exclude_none=False))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Constraint Evaluation ──────────────────────────────────────────────

@router.post("/check-constraints")
def check_constraints(body: SimulationInput):
    """
    Evaluate all 18 operating constraints (I01-I04, P01-P10, K01-K04)
    for the given operating point.  Returns margin and compliance for each rule.
    """
    try:
        result = _get_svc().check_constraints(body.model_dump(exclude_none=False))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Combined Simulation ────────────────────────────────────────────────

@router.post("/simulate")
def simulate(body: SimulationInput):
    """
    Combined endpoint: runs ML prediction AND evaluates all 18 constraints
    in a single call.
    """
    try:
        result = _get_svc().simulate(body.model_dump(exclude_none=False))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Model Info ──────────────────────────────────────────────────────────

@router.get("/model-info")
def model_info():
    """Return trained model metadata, performance metrics, and feature schemas."""
    svc = _get_svc()
    meta = svc.metadata.copy()
    # Strip full feature lists from inline response (they are large)
    for model_key in meta.get("models", {}):
        metrics = meta["models"][model_key].get("metrics", {})
        if "features" in metrics:
            metrics["feature_count"] = len(metrics["features"])
            del metrics["features"]
    if "feature_schemas" in meta:
        for key in meta["feature_schemas"]:
            meta["feature_schemas"][key] = f"{len(meta['feature_schemas'][key])} features"
    return meta
