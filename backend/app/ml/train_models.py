import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, accuracy_score
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_isolation_forest():
    """
    Train Isolation Forest for multi-sensor anomaly detection in Antarctic environments.
    Parameters modeled:
    - Generator Temp (°C): normal ~ 65-75
    - Generator Vibration (mm/s): normal ~ 1.0-2.2
    - Power draw (kW): normal ~ 50-80
    - Ambient Wind speed (knots): normal ~ 10-30
    - Pressure (hPa): normal ~ 970-1000
    """
    print("[INFO] Training Isolation Forest Anomaly Detection Model...")
    np.random.seed(42)
    n_samples = 2500
    
    # Normal telemetry distribution
    temp = np.random.normal(70.0, 3.5, n_samples)
    vib = np.random.normal(1.6, 0.3, n_samples)
    power = np.random.normal(65.0, 6.0, n_samples)
    wind = np.random.normal(20.0, 5.0, n_samples)
    pressure = np.random.normal(985.0, 7.0, n_samples)
    
    X_normal = np.column_stack([temp, vib, power, wind, pressure])
    
    # Simulated anomalies (approx 5%)
    n_anomalies = 120
    temp_anom = np.random.uniform(85.0, 105.0, n_anomalies)
    vib_anom = np.random.uniform(3.5, 7.5, n_anomalies)
    power_anom = np.random.uniform(95.0, 140.0, n_anomalies)
    wind_anom = np.random.uniform(50.0, 85.0, n_anomalies)
    pressure_anom = np.random.uniform(930.0, 955.0, n_anomalies)
    
    X_anom = np.column_stack([temp_anom, vib_anom, power_anom, wind_anom, pressure_anom])
    X_train = np.vstack([X_normal, X_anom])
    
    iso_model = IsolationForest(
        n_estimators=100,
        contamination=0.06,
        random_state=42
    )
    iso_model.fit(X_train)
    
    save_path = os.path.join(MODEL_DIR, "isolation_forest.joblib")
    joblib.dump(iso_model, save_path)
    print(f"[OK] Isolation Forest saved to {save_path}")
    return iso_model

def train_predictive_maintenance_model():
    """
    Train Random Forest Classifier for Equipment Failure Risk & Status.
    Classes: 0: NORMAL, 1: WARNING, 2: CRITICAL
    Features: [temp, vibration, power_kw, operating_hours, temp_trend]
    """
    print("[INFO] Training Predictive Maintenance Random Forest Classifier...")
    np.random.seed(42)
    n_samples = 3000
    
    # 0 = Normal
    n_norm = 2200
    t_norm = np.random.normal(68.0, 3.0, n_norm)
    v_norm = np.random.normal(1.5, 0.3, n_norm)
    p_norm = np.random.normal(55.0, 5.0, n_norm)
    h_norm = np.random.uniform(500, 4000, n_norm)
    trend_norm = np.random.normal(0.0, 0.2, n_norm)
    y_norm = np.zeros(n_norm, dtype=int)
    
    # 1 = Warning
    n_warn = 550
    t_warn = np.random.normal(78.0, 3.0, n_warn)
    v_warn = np.random.normal(2.6, 0.4, n_warn)
    p_warn = np.random.normal(75.0, 6.0, n_warn)
    h_warn = np.random.uniform(3500, 6500, n_warn)
    trend_warn = np.random.uniform(0.5, 1.5, n_warn)
    y_warn = np.ones(n_warn, dtype=int)
    
    # 2 = Critical Failure Risk
    n_crit = 250
    t_crit = np.random.normal(90.0, 5.0, n_crit)
    v_crit = np.random.normal(4.5, 1.0, n_crit)
    p_crit = np.random.normal(95.0, 10.0, n_crit)
    h_crit = np.random.uniform(6000, 10000, n_crit)
    trend_crit = np.random.uniform(1.5, 3.5, n_crit)
    y_crit = np.full(n_crit, 2, dtype=int)
    
    X = np.vstack([
        np.column_stack([t_norm, v_norm, p_norm, h_norm, trend_norm]),
        np.column_stack([t_warn, v_warn, p_warn, h_warn, trend_warn]),
        np.column_stack([t_crit, v_crit, p_crit, h_crit, trend_crit])
    ])
    y = np.concatenate([y_norm, y_warn, y_crit])
    
    # Shuffle
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]
    
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        random_state=42
    )
    rf_model.fit(X_train, y_train)
    
    preds = rf_model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    f1 = f1_score(y_test, preds, average="weighted")
    print(f"[METRICS] Performance: Accuracy = {acc:.4f}, F1-Score = {f1:.4f}")
    
    save_path = os.path.join(MODEL_DIR, "predictive_maintenance_rf.joblib")
    joblib.dump(rf_model, save_path)
    print(f"[OK] Random Forest model saved to {save_path}")
    return rf_model

if __name__ == "__main__":
    train_isolation_forest()
    train_predictive_maintenance_model()
