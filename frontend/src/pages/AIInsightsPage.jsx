import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Sparkles, AlertTriangle, ShieldCheck, 
  Activity, ArrowRight, CheckCircle2, ChevronRight, Zap 
} from 'lucide-react';
import { aiInsightService } from '../services/api';

export const AIInsightsPage = () => {
  const [matrixData, setMatrixData] = useState(null);
  const [stationFilter, setStationFilter] = useState('ALL');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await aiInsightService.getDiagnosticMatrix();
        setMatrixData(data);
      } catch (err) {
        console.error('Error fetching AI diagnostic matrix', err);
      }
    };
    fetchInsights();
    const interval = setInterval(fetchInsights, 5000);
    return () => clearInterval(interval);
  }, []);

  const insights = matrixData?.active_ai_insights || [];
  const filtered = insights.filter((i) => stationFilter === 'ALL' || i.station_id === stationFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              AI DECISION-SUPPORT & ANOMALY INTELLIGENCE
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40 font-mono">
              Decision Support System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine-Learning prescriptive recommendations explaining <strong>WHAT happened</strong>, <strong>WHY it matters</strong>, and <strong>WHAT action to take</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Stations</option>
            <option value="bharati">Bharati Station</option>
            <option value="maitri">Maitri Station</option>
          </select>
        </div>
      </div>

      {/* Decision-Support Intelligence Cards */}
      <div className="space-y-4">
        {filtered.map((item, index) => {
          const isCrit = item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';
          return (
            <div
              key={item.id || index}
              className={`p-5 rounded-2xl bg-polar-900 border transition shadow-xl font-mono space-y-4 ${
                isCrit
                  ? 'border-rose-500/70 shadow-rose-950/30'
                  : 'border-polar-800 hover:border-purple-500/50'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${isCrit ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-300'}`}>
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 uppercase">
                      STATION: {item.station_id} • SUBSYSTEM: {item.subsystem || 'POWER'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Confidence: <strong className="text-cyan-300">{item.confidence_pct}%</strong></span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {item.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* 3-Part Decision Support Anatomy: What Happened / Why It Matters / Recommended Protocol */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-polar-950 rounded-xl border border-polar-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    1. WHAT HAPPENED (ANOMALY OBSERVATION):
                  </span>
                  <p className="text-slate-200">{item.what_happened}</p>
                </div>

                <div className="p-3.5 bg-polar-950 rounded-xl border border-polar-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    2. WHY IT MATTERS (RISK IMPACT):
                  </span>
                  <p className="text-slate-200">{item.why_it_matters}</p>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 bg-polar-950 rounded-xl border border-purple-500/40 text-xs space-y-1.5 text-cyan-200">
                <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold block">
                  3. RECOMMENDED ACTION PROTOCOL (OPERATOR DECISION GUIDANCE):
                </span>
                <p className="whitespace-pre-line text-slate-100 font-semibold">{item.recommended_action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
