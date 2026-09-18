from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_machines():
    response = client.get("/api/machines")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_toggle_machine():
    response = client.post("/api/machines/m1/toggle", json={"action": "off"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "m1"
    assert data["status"] == "off"
