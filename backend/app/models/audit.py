from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from app.database.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True) # Username or system
    user_role = Column(String, default="SUPER_ADMIN")
    action = Column(String, nullable=False) # LOGIN, ALERT_ACKNOWLEDGE, REMOTE_SWITCH, INVENTORY_UPDATE, INCIDENT_RESOLVE, THRESHOLD_UPDATE
    entity_type = Column(String, nullable=False) # STATION, EQUIPMENT, ALERT, INCIDENT, INVENTORY, USER
    entity_id = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    result = Column(String, default="SUCCESS") # SUCCESS, FAILED, SIMULATED
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
