import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Sliders, Database, 
  CheckCircle2, Clock, RefreshCw, FileText, UserCheck 
} from 'lucide-react';
import { settingsService } from '../services/api';

export const SettingsPage = () => {
  const [thresholds, setThresholds] = useState({
    generator_temp_max_c: 80.0,
    generator_vibration_max_mms: 2.5,
    fuel_critical_pct: 20.0,
    comm_latency_max_ms: 1200.0,
    wind_speed_blizzard_knots: 40.0
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [thresh, logs] = await Promise.all([
          settingsService.getThresholds(),
          settingsService.getAuditLogs(50)
        ]);
        if (thresh) setThresholds(thresh);
        if (logs) setAuditLogs(logs);
      } catch (e) {
        console.error('Error fetching settings', e);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateThresholds(thresholds);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      const logs = await settingsService.getAuditLogs(50);
      setAuditLogs(logs || []);
    } catch (err) {
      alert('Failed to save thresholds');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              SYSTEM SETTINGS & SECURITY AUDIT TRAIL
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              NCAOR HQ Security
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operational alarm thresholds, fail-safe rules, and immutable operator action logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Left: Operational Threshold Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-polar-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              SCADA Alarm Thresholds
            </h3>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thresholds updated & logged to security audit trail.</span>
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Max Generator Temperature (°C)</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.generator_temp_max_c}
                onChange={(e) => setThresholds({ ...thresholds, generator_temp_max_c: parseFloat(e.target.value) })}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Max Vibration Limit (mm/s RMS)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.generator_vibration_max_mms}
                onChange={(e) => setThresholds({ ...thresholds, generator_vibration_max_mms: parseFloat(e.target.value) })}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Critical Fuel Reserve Level (%)</label>
              <input
                type="number"
                step="1"
                value={thresholds.fuel_critical_pct}
                onChange={(e) => setThresholds({ ...thresholds, fuel_critical_pct: parseFloat(e.target.value) })}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Blizzard Wind Speed Warning (knots)</label>
              <input
                type="number"
                step="1"
                value={thresholds.wind_speed_blizzard_knots}
                onChange={(e) => setThresholds({ ...thresholds, wind_speed_blizzard_knots: parseFloat(e.target.value) })}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs transition"
            >
              Save Alarm Thresholds
            </button>
          </form>
        </div>

        {/* Right: Security & Operator Audit Logs (7 cols) */}
        <div className="lg:col-span-7 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-polar-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Operator Action & Audit Log Trail
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Immutable Records
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-polar-950 border border-polar-800 text-slate-300">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-300">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-polar-800 text-slate-400">
                      {log.entity_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>User: <strong className="text-slate-400">{log.user_id} ({log.user_role})</strong></span>
                  <span className="text-emerald-400 font-bold">{log.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
