from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from app.database.db import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, index=True) # e.g. "INV-BHARATI-FUEL-ATF"
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    name = Column(String, nullable=False) # e.g. "Aviation Turbine Fuel (Jet A-1 / Polar Diesel)"
    category = Column(String, nullable=False) # FUEL, FOOD, MEDICAL, SPARE_PARTS, SCIENTIFIC, WATER, BATTERIES
    current_quantity = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False)
    unit = Column(String, nullable=False) # Liters, kg, units, vials, packs
    min_threshold = Column(Float, nullable=False)
    daily_consumption_rate = Column(Float, nullable=False)
    days_remaining = Column(Float, nullable=False)
    depletion_date_predicted = Column(DateTime, nullable=True)
    resupply_needed_quantity = Column(Float, default=0.0)
    storage_location = Column(String, default="Main Tank Depot")
    status = Column(String, default="NORMAL") # NORMAL, WARNING, CRITICAL
    alert_message = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_id = Column(String, ForeignKey("inventory.id"), nullable=False, index=True)
    station_id = Column(String, nullable=False)
    transaction_type = Column(String, nullable=False) # CONSUMPTION, RESUPPLY, ADJUSTMENT, LOSS
    quantity_change = Column(Float, nullable=False) # -50.0 or +1000.0
    reason = Column(String, nullable=True)
    recorded_by = Column(String, default="System Auto-Telemetry")
    timestamp = Column(DateTime, default=datetime.utcnow)
