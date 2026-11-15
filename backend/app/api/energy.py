from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.database.db import get_db
from app.models.station import Station
from app.models.equipment import Equipment
from app.models.inventory import InventoryItem

router = APIRouter(prefix="/energy", tags=["Energy & Microgrid Management"])

@router.get("/metrics")
def get_energy_metrics(station_id: Optional[str] = "bharati", db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    gens = db.query(Equipment).filter(
        Equipment.station_id == station_id,
        Equipment.type == "Generator"
    ).all()
    
    fuel = db.query(InventoryItem).filter(
        InventoryItem.station_id == station_id,
        InventoryItem.category == "FUEL"
    ).first()
    
    # 24-hour generation & consumption profile
    now = datetime.utcnow()
    hourly_trends = []
    import random
    
    for h in range(24, 0, -1):
        t = now - timedelta(hours=h)
        hour_of_day = t.hour
        # Solar peak during polar summer/daylight (hours 08 to 16)
        solar_gen = max(0.0, 18.0 * (1 - abs(hour_of_day - 12)/6.0)) if 6 <= hour_of_day <= 18 else 0.0
        base_demand = 62.0 + random.uniform(-4.0, 4.0)
        gen_output = max(40.0, base_demand - solar_gen)
        
        hourly_trends.append({
            "time": t.strftime("%H:00"),
            "total_demand_kw": round(base_demand, 1),
            "generator_kw": round(gen_output, 1),
            "solar_kw": round(solar_gen, 1),
            "battery_soc_pct": round(90.0 + random.uniform(-3.0, 5.0), 1),
            "fuel_burn_liters": round(gen_output * 0.28, 1) # approx 0.28 L/kWh
        })
        
    return {
        "station_id": station_id,
        "station_name": station.name,
        "current_total_load_kw": round(station.generator_output_kw + station.solar_output_kw, 1),
        "generator_output_kw": station.generator_output_kw,
        "solar_output_kw": station.solar_output_kw,
        "battery_soc_pct": station.battery_level_pct,
        "battery_capacity_kwh": 400.0,
        "fuel_level_pct": station.fuel_level_pct,
        "fuel_remaining_liters": fuel.current_quantity if fuel else 145000.0,
        "estimated_fuel_days": fuel.days_remaining if fuel else 250.0,
        "generators": [
            {
                "id": g.id,
                "name": g.name,
                "status": g.status.value,
                "health_score": g.health_score,
                "power_kw": g.power_consumption_kw,
                "temp_c": g.temperature_c,
                "efficiency_pct": g.efficiency_pct
            } for g in gens
        ],
        "hourly_trends": hourly_trends,
        "is_simulated": True
    }
