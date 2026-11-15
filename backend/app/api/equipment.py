from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.equipment import Equipment, EquipmentStatus, FailureRisk, MaintenanceRecord
from app.schemas.equipment import EquipmentOut, EquipmentCreate, EquipmentUpdate, MaintenanceRecordOut, MaintenanceRecordCreate
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/equipment", tags=["Equipment Management"])

@router.get("", response_model=List[EquipmentOut])
def get_equipment_list(
    station_id: Optional[str] = None,
    subsystem: Optional[str] = None,
    status: Optional[EquipmentStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Equipment)
    if station_id:
        query = query.filter(Equipment.station_id == station_id)
    if subsystem:
        query = query.filter(Equipment.subsystem == subsystem)
    if status:
        query = query.filter(Equipment.status == status)
    return query.all()

@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment_detail(equipment_id: str, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return eq

@router.get("/{equipment_id}/maintenance", response_model=List[MaintenanceRecordOut])
def get_equipment_maintenance_history(equipment_id: str, db: Session = Depends(get_db)):
    records = db.query(MaintenanceRecord).filter(MaintenanceRecord.equipment_id == equipment_id).all()
    return records

@router.post("/{equipment_id}/maintenance", response_model=MaintenanceRecordOut)
def add_maintenance_record(
    equipment_id: str,
    record_in: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.STATION_ADMIN]))
):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    record = MaintenanceRecord(
        equipment_id=equipment_id,
        station_id=eq.station_id,
        maintenance_type=record_in.maintenance_type,
        description=record_in.description,
        technician_name=record_in.technician_name,
        status=record_in.status,
        findings=record_in.findings,
        parts_replaced=record_in.parts_replaced
    )
    db.add(record)
    
    # Reset health if emergency/overhaul completed
    eq.status = EquipmentStatus.NORMAL
    eq.failure_risk = FailureRisk.LOW
    eq.health_score = 98.0
    eq.temperature_c = 70.0
    eq.vibration_mms = 1.6
    
    db.commit()
    db.refresh(record)
    return record
