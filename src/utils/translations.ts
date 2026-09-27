// Comprehensive English and Tamil localization dictionary for Astro Oracle

export type Language = 'en' | 'ta';

export const ZODIAC_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  Aries: { en: 'Aries', ta: 'மேஷம்' },
  Taurus: { en: 'Taurus', ta: 'ரிஷபம்' },
  Gemini: { en: 'Gemini', ta: 'மிதுனம்' },
  Cancer: { en: 'Cancer', ta: 'கடகம்' },
  Leo: { en: 'Leo', ta: 'சிம்மம்' },
  Virgo: { en: 'Virgo', ta: 'கன்னி' },
  Libra: { en: 'Libra', ta: 'துலாம்' },
  Scorpio: { en: 'Scorpio', ta: 'விருச்சிகம்' },
  Sagittarius: { en: 'Sagittarius', ta: 'தனுசு' },
  Capricorn: { en: 'Capricorn', ta: 'மகரம்' },
  Aquarius: { en: 'Aquarius', ta: 'கும்பம்' },
  Pisces: { en: 'Pisces', ta: 'மீனம்' }
};

export const PLANET_TRANSLATIONS: Record<string, { en: string; ta: string; taShort: string }> = {
  Sun: { en: 'Sun', ta: 'சூரியன்', taShort: 'சூரி' },
  Moon: { en: 'Moon', ta: 'சந்திரன்', taShort: 'சந்' },
  Mars: { en: 'Mars', ta: 'செவ்வாய்', taShort: 'செவ்' },
  Mercury: { en: 'Mercury', ta: 'புதன்', taShort: 'புத' },
  Jupiter: { en: 'Jupiter', ta: 'குரு (வியாழன்)', taShort: 'குரு' },
  Venus: { en: 'Venus', ta: 'சுக்கிரன்', taShort: 'சுக்' },
  Saturn: { en: 'Saturn', ta: 'சனி', taShort: 'சனி' },
  Rahu: { en: 'Rahu', ta: 'ராகு', taShort: 'ராகு' },
  Ketu: { en: 'Ketu', ta: 'கேது', taShort: 'கேது' },
  Ascendant: { en: 'Ascendant', ta: 'லக்னம்', taShort: 'லக்' },
  Lagna: { en: 'Lagna', ta: 'லக்னம்', taShort: 'லக்' },
  Uranus: { en: 'Uranus', ta: 'யுரேனஸ்', taShort: 'யுரே' },
  Neptune: { en: 'Neptune', ta: 'நெப்டியூன்', taShort: 'நெப்' },
  Pluto: { en: 'Pluto', ta: 'புளூட்டோ', taShort: 'புளூ' }
};

export const NAKSHATRA_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  Ashwini: { en: 'Ashwini', ta: 'அசுவினி' },
  Bharani: { en: 'Bharani', ta: 'பரணி' },
  Krittika: { en: 'Krittika', ta: 'கார்த்திகை' },
  Rohini: { en: 'Rohini', ta: 'ரோகிணி' },
  Mrigashirsha: { en: 'Mrigashirsha', ta: 'மிருகசீரிடம்' },
  Ardra: { en: 'Ardra', ta: 'திருவாதிரை' },
  Punarvasu: { en: 'Punarvasu', ta: 'புனர்பூசம்' },
  Pushya: { en: 'Pushya', ta: 'பூசம்' },
  Ashlesha: { en: 'Ashlesha', ta: 'ஆயில்யம்' },
  Magha: { en: 'Magha', ta: 'மகம்' },
  'Purva Phalguni': { en: 'Purva Phalguni', ta: 'பூரம்' },
  'Uttara Phalguni': { en: 'Uttara Phalguni', ta: 'உத்திரம்' },
  Hasta: { en: 'Hasta', ta: 'அஸ்தம்' },
  Chitra: { en: 'Chitra', ta: 'சித்திரை' },
  Swati: { en: 'Swati', ta: 'சுவாதி' },
  Vishakha: { en: 'Vishakha', ta: 'விசாகம்' },
  Anuradha: { en: 'Anuradha', ta: 'அனுஷம்' },
  Jyeshtha: { en: 'Jyeshtha', ta: 'கேட்டை' },
  Mula: { en: 'Mula', ta: 'மூலம்' },
  'Purva Ashadha': { en: 'Purva Ashadha', ta: 'பூராடம்' },
  'Uttara Ashadha': { en: 'Uttara Ashadha', ta: 'உத்திராடம்' },
  Shravana: { en: 'Shravana', ta: 'திருவோணம்' },
  Dhanishta: { en: 'Dhanishta', ta: 'அவிட்டம்' },
  Shatabhisha: { en: 'Shatabhisha', ta: 'சதயம்' },
  'Purva Bhadrapada': { en: 'Purva Bhadrapada', ta: 'பூரட்டாதி' },
  'Uttara Bhadrapada': { en: 'Uttara Bhadrapada', ta: 'உத்திரட்டாதி' },
  Revati: { en: 'Revati', ta: 'ரேவதி' }
};

