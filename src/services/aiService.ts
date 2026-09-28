import { GoogleGenAI } from '@google/genai';
import { storageService } from './storageService';
import type { ChatMessage, CalculatedAstrologyData, UserProfile } from '../types/astrology';

export function buildSystemInstruction(
  astroData: CalculatedAstrologyData,
  profile: UserProfile,
  language: 'en' | 'ta' = 'en',
  chatSummary?: string
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

  let prompt = `You are an elite, highly empathetic Astrologer. You have access to BOTH the user's Western (Tropical) and Vedic (Sidereal/Lahiri) charts. Do not guess, infer, or hallucinate planetary positions.

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


REMEDY & PARIKARAM RULES:
When the user asks for remedies, dosha pariharams, or bad-phase solutions, you MUST structure your answer into three practical tiers based on their CURRENT LOCATION (${profile.currentCity}, ${profile.currentState}):
1. TIER 1 (THE SUPREME MAHA STHALAM): Mention the foremost historical temple for this deity in India (e.g., Thirunallar for Sani, Vaitheeswaran Kovil for Sevvai, Alangudi for Guru).
2. TIER 2 (DISTRICT ALTERNATIVE): Suggest a prominent, powerful temple dedicated to this planet near ${profile.currentCity}, ${profile.currentState}.
3. TIER 3 (HOME/LOCAL ACTION): Provide an accessible ritual they can perform anywhere (e.g., exact Hora/Rahu Kalam timings, lighting an ellu deepam, feeding animals).`;

  if (chatSummary && chatSummary.trim()) {
    prompt += `\n\nCONCISE RUNNING SUMMARY OF PRIOR CONVERSATION WITH ${profile.name.toUpperCase()}:\n${chatSummary.trim()}`;
  }

  if (language === 'ta') {
    prompt += `\n\nSTRICT BILINGUAL LANGUAGE DIRECTIVE:
The user has selected Tamil. Output your entire analysis, astrological interpretations, and temple remedies in clear, respectful, natural Tamil (தமிழ் ஜோதிட பலன்கள் மற்றும் பரிகாரங்கள்). Do not transliterate; use formal Tamil astrological terminology (லக்னம், தசா புத்தி, கோச்சாரம், பரிகாரம்).`;
  }

  return prompt;
}


/**
 * Primary High-Quality Gemini Chat Models (20 RPD free-tier cap per model)
 */
const PRIMARY_CHAT_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash'
];

/**
 * Emergency Backup Lite Models (Used ONLY if all primary models are exhausted for the day)
 */
const EMERGENCY_LITE_MODELS = [
  'gemini-3.5-flash-lite'
];

/**
 * Fast & Cheap Models for API Key Connection Test
 */
const TEST_API_KEY_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

/**
 * Fast & Cheap Models for Background Chat Summarization
 */
const SUMMARIZER_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

const DAILY_MODEL_SAFE_LIMIT = 18; // Switch model before hitting hard 20 RPD free-tier cap

interface ModelUsageState {
  dateStr: string;
  counts: Record<string, number>;
  exhausted: Record<string, boolean>;
}

