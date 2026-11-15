from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from app.database.db import Base

class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    equipment_id = Column(String, nullable=True, index=True)
    model_type = Column(String, nullable=False) # ISOLATION_FOREST, RANDOM_FOREST_FAILURE, TIME_SERIES_DEGRADATION, FUEL_FORECAST
    title = Column(String, nullable=False) # e.g. "Generator Thermal Drift Detected"
    what_happened = Column(Text, nullable=False) # "Abnormal temperature rise from 70°C to 89°C within 15 min"
    why_it_matters = Column(Text, nullable=False) # "High risk of rotor winding breakdown and primary power loss"
    confidence_pct = Column(Float, default=94.5)
    risk_level = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    recommended_action = Column(Text, nullable=False) # "Switch primary load to Backup Generator-01; dispatch engineer to inspect coolant loop"
    anomaly_score = Column(Float, default=0.78)
    is_active = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