export const PORUTHAM_TAMIL_NAMES: Record<string, { en: string; ta: string; taDesc: string }> = {
  dina: {
    en: 'Dina Porutham',
    ta: 'தினப் பொருத்தம்',
    taDesc: 'ஆயுள், ஆரோக்கியம் மற்றும் நோயற்ற வாழ்வுக்கான நட்சத்திரப் பொருத்தம்.'
  },
  gana: {
    en: 'Gana Porutham',
    ta: 'கணப் பொருத்தம்',
    taDesc: 'இருவரின் சுபாவம் மற்றும் மனோபாவ ஒற்றுமைக்கான பொருத்தம்.'
  },
  mahendra: {
    en: 'Mahendra Porutham',
    ta: 'மகேந்திரப் பொருத்தம்',
    taDesc: 'சந்தான விருத்தி (புத்திர பாக்கியம்) மற்றும் வம்ச வளர்ச்சி.'
  },
  stree_deergha: {
    en: 'Stree Deergha',
    ta: 'ஸ்திரீ தீர்க்கப் பொருத்தம்',
    taDesc: 'பெண்ணின் தீர்க்காயுள், மகிழ்ச்சி மற்றும் குடும்ப நலம்.'
  },
  yoni: {
    en: 'Yoni Porutham',
    ta: 'யோனிப் பொருத்தம்',
    taDesc: 'தாம்பத்திய ஒற்றுமை, உடல் மற்றும் பாலியல் இணக்கம்.'
  },
  rasi: {
    en: 'Rasi Porutham',
    ta: 'ராசிப் பொருத்தம்',
    taDesc: 'குடும்ப வம்ச விருத்தி மற்றும் மன ரீதியான அன்யோன்யம்.'
  },
  rasyadhipathi: {
    en: 'Rasyadhipathi Porutham',
    ta: 'ராசியாதிபதிப் பொருத்தம்',
    taDesc: 'ராசி அதிபதிகளின் நட்பு மற்றும் பரஸ்பர நல்லெண்ணம்.'
  },
  vashya: {
    en: 'Vashya Porutham',
    ta: 'வசியப் பொருத்தம்',
    taDesc: 'கணவன் மனைவி இடையேயான ஈர்ப்பு மற்றும் வசீகரம்.'
  },
  rajju: {
    en: 'Rajju Porutham (Key)',
    ta: 'ரஜ்ஜுப் பொருத்தம் (மாங்கல்யம்)',
    taDesc: 'மாங்கல்ய பலம் மற்றும் தீர்க்காயுள் தரும் முதன்மையான பொருத்தம்.'
  },
  vedha: {
    en: 'Vedha Porutham',
    ta: 'வேதப் பொருத்தம்',
    taDesc: 'துன்பங்கள் மற்றும் விரோதம் இல்லாமைக்கான நட்சத்திரப் பொருத்தம்.'
  }
};

