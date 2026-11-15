import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, HeartPulse, UserCheck, Search, Filter, 
  MapPin, Activity, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { personnelService } from '../services/api';

export const PersonnelPage = () => {
  const [crew, setCrew] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const [crewData, sumData] = await Promise.all([
          personnelService.getPersonnel(),
          personnelService.getRosterSummary()
        ]);
        setCrew(crewData || []);
        setSummary(sumData);
      } catch (err) {
        console.error('Error fetching personnel', err);
      }
    };
    fetchPersonnel();
  }, []);

  const filtered = crew.filter((p) => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase());
    const matchSt = stationFilter === 'ALL' || p.station_id === stationFilter;
    const matchDept = deptFilter === 'ALL' || p.department === deptFilter;
    return matchSearch && matchSt && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              EXPEDITION PERSONNEL & ROSTER MANAGEMENT
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              44th IAE Winter Team
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active expedition crew, duty shifts, medical status, and emergency muster assignments across Antarctic bases.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search crew..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-polar-900 border border-polar-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Stations</option>
            <option value="bharati">Bharati Station</option>
            <option value="maitri">Maitri Station</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Science">Science & Research</option>
            <option value="Engineering">Power & Mechanics</option>
            <option value="Medical">Medical Bay</option>
            <option value="Operations">Communications & Ops</option>
          </select>
        </div>
      </div>

      {/* Roster KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">TOTAL DEPLOYED CREW</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{summary?.total_deployed || 46} Personnel</p>
          <span className="text-[10px] text-emerald-400">100% Accounted & Safe</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">BHARATI STATION ROSTER</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">{summary?.bharati?.total || 22} Crew</p>
          <span className="text-[10px] text-slate-400">Leader: Dr. Ananya Sen</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">MAITRI STATION ROSTER</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">{summary?.maitri?.total || 24} Crew</p>
          <span className="text-[10px] text-slate-400">Leader: Er. Sunil Rawat</span>
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-polar-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Personnel ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Station</th>
                <th className="p-3">Role & Designation</th>
                <th className="p-3">Department</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Shift Status</th>
                <th className="p-3">Emergency Role</th>
                <th className="p-3">Medical / Blood</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800 text-slate-300">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-polar-850/60 transition">
                  <td className="p-3 font-bold text-cyan-300">{p.id}</td>
                  <td className="p-3 font-semibold text-white">{p.full_name}</td>
                  <td className="p-3 uppercase text-slate-400">{p.station_id}</td>
                  <td className="p-3 text-slate-200">{p.role}</td>
                  <td className="p-3 text-slate-400">{p.department}</td>
                  <td className="p-3 text-slate-400">{p.organization}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {p.shift_status}
                    </span>
                  </td>
                  <td className="p-3 text-amber-300">{p.emergency_role}</td>
                  <td className="p-3 text-slate-400">{p.blood_group} • SAFE</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
