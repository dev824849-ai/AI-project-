from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.incident import IncidentSeverity, IncidentStatus

class IncidentActionBase(BaseModel):
    action_type: str
    description: str
    performed_by: str
    result_status: Optional[str] = "SUCCESS"

class IncidentActionCreate(IncidentActionBase):
    incident_id: str

class IncidentActionOut(IncidentActionBase):
    id: int
    incident_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    station_id: str
    title: str
    incident_type: str
    severity: IncidentSeverity
    status: Optional[IncidentStatus] = IncidentStatus.REPORTED
    description: str
    affected_subsystem: str
    backup_systems_status: Optional[str] = None
    recommended_protocols: Optional[str] = None
    actions_taken: Optional[str] = None
    assigned_to: Optional[str] = None
    reported_by: Optional[str] = "POLARIS AI Engine"
    root_cause: Optional[str] = None
    is_simulated: Optional[bool] = True

class IncidentCreate(IncidentBase):
    id: str

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    assigned_to: Optional[str] = None
    actions_taken: Optional[str] = None
    root_cause: Optional[str] = None
    backup_systems_status: Optional[str] = None

class IncidentOut(IncidentBase):
    id: str
    reported_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
