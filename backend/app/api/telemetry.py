from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database.db import get_db
from app.models.station import Station
from app.models.equipment import Equipment
from app.models.sensor import Sensor, SensorReading
from app.schemas.sensor import SensorOut, SensorReadingOut

router = APIRouter(prefix="/telemetry", tags=["Real-time Telemetry"])

@router.get("/snapshot")
def get_telemetry_snapshot(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    results = []
    for s in stations:
        eq = db.query(Equipment).filter(Equipment.station_id == s.id).all()
        results.append({
            "station_id": s.id,
            "station_name": s.name,
            "status": s.status.value,
            "health_score": s.health_score,
            "temperature_c": s.current_temp_c,
            "wind_speed_knots": s.wind_speed_knots,
            "wind_direction": s.wind_direction,
            "pressure_hpa": s.atmospheric_pressure_hpa,
            "visibility_km": s.visibility_km,
            "power_status_pct": s.power_status_pct,
            "fuel_level_pct": s.fuel_level_pct,
            "battery_level_pct": s.battery_level_pct,
            "solar_output_kw": s.solar_output_kw,
            "generator_output_kw": s.generator_output_kw,
            "comm_status": s.comm_status,
            "comm_latency_ms": s.comm_latency_ms,
            "last_contact": s.last_contact.isoformat() if s.last_contact else None,
            "equipment_summary": [
                {
                    "id": e.id,
                    "name": e.name,
                    "type": e.type,
                    "status": e.status.value,
                    "health_score": e.health_score,
                    "temperature_c": e.temperature_c,
                    "vibration_mms": e.vibration_mms,
                    "power_kw": e.power_consumption_kw,
                    "failure_risk": e.failure_risk.value
                } for e in eq
            ]
        })
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "is_simulated": True,
        "stations": results
    }

@router.get("/history/{station_id}")
def get_telemetry_history(
    station_id: str,
    points: int = 20,
    db: Session = Depends(get_db)
):
    """
    Returns time-series telemetry sequence for live charts.
    """
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    eq = db.query(Equipment).filter(
        Equipment.station_id == station_id,
        Equipment.type == "Generator"
    ).first()
    
    base_temp = station.current_temp_c
    base_gen_temp = eq.temperature_c if eq else 70.0
    base_power = station.generator_output_kw
    base_wind = station.wind_speed_knots
    
    now = datetime.utcnow()
    history = []
    
    import random
    for i in range(points, 0, -1):
        t = now - timedelta(seconds=i*3)
        history.append({
            "timestamp": t.strftime("%H:%M:%S"),
            "ambient_temp": round(base_temp + random.uniform(-0.6, 0.6), 1),
            "generator_temp": round(base_gen_temp + random.uniform(-1.2, 1.2), 1),
            "wind_speed": round(base_wind + random.uniform(-2.0, 2.0), 1),
            "power_draw_kw": round(base_power + random.uniform(-3.0, 3.0), 1),
            "battery_soc": round(station.battery_level_pct + random.uniform(-0.2, 0.2), 1),
            "latency_ms": round(station.comm_latency_ms + random.uniform(-15, 25), 0),
            "vibration_mms": round(eq.vibration_mms + random.uniform(-0.1, 0.1), 2) if eq else 1.6
        })
        
    return {
        "station_id": station_id,
        "history": history,
        "is_simulated": True
    }
