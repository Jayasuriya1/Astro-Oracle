import SwissEph from 'swisseph-wasm';
import type {
  UserProfile,
  CalculatedAstrologyData,
  WesternChart,
  VedicChart,
  PlanetPosition,
  HouseCusp,
  Aspect,
  Mahadasha,
  Antardasha,
  DashaReport,
  NavamshaChart,
  PanchangamData,
  PoruthamReport,
  PoruthamItem,
  AshtaKutaReport,
  AshtaKutaItem,
  PlanetaryDignity
} from '../types/astrology';
import { storageService } from './storageService';
import { getTimezoneOffsetForLocation } from './locationService';

// Zodiac signs list
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Vedic Nakshatras and their ruling planets
export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' }
];

// Major Celestial bodies to calculate
const CELESTIAL_BODIES = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Moon' },
  { id: 2, name: 'Mercury' },
  { id: 3, name: 'Venus' },
  { id: 4, name: 'Mars' },
  { id: 5, name: 'Jupiter' },
  { id: 6, name: 'Saturn' },
  { id: 7, name: 'Uranus' },
  { id: 8, name: 'Neptune' },
  { id: 9, name: 'Pluto' },
  { id: 11, name: 'Rahu' } // True North Node
];

// Helper to format degrees into D°M'
export function formatDegree(deg: number): string {
  const norm = ((deg % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.floor((norm - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

// Convert 0-360 longitude to Sign and Sign Degree
export function getSignInfo(longitude: number): { sign: string; signIndex: number; signDegree: number; formattedDegree: string } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDegree = normalized % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    signDegree,
    formattedDegree: formatDegree(signDegree)
  };
}

// Calculate Vedic Nakshatra, Pada, and Lord
export function getNakshatraInfo(longitude: number): { nakshatra: string; nakshatraPada: number; nakshatraLord: string } {
  const normalized = ((longitude % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.333333°
  const index = Math.floor(normalized / nakshatraSpan);
  const remainder = normalized % nakshatraSpan;
  const pada = Math.floor(remainder / (nakshatraSpan / 4)) + 1;
  const n = NAKSHATRAS[index % 27];
  return {
    nakshatra: n.name,
    nakshatraPada: Math.min(pada, 4),
    nakshatraLord: n.lord
  };
}

// Major aspects for Western Chart
function calculateWesternAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const definitions = [
    { type: 'Conjunction' as const, angle: 0, orb: 8 },
    { type: 'Sextile' as const, angle: 60, orb: 6 },
    { type: 'Square' as const, angle: 90, orb: 7 },
    { type: 'Trine' as const, angle: 120, orb: 8 },
    { type: 'Opposition' as const, angle: 180, orb: 8 }
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const def of definitions) {
        const delta = Math.abs(angle - def.angle);
        if (delta <= def.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            aspectType: def.type,
            angle: Math.round(angle * 10) / 10,
            orb: Math.round(delta * 100) / 100
          });
          break;
        }
      }
    }
  }

  return aspects;
}

// Standard 120-year Vimshottari Dasha planetary lords & durations
export const VIMSHOTTARI_LORDS: Array<{ lord: string; years: number }> = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 }
];

// Vimshottari Dasha calculation based on Moon's Sidereal Nakshatra position at birth
export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDate: Date
): DashaReport {
  const normLon = ((moonLongitude % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.333333333333334 degrees = 13°20'
  const nIndex = Math.floor(normLon / nakshatraSpan) % 27;
  const pada = Math.floor((normLon % nakshatraSpan) / (nakshatraSpan / 4)) + 1;
  const nakshatra = NAKSHATRAS[nIndex];

  // Starting lord based on nakshatra index (0 = Ketu, 1 = Venus, etc.)
  const startLordIndex = nIndex % 9;
  const passedInNakshatra = normLon % nakshatraSpan;
  const remainingFraction = (nakshatraSpan - passedInNakshatra) / nakshatraSpan;

  const startLordTotalYears = VIMSHOTTARI_LORDS[startLordIndex].years;
  const balanceYears = remainingFraction * startLordTotalYears;
  const elapsedYears = startLordTotalYears - balanceYears;

  const msPerYear = 365.2425 * 24 * 3600 * 1000;
  const birthTimeMs = birthDate.getTime();
  const now = Date.now();

  const timeline: Mahadasha[] = [];
  let currentCursorMs = birthTimeMs - elapsedYears * msPerYear;

  for (let i = 0; i < 9; i++) {
    const lordIdx = (startLordIndex + i) % 9;
    const lordInfo = VIMSHOTTARI_LORDS[lordIdx];
    const durationMs = lordInfo.years * msPerYear;
    const startMs = currentCursorMs;
    const endMs = startMs + durationMs;
    currentCursorMs = endMs;

    const isCurrent = now >= startMs && now < endMs;
    let percentagePassed = 0;
    if (now >= endMs) {
      percentagePassed = 100;
    } else if (now > startMs) {
      percentagePassed = Math.min(
        100,
        Math.max(0, Math.round(((now - startMs) / durationMs) * 100))
      );
    }

    // Calculate 9 Antardashas within this Mahadasha
    const antardashas: Antardasha[] = [];
    let subCursorMs = startMs;
    for (let j = 0; j < 9; j++) {
      const subLordIdx = (lordIdx + j) % 9;
      const subLordInfo = VIMSHOTTARI_LORDS[subLordIdx];
      // Classical formula: (Mahadasha Years * Antardasha Years) / 120
      const subYears = (lordInfo.years * subLordInfo.years) / 120;
      const subDurationMs = subYears * msPerYear;
      const subStartMs = subCursorMs;
      const subEndMs = subStartMs + subDurationMs;
      subCursorMs = subEndMs;

      antardashas.push({
        lord: subLordInfo.lord,
        startDate: new Date(subStartMs).toISOString().split('T')[0],
        endDate: new Date(subEndMs).toISOString().split('T')[0],
        isCurrent: now >= subStartMs && now < subEndMs
      });
    }

    timeline.push({
      lord: lordInfo.lord,
      totalYears: lordInfo.years,
      startDate: new Date(startMs).toISOString().split('T')[0],
      endDate: new Date(endMs).toISOString().split('T')[0],
      isCurrent,
      percentagePassed,
      antardashas
    });
  }

  const currentMahadasha = timeline.find((m) => m.isCurrent) || null;

  return {
    currentMahadasha,
    timeline,
    nakshatra: nakshatra.name,
    pada: Math.min(pada, 4),
    balanceYears: Math.round(balanceYears * 100) / 100
  };
}

// ==========================================
// 1. D9 NAVAMSHA ENGINE (Parashara System)
// ==========================================
export function getNavamshaSign(
  signIndex: number,
  signDegree: number
): { sign: string; signIndex: number; pada: number } {
  const pada = Math.min(8, Math.max(0, Math.floor((signDegree + 1e-9) / (30 / 9))));
  let baseSignIndex = 0;
  const element = signIndex % 4; // 0: Fire, 1: Earth, 2: Air, 3: Water
  if (element === 0) baseSignIndex = 0; // Aries
  else if (element === 1) baseSignIndex = 9; // Capricorn
  else if (element === 2) baseSignIndex = 6; // Libra
  else if (element === 3) baseSignIndex = 3; // Cancer

  const navamshaSignIndex = (baseSignIndex + pada) % 12;
  return {
    sign: ZODIAC_SIGNS[navamshaSignIndex],
    signIndex: navamshaSignIndex,
    pada: pada + 1
  };
}

export function calculateNavamshaPositions(
  planets: PlanetPosition[],
  lagna: { sign: string; degree: number; formattedDegree: string }
): NavamshaChart {
  const lagnaSignInfo = getSignInfo(lagna.degree);
  const d9LagnaInfo = getNavamshaSign(lagnaSignInfo.signIndex, lagnaSignInfo.signDegree);
  const padaSpan = 30 / 9;
  const lagnaDegInPada = lagnaSignInfo.signDegree % padaSpan;
  const lagnaD9Degree = (lagnaDegInPada / padaSpan) * 30;

  const d9Planets: PlanetPosition[] = planets.map((p) => {
    const d9SignInfo = getNavamshaSign(p.signIndex, p.signDegree);
    const degInPada = p.signDegree % padaSpan;
    const d9Degree = (degInPada / padaSpan) * 30;
    const d9House = ((d9SignInfo.signIndex - d9LagnaInfo.signIndex + 12) % 12) + 1;

    return {
      ...p,
      sign: d9SignInfo.sign,
      signIndex: d9SignInfo.signIndex,
      signDegree: Math.round(d9Degree * 100) / 100,
      formattedDegree: formatDegree(d9Degree),
      house: d9House
    };
  });

  return {
    lagna: {
      sign: d9LagnaInfo.sign,
      signIndex: d9LagnaInfo.signIndex,
      formattedDegree: `${d9LagnaInfo.sign} ${formatDegree(lagnaD9Degree)}`
    },
    planets: d9Planets
  };
}

// ==========================================
// 2. DAILY PANCHANGAM ENGINE
// ==========================================
const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Asiddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti'
];

const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'
];

