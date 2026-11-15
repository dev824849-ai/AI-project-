import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

def test_alert_summary():
    response = client.get("/api/alerts/summary")
    assert response.status_code == 200
    summary = response.json()
    assert "active_total" in summary
    assert "critical" in summary

def test_incident_flow():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert isinstance(incidents, list)

def test_inventory_forecast():
    response = client.get("/api/inventory/forecast")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
