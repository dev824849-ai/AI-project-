import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext';
import { MapPin, Thermometer, Zap, Fuel, Radio, Users, Calendar, Activity, ArrowRight, Search, Plus, Filter } from 'lucide-react';
import { stationService } from '../services/api';

export const StationsPage = ({ onNavigate, onSelectStationDetail }) => {
  const { stations } = useTelemetry();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');

  const filteredStations = stations.filter((st) => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
            INDIAN ANTARCTIC RESEARCH STATIONS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registry & status of India's polar research stations (Maitri, Bharati, Dakshin Gangotri).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-polar-900 border border-polar-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.map((st) => {
          const isHealthy = st.status === 'HEALTHY' || st.status === 'NORMAL';
          const isOffline = st.status === 'OFFLINE';

          return (
            <div
              key={st.id}
              className="bg-polar-900 border border-polar-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight font-mono">{st.name}</h3>
                    <p className="text-xs text-cyan-300 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{st.location_name || 'East Antarctica'}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                    isHealthy
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isOffline
                      ? 'bg-slate-700/40 text-slate-400 border-slate-600'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {st.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {st.description || 'Indian Antarctic research station under NCAOR management.'}
                </p>

                {/* Telemetry Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-polar-950 border border-polar-800 text-xs font-mono mb-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Temperature</span>
                      <span className="font-bold text-white">{st.current_temp_c}°C</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Microgrid Load</span>
                      <span className="font-bold text-white">{st.power_status_pct || 85}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Fuel className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Polar Fuel</span>
                      <span className="font-bold text-white">{st.fuel_level_pct || 75}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Satcom Link</span>
                      <span className="font-bold text-white">{st.comm_status}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Crew: <strong className="text-slate-200">{st.current_personnel || 0}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est: <strong className="text-slate-200">{st.established_year || 2012}</strong></span>
                  </span>
                  <span>Health: <strong className="text-cyan-300">{st.health_score}%</strong></span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectStationDetail) onSelectStationDetail(st.id);
                  onNavigate(`station-detail`);
                }}
                className="w-full py-2 px-3 rounded-lg bg-polar-800 hover:bg-cyan-500 hover:text-polar-950 text-cyan-300 font-bold text-xs transition flex items-center justify-center space-x-1"
              >
                <span>Open Station Command Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
