import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, RefreshCw, Layers } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Rahu: '☊',
  Ketu: '☋'
};

const SIGN_COLORS: Record<string, string> = {
  Aries: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Leo: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Sagittarius: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Taurus: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Virgo: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  Capricorn: 'text-green-400 bg-green-500/10 border-green-500/20',
  Gemini: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Libra: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Aquarius: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Cancer: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Scorpio: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Pisces: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

export const ChartViewer: React.FC<{ defaultSubTab?: 'western' | 'vedic' | 'transits' }> = ({
  defaultSubTab = 'vedic'
}) => {
  const { astrologyData, isCalculating, recalculate, profile } = useAstrology();
  const [subTab, setSubTab] = useState<'vedic' | 'western' | 'transits'>(defaultSubTab);

  if (isCalculating || !astrologyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm text-slate-300">Calculating planetary positions via Swiss Ephemeris WASM...</p>
      </div>
    );
  }

  const { tropicalChart, siderealChart, transits } = astrologyData;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Astronomical Placements for {profile.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Born: {profile.birthDate} at {profile.birthTime} • Coordinates: {profile.birthCoordinates.latitude.toFixed(2)}°N, {profile.birthCoordinates.longitude.toFixed(2)}°E
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setSubTab('vedic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                subTab === 'vedic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vedic (Sidereal Lahiri)
            </button>
            <button
              onClick={() => setSubTab('western')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                subTab === 'western'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Western (Tropical)
            </button>
            <button
              onClick={() => setSubTab('transits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                subTab === 'transits'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Transits
            </button>
          </div>

          <button
            onClick={recalculate}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Recalculate with current moments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VEDIC CHART VIEW */}
      {subTab === 'vedic' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Vedic Milestones Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Lagna (Ascendant)</span>
              <p className="text-lg font-bold text-amber-300 font-serif mt-1">
                {siderealChart.lagna.sign}
              </p>
              <p className="text-xs text-slate-400">
                {siderealChart.lagna.formattedDegree} • {siderealChart.lagna.nakshatra} (Pada {siderealChart.lagna.pada})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Chandra Rasi (Moon Sign)</span>
              {(() => {
                const moon = siderealChart.planets.find(p => p.name === 'Moon');
                return (
                  <>
                    <p className="text-lg font-bold text-cyan-300 font-serif mt-1">
                      {moon?.sign || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {moon?.formattedDegree} • {moon?.nakshatra} (Pada {moon?.nakshatraPada}) • Lord: {moon?.nakshatraLord}
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Ayanamsa</span>
              <p className="text-lg font-bold text-purple-300 font-serif mt-1">
                Chitra Paksha (Lahiri)
              </p>
              <p className="text-xs text-slate-400">
                Offset: {siderealChart.ayanamsaValue.toFixed(4)}° • Whole Sign Houses
              </p>
            </div>
          </div>

          {/* Planetary Placements Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Navagrahas & Celestial Positions (Lahiri Sidereal)
              </span>
              <span className="text-xs text-slate-400">
                Used by AI for Timing, Dasha & House Analysis
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Planet</th>
                    <th className="py-3 px-4">Sign</th>
                    <th className="py-3 px-4">Exact Degrees</th>
                    <th className="py-3 px-4">House (Bhava)</th>
                    <th className="py-3 px-4">Nakshatra & Pada</th>
                    <th className="py-3 px-4">Star Lord</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {siderealChart.planets.map((planet) => {
                    const badgeClass = SIGN_COLORS[planet.sign] || 'text-slate-300 bg-slate-800';
                    return (
                      <tr key={planet.name} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <span className="text-base text-amber-300 font-mono">
                            {PLANET_SYMBOLS[planet.name] || '•'}
                          </span>
                          {planet.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${badgeClass}`}>
                            {planet.sign}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {planet.formattedDegree} ({planet.longitude.toFixed(2)}°)
                        </td>
                        <td className="py-3 px-4 font-medium text-purple-300">
                          House {planet.house}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {planet.nakshatra} <span className="text-amber-400">(Pada {planet.nakshatraPada})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {planet.nakshatraLord}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {planet.isRetrograde ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              ℞ RETRO
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Direct</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* WESTERN CHART VIEW */}
      {subTab === 'western' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Western Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Ascendant (Rising Sign)</span>
              <p className="text-lg font-bold text-amber-300 font-serif mt-1">
                {tropicalChart.ascendant.formattedDegree}
              </p>
              <p className="text-xs text-slate-400">Placidus 1st House Cusp</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Midheaven (Medium Coeli)</span>
              <p className="text-lg font-bold text-indigo-300 font-serif mt-1">
                {tropicalChart.midheaven.formattedDegree}
              </p>
              <p className="text-xs text-slate-400">Placidus 10th House Cusp</p>
            </div>
          </div>

          {/* Tropical Planets Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tropical Zodiac (Western Placidus)
              </span>
              <span className="text-xs text-slate-400">
                Used by AI for Psychological Archetypes & Emotions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Planet</th>
                    <th className="py-3 px-4">Sign</th>
                    <th className="py-3 px-4">Sign Degree</th>
                    <th className="py-3 px-4">Placidus House</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tropicalChart.planets.map((planet) => {
                    const badgeClass = SIGN_COLORS[planet.sign] || 'text-slate-300 bg-slate-800';
                    return (
                      <tr key={planet.name} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <span className="text-base text-purple-400 font-mono">
                            {PLANET_SYMBOLS[planet.name] || '•'}
                          </span>
                          {planet.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${badgeClass}`}>
                            {planet.sign}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {planet.formattedDegree}
                        </td>
                        <td className="py-3 px-4 font-medium text-amber-300">
                          House {planet.house}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {planet.isRetrograde ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              ℞ RETRO
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Direct</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Western Aspects Section */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Major Planetary Aspects ({tropicalChart.aspects.length} detected)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {tropicalChart.aspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <span className="text-slate-200 font-medium">
                    {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                  </span>
                  <span className="text-[11px] font-mono text-purple-300">
                    {aspect.angle}° (orb {aspect.orb}°)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* LIVE TRANSITS VIEW */}
      {subTab === 'transits' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200">
            Current live planetary positions computed at {new Date(transits.sidereal.calculatedAt).toLocaleString()}.
            The Oracle cross-checks these live transits with your natal houses to predict timing of events!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sidereal Transits */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90">
                <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Vedic Live Transits (Gochar - Lahiri)
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60 p-1">
                {transits.sidereal.planets.map((planet) => (
                  <div key={planet.name} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="text-amber-300">{PLANET_SYMBOLS[planet.name] || '•'}</span>
                      {planet.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono">
                        {planet.sign} {planet.formattedDegree}
                      </span>
                      {planet.isRetrograde && (
                        <span className="text-[10px] text-rose-400 font-bold">℞</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tropical Transits */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Tropical Live Transits (Western)
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60 p-1">
                {transits.tropical.planets.map((planet) => (
                  <div key={planet.name} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="text-purple-400">{PLANET_SYMBOLS[planet.name] || '•'}</span>
                      {planet.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono">
                        {planet.sign} {planet.formattedDegree}
                      </span>
                      {planet.isRetrograde && (
                        <span className="text-[10px] text-rose-400 font-bold">℞</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
