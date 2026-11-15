from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from app.database.db import Base

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False, index=True)
    temperature_c = Column(Float, nullable=False)
    feels_like_c = Column(Float, nullable=False) # Wind chill index
    wind_speed_knots = Column(Float, nullable=False)
    wind_gust_knots = Column(Float, nullable=False)
    wind_direction = Column(String, nullable=False)
    pressure_hpa = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    visibility_km = Column(Float, nullable=False)
    uv_index = Column(Float, default=0.0)
    solar_irradiance_wm2 = Column(Float, default=120.0)
    snow_accumulation_cm = Column(Float, default=12.0)
    condition = Column(String, default="Polar Clear")
    is_blizzard_warning = Column(Boolean, default=False)
    alert_notes = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
