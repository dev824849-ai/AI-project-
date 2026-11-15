from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from app.database.db import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, index=True) # e.g. "SEN-MAITRI-GEN-TEMP"
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    subsystem = Column(String, nullable=False) # POWER, HVAC, WEATHER, WATER, COMMS, HABITAT, LAB
    unit = Column(String, nullable=False) # °C, kW, %, hPa, m/s, mm/s
    min_safe_value = Column(Float, nullable=False)
    max_safe_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(String, ForeignKey("sensors.id"), nullable=False, index=True)
    station_id = Column(String, nullable=False, index=True)
    value = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0) # -1.0 to 1.0 (Isolation Forest style)
    is_simulated = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
