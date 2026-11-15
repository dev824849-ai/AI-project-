import numpy as np
from typing import Dict, Any, Tuple
from app.ml.model_loader import ml_registry

def predict_equipment_failure_risk(
    temperature: float,
    vibration: float,
    power_kw: float,
    operating_hours: float,
    temp_trend: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates equipment parameters using Random Forest model and physics-informed degradation.
    Returns:
    - risk_level: LOW, MEDIUM, HIGH, CRITICAL
    - health_score: float (0 - 100)
    - predicted_rul_hours: float
    - reason: str
    - recommended_action: str
    """
    model = ml_registry.predictive_rf
    features = np.array([[temperature, vibration, power_kw, operating_hours, temp_trend]])
    
    # Defaults
    health_score = 95.0
    risk_level = "LOW"
    rul_hours = max(200.0, 5000.0 - (operating_hours * 0.4))
    reason = "All mechanical & thermal metrics within operating thresholds."
    recommended_action = "Continue routine inspection cycle."
    
    if model is not None:
        pred_class = model.predict(features)[0] # 0: Normal, 1: Warning, 2: Critical
        probs = model.predict_proba(features)[0]
        
        if pred_class == 2 or temperature >= 85.0 or vibration >= 3.8:
            risk_level = "CRITICAL" if temperature >= 88.0 else "HIGH"
            health_score = max(15.0, 60.0 - (temperature - 80.0) * 3.5 - (vibration * 4.0))
            rul_hours = max(12.0, 120.0 - (temperature - 80.0) * 10.0)
            reason = f"Abnormal temperature ({temperature:.1f}°C) and vibration ({vibration:.2f} mm/s) trend indicates severe bearing friction and impending rotor stall."
            recommended_action = "IMMEDIATE: Request load transfer to standby generator. Dispatch power plant engineer with thermal imaging camera."
        elif pred_class == 1 or temperature >= 76.0 or vibration >= 2.4:
            risk_level = "MEDIUM" if temperature < 80.0 else "HIGH"
            health_score = max(55.0, 80.0 - (temperature - 74.0) * 2.5)
            rul_hours = max(80.0, 450.0 - (operating_hours * 0.04))
            reason = f"Elevated temperature trend ({temperature:.1f}°C, trend: +{temp_trend:.1f}°C/10m) and minor harmonic vibration detected."
            recommended_action = "Schedule preventive coolant loop flushing and check oil viscosity within 24 hours."
        else:
            health_score = max(85.0, 100.0 - (operating_hours / 250.0) - (temperature - 65.0)*0.5)
            risk_level = "LOW"
            rul_hours = max(800.0, 5000.0 - operating_hours * 0.5)
            reason = "Generator telemetry nominal. Harmonic vibration and heat dissipation within specifications."
            recommended_action = "Maintain standard maintenance log and bi-weekly oil sampling."
    else:
        # Fallback heuristic
        if temperature > 85.0:
            risk_level = "HIGH"
            health_score = 45.0
            rul_hours = 48.0
            reason = f"High temperature detected: {temperature:.1f}°C"
            recommended_action = "Inspect cooling radiator and throttle non-essential load."
            
    return {
        "risk_level": risk_level,
        "health_score": round(float(health_score), 1),
        "predicted_rul_hours": round(float(rul_hours), 1),
        "reason": reason,
        "recommended_action": recommended_action
    }
