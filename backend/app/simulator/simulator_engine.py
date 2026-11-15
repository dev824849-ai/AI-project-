import asyncio
import random
from datetime import datetime, timedelta
from typing import Dict, Any
from app.database.db import SessionLocal
from app.models.station import Station, StationStatus
from app.models.sensor import Sensor, SensorReading
from app.models.equipment import Equipment, EquipmentStatus, FailureRisk
from app.models.inventory import InventoryItem
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.incident import Incident, IncidentSeverity, IncidentStatus
from app.models.ai_prediction import AIPrediction
from app.ml.anomaly_detection import detect_sensor_anomaly
from app.ml.predictive_maintenance import predict_equipment_failure_risk
from app.websocket.connection_manager import ws_manager
from app.simulator.scenarios import scenario_state, DemoScenario

class TelemetrySimulatorEngine:
    def __init__(self):
        self.is_running = False
        self._task = None
        
    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._simulation_loop())
            print("[SIMULATOR] Telemetry Engine initialized.")

    def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            print("[SIMULATOR] Telemetry Engine halted.")

    async def _simulation_loop(self):
        while self.is_running:
            try:
                await self._generate_and_stream_telemetry()
            except Exception as e:
                print(f"[SIMULATOR ERROR] {e}")
            await asyncio.sleep(3.0)

    async def _generate_and_stream_telemetry(self):
        db = SessionLocal()
        try:
            stations = db.query(Station).all()
            if not stations:
                return

            telemetry_payload = {
                "timestamp": datetime.utcnow().isoformat(),
                "scenario": scenario_state.current_scenario.value,
                "is_simulated": True,
                "stations": []
            }

            for station in stations:
                # Calculate simulated values based on current scenario
                is_bharati = (station.id == "bharati")
                step = scenario_state.scenario_step
                
                # Temperature & Wind
                temp_noise = random.uniform(-0.4, 0.4)
                wind_noise = random.uniform(-1.5, 1.5)
                
                if is_bharati and scenario_state.current_scenario == DemoScenario.SCENARIO_3_EXTREME_WEATHER:
                    curr_temp = -38.5 + temp_noise
                    curr_wind = max(55.0, scenario_state.wind_speed_override + wind_noise * 3)
                    station.weather_condition = "Severe Katabatic Blizzard (Force 11)"
                    station.visibility_km = max(0.2, 0.8 + random.uniform(-0.3, 0.3))
                else:
                    curr_temp = round(-22.0 + temp_noise if is_bharati else -26.5 + temp_noise, 1)
                    curr_wind = round(max(5.0, 18.0 + wind_noise), 1)
                    station.weather_condition = "Polar Clear / Low Drift"
                    station.visibility_km = 18.0
                    
                station.current_temp_c = curr_temp
                station.wind_speed_knots = curr_wind
                station.last_contact = datetime.utcnow()

                # Equipment & Power
                eq_gen = db.query(Equipment).filter(
                    Equipment.station_id == station.id,
                    Equipment.type == "Generator"
                ).first()

                gen_temp = 70.0 + random.uniform(-1.0, 1.0)
                gen_vib = 1.6 + random.uniform(-0.1, 0.1)
                power_load = 65.0 + random.uniform(-2.0, 2.0)
                
                # Scenario 2 Demo Flow Progression for Bharati
                if is_bharati and scenario_state.current_scenario == DemoScenario.SCENARIO_2_GENERATOR_RISK:
                    scenario_state.scenario_step += 1
                    # Ramp temp: 70 -> 75 -> 81 -> 89 -> 92
                    if step == 0:
                        gen_temp = 70.5
                    elif step == 1:
                        gen_temp = 75.2
                    elif step == 2:
                        gen_temp = 81.4
                    elif step >= 3:
                        gen_temp = min(92.0, 89.0 + (step - 3) * 0.8)
                    gen_vib = min(5.2, 2.2 + step * 0.7)
                    power_load = min(110.0, 78.0 + step * 5.0)

                if eq_gen:
                    eq_gen.temperature_c = round(gen_temp, 1)
                    eq_gen.vibration_mms = round(gen_vib, 2)
                    eq_gen.power_consumption_kw = round(power_load, 1)
                    eq_gen.operating_hours += 0.005 # Incremental hours
                    
                    # Run ML Predictive Maintenance
                    pred_res = predict_equipment_failure_risk(
                        temperature=gen_temp,
                        vibration=gen_vib,
                        power_kw=power_load,
                        operating_hours=eq_gen.operating_hours,
                        temp_trend=1.8 if (is_bharati and scenario_state.current_scenario == DemoScenario.SCENARIO_2_GENERATOR_RISK) else 0.0
                    )
                    eq_gen.health_score = pred_res["health_score"]
                    eq_gen.failure_risk = FailureRisk(pred_res["risk_level"])
                    eq_gen.predicted_rul_hours = pred_res["predicted_rul_hours"]
                    eq_gen.anomaly_reason = pred_res["reason"]
                    eq_gen.recommended_action = pred_res["recommended_action"]
                    
                    if pred_res["risk_level"] in ["HIGH", "CRITICAL"]:
                        eq_gen.status = EquipmentStatus.CRITICAL if pred_res["risk_level"] == "CRITICAL" else EquipmentStatus.WARNING
                        station.status = StationStatus.WARNING if station.status != StationStatus.CRITICAL else station.status
                        
                        # Check if alert already exists, or trigger alert & incident
                        existing_alert = db.query(Alert).filter(
                            Alert.station_id == station.id,
                            Alert.subsystem == "POWER",
                            Alert.status == AlertStatus.ACTIVE
                        ).first()
                        
                        if not existing_alert:
                            new_alert = Alert(
                                station_id=station.id,
                                source="AI_ANOMALY",
                                subsystem="POWER",
                                title=f"AI Alert: {eq_gen.name} Critical Thermal Runaway",
                                description=f"Predictive ML model detected abnormal thermal spike ({gen_temp:.1f}°C) and vibration ({gen_vib:.2f} mm/s).",
                                severity=AlertSeverity.HIGH if pred_res["risk_level"] == "HIGH" else AlertSeverity.CRITICAL,
                                status=AlertStatus.ACTIVE,
                                parameter=f"{eq_gen.name} Temperature",
                                current_value=round(gen_temp, 1),
                                expected_range="60 - 75 °C",
                                anomaly_score=0.88,
                                recommended_action=pred_res["recommended_action"],
                                is_simulated=True
                            )
                            db.add(new_alert)
                            
                            # Create Incident for SIH Presentation Workflow
                            inc_id = f"INC-2026-{station.id.upper()[:2]}-{random.randint(100, 999)}"
                            new_inc = Incident(
                                id=inc_id,
                                station_id=station.id,
                                title=f"Generator Failure Risk Incident – {eq_gen.name}",
                                incident_type="GENERATOR_FAILURE",
                                severity=IncidentSeverity.HIGH,
                                status=IncidentStatus.REPORTED,
                                description=f"Automated Anomaly detection flagged critical thermal degradation on {eq_gen.name}. Power backup required.",
                                affected_subsystem="POWER",
                                backup_systems_status="Secondary Diesel Generator-02 on hot standby; Battery bank at 92%",
                                recommended_protocols="1. Inspect Generator cooling loop.\n2. Initiate safe remote load transfer to Backup Generator.\n3. Throttle non-critical science loads.",
                                reported_by="POLARIS Isolation Forest & RF Diagnostics",
                                is_simulated=True
                            )
                            db.add(new_inc)
                            
                            # Create AI Insight record
                            ai_ins = AIPrediction(
                                station_id=station.id,
                                equipment_id=eq_gen.id,
                                model_type="RANDOM_FOREST_FAILURE",
                                title=f"Impending Bearing Breakdown on {eq_gen.name}",
                                what_happened=f"Temperature escalated to {gen_temp:.1f}°C with +2.8 mm/s vibration surge.",
                                why_it_matters="Failure could cause uncommanded black start failure across the main station habitat during -25°C Antarctic winter.",
                                confidence_pct=96.4,
                                risk_level=pred_res["risk_level"],
                                recommended_action=pred_res["recommended_action"],
                                anomaly_score=0.91,
                                is_active=True,
                                is_simulated=True
                            )
                            db.add(ai_ins)
                            
                    else:
                        eq_gen.status = EquipmentStatus.NORMAL
                        
                # Inventory & Fuel
                fuel_item = db.query(InventoryItem).filter(
                    InventoryItem.station_id == station.id,
                    InventoryItem.category == "FUEL"
                ).first()
                if fuel_item:
                    # Slow consumption: 0.002% per tick
                    if scenario_state.current_scenario == DemoScenario.SCENARIO_4_FUEL_SHORTAGE and is_bharati:
                        station.fuel_level_pct = round(scenario_state.fuel_pct_override, 1)
                        fuel_item.current_quantity = round(fuel_item.capacity * (scenario_state.fuel_pct_override / 100.0), 1)
                        fuel_item.days_remaining = 14.0 # Resupply needed
                        fuel_item.status = "CRITICAL"
                    else:
                        fuel_item.current_quantity = max(100.0, fuel_item.current_quantity - 0.5)
                        fuel_pct = (fuel_item.current_quantity / fuel_item.capacity) * 100.0
                        station.fuel_level_pct = round(fuel_pct, 1)
                        fuel_item.days_remaining = round(fuel_item.current_quantity / fuel_item.daily_consumption_rate, 1)

                # Comms status
                if scenario_state.current_scenario == DemoScenario.SCENARIO_5_COMMS_FAILURE and is_bharati:
                    station.comm_status = "OFFLINE"
                    station.comm_latency_ms = 9999.0
                elif scenario_state.current_scenario == DemoScenario.SCENARIO_3_EXTREME_WEATHER and is_bharati:
                    station.comm_status = "DEGRADED"
                    station.comm_latency_ms = scenario_state.comm_latency_override + random.uniform(-100, 200)
                else:
                    station.comm_status = "ONLINE"
                    station.comm_latency_ms = round(540.0 + random.uniform(-30, 60), 1)

                # Station overall health
                if eq_gen and eq_gen.health_score < 70.0:
                    station.health_score = round(min(80.0, eq_gen.health_score + 10.0), 1)
                else:
                    station.health_score = 96.0

                db.commit()

                telemetry_payload["stations"].append({
                    "id": station.id,
                    "name": station.name,
                    "status": station.status.value,
                    "health_score": station.health_score,
                    "current_temp_c": station.current_temp_c,
                    "wind_speed_knots": station.wind_speed_knots,
                    "power_status_pct": station.power_status_pct,
                    "fuel_level_pct": station.fuel_level_pct,
                    "battery_level_pct": station.battery_level_pct,
                    "comm_status": station.comm_status,
                    "comm_latency_ms": station.comm_latency_ms,
                    "generator_temp_c": round(gen_temp, 1),
                    "generator_vibration_mms": round(gen_vib, 2),
                    "generator_power_kw": round(power_load, 1),
                    "weather_condition": station.weather_condition,
                    "last_contact": station.last_contact.isoformat()
                })

            # Broadcast over WebSocket
            await ws_manager.broadcast({
                "type": "TELEMETRY_UPDATE",
                "data": telemetry_payload
            })

        finally:
            db.close()

telemetry_engine = TelemetrySimulatorEngine()
