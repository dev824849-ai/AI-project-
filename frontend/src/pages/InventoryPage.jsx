import React, { useState, useEffect } from 'react';
import { 
  Package, Fuel, Plus, Search, Filter, 
  AlertTriangle, CheckCircle2, Sparkles, TrendingDown, ArrowRight 
} from 'lucide-react';
import { inventoryService } from '../services/api';

export const InventoryPage = () => {
  const [forecastItems, setForecastItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const data = await inventoryService.getForecast();
        setForecastItems(data?.items || []);
      } catch (err) {
        console.error('Error fetching inventory forecast', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  const filtered = forecastItems.filter((it) => {
    const matchCat = categoryFilter === 'ALL' || it.category === categoryFilter;
    const matchSt = stationFilter === 'ALL' || it.station_id === stationFilter;
    return matchCat && matchSt;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              INVENTORY, FUEL & RESUPPLY FORECASTING
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              AI Depletion Modeling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Fuel, Provisions, Medical, and Critical Spares with projected depletion before polar resupply voyages.
          </p>
        </div>

        {/* Filters */}
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="FUEL">Fuel & Hydrocarbons</option>
            <option value="FOOD">Food Provisions</option>
            <option value="MEDICAL">Medical & Trauma</option>
            <option value="SPARE_PARTS">Mechanical Spares</option>
            <option value="WATER">Potable Water</option>
          </select>
        </div>
      </div>

      {/* AI Resupply Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-polar-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              AI EXPEDITION CARGO RESUPPLY RECOMMENDATION
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Based on historical winter consumption rates and 180-day resupply voyage intervals (M.V. Vasiliy Golovnin).
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-mono">
          <span className="text-purple-300 font-bold block">Next Cargo Window: Nov - Dec 2026</span>
          <span className="text-[10px] text-slate-400">NCAOR Logistics Desk</span>
        </div>
      </div>

      {/* Inventory Forecasting Table */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-polar-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Supply Item</th>
                <th className="p-3">Station</th>
                <th className="p-3">Category</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Daily Burn</th>
                <th className="p-3">Days Remaining</th>
                <th className="p-3">Projected Depletion</th>
                <th className="p-3">Resupply Needed</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800 text-slate-300">
              {filtered.map((item) => {
                const isCrit = item.status === 'CRITICAL' || item.is_shortage_before_resupply;
                return (
                  <tr key={item.id} className="hover:bg-polar-850/60 transition">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3 uppercase text-slate-400">{item.station_id}</td>
                    <td className="p-3 text-slate-400">{item.category}</td>
                    <td className="p-3 font-bold text-cyan-300">
                      {item.current_quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-3 text-slate-400">{item.daily_consumption_rate} /day</td>
                    <td className="p-3 font-bold">
                      <span className={item.days_remaining < 60 ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.days_remaining} days
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{item.depletion_date_predicted}</td>
                    <td className="p-3 text-purple-300 font-bold">
                      {item.recommended_resupply_order > 0
                        ? `+${item.recommended_resupply_order.toLocaleString()} ${item.unit}`
                        : 'Stock OK'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        item.status === 'NORMAL'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
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
