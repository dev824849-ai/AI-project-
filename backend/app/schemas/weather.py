from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WeatherDataBase(BaseModel):
    station_id: str
    temperature_c: float
    feels_like_c: float
    wind_speed_knots: float
    wind_gust_knots: float
    wind_direction: str
    pressure_hpa: float
    humidity_pct: float
    visibility_km: float
    uv_index: Optional[float] = 0.0
    solar_irradiance_wm2: Optional[float] = 120.0
    snow_accumulation_cm: Optional[float] = 12.0
    condition: Optional[str] = "Polar Clear"
    is_blizzard_warning: Optional[bool] = False
    alert_notes: Optional[str] = None
    is_simulated: Optional[bool] = True

class WeatherDataCreate(WeatherDataBase):
    pass

class WeatherDataOut(WeatherDataBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
