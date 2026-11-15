import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from app.database.db import Base

class EquipmentStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"
    MAINTENANCE = "MAINTENANCE"

class FailureRisk(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String, primary_key=True, index=True) # e.g. "EQ-BHARATI-GEN-01"
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    name = Column(String, nullable=False) # e.g. "Primary Diesel Generator 01"
    type = Column(String, nullable=False) # Generator, Heating, Water RO, Satellite Comms, Server Rack, Snow Vehicle, Scientific Lidar
    subsystem = Column(String, nullable=False) # POWER, HVAC, WATER, COMMS, RESEARCH, LOGISTICS
    location_room = Column(String, nullable=False) # e.g. "Power Plant Block A"
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.NORMAL, nullable=False)
    health_score = Column(Float, default=95.0) # 0 to 100
    failure_risk = Column(Enum(FailureRisk), default=FailureRisk.LOW, nullable=False)
    
    # Telemetry parameters
    temperature_c = Column(Float, default=68.0)
    vibration_mms = Column(Float, default=1.8) # mm/s RMS
    power_consumption_kw = Column(Float, default=45.0)
    operating_hours = Column(Float, default=3420.0)
    efficiency_pct = Column(Float, default=92.5)
    
    # AI Predictive Diagnostics
    predicted_rul_hours = Column(Float, default=1200.0) # Remaining Useful Life
    anomaly_reason = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    last_maintenance = Column(DateTime, default=datetime.utcnow)
    next_maintenance_due = Column(DateTime, default=datetime.utcnow)
    is_critical_asset = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False, index=True)
    station_id = Column(String, nullable=False)
    maintenance_type = Column(String, nullable=False) # PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION
    description = Column(Text, nullable=False)
    technician_name = Column(String, nullable=False)
    status = Column(String, default="COMPLETED") # COMPLETED, SCHEDULED, IN_PROGRESS
    performed_at = Column(DateTime, default=datetime.utcnow)
    findings = Column(Text, nullable=True)
    parts_replaced = Column(Text, nullable=True)
