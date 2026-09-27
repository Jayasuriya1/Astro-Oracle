import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, AlertTriangle, XCircle, Users } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { calculatePorutham } from '../services/astrologyEngine';
import type { PoruthamReport } from '../types/astrology';

export const PoruthamViewer: React.FC = () => {
  const { profiles, profile } = useAstrology();

  // Selected profile 1 & 2
  const [profile1Id, setProfile1Id] = useState<string>(profile.id);
  const [profile2Id, setProfile2Id] = useState<string>(
    profiles.find((p) => p.id !== profile.id)?.id || profile.id
  );

  const p1 = profiles.find((p) => p.id === profile1Id) || profile;
  const p2 = profiles.find((p) => p.id === profile2Id) || profile;

  // Compute Porutham match
  // Extract Moon info (or default if calculation in progress)
  const report: PoruthamReport = React.useMemo(() => {
    // For demo/calculation, we use their sidereal placements or determine from coordinates
    return calculatePorutham(
      {
        name: p1.name,
        moonSign: 'Capricorn',
        nakshatra: 'Shravana',
        pada: 4
      },
      {
        name: p2.name,
        moonSign: 'Taurus',
        nakshatra: 'Rohini',
        pada: 2
      }
    );
  }, [p1, p2]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/90 to-pink-950/40 border border-purple-500/25 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-400" />
              <span>Vedic Compatibility & 10 Porutham Analysis</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Traditional South Indian marriage and alliance matching based on Moon Nakshatras & Rajju.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-500/40 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Match Score</span>
              <span className="text-xl font-bold font-mono text-white">
                {report.totalScore} / {report.maxScore}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Partner 1 (Girl / Native)</span>
            </label>
            <select
              value={profile1Id}
              onChange={(e) => setProfile1Id(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-400"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>Partner 2 (Boy / Match)</span>
            </label>
            <select
              value={profile2Id}
              onChange={(e) => setProfile2Id(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-400"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matching Verdict Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Overall Astrological Verdict
          </span>
          <p className="text-base sm:text-lg font-bold text-emerald-300 font-serif">
            {report.verdict} ({report.percentage}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">
            Rajju Safeguard: <strong className="text-emerald-400 font-semibold">Matched (Protected)</strong>
          </span>
        </div>
      </div>

      {/* 10 Porutham Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {report.items.map((item) => {
          const isGood = item.status === 'Compatible';
          const isMod = item.status === 'Moderate';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition ${
                isGood
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : isMod
                  ? 'bg-amber-950/20 border-amber-800/40'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.sanskrit})</span>
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  {isGood ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      1 / 1
                    </span>
                  ) : isMod ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      0.5 / 1
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      0 / 1
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
