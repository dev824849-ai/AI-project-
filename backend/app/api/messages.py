from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.db import get_db
from app.models.message import Message
from app.schemas.message import MessageOut, MessageCreate, MessageAcknowledge
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/messages", tags=["Communication Hub"])

@router.get("", response_model=List[MessageOut])
def get_messages(
    station_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Message).order_by(Message.timestamp.desc())
    if station_id and station_id != "ALL":
        query = query.filter((Message.station_id == station_id) | (Message.station_id == "ALL") | (Message.recipient_station == station_id) | (Message.recipient_station == "ALL"))
    return query.limit(limit).all()

@router.post("", response_model=MessageOut)
def send_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = Message(
        station_id=msg_in.station_id,
        sender_id=current_user.username,
        sender_name=current_user.full_name,
        sender_role=current_user.role.value,
        recipient_station=msg_in.recipient_station,
        message_type=msg_in.message_type,
        priority=msg_in.priority,
        subject=msg_in.subject,
        body=msg_in.body,
        is_simulated=True,
        timestamp=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.post("/{message_id}/acknowledge", response_model=MessageOut)
def acknowledge_message(
    message_id: int,
    ack: MessageAcknowledge,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.is_acknowledged = True
    msg.acknowledged_by = ack.acknowledged_by or current_user.full_name
    msg.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)
    return msg
