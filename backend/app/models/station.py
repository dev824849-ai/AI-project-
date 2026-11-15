import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from app.database.db import Base

class StationStatus(str, enum.Enum):
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"

class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True) # e.g. "maitri", "bharati"
    name = Column(String, nullable=False) # "Maitri Station", "Bharati Station"
    location_name = Column(String, nullable=False) # "Schirmacher Oasis", "Larsemann Hills"
    region = Column(String, default="East Antarctica")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=117.0)
    established_year = Column(Integer, nullable=False)
    capacity_summer = Column(Integer, default=65)
    capacity_winter = Column(Integer, default=25)
    current_personnel = Column(Integer, default=24)
    
    # Live Status Summary
    status = Column(Enum(StationStatus), default=StationStatus.HEALTHY, nullable=False)
    health_score = Column(Float, default=95.0) # 0 to 100
    power_status_pct = Column(Float, default=85.0)
    fuel_level_pct = Column(Float, default=72.0)
    battery_level_pct = Column(Float, default=92.0)
    solar_output_kw = Column(Float, default=12.4)
    generator_output_kw = Column(Float, default=68.5)
    comm_status = Column(String, default="ONLINE") # ONLINE, DEGRADED, OFFLINE
    comm_latency_ms = Column(Float, default=580.0)
    
    # Weather summary
    current_temp_c = Column(Float, default=-24.5)
    wind_speed_knots = Column(Float, default=18.2)
    wind_direction = Column(String, default="ESE")
    atmospheric_pressure_hpa = Column(Float, default=982.0)
    visibility_km = Column(Float, default=15.0)
    weather_condition = Column(String, default="Clear Polar Skies")
    
    description = Column(Text, nullable=True)
    last_contact = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
