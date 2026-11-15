import React from 'react';

export const StatCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  status = 'NORMAL',
  trend = null,
  trendLabel = '',
  footer = null,
}) => {
  const statusStyles = {
    NORMAL: {
      border: 'border-polar-800',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      valColor: 'text-white'
    },
    WARNING: {
      border: 'border-amber-500/60 shadow-lg shadow-amber-950/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
      iconBg: 'bg-amber-500/20 text-amber-400',
      valColor: 'text-amber-200'
    },
    CRITICAL: {
      border: 'border-rose-500 shadow-xl shadow-rose-950/40',
      badge: 'bg-rose-500/25 text-rose-300 border-rose-500 animate-pulse',
      iconBg: 'bg-rose-500/20 text-rose-400',
      valColor: 'text-rose-200'
    },
  };

  const style = statusStyles[status] || statusStyles.NORMAL;

  return (
    <div className={`p-4 rounded-xl bg-polar-850 border ${style.border} flex flex-col justify-between transition-all duration-200 shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className={`p-2 rounded-lg ${style.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
            {title}
          </span>
        </div>
        {status !== 'NORMAL' && (
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${style.badge}`}>
            {status}
          </span>
        )}
      </div>

      <div className="my-1.5 flex items-baseline space-x-1.5 font-mono">
        <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${style.valColor}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>

      {(subtitle || trend !== null) && (
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
          {subtitle && <span>{subtitle}</span>}
          {trend !== null && (
            <span className={`font-mono text-[11px] font-bold ${trend > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {trend > 0 ? `+${trend}` : trend} {trendLabel}
            </span>
          )}
        </div>
      )}

      {footer && <div className="mt-2 pt-2 border-t border-polar-800 text-xs">{footer}</div>}
    </div>
  );
};