const CHALDEAN_HORA_CYCLE = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
const DAY_FIRST_HORA_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const RAHU_KALAM_SLOTS: Record<number, { startTime: string; endTime: string }> = {
  0: { startTime: '16:30', endTime: '18:00' }, // Sun
  1: { startTime: '07:30', endTime: '09:00' }, // Mon
  2: { startTime: '15:00', endTime: '16:30' }, // Tue
  3: { startTime: '12:00', endTime: '13:30' }, // Wed
  4: { startTime: '13:30', endTime: '15:00' }, // Thu
  5: { startTime: '10:30', endTime: '12:00' }, // Fri
  6: { startTime: '09:00', endTime: '10:30' }  // Sat
};

const YAMAGANDAM_SLOTS: Record<number, { startTime: string; endTime: string }> = {
  0: { startTime: '12:00', endTime: '13:30' },
  1: { startTime: '10:30', endTime: '12:00' },
  2: { startTime: '09:00', endTime: '10:30' },
  3: { startTime: '07:30', endTime: '09:00' },
  4: { startTime: '06:00', endTime: '07:30' },
  5: { startTime: '15:00', endTime: '16:30' },
  6: { startTime: '13:30', endTime: '15:00' }
};

export function calculateDailyPanchangam(
  sunLongitude: number,
  moonLongitude: number,
  date: Date = new Date()
): PanchangamData {
  const normSun = ((sunLongitude % 360) + 360) % 360;
  const normMoon = ((moonLongitude % 360) + 360) % 360;

  // 1. Tithi: 12° intervals between Moon and Sun
  const tithiDiff = (normMoon - normSun + 360) % 360;
  const tithiIndex = Math.floor(tithiDiff / 12); // 0 to 29
  const tithiNumber = tithiIndex + 1;
  const isShukla = tithiNumber <= 15;
  const paksha: 'Shukla' | 'Krishna' = isShukla ? 'Shukla' : 'Krishna';
  const nameIndex = tithiIndex % 15;
  const rawName = TITHI_NAMES[nameIndex];
  const tithiName = !isShukla && nameIndex === 14 ? 'Amavasya' : rawName;
  const percentagePassed = Math.round(((tithiDiff % 12) / 12) * 100);

  // 2. Nakshatra
  const nakshatraInfo = getNakshatraInfo(normMoon);

  // 3. Yoga: (Sun + Moon) / 13°20'
  const yogaSum = (normSun + normMoon) % 360;
  const yogaIndex = Math.floor(yogaSum / (360 / 27)) % 27;
  const yogaName = YOGA_NAMES[yogaIndex];

  // 4. Karana: 6° intervals
  const karanaIndex = Math.floor(tithiDiff / 6);
  let karanaName = '';
  if (karanaIndex === 0) karanaName = 'Kintughna';
  else if (karanaIndex >= 57) {
    if (karanaIndex === 57) karanaName = 'Shakuni';
    else if (karanaIndex === 58) karanaName = 'Chatushpada';
    else karanaName = 'Naga';
  } else {
    karanaName = KARANA_NAMES[(karanaIndex - 1) % 7];
  }

  // 5. Active Planetary Hora
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const hoursSinceSunrise = (currentHour >= 6 ? currentHour - 6 : currentHour + 18) % 24;
  const dayLord = DAY_FIRST_HORA_LORD[dayOfWeek];
  const chaldeanStartIdx = CHALDEAN_HORA_CYCLE.indexOf(dayLord);
  const activeHoraLord = CHALDEAN_HORA_CYCLE[(chaldeanStartIdx + hoursSinceSunrise) % 7];
  const horaStartH = (6 + hoursSinceSunrise) % 24;
  const horaEndH = (horaStartH + 1) % 24;
  const activeHora = {
    lord: activeHoraLord,
    startTime: `${horaStartH.toString().padStart(2, '0')}:00`,
    endTime: `${horaEndH.toString().padStart(2, '0')}:00`
  };

  // 6. Rahu Kalam & Yamagandam
  const rahuSlot = RAHU_KALAM_SLOTS[dayOfWeek];
  const yamaSlot = YAMAGANDAM_SLOTS[dayOfWeek];

  const nowMinutes = currentHour * 60 + currentMinute;
  const [rhS, rmS] = rahuSlot.startTime.split(':').map(Number);
  const [rhE, rmE] = rahuSlot.endTime.split(':').map(Number);
  const isRahuCurrent = nowMinutes >= rhS * 60 + rmS && nowMinutes < rhE * 60 + rmE;

  const [yhS, ymS] = yamaSlot.startTime.split(':').map(Number);
  const [yhE, ymE] = yamaSlot.endTime.split(':').map(Number);
  const isYamaCurrent = nowMinutes >= yhS * 60 + ymS && nowMinutes < yhE * 60 + ymE;

  return {
    tithi: {
      number: tithiNumber,
      name: tithiName,
      paksha,
      percentagePassed
    },
    nakshatra: {
      name: nakshatraInfo.nakshatra,
      pada: nakshatraInfo.nakshatraPada,
      lord: nakshatraInfo.nakshatraLord
    },
    yoga: {
      number: yogaIndex + 1,
      name: yogaName
    },
    karana: {
      name: karanaName
    },
    activeHora,
    rahuKalam: {
      startTime: rahuSlot.startTime,
      endTime: rahuSlot.endTime,
      isCurrent: isRahuCurrent
    },
    yamagandam: {
      startTime: yamaSlot.startTime,
      endTime: yamaSlot.endTime,
      isCurrent: isYamaCurrent
    }
  };
}

// ==========================================
// 3. COMPATIBILITY (10 PORUTHAM) ENGINE
// ==========================================
const NAKSHATRA_GANAS: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
  Ashwini: 'Deva', Mrigashira: 'Deva', Punarvasu: 'Deva', Pushya: 'Deva', Hasta: 'Deva',
  Swati: 'Deva', Anuradha: 'Deva', Shravana: 'Deva', Revati: 'Deva',
  Bharani: 'Manushya', Rohini: 'Manushya', Ardra: 'Manushya', 'Purva Phalguni': 'Manushya',
  'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya',
  'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
  Krittika: 'Rakshasa', Ashlesha: 'Rakshasa', Magha: 'Rakshasa', Chitra: 'Rakshasa',
  Vishakha: 'Rakshasa', Jyeshtha: 'Rakshasa', Mula: 'Rakshasa', Dhanishta: 'Rakshasa',
  Shatabhisha: 'Rakshasa'
};

