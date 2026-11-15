from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.db import get_db
from app.models.station import Station
from app.models.equipment import Equipment
from app.models.alert import Alert, AlertStatus

router = APIRouter(prefix="/digital-twin", tags=["Station Digital Twin"])

@router.get("/{station_id}")
def get_digital_twin_model(station_id: str, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    eq_list = db.query(Equipment).filter(Equipment.station_id == station_id).all()
    active_alerts = db.query(Alert).filter(
        Alert.station_id == station_id,
        Alert.status.in_([AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED])
    ).all()
    
    # Subsystem topology for Bharati (3-tier elevated containerized station) / Maitri
    modules = [
        {
            "id": "MOD-PWR-01",
            "name": "Power Generation Block (Lower Deck)",
            "subsystem": "POWER",
            "type": "Power Plant",
            "grid_position": {"x": 1, "y": 2, "z": 0},
            "status": "WARNING" if any(e.status.value in ["WARNING", "CRITICAL"] for e in eq_list if e.subsystem == "POWER") else "NORMAL",
            "health_score": min([e.health_score for e in eq_list if e.subsystem == "POWER"] or [95.0]),
            "primary_equipment": [e.name for e in eq_list if e.subsystem == "POWER"],
            "live_telemetry": {
                "active_generators": "1 of 2 Online",
                "load_kw": f"{station.generator_output_kw} kW",
                "battery_soc": f"{station.battery_level_pct}%"
            },
            "recent_alerts": [a.title for a in active_alerts if a.subsystem == "POWER"]
        },
        {
            "id": "MOD-LAB-01",
            "name": "Atmospheric & Earth Physics Laboratories",
            "subsystem": "RESEARCH",
            "type": "Clean Laboratory",
            "grid_position": {"x": 2, "y": 2, "z": 1},
            "status": "NORMAL",
            "health_score": 98.0,
            "primary_equipment": ["LIDAR Aerosol Profiler", "Geomagnetic Variometer", "Spectroradiometer"],
            "live_telemetry": {
                "room_temp": "21.4°C",
                "humidity": "35%",
                "cleanroom_pressure": "+25 Pa"
            },
            "recent_alerts": []
        },
        {
            "id": "MOD-COMMS-01",
            "name": "Satellite Communications Radome Tower",
            "subsystem": "COMMS",
            "type": "Radome & Antenna Array",
            "grid_position": {"x": 3, "y": 1, "z": 2},
            "status": "NORMAL" if station.comm_status == "ONLINE" else "CRITICAL" if station.comm_status == "OFFLINE" else "WARNING",
            "health_score": 97.0 if station.comm_status == "ONLINE" else 40.0,
            "primary_equipment": ["GSAT-14 Tracking Dish", "Inmarsat BGAN Uplink", "VHF Air-Ground Radio"],
            "live_telemetry": {
                "status": station.comm_status,
                "latency": f"{station.comm_latency_ms} ms",
                "packet_loss": "0.1%" if station.comm_status == "ONLINE" else "100%"
            },
            "recent_alerts": [a.title for a in active_alerts if a.subsystem == "COMMS"]
        },
        {
            "id": "MOD-WATER-01",
            "name": "Life Support & Potable Water Desalination",
            "subsystem": "WATER",
            "type": "Water Treatment",
            "grid_position": {"x": 1, "y": 1, "z": 0},
            "status": "NORMAL",
            "health_score": 92.5,
            "primary_equipment": ["Reverse Osmosis Desalination Skid", "Thermal Snow Melter Basin", "UV Disinfection Unit"],
            "live_telemetry": {
                "daily_output": "1450 Liters",
                "water_storage": "84%",
                "purity_tds": "38 ppm"
            },
            "recent_alerts": []
        },
        {
            "id": "MOD-HAB-01",
            "name": "Main Habitat & Crew Quarters",
            "subsystem": "HABITAT",
            "type": "Living Quarters",
            "grid_position": {"x": 2, "y": 1, "z": 1},
            "status": "NORMAL",
            "health_score": 96.0,
            "primary_equipment": ["HVAC Heat Exchanger", "Fire Detection & Inert Gas Suppressor", "Medical Bay Roster"],
            "live_telemetry": {
                "occupancy": f"{station.current_personnel} crew",
                "cabin_temp": "20.8°C",
                "co2_ppm": "480 ppm"
            },
            "recent_alerts": []
        },
        {
            "id": "MOD-FUEL-01",
            "name": "External Polar Fuel Farm & Tank Farm",
            "subsystem": "FUEL",
            "type": "Hazardous Storage",
            "grid_position": {"x": 0, "y": 2, "z": 0},
            "status": "CRITICAL" if station.fuel_level_pct < 20.0 else "NORMAL",
            "health_score": 95.0 if station.fuel_level_pct >= 20.0 else 35.0,
            "primary_equipment": ["Dual-Walled Jet A-1 Storage Tanks", "Ultrasonic Level Radar", "Trace Heating Cable Loop"],
            "live_telemetry": {
                "fuel_level": f"{station.fuel_level_pct}%",
                "pipe_temp": "+8.2°C (Heated)",
                "leak_detectors": "SECURE / NO LEAK"
            },
            "recent_alerts": []
        },
        {
            "id": "MOD-SRV-01",
            "name": "Central Server & Telemetry Compute Rack",
            "subsystem": "IT_INFRA",
            "type": "Server Room",
            "grid_position": {"x": 2, "y": 0, "z": 1},
            "status": "NORMAL",
            "health_score": 98.5,
            "primary_equipment": ["High-Availability Edge Cluster", "Industrial SCADA PLC", "Redundant UPS Units"],
            "live_telemetry": {
                "cpu_load": "24%",
                "storage_used": "42%",
                "rack_temp": "19.5°C"
            },
            "recent_alerts": []
        }
    ]

    return {
        "station_id": station_id,
        "station_name": station.name,
        "blueprint_version": "v3.4-CAD-BIM",
        "station_health": station.health_score,
        "modules": modules,
        "is_simulated": True
    }
