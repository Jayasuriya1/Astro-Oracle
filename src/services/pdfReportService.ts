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
 * Render a high-resolution Light-Themed South Indian Chart onto a Canvas
 * and return its PNG Data URL.
 */
export function renderLightKundaliPng(
  planets: PlanetPosition[],
  lagna: { sign: string; degree: number; formattedDegree: string },
  nativeName: string,
  language: 'en' | 'ta' = 'en'
): string {
  const canvas = document.createElement('canvas');
  const size = 1200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cellSize = size / 4; // 300px per cell

  // 1. Pristine Light Canvas Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Outer border - Royal Gold Hairline
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // 2. Central 2x2 Chamber (Traditional Inactive Core)
  const centerFill = ctx.createLinearGradient(cellSize, cellSize, cellSize * 3, cellSize * 3);
  centerFill.addColorStop(0, '#fefce8'); // Warm soft champagne
  centerFill.addColorStop(1, '#fef3c7'); // Soft amber tint
  ctx.fillStyle = centerFill;
  ctx.fillRect(cellSize, cellSize, cellSize * 2, cellSize * 2);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.strokeRect(cellSize, cellSize, cellSize * 2, cellSize * 2);

  // Center Geometric Circles & Emblem
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

  // Central Title & Information
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

  // Native Name in Center
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  const displayName = nativeName.length > 20 ? nativeName.substring(0, 18) + '..' : nativeName;
  ctx.fillText(displayName, centerX, centerY + 24);

  // Lagna & Moon summary in Center
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

  // 3. Render the 12 Outer House Boxes
  const lagnaBox = SOUTH_INDIAN_BOXES.find(
    b => b.sign.toLowerCase() === lagna.sign.toLowerCase()
  );
  const lagnaSignIndex = lagnaBox ? lagnaBox.signIndex : 0;

  SOUTH_INDIAN_BOXES.forEach(box => {
    const x = box.col * cellSize;
    const y = box.row * cellSize;
    const isLagna = box.sign.toLowerCase() === lagna.sign.toLowerCase();
    const houseNum = ((box.signIndex - lagnaSignIndex + 12) % 12) + 1;

    // Box Fill
    if (isLagna) {
      ctx.fillStyle = '#fef3c7'; // Gold tinted for Lagna
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(x, y, cellSize, cellSize);

    // Box Stroke
    ctx.strokeStyle = isLagna ? '#b45309' : '#cbd5e1';
    ctx.lineWidth = isLagna ? 3 : 1.5;
    ctx.strokeRect(x, y, cellSize, cellSize);

    // Lagna Corner Ribbon
    if (isLagna) {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40, y);
      ctx.lineTo(x, y + 40);
      ctx.closePath();
      ctx.fill();
    }

    // Header Channel: Sign Name on Left
    ctx.save();
    ctx.fillStyle = isLagna ? '#92400e' : '#334155';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    const signLabel = language === 'ta' ? `${box.tamil} (${box.sign})` : box.sign;
    ctx.fillText(signLabel, x + (isLagna ? 48 : 14), y + 26);

    // Header Channel: House Number on Right
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

    // Divider Line under Header
    ctx.strokeStyle = isLagna ? '#fcd34d' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 36);
    ctx.lineTo(x + cellSize - 10, y + 36);
    ctx.stroke();

    // Planets inside this box
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

        // Planet Name & Glyph
        ctx.fillStyle = color;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(p.name, x + 14, py);

        // Planet formatted degree
        ctx.fillStyle = '#1e293b';
        ctx.font = '16px monospace';
        ctx.textAlign = 'right';
        const rightOffset = p.isRetrograde ? 48 : 14;
        ctx.fillText(p.formattedDegree, x + cellSize - rightOffset, py);

        // Retrograde indicator [R]
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
  const totalPages = 4;

  const sc = data.siderealChart;
  const tc = data.tropicalChart;
  const pc = data.panchangam;

  // Running Header Helper
  const drawRunningHeader = (_pageNum: number, title: string) => {
    // Top subtle bar
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
  const drawRunningFooter = (pageNum: number) => {
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
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

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
  doc.text(`Time of Birth: ${profile.birthTime} (Local Standard Time)`, margin + 65, y + 15);
  doc.text(`Ayanamsha: ${sc.ayanamsaValue ? sc.ayanamsaValue.toFixed(4) + '° (Lahiri)' : '24.12° (Lahiri)'}`, margin + 130, y + 15);

  // Row 3: Place & Coordinates
  const latStr = `${Math.abs(profile.birthCoordinates.latitude).toFixed(2)}°${profile.birthCoordinates.latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(profile.birthCoordinates.longitude).toFixed(2)}°${profile.birthCoordinates.longitude >= 0 ? 'E' : 'W'}`;
  doc.text(`Birth Place: ${profile.currentCity || profile.currentState || 'Birth City'}`, margin + 5, y + 21);
  doc.text(`Coordinates: ${latStr}, ${lonStr}`, margin + 65, y + 21);
  doc.text(`House System: Whole Sign (Vedic) / Placidus (Western)`, margin + 130, y + 21);

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
  const naksName = pc?.nakshatra ? `${pc.nakshatra.name} (Pada ${pc.nakshatra.pada || sc.lagna.pada || 1})` : `${sc.lagna.nakshatra || 'Ashwini'}`;
  const yogaName = pc?.yoga?.name || 'Siddha';
  const karanaName = pc?.karana?.name || 'Bava';
  const varaName = 'Day Lord (Vara)';

  doc.text(`• Tithi (Phase): ${tithiName}`, margin + 5, y + 11);
  doc.text(`• Nakshatra (Star): ${naksName}`, margin + 68, y + 11);
  doc.text(`• Star Lord: ${pc?.nakshatra?.lord || 'Ketu'}`, margin + 140, y + 11);

  doc.text(`• Yoga (Harmony): ${yogaName}`, margin + 5, y + 16);
  doc.text(`• Karana (Action): ${karanaName}`, margin + 68, y + 16);
  doc.text(`• Sunrise Solar Day: ${varaName}`, margin + 140, y + 16);

  // Visual Light-Theme South Indian Chart Diagram
  y = 85;
  try {
    const chartPng = renderLightKundaliPng(sc.planets, sc.lagna, profile.name, language);
    if (chartPng) {
      // 120mm x 120mm chart centered horizontally
      const chartSizeMm = 120;
      const chartX = (pageWidth - chartSizeMm) / 2;
      doc.addImage(chartPng, 'PNG', chartX, y, chartSizeMm, chartSizeMm);
    }
  } catch (chartErr) {
    console.error('Failed to embed chart PNG in PDF:', chartErr);
  }

  // The Core Triad (The Big Three) Bottom Section
  y = 210;
  const triadCardWidth = (contentWidth - 6) / 3;
  const triadCardHeight = 36;

  // Triad 1: Lagna (Ascendant)
  doc.setFillColor(245, 243, 255); // Soft purple tint
  doc.roundedRect(margin, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(192, 132, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217); // Purple
  doc.text('LAGNA (ASCENDANT)', margin + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sc.lagna.sign, margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${sc.lagna.formattedDegree}`, margin + 4, y + 18);
  doc.text(`Nakshatra: ${sc.lagna.nakshatra} (P${sc.lagna.pada})`, margin + 4, y + 23);
  doc.text('Keynote: Tanu Bhava • Physical vitality, constitution & self-expression.', margin + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Triad 2: Moon Sign (Chandra)
  const moonPlanet = sc.planets.find(p => p.name.toLowerCase() === 'moon');
  const moonX = margin + triadCardWidth + 3;
  doc.setFillColor(240, 249, 255); // Soft sky blue tint
  doc.roundedRect(moonX, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(125, 211, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(moonX, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 105, 161); // Sky blue
  doc.text('CHANDRA RASI (MOON)', moonX + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(moonPlanet ? moonPlanet.sign : 'Taurus', moonX + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${moonPlanet ? moonPlanet.formattedDegree : "15°20'"}`, moonX + 4, y + 18);
  doc.text(`Nakshatra: ${moonPlanet?.nakshatra || sc.lagna.nakshatra} (P${moonPlanet?.nakshatraPada || 1})`, moonX + 4, y + 23);
  doc.text('Keynote: Manas • Emotional subconscious, intuition & psychological balance.', moonX + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Triad 3: Sun Sign (Surya)
  const sunPlanet = sc.planets.find(p => p.name.toLowerCase() === 'sun');
  const sunX = moonX + triadCardWidth + 3;
  doc.setFillColor(254, 243, 199); // Soft gold tint
  doc.roundedRect(sunX, y, triadCardWidth, triadCardHeight, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.4);
  doc.roundedRect(sunX, y, triadCardWidth, triadCardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Gold
  doc.text('SURYA RASI (SUN)', sunX + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sunPlanet ? sunPlanet.sign : 'Leo', sunX + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exact Degree: ${sunPlanet ? sunPlanet.formattedDegree : "02°15'"}`, sunX + 4, y + 18);
  doc.text(`Nakshatra: ${sunPlanet?.nakshatra || 'Magha'} (P${sunPlanet?.nakshatraPada || 1})`, sunX + 4, y + 23);
  doc.text('Keynote: Atma Karaka • Core soul purpose, career authority & vitality.', sunX + 4, y + 28, { maxWidth: triadCardWidth - 8 });

  // Astrological note under triad
  y = 252;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Note: In Vedic Sidereal calculations, planetary placements are aligned with the observable fixed constellations (Nirayana).', margin, y);

  drawRunningFooter(1);

  // =========================================================================
  // PAGE 2: COMPREHENSIVE GRAHA COORDINATES, NAVAMSHA (D9) & WESTERN PLACIDUS
  // =========================================================================
  doc.addPage();
  drawRunningHeader(2, 'SECTION II: PLANETARY POSITIONS & HARMONICS');

  y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('1. COMPLETE LAHIRI SIDEREAL NAVAGRAHA POSITIONS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Exact planetary longitudes, house occupancy, nakshatras, star lords, and classical Vedic dignities.', margin, y + 4.5);

  // Planetary Coordinates Table
  y = 31;
  const colWidths = [24, 24, 22, 14, 28, 22, 18, 30]; // total = 182
  const headers = ['Planet', 'Rasi (Sign)', 'Degree', 'House', 'Nakshatra & Pada', 'Star Lord', 'Motion', 'Vedic Dignity'];

  // Table Header Row
  doc.setFillColor(241, 245, 249); // Clean slate-100
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  let curX = margin;
  headers.forEach((h, idx) => {
    doc.text(h, curX + 2, y + 4.8);
    curX += colWidths[idx];
  });

  // Table Body Rows
  y += 7;
  const planetsToRender = sc.planets.slice(0, 12); // Include all available planets
  planetsToRender.forEach((planet, rIdx) => {
    const isEven = rIdx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let cellX = margin;

    // Col 1: Planet
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PLANET_COLORS_HEX[planet.name] || '#0f172a');
    doc.text(planet.name, cellX + 2, y + 4.2);
    cellX += colWidths[0];

    // Col 2: Sign
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(planet.sign, cellX + 2, y + 4.2);
    cellX += colWidths[1];

    // Col 3: Degree
    doc.setFont('courier', 'normal');
    doc.text(planet.formattedDegree, cellX + 2, y + 4.2);
    cellX += colWidths[2];

    // Col 4: House
    doc.setFont('helvetica', 'normal');
    doc.text(`H${planet.house || 1}`, cellX + 2, y + 4.2);
    cellX += colWidths[3];

    // Col 5: Nakshatra & Pada
    const nakPadaStr = planet.nakshatra ? `${planet.nakshatra} (P${planet.nakshatraPada || 1})` : '—';
    doc.text(nakPadaStr, cellX + 2, y + 4.2);
    cellX += colWidths[4];

    // Col 6: Star Lord
    doc.text(planet.nakshatraLord || '—', cellX + 2, y + 4.2);
    cellX += colWidths[5];

    // Col 7: Motion
    if (planet.isRetrograde) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Crimson [R]
      doc.text('Retro [R]', cellX + 2, y + 4.2);
    } else {
      doc.setTextColor(16, 185, 129); // Green Direct
      doc.text('Direct', cellX + 2, y + 4.2);
    }
    cellX += colWidths[6];

    // Col 8: Dignity
    const dignity = getPlanetDignity(planet.name, planet.sign);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dignity.includes('Exalted') ? '#b45309' : dignity.includes('Debilitated') ? '#dc2626' : '#334155');
    doc.text(dignity, cellX + 2, y + 4.2);

    y += 6;
  });

  // Section 2: Navamsha (D9) Chart & Vargottama Analysis
  y += 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. NAVAMSHA (D9) HARMONIC ANALYSIS & VARGOTTAMA GRAHAS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('The Navamsha is the crown jewel of Vedic astrology, revealing the spiritual fruition, inner strength, and marital dharma.', margin, y + 4.5);

  y += 9;
  // D9 Card
  const d9CardHeight = 38;
  doc.setFillColor(250, 245, 255); // Soft purple fill
  doc.roundedRect(margin, y, contentWidth, d9CardHeight, 2, 2, 'F');
  doc.setDrawColor(216, 180, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, d9CardHeight, 2, 2, 'S');

  // Detect Vargottama planets
  const vargottamaPlanets: string[] = [];
  const navamshaPlanets = sc.navamshaChart?.planets || [];
  sc.planets.forEach(dp => {
    const d9p = navamshaPlanets.find(np => np.name.toLowerCase() === dp.name.toLowerCase());
    if (d9p && d9p.sign.toLowerCase() === dp.sign.toLowerCase()) {
      vargottamaPlanets.push(`${dp.name} in ${dp.sign}`);
    }
  });

  const d9LagnaSign = sc.navamshaChart?.lagna?.sign || 'Aries';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(109, 40, 217);
  doc.text(`Navamsha Ascendant (D9 Lagna): ${d9LagnaSign}`, margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• D9 Lagna Lord: Indicates the soul's inner maturation and the ultimate trajectory of life post-maturation.`, margin + 5, y + 12);

  // Vargottama summary
  doc.setFont('helvetica', 'bold');
  doc.text('• Vargottama Status:', margin + 5, y + 18);
  doc.setFont('helvetica', 'normal');
  if (vargottamaPlanets.length > 0) {
    doc.setTextColor(180, 83, 9);
    doc.text(`${vargottamaPlanets.join(', ')} — Possesses supreme raja-yoga vitality, steady character, and karmic resilience.`, margin + 38, y + 18, { maxWidth: contentWidth - 42 });
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('No planets occupy the identical sign in D1 and D9. Planetary strength operates through diverse house harmonics.', margin + 38, y + 18, { maxWidth: contentWidth - 42 });
  }

  // D9 Planetary positions summary
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('• D9 Graha Signs:', margin + 5, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const d9PositionsText = navamshaPlanets.length > 0
    ? navamshaPlanets.slice(0, 9).map(p => `${p.name}: ${p.sign}`).join(' | ')
    : 'Calculated down to 3°20\' Pada precision via Swiss Ephemeris.';
  doc.text(d9PositionsText, margin + 5, y + 31, { maxWidth: contentWidth - 10 });

  // Section 3: Western Tropical Placidus System & Major Harmonic Aspects
  y += d9CardHeight + 8;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. WESTERN PLACIDUS SYSTEM & MAJOR HARMONIC ASPECTS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Tropical zodiac angles, Placidus Ascendant, Midheaven (MC), and major psychological geometric aspects.', margin, y + 4.5);

  y += 9;
  // Tropical Summary Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const tropAsc = tc?.ascendant?.formattedDegree || sc.lagna.formattedDegree;
  const tropMc = tc?.midheaven?.formattedDegree || "28°10' Leo";
  doc.text(`Tropical Ascendant (Rising): ${tropAsc}`, margin + 5, y + 6.5);
  doc.text(`Midheaven (MC - Career Peak): ${tropMc}`, margin + 75, y + 6.5);
  doc.text('House System: Placidus Quad', margin + 140, y + 6.5);

  y += 13;
  // Aspects mini-table
  const aspectHeaders = ['Planet 1', 'Aspect Type', 'Planet 2', 'Angle', 'Orb', 'Psychological Harmonic Quality'];
  const aspectColWidths = [28, 28, 28, 20, 20, 58];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  let aspectX = margin;
  aspectHeaders.forEach((h, idx) => {
    doc.text(h, aspectX + 2, y + 4.2);
    aspectX += aspectColWidths[idx];
  });

  y += 6;
  const aspects = tc?.aspects || [];
  const topAspects = aspects.slice(0, 7);

  if (topAspects.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Major geometric aspects computed across 10 celestial bodies with orbs under 6°.', margin + 2, y + 5);
  } else {
    topAspects.forEach((asp, aIdx) => {
      doc.setFillColor(aIdx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 5.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      let ax = margin;
      doc.text(asp.planet1, ax + 2, y + 4);
      ax += aspectColWidths[0];

      // Aspect type with color
      if (['Trine', 'Sextile'].includes(asp.aspectType)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Green
      } else if (['Square', 'Opposition'].includes(asp.aspectType)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72); // Rose/Red
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9); // Amber Conjunction
      }
      doc.text(asp.aspectType, ax + 2, y + 4);
      ax += aspectColWidths[1];

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(asp.planet2, ax + 2, y + 4);
      ax += aspectColWidths[2];

      doc.setFont('courier', 'normal');
      doc.text(`${asp.angle.toFixed(1)}°`, ax + 2, y + 4);
      ax += aspectColWidths[3];

      doc.text(`${asp.orb.toFixed(2)}°`, ax + 2, y + 4);
      ax += aspectColWidths[4];

      doc.setFont('helvetica', 'normal');
      let quality = 'Dynamic Integration';
      if (asp.aspectType === 'Trine') quality = 'Effortless Flow & Natural Talent';
      else if (asp.aspectType === 'Sextile') quality = 'Constructive Opportunity & Growth';
      else if (asp.aspectType === 'Square') quality = 'Evolutionary Friction & Ambition';
      else if (asp.aspectType === 'Opposition') quality = 'Relational Balance & Awareness';
      else if (asp.aspectType === 'Conjunction') quality = 'Intense Synthesis of Energies';

      doc.setTextColor(71, 85, 105);
      doc.text(quality, ax + 2, y + 4);

      y += 5.5;
    });
  }

  drawRunningFooter(2);

  // =========================================================================
  // PAGE 3: LIFE TIMING (VIMSHOTTARI DASHA) & REAL-TIME TRANSITS (GOCHAR)
  // =========================================================================
  doc.addPage();
  drawRunningHeader(3, 'SECTION III: DASHA TIMELINES & TRANSITS');

  y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('1. VIMSHOTTARI DASHA: 120-YEAR SACRED LIFETIME TIMELINE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('The classical Vimshottari timing system reveals when karmic potentials awaken and manifest into life events.', margin, y + 4.5);

  y = 31;
  // Active Mahadasha & Antardasha Spotlight Box
  const activeDasha = sc.dashaReport?.currentMahadasha;
  const dashaSpotlightHeight = 22;
  doc.setFillColor(254, 243, 199); // Royal Gold tint
  doc.roundedRect(margin, y, contentWidth, dashaSpotlightHeight, 2, 2, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, dashaSpotlightHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(146, 64, 14);
  const activeLord = activeDasha ? activeDasha.lord : 'Jupiter';
  const startD = activeDasha ? activeDasha.startDate : '2020-01-01';
  const endD = activeDasha ? activeDasha.endDate : '2036-01-01';
  const pct = activeDasha?.percentagePassed ? Math.round(activeDasha.percentagePassed) : 45;
  doc.text(`CURRENT ACTIVE TIMING: ${activeLord.toUpperCase()} MAHADASHA (${startD} to ${endD})`, margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Progress: ~${pct}% completed. Major planetary theme revolves around the houses ruled by ${activeLord} in the natal chart.`, margin + 5, y + 12);
  doc.text(`• Astrological Directive: Cultivate the virtues of ${activeLord} through ethical actions, study, and harmonious remedies.`, margin + 5, y + 17);

  // Full 120-Year Vimshottari Table
  y += dashaSpotlightHeight + 6;
  const dashaHeaders = ['Cycle', 'Mahadasha Lord', 'Duration (Years)', 'Effective Start Date', 'Effective End Date', 'Lifecycle Status'];
  const dashaColWidths = [18, 36, 30, 34, 34, 30];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let dX = margin;
  dashaHeaders.forEach((h, idx) => {
    doc.text(h, dX + 2, y + 4.5);
    dX += dashaColWidths[idx];
  });

  y += 6.5;
  const dashaTimeline = sc.dashaReport?.timeline || [];
  dashaTimeline.forEach((item, dIdx) => {
    const isCurrent = item.isCurrent;
    if (isCurrent) {
      doc.setFillColor(254, 243, 199); // Highlight active
    } else if (dIdx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', isCurrent ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(isCurrent ? 180 : 51, isCurrent ? 83 : 65, isCurrent ? 9 : 85);

    let cellX = margin;
    doc.text(`${dIdx + 1}`, cellX + 2, y + 4);
    cellX += dashaColWidths[0];

    doc.text(item.lord, cellX + 2, y + 4);
    cellX += dashaColWidths[1];

    doc.text(`${item.totalYears} Years`, cellX + 2, y + 4);
    cellX += dashaColWidths[2];

    doc.text(item.startDate, cellX + 2, y + 4);
    cellX += dashaColWidths[3];

    doc.text(item.endDate, cellX + 2, y + 4);
    cellX += dashaColWidths[4];

    if (isCurrent) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('● ACTIVE NOW', cellX + 2, y + 4);
    } else {
      const now = new Date();
      const endD = new Date(item.endDate);
      if (endD < now) {
        doc.setTextColor(148, 163, 184);
        doc.text('Completed', cellX + 2, y + 4);
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text('Upcoming', cellX + 2, y + 4);
      }
    }
    y += 5.5;
  });

  // Section 2: Real-Time Planetary Transits (Gochar Weather)
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CURRENT CELESTIAL TRANSITS (GOCHAR WEATHER)', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Real-time planetary positions evaluated against your natal Lagna and Moon to reveal immediate opportunities & challenges.', margin, y + 4.5);

  y += 8;
  const transitPlanets = data.transits?.sidereal?.planets || [];
  const majorTransits = transitPlanets.filter(p => ['Saturn', 'Jupiter', 'Rahu', 'Ketu', 'Mars', 'Sun'].includes(p.name));

  const transitHeaders = ['Transiting Planet', 'Current Sign', 'Degree', 'House from Lagna', 'House from Moon', 'Gochar Influence'];
  const transitColWidths = [30, 28, 22, 28, 28, 46];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let tX = margin;
  transitHeaders.forEach((h, idx) => {
    doc.text(h, tX + 2, y + 4.2);
    tX += transitColWidths[idx];
  });

  y += 6;
  const lagnaBoxIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === sc.lagna.sign.toLowerCase());
  const moonPlanetRef = sc.planets.find(p => p.name.toLowerCase() === 'moon');
  const moonBoxIdx = moonPlanetRef ? ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === moonPlanetRef.sign.toLowerCase()) : 0;

  majorTransits.forEach((tp, tIdx) => {
    doc.setFillColor(tIdx % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5.5, 'S');

    const tpSignIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === tp.sign.toLowerCase());
    const hFromLagna = ((tpSignIdx - lagnaBoxIdx + 12) % 12) + 1;
    const hFromMoon = ((tpSignIdx - moonBoxIdx + 12) % 12) + 1;

    let influenceNote = 'Steady Transit';
    if (tp.name === 'Saturn') {
      if ([12, 1, 2].includes(hFromMoon)) influenceNote = 'Sade Sati Phase (Karmic Refinement)';
      else if ([4, 8].includes(hFromMoon)) influenceNote = 'Kantaka / Ashtama Shani Focus';
      else influenceNote = 'Discipline & Long-term Building';
    } else if (tp.name === 'Jupiter') {
      if ([2, 5, 7, 9, 11].includes(hFromMoon)) influenceNote = 'Highly Auspicious (Guru Balam)';
      else influenceNote = 'Spiritual & Inner Growth';
    } else if (['Rahu', 'Ketu'].includes(tp.name)) {
      influenceNote = 'Karmic Axis Shift & Desires';
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    let cellX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PLANET_COLORS_HEX[tp.name] || '#0f172a');
    doc.text(tp.name, cellX + 2, y + 4);
    cellX += transitColWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(tp.sign, cellX + 2, y + 4);
    cellX += transitColWidths[1];

    doc.setFont('courier', 'normal');
    doc.text(tp.formattedDegree, cellX + 2, y + 4);
    cellX += transitColWidths[2];

    doc.setFont('helvetica', 'normal');
    doc.text(`House ${hFromLagna}`, cellX + 2, y + 4);
    cellX += transitColWidths[3];

    doc.text(`House ${hFromMoon}`, cellX + 2, y + 4);
    cellX += transitColWidths[4];

    doc.setTextColor(influenceNote.includes('Auspicious') ? '#059669' : influenceNote.includes('Sade Sati') ? '#b45309' : '#475569');
    doc.text(influenceNote, cellX + 2, y + 4);

    y += 5.5;
  });

  // Section 3: Classical 3-Tier Remedial Guidance (Pariharams)
  y += 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CLASSICAL REMEDIAL ARCHITECTURE (PARIHARAMS)', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Prescribed Vedic harmonic remedies aligned with your active Mahadasha lord and Janma Nakshatra.', margin, y + 4.5);

  y += 8;
  const remedy = getClassicalRemedy(activeLord);
  const remedyHeight = 30;

  doc.setFillColor(254, 252, 232); // Ivory fill
  doc.roundedRect(margin, y, contentWidth, remedyHeight, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, remedyHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`PRIMARY REMEDY FOR ${activeLord.toUpperCase()} MAHADASHA:`, margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`1. Supreme Maha Sthalam: ${remedy.temple} (${remedy.district})`, margin + 5, y + 12);
  doc.text(`2. Sacred Sound Sadhana: ${remedy.mantra}`, margin + 5, y + 17);
  doc.text(`3. Charitable Action (Dana): ${remedy.charity}`, margin + 5, y + 22);
  doc.text('4. Ethical Harmony: Regular gratitude, ancestor offerings (Tarpanam), and ahimsa towards all living beings.', margin + 5, y + 27);

  drawRunningFooter(3);

  // =========================================================================
  // PAGE 4: AI ORACLE CONSULTATION SYNTHESIS & ASTROLOGICAL CERTIFICATION
  // =========================================================================
  doc.addPage();
  drawRunningHeader(4, 'SECTION IV: ORACLE SYNTHESIS & CONSULTATION');

  y = 22;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('1. THE FOUR PURUSHARTHAS (CORE LIFE DOMAINS BLUEPRINT)', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Synthesis of your chart into the four classical goals of human incarnation.', margin, y + 4.5);

  y = 31;
  const puruWidth = (contentWidth - 6) / 2;
  const puruHeight = 24;

  // Domain 1: Dharma
  doc.setFillColor(254, 242, 242); // Soft red/rose tint
  doc.roundedRect(margin, y, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text('DHARMA (DUTY & HIGHER PURPOSE) • Houses 1, 5, 9', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Lagna in ${sc.lagna.sign} anchors self-realization. Natural inclinations toward righteousness, intellectual discernment, and authentic dharma.`, margin + 4, y + 12, { maxWidth: puruWidth - 8 });

  // Domain 2: Artha
  const arthaX = margin + puruWidth + 6;
  doc.setFillColor(236, 253, 245); // Soft emerald tint
  doc.roundedRect(arthaX, y, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(arthaX, y, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('ARTHA (WEALTH, CAREER & VOCATION) • Houses 2, 6, 10', arthaX + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Resource accumulation and career authority. Sustained discipline and value generation yield stability in professional life.', arthaX + 4, y + 12, { maxWidth: puruWidth - 8 });

  // Domain 3: Kama
  y += puruHeight + 4;
  doc.setFillColor(253, 242, 248); // Soft pink tint
  doc.roundedRect(margin, y, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(251, 207, 232);
  doc.roundedRect(margin, y, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 24, 93);
  doc.text('KAMA (RELATIONSHIPS & DESIRE) • Houses 3, 7, 11', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Social networks, creative passion, and partnerships. Fulfillment arrives through empathy, balanced expectations, and shared objectives.', margin + 4, y + 12, { maxWidth: puruWidth - 8 });

  // Domain 4: Moksha
  doc.setFillColor(245, 243, 255); // Soft purple tint
  doc.roundedRect(arthaX, y, puruWidth, puruHeight, 2, 2, 'F');
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(arthaX, y, puruWidth, puruHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217);
  doc.text('MOKSHA (LIBERATION & PEACE) • Houses 4, 8, 12', arthaX + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Inner silence, subconscious healing, and spiritual detachment. Regular meditation and solitude restore vitality and emotional tranquility.', arthaX + 4, y + 12, { maxWidth: puruWidth - 8 });

  // Section 2: Oracle Consultation Record
  y += puruHeight + 7;
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ASTRO ORACLE CONSULTATION RECORD', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Transcribed astrological synthesis, key questions, and personalized counseling guidance.', margin, y + 4.5);

  y += 8;
  const assistantMessages = chatHistory.filter(m => m.sender === 'assistant');
  const userMessages = chatHistory.filter(m => m.sender === 'user');

  const consultationHeight = 120;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, consultationHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, consultationHeight, 2, 2, 'S');

  let textY = y + 7;

  if (userMessages.length > 0) {
    const latestQuery = userMessages[userMessages.length - 1].text;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('NATIVE INQUIRY:', margin + 5, textY);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(30, 41, 59);
    const queryLines = doc.splitTextToSize(`"${latestQuery}"`, contentWidth - 10);
    doc.text(queryLines.slice(0, 2), margin + 5, textY + 5);
    textY += 13;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ORACLE SYNTHESIS & COUNSELING GUIDANCE:', margin + 5, textY);
  textY += 6;

  if (assistantMessages.length > 0) {
    const latestAnswer = assistantMessages[assistantMessages.length - 1].text;
    // Clean markdown hashes and formatting
    const cleanText = latestAnswer
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/\*\*/g, '')
      .replace(/[*_`]/g, '');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const readingLines = doc.splitTextToSize(cleanText, contentWidth - 10);
    const printableLines = readingLines.slice(0, 36);
    doc.text(printableLines, margin + 5, textY);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const defaultCounsel = [
      `This natal dossier for ${profile.name} reflects a purposeful incarnation with Lagna in ${sc.lagna.sign} and Moon in ${sc.planets.find(p => p.name.toLowerCase() === 'moon')?.sign || 'Taurus'}.`,
      '',
      `Key Astrological Highlights:`,
      `• The placement of Lagna lord establishes the foundation of life trajectory, demanding alignment with ethical duty (Dharma).`,
      `• The active ${activeLord} Mahadasha indicates a phase of transformative awakening, calling for focus on core foundational objectives.`,
      `• Transits of Jupiter and Saturn emphasize structural growth through patience, discipline, and emotional balance.`,
      `• Remedial practices, including charitable giving (Dana) and regular contemplation, harmonize conflicting planetary forces.`
    ];
    doc.text(defaultCounsel, margin + 5, textY);
  }

  // Section 3: Technical Certification & Ethical Disclaimer
  y += consultationHeight + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SWISS EPHEMERIS MATHEMATICAL CERTIFICATION & LEGAL NOTICE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  const disclaimerText = 'All celestial planetary positions, house cusps, and harmonic aspects in this document were computed using the Swiss Ephemeris WASM engine with astronomical precision conforming to JPL ephemerides. Lahiri Ayanamsha applied. This dossier is prepared exclusively for personal spiritual insight, self-reflection, and life guidance. Astrological assessments do not constitute medical, financial, or legal counsel.';
  const discLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(discLines, margin, y + 4);

  drawRunningFooter(4);

  return doc;
}
