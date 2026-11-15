import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Wrench, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { remoteActionService } from '../services/api';

export const RemoteActionModal = ({
  isOpen,
  onClose,
  stationId = 'bharati',
  targetEquipmentId = 'EQ-BH-GEN-01',
  defaultAction = 'SWITCH_GENERATOR',
  onSuccess
}) => {
  const [actionType, setActionType] = useState(defaultAction);
  const [notes, setNotes] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await remoteActionService.execute(stationId, targetEquipmentId, actionType, notes);
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setResult({
        success: false,
        result: err.response?.data?.detail || 'Remote execution error in simulation.'
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-polar-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-polar-900 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Simulation Warning Banner */}
        <div className="flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl mb-4 text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold tracking-wider uppercase block">SIMULATION MODE ACTIVE</span>
            Commands simulate Antarctic SCADA & PLC remote bus controls. Direct actuation on live physical hardware requires physical safety key at station.
          </div>
        </div>

        <h3 className="text-base font-bold text-white font-mono mb-1">
          EXECUTE REMOTE CONTROL ACTION
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Target: <strong className="text-cyan-300">{targetEquipmentId}</strong> • Station: <strong className="text-cyan-300">{stationId.toUpperCase()}</strong>
        </p>

        {!result ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Action Protocol:
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="SWITCH_GENERATOR">
                  SWITCH_GENERATOR: Transfer Habitat Load to Backup Generator-02
                </option>
                <option value="SHED_NON_CRITICAL_LOAD">
                  SHED_NON_CRITICAL_LOAD: Shed 22 kW Secondary Auxiliary Heaters
                </option>
                <option value="TRIGGER_EMERGENCY_SIREN">
                  TRIGGER_EMERGENCY_SIREN: Sound Station Crew Muster Alarm
                </option>
                <option value="FLUSH_COOLANT_LOOP">
                  FLUSH_COOLANT_LOOP: Trigger Automated High-Pressure Radiator Flush
                </option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                Operator Directives & Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Authorizing automatic load transfer per AI predictive recommendation..."
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={executing}
                onClick={handleExecute}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-extrabold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20"
              >
                {executing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting to Station...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Authorize & Execute (Simulated)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300 font-mono">
              SIMULATED ACTION COMPLETED
            </h4>
            <div className="p-3 bg-polar-950 rounded-lg border border-polar-800 text-xs text-slate-300 text-left font-mono">
              {result.result}
            </div>
            <p className="text-[11px] text-slate-400">
              Audit log recorded with timestamp and operator credentials.
            </p>
            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs"
            >
              Return to Operations Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
