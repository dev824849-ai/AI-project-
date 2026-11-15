import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Cpu, Wrench, Activity, Thermometer, 
  Clock, CheckCircle2, ShieldAlert, Plus, RefreshCw 
} from 'lucide-react';
import { equipmentService } from '../services/api';
import { RemoteActionModal } from '../components/RemoteActionModal';

export const EquipmentDetailPage = ({ equipmentId = 'EQ-BH-GEN-01', onBack }) => {
  const [equipment, setEquipment] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    maintenance_type: 'PREVENTIVE',
    description: '',
    technician_name: 'Maj. Amitav Rathore',
    findings: 'Inspected cooling loop and verified oil pressure at 4.2 bar.',
    parts_replaced: 'None'
  });

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const [eq, hist] = await Promise.all([
          equipmentService.getEquipmentDetail(equipmentId),
          equipmentService.getMaintenanceHistory(equipmentId)
        ]);
        setEquipment(eq);
        setMaintenanceHistory(hist || []);
      } catch (e) {
        console.error('Error fetching equipment detail', e);
      }
    };
    loadDetail();
  }, [equipmentId]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const record = await equipmentService.addMaintenanceRecord(equipmentId, newLog);
      setMaintenanceHistory([record, ...maintenanceHistory]);
      setIsLogModalOpen(false);
      // Refresh equipment
      const eq = await equipmentService.getEquipmentDetail(equipmentId);
      setEquipment(eq);
    } catch (err) {
      alert('Failed to add maintenance log');
    }
  };

  if (!equipment) {
    return <div className="p-8 text-slate-400">Loading equipment telemetry diagnostic model...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
                {equipment.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-polar-800 text-cyan-300 border border-polar-700">
                ID: {equipment.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Station: {equipment.station_id.toUpperCase()} • Room: {equipment.location_room}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-200 text-xs font-bold font-mono transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Maintenance Task</span>
          </button>

          <button
            onClick={() => setIsActionOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Wrench className="w-4 h-4" />
            <span>Simulate Control Action</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">HEALTH SCORE</span>
          <p className={`text-2xl font-bold ${equipment.health_score > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {equipment.health_score}%
          </p>
          <span className="text-[10px] text-slate-400">Risk: {equipment.failure_risk}</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">RUNNING TEMP</span>
          <p className={`text-2xl font-bold ${equipment.temperature_c > 80 ? 'text-rose-400' : 'text-cyan-300'}`}>
            {equipment.temperature_c}°C
          </p>
          <span className="text-[10px] text-slate-400">Vibration: {equipment.vibration_mms} mm/s</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">OPERATING RUNTIME</span>
          <p className="text-2xl font-bold text-white">{equipment.operating_hours.toFixed(0)} hrs</p>
          <span className="text-[10px] text-slate-400">Since Commissioning</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <span className="text-xs text-slate-400 block mb-1">PREDICTED RUL</span>
          <p className="text-2xl font-bold text-cyan-400">{equipment.predicted_rul_hours.toFixed(0)} hrs</p>
          <span className="text-[10px] text-slate-400">Remaining Useful Life</span>
        </div>
      </div>

      {/* AI Anomaly Diagnostics Card */}
      <div className="p-5 rounded-2xl bg-polar-900 border border-purple-500/40 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            AI Predictive Diagnostics & Physics Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-polar-950 rounded-xl border border-polar-800">
            <span className="text-slate-400 block mb-1 font-bold">DETECTED PATTERN & ANOMALY:</span>
            <p className="text-slate-200">
              {equipment.anomaly_reason || 'Nominal telemetry envelope. No thermal drift or harmonic anomalies detected.'}
            </p>
          </div>

          <div className="p-3 bg-polar-950 rounded-xl border border-purple-500/30 text-purple-200">
            <span className="text-purple-300 block mb-1 font-bold">RECOMMENDED PREVENTIVE ACTION:</span>
            <p>
              {equipment.recommended_action || 'Continue standard bi-weekly lubricant sampling and schedule preventive inspection.'}
            </p>
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3">
          Maintenance & Work Order Logs
        </h3>

        {maintenanceHistory.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No maintenance records logged yet.</p>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {maintenanceHistory.map((rec) => (
              <div key={rec.id} className="p-3 bg-polar-950 rounded-xl border border-polar-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {rec.maintenance_type}
                    </span>
                    <span className="font-bold text-white">{rec.description}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tech: {rec.technician_name} • Findings: {rec.findings || 'Nominal'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(rec.performed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remote Action Modal */}
      <RemoteActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        stationId={equipment.station_id}
        targetEquipmentId={equipment.id}
      />

      {/* New Maintenance Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-polar-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-polar-900 border border-polar-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-mono mb-3">Record Maintenance Task</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Maintenance Type</label>
                <select
                  value={newLog.maintenance_type}
                  onChange={(e) => setNewLog({ ...newLog, maintenance_type: e.target.value })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2 text-white"
                >
                  <option value="PREVENTIVE">PREVENTIVE</option>
                  <option value="CORRECTIVE">CORRECTIVE</option>
                  <option value="INSPECTION">INSPECTION</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flushed radiator cooling loop and tightened flange bolts"
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technician Name</label>
                <input
                  type="text"
                  required
                  value={newLog.technician_name}
                  onChange={(e) => setNewLog({ ...newLog, technician_name: e.target.value })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-polar-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
