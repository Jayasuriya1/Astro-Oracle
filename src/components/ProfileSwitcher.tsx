import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Check,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAstrology } from '../context/AstrologyContext';
import type { UserProfile, FamilyRelationship } from '../types/astrology';

const RELATION_BADGES: Record<FamilyRelationship, { label: string; color: string }> = {
  Self: { label: 'Self', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  Spouse: { label: 'Spouse', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  Father: { label: 'Father', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Mother: { label: 'Mother', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  Child: { label: 'Child', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  Sibling: { label: 'Sibling', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  Partner: { label: 'Partner', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Friend: { label: 'Friend', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  Other: { label: 'Member', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

export const ProfileSwitcher: React.FC<{ onOpenAddProfile?: () => void }> = ({
  onOpenAddProfile
}) => {
  const {
    profile,
    profiles,
    switchProfile,
    apiKey,
    isCalculating,
    setIsSettingsOpen
  } = useAstrology();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProfile = async (targetProfile: UserProfile) => {
    if (targetProfile.id === profile.id) {
      setIsOpen(false);
      return;
    }
    await switchProfile(targetProfile.id);
    setIsOpen(false);
  };

  const relInfo = RELATION_BADGES[profile.relationship || 'Self'] || RELATION_BADGES.Self;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Profile Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition shadow-sm group"
      >
        {/* Status Dot */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          {isCalculating ? (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          ) : apiKey ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>

        {/* Profile Name & Relationship */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold tracking-wide text-slate-100 max-w-[85px] sm:max-w-[130px] truncate">
            {profile.name}
          </span>
          <span
            className={`px-1.5 py-0.2 text-[9px] rounded-md border font-medium hidden xs:inline ${relInfo.color}`}
          >
            {relInfo.label}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden divide-y divide-slate-800/80"
          >
            {/* Header info */}
            <div className="p-3.5 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Family & Profiles
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                One API key shares all profiles. Charts & chat histories stay 100% strictly separated.
              </p>
            </div>

            {/* Profiles List */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
              {profiles.map((p) => {
                const isActive = p.id === profile.id;
                const pRel = RELATION_BADGES[p.relationship || 'Self'] || RELATION_BADGES.Self;
                const initial = (p.name || 'S').charAt(0).toUpperCase();

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between group ${
                      isActive
                        ? 'bg-purple-950/50 border border-purple-500/40 shadow-sm'
                        : 'hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 text-white shadow"
                        style={{
                          backgroundColor: p.color || (isActive ? '#9333ea' : '#334155')
                        }}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                            {p.name}
                          </p>
                          <span className={`px-1.5 py-0.2 text-[9px] rounded border font-medium ${pRel.color}`}>
                            {pRel.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {p.birthDate} • {p.currentCity}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1 text-amber-400 flex-shrink-0 pl-2">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions Footer */}
            <div className="p-2 bg-slate-950/80 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenAddProfile) {
                    onOpenAddProfile();
                  } else {
                    setIsSettingsOpen(true);
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>+ Add Family Member / New Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Profile & API Key</span>
                </span>
                {!apiKey && (
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Key Needed
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
