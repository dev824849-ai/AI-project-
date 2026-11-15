from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PersonnelBase(BaseModel):
    station_id: str
    full_name: str
    role: str
    department: str
    organization: Optional[str] = "NCAOR / MoES / Indian Army / IMD"
    expedition_batch: Optional[str] = "44th Indian Antarctic Expedition"
    shift_status: Optional[str] = "ON_DUTY"
    emergency_role: Optional[str] = "Fire Squad Member"
    arrival_date: Optional[datetime] = None
    expected_departure: Optional[datetime] = None
    blood_group: Optional[str] = "O+"
    emergency_status: Optional[str] = "SAFE"
    is_active: Optional[bool] = True
    is_simulated: Optional[bool] = True

class PersonnelCreate(PersonnelBase):
    id: str

class PersonnelUpdate(BaseModel):
    role: Optional[str] = None
    department: Optional[str] = None
    shift_status: Optional[str] = None
    emergency_status: Optional[str] = None
    is_active: Optional[bool] = None

class PersonnelOut(PersonnelBase):
    id: str

    class Config:
        from_attributes = True
