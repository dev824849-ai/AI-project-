import React, { useState, useEffect } from 'react';
import { 
  Wrench, BrainCircuit, Activity, AlertTriangle, 
  CheckCircle2, ArrowRight, ShieldAlert, Cpu, Sparkles 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line 
} from 'recharts';
import { equipmentService, aiInsightService } from '../services/api';

export const PredictiveMaintenancePage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eq, ins] = await Promise.all([
          equipmentService.getEquipment(),
          aiInsightService.getInsights()
        ]);
        setEquipmentList(eq || []);
        setAiInsights(ins || []);
      } catch (err) {
        console.error('Error loading predictive maintenance data', err);
      }
    };
    fetchData();
  }, []);

  const degradationCurve = [
    { hour: '0h (Baseline)', health: 100, vibration: 1.4 },
    { hour: '1000h', health: 96, vibration: 1.5 },
    { hour: '2000h', health: 92, vibration: 1.7 },
    { hour: '3000h', health: 87, vibration: 1.9 },
    { hour: '4000h', health: 80, vibration: 2.3 },
    { hour: '5000h (Predicted)', health: 65, vibration: 3.4 },
    { hour: '6000h (Failure Risk)', health: 35, vibration: 5.2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              AI PREDICTIVE MAINTENANCE & FAILURE RISK MATRIX
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
              Scikit-Learn ML Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Unsupervised Isolation Forest + Random Forest Failure Risk Classification & RUL (Remaining Useful Life) Forecasting.
          </p>
        </div>
      </div>

      {/* Top AI Model Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">ANOMALY DETECTION MODEL</span>
          </div>
          <p className="text-base font-bold text-white">Isolation Forest (100 Trees)</p>
          <span className="text-[10px] text-slate-400">Contamination: 0.06 • F1-Score: 0.98</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center space-x-2 text-purple-400 mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span className="text-xs font-bold">FAILURE RISK CLASSIFIER</span>
          </div>
          <p className="text-base font-bold text-white">Random Forest (120 Estimators)</p>
          <span className="text-[10px] text-slate-400">Classes: Normal, Warning, Critical</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold">RUL PROJECTION ENGINE</span>
          </div>
          <p className="text-base font-bold text-white">Physics-Informed Degradation</p>
          <span className="text-[10px] text-slate-400">Thermal + Harmonic Wear Velocity</span>
        </div>
      </div>

      {/* RUL Degradation Chart */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Equipment Wear & RUL Degradation Projection Curve
          </h3>
          <span className="text-xs text-cyan-300 font-mono">
            Model: Exponential Bearing Wear
          </span>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={degradationCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="health" name="Asset Health Score (%)" stroke="#10B981" strokeWidth={2.5} />
              <Line type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#F87171" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Equipment Risk Ranking Table */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          Antarctic Critical Assets: Failure Risk Ranking
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-polar-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Station</th>
                <th className="p-3">Health</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Est. RUL</th>
                <th className="p-3">AI Root Cause & Diagnostic</th>
                <th className="p-3">Recommended Work Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800 text-slate-300">
              {equipmentList.map((eq) => {
                const isCrit = eq.failure_risk === 'CRITICAL' || eq.failure_risk === 'HIGH';
                return (
                  <tr key={eq.id} className="hover:bg-polar-850/60 transition">
                    <td className="p-3 font-bold text-white">{eq.name}</td>
                    <td className="p-3 uppercase text-slate-400">{eq.station_id}</td>
                    <td className="p-3">
                      <span className={`font-bold ${eq.health_score > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {eq.health_score}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        eq.failure_risk === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : eq.failure_risk === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300 animate-pulse'
                      }`}>
                        {eq.failure_risk}
                      </span>
                    </td>
                    <td className="p-3 text-cyan-300 font-bold">{eq.predicted_rul_hours.toFixed(0)} hrs</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {eq.anomaly_reason || 'Nominal thermal dissipation.'}
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">
                      {eq.recommended_action || 'Routine inspection.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
