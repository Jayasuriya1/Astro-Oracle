import localforage from 'localforage';
import type { UserProfile, CalculatedAstrologyData, ChatMessage, BackupPackage } from '../types/astrology';

// Initialize IndexedDB storage instance
const store = localforage.createInstance({
  name: 'AstroOracleDB',
  storeName: 'astrology_app_data',
  description: 'Client-side storage for Astrology app state, multi-family profiles, and calculations'
});

const KEYS = {
  PROFILES_LIST: 'astro_family_profiles_v2',
  ACTIVE_PROFILE_ID: 'astro_active_profile_id_v2',
  API_KEY: 'astro_gemini_api_key',
  // Prefixes for per-profile isolation
  CHAT_PREFIX: 'astro_chat_',
  CHART_PREFIX: 'astro_chart_',
  // Legacy keys for migration
  LEGACY_USER_PROFILE: 'astro_user_profile',
  LEGACY_CHAT_HISTORY: 'astro_chat_history',
  LEGACY_ASTROLOGY_DATA: 'astro_calculated_charts_v1'
} as const;

export const defaultProfile: UserProfile = {
  id: 'prof_primary',
  name: 'Seeker',
  relationship: 'Self',
  birthDate: '1995-10-24',
  birthTime: '12:30',
  birthCoordinates: {
    latitude: 13.0827,
    longitude: 80.2707,
    placeName: 'Chennai, Tamil Nadu, India'
  },
  currentCity: 'Chennai',
  currentState: 'Tamil Nadu',
  color: '#a855f7',
  createdAt: Date.now()
};

