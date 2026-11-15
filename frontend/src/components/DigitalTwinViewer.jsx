import React, { useState } from 'react';
import { 
  Zap, FlaskConical, Radio, Droplets, Home, Fuel, 
  Server, ShieldAlert, CheckCircle2, ChevronRight, Activity, Wrench, X
} from 'lucide-react';

export const DigitalTwinViewer = ({ digitalTwinData, onAction }) => {
  const [selectedModule, setSelectedModule] = useState(null);

  if (!digitalTwinData) {
    return (
      <div className="p-8 text-center text-slate-400 bg-polar-900 rounded-xl border border-polar-800">
        Loading station digital twin telemetry models...
      </div>
    );
  }

  const { station_name, modules, blueprint_version, station_health } = digitalTwinData;

  const iconMap = {
    POWER: Zap,
    RESEARCH: FlaskConical,
    COMMS: Radio,
    WATER: Droplets,
    HABITAT: Home,
    FUEL: Fuel,
    IT_INFRA: Server,
  };

  return (
    <div className="bg-polar-900 border border-polar-800 rounded-xl p-4 md:p-6 shadow-xl relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-polar-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-wide font-mono">
              DIGITAL TWIN: {station_name.toUpperCase()}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              CAD-BIM 2.5D
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive Subsystem Hierarchy & Telemetry Sensors • Blueprint {blueprint_version}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-polar-950 px-3 py-1.5 rounded-lg border border-polar-800">
            <span className="text-slate-400">STATION INTEGRITY:</span>
            <span className={`font-bold ${station_health > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {station_health}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Subsystem 2.5D Schematic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mb-4">
        {modules?.map((mod) => {
          const Icon = iconMap[mod.subsystem] || Zap;
          const isWarning = mod.status === 'WARNING';
          const isCritical = mod.status === 'CRITICAL';
          const isSelected = selectedModule?.id === mod.id;

          let cardBorder = 'border-polar-800 hover:border-slate-500';
          let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          let pulseClass = '';

          if (isCritical) {
            cardBorder = 'border-rose-500 shadow-lg shadow-rose-900/30';
            badgeColor = 'bg-rose-500/25 text-rose-300 border-rose-500 animate-pulse';
            pulseClass = 'animate-ping';
          } else if (isWarning) {
            cardBorder = 'border-amber-500 shadow-md shadow-amber-900/20';
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
          }

          return (
            <div
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`p-3.5 rounded-xl border bg-polar-850 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 ${cardBorder} ${
                isSelected ? 'ring-2 ring-cyan-400 bg-polar-800' : ''
              }`}
            >
              {/* Card top */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${
                    isCritical ? 'bg-rose-500/20 text-rose-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white tracking-tight">{mod.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{mod.type}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badgeColor}`}>
                  {mod.status}
                </span>
              </div>

              {/* Mini telemetry stats */}
              <div className="bg-polar-950/80 p-2 rounded-lg border border-polar-800/80 text-[11px] font-mono space-y-1 mb-2">
                {Object.entries(mod.live_telemetry || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 capitalize">{k.replace('_', ' ')}:</span>
                    <span className="font-semibold text-cyan-300">{v}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Health: <strong className="text-slate-200">{mod.health_score}%</strong></span>
                <span className="text-cyan-400 flex items-center font-medium">
                  Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal/Drawer for Selected Module */}
      {selectedModule && (
        <div className="mt-4 p-4 rounded-xl bg-polar-950 border border-cyan-500/40 shadow-2xl relative animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedModule(null)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-polar-850 hover:bg-polar-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-mono">{selectedModule.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-polar-800 text-cyan-300 border border-polar-700">
                  ID: {selectedModule.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Subsystem: {selectedModule.subsystem} • Structure: {selectedModule.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            <div className="p-3 rounded-lg bg-polar-900 border border-polar-800">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Connected Equipment</h5>
              <ul className="space-y-1">
                {selectedModule.primary_equipment?.map((eq, i) => (
                  <li key={i} className="flex items-center space-x-1.5 text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{eq}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-polar-900 border border-polar-800">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live SCADA Sensors</h5>
              <div className="space-y-1.5 font-mono text-[11px]">
                {Object.entries(selectedModule.live_telemetry || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-emerald-400 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-polar-900 border border-polar-800">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Subsystem Action</h5>
              <p className="text-[11px] text-slate-300 mb-2">
                Simulate remote diagnostic sweep or maintenance ticket.
              </p>
              <button
                onClick={() => onAction && onAction(selectedModule)}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs flex items-center justify-center space-x-1 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Execute Diagnostic / Action</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
