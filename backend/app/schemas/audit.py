from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: str
    user_role: Optional[str] = "SUPER_ADMIN"
    action: str
    entity_type: str
    entity_id: str
    description: str
    result: Optional[str] = "SUCCESS"
    ip_address: Optional[str] = "127.0.0.1"

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogOut(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
