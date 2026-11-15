import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext';
import { useAuth } from '../contexts/AuthContext';
import { PolarMap } from '../components/PolarMap';
import { StatCard } from '../components/StatCard';
import { RemoteActionModal } from '../components/RemoteActionModal';
import { 
  Activity, Zap, Fuel, Users, ShieldAlert, Radio, 
  Thermometer, AlertTriangle, ArrowRight, BrainCircuit, 
  CheckCircle2, Wrench, RefreshCw, Cpu
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line 
} from 'recharts';
import { alertService, telemetryService, aiInsightService } from '../services/api';

export const DashboardPage = ({ onNavigate }) => {
  const { stations, wsConnected } = useTelemetry();
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [selectedStation, setSelectedStation] = useState('bharati');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [alertsData, insightsData, histData] = await Promise.allSettled([
          alertService.getAlerts(null, null, 'ACTIVE'),
          aiInsightService.getInsights(),
          telemetryService.getHistory(selectedStation, 15)
        ]);

        if (alertsData.status === 'fulfilled') setActiveAlerts(alertsData.value || []);
        if (insightsData.status === 'fulfilled') setAiInsights(insightsData.value || []);
        if (histData.status === 'fulfilled' && histData.value?.history) {
          setTelemetryHistory(histData.value.history);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 4000);
    return () => clearInterval(interval);
  }, [selectedStation]);

  const currStation = stations.find((s) => s.id === selectedStation) || stations[0];
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'HIGH' || a.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide font-mono">
              ANTARCTIC OPERATIONS CONTROL CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
              INDIA HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time remote decision-support, predictive telemetry & mission coordination for Maitri and Bharati stations.
          </p>
        </div>

        {/* Station Tab Switcher & Quick Remote Action */}
        <div className="flex items-center space-x-3">
          <div className="bg-polar-900 p-1 rounded-xl border border-polar-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setSelectedStation('bharati')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                selectedStation === 'bharati'
                  ? 'bg-cyan-500 text-polar-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              BHARATI
            </button>
            <button
              onClick={() => setSelectedStation('maitri')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                selectedStation === 'maitri'
                  ? 'bg-cyan-500 text-polar-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              MAITRI
            </button>
          </div>

          <button
            onClick={() => setIsActionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Simulate Remote Action</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Warning Banner if any */}
      {criticalCount > 0 && (
        <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-rose-200 gap-3 shadow-xl shadow-rose-950/40 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono font-bold text-sm text-white">
                CRITICAL ANOMALY ALERT: {activeAlerts.find((a) => a.severity === 'CRITICAL')?.title || 'Subsystem Degradation'}
              </p>
              <p className="text-xs text-rose-200 mt-0.5">
                {activeAlerts.find((a) => a.severity === 'CRITICAL')?.recommended_action || 'Review AI Decision recommendation and prepare load switch.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('incidents')}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg whitespace-nowrap transition"
          >
            Open Incident Room →
          </button>
        </div>
      )}

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Station Health"
          value={`${currStation?.health_score || 95}%`}
          status={currStation?.health_score < 70 ? 'CRITICAL' : currStation?.health_score < 90 ? 'WARNING' : 'NORMAL'}
          subtitle={currStation?.name}
          icon={Activity}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length}
          status={criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'NORMAL'}
          subtitle={`${criticalCount} Crit • ${warningCount} Warn`}
          icon={AlertTriangle}
        />
        <StatCard
          title="Ambient Temp"
          value={currStation?.current_temp_c}
          unit="°C"
          status={currStation?.current_temp_c < -40 ? 'WARNING' : 'NORMAL'}
          subtitle={`Wind: ${currStation?.wind_speed_knots} kts`}
          icon={Thermometer}
        />
        <StatCard
          title="Microgrid Power"
          value={currStation?.power_status_pct || 85}
          unit="%"
          status="NORMAL"
          subtitle={`Load: ${currStation?.generator_power_kw || 68} kW`}
          icon={Zap}
        />
        <StatCard
          title="Polar Fuel"
          value={currStation?.fuel_level_pct || 75}
          unit="%"
          status={currStation?.fuel_level_pct < 20 ? 'CRITICAL' : 'NORMAL'}
          subtitle="Estimated 250d"
          icon={Fuel}
        />
        <StatCard
          title="Deployed Crew"
          value={currStation?.current_personnel || 24}
          status="NORMAL"
          subtitle="All Safe & On Duty"
          icon={Users}
        />
      </div>

      {/* Main Grid: Interactive Map + Live Telemetry Oscilloscope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Antarctic Map (7 cols) */}
        <div className="lg:col-span-7 bg-polar-900 border border-polar-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Interactive Polar Station Map
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Coordinate Telemetry
            </span>
          </div>

          <PolarMap
            stations={stations}
            height="400px"
            onSelectStation={(id) => onNavigate(`stations`)}
          />

          <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-mono">
            {stations.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedStation(s.id)}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  selectedStation === s.id
                    ? 'bg-polar-800 border-cyan-500/60 ring-1 ring-cyan-400'
                    : 'bg-polar-950/80 border-polar-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{s.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    s.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Temp: {s.current_temp_c}°C</span>
                  <span>Satcom: {s.comm_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Real-time Telemetry Oscilloscope (5 cols) */}
        <div className="lg:col-span-5 bg-polar-900 border border-polar-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Live Sensor Telemetry Trend
              </h3>
            </div>
            <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
              3s Streaming
            </span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="generator_temp" name="Generator Temp (°C)" stroke="#F87171" strokeWidth={2} fill="url(#genGrad)" />
                <Area type="monotone" dataKey="power_draw_kw" name="Power kW" stroke="#00F0FF" strokeWidth={2} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Generator & Anomaly Diagnostics */}
          <div className="mt-3 p-3 rounded-xl bg-polar-950 border border-polar-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Gen Winding Temp:</span>
              <span className={`font-bold ${currStation?.generator_temp_c > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currStation?.generator_temp_c || 70.5}°C
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Harmonic Vibration:</span>
              <span className={`font-bold ${currStation?.generator_vibration_mms > 2.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currStation?.generator_vibration_mms || 1.65} mm/s RMS
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Satcom Latency:</span>
              <span className="text-cyan-300 font-bold">{currStation?.comm_latency_ms || 540} ms</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('live-monitoring')}
            className="w-full mt-3 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-1 transition"
          >
            <span>Launch Multi-Sensor Telemetry Deck</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Decision Support Feed & Station Digital Twin Quick Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Predictive Anomaly Recommendations (6 cols) */}
        <div className="lg:col-span-6 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-800">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                AI Decision Support Intelligence
              </h3>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
              Isolation Forest + RF
            </span>
          </div>

          <div className="space-y-3">
            {aiInsights.slice(0, 2).map((ins, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-polar-850 border border-polar-750 hover:border-purple-500/50 transition shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-white tracking-tight">{ins.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    ins.risk_level === 'CRITICAL' || ins.risk_level === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {ins.risk_level} RISK ({ins.confidence_pct || 94}%)
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">What Happened:</strong> {ins.what_happened}</p>
                  <p><strong className="text-slate-400">Why It Matters:</strong> {ins.why_it_matters}</p>
                </div>

                <div className="p-2 rounded-lg bg-polar-950 border border-purple-500/30 text-[11px] text-cyan-200">
                  <strong className="text-purple-300 font-bold block mb-0.5">Recommended Protocol:</strong>
                  {ins.recommended_action}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('ai-insights')}
            className="w-full mt-4 py-2 rounded-lg bg-polar-850 hover:bg-polar-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <span>View Full AI Diagnostic Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Station Subsystems & Quick Navigation (6 cols) */}
        <div className="lg:col-span-6 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Antarctic Station Subsystems Status
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {currStation?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3 text-xs font-mono">
            {[
              { name: 'Diesel Power Plant', status: currStation?.generator_temp_c > 80 ? 'WARNING' : 'HEALTHY', icon: Zap },
              { name: 'Hydronic Heating', status: 'HEALTHY', icon: Thermometer },
              { name: 'Water Desalination', status: 'HEALTHY', icon: Activity },
              { name: 'GSAT Radome Uplink', status: currStation?.comm_status === 'ONLINE' ? 'HEALTHY' : 'DEGRADED', icon: Radio },
              { name: 'Polar Fuel Farm', status: currStation?.fuel_level_pct < 20 ? 'CRITICAL' : 'HEALTHY', icon: Fuel },
              { name: 'Atmospheric Labs', status: 'HEALTHY', icon: Cpu },
            ].map((sub, i) => {
              const Icon = sub.icon;
              const isCrit = sub.status === 'CRITICAL';
              const isWarn = sub.status === 'WARNING';
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border bg-polar-950/80 ${
                    isCrit ? 'border-rose-500/70 text-rose-300' : isWarn ? 'border-amber-500/70 text-amber-300' : 'border-polar-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-rose-400 animate-ping' : isWarn ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  </div>
                  <p className="font-bold text-[11px] text-white leading-tight">{sub.name}</p>
                  <span className="text-[9px] text-slate-400 uppercase">{sub.status}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => onNavigate('digital-twin')}
              className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs transition text-center"
            >
              Open 2.5D Digital Twin Model →
            </button>
            <button
              onClick={() => onNavigate('predictive-maintenance')}
              className="flex-1 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-200 font-bold text-xs transition text-center"
            >
              Predictive RUL Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Remote Action Modal */}
      <RemoteActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        stationId={selectedStation}
        targetEquipmentId={selectedStation === 'bharati' ? 'EQ-BH-GEN-01' : 'EQ-MT-GEN-01'}
        onSuccess={() => {
          // Trigger local refresh
        }}
      />
    </div>
  );
};