// Align date with Google Gemini API midnight UTC quota reset time
function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function saveModelUsageState(state: ModelUsageState): void {
  try {
    localStorage.setItem('astro_gemini_model_usage', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving Gemini model usage state:', e);
  }
}

function getModelUsageState(): ModelUsageState {
  const today = getTodayDateStr();
  try {
    const raw = localStorage.getItem('astro_gemini_model_usage');
    if (raw) {
      const parsed: ModelUsageState = JSON.parse(raw);
      if (parsed && parsed.dateStr === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading Gemini model usage state:', e);
  }
  // Auto-reset state for new day (midnight UTC) and sync to storage immediately
  const freshState: ModelUsageState = { dateStr: today, counts: {}, exhausted: {} };
  saveModelUsageState(freshState);
  return freshState;
}

function incrementModelUsage(modelName: string): void {
  const state = getModelUsageState();
  state.counts[modelName] = (state.counts[modelName] || 0) + 1;
  saveModelUsageState(state);
}

function markModelExhausted(modelName: string): void {
  const state = getModelUsageState();
  state.exhausted[modelName] = true;
  saveModelUsageState(state);
}

function getCandidateChatModels(): string[] {
  const state = getModelUsageState();
  const primaryAvailable: string[] = [];
  const primaryExhausted: string[] = [];

  for (const model of PRIMARY_CHAT_MODELS) {
    const count = state.counts[model] || 0;
    const isExhausted = state.exhausted[model] || false;

    if (!isExhausted && count < DAILY_MODEL_SAFE_LIMIT) {
      primaryAvailable.push(model);
    } else {
      primaryExhausted.push(model);
    }
  }

  const liteAvailable: string[] = [];
  const liteExhausted: string[] = [];

  for (const model of EMERGENCY_LITE_MODELS) {
    const count = state.counts[model] || 0;
    const isExhausted = state.exhausted[model] || false;

    if (!isExhausted && count < DAILY_MODEL_SAFE_LIMIT) {
      liteAvailable.push(model);
    } else {
      liteExhausted.push(model);
    }
  }

  // Priority Order:
  // 1. Available Primary High-Quality Flash Models
  // 2. Daily Exhausted Primary Models (retry if day reset or quota freed)
  // 3. Available Emergency Lite Models (last resort)
  // 4. Exhausted Emergency Lite Models
  return [
    ...primaryAvailable,
    ...primaryExhausted,
    ...liteAvailable,
    ...liteExhausted
  ];
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

  // Silent background summarization of chat history using Lite / Gemma models
  async summarizeChatHistory(history: ChatMessage[], profileId: string): Promise<string> {
    if (!history || history.length < 3) {
      return '';
    }

    try {
      const client = await this.getClient();
      // Format recent transcript turns
      const transcriptLines = history.slice(-10).map((m) => {
        const senderLabel = m.sender === 'user' ? 'Native User' : 'Astrologer Oracle';
        const cleanText = m.text.length > 500 ? m.text.slice(0, 500) + '...' : m.text;
        return `${senderLabel}: ${cleanText}`;
      });

      const prompt = `Summarize this astrological chat conversation in 2 to 4 concise bullet points. Focus ONLY on key native questions, main planetary insights given, and recommended remedies. Keep total summary under 120 words.\n\nTRANSCRIPT:\n${transcriptLines.join('\n')}`;

      for (const modelName of SUMMARIZER_MODELS) {
        try {
          const resp = await client.models.generateContent({
            model: modelName,
            contents: prompt
          });
          const summaryText = resp.text?.trim();
          if (summaryText) {
            console.log(`[Astro Oracle AI] Silent chat summary updated via ${modelName}`);
            await storageService.saveChatSummary(profileId, summaryText);
            return summaryText;
          }
        } catch (e) {
          // If model fails or rate limited, try next candidate summarizer
          continue;
        }
      }
    } catch (err) {
      console.warn('[Astro Oracle AI] Silent background summarization skipped:', err);
    }
    return '';
  }

  // Test API key validity using fast & safe models (gemini-3.5-flash-lite / gemini-2.5-flash-lite)
  async testApiKey(key: string): Promise<boolean> {
    const testClient = new GoogleGenAI({ apiKey: key });
    let lastError: any = null;

    for (const testModel of TEST_API_KEY_MODELS) {
      try {
        const response = await testClient.models.generateContent({
          model: testModel,
          contents: 'Ping: respond with "OK"'
        });
        if (response.text) return true;
      } catch (e: any) {
        lastError = e;
        const msg = (e?.message || '').toLowerCase();
        if (
          msg.includes('api_key_invalid') ||
          msg.includes('api key not valid') ||
          msg.includes('permission_denied') ||
          msg.includes('unauthenticated')
        ) {
          throw new Error('Invalid Gemini API key. Please check your key in Settings.');
        }
        // If rate limited or model unavailable, try next candidate test model
        continue;
      }
    }

    const msg = (lastError?.message || '').toLowerCase();
    if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
      throw new Error('Invalid Gemini API key. Please check your key in Settings.');
    }
    throw new Error(lastError?.message || 'Unable to connect to Gemini API. Please check your network and API key.');
  }

  // Stream chat response with dynamic model selection, lightweight context payload, and rate-limit fallback
  async streamChat(
    history: ChatMessage[],
    userMessage: string,
    astroData: CalculatedAstrologyData,
    profile: UserProfile,
    onChunk: (chunk: string) => void,
    language: 'en' | 'ta' = 'en',
    chatSummary?: string
  ): Promise<string> {
    const client = await this.getClient();
    const systemInstruction = buildSystemInstruction(astroData, profile, language, chatSummary);

    // Keep payload ultra-lightweight: pass only 1 immediate prior turn (excluding current message)
    // Rich context is provided efficiently inside systemInstruction via chatSummary!
    const pastTurns = history.slice(-3, -1);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of pastTurns) {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'assistant' && msg.text && !msg.isStreaming) {
        const textContent = msg.text.length > 1000 ? msg.text.slice(0, 1000) + '...' : msg.text;
        contents.push({
          role: 'model',
          parts: [{ text: textContent }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const candidateModels = getCandidateChatModels();
    let lastError: any = null;

    for (const targetModel of candidateModels) {
      let fullResponse = '';
      try {
        console.log(`[Astro Oracle AI] Consulting model: ${targetModel}`);
        incrementModelUsage(targetModel);

        const stream = await client.models.generateContentStream({
          model: targetModel,
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
          throw new Error(`Received empty response from model ${targetModel}.`);
        }

        return fullResponse;
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();

        // Immediate exit if key is invalid
        if (
          msg.includes('api_key_invalid') ||
          msg.includes('api key not valid') ||
          msg.includes('permission_denied') ||
          msg.includes('unauthenticated')
        ) {
          throw new Error('Invalid Gemini API Key. Please update your key in Settings.');
        }

        const isQuotaError = msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
        const isTransientError =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('overloaded') ||
          msg.includes('unavailable') ||
          msg.includes('404') ||
          msg.includes('not found');

        if (isQuotaError) {
          console.warn(`[Astro Oracle AI] Model ${targetModel} hit daily RPD limit (429). Marking exhausted for today.`);
          markModelExhausted(targetModel);
        } else if (isTransientError) {
          console.warn(`[Astro Oracle AI] Model ${targetModel} temporary error (503/404). Trying next model without flagging daily exhausted.`);
        }

        // If streaming failed mid-way, clear partial text on UI so next model streams a clean response
        if (fullResponse) {
          onChunk('');
        }

        if (isQuotaError || isTransientError) {
          continue; // Try next model in chain
        }

        // For other unrecognized errors, throw directly
        throw new Error(err?.message || `Error communicating with Gemini API model (${targetModel}).`);
      }
    }

    // If all candidate models failed
    const errText = (lastError?.message || '').toLowerCase();
    if (errText.includes('resource_exhausted') || errText.includes('429') || errText.includes('quota')) {
      throw new Error('Gemini free-tier daily rate limits reached across available models. Please wait a moment or try again later.');
    }
    throw new Error(lastError?.message || 'Gemini service is temporarily unavailable. Please try again in a few moments.');
  }
}

export const aiService = new AIService();
