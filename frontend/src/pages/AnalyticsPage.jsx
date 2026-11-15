import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Activity, Zap, Fuel, Radio, 
  TrendingUp, Calendar, ArrowRight 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { analyticsService } from '../services/api';

export const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getSummary();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics', err);
      }
    };
    fetchAnalytics();
  }, []);

  const trends = analyticsData?.thirty_day_trends || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              HISTORICAL & CROSS-STATION ANALYTICS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              30-Day Polar Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative energy consumption, telemetry uptime reliability, and operational efficiency across Maitri & Bharati.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">SATCOM RELIABILITY</span>
          <p className="text-2xl font-bold text-emerald-300">
            {analyticsData?.satellite_telemetry_reliability_pct || 99.8}%
          </p>
          <span className="text-[10px] text-slate-400">Mean Latency: 560ms</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">MEAN TIME TO REPAIR (MTTR)</span>
          <p className="text-2xl font-bold text-cyan-300">
            {analyticsData?.mean_time_to_repair_hours || 3.4} hrs
          </p>
          <span className="text-[10px] text-slate-400">Standard Polar Maintenance</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">MONITORED ASSETS</span>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.total_equipment_monitored || 8} Units
          </p>
          <span className="text-[10px] text-slate-400">2 Active Stations</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">LIFETIME ALERTS</span>
          <p className="text-2xl font-bold text-purple-300">
            {analyticsData?.lifetime_alerts || 12}
          </p>
          <span className="text-[10px] text-slate-400">95% Auto-Triaged by AI</span>
        </div>
      </div>

      {/* Comparative 30-Day Power Generation Chart */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          Comparative Daily Power Generation Profile (kWh/Day)
        </h3>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="bharati_power_kwh" name="Bharati Station (kWh)" fill="#00F0FF" />
              <Bar dataKey="maitri_power_kwh" name="Maitri Station (kWh)" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station Uptime Reliability Trend */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          Station Uptime & Satellite Telemetry Link Integrity (%)
        </h3>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[95, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="bharati_uptime_pct" name="Bharati Uptime %" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="maitri_uptime_pct" name="Maitri Uptime %" stroke="#A78BFA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
