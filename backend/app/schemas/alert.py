from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.alert import AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    station_id: str
    source: str
    subsystem: str
    title: str
    description: str
    severity: AlertSeverity
    status: Optional[AlertStatus] = AlertStatus.ACTIVE
    parameter: Optional[str] = None
    current_value: Optional[float] = None
    expected_range: Optional[str] = None
    anomaly_score: Optional[float] = 0.0
    recommended_action: Optional[str] = None
    is_simulated: Optional[bool] = True

class AlertCreate(AlertBase):
    pass

class AlertAcknowledge(BaseModel):
    acknowledged_by: str

class AlertResolve(BaseModel):
    resolved_by: str
    resolution_notes: str

class AlertOut(AlertBase):
    id: int
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
