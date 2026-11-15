import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "SUPER_ADMIN"

def test_login_invalid_password():
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_stations_unauthenticated_accessible():
    response = client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) >= 2
    ids = [s["id"] for s in stations]
    assert "bharati" in ids
    assert "maitri" in ids
