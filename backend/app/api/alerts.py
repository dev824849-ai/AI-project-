from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.db import get_db
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.audit import AuditLog
from app.schemas.alert import AlertOut, AlertCreate, AlertAcknowledge, AlertResolve
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/alerts", tags=["Intelligent Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    station_id: Optional[str] = None,
    severity: Optional[AlertSeverity] = None,
    status: Optional[AlertStatus] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert).order_by(Alert.created_at.desc())
    if station_id:
        query = query.filter(Alert.station_id == station_id)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    return query.limit(limit).all()

@router.get("/summary")
def get_alert_summary(db: Session = Depends(get_db)):
    total_active = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE).count()
    critical = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE, Alert.severity == AlertSeverity.CRITICAL).count()
    high = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE, Alert.severity == AlertSeverity.HIGH).count()
    medium = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE, Alert.severity == AlertSeverity.MEDIUM).count()
    low = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE, Alert.severity == AlertSeverity.LOW).count()
    
    return {
        "active_total": total_active,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "is_simulated": True
    }

@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(
    alert_id: int,
    ack: AlertAcknowledge,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_by = ack.acknowledged_by or current_user.full_name
    alert.acknowledged_at = datetime.utcnow()
    
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action="ALERT_ACKNOWLEDGE",
        entity_type="ALERT",
        entity_id=str(alert.id),
        description=f"Alert #{alert.id} ({alert.title}) acknowledged by {alert.acknowledged_by}.",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    res: AlertResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = AlertStatus.RESOLVED
    alert.resolved_by = res.resolved_by or current_user.full_name
    alert.resolved_at = datetime.utcnow()
    alert.resolution_notes = res.resolution_notes
    
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action="ALERT_RESOLVE",
        entity_type="ALERT",
        entity_id=str(alert.id),
        description=f"Alert #{alert.id} resolved with notes: {res.resolution_notes}",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert
