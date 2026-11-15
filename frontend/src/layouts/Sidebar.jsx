import React from 'react';
import { 
  LayoutDashboard, MapPin, Activity, Cpu, Wrench, 
  Zap, Package, Users, CloudSnow, Bell, AlertOctagon, 
  MessageSquare, Box, BarChart3, BrainCircuit, Settings 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = ({ activePage, onNavigate }) => {
  const { user } = useAuth();
  const isScientist = user?.role === 'SCIENTIFIC_USER';

  const navSections = [
    {
      title: 'COMMAND & CONTROL',
      items: [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
        { id: 'stations', label: 'Antarctic Stations', icon: MapPin },
        { id: 'live-monitoring', label: 'Live Telemetry Stream', icon: Activity },
        { id: 'digital-twin', label: 'Station Digital Twin', icon: Box },
      ]
    },
    {
      title: 'AI & PREDICTIVE ANALYTICS',
      items: [
        { id: 'ai-insights', label: 'AI Decision Insights', icon: BrainCircuit, highlight: true },
        { id: 'predictive-maintenance', label: 'Predictive Maintenance', icon: Wrench },
        { id: 'analytics', label: 'Historical Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'STATION OPERATIONS',
      items: [
        { id: 'energy', label: 'Energy & Microgrid', icon: Zap },
        { id: 'equipment', label: 'Equipment Registry', icon: Cpu },
        { id: 'inventory', label: 'Inventory & Fuel Forecast', icon: Package },
        { id: 'personnel', label: 'Expedition Personnel', icon: Users },
        { id: 'weather', label: 'Polar Weather & Radar', icon: CloudSnow },
      ]
    },
    {
      title: 'CRITICAL RESPONSE',
      items: [
        { id: 'alerts', label: 'Prioritized Alerts', icon: Bell },
        { id: 'incidents', label: 'Emergency Incidents', icon: AlertOctagon, alertHighlight: true },
        { id: 'communication', label: 'Secure Comms Hub', icon: MessageSquare },
        { id: 'settings', label: 'Settings & Audit Log', icon: Settings, hideForScientist: true },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-polar-900 border-r border-polar-800 flex flex-col justify-between shrink-0 select-none overflow-y-auto min-h-[calc(100vh-80px)]">
      <div className="p-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-extrabold font-mono tracking-wider text-slate-400 uppercase mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items
                .filter((item) => !(isScientist && item.hideForScientist))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-polar-850'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          AI
                        </span>
                      )}
                      {item.alertHighlight && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Station Connection Badge at bottom of sidebar */}
      <div className="p-3 border-t border-polar-800 bg-polar-950/60 m-2 rounded-xl text-xs font-mono">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-[10px]">STATIONS CONNECTED</span>
          <span className="text-emerald-400 font-bold text-[10px]">2 ONLINE</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span>BHARATI</span>
            <span className="text-emerald-400">96.5% HP</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>MAITRI</span>
            <span className="text-emerald-400">92.0% HP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
