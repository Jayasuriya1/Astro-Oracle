import { Sparkles, Compass, Settings, Radio } from 'lucide-react';
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

  // Extract quick celestial signs
  const tropicalSun = astrologyData?.tropicalChart?.planets?.find(p => p.name === 'Sun');
  const vedicMoon = astrologyData?.siderealChart?.planets?.find(p => p.name === 'Moon');
  const vedicLagna = astrologyData?.siderealChart?.lagna;

  return (
    <header className="relative z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/25 via-purple-500/20 to-indigo-500/25 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-purple-100 to-cyan-100 text-lg sm:text-xl font-serif whitespace-nowrap">
              ASTRO ORACLE
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 tracking-wider">
              HYBRID AI
            </span>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Controller */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
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
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
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
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
              activeView === 'transits'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Live Transits</span>
          </button>
        </nav>

        {/* Right: Unified Profile, Signs & Settings Pill */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Subtle Signs Pill (Desktop) */}
          {tropicalSun && vedicMoon && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
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

          {/* Unified Settings / Profile Card */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition shadow-sm group"
            title="Configure Birth Details & Gemini API Key"
          >
            <div className="relative flex items-center justify-center">
              {isCalculating ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              ) : apiKey ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>

            <span className="text-xs font-semibold tracking-wide text-slate-200">
              {profile.name}
            </span>

            {!apiKey && (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">
                Add Key
              </span>
            )}

            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-45 group-hover:text-slate-200 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/90 px-3 py-2">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition ${
            activeView === 'chat'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
              : 'text-slate-400'
          }`}
        >
          Oracle Chat
        </button>
        <button
          onClick={() => setActiveView('charts')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition ${
            activeView === 'charts'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
              : 'text-slate-400'
          }`}
        >
          Natal Placements
        </button>
        <button
          onClick={() => setActiveView('transits')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition ${
            activeView === 'transits'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
              : 'text-slate-400'
          }`}
        >
          Live Transits
        </button>
      </div>
    </header>
  );
};
