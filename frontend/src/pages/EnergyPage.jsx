import React, { useState, useEffect } from 'react';
import { 
  Zap, Fuel, BatteryCharging, Sun, Activity, 
  ArrowRight, ShieldAlert, CheckCircle2, Flame, Wrench 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import { energyService } from '../services/api';
import { RemoteActionModal } from '../components/RemoteActionModal';

export const EnergyPage = () => {
  const [stationId, setStationId] = useState('bharati');
  const [metrics, setMetrics] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await energyService.getMetrics(stationId);
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching energy metrics', err);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [stationId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              POLAR ENERGY & MICROGRID MANAGEMENT
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              HYBRID SCADA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diesel Generation • Bifacial Polar Solar Arrays • LiFePO4 Battery Storage • Fuel Reserves.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-polar-900 p-1 rounded-xl border border-polar-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setStationId('bharati')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                stationId === 'bharati' ? 'bg-cyan-500 text-polar-950' : 'text-slate-300'
              }`}
            >
              BHARATI
            </button>
            <button
              onClick={() => setStationId('maitri')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                stationId === 'maitri' ? 'bg-cyan-500 text-polar-950' : 'text-slate-300'
              }`}
            >
              MAITRI
            </button>
          </div>

          <button
            onClick={() => setIsActionOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-polar-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power Shedding / Gen Switch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">TOTAL DEMAND</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics?.current_total_load_kw || 72.5} kW</p>
          <span className="text-[10px] text-slate-400">Microgrid Frequency: 50.0 Hz</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">SOLAR GENERATION</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">{metrics?.solar_output_kw || 18.5} kW</p>
          <span className="text-[10px] text-slate-400">Polar Sunlight Yield</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">BATTERY BANK SOC</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">{metrics?.battery_soc_pct || 94}%</p>
          <span className="text-[10px] text-slate-400">Capacity: 400 kWh LiFePO4</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">POLAR FUEL LEVEL</span>
            <Fuel className="w-4 h-4 text-rose-400" />
          </div>
          <p className={`text-2xl font-bold ${metrics?.fuel_level_pct < 20 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {metrics?.fuel_level_pct || 76}%
          </p>
          <span className="text-[10px] text-slate-400">Est. {metrics?.estimated_fuel_days || 250} Days Remaining</span>
        </div>
      </div>

      {/* 24-Hour Energy Generation Profile Chart */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            24-Hour Microgrid Power Generation & Load Demand (kW)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Diesel + Solar + Storage</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics?.hourly_trends || []}>
              <defs>
                <linearGradient id="genG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="solG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="generator_kw" name="Diesel Generator Output (kW)" stroke="#3B82F6" fill="url(#genG)" />
              <Area type="monotone" dataKey="solar_kw" name="Solar Array Output (kW)" stroke="#F59E0B" fill="url(#solG)" />
              <Area type="monotone" dataKey="total_demand_kw" name="Total Station Demand (kW)" stroke="#00F0FF" fill="none" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generators Health & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics?.generators?.map((gen) => (
          <div key={gen.id} className="p-4 rounded-2xl bg-polar-900 border border-polar-800 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">{gen.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                gen.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {gen.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-polar-950 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-400 block">Temperature</span>
                <span className={`font-bold ${gen.temp_c > 80 ? 'text-rose-400' : 'text-cyan-300'}`}>{gen.temp_c}°C</span>
              </div>
              <div className="p-2.5 bg-polar-950 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-400 block">Output kW</span>
                <span className="font-bold text-white">{gen.power_kw} kW</span>
              </div>
              <div className="p-2.5 bg-polar-950 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-400 block">Efficiency</span>
                <span className="font-bold text-emerald-400">{gen.efficiency_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RemoteActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        stationId={stationId}
        targetEquipmentId={stationId === 'bharati' ? 'EQ-BH-GEN-01' : 'EQ-MT-GEN-01'}
      />
    </div>
  );
};
