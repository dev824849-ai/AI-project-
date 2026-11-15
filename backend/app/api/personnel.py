from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.personnel import Personnel
from app.schemas.personnel import PersonnelOut, PersonnelCreate, PersonnelUpdate
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/personnel", tags=["Personnel Management"])

@router.get("", response_model=List[PersonnelOut])
def get_personnel(
    station_id: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Personnel)
    if station_id:
        query = query.filter(Personnel.station_id == station_id)
    if department:
        query = query.filter(Personnel.department == department)
    return query.all()

@router.get("/roster-summary")
def get_roster_summary(db: Session = Depends(get_db)):
    all_crew = db.query(Personnel).all()
    maitri_crew = [p for p in all_crew if p.station_id == "maitri"]
    bharati_crew = [p for p in all_crew if p.station_id == "bharati"]
    
    def count_by_dept(crew_list):
        counts = {"Science": 0, "Engineering": 0, "Medical": 0, "Logistics": 0, "Operations": 0}
        for p in crew_list:
            d = p.department
            counts[d] = counts.get(d, 0) + 1
        return counts

    return {
        "total_deployed": len(all_crew),
        "bharati": {
            "total": len(bharati_crew),
            "departments": count_by_dept(bharati_crew),
            "emergency_ready": len([p for p in bharati_crew if p.emergency_status == "SAFE"])
        },
        "maitri": {
            "total": len(maitri_crew),
            "departments": count_by_dept(maitri_crew),
            "emergency_ready": len([p for p in maitri_crew if p.emergency_status == "SAFE"])
        },
        "is_simulated": True
    }
