import React, { useState } from 'react';
import { useAstrology } from '../context/AstrologyContext';
import { getTranslatedZodiac } from '../utils/translations';
import type { PlanetPosition } from '../types/astrology';

export interface SouthIndianChartProps {
  planets: PlanetPosition[];
  lagna: {
    sign: string;
    degree: number;
    formattedDegree: string;
    nakshatra?: string;
    pada?: number;
  };
  nativeName?: string;
  chartTitle?: string;
  className?: string;
}

// Fixed South Indian 12-sign layout (Clockwise starting with Pisces at top-left)
const SOUTH_INDIAN_BOXES = [
  { signIndex: 11, sign: 'Pisces', sanskrit: 'Meena', tamil: 'மீனம்', abbr: 'PIS', row: 0, col: 0 },
  { signIndex: 0,  sign: 'Aries', sanskrit: 'Mesha', tamil: 'மேஷம்', abbr: 'ARI', row: 0, col: 1 },
  { signIndex: 1,  sign: 'Taurus', sanskrit: 'Vrishabha', tamil: 'ரிஷபம்', abbr: 'TAU', row: 0, col: 2 },
  { signIndex: 2,  sign: 'Gemini', sanskrit: 'Mithuna', tamil: 'மிதுனம்', abbr: 'GEM', row: 0, col: 3 },
  { signIndex: 3,  sign: 'Cancer', sanskrit: 'Karka', tamil: 'கடகம்', abbr: 'CAN', row: 1, col: 3 },
  { signIndex: 4,  sign: 'Leo', sanskrit: 'Simha', tamil: 'சிம்மம்', abbr: 'LEO', row: 2, col: 3 },
  { signIndex: 5,  sign: 'Virgo', sanskrit: 'Kanya', tamil: 'கன்னி', abbr: 'VIR', row: 3, col: 3 },
  { signIndex: 6,  sign: 'Libra', sanskrit: 'Tula', tamil: 'துலாம்', abbr: 'LIB', row: 3, col: 2 },
  { signIndex: 7,  sign: 'Scorpio', sanskrit: 'Vrischika', tamil: 'விருச்சிகம்', abbr: 'SCO', row: 3, col: 1 },
  { signIndex: 8,  sign: 'Sagittarius', sanskrit: 'Dhanus', tamil: 'தனுசு', abbr: 'SAG', row: 3, col: 0 },
  { signIndex: 9,  sign: 'Capricorn', sanskrit: 'Makara', tamil: 'மகரம்', abbr: 'CAP', row: 2, col: 0 },
  { signIndex: 10, sign: 'Aquarius', sanskrit: 'Kumbha', tamil: 'கும்பம்', abbr: 'AQU', row: 1, col: 0 }
];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉ Su',
  Moon: '☽ Mo',
  Mars: '♂ Ma',
  Mercury: '☿ Me',
  Jupiter: '♃ Ju',
  Venus: '♀ Ve',
  Saturn: '♄ Sa',
  Rahu: '☊ Ra',
  Ketu: '☋ Ke',
  Uranus: '♅ Ur',
  Neptune: '♆ Ne',
  Pluto: '♇ Pl'
};

const PLANET_GLYPHS_TA: Record<string, string> = {
  Sun: '☉ சூரி',
  Moon: '☽ சந்',
  Mars: '♂ செவ்',
  Mercury: '☿ புத',
  Jupiter: '♃ குரு',
  Venus: '♀ சுக்',
  Saturn: '♄ சனி',
  Rahu: '☊ ராகு',
  Ketu: '☋ கேது',
  Uranus: '♅ யுரே',
  Neptune: '♆ நெப்',
  Pluto: '♇ புளூ'
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#fbbf24',      // Gold
  Moon: '#38bdf8',     // Lunar Cyan
  Mars: '#f87171',     // Red Coral
  Mercury: '#34d399',  // Emerald
  Jupiter: '#facc15',  // Royal Gold
  Venus: '#f472b6',    // Diamond Pink
  Saturn: '#94a3b8',   // Blue-Grey
  Rahu: '#c084fc',     // Mystic Violet
  Ketu: '#cbd5e1'      // Smoky Silver
};

