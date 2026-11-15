import React, { useState } from 'react';
import { useDemoScenario } from '../contexts/DemoScenarioContext';
import { Play, Sparkles, AlertTriangle, Wind, Fuel, WifiOff, Box, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const DemoScenarioBar = () => {
  const { currentScenario, activateScenario, loading, activeMessage } = useDemoScenario();
  const [isOpen, setIsOpen] = useState(false);

  const scenarios = [
    {
      key: 'NORMAL',
      label: '1. Normal Baseline',
      icon: CheckCircle2,
      color: 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10',
      activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
      description: 'Nominal telemetry, 70°C generator, 18kt winds, full comms.'
    },
    {
      key: 'GENERATOR_FAILURE_RISK',
      label: '2. Generator Thermal Risk (SIH Core Flow)',
      icon: AlertTriangle,
      color: 'text-rose-400 border-rose-500/40 hover:bg-rose-500/10',
      activeBg: 'bg-rose-500/25 text-rose-300 border-rose-400 shadow-lg shadow-rose-900/30',
      description: 'Bharati Gen temp surges 70°C -> 89°C, ML anomaly fires, AI recommends load switch.'
    },
    {
      key: 'EXTREME_WEATHER',
      label: '3. Extreme Katabatic Blizzard',
      icon: Wind,
      color: 'text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10',
      activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
      description: 'Wind spikes to 68kt gale, visibility drops <1km, radio degraded.'
    },
    {
      key: 'FUEL_SHORTAGE',
      label: '4. Critical Fuel Depletion',
      icon: Fuel,
      color: 'text-amber-400 border-amber-500/40 hover:bg-amber-500/10',
      activeBg: 'bg-amber-500/20 text-amber-300 border-amber-400',
      description: 'Station fuel level drops to 14.5%, depletion projected before next supply ship.'
    },
    {
      key: 'COMMS_FAILURE',
      label: '5. Satellite Blackout',
      icon: WifiOff,
      color: 'text-purple-400 border-purple-500/40 hover:bg-purple-500/10',
      activeBg: 'bg-purple-500/20 text-purple-300 border-purple-400',
      description: 'Full satellite link loss, triggers autonomous fail-safe and local logging mode.'
    },
    {
      key: 'INVENTORY_DEPLETION',
      label: '6. Medical / Spares Shortage',
      icon: Box,
      color: 'text-blue-400 border-blue-500/40 hover:bg-blue-500/10',
      activeBg: 'bg-blue-500/20 text-blue-300 border-blue-400',
      description: 'Critical parts run low, AI calculates required resupply cargo manifest.'
    }
  ];

  return (
    <div className="bg-polar-900/95 border-b border-polar-800 text-xs backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Active notification toast */}
      {activeMessage && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/30 px-4 py-2 flex items-center justify-between text-cyan-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-medium text-xs tracking-wide">{activeMessage}</span>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-mono">LIVE AI EVALUATION ACTIVE</span>
        </div>
      )}

      {/* Presentation Bar Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold tracking-wider text-[10px]">
            <Play className="w-3 h-3 fill-cyan-400" />
            <span>SIH 2026 DEMO CONTROLLER</span>
          </div>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Trigger simulated operational scenarios for judges:
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-700 text-slate-300 hover:text-white transition text-xs font-mono"
        >
          <span>{isOpen ? 'Hide Scenario Selector' : 'Scenario Controller'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Scenario Buttons */}
      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-polar-800/60 bg-polar-950/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isActive = currentScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  disabled={loading}
                  onClick={() => activateScenario(sc.key)}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 ${
                    isActive
                      ? sc.activeBg
                      : `bg-polar-850/80 hover:border-slate-500 text-slate-300 ${sc.color}`
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                    <span className="font-semibold text-xs tracking-tight">{sc.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
