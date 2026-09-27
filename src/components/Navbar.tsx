import React from 'react';
import { Sparkles, Compass, Settings, ShieldCheck, KeyRound, Radio } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';

export const Navbar: React.FC = () => {
  const {
    profile,
    apiKey,
    astrologyData,
    activeView,
    setActiveView,
    setIsSettingsOpen,
    isCalculating
  } = useAstrology();

  // Extract quick signs
  const tropicalSun = astrologyData?.tropicalChart?.planets?.find(p => p.name === 'Sun');
  const vedicMoon = astrologyData?.siderealChart?.planets?.find(p => p.name === 'Moon');
  const vedicLagna = astrologyData?.siderealChart?.lagna;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-cyan-200 text-lg sm:text-xl font-serif">
                ASTRO ORACLE
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              WASM High-Accuracy • Hybrid Western & Vedic Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Oracle Chat
          </button>

          <button
            onClick={() => setActiveView('charts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'charts'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Natal Placements
          </button>

          <button
            onClick={() => setActiveView('transits')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'transits'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Live Transits
          </button>
        </div>

        {/* Right side controls & badges */}
        <div className="flex items-center gap-3">
          {/* Quick celestial pill */}
          {tropicalSun && vedicMoon && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-amber-400 font-medium">☉ {tropicalSun.sign}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">☽ {vedicMoon.sign} ({vedicMoon.nakshatra})</span>
              {vedicLagna && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-400 font-medium">Asc: {vedicLagna.sign}</span>
                </>
              )}
            </div>
          )}

          {/* Engine status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-slate-900/80 border border-slate-800 text-slate-400"
            title="Swiss Ephemeris WebAssembly engine operates purely locally in your browser"
          >
            {isCalculating ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{isCalculating ? 'Computing...' : 'WASM Engine'}</span>
          </div>

          {/* Settings button with BYOK status indicator */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm group"
            title="Configure Gemini API Key & Birth Details"
          >
            {apiKey ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            <KeyRound className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{profile.name}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile sub-bar navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/80 px-2 py-1.5">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 py-1 text-center text-xs font-medium rounded-lg ${
            activeView === 'chat' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30' : 'text-slate-400'
          }`}
        >
          Oracle Chat
        </button>
        <button
          onClick={() => setActiveView('charts')}
          className={`flex-1 py-1 text-center text-xs font-medium rounded-lg ${
            activeView === 'charts' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30' : 'text-slate-400'
          }`}
        >
          Placements
        </button>
        <button
          onClick={() => setActiveView('transits')}
          className={`flex-1 py-1 text-center text-xs font-medium rounded-lg ${
            activeView === 'transits' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30' : 'text-slate-400'
          }`}
        >
          Transits
        </button>
      </div>
    </header>
  );
};
