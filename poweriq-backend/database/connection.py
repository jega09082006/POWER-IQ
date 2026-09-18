import os
from copy import deepcopy
from typing import Any

from dotenv import load_dotenv

from mock_data import get_seed_payload

load_dotenv()

APP_STATE: dict[str, Any] = {
    "power": {},
    "machines": [],
    "calendar": [],
    "alerts": [],
    "generator": {},
    "predictions": [],
    "supervisor_token": None,
}


def init_db() -> None:
    """Initialize the app state for local demo mode."""
    APP_STATE["power"] = {}
    APP_STATE["machines"] = []
    APP_STATE["calendar"] = []
    APP_STATE["alerts"] = []
    APP_STATE["generator"] = {}
    APP_STATE["predictions"] = []
    APP_STATE["supervisor_token"] = None


def reset_state() -> None:
    init_db()


def seed_state(seed_data: dict[str, Any]) -> None:
    APP_STATE["power"] = deepcopy(seed_data.get("power", {}))
    APP_STATE["machines"] = deepcopy(seed_data.get("machines", []))
    APP_STATE["calendar"] = deepcopy(seed_data.get("calendar", []))
    APP_STATE["alerts"] = deepcopy(seed_data.get("alerts", []))
    APP_STATE["generator"] = deepcopy(seed_data.get("generator", {}))
    APP_STATE["predictions"] = deepcopy(seed_data.get("predictions", []))
    APP_STATE["supervisor_token"] = None


seed_state(get_seed_payload())


def get_state() -> dict[str, Any]:
    return APP_STATE
