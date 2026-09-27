import React from 'react';
import { Sparkles, Compass, Radio } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { CelestialEmblem } from './CelestialEmblem';
import { ProfileSwitcher } from './ProfileSwitcher';

export const Navbar: React.FC = () => {
  const {
    astrologyData,
    activeView,
    setActiveView,
    setIsSettingsOpen,
    setSettingsModalMode
  } = useAstrology();

  // Extract quick celestial signs
  const tropicalSun = astrologyData?.tropicalChart?.planets?.find(p => p.name === 'Sun');
  const vedicMoon = astrologyData?.siderealChart?.planets?.find(p => p.name === 'Moon');
  const vedicLagna = astrologyData?.siderealChart?.lagna;

  const handleOpenAddProfile = () => {
    setSettingsModalMode('add_member');
    setIsSettingsOpen(true);
  };

  return (
    <>
      {/* Top Header - Ultra-Luxury Bespoke Styling */}
      <header className="relative z-30 w-full border-b border-amber-500/15 bg-slate-950/85 backdrop-blur-2xl flex-shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Subtle royal ambient glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Bespoke Luxury Brand Section */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            {/* Handcrafted Sacred Geometry Astrolabe Emblem */}
            <CelestialEmblem size={40} className="hidden xs:flex flex-shrink-0" />
            <CelestialEmblem size={34} className="flex xs:hidden flex-shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff9db] via-[#fde047] to-[#d97706] text-base sm:text-lg lg:text-xl font-serif whitespace-nowrap drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                  ASTRO ORACLE
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-400/40 tracking-wider shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-amber-200/60 font-mono tracking-widest hidden sm:block uppercase">
                SwissEph WASM • Hybrid Vedic & Western
              </p>
            </div>
          </div>

          {/* Center: Segmented Navigation Pill (Tablet / Laptop / Desktop) */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 lg:gap-2 ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Oracle Chat</span>
            </button>

            <button
              onClick={() => setActiveView('charts')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 lg:gap-2 ${
                activeView === 'charts'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Natal Placements</span>
            </button>

            <button
              onClick={() => setActiveView('transits')}
              className={`px-3.5 lg:px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 lg:gap-2 ${
                activeView === 'transits'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Live Transits</span>
            </button>
          </nav>

          {/* Right: Celestial Signs & Family Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Subtle Celestial Signs (Large Screens) */}
            {tropicalSun && vedicMoon && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
                <span className="text-amber-300 font-medium">☉ {tropicalSun.sign}</span>
                <span className="text-slate-700">•</span>
                <span className="text-cyan-300 font-medium">☽ {vedicMoon.sign}</span>
                {vedicLagna && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-purple-300 font-medium">Asc {vedicLagna.sign}</span>
                  </>
                )}
              </div>
            )}

            {/* Multi-User Family Profile Switcher */}
            <ProfileSwitcher onOpenAddProfile={handleOpenAddProfile} />
          </div>
        </div>
      </header>

      {/* Mobile-Only Bottom Navigation Dock (Native App Feel) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeView === 'chat'
              ? 'text-purple-300 bg-purple-600/15 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Oracle Chat</span>
        </button>

        <button
          onClick={() => setActiveView('charts')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeView === 'charts'
              ? 'text-cyan-300 bg-cyan-600/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Placements</span>
        </button>

        <button
          onClick={() => setActiveView('transits')}
          className={`flex-1 py-1.5 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition ${
            activeView === 'transits'
              ? 'text-rose-300 bg-rose-600/15 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-tight">Transits</span>
        </button>
      </nav>
    </>
  );
};
