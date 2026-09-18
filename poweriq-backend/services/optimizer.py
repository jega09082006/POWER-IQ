from __future__ import annotations

from typing import Any


def optimize_schedule() -> list[str]:
    return [
        "Run essential machines during peak solar windows",
        "Shift flexible machines to 09:00-15:00 for lower grid cost",
        "Avoid startup of nonessential loads during the evening grid tariff spike",
    ]


def plan_power_cut_response(cut_start: str, cut_end: str) -> dict[str, Any]:
    try:
        start_hour = int(cut_start.split(":")[0])
        end_hour = int(cut_end.split(":")[0])
        duration = max(1, end_hour - start_hour)
    except Exception:
        duration = 6

    total_kwh_needed = 180.0
    battery_kwh = 90.0
    generator_kwh = max(0.0, total_kwh_needed - battery_kwh)
    fuel_needed = round(generator_kwh * 0.3, 2)

    return {
        "cut_start": cut_start,
        "cut_end": cut_end,
        "duration_hours": duration,
        "total_kwh_needed": total_kwh_needed,
        "battery_kwh": battery_kwh,
        "generator_kwh": generator_kwh,
        "fuel_needed_litres": fuel_needed,
        "checklist": [
            "Charge battery to 100% before the cut window",
            "Verify diesel fuel level and top up if needed",
            "Pause all nonessential machines",
            "Keep essential loads on generator/battery backup",
        ],
    }
