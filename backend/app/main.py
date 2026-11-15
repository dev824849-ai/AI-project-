from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api import api_router
from app.database.seed_data import seed_database
from app.simulator.simulator_engine import telemetry_engine
from app.websocket.connection_manager import ws_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database and start live telemetry background simulation
    print("[STARTUP] Initializing POLARIS Platform...")
    seed_database()
    telemetry_engine.start()
    yield
    # Shutdown
    print("[SHUTDOWN] Stopping background services...")
    telemetry_engine.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Mission-Critical Intelligent Decision-Support & Operations Management Platform for Indian Antarctic Research Stations (Maitri & Bharati).",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-time WebSocket Endpoint
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and receive any client-side commands/pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "platform": "POLARIS – Intelligent Remote Antarctic Station Management Platform",
        "version": settings.PROJECT_VERSION,
        "organization": "NCAOR / Ministry of Earth Sciences, Govt. of India",
        "stations_monitored": ["Maitri Station", "Bharati Station", "Dakshin Gangotri (Heritage)"],
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "is_simulated": True
    }

@app.get("/health")
def healthcheck():
    return {
        "status": "healthy",
        "simulator_running": telemetry_engine.is_running
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
