import { Sun, Clock, AlertTriangle } from 'lucide-react';
import type { PanchangamData } from '../types/astrology';

export const PanchangamViewer: React.FC<{ panchangam: PanchangamData; className?: string }> = ({
  panchangam,
  className = ''
}) => {
  const { tithi, nakshatra, yoga, karana, activeHora, rahuKalam, yamagandam } = panchangam;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Banner: Panchangam Essentials */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-amber-500/25 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Live Daily Panchangam
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white mt-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>{tithi.name} ({tithi.paksha} Paksha)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Nakshatra: <strong className="text-purple-300 font-semibold">{nakshatra.name} (Pada {nakshatra.pada})</strong> • Yoga: {yoga.name} • Karana: {karana.name}
            </p>
          </div>

          {/* Active Planetary Hora Badge */}
          <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-500/30 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">
              Active Planetary Hora
            </span>
            <span className="text-base font-bold text-amber-300 font-serif">
              {activeHora.lord} Hora
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              {activeHora.startTime} - {activeHora.endTime}
            </p>
          </div>
        </div>

        {/* Tithi Elapsed Progress */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Tithi Progress</span>
            <span className="font-mono text-amber-300">{tithi.percentagePassed}% passed</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
              style={{ width: `${tithi.percentagePassed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timing Windows Grid: Rahu Kalam & Yamagandam */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Rahu Kalam */}
        <div
          className={`p-4 rounded-xl border transition ${
            rahuKalam.isCurrent
              ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/50'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Rahu Kalam (Inauspicious Window)</span>
            </span>
            {rahuKalam.isCurrent && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                ACTIVE NOW
              </span>
            )}
          </div>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {rahuKalam.startTime} — {rahuKalam.endTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Avoid starting new business ventures, major investments, or contract signings during this span.
          </p>
        </div>

        {/* Yamagandam */}
        <div
          className={`p-4 rounded-xl border transition ${
            yamagandam.isCurrent
              ? 'bg-amber-950/40 border-amber-500/50'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Yamagandam Window</span>
            </span>
            {yamagandam.isCurrent && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                ACTIVE NOW
              </span>
            )}
          </div>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {yamagandam.startTime} — {yamagandam.endTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Traditional period ruled by Yama; recommended for spiritual contemplation rather than departures.
          </p>
        </div>
      </div>
    </div>
  );
};
