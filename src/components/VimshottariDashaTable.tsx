import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle } from 'lucide-react';
import type { DashaReport, Mahadasha } from '../types/astrology';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉ Sun',
  Moon: '☽ Moon',
  Mars: '♂ Mars',
  Mercury: '☿ Mercury',
  Jupiter: '♃ Jupiter',
  Venus: '♀ Venus',
  Saturn: '♄ Saturn',
  Rahu: '☊ Rahu',
  Ketu: '☋ Ketu'
};

const PLANET_COLORS: Record<string, string> = {
  Sun: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Moon: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  Mars: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Mercury: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Jupiter: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
  Venus: 'text-pink-300 bg-pink-500/10 border-pink-500/20',
  Saturn: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
  Rahu: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
  Ketu: 'text-slate-400 bg-slate-700/20 border-slate-600/30'
};

export const VimshottariDashaTable: React.FC<{
  dashaReport: DashaReport;
  className?: string;
}> = ({ dashaReport, className = '' }) => {
  const [expandedLord, setExpandedLord] = useState<string | null>(
    dashaReport.currentMahadasha ? dashaReport.currentMahadasha.lord : null
  );

  const { currentMahadasha, timeline, nakshatra, pada, balanceYears } = dashaReport;

  // Find active Antardasha in current Mahadasha
  const currentAntardasha = currentMahadasha?.antardashas?.find((a) => a.isCurrent);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Current Active Dasha Spotlight Card */}
      {currentMahadasha && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle cosmic accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Active Mahadasha
                </span>
                <span className="text-xs text-slate-400">
                  Birth Nakshatra: <strong className="text-slate-200">{nakshatra} (Pada {pada})</strong>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide mt-1.5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{currentMahadasha.lord} Mahadasha</span>
                <span className="text-sm font-normal text-slate-400 font-sans">
                  ({currentMahadasha.totalYears} Years)
                </span>
              </h3>

              {currentAntardasha && (
                <p className="text-xs sm:text-sm text-purple-200 mt-1">
                  Current Sub-Period (Antardasha):{' '}
                  <strong className="text-amber-300 font-semibold">
                    {currentMahadasha.lord} / {currentAntardasha.lord}
                  </strong>{' '}
                  <span className="text-slate-400">
                    ({currentAntardasha.startDate} to {currentAntardasha.endDate})
                  </span>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Full Dasha Span
              </span>
              <p className="text-xs sm:text-sm font-mono text-slate-200 font-semibold mt-0.5">
                {currentMahadasha.startDate} → {currentMahadasha.endDate}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Birth Balance: {balanceYears}y of starting ruler
              </p>
            </div>
          </div>

          {/* Progress bar of current Mahadasha */}
          <div className="mt-3.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Mahadasha Progress</span>
              <span className="font-mono text-amber-300 font-semibold">
                {currentMahadasha.percentagePassed || 0}% elapsed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${currentMahadasha.percentagePassed || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Full 120-Year Mahadasha Timeline Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Vimshottari Dasha Sequence (120 Years)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Click row to view Antardashas (Bhuktis)
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {timeline.map((md: Mahadasha) => {
            const isExpanded = expandedLord === md.lord;
            const now = Date.now();
            const endMs = new Date(md.endDate).getTime();
            const isPast = now >= endMs;
            const planetColor = PLANET_COLORS[md.lord] || 'text-slate-200 bg-slate-800 border-slate-700';

            return (
              <div key={md.lord} className="transition-colors">
                {/* Mahadasha Row */}
                <button
                  type="button"
                  onClick={() => setExpandedLord(isExpanded ? null : md.lord)}
                  className={`w-full text-left px-3.5 sm:px-4 py-3 transition flex items-center justify-between gap-2 ${
                    md.isCurrent
                      ? 'bg-purple-950/40 hover:bg-purple-950/60'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 flex-shrink-0 ${planetColor}`}
                    >
                      {PLANET_SYMBOLS[md.lord] || md.lord}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {md.lord} Mahadasha
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({md.totalYears}y)
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                        {md.startDate} to {md.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {md.isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Active Now
                      </span>
                    ) : isPast ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 hidden sm:inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-slate-500" /> Completed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/40 text-slate-400 hidden sm:inline">
                        Upcoming
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Sub-Period (Antardasha) Accordion Details */}
                <AnimatePresence>
                  {isExpanded && md.antardashas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3.5 sm:px-6 py-2.5 bg-slate-950/70 border-t border-slate-800/60 overflow-hidden"
                    >
                      <div className="py-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 block mb-2">
                          9 Antardashas (Sub-Periods) within {md.lord} Mahadasha:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {md.antardashas.map((ad) => (
                            <div
                              key={ad.lord}
                              className={`p-2 rounded-xl text-xs border transition ${
                                ad.isCurrent
                                  ? 'bg-purple-900/40 border-purple-500/50 text-white shadow-sm'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold text-amber-300">
                                  {md.lord} - {ad.lord}
                                </span>
                                {ad.isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-200">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {ad.startDate} → {ad.endDate}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
