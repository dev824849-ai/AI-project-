from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from app.database.db import Base

class Personnel(Base):
    __tablename__ = "personnel"

    id = Column(String, primary_key=True, index=True) # e.g. "PER-BHARATI-01"
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False) # Station Leader, Chief Scientist, Power Plant Engineer, Medical Doctor, Telecommunications Officer, Glaciologist, Cook
    department = Column(String, nullable=False) # Science, Engineering, Medical, Logistics, Operations
    organization = Column(String, default="NCAOR / MoES / Indian Army / IMD")
    expedition_batch = Column(String, default="44th Indian Antarctic Expedition")
    shift_status = Column(String, default="ON_DUTY") # ON_DUTY, OFF_DUTY, RESTING, FIELD_MISSION
    emergency_role = Column(String, default="Fire Squad Member")
    arrival_date = Column(DateTime, default=datetime.utcnow)
    expected_departure = Column(DateTime, default=datetime.utcnow)
    blood_group = Column(String, default="O+")
    emergency_status = Column(String, default="SAFE") # SAFE, MUSTERED, FIELD_EXPEDITION, MEDICAL_ATTENTION
    is_active = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
