import React from 'react';
import { AlertCircle, Activity, ShieldCheck } from 'lucide-react';

export const SimulatedBanner = () => {
  return (
    <div className="bg-polar-900 border-b border-polar-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
          SIMULATED TELEMETRY MODE
        </span>
        <span className="hidden md:inline text-slate-400">
          Operational research demo for Smart India Hackathon 2026. Live data simulated via high-fidelity Antarctic physics & ML models.
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[11px]">SATCOM UPLINK: OK</span>
        </span>
        <span className="hidden sm:inline font-mono text-[11px] text-cyan-400">
          NCAOR-POLARIS v1.0
        </span>
      </div>
    </div>
  );
};
