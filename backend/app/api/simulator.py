from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.simulator.scenarios import scenario_state, DemoScenario
from app.simulator.simulator_engine import telemetry_engine
from app.database.db import get_db
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/simulator", tags=["SIH Presentation Simulator Controller"])

class SetScenarioRequest(BaseModel):
    scenario: DemoScenario
    station_id: Optional[str] = "bharati"

@router.get("/status")
def get_simulator_status():
    return {
        "is_running": telemetry_engine.is_running,
        "current_scenario": scenario_state.current_scenario.value,
        "scenario_step": scenario_state.scenario_step,
        "generator_temp": scenario_state.generator_temp_override,
        "wind_speed": scenario_state.wind_speed_override,
        "fuel_pct": scenario_state.fuel_pct_override,
        "comm_status": scenario_state.comm_status_override,
        "is_simulated": True
    }

@router.post("/set-scenario")
def set_demo_scenario(
    req: SetScenarioRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scenario_state.set_scenario(req.scenario)
    
    audit = AuditLog(
        user_id=current_user.username,
        user_role=current_user.role.value,
        action="SET_DEMO_SCENARIO",
        entity_type="SIMULATOR",
        entity_id=req.scenario.value,
        description=f"SIH Presentation Demo Scenario activated: {req.scenario.value} on {req.station_id}.",
        result="SIMULATED"
    )
    db.add(audit)
    db.commit()
    
    return {
        "success": True,
        "message": f"Activated demo scenario: {req.scenario.value}",
        "scenario": req.scenario.value,
        "is_simulated": True
    }

@router.post("/start")
def start_simulator():
    telemetry_engine.start()
    return {"success": True, "message": "Telemetry simulation started"}

@router.post("/stop")
def stop_simulator():
    telemetry_engine.stop()
    return {"success": True, "message": "Telemetry simulation stopped"}