const RAJJU_GROUP: Record<string, string> = {
  Ashwini: 'Pada', Bharani: 'Kati', Krittika: 'Udara', Rohini: 'Kantha', Mrigashira: 'Shiro',
  Ardra: 'Kantha', Punarvasu: 'Udara', Pushya: 'Kati', Ashlesha: 'Pada',
  Magha: 'Pada', 'Purva Phalguni': 'Kati', 'Uttara Phalguni': 'Udara', Hasta: 'Kantha', Chitra: 'Shiro',
  Swati: 'Kantha', Vishakha: 'Udara', Anuradha: 'Kati', Jyeshtha: 'Pada',
  Mula: 'Pada', 'Purva Ashadha': 'Kati', 'Uttara Ashadha': 'Udara', Shravana: 'Kantha', Dhanishta: 'Shiro',
  Shatabhisha: 'Kantha', 'Purva Bhadrapada': 'Udara', 'Uttara Bhadrapada': 'Kati', Revati: 'Pada'
};

const NAKSHATRA_YONI: Record<string, { animal: string; gender: 'Male' | 'Female' }> = {
  Ashwini: { animal: 'Horse', gender: 'Male' },
  Bharani: { animal: 'Elephant', gender: 'Female' },
  Krittika: { animal: 'Goat', gender: 'Female' },
  Rohini: { animal: 'Serpent', gender: 'Male' },
  Mrigashira: { animal: 'Serpent', gender: 'Female' },
  Ardra: { animal: 'Dog', gender: 'Female' },
  Punarvasu: { animal: 'Cat', gender: 'Female' },
  Pushya: { animal: 'Goat', gender: 'Male' },
  Ashlesha: { animal: 'Cat', gender: 'Male' },
  Magha: { animal: 'Rat', gender: 'Male' },
  'Purva Phalguni': { animal: 'Rat', gender: 'Female' },
  'Uttara Phalguni': { animal: 'Cow', gender: 'Male' },
  Hasta: { animal: 'Buffalo', gender: 'Female' },
  Chitra: { animal: 'Tiger', gender: 'Female' },
  Swati: { animal: 'Buffalo', gender: 'Male' },
  Vishakha: { animal: 'Tiger', gender: 'Male' },
  Anuradha: { animal: 'Deer', gender: 'Female' },
  Jyeshtha: { animal: 'Deer', gender: 'Male' },
  Mula: { animal: 'Dog', gender: 'Male' },
  'Purva Ashadha': { animal: 'Monkey', gender: 'Male' },
  'Uttara Ashadha': { animal: 'Mongoose', gender: 'Male' },
  Shravana: { animal: 'Monkey', gender: 'Female' },
  Dhanishta: { animal: 'Lion', gender: 'Female' },
  Shatabhisha: { animal: 'Horse', gender: 'Female' },
  'Purva Bhadrapada': { animal: 'Lion', gender: 'Male' },
  'Uttara Bhadrapada': { animal: 'Cow', gender: 'Female' },
  Revati: { animal: 'Elephant', gender: 'Male' }
};

const INIMICAL_YONI_PAIRS = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Goat', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger']
];

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

const PLANET_FRIENDS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], neutrals: ['Mercury'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], neutrals: ['Venus', 'Saturn'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], neutrals: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], neutrals: ['Saturn'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], neutrals: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], neutrals: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] }
};

const VASHYA_MAP: Record<string, string[]> = {
  Aries: ['Leo', 'Scorpio'],
  Taurus: ['Cancer', 'Libra'],
  Gemini: ['Virgo'],
  Cancer: ['Scorpio', 'Sagittarius'],
  Leo: ['Libra'],
  Virgo: ['Gemini', 'Pisces'],
  Libra: ['Capricorn', 'Virgo'],
  Scorpio: ['Cancer'],
  Sagittarius: ['Pisces'],
  Capricorn: ['Aries', 'Aquarius'],
  Aquarius: ['Aries'],
  Pisces: ['Capricorn']
};

const VEDHA_PAIRS = [
  ['Ashwini', 'Jyeshtha'],
  ['Bharani', 'Anuradha'],
  ['Krittika', 'Vishakha'],
  ['Rohini', 'Swati'],
  ['Ardra', 'Shravana'],
  ['Punarvasu', 'Uttara Ashadha'],
  ['Pushya', 'Purva Ashadha'],
  ['Ashlesha', 'Mula'],
  ['Magha', 'Revati'],
  ['Purva Phalguni', 'Uttara Bhadrapada'],
  ['Uttara Phalguni', 'Purva Bhadrapada'],
  ['Hasta', 'Shatabhisha'],
  ['Mrigashira', 'Chitra'],
  ['Chitra', 'Dhanishta'],
  ['Mrigashira', 'Dhanishta']
];

