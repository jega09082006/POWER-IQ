from __future__ import annotations

import os

from fastapi import APIRouter, Header, HTTPException
from jose import jwt, JWTError

from database.connection import APP_STATE
from models.calendar import CalendarDecisionRequest, CalendarEventRequest, CalendarPowerCutRequest
from services.power_strategy import apply_power_cut_strategy

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


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
def list_calendar(days: int = 14):
    return APP_STATE.get("calendar", [])[:days]


@router.get("/{date}")
def get_day(date: str):
    for day in APP_STATE.get("calendar", []):
        if day.get("date") == date:
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")


@router.post("/{date}/event")
def add_event(
    date: str,
    payload: CalendarEventRequest,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    for day in APP_STATE.get("calendar", []):
        if day.get("date") == date:
            day.setdefault("customEvents", [])
            day["customEvents"].append(payload.event)
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")


@router.delete("/{date}/event/{event_index}")
def delete_event(
    date: str,
    event_index: int,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    for day in APP_STATE.get("calendar", []):
        if day.get("date") == date:
            events = day.setdefault("customEvents", [])
            if event_index < 0 or event_index >= len(events):
                raise HTTPException(status_code=404, detail="Calendar event not found")
            events.pop(event_index)
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")


@router.put("/{date}/event")
def set_day_event(
    date: str,
    payload: CalendarEventRequest,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    event = payload.event.strip()
    if not event:
        raise HTTPException(status_code=422, detail="Calendar event is required")

    managed_events = {
        "Normal Working Day",
        "Factory Holiday",
        "Government Shutdown",
        "Maintenance Day",
    }
    for day in APP_STATE.get("calendar", []):
        if day.get("date") == date:
            existing_events = day.setdefault("customEvents", [])
            day["customEvents"] = [
                item for item in existing_events if item not in managed_events
            ]
            day["customEvents"].insert(0, event)
            if event == "Government Shutdown":
                day["gridStatus"] = "power_cut"
                day["powerCutStart"] = day.get("powerCutStart") or "10:00 AM"
                day["powerCutEnd"] = day.get("powerCutEnd") or "04:00 PM"
                apply_power_cut_strategy()
            elif event in {"Normal Working Day", "Factory Holiday", "Maintenance Day"}:
                if day.get("gridStatus") == "power_cut":
                    day["gridStatus"] = "good"
                    day["powerCutStart"] = None
                    day["powerCutEnd"] = None
                    apply_power_cut_strategy()
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")


@router.put("/{date}/decision")
def update_decision(
    date: str,
    payload: CalendarDecisionRequest,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    for day in APP_STATE.get("calendar", []):
        if day.get("date") == date:
            day["gridStatus"] = payload.grid_status
            if payload.grid_status == "power_cut":
                if not payload.power_cut_start or not payload.power_cut_end:
                    raise HTTPException(
                        status_code=422,
                        detail="Power-cut start and end times are required",
                    )
                day["powerCutStart"] = payload.power_cut_start
                day["powerCutEnd"] = payload.power_cut_end
                event = "Government-declared power cut — solar + generator continuity plan"
                if event not in day.setdefault("customEvents", []):
                    day["customEvents"].append(event)
            else:
                day["powerCutStart"] = None
                day["powerCutEnd"] = None
            apply_power_cut_strategy()
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")


@router.post("/powercut")
def add_powercut(
    payload: CalendarPowerCutRequest,
    authorization: str | None = Header(default=None),
):
    _supervisor_required(authorization)
    calendar = APP_STATE.get("calendar", [])
    for day in calendar:
        if day.get("date") == payload.date:
            day["gridStatus"] = "power_cut"
            day["powerCutStart"] = payload.start_time
            day["powerCutEnd"] = payload.end_time
            day.setdefault("customEvents", []).append("Supervisor power cut update")
            return day
    raise HTTPException(status_code=404, detail="Calendar date not found")
