import React, { createContext, useContext, useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { telemetryService, stationService } from '../services/api';

const TelemetryContext = createContext(null);

export const TelemetryProvider = ({ children }) => {
  const [stations, setStations] = useState([
    {
      id: 'bharati',
      name: 'Bharati Station',
      status: 'HEALTHY',
      health_score: 96.5,
      power_status_pct: 88.0,
      fuel_level_pct: 76.5,
      battery_level_pct: 94.0,
      current_temp_c: -22.4,
      wind_speed_knots: 16.8,
      comm_status: 'ONLINE',
      comm_latency_ms: 540.0,
      weather_condition: 'Polar Clear / Low Drift',
      generator_temp_c: 70.5,
      generator_vibration_mms: 1.65,
      generator_power_kw: 68.5,
      current_personnel: 22,
      latitude: -69.4069,
      longitude: 76.1958,
      last_contact: new Date().toISOString()
    },
    {
      id: 'maitri',
      name: 'Maitri Station',
      status: 'HEALTHY',
      health_score: 92.0,
      power_status_pct: 82.0,
      fuel_level_pct: 68.0,
      battery_level_pct: 88.5,
      current_temp_c: -26.8,
      wind_speed_knots: 21.4,
      comm_status: 'ONLINE',
      comm_latency_ms: 620.0,
      weather_condition: 'Breezy / High Ice Haze',
      generator_temp_c: 72.0,
      generator_vibration_mms: 1.9,
      generator_power_kw: 64.0,
      current_personnel: 24,
      latitude: -70.7667,
      longitude: 11.7333,
      last_contact: new Date().toISOString()
    }
  ]);

  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Initial fetch from REST API
    const fetchInitial = async () => {
      try {
        const snap = await telemetryService.getSnapshot();
        if (snap?.stations?.length) {
          setStations(snap.stations);
        }
      } catch (err) {
        console.log('Using initial telemetry defaults...');
      }
    };
    fetchInitial();

    // Connect WebSocket
    wsService.connect();
    const unsubscribe = wsService.subscribe((msg) => {
      if (msg.type === 'STATUS') {
        setWsConnected(msg.data.connected);
      } else if (msg.type === 'TELEMETRY_UPDATE') {
        if (msg.data?.stations) {
          setStations(msg.data.stations);
          setLastUpdate(new Date());
        }
      }
    });

    // Polling fallback every 4s if WS disconnects
    const pollInterval = setInterval(async () => {
      if (!wsConnected) {
        try {
          const snap = await telemetryService.getSnapshot();
          if (snap?.stations?.length) {
            setStations(snap.stations);
            setLastUpdate(new Date());
          }
        } catch (e) {
          // ignore
        }
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [wsConnected]);

  const getStationById = (id) => stations.find((s) => s.id === id) || stations[0];

  return (
    <TelemetryContext.Provider value={{ stations, wsConnected, lastUpdate, getStationById }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
