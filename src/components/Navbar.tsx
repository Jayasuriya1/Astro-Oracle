import { Sparkles, Compass, Radio, Download, Languages } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { CelestialEmblem } from './CelestialEmblem';
import { ProfileSwitcher } from './ProfileSwitcher';
import { getTranslatedZodiac } from '../utils/translations';

export const Navbar: React.FC = () => {
  const {
    astrologyData,
    activeView,
    setActiveView,
    setIsSettingsOpen,
    setSettingsModalMode,
    setIsExportOpen,
    scrollToPlanet,
    language,
    toggleLanguage,
    t
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
          {/* Left: Bespoke Luxury Brand Section with Fixed Alignment */}
          <div className="flex items-center gap-3 sm:gap-3.5 flex-shrink-0">
            {/* Handcrafted Sacred Geometry Astrolabe Emblem */}
            <CelestialEmblem size={38} className="flex flex-shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]" />

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff9db] via-[#fde047] to-[#d97706] text-base sm:text-lg lg:text-xl font-serif whitespace-nowrap drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)] leading-tight">
                  {t.appName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-400/40 tracking-wider shadow-sm leading-none flex-shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-amber-200/60 font-mono tracking-wider hidden sm:block uppercase whitespace-nowrap mt-0.5">
                {t.subtitle}
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
              <span>{t.navChat}</span>
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
              <span>{t.navCharts}</span>
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
              <span>{t.navTransits}</span>
            </button>
          </nav>

          {/* Right: Language Switcher, Celestial Signs, Export & Family Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Celestial Signs Clickable Shortcuts (Large Screens) */}
            {tropicalSun && vedicMoon && (
              <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300">
                <button
                  type="button"
                  onClick={() => scrollToPlanet('Sun')}
                  title="Scroll to Sun placements"
                  className="px-2 py-0.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 font-medium transition flex items-center gap-1 whitespace-nowrap"
                >
                  <span>☉ {getTranslatedZodiac(tropicalSun.sign, language)}</span>
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => scrollToPlanet('Moon')}
                  title="Scroll to Moon placements"
                  className="px-2 py-0.5 rounded-lg text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 font-medium transition flex items-center gap-1 whitespace-nowrap"
                >
                  <span>☽ {getTranslatedZodiac(vedicMoon.sign, language)}</span>
                </button>
                {vedicLagna && (
                  <>
                    <span className="text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => scrollToPlanet('Lagna')}
                      title="Scroll to Ascendant placements"
                      className="px-2 py-0.5 rounded-lg text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 font-medium transition flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>{language === 'ta' ? 'லக்' : 'Asc'} {getTranslatedZodiac(vedicLagna.sign, language)}</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Dedicated Language Toggle (English / தமிழ்) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-medium transition flex items-center gap-1.5 shadow-sm text-slate-200 hover:text-white"
              title={language === 'en' ? 'Switch to Tamil (தமிழ்)' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="font-semibold text-[11px] text-amber-300">
                {language === 'en' ? 'தமிழ்' : 'English'}
              </span>
            </button>

            {/* Export Chart & AI Reading Button */}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
              title="Export Chart as PDF or Image"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.export}</span>
            </button>

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
          <span className="text-[10px] font-medium tracking-tight">{t.navChat}</span>
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
          <span className="text-[10px] font-medium tracking-tight">{t.navCharts}</span>
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
          <span className="text-[10px] font-medium tracking-tight">{t.navTransits}</span>
        </button>
      </nav>
    </>
  );
};
