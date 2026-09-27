import jsPDF from 'jspdf';
import type { 
  CalculatedAstrologyData, 
  UserProfile, 
  ChatMessage, 
  PlanetPosition 
} from '../types/astrology';

// Zodiac signs reference
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SOUTH_INDIAN_BOXES = [
  { signIndex: 11, sign: 'Pisces', tamil: 'மீனம்', row: 0, col: 0 },
  { signIndex: 0,  sign: 'Aries', tamil: 'மேஷம்', row: 0, col: 1 },
  { signIndex: 1,  sign: 'Taurus', tamil: 'ரிஷபம்', row: 0, col: 2 },
  { signIndex: 2,  sign: 'Gemini', tamil: 'மிதுனம்', row: 0, col: 3 },
  { signIndex: 3,  sign: 'Cancer', tamil: 'கடகம்', row: 1, col: 3 },
  { signIndex: 4,  sign: 'Leo', tamil: 'சிம்மம்', row: 2, col: 3 },
  { signIndex: 5,  sign: 'Virgo', tamil: 'கன்னி', row: 3, col: 3 },
  { signIndex: 6,  sign: 'Libra', tamil: 'துலாம்', row: 3, col: 2 },
  { signIndex: 7,  sign: 'Scorpio', tamil: 'விருச்சிகம்', row: 3, col: 1 },
  { signIndex: 8,  sign: 'Sagittarius', tamil: 'தனுசு', row: 3, col: 0 },
  { signIndex: 9,  sign: 'Capricorn', tamil: 'மகரம்', row: 2, col: 0 },
  { signIndex: 10, sign: 'Aquarius', tamil: 'கும்பம்', row: 1, col: 0 }
];

const PLANET_COLORS_HEX: Record<string, string> = {
  Sun: '#b45309',      // Royal Amber
  Moon: '#0369a1',     // Deep Sky Blue
  Mars: '#b91c1c',     // Red Coral
  Mercury: '#047857',  // Emerald Green
  Jupiter: '#a16207',  // Topaz Gold
  Venus: '#be185d',    // Diamond Pink
  Saturn: '#334155',   // Deep Slate
  Rahu: '#6d28d9',     // Violet
  Ketu: '#475569',     // Cool Grey
  Uranus: '#0891b2',   // Cyan
  Neptune: '#4338ca',  // Indigo
  Pluto: '#831843'     // Deep Burgundy
};

/**
 * Format degree strings safely for jsPDF Standard Fonts (WinAnsiEncoding)
 * Converts degree symbol ° into String.fromCharCode(176) to prevent 9°59' rendering as 9959
 */
export function formatDegPdf(degreeStr: string): string {
  if (!degreeStr) return `0${String.fromCharCode(176)}00'`;
  return degreeStr.replace(/°/g, String.fromCharCode(176));
}

/**
 * Calculate Vedic Weekday Day Lord (Vara) with sunrise rule (~06:00 AM cutoff)
 */
export function calculateVedicVara(dateStr: string, timeStr: string): string {
  if (!dateStr) return 'Sunday (Aditya / Sun)';
  const dateObj = new Date(`${dateStr}T${timeStr || '12:00'}:00`);
  let day = dateObj.getDay(); // 0 = Sunday
  const [h] = (timeStr || '12:00').split(':').map(Number);
  if (h < 6) {
    day = (day + 6) % 7; // Previous day if born before sunrise
  }
  const varas = [
    'Sunday (Aditya / Sun)',
    'Monday (Soma / Moon)',
    'Tuesday (Mangala / Mars)',
    'Wednesday (Budha / Mercury)',
    'Thursday (Guru / Jupiter)',
    'Friday (Shukra / Venus)',
    'Saturday (Shani / Saturn)'
  ];
  return varas[day];
}

/**
 * Standard 27 Nakshatras and Star Lords
 */
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury'
];

/**
 * Derive exact Vedic Nakshatra, Pada, and Star Lord strictly from planetary longitude
 */
