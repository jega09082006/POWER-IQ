from __future__ import annotations

import os
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Header
from jose import JWTError, jwt

from database.connection import APP_STATE

router = APIRouter(prefix="/api/supervisor", tags=["supervisor"])


def _create_token() -> str:
    secret = os.getenv("JWT_SECRET", "supersecret")
    payload = {"sub": "supervisor", "exp": datetime.utcnow() + timedelta(hours=8)}
    return jwt.encode(payload, secret, algorithm="HS256")


def _supervisor_required(authorization: str | None) -> None:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        jwt.decode(
            authorization.split(" ", 1)[1],
            os.getenv("JWT_SECRET", "supersecret"),
            algorithms=["HS256"],
        )
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid JWT token") from exc


@router.post("/login")
def login(pin: dict[str, str]):
    entered_pin = str(pin.get("pin", ""))
    expected_pin = os.getenv("SUPERVISOR_PIN", "1234")
    if entered_pin != expected_pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    token = _create_token()
    APP_STATE["supervisor_token"] = token
    return {"token": token, "expires_in": 28800}


@router.get("/overview")
def overview(authorization: str | None = Header(default=None)):
    _supervisor_required(authorization)

    machines = APP_STATE.get("machines", [])
    total_consumption_kwh = sum(float(machine.get("currentKW", 0)) for machine in machines if machine.get("status") == "running")
    total_solar_kwh = 420.0
    total_grid_kwh = 12.0
    cost_saved = round(total_solar_kwh * 0.38)

    return {
        "total_consumption_kwh": round(total_consumption_kwh, 2),
        "total_solar_kwh": total_solar_kwh,
        "total_grid_kwh": total_grid_kwh,
        "cost_saved": cost_saved,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
    }


@router.post("/machines/{machine_id}/override")
def override_machine(machine_id: str, payload: dict, authorization: str | None = Header(default=None)):
    _supervisor_required(authorization)

    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            action = payload.get("action", "off")
            machine["status"] = "running" if action == "on" else "off"
            machine["currentKW"] = float(machine.get("kWRating", 0)) if action == "on" else 0
            machine["lastModifiedBy"] = "Supervisor Override"
            machine["isApproved"] = True
            return machine
    raise HTTPException(status_code=404, detail="Machine not found")


@router.post("/battery/force-charge")
def force_grid_battery_charge(authorization: str | None = Header(default=None)):
    _supervisor_required(authorization)
    power = APP_STATE.get("power", {})
    power["forceGridCharging"] = True
    power["forcedGridChargeKW"] = 25
    power["powerMode"] = "forced_grid_charging"
    power["batteryCharging"] = True
    power["currentSource"] = "Grid Charging"
    power["gridKW"] = max(float(power.get("gridKW", 0)), 25)
    power["batteryPercent"] = 100
    power["batteryChargeReason"] = "Supervisor forced grid recharge"
    return power


@router.post("/battery/stop-force-charge")
def stop_force_grid_battery_charge(authorization: str | None = Header(default=None)):
    _supervisor_required(authorization)
    power = APP_STATE.get("power", {})
    power["forceGridCharging"] = False
    power["forcedGridChargeKW"] = 0
    power["batteryCharging"] = False
    power["batteryChargeReason"] = None
    power["powerMode"] = "normal"
    power["currentSource"] = "Solar"
    power["gridKW"] = 0
    return power
