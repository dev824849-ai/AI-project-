import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Thermometer, Zap, Fuel, Activity, Users, Radio } from 'lucide-react';

// Create custom colored pulse icons for stations
const createPolarIcon = (status, name) => {
  const colorMap = {
    HEALTHY: '#10B981', // Emerald
    NORMAL: '#10B981',
    WARNING: '#F59E0B', // Amber
    CRITICAL: '#EF4444', // Red
    OFFLINE: '#6B7280', // Gray
  };
  const color = colorMap[status] || '#10B981';

  return L.divIcon({
    className: 'custom-polar-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 22px; 
          height: 22px; 
          border-radius: 50%; 
          background-color: ${color}; 
          box-shadow: 0 0 14px ${color}; 
          border: 3px solid #0B132B;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
        </div>
        <div style="
          position: absolute;
          top: 24px;
          background: rgba(11, 19, 43, 0.95);
          border: 1px solid ${color};
          color: #E0F2FE;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          font-family: monospace;
          letter-spacing: 0.5px;
        ">
          ${name}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export const PolarMap = ({ stations, onSelectStation, height = '450px' }) => {
  // Center of East Antarctica
  const antarcticCenter = [-70.0, 45.0];

  return (
    <div className="w-full rounded-xl overflow-hidden border border-polar-800 relative bg-polar-900 shadow-xl" style={{ height }}>
      {/* Top Map HUD overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-polar-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-polar-700 text-xs shadow-lg">
        <div className="flex items-center space-x-2 mb-1">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white font-mono">ANTARCTIC CONTINENTAL GRID</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Healthy</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Warning</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Critical</span>
          </span>
        </div>
      </div>

      <MapContainer
        center={antarcticCenter}
        zoom={3}
        minZoom={2}
        maxZoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark polar carto basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {stations?.map((station) => {
          const lat = station.latitude || -70.0;
          const lng = station.longitude || 45.0;
          const icon = createPolarIcon(station.status, station.name?.split(' ')[0] || station.id);

          return (
            <React.Fragment key={station.id}>
              {/* Coverage radius circle */}
              <Circle
                center={[lat, lng]}
                radius={250000} // 250 km radius
                pathOptions={{
                  color: station.status === 'HEALTHY' ? '#00F0FF' : '#F59E0B',
                  fillColor: station.status === 'HEALTHY' ? '#00F0FF' : '#F59E0B',
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '4, 8',
                }}
              />

              <Marker position={[lat, lng]} icon={icon}>
                <Popup>
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-polar-700 pb-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-cyan-300">{station.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {lat.toFixed(4)}° S, {lng.toFixed(4)}° E
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        station.status === 'HEALTHY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
                      <div className="flex items-center space-x-1 text-slate-200">
                        <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                        <span>{station.current_temp_c}°C</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Power: {station.power_status_pct || 85}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-200">
                        <Fuel className="w-3.5 h-3.5 text-rose-400" />
                        <span>Fuel: {station.fuel_level_pct || 75}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-200">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>Crew: {station.current_personnel || 24}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 mb-2 italic">
                      Weather: {station.weather_condition || 'Polar Clear'}
                    </p>

                    {onSelectStation && (
                      <button
                        onClick={() => onSelectStation(station.id)}
                        className="w-full py-1.5 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs transition"
                      >
                        Open Station Command Deck →
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
