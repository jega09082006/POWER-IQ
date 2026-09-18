from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_current_power():
    response = client.get("/api/power/current")
    assert response.status_code == 200
    data = response.json()
    assert "solarKW" in data
    assert "gridKW" in data
