from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class Alert(BaseModel):
    id: str | int
    type: Literal["powercut", "highcost", "lowbattery", "fuellow", "weatherwarning"]
    title: str
    message: str
    date: str | datetime
    resolved: bool = False
    severity: str | None = None


class AlertResolveRequest(BaseModel):
    resolved: bool = True
