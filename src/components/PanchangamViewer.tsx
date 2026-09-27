import React from 'react';
import { Sun, Clock, AlertTriangle } from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { getTranslatedNakshatra, getTranslatedPlanet } from '../utils/translations';
import type { PanchangamData } from '../types/astrology';

export const PanchangamViewer: React.FC<{ panchangam: PanchangamData; className?: string }> = ({
  panchangam,
  className = ''
}) => {
  const { language, t } = useAstrology();
  const { tithi, nakshatra, yoga, karana, activeHora, rahuKalam, yamagandam } = panchangam;

  const translatedNakshatra = getTranslatedNakshatra(nakshatra.name, language);
  const translatedHoraLord = getTranslatedPlanet(activeHora.lord, language);
  const pakshaLabel = language === 'ta'
    ? (tithi.paksha === 'Shukla' ? 'வளர்பிறை (சுக்கில பட்சம்)' : 'தேய்பிறை (கிருஷ்ண பட்சம்)')
    : `${tithi.paksha} Paksha`;

  // Function to evaluate window status: Active Now (pulsing red), Upcoming at [Time] (subtle amber), or Passed (slate)
  const getTimingStatus = (startTimeStr: string, endTimeStr: string, isCurrent?: boolean) => {
    if (isCurrent) return { status: 'active' as const, label: t.activeNow || 'Active Now' };
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = startTimeStr.split(':').map(Number);
    const [eH, eM] = endTimeStr.split(':').map(Number);
    const startMinutes = (sH || 0) * 60 + (sM || 0);
    const endMinutes = (eH || 0) * 60 + (eM || 0);

    if (currentMinutes < startMinutes) {
      return {
        status: 'upcoming' as const,
        label: language === 'ta' ? `அடுத்து ${startTimeStr}` : `Upcoming at ${startTimeStr}`
      };
    } else if (currentMinutes >= endMinutes) {
      return {
        status: 'passed' as const,
        label: language === 'ta' ? 'முடிந்தது' : 'Passed'
      };
    }
    return { status: 'active' as const, label: t.activeNow || 'Active Now' };
  };

  const rahuStatus = getTimingStatus(rahuKalam.startTime, rahuKalam.endTime, rahuKalam.isCurrent);
  const yamaStatus = getTimingStatus(yamagandam.startTime, yamagandam.endTime, yamagandam.isCurrent);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Banner: Panchangam Essentials */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-amber-500/25 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {t.livePanchangam}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white mt-1 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>{tithi.name} ({pakshaLabel})</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'ta' ? 'நட்சத்திரம்: ' : 'Nakshatra: '}
              <strong className="text-purple-300 font-semibold">
                {translatedNakshatra} ({language === 'ta' ? `பாதம் ${nakshatra.pada}` : `Pada ${nakshatra.pada}`})
              </strong>
              {' '}• Yoga: {yoga.name} • Karana: {karana.name}
            </p>
          </div>

          {/* Active Planetary Hora Badge */}
          <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-500/30 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">
              {t.activeHora}
            </span>
            <span className="text-base font-bold text-amber-300 font-serif">
              {language === 'ta' ? `${translatedHoraLord} ஓரை` : `${activeHora.lord} Hora`}
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              {activeHora.startTime} - {activeHora.endTime}
            </p>
          </div>
        </div>

        {/* Tithi Elapsed Progress */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{language === 'ta' ? 'திதி முன்னேற்றம்' : 'Tithi Progress'}</span>
            <span className="font-mono text-amber-300">{tithi.percentagePassed}% {t.tithiPassed}</span>
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
            rahuStatus.status === 'active'
              ? 'bg-rose-950/40 border-rose-500/60 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/30'
              : rahuStatus.status === 'upcoming'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.rahuKalam}</span>
            </span>

            {/* Dynamic Status Badge */}
            {rahuStatus.status === 'active' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {rahuStatus.label}
              </span>
            )}
            {rahuStatus.status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3 text-amber-400" />
                {rahuStatus.label}
              </span>
            )}
            {rahuStatus.status === 'passed' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                {rahuStatus.label}
              </span>
            )}
          </div>
          <p className="text-lg font-bold font-mono text-white mt-1.5">
            {rahuKalam.startTime} — {rahuKalam.endTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'இக்காலத்தில் புதிய சுப காரியங்கள், தொழில் தொடக்கம் அல்லது பயணங்களைத் தவிர்ப்பது நல்லது.'
              : 'Avoid starting new business ventures, major investments, or contract signings during this span.'}
          </p>
        </div>

        {/* Yamagandam */}
        <div
          className={`p-4 rounded-xl border transition ${
            yamaStatus.status === 'active'
              ? 'bg-rose-950/40 border-rose-500/60 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/30'
              : yamaStatus.status === 'upcoming'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.yamagandam}</span>
            </span>

            {/* Dynamic Status Badge */}
            {yamaStatus.status === 'active' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {yamaStatus.label}
              </span>
            )}
            {yamaStatus.status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3 text-amber-400" />
                {yamaStatus.label}
              </span>
            )}
            {yamaStatus.status === 'passed' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                {yamaStatus.label}
              </span>
            )}
          </div>
          <p className="text-lg font-bold font-mono text-white mt-1.5">
            {yamagandam.startTime} — {yamagandam.endTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'எமனால் ஆளப்படும் நேரம்; ஆன்மீக தியானம் மற்றும் சிந்தனைக்கு உகந்தது.'
              : 'Traditional period ruled by Yama; recommended for spiritual contemplation rather than departures.'}
          </p>
        </div>
      </div>
    </div>
  );
};
