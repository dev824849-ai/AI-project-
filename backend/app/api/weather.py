from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
import random
from app.database.db import get_db
from app.models.station import Station
from app.models.weather import WeatherData

router = APIRouter(prefix="/weather", tags=["Weather & Climate Monitoring"])

@router.get("/current/{station_id}")
def get_station_weather(station_id: str, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    # Wind chill calculation (Jag/Osczevski formula)
    t = station.current_temp_c
    v_kmh = station.wind_speed_knots * 1.852
    wind_chill = round(13.12 + 0.6215*t - 11.37*(v_kmh**0.16) + 0.3965*t*(v_kmh**0.16), 1) if v_kmh > 4.8 else t

    return {
        "station_id": station_id,
        "station_name": station.name,
        "temperature_c": station.current_temp_c,
        "feels_like_c": wind_chill,
        "wind_speed_knots": station.wind_speed_knots,
        "wind_speed_kmh": round(v_kmh, 1),
        "wind_direction": station.wind_direction,
        "pressure_hpa": station.atmospheric_pressure_hpa,
        "visibility_km": station.visibility_km,
        "condition": station.weather_condition,
        "is_blizzard_warning": station.wind_speed_knots > 40.0,
        "uv_index": 0.5,
        "solar_irradiance_wm2": 140.0 if station_id == "bharati" else 95.0,
        "snow_accumulation_cm": 14.5,
        "is_simulated": True,
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/history/{station_id}")
def get_weather_forecast_and_history(station_id: str, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    now = datetime.utcnow()
    past_24h = []
    base_t = station.current_temp_c
    base_w = station.wind_speed_knots
    base_p = station.atmospheric_pressure_hpa
    
    for i in range(24, 0, -1):
        pt = now - timedelta(hours=i)
        past_24h.append({
            "time": pt.strftime("%H:00"),
            "temperature_c": round(base_t + random.uniform(-2.5, 2.5), 1),
            "wind_speed_knots": round(max(5.0, base_w + random.uniform(-6.0, 6.0)), 1),
            "pressure_hpa": round(base_p + random.uniform(-4.0, 4.0), 1),
            "humidity_pct": round(65.0 + random.uniform(-10.0, 10.0), 0)
        })
        
    return {
        "station_id": station_id,
        "past_24h": past_24h,
        "is_simulated": True
    }
