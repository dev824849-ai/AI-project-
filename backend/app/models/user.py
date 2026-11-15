import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from app.database.db import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    OPERATIONS_MANAGER = "OPERATIONS_MANAGER"
    STATION_ADMIN = "STATION_ADMIN"
    SCIENTIFIC_USER = "SCIENTIFIC_USER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.SCIENTIFIC_USER, nullable=False)
    station_id = Column(String, nullable=True) # Assigned station if station admin
    department = Column(String, default="Operations")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