export const UI_TRANSLATIONS = {
  en: {
    appName: 'ASTRO ORACLE',
    subtitle: 'SWISSEPH WASM • HYBRID VEDIC & WESTERN',
    navChat: 'Oracle Chat',
    navCharts: 'Natal Placements',
    navTransits: 'Live Transits',
    export: 'Export',
    studioWorkstation: 'Studio Workstation',
    fullView: 'Full View',
    fullChart: 'Full Chart',
    vedicKundali: 'Vedic Kundali',
    westernWheel: 'Western Wheel',
    southIndian: 'South Indian Grid',
    northIndian: 'North Indian Diamond',
    d1Rasi: 'D1 Rasi',
    d9Navamsha: 'D9 Navamsha',
    triadLagna: 'Lagna',
    triadChandra: 'Chandra',
    triadSurya: 'Surya',
    activeDashaTimeline: 'Active Vimshottari Timeline',
    activeDashaPeriod: 'Active Dasha Period',
    currentBhukti: 'Current Bhukti',
    elapsed: 'elapsed',
    nakshatraPadaCoordinates: 'Nakshatra & Pada Coordinates',
    lahiriAyanamsa: 'Lahiri Ayanamsa',
    colPoint: 'Point',
    colSignDeg: 'Sign & Deg',
    colNakshatraPada: 'Nakshatra (Pada)',
    colLord: 'Lord',
    colHouse: 'House',
    colStatus: 'Status',
    direct: 'Direct',
    retrograde: 'Retrograde',
    tabVedic: 'Vedic (Lahiri)',
    tabWestern: 'Western (Wheel)',
    tabTransits: 'Panchangam & Live',
    tabPorutham: 'Porutham (Matching)',
    astronomicalPlacements: 'Astronomical Placements',
    born: 'Born',
    at: 'at',
    livePanchangam: 'Live Daily Panchangam',
    activeHora: 'Active Planetary Hora',
    rahuKalam: 'Rahu Kalam (Inauspicious Window)',
    yamagandam: 'Yamagandam Window',
    activeNow: 'ACTIVE NOW',
    tithiPassed: 'passed',
    poruthamTitle: 'Vedic Compatibility & 10 Porutham Analysis',
    poruthamSubtitle: 'Traditional South Indian marriage and alliance matching based on Moon Nakshatras & Rajju.',
    matchScore: 'MATCH SCORE',
    overallVerdict: 'OVERALL ASTROLOGICAL VERDICT',
    rajjuSafeguard: 'Rajju Safeguard',
    matchedProtected: 'Matched (Protected)',
    rajjuDosha: 'Attention (Remedies Advised)',
    partner1: 'Partner 1 (Girl / Native)',
    partner2: 'Partner 2 (Boy / Match)',
    compatible: 'Compatible',
    moderate: 'Moderate',
    incompatible: 'Incompatible',
    consultationChat: 'Consultation Chat',
    visualKundali: 'Visual Kundali',
    askPlaceholder: 'Ask about timing, marriage, career, remedies...',
    setKeyPlaceholder: 'Set your Gemini API key in Settings...',
    clearConversation: 'Clear conversation'
  },
  ta: {
    appName: 'அஸ்ட்ரோ ஆரக்கிள்',
    subtitle: 'சுவிஸ் எபிமெரிஸ் • வேத & மேற்கத்திய ஜோதிடம்',
    navChat: 'ஆருட உரையாடல்',
    navCharts: 'ஜாதக கட்டங்கள்',
    navTransits: 'கோச்சார நிலைகள்',
    export: 'பதிவிறக்கு',
    studioWorkstation: 'ஜோதிட ஆய்வகம்',
    fullView: 'முழு விவரம்',
    fullChart: 'முழு ஜாதகம்',
    vedicKundali: 'வேத குண்டலி',
    westernWheel: 'மேற்கத்திய சக்கரம்',
    southIndian: 'தென்னிந்திய முறை',
    northIndian: 'வடஇந்திய முறை',
    d1Rasi: 'D1 ராசி',
    d9Navamsha: 'D9 நவாம்சம்',
    triadLagna: 'லக்னம்',
    triadChandra: 'சந்திரன்',
    triadSurya: 'சூரியன்',
    activeDashaTimeline: 'நடப்பு விம்சோத்தரி தசா புத்தி',
    activeDashaPeriod: 'நடப்பு தசா காலம்',
    currentBhukti: 'நடப்பு புக்தி',
    elapsed: 'முடிந்தது',
    nakshatraPadaCoordinates: 'நட்சத்திரம் & பாத நிலைகள்',
    lahiriAyanamsa: 'லஹிரி அயனாம்சம்',
    colPoint: 'கிரகம்',
    colSignDeg: 'ராசி & பாகை',
    colNakshatraPada: 'நட்சத்திரம் (பாதம்)',
    colLord: 'அதிபதி',
    colHouse: 'பாவகம்',
    colStatus: 'நிலை',
    direct: 'நேர்கதி',
    retrograde: 'வக்ரம் (R)',
    tabVedic: 'வேத ஜோதிடம் (Lahiri)',
    tabWestern: 'மேற்கத்திய சக்கரம் (360°)',
    tabTransits: 'பஞ்சாங்கம் & கோச்சாரம்',
    tabPorutham: 'திருமணப் பொருத்தம் (10)',
    astronomicalPlacements: 'ஜாதக கிரக அமைப்புகள்',
    born: 'பிறப்பு',
    at: 'நேரம்',
    livePanchangam: 'இன்றைய நேரடி பஞ்சாங்கம்',
    activeHora: 'நடப்பு கிரக ஓரை (Hora)',
    rahuKalam: 'இராகு காலம் (தவிர்க்க வேண்டிய நேரம்)',
    yamagandam: 'எமகண்டம்',
    activeNow: 'தற்போது நடப்பில் உள்ளது',
    tithiPassed: 'முடிந்தது',
    poruthamTitle: 'வேத திருமணப் பொருத்தம் & 10 பொருத்த ஆய்வு',
    poruthamSubtitle: 'நட்சத்திரம் மற்றும் மங்கள ரஜ்ஜு அடிப்படையிலான பாரம்பரிய தென்னிந்திய திருமணப் பொருத்தம்.',
    matchScore: 'பொருத்த மதிப்பெண்',
    overallVerdict: 'ஒட்டுமொத்த திருமணப் பொருத்தம்',
    rajjuSafeguard: 'ரஜ்ஜு பாதுகாப்பு',
    matchedProtected: 'பொருத்தம் உண்டு (பாதுகாப்பானது)',
    rajjuDosha: 'கவனம் (பரிகாரம் தேவை)',
    partner1: 'நபர் 1 (பெண் / ஜாதகர்)',
    partner2: 'நபர் 2 (ஆண் / வரன்)',
    compatible: 'பொருத்தம் உண்டு',
    moderate: 'மத்திமம்',
    incompatible: 'பொருத்தம் இல்லை',
    consultationChat: 'ஆருட ஆலோசனை',
    visualKundali: 'கட்ட வரைபடம்',
    askPlaceholder: 'திருமணம், தொழில், தசா புத்தி, பரிகாரங்கள் பற்றி கேளுங்கள்...',
    setKeyPlaceholder: 'Settings-ல் உங்கள் Gemini API Key-ஐ உள்ளிடவும்...',
    clearConversation: 'உரையாடலை அழிக்க'
  }
};

// Helper translation functions
export function getTranslatedZodiac(sign: string, lang: Language): string {
  if (!sign) return '';
  const match = ZODIAC_TRANSLATIONS[sign];
  return match ? match[lang] : sign;
}

export function getTranslatedPlanet(planet: string, lang: Language, short: boolean = false): string {
  if (!planet) return '';
  const match = PLANET_TRANSLATIONS[planet];
  if (!match) return planet;
  return short && lang === 'ta' ? match.taShort : match[lang];
}

export function getTranslatedNakshatra(nakshatra: string, lang: Language): string {
  if (!nakshatra) return '';
  const match = NAKSHATRA_TRANSLATIONS[nakshatra];
  return match ? match[lang] : nakshatra;
}

export function getPoruthamInfo(id: string, lang: Language) {
  const item = PORUTHAM_TAMIL_NAMES[id];
  if (!item) {
    return { name: id, desc: '' };
  }
  return {
    name: lang === 'ta' ? item.ta : item.en,
    tamilSubtitle: item.ta,
    desc: lang === 'ta' ? item.taDesc : ''
  };
}
