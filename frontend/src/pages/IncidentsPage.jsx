import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Clock, 
  ArrowRight, Activity, Wrench, ShieldCheck, Plus 
} from 'lucide-react';
import { incidentService } from '../services/api';
import { RemoteActionModal } from '../components/RemoteActionModal';
import { useAuth } from '../contexts/AuthContext';

export const IncidentsPage = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentActions, setIncidentActions] = useState([]);
  const [isRemoteActionOpen, setIsRemoteActionOpen] = useState(false);

  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data || []);
      if (data?.length && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (e) {
      console.error('Error fetching incidents', e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActions = async () => {
      if (selectedIncident) {
        try {
          const acts = await incidentService.getIncidentActions(selectedIncident.id);
          setIncidentActions(acts || []);
        } catch (e) {
          // ignore
        }
      }
    };
    fetchActions();
  }, [selectedIncident]);

  const handleResolveIncident = async () => {
    if (!selectedIncident) return;
    try {
      await incidentService.recordAction(selectedIncident.id, {
        action_type: 'RESOLVE',
        description: `Incident marked as RESOLVED by ${user?.full_name || 'Operator'} after verifying secondary subsystem stabilization.`,
        performed_by: user?.full_name || 'Operator',
        result_status: 'RESOLVED'
      });
      fetchIncidents();
    } catch (e) {
      alert('Failed to resolve incident');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              EMERGENCY INCIDENT COMMAND & RESPONSE
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 font-mono">
              Active SOP Tracking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Emergency containment workflow: Detection → Containment → Remote Actuation → Crew Coordination → Resolution.
          </p>
        </div>
      </div>

      {/* Main Grid: Incident List (5 cols) + Active Incident War Room (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Feed */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
            Incident Register ({incidents.length})
          </h3>

          {incidents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-polar-900 rounded-2xl border border-polar-800 font-mono text-xs">
              No active emergency incidents reported.
            </div>
          ) : (
            incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isCrit = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-2xl border bg-polar-900 cursor-pointer transition font-mono shadow-md ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-polar-850'
                      : isCrit
                      ? 'border-rose-500/70 hover:border-rose-400'
                      : 'border-polar-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-cyan-300">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      inc.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{inc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{inc.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-polar-800">
                    <span className="uppercase text-cyan-400">{inc.station_id} STATION</span>
                    <span>{new Date(inc.reported_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Incident War Room & SOP Timeline */}
        <div className="lg:col-span-7 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl font-mono space-y-4">
          {selectedIncident ? (
            <>
              <div className="flex items-start justify-between border-b border-polar-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-polar-800 text-cyan-300">
                      {selectedIncident.id}
                    </span>
                    <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Station: <strong className="text-white uppercase">{selectedIncident.station_id}</strong> • Affected: <strong className="text-cyan-300">{selectedIncident.affected_subsystem}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsRemoteActionOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-polar-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                  >
                    Take Remote Action
                  </button>
                  {selectedIncident.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolveIncident}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-polar-950 font-bold text-xs hover:bg-emerald-400"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              </div>

              {/* Subsystem & Backup Status Box */}
              <div className="p-3 bg-polar-950 rounded-xl border border-polar-800 text-xs space-y-1.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                  STANDBY & BACKUP CAPACITY:
                </span>
                <p className="text-emerald-300">
                  {selectedIncident.backup_systems_status || 'Secondary Diesel Generator-02 on hot standby; Battery bank at 94%'}
                </p>
              </div>

              {/* Recommended Action Protocols */}
              <div className="p-3.5 bg-polar-950 rounded-xl border border-purple-500/30 text-xs space-y-1.5">
                <span className="text-purple-300 font-bold text-[10px] uppercase tracking-wider block">
                  STANDARD OPERATING PROTOCOLS (SOP):
                </span>
                <p className="text-slate-200 whitespace-pre-line">
                  {selectedIncident.recommended_protocols || '1. Verify secondary bus synchronizer.\n2. Request automated load transfer.\n3. Dispatch station engineer.'}
                </p>
              </div>

              {/* Incident Action & Audit Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Response Action History & Audit Log
                </h4>
                <div className="space-y-2 text-xs">
                  {incidentActions.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No remote actions recorded yet for this incident.</p>
                  ) : (
                    incidentActions.map((act) => (
                      <div key={act.id} className="p-3 bg-polar-950 rounded-xl border border-polar-800 text-slate-300">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-cyan-300">{act.action_type}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{act.description}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">By: {act.performed_by}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400">Select an incident from the left panel to inspect.</p>
          )}
        </div>
      </div>

      {/* Remote Action Modal */}
      <RemoteActionModal
        isOpen={isRemoteActionOpen}
        onClose={() => setIsRemoteActionOpen(false)}
        stationId={selectedIncident?.station_id || 'bharati'}
        targetEquipmentId={selectedIncident?.station_id === 'bharati' ? 'EQ-BH-GEN-01' : 'EQ-MT-GEN-01'}
        onSuccess={() => {
          fetchIncidents();
        }}
      />
    </div>
  );
};
