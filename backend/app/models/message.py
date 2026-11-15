from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from app.database.db import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, nullable=False, index=True) # "bharati", "maitri", "ALL"
    sender_id = Column(String, nullable=False) # "NCAOR_INDIA_CONTROL" or "BHARATI_STATION_LEADER"
    sender_name = Column(String, nullable=False)
    sender_role = Column(String, nullable=False)
    recipient_station = Column(String, nullable=False) # "bharati", "maitri", "CONTROL_CENTER", "ALL"
    message_type = Column(String, default="STANDARD") # STANDARD, EMERGENCY_BROADCAST, WEATHER_BULLETIN, DIRECTIVE
    priority = Column(String, default="NORMAL") # NORMAL, URGENT, FLASH_PRIORITY
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    is_simulated = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
