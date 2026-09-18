from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Machine(BaseModel):
    id: str = Field(..., description="Machine identifier")
    name: str
    kWRating: float = Field(alias="kw_rating")
    currentKW: float = Field(default=0.0, alias="current_kw")
    status: Literal["running", "scheduled", "off"]
    scheduledOn: str | None = Field(default=None, alias="scheduled_on")
    scheduledOff: str | None = Field(default=None, alias="scheduled_off")
    priority: Literal["essential", "flexible", "nonessential"]
    isApproved: bool = Field(default=True, alias="is_approved")
    lastModifiedBy: str | None = Field(default=None, alias="last_modified_by")

    model_config = {"populate_by_name": True}


class MachineToggleRequest(BaseModel):
    action: Literal["on", "off"]


class MachineCreateRequest(BaseModel):
    name: str
    kWRating: float = Field(..., gt=0)
    priority: Literal["essential", "flexible", "nonessential"] = "flexible"
    scheduledOn: str | None = None
    scheduledOff: str | None = None


class MachineScheduleRequest(BaseModel):
    scheduled_on: str
    scheduled_off: str
    scheduled_date: str | None = None


class MachineRecommendation(BaseModel):
    rating: Literal["good", "warning", "danger"]
    message: str
