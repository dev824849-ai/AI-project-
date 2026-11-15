import numpy as np
from typing import Dict, Any, Tuple
from app.ml.model_loader import ml_registry

def detect_sensor_anomaly(
    temperature: float,
    vibration: float = 1.6,
    power_kw: float = 65.0,
    wind_speed: float = 20.0,
    pressure_hpa: float = 985.0
) -> Tuple[bool, float, str]:
    """
    Evaluates multi-sensor inputs against Isolation Forest model + threshold checks.
    Returns: (is_anomaly: bool, anomaly_score: float, reason: str)
    """
    model = ml_registry.isolation_forest
    features = np.array([[temperature, vibration, power_kw, wind_speed, pressure_hpa]])
    
    is_anomaly = False
    score = 0.0
    reasons = []
    
    # 1. Isolation Forest Evaluation
    if model is not None:
        pred = model.predict(features)[0] # -1 for anomaly, 1 for normal
        decision_score = model.decision_function(features)[0] # lower means more anomalous
        # Map decision score to 0..1 anomaly probability
        score = float(np.clip(1.0 - (decision_score + 0.5), 0.0, 1.0))
        if pred == -1:
            is_anomaly = True
            reasons.append(f"ML Isolation Forest detected outlier pattern (score: {score:.2f})")
    
    # 2. Heuristic domain rule checks
    if temperature > 82.0:
        is_anomaly = True
        reasons.append(f"Thermal threshold exceeded: {temperature:.1f}°C (nominal max: 78°C)")
        score = max(score, 0.85)
    elif temperature < -45.0:
        is_anomaly = True
        reasons.append(f"Extreme low temperature threshold breached: {temperature:.1f}°C")
        score = max(score, 0.75)
        
    if vibration > 3.0:
        is_anomaly = True
        reasons.append(f"High mechanical vibration: {vibration:.2f} mm/s (nominal max: 2.2 mm/s)")
        score = max(score, 0.80)
        
    if wind_speed > 45.0:
        is_anomaly = True
        reasons.append(f"Katabatic windstorm gale warning: {wind_speed:.1f} knots")
        score = max(score, 0.88)
        
    if pressure_hpa < 950.0:
        is_anomaly = True
        reasons.append(f"Rapid barometric drop (Polar Cyclonic Depression): {pressure_hpa:.1f} hPa")
        score = max(score, 0.82)
        
    reason_str = " | ".join(reasons) if reasons else "Telemetry parameters within nominal polar tolerances."
    return is_anomaly, score, reason_str
