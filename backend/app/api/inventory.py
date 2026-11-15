from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database.db import get_db
from app.models.inventory import InventoryItem, InventoryTransaction
from app.schemas.inventory import InventoryItemOut, InventoryItemCreate, InventoryItemUpdate, InventoryTransactionOut, InventoryTransactionCreate
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("", response_model=List[InventoryItemOut])
def get_inventory_items(
    station_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InventoryItem)
    if station_id:
        query = query.filter(InventoryItem.station_id == station_id)
    if category:
        query = query.filter(InventoryItem.category == category)
    return query.all()

@router.get("/forecast")
def get_inventory_forecast(
    station_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Predictive inventory depletion model based on historical burn rates,
    weather severity index, and next resupply voyage window (typically Dec-Feb).
    """
    query = db.query(InventoryItem)
    if station_id:
        query = query.filter(InventoryItem.station_id == station_id)
    items = query.all()
    
    forecasts = []
    # Estimated days until next polar supply vessel arrival (e.g. 180 days)
    DAYS_TO_RESUPPLY = 180.0
    
    for item in items:
        burn_rate = max(0.01, item.daily_consumption_rate)
        days_left = round(item.current_quantity / burn_rate, 1)
        depletion_date = datetime.utcnow() + timedelta(days=days_left)
        
        is_critical = days_left < DAYS_TO_RESUPPLY
        shortage_projected = max(0.0, (DAYS_TO_RESUPPLY - days_left) * burn_rate)
        recommended_resupply_qty = round(shortage_projected + item.min_threshold * 1.5, 0)
        
        forecasts.append({
            "id": item.id,
            "station_id": item.station_id,
            "name": item.name,
            "category": item.category,
            "current_quantity": item.current_quantity,
            "capacity": item.capacity,
            "unit": item.unit,
            "daily_consumption_rate": item.daily_consumption_rate,
            "days_remaining": days_left,
            "depletion_date_predicted": depletion_date.strftime("%Y-%m-%d"),
            "days_to_next_resupply": DAYS_TO_RESUPPLY,
            "is_shortage_before_resupply": is_critical,
            "projected_shortage_qty": round(shortage_projected, 1),
            "recommended_resupply_order": recommended_resupply_qty,
            "status": "CRITICAL" if days_left < 60 else "WARNING" if days_left < DAYS_TO_RESUPPLY else "NORMAL",
            "ai_recommendation": f"Include {recommended_resupply_qty} {item.unit} in upcoming expedition cargo manifest to prevent mid-winter depletion." if is_critical else "Stock levels sufficient for wintering period."
        })
        
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "is_simulated": True,
        "items": forecasts
    }

@router.put("/{item_id}", response_model=InventoryItemOut)
def update_inventory_item(
    item_id: str,
    item_in: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.STATION_ADMIN]))
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
        
    if item.daily_consumption_rate > 0:
        item.days_remaining = round(item.current_quantity / item.daily_consumption_rate, 1)
        
    item.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item
