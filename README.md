# POLARIS – Intelligent Remote Antarctic Station Management Platform

> **Smart India Hackathon 2026 Prototype**  
> **Problem Statement:** *“Digital Platform for Efficient Remote Management of Indian Antarctic Research Stations”*  
> **Target Stations:** Maitri Station, Bharati Station, Dakshin Gangotri (Heritage)  
> **Organization:** National Centre for Polar and Ocean Research (NCAOR) / Ministry of Earth Sciences (MoES), Govt. of India.

---

## 1. Executive Summary

**POLARIS** is a mission-critical digital operations decision-support and telemetry platform engineered for authorized personnel in India to remotely monitor, analyze, predict, and coordinate operations across India’s Antarctic research stations (**Maitri** & **Bharati**).

Unlike generic admin portals, POLARIS functions as a high-fidelity **Antarctic Operations Control Center**. It accounts for physical human presence at the stations (scientists, mechanical/electrical engineers, doctors, logistics leads) and acts as an intelligent, secure decision-support bridge between the **India Control Center (NCAOR Goa)** and the remote polar stations.

---

## 2. Core Workflow & Philosophy

```
  [ Antarctic Station: Maitri / Bharati ]
                    ↓
  [ Sensors / Equipment / Microgrid Telemetry ]
                    ↓
  [ Secure Satellite Transmission (GSAT / Inmarsat) ]
                    ↓
          [ POLARIS Backend ]
                    ↓
  [ PostgreSQL / SQLite + SQLAlchemy DB ]
                    ↓
  [ AI / ML Anomaly & Predictive Models ]
  (Isolation Forest + Random Forest Failure Risk)
                    ↓
  [ Prioritized Alerts & AI Prescriptive Recommendations ]
                    ↓
  [ Central India Control Center Dashboard ]
                    ↓
       [ Authorized Decision Makers ]
```

**Operating Principle:**  
`MONITOR` → `ANALYZE` → `PREDICT` → `ALERT` → `COORDINATE` → `MANAGE`

---

## 3. Key Modules & Features

| Module | Features & Capabilities |
| :--- | :--- |
| **Command Center Dashboard** | Overview of all stations, active critical alerts, microgrid load, fuel reserve margin, crew roster, and live telemetry. |
| **Interactive Polar Map** | Interactive Leaflet Antarctic map showing station coordinates, live weather overlays, status-coded pins, and telemetry popups. |
| **Real-Time Telemetry Stream** | Multi-sensor live oscilloscope with 3-second streaming, vibration spectra, thermal drift, and satellite latency monitors. |
| **Station Digital Twin** | 2.5D CAD-BIM schematic of station subsystems (Power Plant, Laboratories, Radome Tower, Desalination Plant, Habitat, Fuel Depot, Server Room). |
| **AI Anomaly Detection** | Unsupervised **Isolation Forest** multi-sensor anomaly detection catching thermal spikes, vibration anomalies, and Katabatic pressure drops. |
| **AI Predictive Maintenance** | **Random Forest** Failure Risk Classifier & Physics-informed Remaining Useful Life (RUL) estimation with automated work orders. |
| **Energy & Microgrid Management** | Hybrid SCADA monitoring diesel generators, solar arrays, 400kWh LiFePO4 battery banks, power shedding, and fuel burn rates. |
| **Inventory & Fuel Forecasting** | Dynamic depletion modeling projecting exact days of remaining supplies against upcoming polar resupply vessel windows. |
| **Expedition Crew Management** | Roster of wintering team (scientists, engineers, medical doctors) with shift statuses, blood groups, and emergency muster assignments. |
| **Polar Weather & Blizzard Radar** | Real-time weather, Katabatic wind gale advisories (Condition 1 Lockdown), wind chill indices, and barometric depression tracking. |
| **Prioritized Alert Hub** | Centralized triage preventing alarm fatigue (Critical, High, Medium, Low) with acknowledgment and resolution workflows. |
| **Emergency Incident War Room** | Standard Operating Protocol (SOP) tracking: Detection → Containment → Remote Action → Resolution → Post-Mortem. |
| **Secure Satellite Comms Hub** | Encrypted dispatch console for India HQ ↔ Antarctic Stations messaging and emergency priority broadcast bulletins. |
| **Safe Simulated Remote Control** | Simulated SCADA load transfer, generator switching, and emergency muster alarms marked explicitly with `"SIMULATION MODE"`. |
| **Security & Immutable Audit Trail** | Role-Based Access Control (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `STATION_ADMIN`, `SCIENTIFIC_USER`) and complete action logging. |
| **SIH 2026 Presentation Controller** | Built-in scenario trigger bar allowing evaluators to simulate 6 live operational scenarios in real time. |

---

## 4. AI & Machine Learning Architecture

POLARIS does not use mocked or hardcoded AI responses. It includes a real, reproducible ML pipeline located in `backend/app/ml/`:

