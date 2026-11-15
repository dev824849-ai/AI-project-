import os
from typing import List

class Settings:
    PROJECT_NAME: str = "POLARIS – Intelligent Remote Antarctic Station Management Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-your-local-env-file")

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./polaris.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "*"
    ]
    
    # Telemetry & Simulation
    SIMULATION_INTERVAL_SECONDS: float = 3.0
    DATA_SIMULATOR_ACTIVE: bool = True
    
    # Model storage path
    ML_MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "ml", "models")

settings = Settings()
