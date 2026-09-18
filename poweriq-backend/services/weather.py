from __future__ import annotations

import os
from typing import Any

import httpx


async def fetch_solar_forecast(lat: float, lon: float, days: int = 3) -> list[float]:
    api_key = os.getenv("WEATHER_API_KEY", "")
    if not api_key:
        return [100, 100, 95, 80, 70, 60, 50, 40, 25, 15, 10, 0]

    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "cnt": max(days * 8, 8)}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
            values: list[float] = []
            for item in payload.get("list", [])[:12]:
                cloud = float(item.get("clouds", {}).get("all", 0))
                percent = max(0.0, min(100.0, 100 - cloud))
                values.append(round(percent, 2))
            if not values:
                raise ValueError("No solar forecast values returned")
            return values
    except Exception:
        return [100, 100, 95, 80, 70, 60, 50, 40, 25, 15, 10, 0]


async def fetch_wind_forecast(lat: float, lon: float, days: int = 3) -> list[float]:
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "wind_speed_10m",
            "forecast_days": max(days, 3),
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
            speeds = payload.get("hourly", {}).get("wind_speed_10m", [])[:12]
            mapped: list[float] = []
            for speed in speeds:
                s = float(speed)
                if s < 3:
                    percent = 0.0
                elif s <= 12:
                    percent = (s / 12) * 100
                else:
                    percent = 100.0
                mapped.append(round(percent, 2))
            if not mapped:
                raise ValueError("No wind forecast values returned")
            return mapped
    except Exception:
        return [10, 12, 18, 20, 25, 30, 35, 28, 22, 18, 14, 10]
