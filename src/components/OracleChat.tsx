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
  HeartHandshake
} from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';

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
    astrologyData
  } = useAstrology();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-4xl mx-auto px-3 sm:px-6 py-4">
      {/* Astrological Insight Banner */}
      <div className="mb-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="flex-shrink-0 flex items-center gap-1 text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Oracle Active for {profile.name}
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Western: {astrologyData?.tropicalChart?.ascendant?.sign || 'Ascendant'} Rising
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Vedic: {astrologyData?.siderealChart?.lagna?.sign || 'Lagna'} Lagna, {astrologyData?.siderealChart?.planets?.find(p => p.name === 'Moon')?.nakshatra || 'Nakshatra'}
          </span>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="flex-shrink-0 flex items-center gap-1 text-slate-400 hover:text-rose-400 transition text-[11px] px-2 py-1 rounded-md hover:bg-slate-800"
            title="Clear consultation history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Welcome to the Astro Oracle
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                A dual-system astrologer combining the psychological depth of{' '}
                <span className="text-purple-300 font-medium">Western Tropical</span> analysis with the
                timing and parikaram precision of{' '}
                <span className="text-amber-300 font-medium">Vedic Sidereal (Lahiri)</span>.
              </p>
            </div>

            {!apiKey && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3 max-w-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span className="text-left">
                  Please add your Gemini API key in Settings to unlock personal astrological predictions.
                </span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium whitespace-nowrap border border-amber-500/40"
                >
                  Add Key
                </button>
              </div>
            )}

            <div className="w-full max-w-lg pt-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
                Suggested Consultations
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTION_CHIPS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip.text)}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-start gap-2.5 text-xs group"
                    >
                      <Icon className="w-4 h-4 text-purple-400 group-hover:text-amber-300 transition-colors mt-0.5 flex-shrink-0" />
                      <span>{chip.text}</span>
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-purple-900/30">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-white rounded-tr-sm shadow-lg shadow-purple-950/40 border border-purple-500/20'
                      : 'bg-slate-900/90 text-slate-100 rounded-tl-sm border border-slate-800/90 shadow-xl'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-amber-300 prose-headings:font-serif prose-headings:font-semibold prose-strong:text-purple-200 prose-ul:my-2 prose-li:my-0.5 prose-blockquote:border-l-amber-500">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Message timestamp and copy button */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400/80">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-300" />
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
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-purple-900/30">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>

            <div className="max-w-[85%] sm:max-w-[78%] rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed bg-slate-900/90 text-slate-100 border border-slate-800/90 shadow-xl">
              {streamingMessage ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-amber-300 prose-headings:font-serif prose-headings:font-semibold prose-strong:text-purple-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingMessage}
                  </ReactMarkdown>
                </div>
              ) : null}

              {/* Streaming typing indicator dots */}
              <div className="flex items-center gap-1.5 py-1 text-slate-400 mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-1.5 font-serif italic">
                  Aligning Tropical & Sidereal Lahiri matrices...
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
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {!apiKey && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs whitespace-nowrap"
              >
                Configure Key
              </button>
            )}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips above input */}
      <div className="pt-2 pb-1.5 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {SUGGESTION_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip.text)}
            disabled={isStreaming}
            className="px-3 py-1 rounded-full text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition whitespace-nowrap flex-shrink-0 disabled:opacity-50"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input Box Area */}
      <div className="pt-2">
        <form
          onSubmit={handleSend}
          className="relative flex items-center bg-slate-900/90 border border-slate-800 focus-within:border-purple-500/70 rounded-2xl p-1.5 shadow-2xl transition"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              apiKey
                ? `Ask about timing, marriage, career, personality or remedies...`
                : `Set your Gemini API key in Settings to activate the Oracle...`
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-32"
          />

          <div className="flex items-center gap-1.5 pr-1">
            {!apiKey && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition"
                title="Configure Gemini API Key"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-indigo-600 transition shadow-md shadow-purple-600/30 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          SwissEph WASM Engine • Sidereal Lahiri & Tropical Placidus Dual Architecture
        </p>
      </div>
    </div>
  );
};
