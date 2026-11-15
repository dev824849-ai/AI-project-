from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database.db import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogOut
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/settings", tags=["System Settings & Thresholds"])

class ThresholdConfig(BaseModel):
    generator_temp_max_c: float = 80.0
    generator_vibration_max_mms: float = 2.5
    fuel_critical_pct: float = 20.0
    comm_latency_max_ms: float = 1200.0
    wind_speed_blizzard_knots: float = 40.0

# In-memory config for instant tweakability in demo
active_thresholds = ThresholdConfig()

@router.get("/thresholds")
def get_thresholds():
    return active_thresholds

@router.post("/thresholds")
def update_thresholds(
    cfg: ThresholdConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    global active_thresholds
    active_thresholds = cfg
    
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action="UPDATE_THRESHOLDS",
        entity_type="SYSTEM_SETTINGS",
        entity_id="THRESHOLDS",
        description=f"Operational alert thresholds updated by {current_user.full_name}.",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()
    return {"success": True, "thresholds": active_thresholds}

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
