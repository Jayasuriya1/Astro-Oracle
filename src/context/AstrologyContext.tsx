import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfile, CalculatedAstrologyData, ChatMessage } from '../types/astrology';
import { storageService, defaultProfile } from '../services/storageService';
import { astrologyEngine } from '../services/astrologyEngine';
import { aiService } from '../services/aiService';

interface AstrologyContextType {
  profile: UserProfile;
  apiKey: string;
  astrologyData: CalculatedAstrologyData | null;
  chatHistory: ChatMessage[];
  isCalculating: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
  isSettingsOpen: boolean;
  activeView: 'chat' | 'charts' | 'transits';
  setActiveView: (view: 'chat' | 'charts' | 'transits') => void;
  setIsSettingsOpen: (open: boolean) => void;
  updateProfile: (newProfile: UserProfile) => Promise<void>;
  updateApiKey: (key: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  recalculate: () => Promise<void>;
  clearError: () => void;
}

const AstrologyContext = createContext<AstrologyContextType | undefined>(undefined);

export const AstrologyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [apiKey, setApiKey] = useState<string>('');
  const [astrologyData, setAstrologyData] = useState<CalculatedAstrologyData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'chat' | 'charts' | 'transits'>('chat');

  // Load persisted data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setIsCalculating(true);
        const [savedProfile, savedKey, savedChat, cachedAstro] = await Promise.all([
          storageService.getUserProfile(),
          storageService.getApiKey(),
          storageService.getChatHistory(),
          storageService.getAstrologyData()
        ]);

        if (!isMounted) return;

        setProfile(savedProfile);
        setApiKey(savedKey);
        setChatHistory(savedChat);

        // Prompt settings modal if no API key is present
        if (!savedKey) {
          setIsSettingsOpen(true);
        }

        // Calculate charts or load cached
        try {
          const freshData = await astrologyEngine.calculateAll(savedProfile);
          if (isMounted) setAstrologyData(freshData);
        } catch (calcErr: any) {
          console.error('Calculation error on load, falling back to cache:', calcErr);
          if (cachedAstro && isMounted) {
            setAstrologyData(cachedAstro);
          } else {
            setError('Failed to compute celestial coordinates: ' + (calcErr?.message || 'WASM error'));
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError('Failed to load local astrological database.');
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update profile and recalculate
  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      setIsCalculating(true);
      setError(null);
      setProfile(newProfile);
      await storageService.saveUserProfile(newProfile);

      const calculated = await astrologyEngine.calculateAll(newProfile);
      setAstrologyData(calculated);
    } catch (err: any) {
      console.error('Error recalculating profile:', err);
      setError('Failed to recalculate chart: ' + (err?.message || 'Calculation error'));
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Update API Key
  const updateApiKey = useCallback(async (key: string) => {
    setApiKey(key);
    await storageService.saveApiKey(key);
  }, []);

  // Manual recalculate
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

  // Clear chat history
  const clearChat = useCallback(async () => {
    setChatHistory([]);
    await storageService.clearChatHistory();
  }, []);

  // Send message to Oracle
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Please provide your Gemini API key in Settings to activate the Oracle.');
      return;
    }

    let currentAstroData = astrologyData;
    if (!currentAstroData) {
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
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    await storageService.saveChatHistory(updatedHistory);

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
        sender: 'assistant',
        text: finalReply || accumulatedText,
        timestamp: Date.now()
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      setChatHistory(finalHistory);
      await storageService.saveChatHistory(finalHistory);
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
        apiKey,
        astrologyData,
        chatHistory,
        isCalculating,
        isStreaming,
        streamingMessage,
        error,
        isSettingsOpen,
        activeView,
        setActiveView,
        setIsSettingsOpen,
        updateProfile,
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
