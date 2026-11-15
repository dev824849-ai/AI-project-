from enum import Enum
from typing import Dict, Any

class DemoScenario(str, Enum):
    SCENARIO_1_NORMAL = "NORMAL"
    SCENARIO_2_GENERATOR_RISK = "GENERATOR_FAILURE_RISK"
    SCENARIO_3_EXTREME_WEATHER = "EXTREME_WEATHER"
    SCENARIO_4_FUEL_SHORTAGE = "FUEL_SHORTAGE"
    SCENARIO_5_COMMS_FAILURE = "COMMS_FAILURE"
    SCENARIO_6_INVENTORY_DEPLETION = "INVENTORY_DEPLETION"

class ScenarioState:
    current_scenario: DemoScenario = DemoScenario.SCENARIO_1_NORMAL
    scenario_step: int = 0
    generator_temp_override: float = 70.0
    wind_speed_override: float = 18.0
    fuel_pct_override: float = 72.0
    comm_latency_override: float = 580.0
    comm_status_override: str = "ONLINE"
    power_kw_override: float = 65.0
    vibration_override: float = 1.6
    
    @classmethod
    def set_scenario(cls, scenario: DemoScenario):
        cls.current_scenario = scenario
        cls.scenario_step = 0
        
        if scenario == DemoScenario.SCENARIO_1_NORMAL:
            cls.generator_temp_override = 70.0
            cls.wind_speed_override = 18.0
            cls.fuel_pct_override = 72.0
            cls.comm_latency_override = 580.0
            cls.comm_status_override = "ONLINE"
            cls.power_kw_override = 65.0
            cls.vibration_override = 1.6
            
        elif scenario == DemoScenario.SCENARIO_2_GENERATOR_RISK:
            cls.generator_temp_override = 70.0 # Will ramp up to 75, 81, 89
            cls.vibration_override = 2.1
            cls.power_kw_override = 78.0
            
        elif scenario == DemoScenario.SCENARIO_3_EXTREME_WEATHER:
            cls.wind_speed_override = 68.0 # Blizzard gale
            cls.comm_latency_override = 1850.0
            cls.comm_status_override = "DEGRADED"
            
        elif scenario == DemoScenario.SCENARIO_4_FUEL_SHORTAGE:
            cls.fuel_pct_override = 14.5 # Below safe threshold
            
        elif scenario == DemoScenario.SCENARIO_5_COMMS_FAILURE:
            cls.comm_status_override = "OFFLINE"
            cls.comm_latency_override = 9999.0
            
        elif scenario == DemoScenario.SCENARIO_6_INVENTORY_DEPLETION:
            cls.fuel_pct_override = 18.0

scenario_state = ScenarioState()
