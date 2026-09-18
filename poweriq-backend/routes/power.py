from __future__ import annotations

from fastapi import APIRouter

from database.connection import APP_STATE
from services.predictor import predict_power_48h

router = APIRouter(prefix="/api/power", tags=["power"])


@router.get("/current")
def get_current_power():
    return APP_STATE.get("power", {})


@router.get("/history")
def get_power_history(hours: int = 24):
    power = APP_STATE.get("power", {})
    return [
        {**power, "timestamp": f"{hours}-hour history"}
    ]


@router.get("/prediction")
async def get_prediction():
    predictions = APP_STATE.get("predictions", [])
    if not predictions:
        predictions = await predict_power_48h()
    return predictions
