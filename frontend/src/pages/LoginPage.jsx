import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Shield, KeyRound, User, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const presetAccounts = [
    { u: 'admin', p: 'admin123', role: 'SUPER_ADMIN', name: 'Dr. Rajesh Sharma (Director NCAOR)' },
    { u: 'ops_manager', p: 'ops123', role: 'OPERATIONS_MANAGER', name: 'Commander Vivek Nair (HQ Ops)' },
    { u: 'bharati_lead', p: 'station123', role: 'STATION_ADMIN', name: 'Dr. Ananya Sen (Bharati Leader)' },
    { u: 'scientist_lead', p: 'science123', role: 'SCIENTIFIC_USER', name: 'Dr. Priya Deshmukh (Cryosphere Sci)' }
  ];

  return (
    <div className="min-h-screen bg-polar-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Polar Visual Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111D42_1px,transparent_1px),linear-gradient(to_bottom,#111D42_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full bg-polar-950 rounded-2xl flex items-center justify-center">
              <Radio className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-widest font-mono">
            POLARIS
          </h1>
          <p className="text-xs text-cyan-300 font-semibold tracking-wider mt-0.5">
            INTELLIGENT REMOTE ANTARCTIC STATION MANAGEMENT
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            National Centre for Polar & Ocean Research (NCAOR) • MoES, Govt. of India
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-polar-900/90 border border-polar-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center space-x-2 border-b border-polar-800 pb-3 mb-4">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Secure Operations Access Portal
            </h2>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Operator ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-polar-950 border border-polar-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Security Password / Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-polar-950 border border-polar-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-extrabold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <span>{loading ? 'Authenticating Security Token...' : 'Initialize Mission Control Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets */}
          <div className="mt-5 pt-4 border-t border-polar-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              SIH Evaluator Quick-Login Roles:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {presetAccounts.map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => {
                    setUsername(acc.u);
                    setPassword(acc.p);
                  }}
                  className={`p-2 rounded-lg border text-left text-[11px] transition ${
                    username === acc.u
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                      : 'bg-polar-950/60 hover:bg-polar-800 text-slate-300 border-polar-800'
                  }`}
                >
                  <span className="font-bold block tracking-tight">{acc.role}</span>
                  <span className="text-[9px] text-slate-400 truncate block">{acc.u}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-[10px] text-slate-400 mt-4">
          POLARIS Antarctic Decision Support Platform • Smart India Hackathon 2026 Prototype
        </p>
      </div>
    </div>
  );
};
