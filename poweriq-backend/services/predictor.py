from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from database.connection import APP_STATE
from services.weather import fetch_solar_forecast, fetch_wind_forecast


async def predict_power_48h() -> list[dict[str, Any]]:
    solar_values = await fetch_solar_forecast(11.0168, 76.9558, days=2)
    wind_values = await fetch_wind_forecast(11.0168, 76.9558, days=2)
    machines = APP_STATE.get("machines", [])

    blocks: list[dict[str, Any]] = []
    start = datetime.now().replace(minute=0, second=0, microsecond=0)

    for idx in range(16):
        block_start = start + timedelta(hours=idx * 3)
        block_end = block_start + timedelta(hours=3)
        solar = solar_values[idx % len(solar_values)]
        wind = wind_values[idx % len(wind_values)]

        load_kw = 0.0
        for machine in machines:
            status = machine.get("status")
            scheduled_on = machine.get("scheduledOn") or "00:00"
            scheduled_off = machine.get("scheduledOff") or "00:00"
            if status == "running":
                load_kw += float(machine.get("currentKW") or machine.get("kWRating") or 0)
            elif status == "scheduled":
                try:
                    on_h = int(scheduled_on.split(":")[0])
                    off_h = int(scheduled_off.split(":")[0])
                    if block_start.hour >= on_h and block_start.hour < off_h:
                        load_kw += float(machine.get("kWRating") or 0)
                except Exception:
                    pass

        solar_kw = max(0.0, min(60.0, solar / 100 * 60))
        wind_kw = max(0.0, min(30.0, wind / 100 * 30))
        grid_needed_kw = max(0.0, load_kw - solar_kw - wind_kw)
        status = "solar_covers"
        if grid_needed_kw > 0:
            status = "grid_needed"

        blocks.append(
            {
                "start_time": block_start.isoformat(),
                "end_time": block_end.isoformat(),
                "solar_kw": round(solar_kw, 2),
                "wind_kw": round(wind_kw, 2),
                "load_kw": round(load_kw, 2),
                "grid_needed_kw": round(grid_needed_kw, 2),
                "status": status,
            }
        )

    APP_STATE["predictions"] = blocks
    return blocks
