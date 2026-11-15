import numpy as np
import pandas as pd
from typing import Dict, Any, List

def extract_sensor_features(sensor_readings: List[Dict[str, Any]]) -> np.ndarray:
    """
    Extracts statistical and rate-of-change features from a sequence of sensor readings.
    Features:
    [current_val, rolling_mean, rolling_std, rate_of_change, min_val, max_val]
    """
    if not sensor_readings:
        return np.zeros((1, 6))
    
    values = [r.get("value", 0.0) for r in sensor_readings]
    arr = np.array(values)
    
    curr = arr[-1] if len(arr) > 0 else 0.0
    mean = np.mean(arr) if len(arr) > 0 else 0.0
    std = np.std(arr) if len(arr) > 1 else 0.0
    roc = (arr[-1] - arr[0]) / max(len(arr) - 1, 1) if len(arr) > 1 else 0.0
    min_v = np.min(arr) if len(arr) > 0 else 0.0
    max_v = np.max(arr) if len(arr) > 0 else 0.0
    
    return np.array([[curr, mean, std, roc, min_v, max_v]])

def extract_equipment_features(
    temperature: float,
    vibration: float,
    power_kw: float,
    operating_hours: float,
    temp_trend: float = 0.0
) -> np.ndarray:
    """
    Features for equipment failure prediction:
    [temp, vibration, power_kw, operating_hours, temp_trend]
    """
    return np.array([[temperature, vibration, power_kw, operating_hours, temp_trend]])
