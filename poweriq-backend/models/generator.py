from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Generator(BaseModel):
    fuelLevelLitres: float
    fuelCapacityLitres: float
    fuelNeededForCut: float
    status: Literal["standby", "running", "off"]
    lastRefillDate: str | None = None
    lastUpdated: datetime | None = None


class GeneratorFuelRequest(BaseModel):
    litres_added: float = Field(..., gt=0)


class GeneratorStatusRequest(BaseModel):
    status: Literal["standby", "running", "off"]


class GeneratorRequirement(BaseModel):
    cut_duration_hours: float
    factory_avg_kw: float
    fuel_needed_litres: float
    current_fuel_litres: float
    shortfall_litres: float
    is_sufficient: bool
