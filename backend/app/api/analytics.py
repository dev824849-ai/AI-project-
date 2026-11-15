from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import random
from app.database.db import get_db
from app.models.station import Station
from app.models.equipment import Equipment
from app.models.inventory import InventoryItem
from app.models.alert import Alert

router = APIRouter(prefix="/analytics", tags=["Historical & Cross-Station Analytics"])

@router.get("/summary")
def get_analytics_overview(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    total_equipment = db.query(Equipment).count()
    total_alerts = db.query(Alert).count()
    
    # 30-day historical trend for station uptime, energy consumed, and alert count
    now = datetime.utcnow()
    thirty_day_trends = []
    
    for day in range(30, 0, -1):
        dt = now - timedelta(days=day)
        thirty_day_trends.append({
            "date": dt.strftime("%b %d"),
            "bharati_power_kwh": round(1450.0 + random.uniform(-80, 110), 0),
            "maitri_power_kwh": round(1320.0 + random.uniform(-60, 90), 0),
            "bharati_uptime_pct": round(99.4 + random.uniform(-0.5, 0.6), 2),
            "maitri_uptime_pct": round(98.8 + random.uniform(-0.8, 0.9), 2),
            "alerts_raised": random.choice([0, 1, 0, 2, 0, 1, 3, 0]),
            "fuel_consumed_liters": round(1100.0 + random.uniform(-50, 75), 0)
        })

    return {
        "active_stations_count": len(stations),
        "total_equipment_monitored": total_equipment,
        "lifetime_alerts": total_alerts,
        "satellite_telemetry_reliability_pct": 99.78,
        "mean_time_to_repair_hours": 3.4,
        "thirty_day_trends": thirty_day_trends,
        "is_simulated": True
    }
