import React, { useState, useEffect } from 'react';
import { 
  CloudSnow, Wind, Compass, Thermometer, Eye, 
  Sun, AlertTriangle, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line 
} from 'recharts';
import { weatherService } from '../services/api';

export const WeatherPage = () => {
  const [stationId, setStationId] = useState('bharati');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [curr, hist] = await Promise.all([
          weatherService.getCurrent(stationId),
          weatherService.getHistory(stationId)
        ]);
        setCurrentWeather(curr);
        setWeatherHistory(hist?.past_24h || []);
      } catch (err) {
        console.error('Error fetching weather data', err);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 4000);
    return () => clearInterval(interval);
  }, [stationId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              POLAR WEATHER & BLIZZARD RADAR
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              IMD Polar Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Antarctic meteorological tracking, Katabatic wind gale advisories, and barometric depression forecasting.
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

      {/* Blizzard Warning Banner if high winds */}
      {currentWeather?.is_blizzard_warning && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 shadow-xl flex items-center justify-between text-rose-200 animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                SEVERE KATABATIC BLIZZARD GALE ADVISORY ACTIVE
              </h3>
              <p className="text-xs text-rose-200">
                Sustained winds exceeding 40 knots. Exterior station egress strictly prohibited. Guide ropes electrified.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-rose-500 text-white font-mono font-bold text-xs">
            CONDITION 1 LOCKDOWN
          </span>
        </div>
      )}

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentWeather?.temperature_c || -22.4}°C</p>
          <span className="text-[10px] text-cyan-300">Wind Chill: {currentWeather?.feels_like_c || -36.2}°C</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">WIND VELOCITY</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">{currentWeather?.wind_speed_knots || 16.8} kts</p>
          <span className="text-[10px] text-slate-400">Direction: {currentWeather?.wind_direction || 'ESE'}</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">BAROMETRIC PRESSURE</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">{currentWeather?.pressure_hpa || 986.5} hPa</p>
          <span className="text-[10px] text-slate-400">Atmospheric Stability: Normal</span>
        </div>

        <div className="p-4 rounded-xl bg-polar-900 border border-polar-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">VISIBILITY RANGE</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-300">{currentWeather?.visibility_km || 20} km</p>
          <span className="text-[10px] text-slate-400">{currentWeather?.condition || 'Polar Clear'}</span>
        </div>
      </div>

      {/* 24-Hour Weather Trend Chart */}
      <div className="bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          24-Hour Atmospheric Temperature & Wind Speed Trend
        </h3>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weatherHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#3A506B', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature_c" name="Ambient Temp (°C)" stroke="#00F0FF" strokeWidth={2.5} />
              <Line type="monotone" dataKey="wind_speed_knots" name="Wind Speed (knots)" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
