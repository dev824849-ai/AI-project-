import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext';
import { 
  Activity, Zap, Thermometer, Radio, Gauge, 
  RefreshCw, Play, Pause, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { telemetryService } from '../services/api';

export const LiveMonitoringPage = () => {
  const { stations, wsConnected } = useTelemetry();
  const [selectedStation, setSelectedStation] = useState('bharati');
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  useEffect(() => {
    let interval = null;
    const fetchHistory = async () => {
      if (isLivePaused) return;
      try {
        const data = await telemetryService.getHistory(selectedStation, 25);
        if (data?.history) {
          setTelemetryHistory(data.history);
        }
      } catch (err) {
        console.error('Error fetching live history', err);
      }
    };

    fetchHistory();
    interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedStation, isLivePaused]);

  const currStation = stations.find((s) => s.id === selectedStation) || stations[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              REAL-TIME MULTI-SENSOR TELEMETRY DECK
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              3s POLAR UPLINK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SCADA telemetry streamed via satellite burst protocol to India Control Center.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Station Switcher */}
          <div className="bg-polar-900 p-1 rounded-xl border border-polar-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setSelectedStation('bharati')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                selectedStation === 'bharati' ? 'bg-cyan-500 text-polar-950' : 'text-slate-300'
              }`}
            >
              BHARATI
            </button>
            <button
              onClick={() => setSelectedStation('maitri')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                selectedStation === 'maitri' ? 'bg-cyan-500 text-polar-950' : 'text-slate-300'
              }`}
            >
              MAITRI
            </button>
          </div>

          <button
            onClick={() => setIsLivePaused(!isLivePaused)}
            className="px-3 py-1.5 rounded-lg bg-polar-850 hover:bg-polar-800 text-slate-300 hover:text-white border border-polar-700 text-xs font-mono flex items-center space-x-1.5"
          >
            {isLivePaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLivePaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>
        </div>
      </div>

      {/* Live Gauges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">GENERATOR TEMP</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <p className={`text-2xl font-bold ${currStation?.generator_temp_c > 80 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {currStation?.generator_temp_c || 70.5}°C
          </p>
          <span className="text-[10px] text-slate-400">Nominal: 60 - 78°C</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">HARMONIC VIBRATION</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className={`text-2xl font-bold ${currStation?.generator_vibration_mms > 2.5 ? 'text-amber-400' : 'text-white'}`}>
            {currStation?.generator_vibration_mms || 1.65} mm/s
          </p>
          <span className="text-[10px] text-slate-400">ISO Tolerance: &lt; 2.2 mm/s</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">LOAD DEMAND</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {currStation?.generator_power_kw || 68.5} kW
          </p>
          <span className="text-[10px] text-slate-400">Gen Rating: 125 kVA</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">SATCOM LATENCY</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">
            {currStation?.comm_latency_ms || 540} ms
          </p>
          <span className="text-[10px] text-slate-400">GSAT-14 Polar Earth Station</span>
        </div>
      </div>

      {/* Primary Oscilloscope: Thermal & Mechanical Strain */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Primary Power Plant Thermal & Mechanical Telemetry
            </h3>
            <p className="text-xs text-slate-400">Continuous 3-second streaming trend</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span>Gen Temp (°C)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Power Draw (kW)</span>
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="generator_temp" stroke="#F87171" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="power_draw_kw" stroke="#00F0FF" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Graphs Grid: Vibration and Ambient Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">
            Vibration Spectrum (ISO 10816 Standard)
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 6]} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="vibration_mms" name="Vibration (mm/s RMS)" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">
            Ambient Wind Velocity & Atmospheric Drift
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="wind_speed" name="Wind Speed (knots)" stroke="#6EE7B7" fill="#6EE7B7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
