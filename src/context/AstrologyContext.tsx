import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfile, CalculatedAstrologyData, ChatMessage } from '../types/astrology';
import { storageService, defaultProfile } from '../services/storageService';
import { astrologyEngine } from '../services/astrologyEngine';
import { aiService } from '../services/aiService';

interface AstrologyContextType {
  profile: UserProfile;
  profiles: UserProfile[];
  apiKey: string;
  astrologyData: CalculatedAstrologyData | null;
  chatHistory: ChatMessage[];
  isCalculating: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
  isSettingsOpen: boolean;
  settingsModalMode: 'edit' | 'add_member';
  setSettingsModalMode: (mode: 'edit' | 'add_member') => void;
  activeView: 'chat' | 'charts' | 'transits';
  setActiveView: (view: 'chat' | 'charts' | 'transits') => void;
  setIsSettingsOpen: (open: boolean) => void;
  switchProfile: (profileId: string) => Promise<void>;
  addProfile: (newProfileData: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (updatedProfile: UserProfile) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  updateApiKey: (key: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  recalculate: () => Promise<void>;
  clearError: () => void;
}

const AstrologyContext = createContext<AstrologyContextType | undefined>(undefined);

export const AstrologyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([defaultProfile]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [apiKey, setApiKey] = useState<string>('');
  const [astrologyData, setAstrologyData] = useState<CalculatedAstrologyData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsModalMode, setSettingsModalMode] = useState<'edit' | 'add_member'>('edit');
  const [activeView, setActiveView] = useState<'chat' | 'charts' | 'transits'>('chat');

  // Load initial profiles, active profile, and isolated data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsCalculating(true);
        const [savedProfiles, activeId, savedKey] = await Promise.all([
          storageService.getProfiles(),
          storageService.getActiveProfileId(),
          storageService.getApiKey()
        ]);

        if (!isMounted) return;

        setProfiles(savedProfiles);
        setApiKey(savedKey);

        const current = savedProfiles.find(p => p.id === activeId) || savedProfiles[0] || defaultProfile;
        setProfile(current);

        // Load isolated chat history & astrology calculations for this active profile
        const [isolatedChat, cachedChart] = await Promise.all([
          storageService.getChatHistory(current.id),
          storageService.getAstrologyData(current.id)
        ]);

        if (!isMounted) return;
        setChatHistory(isolatedChat);

        if (cachedChart) {
          setAstrologyData(cachedChart);
        } else {
          try {
            const calculated = await astrologyEngine.calculateAll(current);
            if (isMounted) setAstrologyData(calculated);
          } catch (calcErr: any) {
            console.error('Calculation error for active profile:', calcErr);
          }
        }

        if (!savedKey) {
          setIsSettingsOpen(true);
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError('Failed to load local astrological profiles.');
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Switch to another family profile with 100% strict isolation
  const switchProfile = useCallback(async (profileId: string) => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;

    try {
      setIsCalculating(true);
      setError(null);
      setProfile(target);
      await storageService.setActiveProfileId(target.id);

      // Load target profile's isolated chat history
      const profileChat = await storageService.getChatHistory(target.id);
      setChatHistory(profileChat);

      // Load or calculate target profile's astrology data
      let profileAstro = await storageService.getAstrologyData(target.id);
      if (!profileAstro) {
        profileAstro = await astrologyEngine.calculateAll(target);
      }
      setAstrologyData(profileAstro);
    } catch (err: any) {
      console.error(`Error switching to profile ${profileId}:`, err);
      setError(`Failed to load astrology data for ${target.name}.`);
    } finally {
      setIsCalculating(false);
    }
  }, [profiles]);

  // Add new family profile
  const addProfile = useCallback(async (newProfileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    try {
      setIsCalculating(true);
      setError(null);

      const newId = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newFullProfile: UserProfile = {
        ...newProfileData,
        id: newId,
        createdAt: Date.now()
      };

      const updatedList = [...profiles, newFullProfile];
      setProfiles(updatedList);
      setProfile(newFullProfile);
      setChatHistory([]); // Brand new isolated chat history

      await Promise.all([
        storageService.saveProfiles(updatedList),
        storageService.setActiveProfileId(newId),
        storageService.saveChatHistory(newId, [])
      ]);

      // Calculate charts for the new family member
      const calculated = await astrologyEngine.calculateAll(newFullProfile);
      setAstrologyData(calculated);
    } catch (err: any) {
      console.error('Error adding profile:', err);
      setError('Failed to calculate chart for new profile: ' + (err?.message || 'Error'));
    } finally {
      setIsCalculating(false);
    }
  }, [profiles]);

  // Update existing active profile
  const updateProfile = useCallback(async (updatedProfile: UserProfile) => {
    try {
      setIsCalculating(true);
      setError(null);

      const updatedList = profiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p));
      setProfiles(updatedList);
      setProfile(updatedProfile);
      await storageService.saveProfiles(updatedList);

      // Recalculate chart for this profile
      const calculated = await astrologyEngine.calculateAll(updatedProfile);
      setAstrologyData(calculated);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to recalculate chart: ' + (err?.message || 'Error'));
    } finally {
      setIsCalculating(false);
    }
  }, [profiles]);

  // Delete family profile
  const deleteProfile = useCallback(async (profileId: string) => {
    if (profiles.length <= 1) {
      setError('You must keep at least one profile.');
      return;
    }

    try {
      setIsCalculating(true);
      await storageService.deleteProfile(profileId);

      const remaining = profiles.filter(p => p.id !== profileId);
      setProfiles(remaining);

      // If active profile was deleted, switch to the first remaining profile
      if (profile.id === profileId) {
        const nextProfile = remaining[0];
        setProfile(nextProfile);
        await storageService.setActiveProfileId(nextProfile.id);

        const [nextChat, nextAstro] = await Promise.all([
          storageService.getChatHistory(nextProfile.id),
          storageService.getAstrologyData(nextProfile.id)
        ]);
        setChatHistory(nextChat);
        setAstrologyData(nextAstro);
      }
    } catch (err: any) {
      setError('Failed to delete profile: ' + (err?.message || 'Error'));
    } finally {
      setIsCalculating(false);
    }
  }, [profile.id, profiles]);

  // Update API Key
  const updateApiKey = useCallback(async (key: string) => {
    setApiKey(key);
    await storageService.saveApiKey(key);
  }, []);

  // Manual recalculate for current profile
  const recalculate = useCallback(async () => {
    try {
      setIsCalculating(true);
      setError(null);
      const calculated = await astrologyEngine.calculateAll(profile);
      setAstrologyData(calculated);
    } catch (err: any) {
      setError('Recalculation error: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsCalculating(false);
    }
  }, [profile]);

  // Clear chat history for currently active profile only
  const clearChat = useCallback(async () => {
    setChatHistory([]);
    await storageService.clearChatHistory(profile.id);
  }, [profile.id]);

  // Send message to Oracle for currently active profile
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Please provide your Gemini API key in Settings to activate the Oracle.');
      return;
    }

    let currentAstroData = astrologyData;
    if (!currentAstroData || currentAstroData.profileId !== profile.id) {
      try {
        setIsCalculating(true);
        currentAstroData = await astrologyEngine.calculateAll(profile);
        setAstrologyData(currentAstroData);
      } catch (err: any) {
        setError('Cannot consult the Oracle without calculated planetary charts.');
        setIsCalculating(false);
        return;
      } finally {
        setIsCalculating(false);
      }
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      profileId: profile.id,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    await storageService.saveChatHistory(profile.id, updatedHistory);

    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);

    try {
      let accumulatedText = '';
      const finalReply = await aiService.streamChat(
        updatedHistory,
        text,
        currentAstroData,
        profile,
        (chunk) => {
          accumulatedText = chunk;
          setStreamingMessage(chunk);
        }
      );

      const assistantMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-assistant',
        profileId: profile.id,
        sender: 'assistant',
        text: finalReply || accumulatedText,
        timestamp: Date.now()
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      setChatHistory(finalHistory);
      await storageService.saveChatHistory(profile.id, finalHistory);
    } catch (err: any) {
      console.error('Error generating astrology reading:', err);
      setError(err?.message || 'An error occurred while connecting to the celestial intelligence.');
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [apiKey, astrologyData, chatHistory, isStreaming, profile]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AstrologyContext.Provider
      value={{
        profile,
        profiles,
        apiKey,
        astrologyData,
        chatHistory,
        isCalculating,
        isStreaming,
        streamingMessage,
        error,
        isSettingsOpen,
        settingsModalMode,
        setSettingsModalMode,
        activeView,
        setActiveView,
        setIsSettingsOpen,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        updateApiKey,
        sendMessage,
        clearChat,
        recalculate,
        clearError
      }}
    >
      {children}
    </AstrologyContext.Provider>
  );
};

export const useAstrology = (): AstrologyContextType => {
  const context = useContext(AstrologyContext);
  if (!context) {
    throw new Error('useAstrology must be used within an AstrologyProvider');
  }
  return context;
};
