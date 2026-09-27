export interface Coordinates {
  latitude: number;
  longitude: number;
  placeName?: string;
}

export type FamilyRelationship = 
  | 'Self' 
  | 'Spouse' 
  | 'Father' 
  | 'Mother' 
  | 'Child' 
  | 'Sibling' 
  | 'Partner' 
  | 'Friend' 
  | 'Other';

export interface UserProfile {
  id: string; // Unique profile identifier
  name: string;
  relationship: FamilyRelationship;
  gender?: 'Male' | 'Female' | 'Other';
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (24hr)
  birthCoordinates: Coordinates;
  currentCity: string;
  currentState: string;
  timezoneOffset?: number; // Timezone offset in hours relative to UTC (e.g. +5.5 for IST, -5 for EST)
  color?: string; // Avatar accent color
  createdAt?: number;
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

export interface Antardasha {
  lord: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Mahadasha {
  lord: string;
  totalYears: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  percentagePassed?: number;
  antardashas?: Antardasha[];
}

export interface DashaReport {
  currentMahadasha: Mahadasha | null;
  timeline: Mahadasha[];
  nakshatra: string;
  pada: number;
  balanceYears: number;
}

export interface NavamshaChart {
  lagna: {
    sign: string;
    signIndex: number;
    formattedDegree: string;
  };
  planets: PlanetPosition[];
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
  navamshaChart?: NavamshaChart;
  dashaReport?: DashaReport;
}

export interface PanchangamData {
  tithi: {
    number: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    percentagePassed: number;
  };
  nakshatra: {
    name: string;
    pada: number;
    lord: string;
  };
  yoga: {
    number: number;
    name: string;
  };
  karana: {
    name: string;
  };
  activeHora: {
    lord: string;
    startTime: string;
    endTime: string;
  };
  rahuKalam: {
    startTime: string;
    endTime: string;
    isCurrent: boolean;
  };
  yamagandam: {
    startTime: string;
    endTime: string;
    isCurrent: boolean;
  };
}

export interface PoruthamItem {
  id: string;
  name: string;
  sanskrit: string;
  status: 'Compatible' | 'Moderate' | 'Incompatible';
  score: number;
  maxScore: number;
  description: string;
}

export interface PoruthamReport {
  profile1: { name: string; moonSign: string; nakshatra: string; pada: number };
  profile2: { name: string; moonSign: string; nakshatra: string; pada: number };
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: 'Excellent Match' | 'Good Match' | 'Average Match' | 'Challenging / Needs Remediation';
  items: PoruthamItem[];
}

export interface TransitData {
  system: 'Tropical' | 'Sidereal';
  julianDay: number;
  calculatedAt: string;
  planets: PlanetPosition[];
}

export interface CalculatedAstrologyData {
  profileId: string;
  tropicalChart: WesternChart;
  siderealChart: VedicChart;
  transits: {
    tropical: TransitData;
    sidereal: TransitData;
  };
  panchangam?: PanchangamData;
  calculatedAt: string;
}

export interface ChatMessage {
  id: string;
  profileId?: string; // Strictly scoped to specific family profile
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}
