from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from database.connection import APP_STATE


def _cut_window(day: dict[str, Any]) -> tuple[datetime, datetime] | None:
    date = day.get("date")
    start = day.get("powerCutStart")
    end = day.get("powerCutEnd")
    if not date or not start or not end:
        return None

    try:
        start_time = datetime.strptime(f"{date} {start}", "%Y-%m-%d %I:%M %p")
        end_time = datetime.strptime(f"{date} {end}", "%Y-%m-%d %I:%M %p")
        if end_time <= start_time:
            end_time += timedelta(days=1)
        return start_time, end_time
    except ValueError:
        return None


def apply_power_cut_strategy(now: datetime | None = None) -> dict[str, Any]:
    now = now or datetime.now()
    power = APP_STATE.get("power", {})
    generator = APP_STATE.get("generator", {})

    if power.get("forceGridCharging"):
        power["powerMode"] = "forced_grid_charging"
        power["batteryCharging"] = True
        power["currentSource"] = "Grid Charging"
        power["gridKW"] = max(
            float(power.get("gridKW", 0)),
            float(power.get("forcedGridChargeKW", 25)),
        )
        power["batteryPercent"] = 100
        return {"mode": "forced_grid_charging", "battery_full": True}

    upcoming_window: tuple[datetime, datetime] | None = None

    for day in APP_STATE.get("calendar", []):
        if day.get("gridStatus") != "power_cut":
            continue
        window = _cut_window(day)
        if window is None:
            continue
        start, end = window
        if start <= now <= end:
            upcoming_window = window
            break
        if now < start <= now + timedelta(hours=24):
            if upcoming_window is None or start < upcoming_window[0]:
                upcoming_window = window

    if upcoming_window is None:
        power["powerMode"] = "normal"
        power["batteryCharging"] = False
        return {"mode": "normal", "battery_full": power.get("batteryPercent", 0) >= 100}

    start, end = upcoming_window
    running_load = sum(
        float(machine.get("currentKW") or machine.get("kWRating") or 0)
        for machine in APP_STATE.get("machines", [])
        if machine.get("status") == "running"
    )
    renewable_kw = float(power.get("solarKW", 0)) + float(power.get("windKW", 0))
    supplemental_grid_kw = max(0.0, running_load - renewable_kw)

    if now < start:
        power["powerMode"] = "full_power_consumer"
        power["batteryCharging"] = True
        power["currentSource"] = "Solar + Grid Charging"
        power["gridKW"] = round(supplemental_grid_kw, 1)
        power["batteryPercent"] = 100
        power["batteryChargeReason"] = "24-hour power-cut preparation"
        return {
            "mode": "full_power_consumer",
            "battery_full": True,
            "cut_starts_at": start.isoformat(),
        }

    power["powerMode"] = "power_cut_backup"
    power["batteryCharging"] = False
    power["currentSource"] = "Solar + Generator"
    power["gridKW"] = 0
    generator["status"] = "running"
    power["backupReason"] = "Government-declared power cut"
    return {
        "mode": "power_cut_backup",
        "battery_full": power.get("batteryPercent", 0) >= 100,
        "cut_ends_at": end.isoformat(),
    }
