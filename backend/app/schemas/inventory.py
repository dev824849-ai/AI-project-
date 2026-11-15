from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    station_id: str
    name: str
    category: str
    current_quantity: float
    capacity: float
    unit: str
    min_threshold: float
    daily_consumption_rate: float
    days_remaining: float
    depletion_date_predicted: Optional[datetime] = None
    resupply_needed_quantity: Optional[float] = 0.0
    storage_location: Optional[str] = "Main Tank Depot"
    status: Optional[str] = "NORMAL"
    alert_message: Optional[str] = None
    is_simulated: Optional[bool] = True

class InventoryItemCreate(InventoryItemBase):
    id: str

class InventoryItemUpdate(BaseModel):
    current_quantity: Optional[float] = None
    min_threshold: Optional[float] = None
    daily_consumption_rate: Optional[float] = None
    status: Optional[str] = None
    storage_location: Optional[str] = None

class InventoryItemOut(InventoryItemBase):
    id: str
    last_updated: datetime

    class Config:
        from_attributes = True

class InventoryTransactionBase(BaseModel):
    inventory_id: str
    station_id: str
    transaction_type: str
    quantity_change: float
    reason: Optional[str] = None
    recorded_by: Optional[str] = "System Auto-Telemetry"

class InventoryTransactionCreate(InventoryTransactionBase):
    pass

class InventoryTransactionOut(InventoryTransactionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
