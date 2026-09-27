import SwissEph from 'swisseph-wasm';
import type {
  UserProfile,
  CalculatedAstrologyData,
  WesternChart,
  VedicChart,
  PlanetPosition,
  HouseCusp,
  Aspect
} from '../types/astrology';
import { storageService } from './storageService';

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

  // Convert Date and Time to Universal Time Julian Day
  private getJulianDay(dateStr: string, timeStr: string, swe: SwissEph): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const decimalHours = hours + minutes / 60;
    return swe.julday(year, month, day, decimalHours);
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

    // 1. Julian day for user's birth
    const birthJd = this.getJulianDay(profile.birthDate, profile.birthTime, swe);
    const { latitude, longitude } = profile.birthCoordinates;

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
      house: ((tropicalPlanets.find(p => p.name === 'Rahu')?.house || 1) + 5) % 12 + 1
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
    // CRITICAL REQUIREMENT: Apply swe.setSiderealMode(swe.SE_SIDM_LAHIRI)
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
      houses: vedicHouses
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

    const calculatedData: CalculatedAstrologyData = {
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
      calculatedAt: nowIso
    };

    // Store calculated JSON in IndexedDB
    await storageService.saveAstrologyData(calculatedData);

    return calculatedData;
  }
}

export const astrologyEngine = new AstrologyEngineService();