export function calculatePorutham(
  profile1: { name: string; moonSign: string; nakshatra: string; pada: number },
  profile2: { name: string; moonSign: string; nakshatra: string; pada: number }
): PoruthamReport {
  const idx1 = NAKSHATRAS.findIndex((n) => n.name.toLowerCase() === profile1.nakshatra.toLowerCase());
  const idx2 = NAKSHATRAS.findIndex((n) => n.name.toLowerCase() === profile2.nakshatra.toLowerCase());

  const n1 = idx1 >= 0 ? idx1 : 0;
  const n2 = idx2 >= 0 ? idx2 : 0;

  const countFrom1to2 = ((n2 - n1 + 27) % 27) + 1;
  const items: PoruthamItem[] = [];

  // 1. Dina Porutham (Health & Vitality - Tara Bala)
  const dinaRem = countFrom1to2 % 9;
  const isDinaGood = [2, 4, 6, 8, 9, 0].includes(dinaRem);
  items.push({
    id: 'dina',
    name: 'Dina Porutham',
    sanskrit: 'தினப் பொருத்தம்',
    status: isDinaGood ? 'Compatible' : 'Incompatible',
    score: isDinaGood ? 1 : 0,
    maxScore: 1,
    description: isDinaGood
      ? 'Auspicious Tara Bala promoting health, vitality, and freedom from disease.'
      : 'Inimical Tara Bala indicating periodic health/vitality adjustments required.'
  });

  // 2. Gana Porutham (Temperament Alignment)
  const gana1 = NAKSHATRA_GANAS[profile1.nakshatra] || 'Manushya';
  const gana2 = NAKSHATRA_GANAS[profile2.nakshatra] || 'Manushya';
  let ganaScore = 0;
  let ganaStatus: 'Compatible' | 'Moderate' | 'Incompatible' = 'Incompatible';
  if (gana1 === gana2) {
    ganaScore = 1;
    ganaStatus = 'Compatible';
  } else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) {
    ganaScore = 0.5;
    ganaStatus = 'Moderate';
  }
  items.push({
    id: 'gana',
    name: 'Gana Porutham',
    sanskrit: 'கணப் பொருத்தம்',
    status: ganaStatus,
    score: ganaScore,
    maxScore: 1,
    description: `${profile1.name} (${gana1}) & ${profile2.name} (${gana2}) temperament compatibility.`
  });

  // 3. Mahendra Porutham (Prosperity & Lineage)
  const isMahendra = [4, 7, 10, 13, 16, 19, 22, 25].includes(countFrom1to2);
  items.push({
    id: 'mahendra',
    name: 'Mahendra Porutham',
    sanskrit: 'மகேந்திரப் பொருத்தம்',
    status: isMahendra ? 'Compatible' : 'Incompatible',
    score: isMahendra ? 1 : 0,
    maxScore: 1,
    description: isMahendra
      ? 'Strong lineage prosperity, progeny blessings, and mutual family growth.'
      : 'Average domestic progression; requires focused cooperative effort.'
  });

  // 4. Stree Deergha (Lifespan & Union Longing)
  const isStreeDeergha = countFrom1to2 > 13;
  const isStreeModerate = countFrom1to2 > 7;
  items.push({
    id: 'stree_deergha',
    name: 'Stree Deergha',
    sanskrit: 'ஸ்திரீ தீர்க்கப் பொருத்தம்',
    status: isStreeDeergha ? 'Compatible' : isStreeModerate ? 'Moderate' : 'Incompatible',
    score: isStreeDeergha ? 1 : isStreeModerate ? 0.5 : 0,
    maxScore: 1,
    description: isStreeDeergha
      ? 'Favorable distance from female star, ensuring lasting marital longevity and joy.'
      : 'Moderate planetary span; neutralized if Rasi and Rajju are strongly aligned.'
  });

  // 5. Yoni Porutham (Physical & Sexual Harmony)
  const yoni1 = NAKSHATRA_YONI[profile1.nakshatra] || { animal: 'Horse', gender: 'Male' };
  const yoni2 = NAKSHATRA_YONI[profile2.nakshatra] || { animal: 'Elephant', gender: 'Female' };
  const isEnemyYoniPair = INIMICAL_YONI_PAIRS.some(
    ([a, b]) => (a === yoni1.animal && b === yoni2.animal) || (a === yoni2.animal && b === yoni1.animal)
  );

  let yoniScore = 0.5;
  let yoniStatus: 'Compatible' | 'Moderate' | 'Incompatible' = 'Moderate';
  if (isEnemyYoniPair) {
    yoniScore = 0;
    yoniStatus = 'Incompatible';
  } else if (yoni1.animal === yoni2.animal) {
    yoniScore = 1;
    yoniStatus = 'Compatible';
  } else {
    yoniScore = 0.75;
    yoniStatus = 'Compatible';
  }
  items.push({
    id: 'yoni',
    name: 'Yoni Porutham',
    sanskrit: 'யோனிப் பொருத்தம்',
    status: yoniStatus,
    score: yoniScore,
    maxScore: 1,
    description: isEnemyYoniPair
      ? `Inimical Yoni pair (${yoni1.animal} vs ${yoni2.animal}) requiring physical/emotional adaptability.`
      : `Harmonious Yoni affinity (${yoni1.animal} & ${yoni2.animal}) fostering deep physical and emotional warmth.`
  });

  // 6. Rasi Porutham (Family & Mental Bond)
  const signIdx1 = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === profile1.moonSign.toLowerCase());
  const signIdx2 = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === profile2.moonSign.toLowerCase());
  const signDist = ((signIdx2 - signIdx1 + 12) % 12) + 1;
  const isRasiGood = [1, 7, 3, 4, 10, 11].includes(signDist);
  items.push({
    id: 'rasi',
    name: 'Rasi Porutham',
    sanskrit: 'ராசிப் பொருத்தம்',
    status: isRasiGood ? 'Compatible' : 'Moderate',
    score: isRasiGood ? 1 : 0.5,
    maxScore: 1,
    description: isRasiGood
      ? 'Harmonious Moon sign relationship fostering peaceful domestic coexistence.'
      : 'Growth through open communication and understanding differences.'
  });

  // 7. Rasyadhipathi Porutham (Lord Friendship)
  const lord1 = SIGN_LORDS[profile1.moonSign] || 'Mars';
  const lord2 = SIGN_LORDS[profile2.moonSign] || 'Venus';
  const pf1 = PLANET_FRIENDS[lord1];
  const pf2 = PLANET_FRIENDS[lord2];

  let rasyadhipathiScore = 0.5;
  let rasyadhipathiStatus: 'Compatible' | 'Moderate' | 'Incompatible' = 'Moderate';
  if (lord1 === lord2) {
    rasyadhipathiScore = 1;
    rasyadhipathiStatus = 'Compatible';
  } else if (pf1?.friends.includes(lord2) && pf2?.friends.includes(lord1)) {
    rasyadhipathiScore = 1;
    rasyadhipathiStatus = 'Compatible';
  } else if (pf1?.enemies.includes(lord2) && pf2?.enemies.includes(lord1)) {
    rasyadhipathiScore = 0;
    rasyadhipathiStatus = 'Incompatible';
  } else {
    rasyadhipathiScore = 0.75;
    rasyadhipathiStatus = 'Compatible';
  }
  items.push({
    id: 'rasyadhipathi',
    name: 'Rasyadhipathi Porutham',
    sanskrit: 'ராசியாதிபதிப் பொருத்தம்',
    status: rasyadhipathiStatus,
    score: rasyadhipathiScore,
    maxScore: 1,
    description: `Moon sign lords (${lord1} & ${lord2}) relationship.`
  });

  // 8. Vashya Porutham (Mutual Attraction)
  const isVashyaMatch =
    (VASHYA_MAP[profile1.moonSign] || []).includes(profile2.moonSign) ||
    (VASHYA_MAP[profile2.moonSign] || []).includes(profile1.moonSign);
  items.push({
    id: 'vashya',
    name: 'Vashya Porutham',
    sanskrit: 'வசியப் பொருத்தம்',
    status: isVashyaMatch ? 'Compatible' : 'Moderate',
    score: isVashyaMatch ? 1 : 0.5,
    maxScore: 1,
    description: isVashyaMatch
      ? 'Mutual psychic fascination, genuine respect, and magnetic bond.'
      : 'Standard natural affinity and mutual respect.'
  });

  // 9. Rajju Porutham (Longevity & Union Safeguard - CRITICAL)
  const rajju1 = RAJJU_GROUP[profile1.nakshatra] || 'Udara';
  const rajju2 = RAJJU_GROUP[profile2.nakshatra] || 'Kantha';
  const isRajjuMatch = rajju1 !== rajju2;
  items.push({
    id: 'rajju',
    name: 'Rajju Porutham (Key)',
    sanskrit: 'ரஜ்ஜுப் பொருத்தம் (மாங்கல்யம்)',
    status: isRajjuMatch ? 'Compatible' : 'Incompatible',
    score: isRajjuMatch ? 1 : 0,
    maxScore: 1,
    description: isRajjuMatch
      ? `Different Rajjus (${rajju1} & ${rajju2}) - Perfect match protecting Mangalya & longevity.`
      : `Same Rajju (${rajju1}) - Traditional Dosha requires remedial consideration.`
  });

  // 10. Vedha Porutham (Affliction Shield)
  const isVedhaDosha = VEDHA_PAIRS.some(
    ([a, b]) =>
      (a.toLowerCase() === profile1.nakshatra.toLowerCase() && b.toLowerCase() === profile2.nakshatra.toLowerCase()) ||
      (a.toLowerCase() === profile2.nakshatra.toLowerCase() && b.toLowerCase() === profile1.nakshatra.toLowerCase())
  );
  items.push({
    id: 'vedha',
    name: 'Vedha Porutham',
    sanskrit: 'வேதப் பொருத்தம்',
    status: isVedhaDosha ? 'Incompatible' : 'Compatible',
    score: isVedhaDosha ? 0 : 1,
    maxScore: 1,
    description: isVedhaDosha
      ? `Vedha (inimical star affliction) detected between ${profile1.nakshatra} & ${profile2.nakshatra}.`
      : 'No inimical piercing (Vedha) between birth constellations.'
  });

  const totalScore = items.reduce((acc, it) => acc + it.score, 0);
  const maxScore = items.length;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let verdict: 'Excellent Match' | 'Good Match' | 'Average Match' | 'Challenging / Needs Remediation' = 'Good Match';
  if (totalScore >= 8) verdict = 'Excellent Match';
  else if (totalScore >= 6) verdict = 'Good Match';
  else if (totalScore >= 4) verdict = 'Average Match';
  else verdict = 'Challenging / Needs Remediation';

  return {
    profile1,
    profile2,
    totalScore,
    maxScore,
    percentage,
    verdict,
    items
  };
}

