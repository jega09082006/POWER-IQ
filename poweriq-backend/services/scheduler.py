from __future__ import annotations

import os
from datetime import datetime

from celery import Celery

celery_app = Celery(
    "poweriq",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)

celery_app.conf.update(task_track_started=True, broker_connection_retry_on_startup=True)


@celery_app.task(name="poweriq.refresh_predictions")
def refresh_predictions():
    from services.predictor import predict_power_48h
    return predict_power_48h()


@celery_app.task(name="poweriq.refresh_weather")
def refresh_weather():
    from services.weather import fetch_solar_forecast, fetch_wind_forecast
    return {
        "solar": fetch_solar_forecast(11.0168, 76.9558, days=2),
        "wind": fetch_wind_forecast(11.0168, 76.9558, days=2),
        "timestamp": datetime.utcnow().isoformat(),
    }


@celery_app.task(name="poweriq.check_calendar_alerts")
def check_calendar_alerts():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@celery_app.task(name="poweriq.check_machine_schedules")
def check_machine_schedules():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
