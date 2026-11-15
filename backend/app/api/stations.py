from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.station import Station, StationStatus
from app.models.equipment import Equipment
from app.models.inventory import InventoryItem
from app.models.personnel import Personnel
from app.models.alert import Alert, AlertStatus
from app.schemas.station import StationOut, StationCreate, StationUpdate
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("", response_model=List[StationOut])
def get_stations(
    status: Optional[StationStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Station)
    if status:
        query = query.filter(Station.status == status)
    return query.all()

@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: str, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@router.get("/{station_id}/summary")
def get_station_deep_summary(station_id: str, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    equipment = db.query(Equipment).filter(Equipment.station_id == station_id).all()
    inventory = db.query(InventoryItem).filter(InventoryItem.station_id == station_id).all()
    personnel = db.query(Personnel).filter(Personnel.station_id == station_id).all()
    active_alerts = db.query(Alert).filter(
        Alert.station_id == station_id,
        Alert.status.in_([AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED])
    ).all()
    
    return {
        "station": StationOut.model_validate(station),
        "equipment_count": len(equipment),
        "inventory_count": len(inventory),
        "personnel_count": len(personnel),
        "active_alerts_count": len(active_alerts),
        "equipment": equipment,
        "inventory": inventory,
        "personnel": personnel,
        "alerts": active_alerts
    }

@router.put("/{station_id}", response_model=StationOut)
def update_station(
    station_id: str,
    station_in: StationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    update_data = station_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(station, field, value)
        
    db.commit()
    db.refresh(station)
    return station
