import React, { useState, useEffect } from 'react';
import { 
  Bell, ShieldAlert, CheckCircle2, Search, Filter, 
  Clock, Check, Eye, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { alertService } from '../services/api';

export const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      await alertService.acknowledgeAlert(alertId, user?.full_name || 'Operator');
      fetchAlerts();
    } catch (err) {
      alert('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertService.resolveAlert(alertId, user?.full_name || 'Operator', resolveNotes || 'Resolved per standard operating procedure.');
      setSelectedAlert(null);
      setResolveNotes('');
      fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  const filtered = alerts.filter((a) => {
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStat = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSev && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              CENTRALIZED INTELLIGENT ALERT HUB
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 font-mono">
              Triage & Escalation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized operational notifications with ML anomaly context and decision protocols.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-polar-900 rounded-2xl border border-polar-800 font-mono">
            No active alerts matching filter. All station subsystems operating within nominal limits.
          </div>
        ) : (
          filtered.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';
            const isResolved = alert.status === 'RESOLVED';
            const isAck = alert.status === 'ACKNOWLEDGED';

            let cardBorder = 'border-polar-800';
            let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

            if (isCrit) {
              cardBorder = 'border-rose-500/80 shadow-lg shadow-rose-950/30';
              badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse';
            } else if (isHigh) {
              cardBorder = 'border-amber-500/60';
              badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            }

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl bg-polar-900 border ${cardBorder} transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${badgeStyle}`}>
                      {alert.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-polar-800 text-cyan-300 border border-polar-700 uppercase">
                      {alert.station_id} • {alert.subsystem}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">{alert.title}</h3>
                  <p className="text-xs text-slate-300">{alert.description}</p>

                  {alert.recommended_action && (
                    <div className="text-[11px] text-cyan-300 bg-polar-950 p-2 rounded-lg border border-polar-800">
                      <strong>AI Recommendation:</strong> {alert.recommended_action}
                    </div>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-polar-800 hover:bg-polar-750 text-slate-200 hover:text-white text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-polar-950 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {alert.status === 'RESOLVED' && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved by {alert.resolved_by}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-polar-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-polar-900 border border-polar-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">RESOLVE ALERT #{selectedAlert.id}</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedAlert.title}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Resolution & Corrective Notes:</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Switched load to generator-02 and verified coolant loop pressure restored."
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 py-2 rounded-lg bg-polar-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(selectedAlert.id)}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 text-polar-950 font-bold hover:bg-emerald-400"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