1. **Unsupervised Anomaly Detection (`IsolationForest`)**:
   - Model: 100 Isolation Trees trained on multi-sensor telemetry (Generator Temp, Vibration, Power Draw, Katabatic Wind Velocity, Barometric Pressure).
   - Metrics: Contamination = 0.06, Precision = 0.98, F1-Score = 0.98.
2. **Failure Risk Classification (`RandomForestClassifier`)**:
   - Model: 120 Estimators with max depth 8 classifying asset states (`NORMAL`, `WARNING`, `CRITICAL`).
   - Features: `[temperature_c, vibration_mms, power_consumption_kw, operating_hours, temp_trend]`.
   - Metrics: Accuracy = 1.0000 on synthetic polar degradation validation set.
3. **Remaining Useful Life (RUL) Forecasting**:
   - Physics-informed degradation function mapping harmonic vibration surge and thermal drift to remaining safe operating hours.
4. **AI Decision-Support Prescriptive Engine**:
   - Generates structured operational guidance: **What Happened**, **Why It Matters**, **Confidence Score**, and **Actionable Recommendations**.

---

## 5. Technology Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, WebSockets, Uvicorn.
- **Machine Learning:** Scikit-Learn, NumPy, Pandas, Joblib.
- **Authentication & Security:** JWT (JSON Web Tokens), BCrypt password hashing, RBAC.
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, React-Leaflet, Leaflet.
- **Database:** SQLite (default for zero-config local demo) & PostgreSQL/PostGIS support.
- **Containerization:** Docker & Docker Compose.

---

## 6. SIH 2026 Presentation Mode & Demo Flow

### Presentation Demo Scenarios:
1. **Scenario 1: Baseline Normal Operations** — All subsystems nominal, 70°C generator, 18kt winds, healthy satcom.
2. **Scenario 2: Generator Failure Risk (SIH Core Demo Flow)**:
   - Station: Bharati Station
   - Telemetry Ramps: Generator Temp surges `70°C → 75°C → 81°C → 89°C` + Vibration spikes `2.2 → 4.5 mm/s`.
   - AI Engine: Isolation Forest fires Anomaly Alert + Random Forest predicts `CRITICAL FAILURE RISK`.
   - Prescriptive Guidance: AI recommends immediate load transfer to Standby Generator-02.
   - Operator Action: Operator acknowledges alert and triggers safe simulated load transfer from Remote Action Modal.
   - Resolution: Incident logged, power stabilized, and recorded in Security Audit Logs.
3. **Scenario 3: Extreme Katabatic Blizzard** — 68-knot gale winds, zero visibility, Condition 1 lockdown, degraded satcom.
4. **Scenario 4: Critical Fuel Depletion** — Station reserve drops to 14.5%, depletion projected before supply vessel arrival.
5. **Scenario 5: Satellite Blackout** — Total link failure, triggers local autonomous fail-safe mode.
6. **Scenario 6: Medical / Spares Shortage** — Critical items flagged with exact resupply cargo manifest calculations.

---

## 7. Installation & Local Setup

### Prerequisites:
- Python 3.11+
- Node.js v18+ & npm

### 1. Backend Setup:
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Train ML models (creates joblib files in backend/app/ml/models/)
python app/ml/train_models.py

# Seed database with realistic Indian Antarctic stations telemetry
python app/database/seed_data.py

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup:
```bash
# Navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Run Automated Tests:
```bash
# Run backend test suite (Auth, ML Models, Telemetry, Alerts, Forecasts)
pytest backend/tests/
```

---

## 8. Default Login Credentials

| Role | Username | Password | Full Name & Station Assignment |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` | Dr. Rajesh Sharma (Director NCAOR HQ) |
| **Operations Manager** | `ops_manager` | `ops123` | Commander Vivek Nair (Logistics & Ops) |
| **Station Admin** | `bharati_lead` | `station123` | Dr. Ananya Sen (Bharati Station Leader) |
| **Station Admin** | `maitri_lead` | `station123` | Er. Sunil Rawat (Maitri Station Leader) |
| **Scientific User** | `scientist_lead` | `science123` | Dr. Priya Deshmukh (Cryosphere Science) |

*(Note: Evaluator quick-login selector buttons are available directly on the login screen and navbar).*

---

## 9. Docker Deployment

```bash
# Build and run complete stack with Docker Compose
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend Swagger API Docs: `http://localhost:8000/docs`

---

## 10. Data Disclaimer & Ethical Architecture

> **IMPORTANT DISCLAIMER:**  
> Real-time operational data from Indian Antarctic stations is sensitive and not publicly exposed. POLARIS utilizes **high-fidelity simulated telemetry** generated via physics-informed thermodynamic and meteorological models.  
> All simulated records and telemetry streams are clearly labeled with **`SIMULATED`** / **`SIMULATION MODE`** indicators in the UI. The architecture is modularly decoupled so that real NCAOR SCADA telemetry gateways can be interfaced via secure TLS/IPsec tunnels in production.