// ==========================================
// 4. NORTH INDIAN ASHTA KUTA (36 GUNA) ENGINE
// ==========================================
const NADI_MAP: Record<string, 'Adi' | 'Madhya' | 'Antya'> = {
  Ashwini: 'Adi', Bharani: 'Madhya', Krittika: 'Antya',
  Rohini: 'Antya', Mrigashira: 'Madhya', Ardra: 'Adi',
  Punarvasu: 'Adi', Pushya: 'Madhya', Ashlesha: 'Antya',
  Magha: 'Antya', 'Purva Phalguni': 'Madhya', 'Uttara Phalguni': 'Adi',
  Hasta: 'Adi', Chitra: 'Madhya', Swati: 'Antya',
  Vishakha: 'Antya', Anuradha: 'Madhya', Jyeshtha: 'Adi',
  Mula: 'Adi', 'Purva Ashadha': 'Madhya', 'Uttara Ashadha': 'Antya',
  Shravana: 'Antya', Dhanishta: 'Madhya', Shatabhisha: 'Adi',
  'Purva Bhadrapada': 'Adi', 'Uttara Bhadrapada': 'Madhya', Revati: 'Antya'
};

const EXALTATION_MAP: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo',
  Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra', Rahu: 'Taurus', Ketu: 'Scorpio'
};

const DEBILITATION_MAP: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces',
  Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries', Rahu: 'Scorpio', Ketu: 'Taurus'
};

const OWN_HOUSE_MAP: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'], Jupiter: ['Sagittarius', 'Pisces'],
  Venus: ['Taurus', 'Libra'], Saturn: ['Capricorn', 'Aquarius']
};

export function getPlanetaryDignity(
  planetName: string,
  sign: string
): PlanetaryDignity {
  if (EXALTATION_MAP[planetName] === sign) return 'exalted';
  if (DEBILITATION_MAP[planetName] === sign) return 'debilitated';
  if ((OWN_HOUSE_MAP[planetName] || []).includes(sign)) return 'own_house';
  return 'neutral';
}

export function calculateAshtaKuta(
  profile1: { name: string; moonSign: string; nakshatra: string; pada: number },
  profile2: { name: string; moonSign: string; nakshatra: string; pada: number }
): AshtaKutaReport {
  const items: AshtaKutaItem[] = [];

  // 1. Varna (1 Guna)
  const VARNA_SCORES: Record<string, number> = {
    Cancer: 4, Scorpio: 4, Pisces: 4,
    Aries: 3, Leo: 3, Sagittarius: 3,
    Taurus: 2, Virgo: 2, Capricorn: 2,
    Gemini: 1, Libra: 1, Aquarius: 1
  };
  const v1 = VARNA_SCORES[profile1.moonSign] || 2;
  const v2 = VARNA_SCORES[profile2.moonSign] || 2;
  const varnaScore = v2 >= v1 ? 1 : 0;
  items.push({
    id: 'varna',
    name: 'Varna Kuta (Work & Ego Alignment)',
    sanskrit: 'वर्ण कूट',
    kuta: 'Varna',
    score: varnaScore,
    maxScore: 1,
    status: varnaScore === 1 ? 'Compatible' : 'Incompatible',
    description: varnaScore === 1
      ? 'Balanced spiritual and functional work roles between partners.'
      : 'Complementary adjustment needed regarding social and spiritual duties.'
  });

  // 2. Vashya (2 Gunas)
  const VASHYA_GROUP: Record<string, string> = {
    Aries: 'Chatushpada', Taurus: 'Chatushpada',
    Gemini: 'Dwipada', Cancer: 'Jalachara', Leo: 'Vanachara', Virgo: 'Dwipada',
    Libra: 'Dwipada', Scorpio: 'Keeta', Sagittarius: 'Chatushpada',
    Capricorn: 'Jalachara', Aquarius: 'Dwipada', Pisces: 'Jalachara'
  };
  const vas1 = VASHYA_GROUP[profile1.moonSign] || 'Dwipada';
  const vas2 = VASHYA_GROUP[profile2.moonSign] || 'Dwipada';
  let vashyaScore = 0;
  if (vas1 === vas2) vashyaScore = 2;
  else if (
    (vas1 === 'Dwipada' && (vas2 === 'Chatushpada' || vas2 === 'Jalachara')) ||
    (vas2 === 'Dwipada' && (vas1 === 'Chatushpada' || vas1 === 'Jalachara'))
  ) {
    vashyaScore = 1;
  }
  items.push({
    id: 'vashya',
    name: 'Vashya Kuta (Mutual Control & Attraction)',
    sanskrit: 'वश्य कूट',
    kuta: 'Vashya',
    score: vashyaScore,
    maxScore: 2,
    status: vashyaScore === 2 ? 'Compatible' : vashyaScore === 1 ? 'Moderate' : 'Incompatible',
    description: vashyaScore === 2
      ? `Strong magnetic harmony (${vas1} & ${vas2}).`
      : `Moderate psychic attraction (${vas1} & ${vas2}).`
  });

  // 3. Tara (3 Gunas)
  const idx1 = NAKSHATRAS.findIndex((n) => n.name.toLowerCase() === profile1.nakshatra.toLowerCase());
  const idx2 = NAKSHATRAS.findIndex((n) => n.name.toLowerCase() === profile2.nakshatra.toLowerCase());
  const n1 = idx1 >= 0 ? idx1 : 0;
  const n2 = idx2 >= 0 ? idx2 : 0;

  const count1 = ((n2 - n1 + 27) % 27) + 1;
  const count2 = ((n1 - n2 + 27) % 27) + 1;
  const goodTaras = [2, 4, 6, 8, 9, 0];
  const t1Good = goodTaras.includes(count1 % 9);
  const t2Good = goodTaras.includes(count2 % 9);

  let taraScore = 0;
  if (t1Good && t2Good) taraScore = 3;
  else if (t1Good || t2Good) taraScore = 1.5;
  else taraScore = 0;

  items.push({
    id: 'tara',
    name: 'Tara Kuta (Destiny & Auspiciousness)',
    sanskrit: 'तारा कूट',
    kuta: 'Tara',
    score: taraScore,
    maxScore: 3,
    status: taraScore === 3 ? 'Compatible' : taraScore === 1.5 ? 'Moderate' : 'Incompatible',
    description: taraScore === 3
      ? 'Both birth stars are in mutual Sampat/Kshema auspicious Tara positions.'
      : taraScore === 1.5
      ? 'One-way favorable Tara strength; requires minor mutual support.'
      : 'Challenging Tara placement; remedies suggested.'
  });

  // 4. Yoni (4 Gunas)
  const yoni1 = NAKSHATRA_YONI[profile1.nakshatra] || { animal: 'Horse', gender: 'Male' };
  const yoni2 = NAKSHATRA_YONI[profile2.nakshatra] || { animal: 'Elephant', gender: 'Female' };
  const isEnemyYoni = INIMICAL_YONI_PAIRS.some(
    ([a, b]) => (a === yoni1.animal && b === yoni2.animal) || (a === yoni2.animal && b === yoni1.animal)
  );

  let yoniScore = 2;
  if (isEnemyYoni) yoniScore = 0;
  else if (yoni1.animal === yoni2.animal) yoniScore = 4;
  else yoniScore = 3;

  items.push({
    id: 'yoni',
    name: 'Yoni Kuta (Physical & Biological Instinct)',
    sanskrit: 'योनि कूट',
    kuta: 'Yoni',
    score: yoniScore,
    maxScore: 4,
    status: yoniScore >= 3 ? 'Compatible' : yoniScore >= 2 ? 'Moderate' : 'Incompatible',
    description: isEnemyYoni
      ? `Sworn inimical Yoni pair (${yoni1.animal} vs ${yoni2.animal}).`
      : `Compatible Yoni affinity (${yoni1.animal} & ${yoni2.animal}).`
  });

  // 5. Graha Maitri (5 Gunas)
  const lord1 = SIGN_LORDS[profile1.moonSign] || 'Mars';
  const lord2 = SIGN_LORDS[profile2.moonSign] || 'Venus';
  const pf1 = PLANET_FRIENDS[lord1];
  const pf2 = PLANET_FRIENDS[lord2];

  let maitriScore = 2.5;
  if (lord1 === lord2) maitriScore = 5;
  else if (pf1?.friends.includes(lord2) && pf2?.friends.includes(lord1)) maitriScore = 5;
  else if (pf1?.friends.includes(lord2) || pf2?.friends.includes(lord1)) maitriScore = 4;
  else if (pf1?.enemies.includes(lord2) && pf2?.enemies.includes(lord1)) maitriScore = 0;
  else maitriScore = 3;

  items.push({
    id: 'graha_maitri',
    name: 'Graha Maitri (Psychological & Intellectual Friendship)',
    sanskrit: 'ग्रह मैत्री कूट',
    kuta: 'Graha Maitri',
    score: maitriScore,
    maxScore: 5,
    status: maitriScore >= 4 ? 'Compatible' : maitriScore >= 2.5 ? 'Moderate' : 'Incompatible',
    description: `Moon lords (${lord1} & ${lord2}) planetary friendship score: ${maitriScore}/5.`
  });

  // 6. Gana (6 Gunas)
  const gana1 = NAKSHATRA_GANAS[profile1.nakshatra] || 'Manushya';
  const gana2 = NAKSHATRA_GANAS[profile2.nakshatra] || 'Manushya';
  let ganaScore = 0;
  if (gana1 === gana2) ganaScore = 6;
  else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) ganaScore = 5;
  else if (gana1 === 'Deva' && gana2 === 'Rakshasa') ganaScore = 1;
  else ganaScore = 0;

  items.push({
    id: 'gana',
    name: 'Gana Kuta (Temperament & Life Outlook)',
    sanskrit: 'गण कूट',
    kuta: 'Gana',
    score: ganaScore,
    maxScore: 6,
    status: ganaScore >= 5 ? 'Compatible' : ganaScore >= 1 ? 'Moderate' : 'Incompatible',
    description: `Gana alignment (${gana1} & ${gana2}): ${ganaScore}/6.`
  });

  // 7. Bhakoot (7 Gunas)
  const signIdx1 = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === profile1.moonSign.toLowerCase());
  const signIdx2 = ZODIAC_SIGNS.findIndex((s) => s.toLowerCase() === profile2.moonSign.toLowerCase());
  const signDist = ((signIdx2 - signIdx1 + 12) % 12) + 1;
  const isBhakootGood = [1, 7, 3, 4, 10, 11].includes(signDist);
  const isLordsFriendly = lord1 === lord2 || (pf1?.friends.includes(lord2) && pf2?.friends.includes(lord1));

  let bhakootScore = 0;
  if (isBhakootGood || isLordsFriendly) bhakootScore = 7;
  else bhakootScore = 0;

  items.push({
    id: 'bhakoot',
    name: 'Bhakoot Kuta (Emotional & Financial Wealth)',
    sanskrit: 'भकूट कूट',
    kuta: 'Bhakoot',
    score: bhakootScore,
    maxScore: 7,
    status: bhakootScore === 7 ? 'Compatible' : 'Incompatible',
    description: bhakootScore === 7
      ? `Favorable Moon sign distance (${signDist}th house span) - No Bhakoot Dosha.`
      : `Unfavorable ${signDist}th house span (Bhakoot Dosha); lord friendship mitigation recommended.`
  });

  // 8. Nadi (8 Gunas)
  const nadi1 = NADI_MAP[profile1.nakshatra] || 'Adi';
  const nadi2 = NADI_MAP[profile2.nakshatra] || 'Antya';
  const isNadiMatch = nadi1 !== nadi2;
  const nadiScore = isNadiMatch ? 8 : 0;

  items.push({
    id: 'nadi',
    name: 'Nadi Kuta (Health, Genetics & Lineage - Highest Weight)',
    sanskrit: 'नाड़ी कूट',
    kuta: 'Nadi',
    score: nadiScore,
    maxScore: 8,
    status: isNadiMatch ? 'Compatible' : 'Incompatible',
    description: isNadiMatch
      ? `Different Nadis (${nadi1} & ${nadi2}) - Perfect genetic & nervous constitution compatibility.`
      : `Same Nadi (${nadi1}) - Nadi Dosha detected; classical remedies advised.`
  });

  const totalScore = items.reduce((acc, it) => acc + it.score, 0);
  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let verdict: 'Excellent Match (Uttam)' | 'Good Match (Madhyam)' | 'Average Match' | 'Challenging (Nadi/Bhakoot Dosha)' = 'Good Match (Madhyam)';
  if (totalScore >= 28) verdict = 'Excellent Match (Uttam)';
  else if (totalScore >= 18) verdict = 'Good Match (Madhyam)';
  else if (totalScore >= 12) verdict = 'Average Match';
  else verdict = 'Challenging (Nadi/Bhakoot Dosha)';

  return {
    profile1,
    profile2,
    totalScore,
    maxScore,
    percentage,
    verdict,
    items
  };
}

