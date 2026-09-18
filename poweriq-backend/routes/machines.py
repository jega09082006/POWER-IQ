from __future__ import annotations

import os
from datetime import datetime
from datetime import timedelta

from fastapi import APIRouter, Header, HTTPException
from jose import JWTError, jwt

from database.connection import APP_STATE
from models.machine import MachineCreateRequest, MachineScheduleRequest, MachineToggleRequest

router = APIRouter(prefix="/api/machines", tags=["machines"])


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


@router.get("")
def list_machines():
    return APP_STATE.get("machines", [])


@router.post("")
def create_machine(
    payload: MachineCreateRequest,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    machine_id = f"m{len(APP_STATE.get('machines', [])) + 1}"
    existing_ids = {machine.get("id") for machine in APP_STATE.get("machines", [])}
    while machine_id in existing_ids:
        machine_id = f"m{int(machine_id[1:]) + 1}"

    machine = {
        "id": machine_id,
        "name": payload.name.strip(),
        "kWRating": payload.kWRating,
        "currentKW": 0,
        "status": "scheduled" if payload.scheduledOn else "off",
        "scheduledOn": payload.scheduledOn,
        "scheduledOff": payload.scheduledOff,
        "priority": payload.priority,
        "isApproved": True,
        "lastModifiedBy": "Supervisor",
    }
    if not machine["name"]:
        raise HTTPException(status_code=422, detail="Machine name is required")
    APP_STATE["machines"].append(machine)
    return machine


@router.get("/{machine_id}")
def get_machine(machine_id: str):
    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            return machine
    raise HTTPException(status_code=404, detail="Machine not found")


@router.delete("/{machine_id}")
def delete_machine(
    machine_id: str,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    machines = APP_STATE.get("machines", [])
    for index, machine in enumerate(machines):
        if machine.get("id") == machine_id:
            return machines.pop(index)
    raise HTTPException(status_code=404, detail="Machine not found")


@router.post("/{machine_id}/toggle")
def toggle_machine(machine_id: str, payload: MachineToggleRequest):
    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            new_status = "running" if payload.action == "on" else "off"
            machine["status"] = new_status
            machine["currentKW"] = float(machine.get("kWRating", 0)) * 0.95 if new_status == "running" else 0
            machine["lastModifiedBy"] = "Supervisor Override" if APP_STATE.get("supervisor_token") else "Worker"
            return machine
    raise HTTPException(status_code=404, detail="Machine not found")


@router.post("/{machine_id}/schedule")
def schedule_machine(machine_id: str, payload: MachineScheduleRequest):
    now = datetime.now()
    try:
        target = datetime.strptime(payload.scheduled_on, "%H:%M")
        schedule_day = datetime.strptime(
            payload.scheduled_date or now.strftime("%Y-%m-%d"),
            "%Y-%m-%d",
        )
        target_date = schedule_day.replace(
            hour=target.hour,
            minute=target.minute,
            second=0,
            microsecond=0,
        )
    except Exception:
        target_date = now

    if target_date <= now:
        is_less_than_12_hours = True
    else:
        diff_hours = (target_date - now).total_seconds() / 3600
        is_less_than_12_hours = diff_hours < 12

    if is_less_than_12_hours:
        raise HTTPException(
            status_code=400,
            detail={"error": True, "message": "Schedule must be set at least 12 hours before start time"},
        )

    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            scheduled_date = payload.scheduled_date or datetime.now().strftime("%Y-%m-%d")
            weekly_schedule = machine.setdefault("weeklySchedule", {})
            weekly_schedule[scheduled_date] = {
                "scheduledOn": payload.scheduled_on,
                "scheduledOff": payload.scheduled_off,
            }
            machine["scheduledOn"] = payload.scheduled_on
            machine["scheduledOff"] = payload.scheduled_off
            machine["scheduleDate"] = scheduled_date
            machine["status"] = machine.get("status") if machine.get("status") == "running" else "scheduled"
            machine["isApproved"] = False
            machine["lastModifiedBy"] = "Supervisor" if APP_STATE.get("supervisor_token") else "Worker"
            return machine
    raise HTTPException(status_code=404, detail="Machine not found")


@router.delete("/{machine_id}/schedule")
def clear_schedule(machine_id: str):
    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            machine["scheduledOn"] = None
            machine["scheduledOff"] = None
            machine["status"] = "off"
            return machine
    raise HTTPException(status_code=404, detail="Machine not found")


@router.get("/{machine_id}/recommendation")
def get_recommendation(machine_id: str):
    for machine in APP_STATE.get("machines", []):
        if machine.get("id") == machine_id:
            hour = datetime.now().hour
            if 9 <= hour <= 15:
                return {"rating": "good", "message": "Solar is strong at this time — good choice"}
            if 17 <= hour <= 21:
                return {"rating": "warning", "message": "Grid will be expensive — consider shifting"}
            return {"rating": "danger", "message": "Power cut expected — machine will pause"}
    raise HTTPException(status_code=404, detail="Machine not found")
