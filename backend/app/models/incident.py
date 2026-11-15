import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, Boolean
from app.database.db import Base

class IncidentSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    CONTAINMENT_ACTIVE = "CONTAINMENT_ACTIVE"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True) # e.g. "INC-2026-BH-0042"
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    incident_type = Column(String, nullable=False) # GENERATOR_FAILURE, POWER_LOSS, EXTREME_BLIZZARD, FUEL_LEAK, COMMS_BLACKOUT, MEDICAL_EMERGENCY, FIRE
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.HIGH, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED, nullable=False)
    description = Column(Text, nullable=False)
    
    # Impact Assessment
    affected_subsystem = Column(String, nullable=False) # POWER, LIFE_SUPPORT, COMMUNICATIONS, LOGISTICS
    backup_systems_status = Column(Text, nullable=True) # "Secondary Generator-01 online on standby"
    
    # Recommended Action Protocols
    recommended_protocols = Column(Text, nullable=True)
    actions_taken = Column(Text, nullable=True)
    
    assigned_to = Column(String, nullable=True) # User or Station Leader
    reported_by = Column(String, default="POLARIS AI Anomaly Detection Engine")
    reported_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    root_cause = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)

class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False) # REMOTE_SWITCH, NOTIFICATION_SENT, MANUAL_INSPECTION, POWER_SHEDDING
    description = Column(Text, nullable=False)
    performed_by = Column(String, nullable=False)
    result_status = Column(String, default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.utcnow)
