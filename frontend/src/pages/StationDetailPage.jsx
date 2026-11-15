import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext';
import { 
  MapPin, Thermometer, Zap, Fuel, Radio, Users, 
  Activity, Wrench, ArrowLeft, ShieldAlert, CheckCircle2, Box, Cpu, Package
} from 'lucide-react';
import { stationService } from '../services/api';
import { RemoteActionModal } from '../components/RemoteActionModal';

export const StationDetailPage = ({ stationId = 'bharati', onBack, onNavigate }) => {
  const { getStationById } = useTelemetry();
  const station = getStationById(stationId);
  const [summaryData, setSummaryData] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await stationService.getStationSummary(stationId);
        setSummaryData(res);
      } catch (e) {
        // ignore
      }
    };
    loadSummary();
  }, [stationId]);

  return (
    <div className="space-y-6">
      {/* Back button & Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-polar-900 hover:bg-polar-800 text-slate-300 hover:text-white border border-polar-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
                {station?.name.toUpperCase()} COMMAND DECK
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                {station?.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Lat: {station?.latitude || -69.4069}° S, Long: {station?.longitude || 76.1958}° E • Elevation: {station?.elevation_m || 35}m
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('digital-twin')}
            className="px-3.5 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-cyan-300 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Box className="w-4 h-4" />
            <span>Digital Twin</span>
          </button>
          <button
            onClick={() => setIsActionOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Wrench className="w-4 h-4" />
            <span>Remote Command</span>
          </button>
        </div>
      </div>

      {/* Station Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono">HEALTH SCORE</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-300">{station?.health_score}%</p>
          <span className="text-[10px] text-slate-400">All Subsystems Nominal</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono">AMBIENT CLIMATE</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-200">{station?.current_temp_c}°C</p>
          <span className="text-[10px] text-slate-400">Wind: {station?.wind_speed_knots} kts {station?.wind_direction}</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono">POWER LOAD</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300">{station?.generator_output_kw || 68} kW</p>
          <span className="text-[10px] text-slate-400">Solar Gen: {station?.solar_output_kw || 12} kW</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono">POLAR DIESEL</span>
            <Fuel className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-300">{station?.fuel_level_pct}%</p>
          <span className="text-[10px] text-slate-400">Days Remaining: ~250d</span>
        </div>
      </div>

      {/* Subsystem & Equipment Table */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Station Equipment Registry & Health
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {summaryData?.equipment?.length || 0} Registered Assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-polar-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Equipment Name</th>
                <th className="p-3">Subsystem</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Temperature</th>
                <th className="p-3">Vibration</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800 text-slate-300">
              {summaryData?.equipment?.map((eq) => (
                <tr key={eq.id} className="hover:bg-polar-850/60 transition">
                  <td className="p-3 text-cyan-300 font-bold">{eq.id}</td>
                  <td className="p-3 text-white font-semibold">{eq.name}</td>
                  <td className="p-3 text-slate-400">{eq.subsystem}</td>
                  <td className="p-3">
                    <span className={`font-bold ${eq.health_score > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {eq.health_score}%
                    </span>
                  </td>
                  <td className="p-3">{eq.temperature_c}°C</td>
                  <td className="p-3">{eq.vibration_mms} mm/s</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      eq.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remote Action Execution Modal */}
      <RemoteActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        stationId={stationId}
        targetEquipmentId={stationId === 'bharati' ? 'EQ-BH-GEN-01' : 'EQ-MT-GEN-01'}
      />
    </div>
  );
};
