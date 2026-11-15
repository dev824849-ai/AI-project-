import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from app.database.db import Base

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    source = Column(String, nullable=False) # AI_ANOMALY, SENSOR_THRESHOLD, EQUIPMENT_FAILURE, WEATHER_WARNING, COMMS_TIMEOUT, SYSTEM
    subsystem = Column(String, nullable=False) # POWER, HVAC, WEATHER, WATER, COMMS, HABITAT
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM, nullable=False, index=True)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE, nullable=False, index=True)
    
    # Anomaly details
    parameter = Column(String, nullable=True) # e.g. "Generator-02 Temperature"
    current_value = Column(Float, nullable=True)
    expected_range = Column(String, nullable=True) # "60 - 75 °C"
    anomaly_score = Column(Float, default=0.0)
    recommended_action = Column(Text, nullable=True)
    
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
