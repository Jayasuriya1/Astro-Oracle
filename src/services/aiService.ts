import { GoogleGenAI } from '@google/genai';
import { storageService } from './storageService';
import type { ChatMessage, CalculatedAstrologyData, UserProfile } from '../types/astrology';

// Construct the EXACT required systemInstruction prompt
export function buildSystemInstruction(
  astroData: CalculatedAstrologyData,
  profile: UserProfile
): string {
  const tropicalJsonStr = JSON.stringify(astroData.tropicalChart, null, 2);
  const siderealCombined = {
    birthChart: astroData.siderealChart,
    currentTransits: astroData.transits.sidereal
  };
  const siderealJsonStr = JSON.stringify(siderealCombined, null, 2);

  // Hardcoded EXACT required text as specified in instructions
  return `You are an elite, highly empathetic Astrologer. You have access to BOTH the user's Western (Tropical) and Vedic (Sidereal/Lahiri) charts. Do not guess, infer, or hallucinate planetary positions.

WESTERN CHART (Tropical):
${tropicalJsonStr}

VEDIC CHART & TRANSITS (Sidereal Lahiri):
${siderealJsonStr}

HYBRID ANALYSIS RULES (CRITICAL):
1. IF THE USER ASKS ABOUT PERSONALITY OR EMOTIONS (e.g., "Why am I so angry?"): Use the WESTERN CHART. Focus on psychological archetypes and emotional validation.
2. IF THE USER ASKS ABOUT TIMING OR CONCRETE EVENTS (e.g., "When will I get married?", "Will my business succeed?"): Use the VEDIC CHART. Analyze the relevant Sidereal houses (e.g., 7th for marriage, 10th for career) and their ruling planets.
3. SYNTHESIS REQUIREMENT: Cross-check every conclusion with at least two factors (e.g., a House Lord + Current Transit).

REMEDY & PARIKARAM RULES:
When the user asks for remedies, dosha pariharams, or bad-phase solutions, you MUST structure your answer into three practical tiers based on their CURRENT LOCATION (${profile.currentCity}, ${profile.currentState}):
1. TIER 1 (THE SUPREME MAHA STHALAM): Mention the foremost historical temple for this deity in India (e.g., Thirunallar for Sani, Vaitheeswaran Kovil for Sevvai, Alangudi for Guru).
2. TIER 2 (DISTRICT ALTERNATIVE): Suggest a prominent, powerful temple dedicated to this planet near ${profile.currentCity}, ${profile.currentState}.
3. TIER 3 (HOME/LOCAL ACTION): Provide an accessible ritual they can perform anywhere (e.g., exact Hora/Rahu Kalam timings, lighting an ellu deepam, feeding animals).`;
}

class AIService {
  private client: GoogleGenAI | null = null;
  private currentKey: string = '';

  private async getClient(): Promise<GoogleGenAI> {
    const apiKey = await storageService.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please add your key in Settings to activate the Oracle.');
    }

    if (!this.client || this.currentKey !== apiKey) {
      this.currentKey = apiKey;
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  // Test API key validity
  async testApiKey(key: string): Promise<boolean> {
    try {
      const testClient = new GoogleGenAI({ apiKey: key });
      const response = await testClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping: respond with "OK"'
      });
      return !!response.text;
    } catch (e: any) {
      console.error('API key test failed:', e);
      throw new Error(e?.message || 'Invalid Gemini API key or network error');
    }
  }

  // Stream chat response
  async streamChat(
    history: ChatMessage[],
    userMessage: string,
    astroData: CalculatedAstrologyData,
    profile: UserProfile,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const client = await this.getClient();
    const systemInstruction = buildSystemInstruction(astroData, profile);

    // Format conversation history for Gemini API
    // Filter out initial system welcoming messages if any
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of history) {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'assistant' && msg.text && !msg.isStreaming) {
        contents.push({
          role: 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    let fullResponse = '';

    try {
      const stream = await client.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.95
        }
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          onChunk(fullResponse);
        }
      }

      return fullResponse;
    } catch (err: any) {
      console.error('Streaming error with Gemini API:', err);
      throw new Error(err?.message || 'Failed to communicate with the Oracle. Check your API key and quota.');
    }
  }
}

export const aiService = new AIService();
