from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AIPredictionBase(BaseModel):
    station_id: str
    equipment_id: Optional[str] = None
    model_type: str
    title: str
    what_happened: str
    why_it_matters: str
    confidence_pct: Optional[float] = 94.5
    risk_level: Optional[str] = "HIGH"
    recommended_action: str
    anomaly_score: Optional[float] = 0.78
    is_active: Optional[bool] = True
    is_simulated: Optional[bool] = True

class AIPredictionCreate(AIPredictionBase):
    pass

class AIPredictionOut(AIPredictionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
