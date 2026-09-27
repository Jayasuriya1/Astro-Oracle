import React, { useState, useEffect } from 'react';
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
  Loader2,
  UserPlus,
  Users,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import { aiService } from '../services/aiService';
import { LocationPicker } from './LocationPicker';
import type { UserProfile, Coordinates, FamilyRelationship } from '../types/astrology';

const RELATION_OPTIONS: Array<{ value: FamilyRelationship; label: string; icon: string }> = [
  { value: 'Self', label: 'Self', icon: '👤' },
  { value: 'Spouse', label: 'Spouse', icon: '💍' },
  { value: 'Father', label: 'Father', icon: '👨' },
  { value: 'Mother', label: 'Mother', icon: '👩' },
  { value: 'Child', label: 'Child', icon: '👶' },
  { value: 'Sibling', label: 'Sibling', icon: '🤝' },
  { value: 'Partner', label: 'Partner', icon: '❤️' },
  { value: 'Friend', label: 'Friend', icon: '🌟' },
  { value: 'Other', label: 'Member', icon: '✨' }
];

const AVATAR_COLORS = [
  '#9333ea', // Amethyst
  '#ec4899', // Rose Pink
  '#3b82f6', // Sapphire Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Solar Amber
  '#06b6d4', // Celestial Cyan
  '#e11d48'  // Ruby Crimson
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    profile,
    profiles,
    updateProfile,
    addProfile,
    deleteProfile,
    apiKey,
    updateApiKey,
    isCalculating,
    settingsModalMode,
    setSettingsModalMode
  } = useAstrology();

  const [activeTab, setActiveTab] = useState<'profile' | 'apikey'>('profile');
  const [formMode, setFormMode] = useState<'edit' | 'add_member'>('edit');
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [localApiKey, setLocalApiKey] = useState<string>(apiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Sync state whenever modal opens or mode changes
  useEffect(() => {
    if (isSettingsOpen) {
      setFormMode(settingsModalMode);
      setLocalApiKey(apiKey);
      setTestStatus('idle');
      setTestMessage('');
      setSaveSuccess(false);
      setConfirmDelete(false);

      if (settingsModalMode === 'add_member') {
        setFormData({
          id: '',
          name: '',
          relationship: 'Spouse',
          birthDate: '1998-01-01',
          birthTime: '12:00',
          birthCoordinates: profile.birthCoordinates || {
            latitude: 13.0827,
            longitude: 80.2707,
            placeName: 'Chennai, Tamil Nadu, India'
          },
          currentCity: profile.currentCity || 'Chennai',
          currentState: profile.currentState || 'Tamil Nadu',
          color: AVATAR_COLORS[(profiles.length + 1) % AVATAR_COLORS.length]
        });
      } else {
        setFormData({ ...profile });
      }
    }
  }, [isSettingsOpen, settingsModalMode, profile, apiKey, profiles.length]);

  if (!isSettingsOpen) return null;

  const handleLocationChange = (coords: Coordinates, city: string, state: string) => {
    setFormData(prev => ({
      ...prev,
      birthCoordinates: coords,
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
      setTestMessage(err.message || 'Key validation failed. Please check your key.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If API key was updated, save it first (shared BYOK)
    if (localApiKey !== apiKey) {
      await updateApiKey(localApiKey);
    }

    if (formMode === 'add_member') {
      await addProfile({
        name: formData.name.trim() || 'Family Member',
        relationship: formData.relationship || 'Spouse',
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthCoordinates: formData.birthCoordinates,
        currentCity: formData.currentCity,
        currentState: formData.currentState,
        color: formData.color || AVATAR_COLORS[0]
      });
    } else {
      await updateProfile(formData);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setIsSettingsOpen(false);
    }, 650);
  };

  const handleDeleteCurrentProfile = async () => {
    if (profiles.length <= 1) return;
    await deleteProfile(profile.id);
    setConfirmDelete(false);
    setIsSettingsOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80 bg-slate-900/80 flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: formData.color || '#9333ea' }}
              >
                {formMode === 'add_member' ? (
                  <UserPlus className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide flex items-center gap-2">
                  {formMode === 'add_member' ? 'Add Family Member' : `Profile: ${profile.name}`}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {formMode === 'add_member'
                    ? 'Isolated charts and dedicated chat history in IndexedDB.'
                    : 'Swiss Ephemeris precision & client-side data isolation.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950 px-4 sm:px-6 py-2 gap-2 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFormMode('edit');
                  setSettingsModalMode('edit');
                  setFormData({ ...profile });
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  formMode === 'edit'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Edit Active ({profile.name})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormMode('add_member');
                  setSettingsModalMode('add_member');
                  setFormData({
                    id: '',
                    name: '',
                    relationship: 'Spouse',
                    birthDate: '1998-01-01',
                    birthTime: '12:00',
                    birthCoordinates: profile.birthCoordinates || {
                      latitude: 13.0827,
                      longitude: 80.2707,
                      placeName: 'Chennai, Tamil Nadu, India'
                    },
                    currentCity: profile.currentCity || 'Chennai',
                    currentState: profile.currentState || 'Tamil Nadu',
                    color: AVATAR_COLORS[(profiles.length + 1) % AVATAR_COLORS.length]
                  });
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  formMode === 'add_member'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Member</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'apikey' ? 'profile' : 'apikey')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition flex items-center gap-1.5 ${
                activeTab === 'apikey'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>BYOK API Key</span>
              {apiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5 animate-pulse" />
              )}
            </button>
          </div>

          <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 no-scrollbar">
              {/* BYOK KEY ACCORDION / HIGHLIGHT (Visible if selected or if key is missing) */}
              {(activeTab === 'apikey' || !apiKey) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2.5 sm:space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                        Gemini API Key (Shared BYOK)
                      </label>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] sm:text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 hover:underline"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    One single API key powers AI oracle readings for <strong>all family profiles</strong>. Stored strictly in your browser's IndexedDB.
                  </p>

                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={localApiKey}
                      onChange={(e) => {
                        setLocalApiKey(e.target.value);
                        setTestStatus('idle');
                      }}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 sm:py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition pr-16 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Zero server storage.
                    </span>
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={testStatus === 'testing' || !localApiKey}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                      {testStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Test Key
                    </button>
                  </div>

                  {testStatus === 'success' && (
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{testMessage}</span>
                    </div>
                  )}

                  {testStatus === 'failed' && (
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{testMessage}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* FAMILY RELATIONSHIP SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Relationship to Main Account</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">
                    (helps AI tailor partner/kin readings)
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {RELATION_OPTIONS.map((item) => {
                    const isSelected = formData.relationship === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, relationship: item.value })}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="truncate w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AVATAR COLOR PICKER */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-xs font-medium text-slate-300">Profile Theme Color</span>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        formData.color === c
                          ? 'ring-2 ring-white scale-110 shadow-lg'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* USER PARTICULARS SECTION */}
              <div className="space-y-3 sm:space-y-3.5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Birth Particulars (Swiss Precision)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyadarshini"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-400"
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-400"
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* LOCATION PICKER */}
                <div className="pt-1">
                  <LocationPicker
                    coordinates={formData.birthCoordinates}
                    currentCity={formData.currentCity}
                    currentState={formData.currentState}
                    onLocationChange={handleLocationChange}
                    onCoordinatesOnlyChange={handleCoordinatesOnlyChange}
                  />
                </div>

                {/* Current Residence (For Remedies) */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5 sm:space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" />
                      Current Residence (For Tailored Remedies & Pariharams)
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      The Oracle uses this to locate Tier 2 district temples & remedies near this member.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Current City</label>
                      <input
                        type="text"
                        required
                        value={formData.currentCity}
                        onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                        placeholder="e.g. Chennai"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
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
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* DELETE PROFILE OPTION (Only in edit mode when more than 1 profile exists) */}
                {formMode === 'edit' && profiles.length > 1 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    {!confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete {profile.name}'s profile...</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-200 space-y-2">
                        <p className="font-medium">
                          Delete {profile.name}'s profile and all their isolated chat history & calculated charts?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDeleteCurrentProfile}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                          >
                            Yes, Permanently Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer Buttons */}
            <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-between gap-2.5 flex-shrink-0">
              <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict data isolation guarantee</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Computing Ephemeris...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      {formMode === 'add_member' ? 'Member Added!' : 'Saved & Calculated!'}
                    </>
                  ) : formMode === 'add_member' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add & Calculate Chart
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Save & Compute Chart
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
