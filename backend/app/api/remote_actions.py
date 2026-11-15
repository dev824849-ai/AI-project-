from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.db import get_db
from app.models.station import Station
from app.models.equipment import Equipment, EquipmentStatus, FailureRisk
from app.models.incident import Incident, IncidentStatus, IncidentAction
from app.models.alert import Alert, AlertStatus
from app.models.audit import AuditLog
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.simulator.scenarios import scenario_state, DemoScenario

router = APIRouter(prefix="/remote-actions", tags=["Safe Simulated Remote Actions"])

class RemoteActionRequest(BaseModel):
    station_id: str
    action_type: str # SWITCH_GENERATOR, ENGAGE_BACKUP_POWER, SHED_NON_CRITICAL_LOAD, TRIGGER_EMERGENCY_SIREN, FLUSH_COOLANT_LOOP
    target_equipment_id: str
    notes: str = ""

@router.post("/execute")
def execute_simulated_remote_action(
    req: RemoteActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.STATION_ADMIN]))
):
    """
    Executes a SAFE, simulated command on Antarctic station infrastructure.
    Explicitly labeled as SIMULATION MODE to comply with safety protocols.
    """
    station = db.query(Station).filter(Station.id == req.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    eq = db.query(Equipment).filter(Equipment.id == req.target_equipment_id).first()
    
    execution_detail = ""
    
    if req.action_type == "SWITCH_GENERATOR":
        # Switch load to backup generator and cool down primary generator
        if eq:
            eq.temperature_c = 68.5
            eq.vibration_mms = 1.6
            eq.status = EquipmentStatus.NORMAL
            eq.failure_risk = FailureRisk.LOW
            eq.health_score = 96.0
            eq.anomaly_reason = "Load transferred to standby generator. Primary generator cooling."
            eq.recommended_action = "Routine inspection."
        
        # Reset scenario if was generator risk
        if scenario_state.current_scenario == DemoScenario.SCENARIO_2_GENERATOR_RISK:
            scenario_state.set_scenario(DemoScenario.SCENARIO_1_NORMAL)
            
        execution_detail = f"Simulated SCADA bus transfer executed: Switched main habitat load from {req.target_equipment_id} to Standby Generator-02. Frequency stabilized at 50.0 Hz."
        
    elif req.action_type == "SHED_NON_CRITICAL_LOAD":
        execution_detail = "Simulated power shedding: Deactivated non-critical sauna and auxiliary heaters. Station load reduced by 22 kW."
        
    elif req.action_type == "TRIGGER_EMERGENCY_SIREN":
        execution_detail = f"Emergency muster signal broadcast across all station PA speakers and pager networks on {station.name}."
        
    else:
        execution_detail = f"Executed simulated control command '{req.action_type}' on {req.target_equipment_id}."

    # Record in Incident Actions if there is an active incident
    active_inc = db.query(Incident).filter(
        Incident.station_id == req.station_id,
        Incident.status.in_([IncidentStatus.REPORTED, IncidentStatus.CONTAINMENT_ACTIVE])
    ).first()
    
    if active_inc:
        action_log = IncidentAction(
            incident_id=active_inc.id,
            action_type=req.action_type,
            description=execution_detail,
            performed_by=current_user.full_name,
            result_status="SIMULATED_SUCCESS"
        )
        db.add(action_log)
        active_inc.status = IncidentStatus.CONTAINMENT_ACTIVE
        active_inc.actions_taken = f"Load transfer command executed by {current_user.full_name} via POLARIS India Command."

    # Acknowledge any active power alerts
    alerts = db.query(Alert).filter(
        Alert.station_id == req.station_id,
        Alert.subsystem == "POWER",
        Alert.status == AlertStatus.ACTIVE
    ).all()
    for a in alerts:
        a.status = AlertStatus.ACKNOWLEDGED
        a.acknowledged_by = current_user.full_name
        a.acknowledged_at = datetime.utcnow()

    # Create Audit Log
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action=f"REMOTE_ACTION:{req.action_type}",
        entity_type="EQUIPMENT",
        entity_id=req.target_equipment_id,
        description=f"[SIMULATION MODE] {execution_detail}. Notes: {req.notes}",
        result="SIMULATED_SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "mode": "SIMULATION MODE",
        "action_type": req.action_type,
        "target_equipment_id": req.target_equipment_id,
        "station_id": req.station_id,
        "result": execution_detail,
        "executed_by": current_user.full_name,
        "timestamp": datetime.utcnow().isoformat()
    }
