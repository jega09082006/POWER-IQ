from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PowerSource(BaseModel):
    solarKW: float
    windKW: float
    batteryPercent: float
    batteryKW: float | None = None
    gridKW: float
    currentSource: str = "Solar"
    gridPriceStatus: str = "normal"
    lastUpdated: str | None = None
    timestamp: datetime | None = None


class PowerSourceHistory(PowerSource):
    pass


class PowerBlock(BaseModel):
    start_time: datetime
    end_time: datetime
    solar_kw: float
    wind_kw: float
    load_kw: float
    grid_needed_kw: float
    status: Literal["solar_covers", "grid_needed", "cut_window"]
