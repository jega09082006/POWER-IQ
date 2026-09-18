from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_prediction_blocks():
    response = client.get("/api/power/prediction")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 16