class AstrologyEngineService {
  private swe: SwissEph | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<SwissEph> {
    if (this.isInitialized && this.swe) {
      return this.swe;
    }
    if (this.initPromise) {
      await this.initPromise;
      return this.swe!;
    }

    this.initPromise = (async () => {
      const sweInstance = new SwissEph();

      // Ensure setSiderealMode is bound if the underlying method is named set_sid_mode
      if (typeof (sweInstance as any).setSiderealMode !== 'function') {
        (sweInstance as any).setSiderealMode = (mode: number) => {
          if (typeof (sweInstance as any).set_sid_mode === 'function') {
            (sweInstance as any).set_sid_mode(mode, 0, 0);
          }
        };
      }

      await sweInstance.initSwissEph();
      this.swe = sweInstance;
      this.isInitialized = true;
    })();

    await this.initPromise;
    return this.swe!;
  }

  // Convert Date and Local Time to Universal Time Julian Day (using Timezone Offset)
  private getJulianDay(dateStr: string, timeStr: string, timezoneOffset: number, swe: SwissEph): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const localDecimalHours = hours + minutes / 60;
    
    // Subtract timezone offset to get Universal Time (UT / GMT)
    let utDecimalHours = localDecimalHours - timezoneOffset;
    
    let adjustedYear = year;
    let adjustedMonth = month;
    let adjustedDay = day;

    if (utDecimalHours < 0) {
      utDecimalHours += 24;
      const prevDate = new Date(Date.UTC(year, month - 1, day - 1));
      adjustedYear = prevDate.getUTCFullYear();
      adjustedMonth = prevDate.getUTCMonth() + 1;
      adjustedDay = prevDate.getUTCDate();
    } else if (utDecimalHours >= 24) {
      utDecimalHours -= 24;
      const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
      adjustedYear = nextDate.getUTCFullYear();
      adjustedMonth = nextDate.getUTCMonth() + 1;
      adjustedDay = nextDate.getUTCDate();
    }

