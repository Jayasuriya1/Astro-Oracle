import { GoogleGenAI } from '@google/genai';
import { storageService } from './storageService';
import type { ChatMessage, CalculatedAstrologyData, UserProfile } from '../types/astrology';

// Construct a concise, token-efficient astrological summary instead of a massive raw JSON dump
export function buildSystemInstruction(
  astroData: CalculatedAstrologyData,
  profile: UserProfile
): string {
  const { siderealChart, tropicalChart, transits } = astroData;
  const currentDasha = siderealChart?.dashaReport?.currentMahadasha;
  const currentAntardasha = currentDasha?.antardashas?.find((a) => a.isCurrent);

  // Compact Sidereal Lahiri Birth Placements
  const siderealLines = siderealChart?.planets
    ? [
        `Lagna (Ascendant): ${siderealChart.lagna.sign} (${siderealChart.lagna.formattedDegree}), Nakshatra: ${siderealChart.lagna.nakshatra || ''} P${siderealChart.lagna.pada || 1}`,
        ...siderealChart.planets.map(
          (p) =>
            `- ${p.name}: ${p.sign} (${p.formattedDegree}) in House ${p.house}, Nakshatra: ${p.nakshatra} P${p.nakshatraPada}, Lord: ${p.nakshatraLord}${p.isRetrograde ? ' (Retrograde)' : ''}`
        )
      ].join('\n')
    : '';

  // Compact Navamsha D9
  const navamshaLines = siderealChart?.navamshaChart
    ? `D9 Lagna: ${siderealChart.navamshaChart.lagna.sign}\nD9 Planets: ` +
      siderealChart.navamshaChart.planets.map((p) => `${p.name}: ${p.sign}`).join(', ')
    : '';

  // Compact Live Transits (Gochar)
  const transitLines = transits?.sidereal?.planets
    ? transits.sidereal.planets
        .map((p) => `${p.name}: ${p.sign} (${p.formattedDegree})${p.isRetrograde ? ' (R)' : ''}`)
        .join(', ')
    : '';

  // Compact Western (Tropical Placidus)
  const tropicalLines = tropicalChart
    ? [
        `Ascendant: ${tropicalChart.ascendant?.formattedDegree || ''}, Midheaven: ${tropicalChart.midheaven?.formattedDegree || ''}`,
        'Planets: ' +
          tropicalChart.planets
            .map((p) => `${p.name} in ${p.sign} (${p.formattedDegree}, H${p.house})`)
            .join(', '),
        'Key Aspects: ' +
          tropicalChart.aspects
            .slice(0, 10)
            .map((a) => `${a.planet1} ${a.aspectType} ${a.planet2} (${a.orb.toFixed(1)}°)`)
            .join(', ')
      ].join('\n')
    : '';

  const dashaInfo = currentDasha
    ? `ACTIVE VIMSHOTTARI TIMELINE:
- Current Mahadasha: ${currentDasha.lord} (${currentDasha.startDate} to ${currentDasha.endDate}, ${currentDasha.percentagePassed}% elapsed)
- Current Antardasha (Bhukti): ${currentDasha.lord} / ${currentAntardasha ? currentAntardasha.lord : 'Active'} (${currentAntardasha ? `${currentAntardasha.startDate} to ${currentAntardasha.endDate}` : ''})`
    : '';

  return `You are an elite, highly empathetic Astrologer. You have access to BOTH the user's Western (Tropical) and Vedic (Sidereal/Lahiri) charts. Do not guess, infer, or hallucinate planetary positions.

NATIVE PROFILE: ${profile.name} (Born: ${profile.birthDate} at ${profile.birthTime}, ${profile.currentCity || ''}, ${profile.currentState || ''})

SIDEREAL (VEDIC LAHIRI) BIRTH CHART:
${siderealLines}

${navamshaLines ? `D9 NAVAMSHA CHART:\n${navamshaLines}\n` : ''}
${transitLines ? `CURRENT VEDIC TRANSITS (GOCHAR):\n${transitLines}\n` : ''}
${dashaInfo ? `${dashaInfo}\n` : ''}
WESTERN (TROPICAL PLACIDUS) CHART:
${tropicalLines}

HYBRID ANALYSIS RULES:
1. IF THE USER ASKS ABOUT PERSONALITY OR EMOTIONS (e.g., "Why am I so angry?"): Use the WESTERN CHART. Focus on psychological archetypes and emotional validation.
2. IF THE USER ASKS ABOUT TIMING OR CONCRETE EVENTS (e.g., "When will I get married?", "Will my business succeed?"): Use the VEDIC CHART. Analyze the relevant Sidereal houses (e.g., 7th for marriage, 10th for career) and their ruling planets.
3. SYNTHESIS REQUIREMENT: Cross-check every conclusion with at least two factors (e.g., a House Lord + Current Transit).
4. FLUID, CONVERSATIONAL & DIRECT RESPONSES:
Answer the user's specific inquiry directly and naturally. Do NOT force a rigid, repeated template or standardized headings (e.g. do not repeat "Executive Summary", "Psychological Blueprint", etc. unless the user asks for a comprehensive full-chart analysis). Provide personalized, engaging, and clear insights tailored specifically to their question.

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

  // Test API key validity directly against the lightweight free-tier model
  async testApiKey(key: string): Promise<boolean> {
    try {
      const testClient = new GoogleGenAI({ apiKey: key });
      const response = await testClient.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: 'Ping: respond with "OK"'
      });
      return !!response.text;
    } catch (e: any) {
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('permission_denied') || msg.includes('unauthenticated')) {
        throw new Error('Invalid Gemini API key. Please check your key in Settings.');
      }
      throw new Error(e?.message || 'Unable to connect to Gemini API. Please check your network and API key.');
    }
  }

  // Stream chat response using the lightweight, free-tier optimized Gemini model (gemini-3.5-flash-lite)
  async streamChat(
    history: ChatMessage[],
    userMessage: string,
    astroData: CalculatedAstrologyData,
    profile: UserProfile,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const client = await this.getClient();
    const systemInstruction = buildSystemInstruction(astroData, profile);

    // Keep payload fast and light: use sliding window of the last 8 messages
    const recentHistory = history.slice(-8);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of recentHistory) {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'assistant' && msg.text && !msg.isStreaming) {
        // Cap past assistant messages to avoid token blow-up
        const textContent = msg.text.length > 2500 ? msg.text.slice(0, 2500) + '...' : msg.text;
        contents.push({
          role: 'model',
          parts: [{ text: textContent }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Single direct call to safe free-tier model — no fallback loop
    const model = 'gemini-3.5-flash-lite';
    let fullResponse = '';

    try {
      const stream = await client.models.generateContentStream({
        model,
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

      if (!fullResponse) {
        throw new Error('Received empty response from the astrological oracle.');
      }

      return fullResponse;
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (
        msg.includes('api_key_invalid') ||
        msg.includes('api key not valid') ||
        msg.includes('permission_denied') ||
        msg.includes('unauthenticated')
      ) {
        throw new Error('Invalid Gemini API Key. Please update your key in Settings.');
      }
      if (msg.includes('resource_exhausted') || msg.includes('429') || msg.includes('quota')) {
        throw new Error('Gemini free-tier quota/rate limit reached. Please wait a moment and try again.');
      }
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('unavailable') || msg.includes('overloaded')) {
        throw new Error('Gemini service is temporarily experiencing high demand. Please try again in a few moments.');
      }

      throw new Error(err?.message || 'Error communicating with Gemini API.');
    }
  }
}

export const aiService = new AIService();
