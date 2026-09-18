from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError

from database.connection import APP_STATE
from models.generator import GeneratorFuelRequest, GeneratorStatusRequest

router = APIRouter(prefix="/api/generator", tags=["generator"])


def _supervisor_required(auth: str | None):
    if auth is None or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = auth.split(" ", 1)[1]
    try:
        jwt.decode(token, os.getenv("JWT_SECRET", "supersecret"), algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid JWT token") from exc
    return True


@router.get("")
def get_generator():
    return APP_STATE.get("generator", {})


@router.post("/fuel")
def add_fuel(payload: GeneratorFuelRequest, authorization: str | None = None):
    _supervisor_required(authorization)
    generator = APP_STATE.get("generator", {})
    generator["fuelLevelLitres"] = min(
        generator.get("fuelCapacityLitres", 0),
        float(generator.get("fuelLevelLitres", 0)) + float(payload.litres_added),
    )
    generator["lastRefillDate"] = "today"
    return generator


@router.post("/status")
def set_status(payload: GeneratorStatusRequest, authorization: str | None = None):
    _supervisor_required(authorization)
    generator = APP_STATE.get("generator", {})
    generator["status"] = payload.status
    return generator


@router.get("/requirement")
def get_requirement():
    generator = APP_STATE.get("generator", {})
    running_load = sum(float(machine.get("currentKW", 0)) for machine in APP_STATE.get("machines", []) if machine.get("status") == "running")
    current_fuel = float(generator.get("fuelLevelLitres", 0))
    needed = float(generator.get("fuelNeededForCut", 0))
    shortfall = max(0.0, needed - current_fuel)
    return {
        "cut_duration_hours": 6.0,
        "factory_avg_kw": round(running_load / max(1, len(APP_STATE.get("machines", []))), 2),
        "fuel_needed_litres": needed,
        "current_fuel_litres": current_fuel,
        "shortfall_litres": round(shortfall, 2),
        "is_sufficient": shortfall <= 0,
    }