export function getNakshatraFromLongitude(longitude: number) {
  const normLong = ((longitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(normLong / (360 / 27)); // 13.333333333333334 deg per Nakshatra
  const degInNak = normLong - nakshatraIndex * (360 / 27);
  const pada = Math.floor(degInNak / (360 / 108)) + 1; // 3.3333333333333335 deg per Pada
  return {
    name: NAKSHATRA_NAMES[nakshatraIndex],
    lord: NAKSHATRA_LORDS[nakshatraIndex],
    pada: pada,
    index: nakshatraIndex
  };
}

/**
 * Determine Vedic planetary dignity (Exalted, Own, Debilitated, etc.)
 */
export function getPlanetDignity(planetName: string, sign: string): string {
  const p = planetName.toLowerCase();
  const s = sign.toLowerCase();

  switch (p) {
    case 'sun':
      if (s === 'aries') return 'Exalted (Uchcha)';
      if (s === 'leo') return 'Own Sign (Swakshetra)';
      if (s === 'libra') return 'Debilitated (Neecha)';
      if (['sagittarius', 'scorpio', 'cancer'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'moon':
      if (s === 'taurus') return 'Exalted (Uchcha)';
      if (s === 'cancer') return 'Own Sign (Swakshetra)';
      if (s === 'scorpio') return 'Debilitated (Neecha)';
      if (['aries', 'leo', 'gemini'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'mars':
      if (s === 'capricorn') return 'Exalted (Uchcha)';
      if (['aries', 'scorpio'].includes(s)) return 'Own Sign (Swakshetra)';
      if (s === 'cancer') return 'Debilitated (Neecha)';
      if (['leo', 'sagittarius', 'pisces'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'mercury':
      if (s === 'virgo') return 'Exalted / Own';
      if (s === 'gemini') return 'Own Sign (Swakshetra)';
      if (s === 'pisces') return 'Debilitated (Neecha)';
      if (['taurus', 'libra', 'capricorn'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'jupiter':
      if (s === 'cancer') return 'Exalted (Uchcha)';
      if (['sagittarius', 'pisces'].includes(s)) return 'Own Sign (Swakshetra)';
      if (s === 'capricorn') return 'Debilitated (Neecha)';
      if (['aries', 'leo', 'scorpio'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'venus':
      if (s === 'pisces') return 'Exalted (Uchcha)';
      if (['taurus', 'libra'].includes(s)) return 'Own Sign (Swakshetra)';
      if (s === 'virgo') return 'Debilitated (Neecha)';
      if (['gemini', 'aquarius', 'capricorn'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'saturn':
      if (s === 'libra') return 'Exalted (Uchcha)';
      if (['capricorn', 'aquarius'].includes(s)) return 'Own Sign (Swakshetra)';
      if (s === 'aries') return 'Debilitated (Neecha)';
      if (['taurus', 'gemini', 'virgo'].includes(s)) return 'Friendly (Mitra)';
      return 'Neutral';

    case 'rahu':
      if (['taurus', 'gemini'].includes(s)) return 'Exalted / Strong';
      if (['scorpio', 'sagittarius'].includes(s)) return 'Debilitated';
      if (s === 'aquarius') return 'Co-Lord';
      return 'Neutral';

    case 'ketu':
      if (['scorpio', 'sagittarius'].includes(s)) return 'Exalted / Strong';
      if (['taurus', 'gemini'].includes(s)) return 'Debilitated';
      if (s === 'scorpio') return 'Co-Lord';
      return 'Neutral';

    default:
      return 'Direct';
  }
}

/**
 * Classical Temple / Remedial Kshetram mapping
 */
function getClassicalRemedy(planetName: string) {
  const map: Record<string, { temple: string; district: string; mantra: string; charity: string }> = {
    Sun: {
      temple: 'Suryanar Kovil (Thanjavur) / Konark Sun Temple',
      district: 'Thanjavur, Tamil Nadu',
      mantra: 'Om Suryaya Namaha (Gayatri Mantra at dawn)',
      charity: 'Donate wheat, jaggery, or ruby red items on Sundays'
    },
    Moon: {
      temple: 'Thingalur Kailasanathar Temple (Chandra Sthalam)',
      district: 'Thiruvaiyaru, Tamil Nadu',
      mantra: 'Om Somaya Namaha (Chandra Gayatri)',
      charity: 'Donate rice, milk, white clothing, or water on Mondays'
    },
    Mars: {
      temple: 'Vaitheeswaran Kovil (Sevvai / Angaraka Sthalam)',
      district: 'Mayiladuthurai, Tamil Nadu',
      mantra: 'Om Angarakaya Namaha / Subramanya Bhujangam',
      charity: 'Donate red lentils (toor dal) or red flowers on Tuesdays'
    },
    Mercury: {
      temple: 'Thiruvenkadu Swetharanyeswarar (Budha Sthalam)',
      district: 'Sirkazhi, Tamil Nadu',
      mantra: 'Om Budhaya Namaha / Vishnu Sahasranama',
      charity: 'Donate green moong dal, green clothes, or study books on Wednesdays'
    },
    Jupiter: {
      temple: 'Alangudi Abathsahayeswarar Temple (Guru Sthalam)',
      district: 'Kumbakonam, Tamil Nadu',
      mantra: 'Om Gram Greem Graum Sah Gurave Namaha',
      charity: 'Donate chana dal, yellow sweets, turmeric, or gold on Thursdays'
    },
    Venus: {
      temple: 'Kanjanur Agneeswarar Temple (Sukra Sthalam)',
      district: 'Kumbakonam, Tamil Nadu',
      mantra: 'Om Shukraya Namaha / Sri Suktam',
      charity: 'Donate white rajma, ghee, silver, or curd on Fridays'
    },
    Saturn: {
      temple: 'Thirunallar Darbaranyeswarar Temple (Saneeswara Sthalam)',
      district: 'Karaikal, Puducherry / Shani Shingnapur',
      mantra: 'Om Sham Shanaishcharaya Namaha / Hanuman Chalisa',
      charity: 'Donate black sesame, mustard oil, or iron utensils on Saturdays'
    },
    Rahu: {
      temple: 'Thirunageswaram Naganathaswamy Temple (Rahu Sthalam) / Sri Kalahasti',
      district: 'Kumbakonam, Tamil Nadu',
      mantra: 'Om Ram Rahave Namaha / Durga Suktam',
      charity: 'Donate urad dal, coconut, or dark blankets on Saturdays'
    },
    Ketu: {
      temple: 'Keezhperumpallam Naganatha Swamy (Ketu Sthalam)',
      district: 'Nagapattinam, Tamil Nadu',
      mantra: 'Om Kem Ketave Namaha / Ganesha Atharvashirsha',
      charity: 'Donate horse gram (kollu) or multi-color blankets on Tuesdays'
    }
  };

  return map[planetName] || {
    temple: 'Sri Ranganathaswamy Temple (Srirangam)',
    district: 'Tiruchirappalli, Tamil Nadu',
    mantra: 'Maha Mrityunjaya Mantra & Gayatri Mantra',
    charity: 'Annadanam (Food offering to the needy)'
  };
}

/**
 * Render a high-resolution Light-Themed South Indian D1 Chart onto a Canvas
 */
export function renderLightKundaliPng(
  planets: PlanetPosition[],
  lagna: { sign: string; degree: number; formattedDegree: string },
  nativeName: string,
  language: 'en' | 'ta' = 'en'
): string {
  const canvas = document.createElement('canvas');
  // High-DPI Canvas Scaling (2400x2400 px, 300 DPI target density)
  canvas.width = 2400;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2.4, 2.4); // 2.4x multiplier over 1000px coordinate system
  const size = 1000;
  const cellSize = size / 4;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  const centerFill = ctx.createLinearGradient(cellSize, cellSize, cellSize * 3, cellSize * 3);
  centerFill.addColorStop(0, '#fefce8');
  centerFill.addColorStop(1, '#fef3c7');
  ctx.fillStyle = centerFill;
  ctx.fillRect(cellSize, cellSize, cellSize * 2, cellSize * 2);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.strokeRect(cellSize, cellSize, cellSize * 2, cellSize * 2);

  const centerX = size / 2;
  const centerY = size / 2;

  ctx.save();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('ASTRO ORACLE', centerX, centerY - 65);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('RASI CHAKRA (D1)', centerX, centerY - 38);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SIDEREAL LAHIRI • EQUAL BHAVA', centerX, centerY - 18);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY - 5);
  ctx.lineTo(centerX + 100, centerY - 5);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  const displayName = nativeName.length > 20 ? nativeName.substring(0, 18) + '..' : nativeName;
  ctx.fillText(displayName, centerX, centerY + 24);

  ctx.fillStyle = '#6d28d9';
  ctx.font = '600 16px sans-serif';
  ctx.fillText(`Lagna: ${lagna.sign} (${lagna.formattedDegree})`, centerX, centerY + 52);

  const moon = planets.find(p => p.name.toLowerCase() === 'moon');
  if (moon) {
    ctx.fillStyle = '#0284c7';
    ctx.fillText(`Chandra: ${moon.sign} (${moon.formattedDegree})`, centerX, centerY + 76);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 13px sans-serif';
  ctx.fillText('Traditional South Indian Vedic Diagram', centerX, centerY + 102);
  ctx.restore();

  const lagnaBox = SOUTH_INDIAN_BOXES.find(b => b.sign.toLowerCase() === lagna.sign.toLowerCase());
  const lagnaSignIndex = lagnaBox ? lagnaBox.signIndex : 0;

  SOUTH_INDIAN_BOXES.forEach(box => {
    const x = box.col * cellSize;
    const y = box.row * cellSize;
    const isLagna = box.sign.toLowerCase() === lagna.sign.toLowerCase();
    const houseNum = ((box.signIndex - lagnaSignIndex + 12) % 12) + 1;

    ctx.fillStyle = isLagna ? '#fef3c7' : '#ffffff';
    ctx.fillRect(x, y, cellSize, cellSize);

    ctx.strokeStyle = isLagna ? '#b45309' : '#cbd5e1';
    ctx.lineWidth = isLagna ? 3 : 1.5;
    ctx.strokeRect(x, y, cellSize, cellSize);

    if (isLagna) {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40, y);
      ctx.lineTo(x, y + 40);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.fillStyle = isLagna ? '#92400e' : '#334155';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    const signLabel = language === 'ta' ? `${box.tamil} (${box.sign})` : box.sign;
    ctx.fillText(signLabel, x + (isLagna ? 48 : 14), y + 26);

    ctx.textAlign = 'right';
    if (isLagna) {
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('ASC • H1', x + cellSize - 14, y + 26);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(`H${houseNum}`, x + cellSize - 14, y + 26);
    }

    ctx.strokeStyle = isLagna ? '#fcd34d' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 36);
    ctx.lineTo(x + cellSize - 10, y + 36);
    ctx.stroke();

    const inBox = planets.filter(p => p.sign.toLowerCase() === box.sign.toLowerCase());

    if (inBox.length === 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('—', x + cellSize / 2, y + cellSize / 2 + 10);
    } else {
      const startPy = y + 64;
      const rowGap = inBox.length > 5 ? 36 : 42;

      inBox.forEach((p, pIdx) => {
        const py = startPy + pIdx * rowGap;
        const color = PLANET_COLORS_HEX[p.name] || '#1e293b';

        ctx.fillStyle = color;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(p.name, x + 14, py);

        ctx.fillStyle = '#1e293b';
        ctx.font = '16px monospace';
        ctx.textAlign = 'right';
        const rightOffset = p.isRetrograde ? 48 : 14;
        ctx.fillText(p.formattedDegree, x + cellSize - rightOffset, py);

        if (p.isRetrograde) {
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('[R]', x + cellSize - 14, py);
        }
      });
    }
    ctx.restore();
  });

  return canvas.toDataURL('image/png');
}

/**
 * Render a high-resolution Light-Themed South Indian D9 Navamsha Chart PNG
 */
export function renderLightNavamshaPng(
  navamshaPlanets: PlanetPosition[],
  navamshaLagna: { sign: string; signIndex: number; formattedDegree: string },
  nativeName: string,
  _language: 'en' | 'ta' = 'en'
): string {
  const canvas = document.createElement('canvas');
  // High-DPI Canvas Scaling (2400x2400 px density)
  canvas.width = 2400;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2.4, 2.4); // 2.4x scale over 1000px logical canvas
  const size = 1000;
  const cellSize = size / 4; // 250px per cell

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#6d28d9';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // REDUCE CENTRAL TITLE BOX AREA BY 20%
  // Original center box: x=250..750, y=250..750 (500x500 = 250,000 px^2)
  // 20% reduction: target area = 200,000 px^2 -> width=447, height=447 (inset by 26.5px)
  const centerInset = 26.5;
  const centerBoxX = cellSize + centerInset; // 276.5
  const centerBoxY = cellSize + centerInset; // 276.5
  const centerBoxWidth = cellSize * 2 - centerInset * 2; // 447
  const centerBoxHeight = cellSize * 2 - centerInset * 2; // 447

  const centerFill = ctx.createLinearGradient(centerBoxX, centerBoxY, centerBoxX + centerBoxWidth, centerBoxY + centerBoxHeight);
  centerFill.addColorStop(0, '#f5f3ff');
  centerFill.addColorStop(1, '#ede9fe');
  ctx.fillStyle = centerFill;
  ctx.fillRect(centerBoxX, centerBoxY, centerBoxWidth, centerBoxHeight);

  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.strokeRect(centerBoxX, centerBoxY, centerBoxWidth, centerBoxHeight);

  const centerX = size / 2;
  const centerY = size / 2;

  ctx.fillStyle = '#5b21b6';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('NAVAMSHA (D9)', centerX, centerY - 45);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#6d28d9';
  ctx.fillText('HARMONIC NINE-FOLD CHART', centerX, centerY - 20);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SPOUSAL DHARMA & SOUL MATURATION', centerX, centerY);

  ctx.strokeStyle = '#ddd6fe';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 90, centerY + 12);
  ctx.lineTo(centerX + 90, centerY + 12);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  const displayName = nativeName.length > 20 ? nativeName.substring(0, 18) + '..' : nativeName;
  ctx.fillText(displayName, centerX, centerY + 38);

  ctx.fillStyle = '#6d28d9';
  ctx.font = '600 15px sans-serif';
  ctx.fillText(`D9 Lagna: ${navamshaLagna.sign}`, centerX, centerY + 65);

  const lagnaBox = SOUTH_INDIAN_BOXES.find(b => b.sign.toLowerCase() === navamshaLagna.sign.toLowerCase());
  const lagnaSignIndex = lagnaBox ? lagnaBox.signIndex : 0;

  SOUTH_INDIAN_BOXES.forEach(box => {
    const x = box.col * cellSize;
    const y = box.row * cellSize;
    const isLagna = box.sign.toLowerCase() === navamshaLagna.sign.toLowerCase();
    const houseNum = ((box.signIndex - lagnaSignIndex + 12) % 12) + 1;

    ctx.fillStyle = isLagna ? '#f3e8ff' : '#ffffff';
    ctx.fillRect(x, y, cellSize, cellSize);

    ctx.strokeStyle = isLagna ? '#7c3aed' : '#e2e8f0';
    ctx.lineWidth = isLagna ? 2.5 : 1.5;
    ctx.strokeRect(x, y, cellSize, cellSize);

    // INCREASE FONT SIZE & WEIGHT FOR PERIMETER SIGN & PLANET LABELS
    ctx.fillStyle = isLagna ? '#6d28d9' : '#1e293b';
    ctx.font = 'bold 18px sans-serif'; // Enlarged from 15px
    ctx.textAlign = 'left';
    ctx.fillText(box.sign, x + 12, y + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = isLagna ? '#7c3aed' : '#64748b';
    ctx.font = 'bold 16px sans-serif'; // Enlarged & bold from 14px 600
    ctx.fillText(isLagna ? 'D9 ASC' : `H${houseNum}`, x + cellSize - 12, y + 24);

    ctx.strokeStyle = isLagna ? '#c4b5fd' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 32);
    ctx.lineTo(x + cellSize - 8, y + 32);
    ctx.stroke();

    const inBox = navamshaPlanets.filter(p => p.sign.toLowerCase() === box.sign.toLowerCase());
    if (inBox.length === 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('—', x + cellSize / 2, y + cellSize / 2 + 10);
    } else {
      const startPy = y + 56;
      const rowGap = 32;
      inBox.forEach((p, pIdx) => {
        const py = startPy + pIdx * rowGap;
        ctx.fillStyle = PLANET_COLORS_HEX[p.name] || '#0f172a';
        ctx.font = 'bold 18px sans-serif'; // Enlarged & bold from 15px
        ctx.textAlign = 'left';
        ctx.fillText(p.name, x + 12, py);
      });
    }
  });

  return canvas.toDataURL('image/png');
}

/**
 * Render a high-resolution 360° Western Tropical Wheel PNG
 */
export function renderWesternWheelPng(
  tropicalPlanets: PlanetPosition[],
  ascendant: { sign: string; degree: number; formattedDegree: string },
  midheaven: { sign: string; degree: number; formattedDegree: string },
  aspects: { planet1: string; planet2: string; aspectType: string; angle: number; orb: number }[],
  nativeName: string
): string {
  const canvas = document.createElement('canvas');
  // High-DPI Canvas Scaling (2400x2400 px density)
  canvas.width = 2400;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2.4, 2.4); // 2.4x scale over 1000px logical canvas
  const size = 1000;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 450;
  const innerR = 340;
  const centerR = 180;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#f0f9ff';
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ZODIAC_SIGNS.forEach((sign, idx) => {
    const startAngle = (idx * 30 - 90) * (Math.PI / 180);
    const endAngle = ((idx + 1) * 30 - 90) * (Math.PI / 180);
    const midAngle = (startAngle + endAngle) / 2;

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(startAngle) * innerR, cy + Math.sin(startAngle) * innerR);
    ctx.lineTo(cx + Math.cos(startAngle) * outerR, cy + Math.sin(startAngle) * outerR);
    ctx.stroke();

    const labelR = (outerR + innerR) / 2;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign.substring(0, 3).toUpperCase(), lx, ly);
  });

  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    ctx.strokeStyle = i % 3 === 0 ? '#0284c7' : '#e2e8f0';
    ctx.lineWidth = i % 3 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * centerR, cy + Math.sin(angle) * centerR);
    ctx.lineTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.stroke();
  }

  const planetPositionsMap: Record<string, { x: number; y: number; angle: number }> = {};

  tropicalPlanets.forEach(p => {
    const totalDeg = p.longitude || (p.signIndex * 30 + p.signDegree);
    const rad = (totalDeg - 90) * (Math.PI / 180);

    const px = cx + Math.cos(rad) * (innerR - 25);
    const py = cy + Math.sin(rad) * (innerR - 25);

    planetPositionsMap[p.name] = { x: px, y: py, angle: rad };

    const color = PLANET_COLORS_HEX[p.name] || '#1e293b';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tx = cx + Math.cos(rad) * (innerR - 45);
    const ty = cy + Math.sin(rad) * (innerR - 45);
    ctx.fillText(p.name, tx, ty);
  });

  aspects.slice(0, 10).forEach(asp => {
    const pos1 = planetPositionsMap[asp.planet1];
    const pos2 = planetPositionsMap[asp.planet2];
    if (pos1 && pos2) {
      let lineColor = '#94a3b8';
      if (['Trine'].includes(asp.aspectType)) lineColor = '#059669';
      else if (['Sextile'].includes(asp.aspectType)) lineColor = '#0284c7';
      else if (['Square', 'Opposition'].includes(asp.aspectType)) lineColor = '#dc2626';
      else if (['Conjunction'].includes(asp.aspectType)) lineColor = '#d97706';

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const p1x = cx + Math.cos(pos1.angle) * centerR;
      const p1y = cy + Math.sin(pos1.angle) * centerR;
      const p2x = cx + Math.cos(pos2.angle) * centerR;
      const p2y = cy + Math.sin(pos2.angle) * centerR;
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();
    }
  });

  // SOLID BACKGROUND FILL TO CENTRAL HUB CIRCLE SO ASPECT LINES DO NOT COLLIDE WITH CENTER TEXT
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 135, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WESTERN TROPICAL', cx, cy - 25);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#0284c7';
  ctx.fillText('360° PLACIDUS WHEEL', cx, cy);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Asc: ${ascendant.sign} • MC: ${midheaven.sign}`, cx, cy + 22);

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#0f172a';
  const nameDisplay = nativeName.length > 20 ? nativeName.substring(0, 18) + '..' : nativeName;
  ctx.fillText(nameDisplay, cx, cy + 45);

  return canvas.toDataURL('image/png');
}

/**
 * Main PDF Generation Engine: Generates an Executive Multi-Page
 * Astrology Report with light theme, high-res Kundali diagram,
 * rich technical data, and remedial wisdom.
 */
export async function generateAstrologyReportPdf(
  profile: UserProfile,
  data: CalculatedAstrologyData,
  chatHistory: ChatMessage[],
  language: 'en' | 'ta' = 'en'
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const sc = data.siderealChart;
  const tc = data.tropicalChart;
  const pc = data.panchangam;

  // Running Header Helper
  const drawRunningHeader = (_pageNum: number, title: string) => {
    doc.setFillColor(254, 243, 199); // Soft Gold tint
    doc.rect(margin, 8, contentWidth, 8, 'F');
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.3);
    doc.rect(margin, 8, contentWidth, 8, 'S');

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14); // Royal Gold/Amber
    doc.text('ASTRO ORACLE WORKSTATION • EXECUTIVE NATAL DOSSIER', margin + 4, 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(title, pageWidth - margin - 4, 13.5, { align: 'right' });
  };

  // Running Footer Helper
  const drawRunningFooter = (pageNum: number, totalPagesCount: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Swiss Ephemeris WASM Precision • Dual Lahiri & Placidus Engine • Confidential Astrological Record',
      margin,
      pageHeight - 7
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPagesCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Extract Moon Planet for Janma Nakshatra binding
  const moonPlanet = sc.planets.find(p => p.name.toLowerCase() === 'moon');

  // =========================================================================
  // PAGE 1: EXECUTIVE DOSSIER, NATAL PANCHANGAM & D1 KUNDALI DIAGRAM
  // =========================================================================
  drawRunningHeader(1, 'SECTION I: NATAL CHART & PANCHANGAM');

  // Title Banner
  let y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Deep Obsidian
  doc.text('ASTRO ORACLE NATAL DOSSIER', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Gold
  doc.text('A Comprehensive Vedic Sidereal & Western Celestial Blueprint', margin, y + 5);

  // Native Credentials Card
  y = 31;
  const cardHeight = 27;
  doc.setFillColor(248, 250, 252); // Soft light slate
  doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'S');

  // Row 1: Name & Relationship
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Native: ${profile.name}`, margin + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Relationship: ${profile.relationship || 'Self'}   |   Gender: ${profile.gender || 'Not specified'}`, pageWidth - margin - 5, y + 6.5, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 4, y + 9.5, pageWidth - margin - 4, y + 9.5);

  // Row 2: Birth Details
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Date of Birth: ${profile.birthDate}`, margin + 5, y + 15);
  doc.text(`Time of Birth: ${profile.birthTime} (Local Standard Time)`, margin + 60, y + 15);
  const ayanamsaStr = sc.ayanamsaValue ? `${sc.ayanamsaValue.toFixed(4)}${String.fromCharCode(176)} (Lahiri)` : `24.12${String.fromCharCode(176)} (Lahiri)`;
  doc.text(`Ayanamsha: ${ayanamsaStr}`, margin + 125, y + 15);

  // Row 3: Place & Coordinates
  const latStr = `${Math.abs(profile.birthCoordinates.latitude).toFixed(2)}${String.fromCharCode(176)}${profile.birthCoordinates.latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(profile.birthCoordinates.longitude).toFixed(2)}${String.fromCharCode(176)}${profile.birthCoordinates.longitude >= 0 ? 'E' : 'W'}`;
  doc.text(`Birth Place: ${profile.currentCity || profile.currentState || 'Birth City'}`, margin + 5, y + 21);
  doc.text(`Coordinates: ${latStr}, ${lonStr}`, margin + 60, y + 21);
  doc.text(`House System: Whole Sign (Vedic) / Placidus (Western)`, margin + 105, y + 21);

  // Natal Panchangam (5 Cosmic Limbs) Box
  y = 62;
  doc.setFillColor(254, 252, 232); // Ivory warm fill
  doc.roundedRect(margin, y, contentWidth, 19, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 19, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('NATAL PANCHANGAM (THE FIVE SACRED COSMIC PILLARS OF BIRTH)', margin + 5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const tithiName = pc?.tithi ? `${pc.tithi.name} (${pc.tithi.paksha} Paksha)` : 'Shukla Navami';
  
  // FIX REQUIREMENT 1: Bind Natal Panchangam Nakshatra & Star Lord strictly to calculated Moon longitude
  const moonLong = moonPlanet
    ? (moonPlanet.longitude ?? (moonPlanet.signIndex * 30 + moonPlanet.signDegree))
    : 0;
  const janmaNakObj = getNakshatraFromLongitude(moonLong);
  const janmaNakshatraFormatted = `${janmaNakObj.name} (Pada ${janmaNakObj.pada})`;
  const starLordName = janmaNakObj.lord;

  const yogaName = pc?.yoga?.name || 'Siddha';
  const karanaName = pc?.karana?.name || 'Bava';
  
  // Calculate true Vedic Day Lord (Vara) with sunrise rule
  const varaName = calculateVedicVara(profile.birthDate, profile.birthTime);

  doc.text(`• Tithi (Phase): ${tithiName}`, margin + 5, y + 11);
  doc.text(`• Janma Nakshatra: ${janmaNakshatraFormatted}`, margin + 68, y + 11);
  doc.text(`• Star Lord: ${starLordName}`, margin + 140, y + 11);

  doc.text(`• Yoga (Harmony): ${yogaName}`, margin + 5, y + 16);
  doc.text(`• Karana (Action): ${karanaName}`, margin + 68, y + 16);
  doc.text(`• Day Lord (Vara): ${varaName}`, margin + 130, y + 16);

  // Visual Light-Theme South Indian D1 Chart Diagram
  y = 85;
  try {
    const chartPng = renderLightKundaliPng(sc.planets, sc.lagna, profile.name, language);
    if (chartPng) {
      const chartSizeMm = 120;
      const chartX = (pageWidth - chartSizeMm) / 2;
      doc.addImage(chartPng, 'PNG', chartX, y, chartSizeMm, chartSizeMm);
    }
  } catch (chartErr) {
    console.error('Failed to embed D1 chart PNG in PDF:', chartErr);
  }

  // The Core Triad (The Big Three) Bottom Section
  y = 210;
  const triadCardWidth = (contentWidth - 6) / 3;
  const triadCardHeight = 36;

  // Triad 1: Lagna (Ascendant)
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(margin, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(192, 132, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217);
  doc.text('LAGNA (ASCENDANT)', margin + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sc.lagna.sign, margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${formatDegPdf(sc.lagna.formattedDegree)}`, margin + 4, y + 18);
  doc.text(`Nakshatra: ${sc.lagna.nakshatra} (P${sc.lagna.pada})`, margin + 4, y + 23);
  doc.text('Keynote: Tanu Bhava • Physical vitality, constitution & self-expression.', margin + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Triad 2: Moon Sign (Chandra)
  const moonX = margin + triadCardWidth + 3;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(moonX, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(125, 211, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(moonX, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 105, 161);
  doc.text('CHANDRA RASI (MOON)', moonX + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(moonPlanet ? moonPlanet.sign : 'Taurus', moonX + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${formatDegPdf(moonPlanet ? moonPlanet.formattedDegree : "15" + String.fromCharCode(176) + "20'")}`, moonX + 4, y + 18);
  doc.text(`Nakshatra: ${moonPlanet?.nakshatra || sc.lagna.nakshatra} (P${moonPlanet?.nakshatraPada || 1})`, moonX + 4, y + 23);
  doc.text('Keynote: Manas • Emotional subconscious, intuition & psychological balance.', moonX + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Triad 3: Sun Sign (Surya)
  const sunPlanet = sc.planets.find(p => p.name.toLowerCase() === 'sun');
  const sunX = moonX + triadCardWidth + 3;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(sunX, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.4);
  doc.roundedRect(sunX, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SURYA RASI (SUN)', sunX + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sunPlanet ? sunPlanet.sign : 'Leo', sunX + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${formatDegPdf(sunPlanet ? sunPlanet.formattedDegree : "02" + String.fromCharCode(176) + "15'")}`, sunX + 4, y + 18);
  doc.text(`Nakshatra: ${sunPlanet?.nakshatra || 'Magha'} (P${sunPlanet?.nakshatraPada || 1})`, sunX + 4, y + 23);
  doc.text('Keynote: Atma Karaka • Core soul purpose, career authority & vitality.', sunX + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Astrological note under triad
  y = 252;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Note: In Vedic Sidereal calculations, planetary placements are aligned with the observable fixed constellations (Nirayana).', margin, y);

  // =========================================================================
  // PAGE 2: COMPREHENSIVE NAVAGRAHA POSITIONS, OUTER PLANETS & D9 NAVAMSHA
  // =========================================================================
  doc.addPage();
  drawRunningHeader(2, 'SECTION II: VEDIC PLANETARY POSITIONS & D9 NAVAMSHA');

  y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. CLASSICAL LAHIRI SIDEREAL NAVAGRAHA POSITIONS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Exact planetary longitudes, house occupancy, nakshatras, star lords, and classical Vedic dignities.', margin, y + 4.5);

  // FIX REQUIREMENT 3: Separate Navagraha (9 Classical Planets) from Outer Planets
  const classicalNavagrahaNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const navagrahaPlanets = sc.planets.filter(p => classicalNavagrahaNames.includes(p.name));
  const outerPlanets = sc.planets.filter(p => ['Uranus', 'Neptune', 'Pluto'].includes(p.name));

  // Planetary Coordinates Table
  y = 31;
  const colWidths = [24, 24, 22, 14, 28, 22, 18, 30]; // total = 182
  const headers = ['Planet', 'Rasi (Sign)', 'Degree', 'House', 'Nakshatra & Pada', 'Star Lord', 'Motion', 'Vedic Dignity'];

  // Table Header Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 6.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  let curX = margin;
  headers.forEach((h, idx) => {
    doc.text(h, curX + 2, y + 4.5);
    curX += colWidths[idx];
  });

  // Render Classical 9 Navagraha Rows
  y += 6.5;
  navagrahaPlanets.forEach((planet, rIdx) => {
    const isEven = rIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let cellX = margin;

    // Col 1: Planet
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PLANET_COLORS_HEX[planet.name] || '#0f172a');
    doc.text(planet.name, cellX + 2, y + 4);
    cellX += colWidths[0];

    // Col 2: Sign
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(planet.sign, cellX + 2, y + 4);
    cellX += colWidths[1];

    // Col 3: Degree
    doc.setFont('courier', 'normal');
    doc.text(formatDegPdf(planet.formattedDegree), cellX + 2, y + 4);
    cellX += colWidths[2];

    // Col 4: House
    doc.setFont('helvetica', 'normal');
    doc.text(`H${planet.house || 1}`, cellX + 2, y + 4);
    cellX += colWidths[3];

    // Col 5: Nakshatra & Pada
    const nakPadaStr = planet.nakshatra ? `${planet.nakshatra} (P${planet.nakshatraPada || 1})` : '—';
    doc.text(nakPadaStr, cellX + 2, y + 4);
    cellX += colWidths[4];

    // Col 6: Star Lord
    doc.text(planet.nakshatraLord || '—', cellX + 2, y + 4);
    cellX += colWidths[5];

    // Col 7: Motion
    if (planet.isRetrograde) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('Retro [R]', cellX + 2, y + 4);
    } else {
      doc.setTextColor(16, 185, 129);
      doc.text('Direct', cellX + 2, y + 4);
    }
    cellX += colWidths[6];

    // Col 8: Dignity
    const dignity = getPlanetDignity(planet.name, planet.sign);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dignity.includes('Exalted') ? '#b45309' : dignity.includes('Debilitated') ? '#dc2626' : '#334155');
    doc.text(dignity, cellX + 2, y + 4);

    y += 5.5;
  });

  // Secondary Sub-Table: Outer Planets (Western)
  if (outerPlanets.length > 0) {
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('OUTER PLANETS (WESTERN PSYCHOLOGICAL TRANS-SATURNIAN BODIES)', margin, y);

    y += 3.5;
    outerPlanets.forEach((planet, oIdx) => {
      doc.setFillColor(oIdx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);

      let cellX = margin;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PLANET_COLORS_HEX[planet.name] || '#0f172a');
      doc.text(planet.name, cellX + 2, y + 3.5);
      cellX += colWidths[0];

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(planet.sign, cellX + 2, y + 3.5);
      cellX += colWidths[1];

      doc.setFont('courier', 'normal');
      doc.text(formatDegPdf(planet.formattedDegree), cellX + 2, y + 3.5);
      cellX += colWidths[2];

      doc.setFont('helvetica', 'normal');
      doc.text(`H${planet.house || 1}`, cellX + 2, y + 3.5);
      cellX += colWidths[3];

      doc.text('Outer Trans-Saturnian', cellX + 2, y + 3.5);
      cellX += colWidths[4];

      doc.text('Generational', cellX + 2, y + 3.5);
      cellX += colWidths[5];

      doc.text(planet.isRetrograde ? 'Retro [R]' : 'Direct', cellX + 2, y + 3.5);
      cellX += colWidths[6];

      doc.text('Western Archetype', cellX + 2, y + 3.5);

      y += 5;
    });
  }

  // Section 2: Navamsha (D9) Chart & Vargottama Analysis (With Embedded D9 SVG Diagram)
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. NAVAMSHA (D9) HARMONIC NINE-FOLD CHART & VARGOTTAMA ANALYSIS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('The Navamsha (D9) chart reveals spiritual fruition, inner soul maturation, and spousal dharma.', margin, y + 4.5);

  y += 8;

  // FIX REQUIREMENT 4: Embed D9 Navamsha Chart PNG next to Analysis Box
  const navamshaPlanets = sc.navamshaChart?.planets || [];
  const d9LagnaObj = sc.navamshaChart?.lagna || { sign: 'Aries', signIndex: 0, formattedDegree: "00" + String.fromCharCode(176) + "00'" };
  
  const d9ChartSize = 72; // 72mm x 72mm
  try {
    const d9Png = renderLightNavamshaPng(navamshaPlanets, d9LagnaObj, profile.name, language);
    if (d9Png) {
      doc.addImage(d9Png, 'PNG', margin, y, d9ChartSize, d9ChartSize);
    }
  } catch (d9Err) {
    console.error('Failed to embed D9 chart PNG:', d9Err);
  }

  // Side-by-Side D9 Analysis Box (Right side of D9 Chart)
  const d9AnalysisX = margin + d9ChartSize + 4; // 14 + 72 + 4 = 90mm
  const d9AnalysisWidth = contentWidth - d9ChartSize - 4; // 182 - 76 = 106mm
  const d9CardHeight = d9ChartSize;

  doc.setFillColor(250, 245, 255);
  doc.roundedRect(d9AnalysisX, y, d9AnalysisWidth, d9CardHeight, 2, 2, 'F');
  doc.setDrawColor(216, 180, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(d9AnalysisX, y, d9AnalysisWidth, d9CardHeight, 2, 2, 'S');

  // FIX REQUIREMENT 3: Detect true Vargottama planets strictly among classical 9 planets
  const vargottamaPlanets: string[] = [];
  const classicalD1Planets = sc.planets.filter(p => classicalNavagrahaNames.includes(p.name));

  classicalD1Planets.forEach(dp => {
    const d9p = navamshaPlanets.find(np => np.name.toLowerCase() === dp.name.toLowerCase());
    if (d9p && d9p.sign.toLowerCase() === dp.sign.toLowerCase()) {
      vargottamaPlanets.push(`${dp.name} (${dp.sign})`);
    }
  });

  // Check Exalted & Own Sign D9 Planets
  const exaltedD9: string[] = [];
  const ownD9: string[] = [];

  navamshaPlanets.forEach(np => {
    if (classicalNavagrahaNames.includes(np.name)) {
      const dig = getPlanetDignity(np.name, np.sign);
      if (dig.includes('Exalted')) exaltedD9.push(`${np.name} in ${np.sign}`);
      else if (dig.includes('Own')) ownD9.push(`${np.name} in ${np.sign}`);
    }
  });

  let d9TextY = y + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217);
  doc.text(`D9 Lagna: ${d9LagnaObj.sign}`, d9AnalysisX + 4, d9TextY);

  d9TextY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`• D9 Lagna Lord: Anchors internal soul strength & spousal harmony.`, d9AnalysisX + 4, d9TextY, { maxWidth: d9AnalysisWidth - 8 });

  // Vargottama summary
  d9TextY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('• Vargottama Grahas (Classical 9):', d9AnalysisX + 4, d9TextY);

  d9TextY += 4.5;
  doc.setFont('helvetica', 'normal');
  if (vargottamaPlanets.length > 0) {
    doc.setTextColor(180, 83, 9);
    doc.text(`${vargottamaPlanets.join(', ')} — Identical sign in D1 & D9 yields intense stability & karmic resilience.`, d9AnalysisX + 4, d9TextY, { maxWidth: d9AnalysisWidth - 8 });
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('No classical planets occupy identical signs in D1 & D9.', d9AnalysisX + 4, d9TextY, { maxWidth: d9AnalysisWidth - 8 });
  }

  // D9 Exalted & Own Sign Dignities
  d9TextY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('• D9 Classical Dignities:', d9AnalysisX + 4, d9TextY);

  d9TextY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const dignitiesD9Str = [
    exaltedD9.length > 0 ? `Exalted: ${exaltedD9.join(', ')}` : null,
    ownD9.length > 0 ? `Own Sign: ${ownD9.join(', ')}` : null
  ].filter(Boolean).join(' | ') || 'Harmonic distribution across house cusps.';
  doc.text(dignitiesD9Str, d9AnalysisX + 4, d9TextY, { maxWidth: d9AnalysisWidth - 8 });

  // D9 Graha Signs list
  d9TextY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('• D9 Placement Summary:', d9AnalysisX + 4, d9TextY);

  d9TextY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const d9SummaryText = navamshaPlanets.length > 0
    ? navamshaPlanets.filter(p => classicalNavagrahaNames.includes(p.name)).map(p => `${p.name}:${p.sign.substring(0,3)}`).join(' ')
    : 'Swiss Ephemeris 3°20\' Pada precision.';
  doc.text(d9SummaryText, d9AnalysisX + 4, d9TextY, { maxWidth: d9AnalysisWidth - 8 });

  // =========================================================================
  // PAGE 3: WESTERN PLACIDUS WHEEL, HARMONIC ASPECTS & VIMSHOTTARI DASHA
  // =========================================================================
  doc.addPage();
  drawRunningHeader(3, 'SECTION III: WESTERN WHEEL & VIMSHOTTARI DASHA');

  y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. WESTERN PLACIDUS SYSTEM & 360° ASPECT WHEEL', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Tropical zodiac angles, Placidus Ascendant, Midheaven (MC), and major psychological geometric aspects.', margin, y + 4.5);

  y += 8;
  // FIX REQUIREMENT 4: Render 360° Western Aspect Wheel PNG next to Aspect Table
  const wheelSize = 72; // 72mm x 72mm
  try {
    const wheelPng = renderWesternWheelPng(
      tc?.planets || [],
      tc?.ascendant || { sign: sc.lagna.sign, degree: 0, formattedDegree: sc.lagna.formattedDegree },
      tc?.midheaven || { sign: 'Leo', degree: 0, formattedDegree: "28" + String.fromCharCode(176) + "10'" },
      tc?.aspects || [],
      profile.name
    );
    if (wheelPng) {
      doc.addImage(wheelPng, 'PNG', margin, y, wheelSize, wheelSize);
    }
  } catch (wheelErr) {
    console.error('Failed to embed Western wheel PNG:', wheelErr);
  }

  // Side-by-Side Aspect Table (Right side of Western Wheel)
  const aspectTableX = margin + wheelSize + 4; // 14 + 72 + 4 = 90mm
  const aspectTableWidth = contentWidth - wheelSize - 4; // 106mm
  const aspectHeaders = ['Planet 1', 'Aspect', 'Planet 2', 'Orb', 'Quality'];
  const aspectColWidths = [22, 22, 22, 14, 26];

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(aspectTableX, y, aspectTableWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(aspectTableX, y, aspectTableWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  let ax = aspectTableX;
  aspectHeaders.forEach((h, idx) => {
    doc.text(h, ax + 2, y + 4.2);
    ax += aspectColWidths[idx];
  });

  let aspectY = y + 6;
  const topAspects = (tc?.aspects || []).slice(0, 11);

  if (topAspects.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Geometric harmonic aspects under 6° orb.', aspectTableX + 2, aspectY + 5);
  } else {
    topAspects.forEach((asp, aIdx) => {
      doc.setFillColor(aIdx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(aspectTableX, aspectY, aspectTableWidth, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(aspectTableX, aspectY, aspectTableWidth, 5.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);

      let cellX = aspectTableX;
      doc.text(asp.planet1, cellX + 2, aspectY + 4);
      cellX += aspectColWidths[0];

      if (['Trine', 'Sextile'].includes(asp.aspectType)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
      } else if (['Square', 'Opposition'].includes(asp.aspectType)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
      }
      doc.text(asp.aspectType, cellX + 2, aspectY + 4);
      cellX += aspectColWidths[1];

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(asp.planet2, cellX + 2, aspectY + 4);
      cellX += aspectColWidths[2];

      doc.setFont('courier', 'normal');
      doc.text(`${asp.orb.toFixed(1)}${String.fromCharCode(176)}`, cellX + 2, aspectY + 4);
      cellX += aspectColWidths[3];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      let quality = 'Dynamic';
      if (asp.aspectType === 'Trine') quality = 'Natural Talent';
      else if (asp.aspectType === 'Sextile') quality = 'Opportunity';
      else if (asp.aspectType === 'Square') quality = 'Friction';
      else if (asp.aspectType === 'Opposition') quality = 'Balance';
      else if (asp.aspectType === 'Conjunction') quality = 'Synthesis';
      doc.setTextColor(71, 85, 105);
      doc.text(quality, cellX + 2, aspectY + 4);

      aspectY += 5.5;
    });
  }

  // Section 2: Vimshottari Dasha 120-Year Lifetime Timeline
  y += wheelSize + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. VIMSHOTTARI DASHA: 120-YEAR SACRED LIFETIME TIMELINE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('The classical Vimshottari timing system reveals when karmic potentials awaken and manifest.', margin, y + 4.5);

  y += 8;
  // FIX REQUIREMENT 2: Clean Active Dasha Spotlight Box string badges
  const activeDasha = sc.dashaReport?.currentMahadasha;
  const dashaSpotlightHeight = 18;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, y, contentWidth, dashaSpotlightHeight, 2, 2, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, dashaSpotlightHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  const activeLord = activeDasha ? activeDasha.lord : 'Jupiter';
  const startD = activeDasha ? activeDasha.startDate : '2020-01-01';
  const endD = activeDasha ? activeDasha.endDate : '2036-01-01';
  const pct = activeDasha?.percentagePassed ? Math.round(activeDasha.percentagePassed) : 45;
  doc.text(`CURRENT ACTIVE TIMING: ${activeLord.toUpperCase()} MAHADASHA (${startD} to ${endD})   [ACTIVE NOW]`, margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Progress: ${pct}% Completed. Major planetary theme revolves around houses ruled by ${activeLord} in natal chart.`, margin + 5, y + 10.5);
  doc.text(`• Astrological Directive: Cultivate the virtues of ${activeLord} through ethical actions, study, and remedies.`, margin + 5, y + 15);

  // Full 120-Year Vimshottari Table
  y += dashaSpotlightHeight + 5;
  const dashaHeaders = ['Cycle', 'Mahadasha Lord', 'Duration (Years)', 'Effective Start Date', 'Effective End Date', 'Lifecycle Status'];
  const dashaColWidths = [18, 36, 30, 34, 34, 30];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let dX = margin;
  dashaHeaders.forEach((h, idx) => {
    doc.text(h, dX + 2, y + 4.2);
    dX += dashaColWidths[idx];
  });

  y += 6;
  const dashaTimeline = sc.dashaReport?.timeline || [];
  dashaTimeline.forEach((item, dIdx) => {
    const isCurrent = item.isCurrent;
    if (isCurrent) {
      doc.setFillColor(254, 243, 199);
    } else if (dIdx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5, 'S');

    doc.setFont('helvetica', isCurrent ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(isCurrent ? 180 : 51, isCurrent ? 83 : 65, isCurrent ? 9 : 85);

    let cellX = margin;
    doc.text(`${dIdx + 1}`, cellX + 2, y + 3.8);
    cellX += dashaColWidths[0];

    doc.text(item.lord, cellX + 2, y + 3.8);
    cellX += dashaColWidths[1];

    doc.text(`${item.totalYears} Years`, cellX + 2, y + 3.8);
    cellX += dashaColWidths[2];

    doc.text(item.startDate, cellX + 2, y + 3.8);
    cellX += dashaColWidths[3];

    doc.text(item.endDate, cellX + 2, y + 3.8);
    cellX += dashaColWidths[4];

    if (isCurrent) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('[ACTIVE NOW]', cellX + 2, y + 3.8);
    } else {
      const now = new Date();
      const endD = new Date(item.endDate);
      if (endD < now) {
        doc.setTextColor(148, 163, 184);
        doc.text('Completed', cellX + 2, y + 3.8);
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text('Upcoming', cellX + 2, y + 3.8);
      }
    }
    y += 5;
  });

  // =========================================================================
  // PAGE 4 (+ PAGE 5 IF NEEDED): TRANSITS, REMEDIES, PURUSHARTHAS & DYNAMIC AI CONSULTATION
  // =========================================================================
  doc.addPage();
  drawRunningHeader(4, 'SECTION IV: TRANSITS, REMEDIES & CONSULTATION');

  let currentY = 22;

  // 1. Real-Time Planetary Transits (Gochar Weather)
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. CURRENT CELESTIAL TRANSITS (GOCHAR WEATHER)', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Real-time planetary positions evaluated against your natal Lagna and Moon.', margin, currentY + 4.5);

  currentY += 8;
  const transitPlanets = data.transits?.sidereal?.planets || [];
  const majorTransits = transitPlanets.filter(p => ['Saturn', 'Jupiter', 'Rahu', 'Ketu', 'Mars', 'Sun'].includes(p.name));

  const transitHeaders = ['Transiting Planet', 'Current Sign', 'Degree', 'House from Lagna', 'House from Moon', 'Gochar Influence'];
  const transitColWidths = [30, 28, 22, 28, 28, 46];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let tX = margin;
  transitHeaders.forEach((h, idx) => {
    doc.text(h, tX + 2, currentY + 4.2);
    tX += transitColWidths[idx];
  });

  currentY += 6;
  const lagnaBoxIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === sc.lagna.sign.toLowerCase());
  const moonBoxIdx = moonPlanet ? ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === moonPlanet.sign.toLowerCase()) : 0;

  majorTransits.forEach((tp, tIdx) => {
    doc.setFillColor(tIdx % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 5, 'S');

    const tpSignIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === tp.sign.toLowerCase());
    const hFromLagna = ((tpSignIdx - lagnaBoxIdx + 12) % 12) + 1;
    const hFromMoon = ((tpSignIdx - moonBoxIdx + 12) % 12) + 1;

    let influenceNote = 'Steady Transit';
    if (tp.name === 'Saturn') {
      if ([12, 1, 2].includes(hFromMoon)) influenceNote = 'Sade Sati Phase';
      else if ([4, 8].includes(hFromMoon)) influenceNote = 'Kantaka Shani Focus';
      else influenceNote = 'Discipline & Building';
    } else if (tp.name === 'Jupiter') {
      if ([2, 5, 7, 9, 11].includes(hFromMoon)) influenceNote = 'Highly Auspicious (Guru Balam)';
      else influenceNote = 'Spiritual Growth';
    } else if (['Rahu', 'Ketu'].includes(tp.name)) {
      influenceNote = 'Karmic Axis Shift';
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    let cellX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PLANET_COLORS_HEX[tp.name] || '#0f172a');
    doc.text(tp.name, cellX + 2, currentY + 3.8);
    cellX += transitColWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(tp.sign, cellX + 2, currentY + 3.8);
    cellX += transitColWidths[1];

    doc.setFont('courier', 'normal');
    doc.text(formatDegPdf(tp.formattedDegree), cellX + 2, currentY + 3.8);
    cellX += transitColWidths[2];

    doc.setFont('helvetica', 'normal');
    doc.text(`House ${hFromLagna}`, cellX + 2, currentY + 3.8);
    cellX += transitColWidths[3];

    doc.text(`House ${hFromMoon}`, cellX + 2, currentY + 3.8);
    cellX += transitColWidths[4];

    doc.setTextColor(influenceNote.includes('Auspicious') ? '#059669' : influenceNote.includes('Sade Sati') ? '#b45309' : '#475569');
    doc.text(influenceNote, cellX + 2, currentY + 3.8);

    currentY += 5;
  });

  // 2. Classical 3-Tier Remedial Architecture (Pariharams)
  currentY += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CLASSICAL REMEDIAL ARCHITECTURE (PARIHARAMS)', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Prescribed Vedic harmonic remedies aligned with your active Mahadasha lord.', margin, currentY + 4.5);

  currentY += 7;
  const remedy = getClassicalRemedy(activeLord);
  const remedyHeight = 26;

  doc.setFillColor(254, 252, 232);
  doc.roundedRect(margin, currentY, contentWidth, remedyHeight, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, remedyHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`PRIMARY REMEDY FOR ${activeLord.toUpperCase()} MAHADASHA:`, margin + 5, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`1. Supreme Maha Sthalam: ${remedy.temple} (${remedy.district})`, margin + 5, currentY + 10.5);
  doc.text(`2. Sacred Sound Sadhana: ${remedy.mantra}`, margin + 5, currentY + 15);
  doc.text(`3. Charitable Action (Dana): ${remedy.charity}`, margin + 5, currentY + 19.5);
  doc.text('4. Ethical Harmony: Regular gratitude, ancestor offerings (Tarpanam), and ahimsa.', margin + 5, currentY + 24);

  // 3. Purusharthas Box
  currentY += remedyHeight + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. THE FOUR PURUSHARTHAS (CORE LIFE DOMAINS)', margin, currentY);

  currentY += 6;
  const puruWidth = (contentWidth - 6) / 2;
  const puruHeight = 20;

  // Domain 1: Dharma
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, currentY, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text('DHARMA (DUTY) • Houses 1, 5, 9', margin + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`Lagna in ${sc.lagna.sign} anchors self-realization and authentic duty.`, margin + 4, currentY + 10, { maxWidth: puruWidth - 8 });

  // Domain 2: Artha
  const arthaX = margin + puruWidth + 6;
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(arthaX, currentY, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(arthaX, currentY, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('ARTHA (WEALTH) • Houses 2, 6, 10', arthaX + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Resource accumulation & career authority through sustained discipline.', arthaX + 4, currentY + 10, { maxWidth: puruWidth - 8 });

  // Domain 3: Kama
  currentY += puruHeight + 3;
  doc.setFillColor(253, 242, 248);
  doc.roundedRect(margin, currentY, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(251, 207, 232);
  doc.roundedRect(margin, currentY, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(190, 24, 93);
  doc.text('KAMA (RELATIONSHIPS) • Houses 3, 7, 11', margin + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Social networks & partnerships fulfilled through empathy & balance.', margin + 4, currentY + 10, { maxWidth: puruWidth - 8 });

  // Domain 4: Moksha
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(arthaX, currentY, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(arthaX, currentY, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(109, 40, 217);
  doc.text('MOKSHA (LIBERATION) • Houses 4, 8, 12', arthaX + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('Inner silence, subconscious healing & spiritual contemplation.', arthaX + 4, currentY + 10, { maxWidth: puruWidth - 8 });

/**
 * Advanced GFM Markdown & Styled Table Parser for PDF Consultation Reports
 */
function renderMarkdownConsultationToPdf(
  doc: jsPDF,
  markdownText: string,
  margin: number,
  startY: number,
  contentWidth: number,
  pageHeight: number,
  drawHeaderFn: (pageNum: number, title: string) => void
): number {
  let currentY = startY;
  const maxPageY = pageHeight - margin - 22; // Clearance for running footer & legal notice

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > maxPageY) {
      doc.addPage();
      const pageNum = doc.getNumberOfPages();
      drawHeaderFn(pageNum, 'SECTION IV: CONSULTATION & SYNTHESIS (CONTD.)');
      currentY = 22;
      return true;
    }
    return false;
  };

  const lines = markdownText.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      currentY += 2.5;
      i++;
      continue;
    }

    // Check if line is part of a GFM Markdown Table
    if (rawLine.startsWith('|') && rawLine.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (line: string) =>
          line.split('|').slice(1, -1).map(c => c.trim());

        const headers = parseRow(tableLines[0]);
        const dataRows = tableLines.slice(1)
          .filter(l => !/^[|\s-:]+$/.test(l))
          .map(parseRow);

        if (headers.length > 0) {
          const numCols = headers.length;
          const colWidth = contentWidth / numCols;
          const headerHeight = 6.5;

          checkPageBreak(headerHeight + 6);

          // Render Styled Table Header
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, currentY, contentWidth, headerHeight, 'F');
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.3);
          doc.rect(margin, currentY, contentWidth, headerHeight, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);

          headers.forEach((h, hIdx) => {
            const cleanH = h.replace(/\*\*/g, '').replace(/[*_`]/g, '');
            doc.text(cleanH, margin + hIdx * colWidth + 2, currentY + 4.5, { maxWidth: colWidth - 4 });
          });

          currentY += headerHeight;

          // Render Styled Data Rows
          dataRows.forEach((row, rIdx) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);

            let maxLinesInRow = 1;
            const cellTextLinesList: string[][] = [];

            row.forEach((cell) => {
              const cleanCell = cell.replace(/\*\*/g, '').replace(/[*_`]/g, '');
              const cellLines = doc.splitTextToSize(cleanCell, colWidth - 4);
              cellTextLinesList.push(cellLines);
              if (cellLines.length > maxLinesInRow) {
                maxLinesInRow = cellLines.length;
              }
            });

            const rowHeight = Math.max(5.5, maxLinesInRow * 3.8 + 2);
            checkPageBreak(rowHeight);

            const isEven = rIdx % 2 === 0;
            doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
            doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.rect(margin, currentY, contentWidth, rowHeight, 'S');

            row.forEach((_, cIdx) => {
              const cellLines = cellTextLinesList[cIdx] || [];
              const cellX = margin + cIdx * colWidth + 2;
              doc.setTextColor(51, 65, 85);
              cellLines.forEach((tLine, tIdx) => {
                doc.text(tLine, cellX, currentY + 3.8 + tIdx * 3.8);
              });
            });

            currentY += rowHeight;
          });

          currentY += 4;
          continue;
        }
      }
    }

    // Normal Text / Headings / Bullet Points
    let cleanLine = rawLine;
    let isHeading = false;
    let isBullet = false;

    if (cleanLine.startsWith('#')) {
      isHeading = true;
      cleanLine = cleanLine.replace(/^#+\s*/, '');
    } else if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
      isHeading = true;
      cleanLine = cleanLine.replace(/^\*\*|\*\*$/g, '');
    } else if (/^[-*•]\s/.test(cleanLine)) {
      isBullet = true;
      cleanLine = cleanLine.replace(/^[-*•]\s*/, '• ');
    }

    cleanLine = cleanLine.replace(/\*\*/g, '').replace(/[*_`]/g, '');

    if (isHeading) {
      checkPageBreak(8);
      currentY += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const headingLines = doc.splitTextToSize(cleanLine, contentWidth);
      headingLines.forEach((hl: string) => {
        checkPageBreak(4.5);
        doc.text(hl, margin, currentY);
        currentY += 4.5;
      });
      currentY += 1;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const textLines = doc.splitTextToSize(cleanLine, contentWidth - (isBullet ? 4 : 0));

      textLines.forEach((tl: string, idx: number) => {
        checkPageBreak(4.2);
        const xPos = isBullet ? (idx === 0 ? margin : margin + 4) : margin;
        doc.text(tl, xPos, currentY);
        currentY += 4.2;
      });
    }

    i++;
  }

  return currentY;
}

  currentY += puruHeight + 6;

  // FIX REQUIREMENT 4: Dynamic Page Budgeting (Case A: <300 chars stay on Page 4; Case B: >=300 chars begin Section IV on Page 5)
  const assistantMessages = chatHistory.filter(m => m.sender === 'assistant');
  const userMessages = chatHistory.filter(m => m.sender === 'user');

  const consultationTextRaw = assistantMessages.length > 0
    ? assistantMessages[assistantMessages.length - 1].text
    : `This natal dossier for ${profile.name} reflects a purposeful incarnation with Lagna in ${sc.lagna.sign} and Moon in ${moonPlanet?.sign || 'Taurus'}.\n\nKey Astrological Highlights:\n• The placement of Lagna lord establishes the foundation of life trajectory, demanding alignment with ethical duty (Dharma).\n• The active ${activeLord} Mahadasha indicates a phase of transformative awakening, calling for focus on core foundational objectives.\n• Transits of Jupiter and Saturn emphasize structural growth through patience, discipline, and emotional balance.\n• Remedial practices, including charitable giving (Dana) and regular contemplation, harmonize conflicting planetary forces.`;

  const isFullConsultation = consultationTextRaw.trim().length >= 300;

  if (!isFullConsultation) {
    // =========================================================================
    // CASE A: Brief Summary (<300 chars) -> Stay on Page 4 (Strictly 4 Pages)
    // =========================================================================
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('4. ASTRO ORACLE CONSULTATION HIGHLIGHTS', margin, currentY);

    currentY += 5;
    currentY = renderMarkdownConsultationToPdf(
      doc,
      consultationTextRaw,
      margin,
      currentY,
      contentWidth,
      pageHeight,
      drawRunningHeader
    );

    // Swiss Ephemeris Legal Notice at bottom of Page 4
    currentY = Math.max(currentY + 4, pageHeight - margin - 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SWISS EPHEMERIS MATHEMATICAL CERTIFICATION & LEGAL NOTICE', margin, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    const disclaimerText = 'All celestial planetary positions, house cusps, and harmonic aspects in this document were computed using the Swiss Ephemeris WASM engine with astronomical precision conforming to JPL ephemerides. Lahiri Ayanamsha applied. This dossier is prepared exclusively for personal spiritual insight and life guidance. Astrological assessments do not constitute medical, financial, or legal counsel.';
    const discLines = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(discLines, margin, currentY + 3.8);

  } else {
    // =========================================================================
    // CASE B: Full AI Consultation Q&A (>=300 chars) -> Begin Section IV on Page 5 Appendix
    // =========================================================================
    // 1. Render Legal Certification at bottom of Page 4
    const page4CertY = pageHeight - margin - 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SWISS EPHEMERIS MATHEMATICAL CERTIFICATION & LEGAL NOTICE', margin, page4CertY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    const disclaimerText = 'All celestial planetary positions, house cusps, and harmonic aspects in this document were computed using the Swiss Ephemeris WASM engine with astronomical precision conforming to JPL ephemerides. Lahiri Ayanamsha applied. This dossier is prepared exclusively for personal spiritual insight and life guidance. Astrological assessments do not constitute medical, financial, or legal counsel.';
    const discLines = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(discLines, margin, page4CertY + 3.8);

    // 2. Add Dedicated Page 5 Appendix
    doc.addPage();
    drawRunningHeader(5, 'SECTION IV: AI ORACLE CONSULTATION APPENDIX');

    let p5Y = 22;
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('SECTION IV: ASTRO ORACLE CONSULTATION RECORD', margin, p5Y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Transcribed astrological synthesis, multi-dimensional Q&A, and personalized guidance.', margin, p5Y + 4.5);

    p5Y += 9;

    if (userMessages.length > 0) {
      const latestQuery = userMessages[userMessages.length - 1].text;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text('NATIVE INQUIRY:', margin, p5Y);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(30, 41, 59);
      const queryLines = doc.splitTextToSize(`"${latestQuery}"`, contentWidth);
      doc.text(queryLines.slice(0, 3), margin, p5Y + 4.5);
      p5Y += queryLines.slice(0, 3).length * 4.2 + 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ORACLE SYNTHESIS & COUNSELING GUIDANCE:', margin, p5Y);
    p5Y += 6;

    // Render full consultation text with GFM Markdown table parsing and dynamic page breaks
    p5Y = renderMarkdownConsultationToPdf(
      doc,
      consultationTextRaw,
      margin,
      p5Y,
      contentWidth,
      pageHeight,
      drawRunningHeader
    );

    // Appendix End Certification
    if (p5Y + 15 > pageHeight - margin - 22) {
      doc.addPage();
      drawRunningHeader(doc.getNumberOfPages(), 'SECTION IV: APPENDIX CERTIFICATION');
      p5Y = 22;
    }
    p5Y = Math.max(p5Y + 4, pageHeight - margin - 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('APPENDIX CERTIFICATION & LEGAL NOTICE', margin, p5Y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(discLines, margin, p5Y + 3.8);
  }

  // Dynamic Total Page Count Update across all generated pages
  const totalPagesGenerated = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesGenerated; i++) {
    doc.setPage(i);
    drawRunningFooter(i, totalPagesGenerated);
  }

  return doc;
}
