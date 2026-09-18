from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class CalendarDay(BaseModel):
    date: str
    solarForecastPercent: float
    windForecastSpeed: float
    gridStatus: Literal["good", "cloudy", "expensive", "power_cut"]
    powerCutStart: str | None = None
    powerCutEnd: str | None = None
    customEvents: list[str] = []
    isBatteryChargeDay: bool = False
    dayName: str | None = None
    hourlySolar: list[float] = []
    hourlyWind: list[float] = []
    scheduledMachinesCount: int = 0


class CalendarEventRequest(BaseModel):
    event: str


class CalendarDecisionRequest(BaseModel):
    grid_status: Literal["good", "cloudy", "expensive", "power_cut"]
    power_cut_start: str | None = None
    power_cut_end: str | None = None


class CalendarPowerCutRequest(BaseModel):
    date: str
    start_time: str
    end_time: str
