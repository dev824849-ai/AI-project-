import os
import joblib
from typing import Optional, Any
from app.config import settings

class MLModelRegistry:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModelRegistry, cls).__new__(cls)
            cls._instance._load_models()
        return cls._instance
    
    def _load_models(self):
        self.isolation_forest: Optional[Any] = None
        self.predictive_rf: Optional[Any] = None
        
        iso_path = os.path.join(settings.ML_MODEL_DIR, "isolation_forest.joblib")
        rf_path = os.path.join(settings.ML_MODEL_DIR, "predictive_maintenance_rf.joblib")
        
        if os.path.exists(iso_path):
            try:
                self.isolation_forest = joblib.load(iso_path)
            except Exception as e:
                print(f"[WARN] Could not load Isolation Forest: {e}")
                
        if os.path.exists(rf_path):
            try:
                self.predictive_rf = joblib.load(rf_path)
            except Exception as e:
                print(f"[WARN] Could not load Random Forest: {e}")

ml_registry = MLModelRegistry()
