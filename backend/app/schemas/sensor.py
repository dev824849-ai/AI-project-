from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorBase(BaseModel):
    station_id: str
    name: str
    subsystem: str
    unit: str
    min_safe_value: float
    max_safe_value: float
    current_value: Optional[float] = 0.0
    is_anomaly: Optional[bool] = False
    is_active: Optional[bool] = True
    is_simulated: Optional[bool] = True

class SensorCreate(SensorBase):
    id: str

class SensorOut(SensorBase):
    id: str
    last_updated: datetime

    class Config:
        from_attributes = True

class SensorReadingBase(BaseModel):
    sensor_id: str
    station_id: str
    value: float
    is_anomaly: Optional[bool] = False
    anomaly_score: Optional[float] = 0.0
    is_simulated: Optional[bool] = True

class SensorReadingCreate(SensorReadingBase):
    pass

class SensorReadingOut(SensorReadingBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
