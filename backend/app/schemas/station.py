from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.station import StationStatus

class StationBase(BaseModel):
    name: str
    location_name: str
    region: Optional[str] = "East Antarctica"
    latitude: float
    longitude: float
    elevation_m: Optional[float] = 117.0
    established_year: int
    capacity_summer: Optional[int] = 65
    capacity_winter: Optional[int] = 25
    current_personnel: Optional[int] = 24
    status: Optional[StationStatus] = StationStatus.HEALTHY
    health_score: Optional[float] = 95.0
    power_status_pct: Optional[float] = 85.0
    fuel_level_pct: Optional[float] = 72.0
    battery_level_pct: Optional[float] = 92.0
    solar_output_kw: Optional[float] = 12.4
    generator_output_kw: Optional[float] = 68.5
    comm_status: Optional[str] = "ONLINE"
    comm_latency_ms: Optional[float] = 580.0
    current_temp_c: Optional[float] = -24.5
    wind_speed_knots: Optional[float] = 18.2
    wind_direction: Optional[str] = "ESE"
    atmospheric_pressure_hpa: Optional[float] = 982.0
    visibility_km: Optional[float] = 15.0
    weather_condition: Optional[str] = "Clear Polar Skies"
    description: Optional[str] = None

class StationCreate(StationBase):
    id: str

class StationUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    capacity_summer: Optional[int] = None
    capacity_winter: Optional[int] = None
    current_personnel: Optional[int] = None
    status: Optional[StationStatus] = None
    health_score: Optional[float] = None
    power_status_pct: Optional[float] = None
    fuel_level_pct: Optional[float] = None
    battery_level_pct: Optional[float] = None
    comm_status: Optional[str] = None
    description: Optional[str] = None

class StationOut(StationBase):
    id: str
    last_contact: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
