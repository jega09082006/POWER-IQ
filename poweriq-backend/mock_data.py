from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any


def get_seed_payload() -> dict[str, Any]:
    today = datetime.now()
    calendar = []
    for i in range(14):
        day = today + timedelta(days=i)
        date_str = day.strftime("%Y-%m-%d")
        custom_events = ["Normal Full Shift"]
        grid_status = "good"
        is_battery_charge_day = False
        power_cut_start = None
        power_cut_end = None
        solar_forecast_percent = 78
        wind_forecast_speed = 15

        if i == 0:
            grid_status = "good"
            custom_events = ["Normal Full Shift"]
        elif i == 1:
            grid_status = "cloudy"
            is_battery_charge_day = True
            custom_events = ["Mandatory Battery Charge Day"]
            solar_forecast_percent = 42
        elif i == 2:
            grid_status = "power_cut"
            power_cut_start = "10:00 AM"
            power_cut_end = "04:00 PM"
            custom_events = ["Utility Grid Cut (6 Hrs)"]
            solar_forecast_percent = 88
        elif i == 4:
            grid_status = "expensive"
            custom_events = ["Peak Tariff Day ($0.42/kWh)"]
        elif i == 6:
            custom_events = ["Weekly Maintenance Window"]
        elif day.weekday() in (5, 6):
            custom_events = ["Weekend Reduced Shift"]
        else:
            custom_events = ["Normal Shift"]

        hourly_solar = [0, 5, 20, 45, 75, 92, 98, 85, 60, 35, 10, 0]
        hourly_wind = [14, 15, 18, 20, 22, 19, 17, 16, 15, 14, 12, 11]
        calendar.append(
            {
                "date": date_str,
                "dayName": day.strftime("%a, %b %d"),
                "solarForecastPercent": solar_forecast_percent,
                "windForecastSpeed": wind_forecast_speed,
                "gridStatus": grid_status,
                "isBatteryChargeDay": is_battery_charge_day,
                "powerCutStart": power_cut_start,
                "powerCutEnd": power_cut_end,
                "customEvents": custom_events,
                "hourlySolar": hourly_solar,
                "hourlyWind": hourly_wind,
                "scheduledMachinesCount": 5,
            }
        )

    machines = [
        {
            "id": "m1",
            "name": "Assembly Line A Conveyor",
            "kWRating": 18,
            "currentKW": 17.5,
            "status": "running",
            "scheduledOn": "07:00",
            "scheduledOff": "19:00",
            "priority": "essential",
            "isApproved": True,
            "lastModifiedBy": "Operator Dave",
        },
        {
            "id": "m2",
            "name": "Hydraulic Stamping Press #3",
            "kWRating": 35,
            "currentKW": 33.2,
            "status": "running",
            "scheduledOn": "08:00",
            "scheduledOff": "17:30",
            "priority": "essential",
            "isApproved": True,
            "lastModifiedBy": "Operator Dave",
        },
        {
            "id": "m3",
            "name": "Plastic Injection Molding Machine",
            "kWRating": 25,
            "currentKW": 0,
            "status": "scheduled",
            "scheduledOn": "11:00",
            "scheduledOff": "16:00",
            "priority": "flexible",
            "isApproved": True,
            "lastModifiedBy": "Worker Sam",
        },
        {
            "id": "m4",
            "name": "Industrial Air Compressor #1",
            "kWRating": 12,
            "currentKW": 11.8,
            "status": "running",
            "scheduledOn": "06:00",
            "scheduledOff": "22:00",
            "priority": "essential",
            "isApproved": True,
            "lastModifiedBy": "Tech Supervisor",
        },
        {
            "id": "m5",
            "name": "CNC Milling Unit 4",
            "kWRating": 22,
            "currentKW": 0,
            "status": "off",
            "scheduledOn": "14:00",
            "scheduledOff": "20:00",
            "priority": "flexible",
            "isApproved": False,
            "lastModifiedBy": "Worker Sam",
        },
        {
            "id": "m6",
            "name": "Main Packaging Line Robot",
            "kWRating": 15,
            "currentKW": 14.2,
            "status": "running",
            "scheduledOn": "08:00",
            "scheduledOff": "18:00",
            "priority": "essential",
            "isApproved": True,
            "lastModifiedBy": "Operator Dave",
        },
        {
            "id": "m7",
            "name": "Factory Floor Ventilation Fan Array",
            "kWRating": 8,
            "currentKW": 7.8,
            "status": "running",
            "scheduledOn": "06:00",
            "scheduledOff": "22:00",
            "priority": "flexible",
            "isApproved": True,
            "lastModifiedBy": "Cleaner Lead",
        },
        {
            "id": "m8",
            "name": "Heat Treatment Oven #2",
            "kWRating": 40,
            "currentKW": 0,
            "status": "off",
            "scheduledOn": "22:00",
            "scheduledOff": "05:00",
            "priority": "nonessential",
            "isApproved": True,
            "lastModifiedBy": "Night Supervisor",
        },
    ]
    for machine in machines:
        machine["weeklySchedule"] = {
            (today + timedelta(days=offset)).strftime("%Y-%m-%d"): {
                "scheduledOn": machine["scheduledOn"],
                "scheduledOff": machine["scheduledOff"],
            }
            for offset in range(7)
        }

    power_source = {
        "solarKW": 52.4,
        "windKW": 14.2,
        "batteryPercent": 84,
        "gridKW": 0,
        "currentSource": "Solar",
        "gridPriceStatus": "normal",
        "lastUpdated": datetime.now().strftime("%H:%M"),
        "powerMode": "normal",
        "batteryCharging": False,
    }

    generator = {
        "fuelLevelLitres": 270,
        "fuelCapacityLitres": 500,
        "fuelNeededForCut": 390,
        "status": "standby",
        "lastRefillDate": "2026-09-10",
    }

    alerts = [
        {
            "id": "alt-1",
            "type": "powercut",
            "title": "Upcoming Power Cut Detected",
            "message": "Utility provider scheduled grid cut on Sunday, Sept 20 from 10:00 AM to 04:00 PM (6 hours).",
            "date": "2026-09-20",
            "resolved": False,
            "severity": "danger",
        },
        {
            "id": "alt-2",
            "type": "fuellow",
            "title": "Diesel Fuel Shortfall Alert",
            "message": "Generator fuel is at 270L (54%). You need 120 more litres of diesel before Sept 20 cut.",
            "date": "2026-09-18",
            "resolved": False,
            "severity": "danger",
        },
        {
            "id": "alt-3",
            "type": "highcost",
            "title": "High Grid Electricity Rates",
            "message": "Grid price rate is elevated right now. Avoid turning on non-essential heavy machines.",
            "date": "2026-09-18",
            "resolved": False,
            "severity": "warning",
        },
    ]

    prediction_blocks = [
        {"time": "00:00 - 03:00", "solar": 0, "load": 20, "gridNeeded": 20, "isCut": False},
        {"time": "03:00 - 06:00", "solar": 0, "load": 18, "gridNeeded": 18, "isCut": False},
        {"time": "06:00 - 09:00", "solar": 25, "load": 45, "gridNeeded": 20, "isCut": False},
        {"time": "09:00 - 12:00", "solar": 65, "load": 50, "gridNeeded": 0, "isCut": False},
        {"time": "12:00 - 15:00", "solar": 80, "load": 55, "gridNeeded": 0, "isCut": False},
        {"time": "15:00 - 18:00", "solar": 55, "load": 48, "gridNeeded": 0, "isCut": False},
        {"time": "18:00 - 21:00", "solar": 10, "load": 40, "gridNeeded": 30, "isCut": False},
        {"time": "21:00 - 00:00", "solar": 0, "load": 25, "gridNeeded": 25, "isCut": False},
        {"time": "Day2 00:00", "solar": 0, "load": 15, "gridNeeded": 15, "isCut": False},
        {"time": "Day2 03:00", "solar": 0, "load": 15, "gridNeeded": 15, "isCut": False},
        {"time": "Day2 06:00", "solar": 20, "load": 35, "gridNeeded": 15, "isCut": False},
        {"time": "Day2 09:00", "solar": 60, "load": 50, "gridNeeded": 0, "isCut": True},
        {"time": "Day2 12:00", "solar": 75, "load": 40, "gridNeeded": 0, "isCut": True},
        {"time": "Day2 15:00", "solar": 60, "load": 42, "gridNeeded": 0, "isCut": True},
        {"time": "Day2 18:00", "solar": 15, "load": 35, "gridNeeded": 20, "isCut": False},
        {"time": "Day2 21:00", "solar": 0, "load": 20, "gridNeeded": 20, "isCut": False},
    ]

    return {
        "power": power_source,
        "machines": machines,
        "calendar": calendar,
        "alerts": alerts,
        "generator": generator,
        "predictions": prediction_blocks,
    }
