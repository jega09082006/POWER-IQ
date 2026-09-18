from __future__ import annotations

import json
import os
from typing import Any

try:
    import paho.mqtt.client as mqtt
except Exception:  # pragma: no cover
    mqtt = None

from database.connection import APP_STATE


client = None


def on_connect(_client, _userdata, _flags, rc):
    if rc == 0:
        print("MQTT broker connected")
        _client.subscribe("poweriq/#")
    else:
        print(f"MQTT connect failed with code {rc}")


def on_message(_client, _userdata, msg):
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
    except Exception:
        payload = {}
    if payload:
        APP_STATE["power"] = {**APP_STATE.get("power", {}), **payload}


def connect_mqtt() -> Any:
    global client
    if mqtt is None:
        print("MQTT library unavailable; skipping broker connection")
        return None
    host = os.getenv("MQTT_HOST", "localhost")
    port = int(os.getenv("MQTT_PORT", "1883"))
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    try:
        client.connect(host, port, 60)
        client.loop_start()
        print("MQTT broker connected")
    except Exception as exc:  # pragma: no cover
        print(f"MQTT connection failed: {exc}")
    return client


def shutdown_mqtt() -> None:
    if client is not None:
        client.loop_stop()