export const storageService = {
  // Retrieve all family profiles, migrating from single-profile legacy storage if present
  async getProfiles(): Promise<UserProfile[]> {
    try {
      const profiles = await store.getItem<UserProfile[]>(KEYS.PROFILES_LIST);
      if (profiles && profiles.length > 0) {
        return profiles;
      }

      // Check legacy profile for migration
      const legacyProfile = await store.getItem<any>(KEYS.LEGACY_USER_PROFILE);
      if (legacyProfile) {
        const migratedProfile: UserProfile = {
          ...legacyProfile,
          id: legacyProfile.id || 'prof_primary',
          relationship: legacyProfile.relationship || 'Self',
          createdAt: Date.now()
        };

        // Migrate legacy chat and charts to this profile
        const legacyChat = await store.getItem<ChatMessage[]>(KEYS.LEGACY_CHAT_HISTORY);
        if (legacyChat && legacyChat.length > 0) {
          await store.setItem(KEYS.CHAT_PREFIX + migratedProfile.id, legacyChat);
        }

        const legacyAstro = await store.getItem<any>(KEYS.LEGACY_ASTROLOGY_DATA);
        if (legacyAstro) {
          await store.setItem(KEYS.CHART_PREFIX + migratedProfile.id, {
            ...legacyAstro,
            profileId: migratedProfile.id
          });
        }

        const initialList = [migratedProfile];
        await store.setItem(KEYS.PROFILES_LIST, initialList);
        await store.setItem(KEYS.ACTIVE_PROFILE_ID, migratedProfile.id);
        return initialList;
      }

      // First time initialization
      const initialList = [defaultProfile];
      await store.setItem(KEYS.PROFILES_LIST, initialList);
      await store.setItem(KEYS.ACTIVE_PROFILE_ID, defaultProfile.id);
      return initialList;
    } catch (e) {
      console.error('Error reading profiles from IndexedDB:', e);
      return [defaultProfile];
    }
  },

  async saveProfiles(profiles: UserProfile[]): Promise<void> {
    await store.setItem(KEYS.PROFILES_LIST, profiles);
  },

  async getActiveProfileId(): Promise<string> {
    try {
      const activeId = await store.getItem<string>(KEYS.ACTIVE_PROFILE_ID);
      if (activeId) return activeId;
      const profiles = await this.getProfiles();
      return profiles[0]?.id || defaultProfile.id;
    } catch (e) {
      return defaultProfile.id;
    }
  },

  async setActiveProfileId(id: string): Promise<void> {
    await store.setItem(KEYS.ACTIVE_PROFILE_ID, id);
  },

  // Per-profile isolated chat history
  async getChatHistory(profileId: string): Promise<ChatMessage[]> {
    try {
      const history = await store.getItem<ChatMessage[]>(KEYS.CHAT_PREFIX + profileId);
      return history || [];
    } catch (e) {
      console.error(`Error reading chat history for profile ${profileId}:`, e);
      return [];
    }
  },

  async saveChatHistory(profileId: string, messages: ChatMessage[]): Promise<void> {
    await store.setItem(KEYS.CHAT_PREFIX + profileId, messages);
  },

  async clearChatHistory(profileId: string): Promise<void> {
    await store.removeItem(KEYS.CHAT_PREFIX + profileId);
  },

  // Per-profile isolated astrology calculations
  async getAstrologyData(profileId: string): Promise<CalculatedAstrologyData | null> {
    try {
      return await store.getItem<CalculatedAstrologyData>(KEYS.CHART_PREFIX + profileId);
    } catch (e) {
      console.error(`Error reading astrology data for profile ${profileId}:`, e);
      return null;
    }
  },

  async saveAstrologyData(profileId: string, data: CalculatedAstrologyData): Promise<void> {
    await store.setItem(KEYS.CHART_PREFIX + profileId, data);
  },

  // Global BYOK Gemini API Key (shared across all family profiles)
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

  // Delete profile and clean up all associated chat history and calculated charts
  async deleteProfile(profileId: string): Promise<void> {
    const profiles = await this.getProfiles();
    const updated = profiles.filter(p => p.id !== profileId);
    await this.saveProfiles(updated);
    await store.removeItem(KEYS.CHAT_PREFIX + profileId);
    await store.removeItem(KEYS.CHART_PREFIX + profileId);
  },

  // Export all IndexedDB state into a single portable backup object
  async exportBackup(): Promise<BackupPackage> {
    const profiles = await this.getProfiles();
    const activeProfileId = await this.getActiveProfileId();
    const apiKey = await this.getApiKey();

    const chats: Record<string, ChatMessage[]> = {};
    const charts: Record<string, CalculatedAstrologyData> = {};

    for (const p of profiles) {
      const chat = await this.getChatHistory(p.id);
      if (chat && chat.length > 0) {
        chats[p.id] = chat;
      }
      const chart = await this.getAstrologyData(p.id);
      if (chart) {
        charts[p.id] = chart;
      }
    }

    return {
      app: 'AstroOracle',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      apiKey,
      activeProfileId,
      profiles,
      chats,
      charts
    };
  },

  // Import and restore IndexedDB state from a backup package
  async importBackup(backup: BackupPackage): Promise<void> {
    if (!backup || typeof backup !== 'object') {
      throw new Error('Invalid backup file payload.');
    }
    if (!Array.isArray(backup.profiles) || backup.profiles.length === 0) {
      throw new Error('No family profiles found in backup payload.');
    }

    // Restore API key if present
    if (typeof backup.apiKey === 'string') {
      await this.saveApiKey(backup.apiKey);
    }

    // Restore profiles list
    await this.saveProfiles(backup.profiles);

    // Restore active profile ID
    const validActiveId = backup.profiles.some(p => p.id === backup.activeProfileId)
      ? backup.activeProfileId
      : backup.profiles[0].id;
    await this.setActiveProfileId(validActiveId);

    // Restore isolated chat history for each profile
    if (backup.chats && typeof backup.chats === 'object') {
      for (const profileId of Object.keys(backup.chats)) {
        if (Array.isArray(backup.chats[profileId])) {
          await this.saveChatHistory(profileId, backup.chats[profileId]);
        }
      }
    }

    // Restore calculated chart data for each profile
    if (backup.charts && typeof backup.charts === 'object') {
      for (const profileId of Object.keys(backup.charts)) {
        if (backup.charts[profileId]) {
          await this.saveAstrologyData(profileId, backup.charts[profileId]);
        }
      }
    }
  }
};
