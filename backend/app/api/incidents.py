from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.db import get_db
from app.models.incident import Incident, IncidentStatus, IncidentSeverity, IncidentAction
from app.models.audit import AuditLog
from app.schemas.incident import IncidentOut, IncidentCreate, IncidentUpdate, IncidentActionOut, IncidentActionCreate
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/incidents", tags=["Emergency & Incident Management"])

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    station_id: Optional[str] = None,
    status: Optional[IncidentStatus] = None,
    severity: Optional[IncidentSeverity] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).order_by(Incident.reported_at.desc())
    if station_id:
        query = query.filter(Incident.station_id == station_id)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    return query.all()

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.get("/{incident_id}/actions", response_model=List[IncidentActionOut])
def get_incident_actions(incident_id: str, db: Session = Depends(get_db)):
    return db.query(IncidentAction).filter(IncidentAction.incident_id == incident_id).order_by(IncidentAction.timestamp.asc()).all()

@router.post("/{incident_id}/actions", response_model=IncidentActionOut)
def record_incident_action(
    incident_id: str,
    action_in: IncidentActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    action = IncidentAction(
        incident_id=incident_id,
        action_type=action_in.action_type,
        description=action_in.description,
        performed_by=action_in.performed_by or current_user.full_name,
        result_status=action_in.result_status
    )
    db.add(action)
    
    # Update incident state if transitioning
    if action_in.action_type == "RESOLVE":
        inc.status = IncidentStatus.RESOLVED
        inc.resolved_at = datetime.utcnow()
    elif inc.status == IncidentStatus.REPORTED:
        inc.status = IncidentStatus.CONTAINMENT_ACTIVE
        
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action="INCIDENT_ACTION",
        entity_type="INCIDENT",
        entity_id=incident_id,
        description=f"Action '{action_in.action_type}' recorded on {incident_id}: {action_in.description}",
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action
