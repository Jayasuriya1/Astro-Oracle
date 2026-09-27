import localforage from 'localforage';
import type { UserProfile, CalculatedAstrologyData, ChatMessage } from '../types/astrology';

// Initialize IndexedDB storage instance
const store = localforage.createInstance({
  name: 'AstroOracleDB',
  storeName: 'astrology_app_data',
  description: 'Client-side storage for Astrology app state, profile, and calculations'
});

const KEYS = {
  USER_PROFILE: 'astro_user_profile',
  API_KEY: 'astro_gemini_api_key',
  CHAT_HISTORY: 'astro_chat_history',
  ASTROLOGY_DATA: 'astro_calculated_charts_v1'
} as const;

export const defaultProfile: UserProfile = {
  name: 'Seeker',
  birthDate: '1995-10-24',
  birthTime: '12:30',
  birthCoordinates: {
    latitude: 13.0827,
    longitude: 80.2707,
    placeName: 'Chennai, Tamil Nadu, India'
  },
  currentCity: 'Chennai',
  currentState: 'Tamil Nadu'
};

export const storageService = {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await store.getItem<UserProfile>(KEYS.USER_PROFILE);
      return data || defaultProfile;
    } catch (e) {
      console.error('Error reading user profile from IndexedDB:', e);
      return defaultProfile;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await store.setItem(KEYS.USER_PROFILE, profile);
  },

  async getApiKey(): Promise<string> {
    try {
      const key = await store.getItem<string>(KEYS.API_KEY);
      return key || '';
    } catch (e) {
      console.error('Error reading API key from IndexedDB:', e);
      return '';
    }
  },

  async saveApiKey(key: string): Promise<void> {
    await store.setItem(KEYS.API_KEY, key.trim());
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const history = await store.getItem<ChatMessage[]>(KEYS.CHAT_HISTORY);
      return history || [];
    } catch (e) {
      console.error('Error reading chat history from IndexedDB:', e);
      return [];
    }
  },

  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    await store.setItem(KEYS.CHAT_HISTORY, messages);
  },

  async clearChatHistory(): Promise<void> {
    await store.removeItem(KEYS.CHAT_HISTORY);
  },

  async getAstrologyData(): Promise<CalculatedAstrologyData | null> {
    try {
      return await store.getItem<CalculatedAstrologyData>(KEYS.ASTROLOGY_DATA);
    } catch (e) {
      console.error('Error reading astrology calculation data:', e);
      return null;
    }
  },

  async saveAstrologyData(data: CalculatedAstrologyData): Promise<void> {
    await store.setItem(KEYS.ASTROLOGY_DATA, data);
  }
};
