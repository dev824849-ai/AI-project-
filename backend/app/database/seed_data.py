from datetime import datetime, timedelta
from app.database.db import SessionLocal, Base, engine
from app.auth.jwt import get_password_hash
from app.models.user import User, UserRole
from app.models.station import Station, StationStatus
from app.models.sensor import Sensor, SensorReading
from app.models.equipment import Equipment, EquipmentStatus, FailureRisk, MaintenanceRecord
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.personnel import Personnel
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentAction
from app.models.message import Message
from app.models.weather import WeatherData
from app.models.audit import AuditLog
from app.models.ai_prediction import AIPrediction

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).first():
        print("[SEED] Database already populated with seed data.")
        db.close()
        return

    print("[SEED] Seeding POLARIS database...")
    now = datetime.utcnow()

    # 1. Users
    users = [
        User(
            email="admin@ncaor.gov.in",
            username="admin",
            full_name="Dr. Rajesh Sharma (Director NCAOR)",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.SUPER_ADMIN,
            department="HQ Operations Command"
        ),
        User(
            email="ops@ncaor.gov.in",
            username="ops_manager",
            full_name="Commander Vivek Nair",
            hashed_password=get_password_hash("ops123"),
            role=UserRole.OPERATIONS_MANAGER,
            department="Antarctic Logistics & Operations"
        ),
        User(
            email="bharati.leader@ncaor.gov.in",
            username="bharati_lead",
            full_name="Dr. Ananya Sen",
            hashed_password=get_password_hash("station123"),
            role=UserRole.STATION_ADMIN,
            station_id="bharati",
            department="Bharati Station Leadership"
        ),
        User(
            email="maitri.leader@ncaor.gov.in",
            username="maitri_lead",
            full_name="Er. Sunil Rawat",
            hashed_password=get_password_hash("station123"),
            role=UserRole.STATION_ADMIN,
            station_id="maitri",
            department="Maitri Station Leadership"
        ),
        User(
            email="science.lead@ncaor.gov.in",
            username="scientist_lead",
            full_name="Dr. Priya Deshmukh",
            hashed_password=get_password_hash("science123"),
            role=UserRole.SCIENTIFIC_USER,
            department="Polar Cryosphere Science"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Stations
    stations = [
        Station(
            id="bharati",
            name="Bharati Station",
            location_name="Larsemann Hills, Princess Elizabeth Land",
            region="East Antarctica",
            latitude=-69.4069,
            longitude=76.1958,
            elevation_m=35.0,
            established_year=2012,
            capacity_summer=72,
            capacity_winter=24,
            current_personnel=22,
            status=StationStatus.HEALTHY,
            health_score=96.5,
            power_status_pct=88.0,
            fuel_level_pct=76.5,
            battery_level_pct=94.0,
            solar_output_kw=18.5,
            generator_output_kw=72.0,
            comm_status="ONLINE",
            comm_latency_ms=540.0,
            current_temp_c=-22.4,
            wind_speed_knots=16.8,
            wind_direction="ESE",
            atmospheric_pressure_hpa=986.5,
            visibility_km=20.0,
            weather_condition="Polar Clear / Low Drift",
            description="India's state-of-the-art third Antarctic research facility, built on 134 shipping containers on stilts overlooking the ocean in Larsemann Hills.",
            last_contact=now
        ),
        Station(
            id="maitri",
            name="Maitri Station",
            location_name="Schirmacher Oasis, Queen Maud Land",
            region="East Antarctica",
            latitude=-70.7667,
            longitude=11.7333,
            elevation_m=117.0,
            established_year=1989,
            capacity_summer=65,
            capacity_winter=25,
            current_personnel=24,
            status=StationStatus.HEALTHY,
            health_score=92.0,
            power_status_pct=82.0,
            fuel_level_pct=68.0,
            battery_level_pct=88.5,
            solar_output_kw=8.2,
            generator_output_kw=64.0,
            comm_status="ONLINE",
            comm_latency_ms=620.0,
            current_temp_c=-26.8,
            wind_speed_knots=21.4,
            wind_direction="SE",
            atmospheric_pressure_hpa=978.0,
            visibility_km=15.0,
            weather_condition="Breezy / High Ice Haze",
            description="India's second permanent Antarctic research station, situated in the ice-free rocky plateau of Schirmacher Oasis with Priyadarshini freshwater lake.",
            last_contact=now
        ),
        Station(
            id="dakshin_gangotri",
            name="Dakshin Gangotri (Heritage / Unmanned)",
            location_name="Princess Astrid Coast, Queen Maud Land",
            region="East Antarctica",
            latitude=-70.0833,
            longitude=12.0000,
            elevation_m=20.0,
            established_year=1983,
            capacity_summer=0,
            capacity_winter=0,
            current_personnel=0,
            status=StationStatus.OFFLINE,
            health_score=100.0,
            power_status_pct=0.0,
            fuel_level_pct=0.0,
            battery_level_pct=0.0,
            comm_status="OFFLINE",
            current_temp_c=-31.0,
            wind_speed_knots=28.0,
            weather_condition="Submerged in Glacier Ice Sheet",
            description="India's historic first Antarctic base (1983-1990), now preserved as a designated Historic Site and Monument under the Antarctic Treaty System.",
            last_contact=now - timedelta(days=365)
        )
    ]
    db.add_all(stations)
    db.commit()

    # 3. Equipment
    equipment_list = [
        # Bharati Equipment
        Equipment(
            id="EQ-BH-GEN-01",
            station_id="bharati",
            name="Primary Diesel Generator (Kirloskar 125kVA)",
            type="Generator",
            subsystem="POWER",
            location_room="Power Module Alpha (Lower Deck)",
            status=EquipmentStatus.NORMAL,
            health_score=94.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=70.5,
            vibration_mms=1.65,
            power_consumption_kw=68.5,
            operating_hours=4120.0,
            efficiency_pct=93.8,
            predicted_rul_hours=1450.0,
            anomaly_reason="Nominal operation",
            recommended_action="Routine oil analysis at 4500 operating hours."
        ),
        Equipment(
            id="EQ-BH-GEN-02",
            station_id="bharati",
            name="Backup Diesel Generator (Volvo Penta 100kVA)",
            type="Generator",
            subsystem="POWER",
            location_room="Power Module Beta (Standby Deck)",
            status=EquipmentStatus.NORMAL,
            health_score=98.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=32.0,
            vibration_mms=0.2,
            power_consumption_kw=0.0,
            operating_hours=1240.0,
            efficiency_pct=95.0,
            predicted_rul_hours=3200.0,
            anomaly_reason="Standby ready",
            recommended_action="Weekly 15-minute test firing scheduled."
        ),
        Equipment(
            id="EQ-BH-HVAC-01",
            station_id="bharati",
            name="Central Hydronic Heat Recovery Loop",
            type="Heating",
            subsystem="HVAC",
            location_room="Thermal Management Bay",
            status=EquipmentStatus.NORMAL,
            health_score=96.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=62.0,
            vibration_mms=0.8,
            power_consumption_kw=14.0,
            operating_hours=8900.0,
            efficiency_pct=91.0,
            predicted_rul_hours=2100.0,
            recommended_action="Check glycol antifreeze concentration before polar night."
        ),
        Equipment(
            id="EQ-BH-WATER-01",
            station_id="bharati",
            name="Desalination & Snow-Melt RO Plant",
            type="Water",
            subsystem="WATER",
            location_room="Water Treatment Bay",
            status=EquipmentStatus.NORMAL,
            health_score=91.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=18.0,
            vibration_mms=1.1,
            power_consumption_kw=8.5,
            operating_hours=3800.0,
            efficiency_pct=89.0,
            predicted_rul_hours=950.0,
            recommended_action="Replace pre-filtration membrane cartridges next month."
        ),
        Equipment(
            id="EQ-BH-COMMS-01",
            station_id="bharati",
            name="Inmarsat & GSAT Polar Earth Station",
            type="Communications",
            subsystem="COMMS",
            location_room="Radome Tower Deck",
            status=EquipmentStatus.NORMAL,
            health_score=97.5,
            failure_risk=FailureRisk.LOW,
            temperature_c=24.0,
            vibration_mms=0.1,
            power_consumption_kw=3.2,
            operating_hours=14500.0,
            efficiency_pct=98.0,
            predicted_rul_hours=4000.0,
            recommended_action="Inspect radome de-icing heating elements."
        ),
        Equipment(
            id="EQ-BH-SCI-01",
            station_id="bharati",
            name="Atmospheric Aerosol LIDAR System",
            type="Scientific",
            subsystem="RESEARCH",
            location_room="Atmospheric Physics Laboratory",
            status=EquipmentStatus.NORMAL,
            health_score=95.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=21.0,
            vibration_mms=0.05,
            power_consumption_kw=2.8,
            operating_hours=2800.0,
            efficiency_pct=96.0,
            predicted_rul_hours=1800.0,
            recommended_action="Calibrate optical photon detectors."
        ),

        # Maitri Equipment
        Equipment(
            id="EQ-MT-GEN-01",
            station_id="maitri",
            name="Primary Diesel Generator (Cummins 100kVA)",
            type="Generator",
            subsystem="POWER",
            location_room="Main Generator House A",
            status=EquipmentStatus.NORMAL,
            health_score=89.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=72.0,
            vibration_mms=1.9,
            power_consumption_kw=62.0,
            operating_hours=6700.0,
            efficiency_pct=88.5,
            predicted_rul_hours=820.0,
            recommended_action="Inspect turbocharger seals at 7000 operating hours."
        ),
        Equipment(
            id="EQ-MT-HVAC-01",
            station_id="maitri",
            name="Maitri Main Block Heating Boiler",
            type="Heating",
            subsystem="HVAC",
            location_room="Boiler Annex",
            status=EquipmentStatus.NORMAL,
            health_score=90.0,
            failure_risk=FailureRisk.LOW,
            temperature_c=68.0,
            vibration_mms=0.9,
            power_consumption_kw=12.0,
            operating_hours=9200.0,
            efficiency_pct=87.0,
            predicted_rul_hours=1100.0,
            recommended_action="Clean burner nozzles."
        )
    ]
    db.add_all(equipment_list)
    db.commit()

    # 4. Inventory Items
    inventory_items = [
        # Bharati Inventory
        InventoryItem(
            id="INV-BH-FUEL-01",
            station_id="bharati",
            name="Polar Diesel (Jet A-1 Anti-Freeze Fuel)",
            category="FUEL",
            current_quantity=145000.0,
            capacity=190000.0,
            unit="Liters",
            min_threshold=35000.0,
            daily_consumption_rate=580.0,
            days_remaining=250.0,
            storage_location="Double-Walled Polar Fuel Farm Alpha",
            status="NORMAL"
        ),
        InventoryItem(
            id="INV-BH-FOOD-01",
            station_id="bharati",
            name="Non-Perishable Winter Provisions",
            category="FOOD",
            current_quantity=18500.0,
            capacity=22000.0,
            unit="kg",
            min_threshold=4000.0,
            daily_consumption_rate=52.0,
            days_remaining=355.0,
            storage_location="Deep Freeze Storage Module B",
            status="NORMAL"
        ),
        InventoryItem(
            id="INV-BH-MED-01",
            station_id="bharati",
            name="Emergency Medical & Trauma Resuscitation Kits",
            category="MEDICAL",
            current_quantity=450.0,
            capacity=500.0,
            unit="kits",
            min_threshold=80.0,
            daily_consumption_rate=0.8,
            days_remaining=562.0,
            storage_location="Station Medical Facility Bay 1",
            status="NORMAL"
        ),
        InventoryItem(
            id="INV-BH-PARTS-01",
            station_id="bharati",
            name="Generator Spare Injectors, Filters & Gaskets",
            category="SPARE_PARTS",
            current_quantity=64.0,
            capacity=80.0,
            unit="sets",
            min_threshold=15.0,
            daily_consumption_rate=0.08,
            days_remaining=800.0,
            storage_location="Mechanical Workshop Module C",
            status="NORMAL"
        ),

        # Maitri Inventory
        InventoryItem(
            id="INV-MT-FUEL-01",
            station_id="maitri",
            name="Polar Diesel (Aviation Kerosene Blend)",
            category="FUEL",
            current_quantity=115000.0,
            capacity=170000.0,
            unit="Liters",
            min_threshold=30000.0,
            daily_consumption_rate=520.0,
            days_remaining=221.0,
            storage_location="Fuel Tank Depot Lake View",
            status="NORMAL"
        ),
        InventoryItem(
            id="INV-MT-WATER-01",
            station_id="maitri",
            name="Priyadarshini Lake Filtered Potable Water",
            category="WATER",
            current_quantity=28000.0,
            capacity=35000.0,
            unit="Liters",
            min_threshold=5000.0,
            daily_consumption_rate=380.0,
            days_remaining=73.0,
            storage_location="Insulated Water Tanks Block D",
            status="NORMAL"
        )
    ]
    db.add_all(inventory_items)
    db.commit()

    # 5. Personnel
    crew = [
        # Bharati Station Crew
        Personnel(
            id="PER-BH-01",
            station_id="bharati",
            full_name="Dr. Ananya Sen",
            role="Station Leader & Planetary Scientist",
            department="Science",
            organization="NCAOR",
            shift_status="ON_DUTY",
            emergency_role="Incident Commander",
            blood_group="B+"
        ),
        Personnel(
            id="PER-BH-02",
            station_id="bharati",
            full_name="Maj. Amitav Rathore",
            role="Chief Power & Mechanical Engineer",
            department="Engineering",
            organization="Corps of Engineers (Indian Army)",
            shift_status="ON_DUTY",
            emergency_role="Fire Squad Leader",
            blood_group="O+"
        ),
        Personnel(
            id="PER-BH-03",
            station_id="bharati",
            full_name="Dr. Karthik Sundaram",
            role="Expedition Medical Officer & Surgeon",
            department="Medical",
            organization="Armed Forces Medical Services",
            shift_status="ON_DUTY",
            emergency_role="Medical Evacuation Lead",
            blood_group="A+"
        ),
        Personnel(
            id="PER-BH-04",
            station_id="bharati",
            full_name="Er. Sneha Mukherjee",
            role="Satellite Communications & Network Specialist",
            department="Operations",
            organization="DRDO / NCAOR",
            shift_status="ON_DUTY",
            emergency_role="Communications Coordinator",
            blood_group="AB+"
        ),
        Personnel(
            id="PER-BH-05",
            station_id="bharati",
            full_name="Dr. Tenzing Norbu",
            role="Senior Glaciologist & Climate Researcher",
            department="Science",
            organization="Geological Survey of India",
            shift_status="FIELD_MISSION",
            emergency_role="Search & Rescue Scout",
            blood_group="O-"
        ),
        # Maitri Crew
        Personnel(
            id="PER-MT-01",
            station_id="maitri",
            full_name="Er. Sunil Rawat",
            role="Station Leader & Power Engineer",
            department="Engineering",
            organization="NCAOR",
            shift_status="ON_DUTY",
            emergency_role="Incident Commander",
            blood_group="O+"
        ),
        Personnel(
            id="PER-MT-02",
            station_id="maitri",
            full_name="Dr. Kavita Verma",
            role="Senior Meteorologist",
            department="Science",
            organization="India Meteorological Department (IMD)",
            shift_status="ON_DUTY",
            emergency_role="Weather Warning Dispatcher",
            blood_group="B+"
        )
    ]
    db.add_all(crew)
    db.commit()

    # 6. Initial Alerts
    alerts = [
        Alert(
            station_id="maitri",
            source="SENSOR_THRESHOLD",
            subsystem="WEATHER",
            title="Katabatic Wind Warning Issued",
            description="Wind gusts reached 38 knots over Schirmacher Oasis. Station exterior movement restricted.",
            severity=AlertSeverity.MEDIUM,
            status=AlertStatus.ACKNOWLEDGED,
            acknowledged_by="Er. Sunil Rawat",
            acknowledged_at=now - timedelta(hours=2),
            parameter="Wind Gusts",
            current_value=38.4,
            expected_range="< 25 knots",
            recommended_action="Lash down outdoor radar antennas and activate heated guide-wires."
        ),
        Alert(
            station_id="bharati",
            source="AI_ANOMALY",
            subsystem="COMMS",
            title="Satellite Latency Jitter Detected",
            description="GSAT-14 downlink latency spiked to 720ms during solar flare transit.",
            severity=AlertSeverity.LOW,
            status=AlertStatus.ACTIVE,
            parameter="Comm Latency",
            current_value=720.0,
            expected_range="< 600 ms",
            recommended_action="Switch backup telemetry stream to Iridium Burst protocol if latency exceeds 1200ms."
        )
    ]
    db.add_all(alerts)
    db.commit()

    # 7. Messages
    messages = [
        Message(
            station_id="bharati",
            sender_id="NCAOR_INDIA_CONTROL",
            sender_name="Directorate of Polar Operations, Goa",
            sender_role="SUPER_ADMIN",
            recipient_station="bharati",
            message_type="STANDARD",
            priority="NORMAL",
            subject="45th IAE Resupply Vessel Voyage Schedule",
            body="Vessel M.V. Vasiliy Golovnin scheduled to depart Cape Town on Nov 28. Confirm final spare parts and fuel requirement manifest.",
            is_acknowledged=True,
            acknowledged_by="Dr. Ananya Sen",
            acknowledged_at=now - timedelta(hours=5),
            timestamp=now - timedelta(hours=6)
        ),
        Message(
            station_id="ALL",
            sender_id="NCAOR_INDIA_CONTROL",
            sender_name="Directorate of Polar Operations, Goa",
            sender_role="SUPER_ADMIN",
            recipient_station="ALL",
            message_type="WEATHER_BULLETIN",
            priority="URGENT",
            subject="Polar Vortex Depression Forecast over Queen Maud Land",
            body="Deep barometric low moving eastward across Princess Elizabeth Land. Secure all outer laboratory hatches.",
            is_acknowledged=False,
            timestamp=now - timedelta(minutes=45)
        )
    ]
    db.add_all(messages)
    db.commit()

    # 8. Audit Log
    audits = [
        AuditLog(
            user_id="admin",
            user_role="SUPER_ADMIN",
            action="SYSTEM_INIT",
            entity_type="SYSTEM",
            entity_id="POLARIS-HQ",
            description="POLARIS Antarctic Control Platform initialized with Maitri and Bharati telemetry bindings.",
            result="SUCCESS"
        ),
        AuditLog(
            user_id="bharati_lead",
            user_role="STATION_ADMIN",
            action="ALERT_ACKNOWLEDGE",
            entity_type="ALERT",
            entity_id="ALT-001",
            description="Acknowledged wind threshold bulletin at Bharati Station.",
            result="SUCCESS"
        )
    ]
    db.add_all(audits)
    db.commit()

    print("[SEED] Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
