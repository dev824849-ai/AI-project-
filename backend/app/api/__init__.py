from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.stations import router as stations_router
from app.api.telemetry import router as telemetry_router
from app.api.equipment import router as equipment_router
from app.api.inventory import router as inventory_router
from app.api.energy import router as energy_router
from app.api.personnel import router as personnel_router
from app.api.alerts import router as alerts_router
from app.api.incidents import router as incidents_router
from app.api.messages import router as messages_router
from app.api.weather import router as weather_router
from app.api.analytics import router as analytics_router
from app.api.ai_insights import router as ai_insights_router
from app.api.digital_twin import router as digital_twin_router
from app.api.simulator import router as simulator_router
from app.api.remote_actions import router as remote_actions_router
from app.api.settings import router as settings_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(stations_router)
api_router.include_router(telemetry_router)
api_router.include_router(equipment_router)
api_router.include_router(inventory_router)
api_router.include_router(energy_router)
api_router.include_router(personnel_router)
api_router.include_router(alerts_router)
api_router.include_router(incidents_router)
api_router.include_router(messages_router)
api_router.include_router(weather_router)
api_router.include_router(analytics_router)
api_router.include_router(ai_insights_router)
api_router.include_router(digital_twin_router)
api_router.include_router(simulator_router)
api_router.include_router(remote_actions_router)
api_router.include_router(settings_router)

__all__ = ["api_router"]
