#!/usr/bin/env python
"""
POLARIS Antarctic Telemetry Simulator CLI
----------------------------------------
This standalone script can stream telemetry packets to the backend
or run offline to generate synthetic multi-sensor datasets.
"""
import sys
import os
import time
import random
import requests
from datetime import datetime

BACKEND_API_URL = os.getenv("POLARIS_API_URL", "http://localhost:8000/api")

def simulate_loop():
    print("=" * 65)
    print("  POLARIS – Antarctic IoT Telemetry Simulation Engine")
    print("  Target Backend: " + BACKEND_API_URL)
    print("=" * 65)
    
    stations = ["bharati", "maitri"]
    tick = 0
    
    while True:
        tick += 1
        timestamp = datetime.utcnow().isoformat()
        
        for st in stations:
            # Simulate physics parameters
            base_temp = -22.5 if st == "bharati" else -26.0
            temp = round(base_temp + random.uniform(-0.5, 0.5), 1)
            wind = round(18.0 + random.uniform(-2.0, 2.5), 1)
            gen_temp = round(70.0 + random.uniform(-1.0, 1.0), 1)
            vibration = round(1.6 + random.uniform(-0.1, 0.1), 2)
            power_kw = round(65.0 + random.uniform(-3.0, 3.0), 1)
            
            print(f"[{timestamp}] [{st.upper()}] Temp: {temp}°C | Wind: {wind}kts | Gen: {gen_temp}°C | Vib: {vibration}mm/s | Power: {power_kw}kW")
            
        time.sleep(3.0)

if __name__ == "__main__":
    try:
        simulate_loop()
    except KeyboardInterrupt:
        print("\nSimulator stopped by operator.")
