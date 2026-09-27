import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, RefreshCw, Layers, ArrowRightLeft, HeartHandshake } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { VedicChart } from './VedicChart';
import { WesternWheel } from './WesternWheel';
import { VimshottariDashaTable } from './VimshottariDashaTable';
import { PanchangamViewer } from './PanchangamViewer';
import { PoruthamViewer } from './PoruthamViewer';
import { getTranslatedZodiac, getTranslatedPlanet, getTranslatedNakshatra } from '../utils/translations';

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

export const ChartViewer: React.FC<{ defaultSubTab?: 'western' | 'vedic' | 'transits' | 'porutham' }> = ({
  defaultSubTab = 'vedic'
}) => {
  const { astrologyData, isCalculating, recalculate, profile, language, t } = useAstrology();
  const [subTab, setSubTab] = useState<'vedic' | 'western' | 'transits' | 'porutham'>(defaultSubTab);

  if (isCalculating || !astrologyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 px-4 text-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm text-slate-300">Calculating planetary positions via Swiss Ephemeris WASM...</p>
      </div>
    );
  }

  const { tropicalChart, siderealChart, transits } = astrologyData;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{t.astronomicalPlacements}: {profile.name}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            {t.born}: {profile.birthDate} {t.at} {profile.birthTime} • {profile.birthCoordinates.latitude.toFixed(2)}°N, {profile.birthCoordinates.longitude.toFixed(2)}°E
          </p>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          {/* Responsive Segmented Pills */}
          <div className="w-full xl:w-auto grid grid-cols-2 sm:grid-cols-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-center gap-1">
            <button
              onClick={() => setSubTab('vedic')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                subTab === 'vedic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.tabVedic}</span>
            </button>
            <button
              onClick={() => setSubTab('western')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                subTab === 'western'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.tabWestern}</span>
            </button>
            <button
              onClick={() => setSubTab('transits')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                subTab === 'transits'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.tabTransits}</span>
            </button>
            <button
              onClick={() => setSubTab('porutham')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                subTab === 'porutham'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3 h-3 inline mr-1" />
              <span>{t.tabPorutham}</span>
            </button>
          </div>

          <button
            onClick={recalculate}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex-shrink-0"
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
          className="space-y-4 sm:space-y-6"
        >
          {/* Visual Vedic Kundali (South/North & D1/D9) & Key Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Visual SVG Chart (Left Column) */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <VedicChart
                siderealChart={siderealChart}
                nativeName={profile.name}
                defaultMode="south"
                defaultDivision="D1"
              />
            </div>

            {/* Key Vedic Milestones & Snapshot (Right Column) */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">
                    {t.triadLagna} ({language === 'ta' ? 'லக்னம்' : 'Ascendant'})
                  </span>
                  <p className="text-base sm:text-lg font-bold text-amber-300 font-serif mt-0.5">
                    {getTranslatedZodiac(siderealChart.lagna.sign, language)}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {siderealChart.lagna.formattedDegree} • {getTranslatedNakshatra(siderealChart.lagna.nakshatra || '', language)} (P{siderealChart.lagna.pada})
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">
                    {t.triadChandra} ({language === 'ta' ? 'சந்திர ராசி' : 'Moon Sign'})
                  </span>
                  {(() => {
                    const moon = siderealChart.planets.find(p => p.name === 'Moon');
                    return (
                      <>
                        <p className="text-base sm:text-lg font-bold text-cyan-300 font-serif mt-0.5">
                          {moon?.sign ? getTranslatedZodiac(moon.sign, language) : 'N/A'}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-400">
                          {moon?.formattedDegree} • {moon?.nakshatra ? getTranslatedNakshatra(moon.nakshatra, language) : ''} (P{moon?.nakshatraPada})
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Ayanamsa</span>
                  <p className="text-base sm:text-lg font-bold text-purple-300 font-serif mt-0.5">
                    {t.lahiriAyanamsa}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Offset: {siderealChart.ayanamsaValue.toFixed(4)}° • Whole Sign
                  </p>
                </div>
              </div>

              {/* Dasha Quick Snapshot Card if available */}
              {siderealChart.dashaReport?.currentMahadasha && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      ● {t.activeDashaPeriod}
                    </span>
                    <p className="text-sm font-semibold text-white font-serif mt-0.5">
                      {getTranslatedPlanet(siderealChart.dashaReport.currentMahadasha.lord, language)} {language === 'ta' ? 'மகா தசை' : 'Mahadasha'} ({siderealChart.dashaReport.currentMahadasha.totalYears}y)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {siderealChart.dashaReport.currentMahadasha.startDate} to {siderealChart.dashaReport.currentMahadasha.endDate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-amber-300 font-bold font-mono text-sm">
                      {siderealChart.dashaReport.currentMahadasha.percentagePassed}%
                    </span>
                    <p className="text-[10px] text-slate-500">{t.elapsed}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Planetary Placements Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {language === 'ta' ? 'நவக்கிரகங்கள் (லஹிரி வேத முறை)' : 'Navagrahas (Lahiri Sidereal)'}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {language === 'ta' ? 'பாவகம் மற்றும் தசா கணிதம்' : 'Used for Timing & House Analysis'}
              </span>
            </div>

            {/* Mobile swipe hint banner */}
            <div className="sm:hidden px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" /> Swipe horizontally to view full chart
              </span>
            </div>

            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left text-xs min-w-[580px]">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px] sm:text-xs">
                  <tr>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colPoint}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colSignDeg}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">Degrees</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colHouse}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colNakshatraPada}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colLord}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">Dignity</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">{t.colStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {siderealChart.planets.map((planet) => {
                    const badgeClass = SIGN_COLORS[planet.sign] || 'text-slate-300 bg-slate-800';
                    return (
                      <tr key={planet.name} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                          <span className="text-sm sm:text-base text-amber-300 font-mono">
                            {PLANET_SYMBOLS[planet.name] || '•'}
                          </span>
                          {getTranslatedPlanet(planet.name, language)}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-medium ${badgeClass}`}>
                            {getTranslatedZodiac(planet.sign, language)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-mono text-slate-300 text-[11px] sm:text-xs">
                          {planet.formattedDegree}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-medium text-purple-300">
                          H{planet.house}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-slate-300 text-[11px] sm:text-xs">
                          {getTranslatedNakshatra(planet.nakshatra || '', language)} <span className="text-amber-400 font-medium">P{planet.nakshatraPada}</span>
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-slate-400">
                          {getTranslatedPlanet(planet.nakshatraLord || '', language)}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {planet.dignity === 'exalted' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
                                {language === 'ta' ? 'உச்சம்' : 'Exalted (Ucha)'}
                              </span>
                            )}
                            {planet.dignity === 'debilitated' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm">
                                {language === 'ta' ? 'நீசம்' : 'Debilitated (Neecha)'}
                              </span>
                            )}
                            {planet.dignity === 'own_house' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm">
                                {language === 'ta' ? 'ஆட்சி' : 'Own House'}
                              </span>
                            )}
                            {planet.dignity === 'friendly' && (
                              <span className="px-1.5 py-0.5 text-[10px] text-cyan-300">
                                {language === 'ta' ? 'நட்பு' : 'Friendly'}
                              </span>
                            )}
                            {planet.dignity === 'enemy' && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                                {language === 'ta' ? 'பகை' : 'Enemy'}
                              </span>
                            )}
                            {planet.dignity === 'neutral' && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                                {language === 'ta' ? 'சமம்' : 'Neutral'}
                              </span>
                            )}
                            {planet.isVargottama && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-200 border border-purple-400/40 text-[9px] font-bold tracking-wider">
                                VARGOTTAMA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">
                          {planet.isRetrograde ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-bold">
                              {t.retrograde}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-medium">{t.direct}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vimshottari Dasha Timeline Table */}
          {siderealChart.dashaReport && (
            <VimshottariDashaTable dashaReport={siderealChart.dashaReport} />
          )}
        </motion.div>
      )}

      {/* WESTERN CHART VIEW */}
      {subTab === 'western' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Visual Western Wheel & Key Points */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-6 flex flex-col items-center">
              <WesternWheel tropicalChart={tropicalChart} nativeName={profile.name} />
            </div>

            <div className="lg:col-span-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Ascendant (Rising Sign)</span>
                  <p className="text-base sm:text-lg font-bold text-amber-300 font-serif mt-0.5">
                    {tropicalChart.ascendant.formattedDegree}
                  </p>
                  <p className="text-[11px] text-slate-400">Placidus 1st House Cusp</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">Midheaven (Medium Coeli)</span>
                  <p className="text-base sm:text-lg font-bold text-indigo-300 font-serif mt-0.5">
                    {tropicalChart.midheaven.formattedDegree}
                  </p>
                  <p className="text-[11px] text-slate-400">Placidus 10th House Cusp</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 leading-relaxed">
                Western Placidus calculates the 360° circular wheel dividing the sky by quadrant arcs.
                The aspect geometric lines (Trines, Squares, Oppositions, Sextiles) illustrate interpersonal psychology and harmonic resonance.
              </div>
            </div>
          </div>

          {/* Tropical Planets Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tropical Zodiac (Western Placidus)
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Psychological Archetypes & Aspects
              </span>
            </div>

            {/* Mobile swipe hint banner */}
            <div className="sm:hidden px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-purple-400" /> Swipe horizontally to view full chart
              </span>
            </div>

            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px] sm:text-xs">
                  <tr>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">Planet</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">Sign</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">Sign Degree</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">Placidus House</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tropicalChart.planets.map((planet) => {
                    const badgeClass = SIGN_COLORS[planet.sign] || 'text-slate-300 bg-slate-800';
                    return (
                      <tr key={planet.name} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                          <span className="text-sm sm:text-base text-purple-400 font-mono">
                            {PLANET_SYMBOLS[planet.name] || '•'}
                          </span>
                          {planet.name}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-medium ${badgeClass}`}>
                            {planet.sign}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-mono text-slate-300 text-[11px] sm:text-xs">
                          {planet.formattedDegree}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-medium text-amber-300">
                          House {planet.house}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center">
                          {planet.isRetrograde ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-bold">
                              ℞ RETRO
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-medium">Direct</span>
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
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Major Planetary Aspects ({tropicalChart.aspects.length} detected)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {tropicalChart.aspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
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

      {/* LIVE TRANSITS & PANCHANGAM VIEW */}
      {subTab === 'transits' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Daily Live Panchangam (Tithi, Nakshatra, Hora, Rahu Kalam) */}
          {astrologyData.panchangam && (
            <PanchangamViewer panchangam={astrologyData.panchangam} />
          )}

          <div className="p-3.5 sm:p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200">
            Current live planetary positions computed at {new Date(transits.sidereal.calculatedAt).toLocaleString()}.
            The Oracle cross-checks these live transits with your natal houses to predict timing of events!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Sidereal Transits */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Vedic Live Transits (Gochar - Lahiri)
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60 p-1">
                {transits.sidereal.planets.map((planet) => (
                  <div key={planet.name} className="px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                      <span className="text-amber-300">{PLANET_SYMBOLS[planet.name] || '•'}</span>
                      {planet.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono text-[11px] sm:text-xs">
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
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Tropical Live Transits (Western)
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60 p-1">
                {transits.tropical.planets.map((planet) => (
                  <div key={planet.name} className="px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                      <span className="text-purple-400">{PLANET_SYMBOLS[planet.name] || '•'}</span>
                      {planet.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono text-[11px] sm:text-xs">
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

      {/* COMPATIBILITY (10 PORUTHAM) VIEW */}
      {subTab === 'porutham' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <PoruthamViewer />
        </motion.div>
      )}
    </div>
  );
};
