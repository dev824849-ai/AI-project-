import React, { useState, useEffect } from 'react';
import { 
  Cpu, Wrench, Search, Filter, AlertTriangle, 
  CheckCircle2, ArrowRight, Activity, Thermometer, Clock 
} from 'lucide-react';
import { equipmentService } from '../services/api';

export const EquipmentPage = ({ onSelectEquipment }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentService.getEquipment();
        setEquipmentList(data || []);
      } catch (e) {
        console.error('Error fetching equipment', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const filtered = equipmentList.filter((eq) => {
    const matchSearch = eq.name.toLowerCase().includes(search.toLowerCase()) || eq.id.toLowerCase().includes(search.toLowerCase());
    const matchSubsystem = subsystemFilter === 'ALL' || eq.subsystem === subsystemFilter;
    const matchStation = stationFilter === 'ALL' || eq.station_id === stationFilter;
    return matchSearch && matchSubsystem && matchStation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
            ANTARCTIC EQUIPMENT & ASSET REGISTRY
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous health telemetry, failure risk scoring, and Remaining Useful Life (RUL) tracking.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-polar-900 border border-polar-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Stations</option>
            <option value="bharati">Bharati Station</option>
            <option value="maitri">Maitri Station</option>
          </select>

          <select
            value={subsystemFilter}
            onChange={(e) => setSubsystemFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Subsystems</option>
            <option value="POWER">Power Generation</option>
            <option value="HVAC">Heating & Climate</option>
            <option value="WATER">Water & Desalination</option>
            <option value="COMMS">Satellite Comms</option>
            <option value="RESEARCH">Scientific Lidar</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-polar-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Equipment Name</th>
                <th className="p-3">Station</th>
                <th className="p-3">Subsystem</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Failure Risk</th>
                <th className="p-3">Operating Hours</th>
                <th className="p-3">Predicted RUL</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800 text-slate-300">
              {filtered.map((eq) => (
                <tr key={eq.id} className="hover:bg-polar-850/70 transition">
                  <td className="p-3 font-bold text-cyan-300">{eq.id}</td>
                  <td className="p-3 text-white font-semibold">{eq.name}</td>
                  <td className="p-3 uppercase text-slate-400">{eq.station_id}</td>
                  <td className="p-3 text-slate-400">{eq.subsystem}</td>
                  <td className="p-3">
                    <span className={`font-bold ${eq.health_score > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {eq.health_score}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      eq.failure_risk === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : eq.failure_risk === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    }`}>
                      {eq.failure_risk}
                    </span>
                  </td>
                  <td className="p-3">{eq.operating_hours.toFixed(0)} hrs</td>
                  <td className="p-3 text-cyan-300 font-bold">{eq.predicted_rul_hours.toFixed(0)} hrs</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      eq.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectEquipment && onSelectEquipment(eq.id)}
                      className="px-2.5 py-1 rounded bg-polar-800 hover:bg-cyan-500 hover:text-polar-950 text-cyan-300 font-bold transition text-[11px]"
                    >
                      Diagnostics →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
