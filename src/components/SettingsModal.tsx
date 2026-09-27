import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Navigation,
  Loader2
} from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { aiService } from '../services/aiService';
import { LocationPicker } from './LocationPicker';
import type { UserProfile, Coordinates } from '../types/astrology';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    profile,
    updateProfile,
    apiKey,
    updateApiKey,
    isCalculating
  } = useAstrology();

  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [localApiKey, setLocalApiKey] = useState<string>(apiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isSettingsOpen) {
      setFormData({ ...profile });
      setLocalApiKey(apiKey);
      setTestStatus('idle');
      setTestMessage('');
      setSaveSuccess(false);
    }
  }, [isSettingsOpen, profile, apiKey]);

  if (!isSettingsOpen) return null;

  const handleLocationChange = (coords: Coordinates, city: string, state: string) => {
    setFormData(prev => ({
      ...prev,
      birthCoordinates: coords,
      // Auto-update current residence as sensible default
      currentCity: city,
      currentState: state
    }));
  };

  const handleCoordinatesOnlyChange = (coords: Coordinates) => {
    setFormData(prev => ({
      ...prev,
      birthCoordinates: coords
    }));
  };

  const handleTestKey = async () => {
    if (!localApiKey.trim()) {
      setTestStatus('failed');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Validating key with Gemini API...');
    try {
      await aiService.testApiKey(localApiKey);
      setTestStatus('success');
      setTestMessage('Key validated successfully! Gemini 3.8 Flash is ready.');
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(err.message || 'Key validation failed. Please verify your key.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateApiKey(localApiKey);
    await updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setIsSettingsOpen(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-serif tracking-wide">
                  Astrological Profile & BYOK
                </h2>
                <p className="text-xs text-slate-400">
                  Ephemeris calculations and chat run client-side in your browser.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* API KEY SECTION */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Gemini API Key (BYOK)
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 hover:underline"
                >
                  Get Free API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => {
                    setLocalApiKey(e.target.value);
                    setTestStatus('idle');
                  }}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition pr-20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11px] text-slate-400">
                  Stored strictly in your local browser IndexedDB. Never shared.
                </p>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testStatus === 'testing' || !localApiKey}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {testStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Test Connection
                </button>
              </div>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}

              {testStatus === 'failed' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}
            </div>

            {/* USER PROFILE SECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Birth Particulars (Swiss Ephemeris Precision)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Birth Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Birth Time */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Birth Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* NEW DYNAMIC LOCATION PICKER (Replaces manual coordinates typing) */}
              <div className="pt-1">
                <LocationPicker
                  coordinates={formData.birthCoordinates}
                  currentCity={formData.currentCity}
                  currentState={formData.currentState}
                  onLocationChange={handleLocationChange}
                  onCoordinatesOnlyChange={handleCoordinatesOnlyChange}
                />
              </div>

              {/* Current Residence (Crucial for Tier 2 Remedies & District Temples) */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    Current Residence (For Tailored Remedies & Pariharams)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    The Oracle uses this to locate Tier 2 district temples & local remedies near you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Current City</label>
                    <input
                      type="text"
                      required
                      value={formData.currentCity}
                      onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                      placeholder="e.g. Chennai"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Current State / Region</label>
                    <input
                      type="text"
                      required
                      value={formData.currentState}
                      onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCalculating}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Ephemeris...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Saved & Calculated!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Save & Compute Chart
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