const BHAVA_NAMES: Record<number, string> = {
  1: 'Tanu (Self)',
  2: 'Dhana (Wealth)',
  3: 'Sahaja (Courage)',
  4: 'Sukha (Home)',
  5: 'Putra (Intelligence)',
  6: 'Ari (Health/Obstacles)',
  7: 'Yuvati (Partnership)',
  8: 'Randhra (Longevity)',
  9: 'Dharma (Fortune)',
  10: 'Karma (Career)',
  11: 'Labha (Gains)',
  12: 'Vyaya (Moksha/Expenses)'
};

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  planets,
  lagna,
  nativeName = 'Native',
  chartTitle = 'RASI (D1)',
  className = ''
}) => {
  const { language } = useAstrology();
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const glyphMap = language === 'ta' ? PLANET_GLYPHS_TA : PLANET_GLYPHS;

  // SVG dimensions
  const viewBoxSize = 440;
  const cellSize = viewBoxSize / 4; // 110px per cell

  const safeLagna = lagna || { sign: 'Aries', degree: 0, formattedDegree: "0°00' Aries" };
  const safePlanets = planets || [];

  // Find Lagna sign index
  const lagnaBox = SOUTH_INDIAN_BOXES.find(
    (b) => b.sign.toLowerCase() === (safeLagna.sign || 'Aries').toLowerCase()
  );
  const lagnaSignIndex = lagnaBox ? lagnaBox.signIndex : 0;

  // Moon details
  const moon = safePlanets.find((p) => p.name === 'Moon');

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      <div className="w-full max-w-[500px] sm:max-w-[520px] aspect-square rounded-2xl p-1 sm:p-2 bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full font-sans block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            {/* Ambient gradients */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>

            <linearGradient id="lagnaHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
            </linearGradient>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. Outer Chart Border */}
          <rect
            x={1}
            y={1}
            width={viewBoxSize - 2}
            height={viewBoxSize - 2}
            fill="#030712"
            stroke="#334155"
            strokeWidth="1.5"
            rx={12}
            className="pointer-events-none"
          />

          {/* 2. Central 2x2 Inactive Area (Traditional Center) */}
          <rect
            x={cellSize}
            y={cellSize}
            width={cellSize * 2}
            height={cellSize * 2}
            fill="url(#centerGlow)"
            stroke="#475569"
            strokeWidth="1.5"
            onMouseEnter={() => setHoveredBox(null)}
            className="cursor-default"
          />

          {/* Central Sacred Astrological Geometry & Info */}
          <g transform={`translate(${cellSize * 2}, ${cellSize * 2})`} textAnchor="middle" className="pointer-events-none select-none">
            {/* Subtle background sacred wheel */}
            <circle r="60" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
            <circle r="40" fill="none" stroke="#eab308" strokeWidth="0.5" opacity="0.25" />

            {/* Title */}
            <text
              y="-42"
              fill="#fbbf24"
              fontSize="14"
              fontWeight="bold"
              letterSpacing="2"
              fontFamily="serif"
              filter="url(#goldGlow)"
            >
              {chartTitle}
            </text>

            <text y="-26" fill="#94a3b8" fontSize="9" letterSpacing="1.5">
              {language === 'ta' ? 'லஹிரி வேத முறை' : 'LAHIRI SIDEREAL'}
            </text>

            <line x1="-50" y1="-18" x2="50" y2="-18" stroke="#334155" strokeWidth="0.8" />

            {/* Native Name */}
            <text y="-3" fill="#f8fafc" fontSize="12" fontWeight="600" letterSpacing="0.5">
              {nativeName.length > 18 ? nativeName.substring(0, 16) + '..' : nativeName}
            </text>

            {/* Lagna & Moon Signs */}
            <text y="16" fill="#c084fc" fontSize="10" fontWeight="500">
              {language === 'ta' ? 'லக்னம்: ' : 'Lagna: '}
              <tspan fill="#f1f5f9" fontWeight="bold">
                {getTranslatedZodiac(lagna.sign, language)}
              </tspan>{' '}
              ({lagna.formattedDegree.split(' ')[1] || lagna.formattedDegree})
            </text>

            {moon && (
              <text y="32" fill="#38bdf8" fontSize="10" fontWeight="500">
                {language === 'ta' ? 'சந்திரன்: ' : 'Moon: '}
                <tspan fill="#f1f5f9" fontWeight="bold">
                  {getTranslatedZodiac(moon.sign, language)}
                </tspan>{' '}
                ({moon.formattedDegree})
              </text>
            )}

            <text y="48" fill="#64748b" fontSize="8.5" fontStyle="italic">
              {language === 'ta' ? 'தென்னிந்திய ராசி சக்கரம்' : 'South Indian Fixed Zodiac'}
            </text>
          </g>

          {/* 3. Render 12 House Boxes */}
          {SOUTH_INDIAN_BOXES.map((box) => {
            const x = box.col * cellSize;
            const y = box.row * cellSize;
            const isLagnaBox = box.sign.toLowerCase() === lagna.sign.toLowerCase();
            const houseNumber = ((box.signIndex - lagnaSignIndex + 12) % 12) + 1;
            const isHovered = hoveredBox === box.signIndex;

            // Find planets in this sign
            const boxPlanets = planets.filter(
              (p) => p.sign.toLowerCase() === box.sign.toLowerCase()
            );

            return (
              <g
                key={box.sign}
                transform={`translate(${x}, ${y})`}
                className="pointer-events-none"
              >
                {/* Box Background */}
                <rect
                  x={1}
                  y={1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={isLagnaBox ? 'url(#lagnaHighlight)' : isHovered ? '#1e293b' : 'url(#boxGradient)'}
                  stroke={isLagnaBox ? '#a855f7' : isHovered ? '#64748b' : '#334155'}
                  strokeWidth={isLagnaBox ? '2' : '1'}
                  onMouseEnter={() => setHoveredBox(box.signIndex)}
                  onMouseLeave={() => setHoveredBox(null)}
                  className="pointer-events-auto cursor-pointer"
                />

                {/* Lagna Corner Diagonal Ribbon Marker (Traditional) */}
                {isLagnaBox && (
                  <path
                    d={`M 1 1 L 28 1 L 1 28 Z`}
                    fill="#a855f7"
                    opacity="0.8"
                  />
                )}

                {/* Sign Label (e.g. MESHA / ARI or மேஷம்) */}
                <text
                  x={isLagnaBox ? 32 : 6}
                  y={12}
                  fill="#64748b"
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="0.5"
                >
                  {language === 'ta' ? box.tamil : `${box.abbr} • ${box.sanskrit}`}
                </text>

                {/* House Number relative to Lagna (H1 - H12) */}
                <text
                  x={cellSize - 7}
                  y={12}
                  fill={isLagnaBox ? '#fbbf24' : '#64748b'}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {isLagnaBox ? (language === 'ta' ? 'லக்' : 'ASC • H1') : `H${houseNumber}`}
                </text>

                {/* Lagna Identifier inside the box */}
                {isLagnaBox && (
                  <g transform="translate(6, 26)">
                    <rect
                      x="0"
                      y="-8"
                      width={language === 'ta' ? 44 : 54}
                      height="13"
                      rx="3"
                      fill="#9333ea"
                      opacity="0.3"
                      stroke="#c084fc"
                      strokeWidth="0.7"
                    />
                    <text
                      x={language === 'ta' ? 22 : 27}
                      y="1.5"
                      fill="#fef08a"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {language === 'ta' ? 'லக்னம்' : 'LAGNA'}
                    </text>
                  </g>
                )}

                {/* List of Planets residing in this House/Sign */}
                <g transform={`translate(6, ${isLagnaBox ? 44 : 26})`}>
                  {boxPlanets.length === 0 ? (
                    <text x="3" y="14" fill="#334155" fontSize="9" fontStyle="italic">
                      -
                    </text>
                  ) : (
                    boxPlanets.map((planet, pIdx) => {
                      // Compact 2-column if 4 or more planets in one sign (stellium)
                      const isMultiCol = boxPlanets.length >= 4;
                      const colX = isMultiCol && pIdx >= 3 ? 50 : 0;
                      const rowY = (isMultiCol && pIdx >= 3 ? pIdx - 3 : pIdx) * 15;

                      const glyph = glyphMap[planet.name] || planet.name.substring(0, 2);
                      const color = PLANET_COLORS[planet.name] || '#e2e8f0';

                      return (
                        <g key={planet.name} transform={`translate(${colX}, ${rowY})`}>
                          {/* Planet Symbol & Name */}
                          <text
                            x="2"
                            y="8"
                            fill={color}
                            fontSize="9.5"
                            fontWeight="bold"
                          >
                            {glyph}
                          </text>

                          {/* Degree */}
                          <text
                            x={isMultiCol ? 34 : 44}
                            y="8"
                            fill="#cbd5e1"
                            fontSize="8.5"
                            fontFamily="monospace"
                          >
                            {Math.floor(planet.signDegree)}°{Math.floor((planet.signDegree % 1) * 60).toString().padStart(2, '0')}'
                          </text>

                          {/* Retrograde Tag (R) */}
                          {planet.isRetrograde && (
                            <text
                              x={isMultiCol ? 45 : 82}
                              y="8"
                              fill="#f43f5e"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              (R)
                            </text>
                          )}
                        </g>
                      );
                    })
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stable, Fixed-Height Interactive Footer Bar (Prevents Layout Shifting & Lag) */}
      <div className="w-full max-w-[500px] sm:max-w-[520px] h-8 mt-2 flex items-center justify-center text-center text-xs px-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md overflow-hidden transition-colors">
        {hoveredBox !== null ? (
          (() => {
            const box = SOUTH_INDIAN_BOXES.find((b) => b.signIndex === hoveredBox);
            if (!box) return null;
            const hNum = ((box.signIndex - lagnaSignIndex + 12) % 12) + 1;
            const inSign = safePlanets.filter((p) => p.sign.toLowerCase() === box.sign.toLowerCase());
            return (
              <p className="truncate min-w-0 max-w-full text-slate-200">
                <span className="text-amber-300 font-semibold">{box.sign} ({language === 'ta' ? box.tamil : box.sanskrit})</span>:
                <span className="text-purple-300 font-medium ml-1">H{hNum} - {BHAVA_NAMES[hNum]}</span>
                {inSign.length > 0 && (
                  <span className="text-slate-400 ml-1.5 font-mono">
                    • {inSign.map((p) => `${p.name} ${Math.floor(p.signDegree)}°`).join(', ')}
                  </span>
                )}
              </p>
            );
          })()
        ) : (
          <p className="text-[11px] text-slate-500 truncate min-w-0 max-w-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
            {language === 'ta'
              ? 'விவரங்களை காண ஏதேனும் வீட்டின் மேல் சுட்டியை நகர்த்தவும்'
              : 'Hover over any house box to inspect bhava & planets'}
          </p>
        )}
      </div>
    </div>
  );
};
