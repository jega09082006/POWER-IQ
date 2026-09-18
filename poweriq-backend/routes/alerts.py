from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database.connection import APP_STATE

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("")
def list_alerts(resolved: bool = False):
    alerts = APP_STATE.get("alerts", [])
    if resolved:
        return [alert for alert in alerts if alert.get("resolved")]
    return [alert for alert in alerts if not alert.get("resolved")]


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for alert in APP_STATE.get("alerts", []):
        if str(alert.get("id")) == str(alert_id):
            alert["resolved"] = True
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")
