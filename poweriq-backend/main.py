import asyncio
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.connection import APP_STATE, init_db, seed_state
from mock_data import get_seed_payload
from routes.alerts import router as alerts_router
from routes.calendar import router as calendar_router
from routes.generator import router as generator_router
from routes.machines import router as machines_router
from routes.power import router as power_router
from routes.supervisor import router as supervisor_router
from services.mqtt_client import connect_mqtt, shutdown_mqtt
from services.power_strategy import apply_power_cut_strategy

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("PowerIQ Backend running on port 8000")
    init_db()
    seed_state(get_seed_payload())
    apply_power_cut_strategy()
    print("Database connected")
    mqtt_client = connect_mqtt()
    app.state.mqtt_client = mqtt_client
    if mqtt_client is None:
        print("MQTT broker unavailable; continuing without MQTT")
    print("Celery scheduler ready")
    broadcaster = asyncio.create_task(power_broadcast_loop())
    try:
        yield
    finally:
        broadcaster.cancel()
        try:
            await broadcaster
        except asyncio.CancelledError:
            pass
        shutdown_mqtt()


app = FastAPI(title="PowerIQ Backend", version="1.0.0", lifespan=lifespan)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(machines_router)
app.include_router(power_router)
app.include_router(calendar_router)
app.include_router(generator_router)
app.include_router(alerts_router)
app.include_router(supervisor_router)

app.state.ws_clients = set()


@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/dev/seed")
def dev_seed():
    if os.getenv("DEV_MODE", "true").lower() != "true":
        return {"message": "Seeding disabled in production mode"}
    seed_state(get_seed_payload())
    return {"status": "ok", "message": "Database seeded with mock data matching the frontend"}


async def broadcast_power_update() -> None:
    apply_power_cut_strategy()
    if not getattr(app.state, "ws_clients", None):
        return
    payload: dict[str, Any] = {
        "solarKW": APP_STATE.get("power", {}).get("solarKW", 0),
        "windKW": APP_STATE.get("power", {}).get("windKW", 0),
        "batteryPercent": APP_STATE.get("power", {}).get("batteryPercent", 0),
        "gridKW": APP_STATE.get("power", {}).get("gridKW", 0),
        "powerMode": APP_STATE.get("power", {}).get("powerMode", "normal"),
        "batteryCharging": APP_STATE.get("power", {}).get("batteryCharging", False),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_machines": [
            machine["id"] for machine in APP_STATE.get("machines", []) if machine.get("status") == "running"
        ],
    }
    message = json.dumps(payload)
    for client in list(app.state.ws_clients):
        try:
            await client.send_text(message)
        except Exception:
            app.state.ws_clients.discard(client)


async def power_broadcast_loop() -> None:
    while True:
        await asyncio.sleep(5)
        await broadcast_power_update()


@app.websocket("/ws/power")
async def websocket_power(websocket: WebSocket):
    await websocket.accept()
    app.state.ws_clients.add(websocket)
    await websocket.send_text(
        json.dumps(
            {
                "solarKW": APP_STATE.get("power", {}).get("solarKW", 0),
                "windKW": APP_STATE.get("power", {}).get("windKW", 0),
                "batteryPercent": APP_STATE.get("power", {}).get("batteryPercent", 0),
                "gridKW": APP_STATE.get("power", {}).get("gridKW", 0),
                "powerMode": APP_STATE.get("power", {}).get("powerMode", "normal"),
                "batteryCharging": APP_STATE.get("power", {}).get("batteryCharging", False),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "active_machines": [
                    machine["id"] for machine in APP_STATE.get("machines", []) if machine.get("status") == "running"
                ],
            }
        )
    )
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        app.state.ws_clients.discard(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
