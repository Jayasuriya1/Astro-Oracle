export interface Coordinates {
  latitude: number;
  longitude: number;
  placeName?: string;
}

export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (24hr)
  birthCoordinates: Coordinates;
  currentCity: string;
  currentState: string;
}

export interface PlanetPosition {
  name: string;
  id: number;
  longitude: number; // 0 - 360
  latitude: number;
  distance: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  signIndex: number; // 0 = Aries, 11 = Pisces
  signDegree: number; // 0 - 30
  formattedDegree: string; // e.g. 15°24'
  house?: number; // 1 - 12
  nakshatra?: string; // For Vedic
  nakshatraPada?: number; // 1 - 4
  nakshatraLord?: string;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  formattedDegree: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
  angle: number;
  orb: number;
}

export interface WesternChart {
  system: 'Tropical (Western)';
  houseSystem: 'Placidus';
  julianDay: number;
  ascendant: {
    sign: string;
    degree: number;
    formattedDegree: string;
  };
  midheaven: {
    sign: string;
    degree: number;
    formattedDegree: string;
  };
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
}

export interface VedicChart {
  system: 'Sidereal (Vedic / Lahiri)';
  houseSystem: 'Whole Sign / Equal';
  ayanamsaName: 'Lahiri';
  ayanamsaValue: number;
  julianDay: number;
  lagna: {
    sign: string;
    degree: number;
    formattedDegree: string;
    nakshatra: string;
    pada: number;
  };
  planets: PlanetPosition[];
  houses: HouseCusp[];
  navamshaSummary?: Record<string, string>;
}

export interface TransitData {
  system: 'Tropical' | 'Sidereal';
  julianDay: number;
  calculatedAt: string;
  planets: PlanetPosition[];
}

export interface CalculatedAstrologyData {
  tropicalChart: WesternChart;
  siderealChart: VedicChart;
  transits: {
    tropical: TransitData;
    sidereal: TransitData;
  };
  calculatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}
