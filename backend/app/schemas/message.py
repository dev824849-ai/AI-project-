from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    station_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_station: str
    message_type: Optional[str] = "STANDARD"
    priority: Optional[str] = "NORMAL"
    subject: str
    body: str
    is_simulated: Optional[bool] = True

class MessageCreate(MessageBase):
    pass

class MessageAcknowledge(BaseModel):
    acknowledged_by: str

class MessageOut(MessageBase):
    id: int
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    timestamp: datetime

    class Config:
        from_attributes = True
