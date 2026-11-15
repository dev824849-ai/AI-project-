from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.equipment import EquipmentStatus, FailureRisk

class EquipmentBase(BaseModel):
    station_id: str
    name: str
    type: str
    subsystem: str
    location_room: str
    status: Optional[EquipmentStatus] = EquipmentStatus.NORMAL
    health_score: Optional[float] = 95.0
    failure_risk: Optional[FailureRisk] = FailureRisk.LOW
    temperature_c: Optional[float] = 68.0
    vibration_mms: Optional[float] = 1.8
    power_consumption_kw: Optional[float] = 45.0
    operating_hours: Optional[float] = 3420.0
    efficiency_pct: Optional[float] = 92.5
    predicted_rul_hours: Optional[float] = 1200.0
    anomaly_reason: Optional[str] = None
    recommended_action: Optional[str] = None
    is_critical_asset: Optional[bool] = True
    is_simulated: Optional[bool] = True

class EquipmentCreate(EquipmentBase):
    id: str

class EquipmentUpdate(BaseModel):
    status: Optional[EquipmentStatus] = None
    health_score: Optional[float] = None
    failure_risk: Optional[FailureRisk] = None
    temperature_c: Optional[float] = None
    vibration_mms: Optional[float] = None
    power_consumption_kw: Optional[float] = None
    predicted_rul_hours: Optional[float] = None
    anomaly_reason: Optional[str] = None
    recommended_action: Optional[str] = None

class EquipmentOut(EquipmentBase):
    id: str
    last_maintenance: datetime
    next_maintenance_due: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaintenanceRecordBase(BaseModel):
    equipment_id: str
    station_id: str
    maintenance_type: str
    description: str
    technician_name: str
    status: Optional[str] = "COMPLETED"
    findings: Optional[str] = None
    parts_replaced: Optional[str] = None

class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass

class MaintenanceRecordOut(MaintenanceRecordBase):
    id: int
    performed_at: datetime

    class Config:
        from_attributes = True