    return swe.julday(adjustedYear, adjustedMonth, adjustedDay, utDecimalHours);
  }

  // Get current UTC Julian Day
  private getCurrentJulianDay(swe: SwissEph): number {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const decimalHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    return swe.julday(year, month, day, decimalHours);
  }

  // Calculate full astrology engine data
  async calculateAll(profile: UserProfile): Promise<CalculatedAstrologyData> {
    const swe = await this.init();
    const { latitude, longitude } = profile.birthCoordinates;
    const tzOffset = profile.timezoneOffset ?? getTimezoneOffsetForLocation(latitude, longitude, profile.birthCoordinates.placeName || profile.currentCity);

    // 1. Julian day for user's birth in Universal Time (UT)
    const birthJd = this.getJulianDay(profile.birthDate, profile.birthTime, tzOffset, swe);

    // 2. WESTERN TROPICAL CHART
    const tropicalHousesRaw = swe.houses(birthJd, latitude, longitude, 'P'); // Placidus
    const ascDegree = tropicalHousesRaw.ascmc[0];
    const mcDegree = tropicalHousesRaw.ascmc[1];

    const tropicalAscSign = getSignInfo(ascDegree);
    const tropicalMcSign = getSignInfo(mcDegree);

    const tropicalHouses: HouseCusp[] = [];
    for (let h = 1; h <= 12; h++) {
      const cuspDeg = tropicalHousesRaw.cusps[h];
      const signInfo = getSignInfo(cuspDeg);
      tropicalHouses.push({
        house: h,
        sign: signInfo.sign,
        degree: Math.round(cuspDeg * 100) / 100,
        formattedDegree: `${signInfo.sign} ${signInfo.formattedDegree}`
      });
    }

    const tropicalPlanets: PlanetPosition[] = [];
    let rahuTropicalLon = 0;

    for (const body of CELESTIAL_BODIES) {
      const res = swe.calc_ut(birthJd, body.id, swe.SEFLG_SPEED);
      const lon = res[0];
      const lat = res[1];
      const dist = res[2];
      const speed = res[3];
      const signInfo = getSignInfo(lon);

      if (body.name === 'Rahu') {
        rahuTropicalLon = lon;
      }

      // Determine Western house
      let houseNum = 1;
      for (let h = 1; h <= 12; h++) {
        const nextH = h === 12 ? 1 : h + 1;
        const currentCusp = tropicalHousesRaw.cusps[h];
        const nextCusp = tropicalHousesRaw.cusps[nextH];
        if (nextCusp > currentCusp) {
          if (lon >= currentCusp && lon < nextCusp) {
            houseNum = h;
            break;
          }
        } else {
          // Crosses 0° Aries
          if (lon >= currentCusp || lon < nextCusp) {
            houseNum = h;
            break;
          }
        }
      }

      tropicalPlanets.push({
        id: body.id,
        name: body.name,
        longitude: Math.round(lon * 1000) / 1000,
        latitude: Math.round(lat * 1000) / 1000,
        distance: Math.round(dist * 1000) / 1000,
        speed: Math.round(speed * 10000) / 10000,
        isRetrograde: speed < 0,
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
        signDegree: Math.round(signInfo.signDegree * 100) / 100,
        formattedDegree: signInfo.formattedDegree,
        house: houseNum
      });
    }

    // Add Ketu (South Node, exactly 180° opposite Rahu)
    const ketuTropicalLon = (rahuTropicalLon + 180) % 360;
    const ketuTropicalSign = getSignInfo(ketuTropicalLon);
    let ketuHouseNum = 1;
    for (let h = 1; h <= 12; h++) {
      const nextH = h === 12 ? 1 : h + 1;
      const currentCusp = tropicalHousesRaw.cusps[h];
      const nextCusp = tropicalHousesRaw.cusps[nextH];
      if (nextCusp > currentCusp) {
        if (ketuTropicalLon >= currentCusp && ketuTropicalLon < nextCusp) {
          ketuHouseNum = h;
          break;
        }
      } else {
        if (ketuTropicalLon >= currentCusp || ketuTropicalLon < nextCusp) {
          ketuHouseNum = h;
          break;
        }
      }
    }

    tropicalPlanets.push({
      id: 99,
      name: 'Ketu',
      longitude: Math.round(ketuTropicalLon * 1000) / 1000,
      latitude: 0,
      distance: 1,
      speed: -0.05,
      isRetrograde: true,
      sign: ketuTropicalSign.sign,
      signIndex: ketuTropicalSign.signIndex,
      signDegree: Math.round(ketuTropicalSign.signDegree * 100) / 100,
      formattedDegree: ketuTropicalSign.formattedDegree,
      house: ketuHouseNum
    });

    const westernChart: WesternChart = {
      system: 'Tropical (Western)',
      houseSystem: 'Placidus',
      julianDay: birthJd,
      ascendant: {
        sign: tropicalAscSign.sign,
        degree: Math.round(ascDegree * 100) / 100,
        formattedDegree: `${tropicalAscSign.sign} ${tropicalAscSign.formattedDegree}`
      },
      midheaven: {
        sign: tropicalMcSign.sign,
        degree: Math.round(mcDegree * 100) / 100,
        formattedDegree: `${tropicalMcSign.sign} ${tropicalMcSign.formattedDegree}`
      },
      planets: tropicalPlanets,
      houses: tropicalHouses,
      aspects: calculateWesternAspects(tropicalPlanets)
    };

    // 3. VEDIC SIDEREAL CHART (LAHIRI)
    // Apply swe.setSiderealMode(swe.SE_SIDM_LAHIRI)
    (swe as any).setSiderealMode(swe.SE_SIDM_LAHIRI);

    const ayanamsa = swe.get_ayanamsa(birthJd);

    // Calculate sidereal Lagna & houses
    const siderealHousesRaw = swe.houses_ex(birthJd, swe.SEFLG_SIDEREAL, latitude, longitude, 'P');
    const siderealLagnaDeg = siderealHousesRaw.ascmc[0];
    const lagnaSignInfo = getSignInfo(siderealLagnaDeg);
    const lagnaNakshatra = getNakshatraInfo(siderealLagnaDeg);

    // Vedic Whole Sign Houses from Lagna
    const vedicHouses: HouseCusp[] = [];
    const lagnaSignIndex = lagnaSignInfo.signIndex;
    for (let h = 1; h <= 12; h++) {
      const houseSignIndex = (lagnaSignIndex + (h - 1)) % 12;
      const houseStartDeg = houseSignIndex * 30;
      vedicHouses.push({
        house: h,
        sign: ZODIAC_SIGNS[houseSignIndex],
        degree: houseStartDeg,
        formattedDegree: `${ZODIAC_SIGNS[houseSignIndex]} 0°00'`
      });
    }

    const siderealPlanets: PlanetPosition[] = [];
    let rahuSiderealLon = 0;

    for (const body of CELESTIAL_BODIES) {
      // Calculation with SIDEREAL flag
      const res = swe.calc_ut(birthJd, body.id, swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL);
      const lon = res[0];
      const lat = res[1];
      const dist = res[2];
      const speed = res[3];
      const signInfo = getSignInfo(lon);
      const nakshatraInfo = getNakshatraInfo(lon);

      if (body.name === 'Rahu') {
        rahuSiderealLon = lon;
      }

      // Vedic House calculation (Whole Sign: 1st house is Lagna sign)
      const planetHouse = ((signInfo.signIndex - lagnaSignIndex + 12) % 12) + 1;

      siderealPlanets.push({
        id: body.id,
        name: body.name,
        longitude: Math.round(lon * 1000) / 1000,
        latitude: Math.round(lat * 1000) / 1000,
        distance: Math.round(dist * 1000) / 1000,
        speed: Math.round(speed * 10000) / 10000,
        isRetrograde: speed < 0,
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
        signDegree: Math.round(signInfo.signDegree * 100) / 100,
        formattedDegree: signInfo.formattedDegree,
        house: planetHouse,
        nakshatra: nakshatraInfo.nakshatra,
        nakshatraPada: nakshatraInfo.nakshatraPada,
        nakshatraLord: nakshatraInfo.nakshatraLord
      });
    }

    // Add Ketu (180° opposite Rahu)
    const ketuSiderealLon = (rahuSiderealLon + 180) % 360;
    const ketuSidSign = getSignInfo(ketuSiderealLon);
    const ketuNakshatra = getNakshatraInfo(ketuSiderealLon);
    const ketuHouse = ((ketuSidSign.signIndex - lagnaSignIndex + 12) % 12) + 1;

    siderealPlanets.push({
      id: 99,
      name: 'Ketu',
      longitude: Math.round(ketuSiderealLon * 1000) / 1000,
      latitude: 0,
      distance: 1,
      speed: -0.05,
      isRetrograde: true,
      sign: ketuSidSign.sign,
      signIndex: ketuSidSign.signIndex,
      signDegree: Math.round(ketuSidSign.signDegree * 100) / 100,
      formattedDegree: ketuSidSign.formattedDegree,
      house: ketuHouse,
      nakshatra: ketuNakshatra.nakshatra,
      nakshatraPada: ketuNakshatra.nakshatraPada,
      nakshatraLord: ketuNakshatra.nakshatraLord
    });

    // Calculate exact UTC birth date object for Vimshottari Dasha
    const [bYear, bMonth, bDay] = profile.birthDate.split('-').map(Number);
    const [bHour, bMin] = profile.birthTime.split(':').map(Number);
    const birthUtcMs = Date.UTC(bYear, (bMonth || 1) - 1, bDay || 1, bHour || 12, bMin || 0) - (tzOffset * 3600 * 1000);
    const birthDateObj = new Date(birthUtcMs);

    const siderealMoon = siderealPlanets.find((p) => p.name === 'Moon');
    const moonSiderealLon = siderealMoon ? siderealMoon.longitude : 0;
    const dashaReport = calculateVimshottariDasha(moonSiderealLon, birthDateObj);

    // Calculate D9 Navamsha Chart
    const navamshaChart = calculateNavamshaPositions(siderealPlanets, {
      sign: lagnaSignInfo.sign,
      degree: siderealLagnaDeg,
      formattedDegree: lagnaSignInfo.formattedDegree
    });

    // Annotate Dignity & Vargottama for each Sidereal planet
    siderealPlanets.forEach((p) => {
      p.dignity = getPlanetaryDignity(p.name, p.sign);
      const navP = navamshaChart.planets.find((np) => np.name === p.name);
      p.isVargottama = navP ? navP.sign === p.sign : false;
    });

    const vedicChart: VedicChart = {
      system: 'Sidereal (Vedic / Lahiri)',
      houseSystem: 'Whole Sign / Equal',
      ayanamsaName: 'Lahiri',
      ayanamsaValue: Math.round(ayanamsa * 1000) / 1000,
      julianDay: birthJd,
      lagna: {
        sign: lagnaSignInfo.sign,
        degree: Math.round(siderealLagnaDeg * 100) / 100,
        formattedDegree: `${lagnaSignInfo.sign} ${lagnaSignInfo.formattedDegree}`,
        nakshatra: lagnaNakshatra.nakshatra,
        pada: lagnaNakshatra.nakshatraPada
      },
      planets: siderealPlanets,
      houses: vedicHouses,
      navamshaChart,
      dashaReport
    };

    // 4. CURRENT DAY TRANSITS FOR BOTH SYSTEMS
    const transitJd = this.getCurrentJulianDay(swe);
    const nowIso = new Date().toISOString();

    // Tropical Transits
    const tropicalTransits: PlanetPosition[] = [];
    let transRahuTrop = 0;
    for (const body of CELESTIAL_BODIES) {
      const res = swe.calc_ut(transitJd, body.id, swe.SEFLG_SPEED);
      const lon = res[0];
      const signInfo = getSignInfo(lon);
      if (body.name === 'Rahu') transRahuTrop = lon;

      tropicalTransits.push({
        id: body.id,
        name: body.name,
        longitude: Math.round(lon * 1000) / 1000,
        latitude: Math.round(res[1] * 1000) / 1000,
        distance: Math.round(res[2] * 1000) / 1000,
        speed: Math.round(res[3] * 10000) / 10000,
        isRetrograde: res[3] < 0,
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
        signDegree: Math.round(signInfo.signDegree * 100) / 100,
        formattedDegree: signInfo.formattedDegree
      });
    }
    const ketuTropTransitLon = (transRahuTrop + 180) % 360;
    const ketuTropTransitSign = getSignInfo(ketuTropTransitLon);
    tropicalTransits.push({
      id: 99,
      name: 'Ketu',
      longitude: Math.round(ketuTropTransitLon * 1000) / 1000,
      latitude: 0,
      distance: 1,
      speed: -0.05,
      isRetrograde: true,
      sign: ketuTropTransitSign.sign,
      signIndex: ketuTropTransitSign.signIndex,
      signDegree: Math.round(ketuTropTransitSign.signDegree * 100) / 100,
      formattedDegree: ketuTropTransitSign.formattedDegree
    });

    // Sidereal Transits (with Lahiri)
    (swe as any).setSiderealMode(swe.SE_SIDM_LAHIRI);
    const siderealTransits: PlanetPosition[] = [];
    let transRahuSid = 0;
    for (const body of CELESTIAL_BODIES) {
      const res = swe.calc_ut(transitJd, body.id, swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL);
      const lon = res[0];
      const signInfo = getSignInfo(lon);
      const nakshatraInfo = getNakshatraInfo(lon);
      if (body.name === 'Rahu') transRahuSid = lon;

      siderealTransits.push({
        id: body.id,
        name: body.name,
        longitude: Math.round(lon * 1000) / 1000,
        latitude: Math.round(res[1] * 1000) / 1000,
        distance: Math.round(res[2] * 1000) / 1000,
        speed: Math.round(res[3] * 10000) / 10000,
        isRetrograde: res[3] < 0,
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
        signDegree: Math.round(signInfo.signDegree * 100) / 100,
        formattedDegree: signInfo.formattedDegree,
        nakshatra: nakshatraInfo.nakshatra,
        nakshatraPada: nakshatraInfo.nakshatraPada,
        nakshatraLord: nakshatraInfo.nakshatraLord
      });
    }
    const ketuSidTransitLon = (transRahuSid + 180) % 360;
    const ketuSidTransitSign = getSignInfo(ketuSidTransitLon);
    const ketuSidTransitNakshatra = getNakshatraInfo(ketuSidTransitLon);
    siderealTransits.push({
      id: 99,
      name: 'Ketu',
      longitude: Math.round(ketuSidTransitLon * 1000) / 1000,
      latitude: 0,
      distance: 1,
      speed: -0.05,
      isRetrograde: true,
      sign: ketuSidTransitSign.sign,
      signIndex: ketuSidTransitSign.signIndex,
      signDegree: Math.round(ketuSidTransitSign.signDegree * 100) / 100,
      formattedDegree: ketuSidTransitSign.formattedDegree,
      nakshatra: ketuSidTransitNakshatra.nakshatra,
      nakshatraPada: ketuSidTransitNakshatra.nakshatraPada,
      nakshatraLord: ketuSidTransitNakshatra.nakshatraLord
    });

    const liveSun = siderealTransits.find((p) => p.name === 'Sun');
    const liveMoon = siderealTransits.find((p) => p.name === 'Moon');
    const panchangam = calculateDailyPanchangam(
      liveSun ? liveSun.longitude : 0,
      liveMoon ? liveMoon.longitude : 0,
      new Date()
    );

    const calculatedData: CalculatedAstrologyData = {
      profileId: profile.id,
      tropicalChart: westernChart,
      siderealChart: vedicChart,
      transits: {
        tropical: {
          system: 'Tropical',
          julianDay: transitJd,
          calculatedAt: nowIso,
          planets: tropicalTransits
        },
        sidereal: {
          system: 'Sidereal',
          julianDay: transitJd,
          calculatedAt: nowIso,
          planets: siderealTransits
        }
      },
      panchangam,
      calculatedAt: nowIso
    };

    // Store calculated JSON in IndexedDB strictly scoped to this profile
    await storageService.saveAstrologyData(profile.id, calculatedData);

    return calculatedData;
  }
}

export const astrologyEngine = new AstrologyEngineService();
