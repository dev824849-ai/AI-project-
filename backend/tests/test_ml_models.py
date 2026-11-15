import pytest
from app.ml.anomaly_detection import detect_sensor_anomaly
from app.ml.predictive_maintenance import predict_equipment_failure_risk

def test_anomaly_detection_nominal():
    is_anomaly, score, reason = detect_sensor_anomaly(
        temperature=70.0,
        vibration=1.6,
        power_kw=65.0,
        wind_speed=20.0,
        pressure_hpa=985.0
    )
    assert not is_anomaly or score < 0.6

def test_anomaly_detection_thermal_spike():
    is_anomaly, score, reason = detect_sensor_anomaly(
        temperature=89.5,
        vibration=3.8,
        power_kw=105.0,
        wind_speed=20.0,
        pressure_hpa=985.0
    )
    assert is_anomaly is True
    assert score >= 0.7
    assert "thermal" in reason.lower() or "anomaly" in reason.lower()

def test_predictive_maintenance_normal_generator():
    res = predict_equipment_failure_risk(
        temperature=68.0,
        vibration=1.5,
        power_kw=55.0,
        operating_hours=2000.0,
        temp_trend=0.0
    )
    assert res["risk_level"] == "LOW"
    assert res["health_score"] >= 80.0

def test_predictive_maintenance_critical_generator():
    res = predict_equipment_failure_risk(
        temperature=91.0,
        vibration=4.5,
        power_kw=98.0,
        operating_hours=7500.0,
        temp_trend=2.5
    )
    assert res["risk_level"] in ["HIGH", "CRITICAL"]
    assert res["health_score"] < 60.0
    assert "bearing" in res["reason"].lower() or "rotor" in res["reason"].lower() or "abnormal" in res["reason"].lower()
