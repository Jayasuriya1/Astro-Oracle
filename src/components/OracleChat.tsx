import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  User,
  Trash2,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  HelpCircle,
  Flame,
  Compass,
  HeartHandshake,
  Clock,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { SouthIndianChart } from './SouthIndianChart';

const SUGGESTION_CHIPS = [
  { text: 'When will my career take off?', icon: Compass },
  { text: 'What does my chart say about marriage?', icon: HeartHandshake },
  { text: 'Why am I facing obstacles right now?', icon: Flame },
  { text: 'Analyze my psychological strengths & shadow self', icon: Sparkles },
  { text: 'What remedies & temple visits do you prescribe?', icon: HelpCircle }
];

export const OracleChat: React.FC = () => {
  const {
    profile,
    apiKey,
    chatHistory,
    isStreaming,
    streamingMessage,
    error,
    sendMessage,
    clearChat,
    setIsSettingsOpen,
    astrologyData,
    setActiveView
  } = useAstrology();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'chart'>('chat');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingMessage, isStreaming]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (chipText: string) => {
    if (isStreaming) return;
    sendMessage(chipText);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sidereal = astrologyData?.siderealChart;
  const currentDasha = sidereal?.dashaReport?.currentMahadasha;
  const currentAntardasha = currentDasha?.antardashas?.find((a) => a.isCurrent);
  const moon = sidereal?.planets?.find((p) => p.name === 'Moon');
  const sun = sidereal?.planets?.find((p) => p.name === 'Sun');

  return (
    <div className="flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-6 pt-1.5 sm:pt-2 pb-20 md:pb-3 gap-3.5 lg:gap-5 overflow-hidden">
      {/* ============================================================ */}
      {/* DESKTOP STUDIO: LEFT COLUMN (40% width, Visual Chart & Dasha) */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[38%] flex-col h-full min-h-0 overflow-y-auto no-scrollbar space-y-3.5 pr-1 flex-shrink-0">
        {/* Studio Top Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
              Studio Kundali • {profile.name}
            </span>
          </div>
          <button
            onClick={() => setActiveView('charts')}
            className="text-[11px] text-purple-300 hover:text-purple-200 hover:underline flex items-center gap-1 font-medium transition"
          >
            <span>Full Chart</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Visual South Indian Chart Diagram */}
        {sidereal ? (
          <SouthIndianChart
            planets={sidereal.planets}
            lagna={sidereal.lagna}
            nativeName={profile.name}
            chartTitle="NATAL RASI (D1)"
          />
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            Calculating Swiss Ephemeris chart...
          </div>
        )}

        {/* Quick Astrological Triad (Asc, Moon, Sun) */}
        {sidereal && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Lagna</span>
              <p className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                {sidereal.lagna.sign}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {sidereal.lagna.formattedDegree.split(' ')[1] || sidereal.lagna.formattedDegree}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Chandra</span>
              <p className="text-xs sm:text-sm font-bold text-cyan-300 truncate">
                {moon?.sign || 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {moon?.formattedDegree || ''}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Surya</span>
              <p className="text-xs sm:text-sm font-bold text-rose-300 truncate">
                {sun?.sign || 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {sun?.formattedDegree || ''}
              </p>
            </div>
          </div>
        )}

        {/* Current Mahadasha Spotlight Badge */}
        {currentDasha && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900/90 border border-purple-500/25 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Active Dasha Period</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-semibold">
                {currentDasha.percentagePassed}% elapsed
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <p className="text-sm font-bold text-white font-serif">
                {currentDasha.lord} Mahadasha
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentDasha.startDate.substring(0, 4)} → {currentDasha.endDate.substring(0, 4)}
              </p>
            </div>

            {currentAntardasha && (
              <p className="text-[11px] text-purple-200 mt-0.5">
                Current Bhukti:{' '}
                <strong className="text-amber-300">
                  {currentDasha.lord} / {currentAntardasha.lord}
                </strong>{' '}
                <span className="text-[10px] text-slate-400">
                  (until {currentAntardasha.endDate})
                </span>
              </p>
            )}

            <div className="w-full h-1.5 rounded-full bg-slate-950 mt-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                style={{ width: `${currentDasha.percentagePassed || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN (60% width on desktop, Full width on mobile)   */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
        {/* Mobile-Only Segmented Switch: Chat vs Kundali Chart */}
        <div className="lg:hidden flex items-center justify-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consultation Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('chart')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'chart'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Visual Kundali</span>
          </button>
        </div>

        {/* Mobile Chart Tab Content */}
        {mobileTab === 'chart' && (
          <div className="lg:hidden flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 p-1">
            {sidereal && (
              <SouthIndianChart
                planets={sidereal.planets}
                lagna={sidereal.lagna}
                nativeName={profile.name}
              />
            )}
            {currentDasha && (
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Active Dasha: {currentDasha.lord} Mahadasha
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  {currentDasha.startDate} to {currentDasha.endDate} ({currentDasha.percentagePassed}% elapsed)
                </p>
              </div>
            )}
            <button
              onClick={() => setActiveView('charts')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center block transition"
            >
              Open Full Natal Placements & Dashas &rarr;
            </button>
          </div>
        )}

        {/* Chat Stream (Desktop always visible, Mobile when mobileTab === 'chat') */}
        <div
          className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
            mobileTab === 'chart' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
            {chatHistory.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-full py-3 text-center space-y-3 max-w-xl mx-auto"
              >
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold font-serif text-white tracking-wide">
                    Astro Oracle Studio Consultation
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto px-2">
                    Reading for <span className="text-purple-300 font-semibold">{profile.name}</span>.
                    Synthesizing your <span className="text-amber-300 font-medium">South Indian Kundali (Lahiri)</span> with Western psychological archetypes.
                  </p>
                </div>

                {!apiKey && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2.5 w-full max-w-md">
                    <div className="flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      <span className="text-[11px] sm:text-xs">Add your Gemini API key to unlock readings.</span>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 font-semibold text-[11px] whitespace-nowrap border border-amber-500/40 transition"
                    >
                      Add Key
                    </button>
                  </div>
                )}

                {/* Suggested Consultations Grid */}
                <div className="w-full pt-1 px-1">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                    Suggested Inquiries
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {SUGGESTION_CHIPS.map((chip, idx) => {
                      const Icon = chip.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip.text)}
                          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/90 hover:border-purple-500/40 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs group shadow-sm"
                        >
                          <Icon className="w-3.5 h-3.5 text-purple-400 group-hover:text-amber-300 transition-colors flex-shrink-0" />
                          <span className="truncate">{chip.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Render Chat Messages */}
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-purple-900/30">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                      </div>
                    )}

                    <div
                      className={`relative group max-w-[94%] sm:max-w-[88%] md:max-w-[84%] leading-relaxed overflow-hidden ${
                        isUser
                          ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-purple-950/40 border border-purple-500/20 p-3.5 sm:p-4 text-xs sm:text-sm'
                          : 'bg-gray-900/50 backdrop-blur-md text-slate-100 rounded-xl border border-gray-800 shadow-xl p-4 sm:p-6'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-purple-300 prose-hr:border-gray-700 leading-relaxed space-y-4">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h2: ({ ...props }) => (
                                <div className="mt-4 mb-2 p-2 sm:p-2.5 rounded-xl bg-purple-950/35 border border-purple-500/25 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                                  <h2 {...props} className="m-0 text-amber-200 font-serif text-sm sm:text-base font-bold" />
                                </div>
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  {...props}
                                  className="text-purple-300 font-serif font-semibold text-xs sm:text-sm mt-3 mb-1 border-b border-purple-500/20 pb-1"
                                />
                              )
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Message timestamp and copy button */}
                      <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400/80">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Streaming Assistant Response */}
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 sm:gap-3 justify-start"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-purple-900/30">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin" />
                </div>

                <div className="max-w-[94%] sm:max-w-[88%] md:max-w-[84%] rounded-xl p-4 sm:p-6 bg-gray-900/50 backdrop-blur-md text-slate-100 border border-gray-800 shadow-xl overflow-hidden">
                  {streamingMessage ? (
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-purple-300 prose-hr:border-gray-700 leading-relaxed space-y-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ ...props }) => (
                            <div className="mt-4 mb-2 p-2 sm:p-2.5 rounded-xl bg-purple-950/35 border border-purple-500/25 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                              <h2 {...props} className="m-0 text-amber-200 font-serif text-sm sm:text-base font-bold" />
                            </div>
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              {...props}
                              className="text-purple-300 font-serif font-semibold text-xs sm:text-sm mt-3 mb-1 border-b border-purple-500/20 pb-1"
                            />
                          )
                        }}
                      >
                        {streamingMessage}
                      </ReactMarkdown>
                    </div>
                  ) : null}

                  {/* Streaming typing indicator dots */}
                  <div className="flex items-center gap-1.5 py-1 text-slate-400 mt-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] sm:text-xs text-slate-400 ml-1.5 font-serif italic truncate">
                      Aligning South Indian Kundali & Vimshottari Dasha...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
                {!apiKey && (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs whitespace-nowrap flex-shrink-0"
                  >
                    Configure Key
                  </button>
                )}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Clear Chat bar if history exists */}
          {chatHistory.length > 0 && (
            <div className="flex justify-end py-1 flex-shrink-0">
              <button
                onClick={clearChat}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition px-2 py-0.5 rounded hover:bg-slate-900"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear conversation</span>
              </button>
            </div>
          )}

          {/* Quick Suggestion Chips above input */}
          <div className="pt-1.5 pb-1 overflow-x-auto flex items-center gap-2 no-scrollbar touch-pan-x flex-shrink-0">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.text)}
                disabled={isStreaming}
                className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition whitespace-nowrap flex-shrink-0 disabled:opacity-50"
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Input Box Area */}
          <div className="pt-1 pb-1 flex-shrink-0">
            <form
              onSubmit={handleSend}
              className="relative flex items-center bg-slate-900/95 border border-slate-800 focus-within:border-purple-500/70 rounded-2xl p-1 sm:p-1.5 shadow-2xl transition"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  apiKey
                    ? `Ask about timing, marriage, career, remedies...`
                    : `Set your Gemini API key in Settings...`
                }
                className="flex-1 bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-24"
              />

              <div className="flex items-center gap-1 pr-1 flex-shrink-0">
                {!apiKey && (
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 sm:p-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition"
                    title="Configure Gemini API Key"
                  >
                    <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-indigo-600 transition shadow-md shadow-purple-600/30 flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>
            <p className="text-[9px] sm:text-[10px] text-center text-slate-500 mt-1">
              SwissEph WASM • Sidereal Lahiri & Tropical Dual Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
