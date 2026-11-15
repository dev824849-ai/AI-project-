import React, { useState, useEffect } from 'react';
import { DigitalTwinViewer } from '../components/DigitalTwinViewer';
import { digitalTwinService } from '../services/api';
import { Box, Wrench, ShieldAlert } from 'lucide-react';
import { RemoteActionModal } from '../components/RemoteActionModal';

export const DigitalTwinPage = () => {
  const [stationId, setStationId] = useState('bharati');
  const [modelData, setModelData] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [targetEquipment, setTargetEquipment] = useState('EQ-BH-GEN-01');

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await digitalTwinService.getModel(stationId);
        setModelData(data);
      } catch (err) {
        console.error('Error fetching digital twin model', err);
      }
    };
    fetchModel();
  }, [stationId]);

  const handleInspectAction = (module) => {
    if (module.subsystem === 'POWER') {
      setTargetEquipment(stationId === 'bharati' ? 'EQ-BH-GEN-01' : 'EQ-MT-GEN-01');
    }
    setIsActionOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              STATION DIGITAL TWIN & SUBSYSTEM TOPOLOGY
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              2.5D CAD-BIM Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual structural digital twin representing Generator Rooms, Clean Laboratories, Comms Radome, Habitat Living Quarters, and Fuel Depots.
          </p>
        </div>

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
      </div>

      <DigitalTwinViewer
        digitalTwinData={modelData}
        onAction={handleInspectAction}
      />

      <RemoteActionModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        stationId={stationId}
        targetEquipmentId={targetEquipment}
      />
    </div>
  );
};
