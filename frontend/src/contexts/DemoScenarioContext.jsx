import React, { createContext, useContext, useState, useEffect } from 'react';
import { simulatorService } from '../services/api';

const DemoScenarioContext = createContext(null);

export const DemoScenarioProvider = ({ children }) => {
  const [currentScenario, setCurrentScenario] = useState('NORMAL');
  const [scenarioStep, setScenarioStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  const activateScenario = async (scenarioKey, stationId = 'bharati') => {
    setLoading(true);
    try {
      await simulatorService.setScenario(scenarioKey, stationId);
      setCurrentScenario(scenarioKey);
      setScenarioStep(0);
      
      const scenarioDescriptions = {
        NORMAL: 'Baseline Normal Operations: All subsystems functioning within standard Antarctic tolerances.',
        GENERATOR_FAILURE_RISK: 'DEMO SCENARIO ACTIVE: Bharati Generator-01 Thermal Runaway initiated (70°C -> 89°C). Isolation Forest ML Anomaly Engine triggered.',
        EXTREME_WEATHER: 'DEMO SCENARIO ACTIVE: Severe Force 11 Katabatic Blizzard triggered over Princess Elizabeth Land. Comms degraded.',
        FUEL_SHORTAGE: 'DEMO SCENARIO ACTIVE: Critical Fuel Depletion Warning. Reserve margin fell to 14.5% before polar resupply window.',
        COMMS_FAILURE: 'DEMO SCENARIO ACTIVE: Complete Satellite Blackout simulated. Offline fail-safe protocols activated.',
        INVENTORY_DEPLETION: 'DEMO SCENARIO ACTIVE: Medical and Spare Parts inventory forecast flagged shortage within 12 days.'
      };
      
      setActiveMessage(scenarioDescriptions[scenarioKey] || `Scenario ${scenarioKey} active`);
      setTimeout(() => setActiveMessage(null), 8000);
    } catch (err) {
      console.warn('Backend scenario trigger failed, applying local state');
      setCurrentScenario(scenarioKey);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoScenarioContext.Provider value={{ currentScenario, scenarioStep, activateScenario, loading, activeMessage }}>
      {children}
    </DemoScenarioContext.Provider>
  );
};

export const useDemoScenario = () => useContext(DemoScenarioContext);
