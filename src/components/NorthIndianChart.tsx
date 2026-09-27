import React, { useState } from 'react';
import type { PlanetPosition } from '../types/astrology';
import { useAstrology } from '../context/AstrologyContext';

export interface NorthIndianChartProps {
  planets: PlanetPosition[];
  lagna: {
    sign: string;
    degree: number;
    formattedDegree: string;
  };
  transitPlanets?: PlanetPosition[];
  nativeName?: string;
  chartTitle?: string;
  className?: string;
}

const ZODIAC_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
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
  Ketu: '☋ Ke'
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#fbbf24',
  Moon: '#38bdf8',
  Mars: '#f87171',
  Mercury: '#34d399',
  Jupiter: '#facc15',
  Venus: '#f472b6',
  Saturn: '#94a3b8',
  Rahu: '#c084fc',
  Ketu: '#cbd5e1'
};

// North Indian diamond coordinates & house centers (Counter-clockwise: 1 to 12)
const HOUSES_GEOMETRY = [
  { house: 1, path: 'M 200 0 L 300 100 L 200 200 L 100 100 Z', signPos: { x: 200, y: 175 }, center: { x: 200, y: 95 } },
  { house: 2, path: 'M 0 0 L 200 0 L 100 100 Z', signPos: { x: 125, y: 35 }, center: { x: 100, y: 55 } },
  { house: 3, path: 'M 0 0 L 100 100 L 0 200 Z', signPos: { x: 35, y: 125 }, center: { x: 45, y: 100 } },
  { house: 4, path: 'M 0 200 L 100 100 L 200 200 L 100 300 Z', signPos: { x: 175, y: 200 }, center: { x: 95, y: 200 } },
  { house: 5, path: 'M 0 200 L 100 300 L 0 400 Z', signPos: { x: 35, y: 275 }, center: { x: 45, y: 300 } },
  { house: 6, path: 'M 0 400 L 100 300 L 200 400 Z', signPos: { x: 125, y: 375 }, center: { x: 100, y: 345 } },
  { house: 7, path: 'M 200 200 L 300 300 L 200 400 L 100 300 Z', signPos: { x: 200, y: 225 }, center: { x: 200, y: 305 } },
  { house: 8, path: 'M 200 400 L 300 300 L 400 400 Z', signPos: { x: 275, y: 375 }, center: { x: 300, y: 345 } },
  { house: 9, path: 'M 400 200 L 300 300 L 400 400 Z', signPos: { x: 365, y: 275 }, center: { x: 355, y: 300 } },
  { house: 10, path: 'M 200 200 L 300 100 L 400 200 L 300 300 Z', signPos: { x: 225, y: 200 }, center: { x: 305, y: 200 } },
  { house: 11, path: 'M 400 0 L 400 200 L 300 100 Z', signPos: { x: 365, y: 125 }, center: { x: 355, y: 100 } },
  { house: 12, path: 'M 200 0 L 400 0 L 300 100 Z', signPos: { x: 275, y: 35 }, center: { x: 300, y: 55 } }
];

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  planets,
  lagna,
  transitPlanets = [],
  nativeName = 'Native',
  chartTitle = 'RASI (D1)',
  className = ''
}) => {
  const { inspectPlacement } = useAstrology();
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const safeLagna = lagna || { sign: 'Aries', degree: 0, formattedDegree: "0°00' Aries" };
  const safePlanets = planets || [];

  // Find Lagna sign index (0 to 11)
  const lagnaSignIndex = ZODIAC_NAMES.findIndex(
    (s) => s.toLowerCase() === (safeLagna.sign || 'Aries').toLowerCase()
  );
  const baseIndex = lagnaSignIndex >= 0 ? lagnaSignIndex : 0;

  const handleHouseClick = (houseNum: number, signName: string, housePlanets: PlanetPosition[]) => {
    if (housePlanets.length === 1) {
      const p = housePlanets[0];
      inspectPlacement(`Explain the astrological impact of ${p.name} in House ${houseNum} (${signName})`);
    } else if (housePlanets.length > 1) {
      const names = housePlanets.map((p) => p.name).join(' and ');
      inspectPlacement(`Analyze the combined planetary influence of ${names} in House ${houseNum} (${signName})`);
    } else {
      inspectPlacement(`Analyze the significance of House ${houseNum} (${signName}) placements and lord`);
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      <div className="w-full max-w-[500px] sm:max-w-[520px] aspect-square rounded-2xl p-1 sm:p-2 bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full font-sans block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            <linearGradient id="northDiamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="lagnaDiamondHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581c87" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x={1} y={1} width={398} height={398} fill="#030712" stroke="#334155" strokeWidth="1.5" rx={10} className="pointer-events-none" />

          {/* Render 12 Diamond Houses */}
          {HOUSES_GEOMETRY.map((hGeom) => {
            const houseNum = hGeom.house;
            const signIndexForHouse = (baseIndex + (houseNum - 1)) % 12;
            const signNumber = signIndexForHouse + 1; // 1 to 12
            const signName = ZODIAC_NAMES[signIndexForHouse];
            const isLagnaHouse = houseNum === 1;
            const isHovered = hoveredHouse === houseNum;

            // Planets residing in this house
            const housePlanets = safePlanets.filter((p) => p.house === houseNum || (p.sign && p.sign.toLowerCase() === signName.toLowerCase()));
            const houseTransits = transitPlanets.filter((tp) => tp.sign && tp.sign.toLowerCase() === signName.toLowerCase());

            return (
              <g key={houseNum} className="pointer-events-none">
                {/* House Shape */}
                <path
                  d={hGeom.path}
                  fill={isLagnaHouse ? 'url(#lagnaDiamondHighlight)' : isHovered ? '#1e293b' : 'url(#northDiamondGrad)'}
                  stroke={isLagnaHouse ? '#a855f7' : isHovered ? '#64748b' : '#334155'}
                  strokeWidth={isLagnaHouse ? '1.5' : '1'}
                  onMouseEnter={() => setHoveredHouse(houseNum)}
                  onMouseLeave={() => setHoveredHouse(null)}
                  onClick={() => handleHouseClick(houseNum, signName, housePlanets)}
                  className="pointer-events-auto cursor-pointer transition-colors"
                />

                {/* Sign Number */}
                <text
                  x={hGeom.signPos.x}
                  y={hGeom.signPos.y}
                  fill={isLagnaHouse ? '#fbbf24' : '#64748b'}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {signNumber}
                </text>

                {/* Lagna Marker if House 1 */}
                {isLagnaHouse && (
                  <text
                    x={hGeom.center.x}
                    y={hGeom.center.y - 20}
                    fill="#fde047"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    LAGNA {lagna.formattedDegree.split(' ')[1] || lagna.formattedDegree}
                  </text>
                )}

                {/* House Planets & Transits */}
                <g transform={`translate(${hGeom.center.x}, ${isLagnaHouse ? hGeom.center.y - 4 : hGeom.center.y - 12})`} textAnchor="middle">
                  {housePlanets.map((planet, pIdx) => {
                    const glyph = PLANET_GLYPHS[planet.name] || planet.name.substring(0, 2);
                    const color = PLANET_COLORS[planet.name] || '#e2e8f0';
                    const yOffset = pIdx * 13;

                    return (
                      <text
                        key={`natal-${planet.name}`}
                        y={yOffset}
                        fill={color}
                        fontSize="9"
                        fontWeight="600"
                      >
                        {glyph} {Math.floor(planet.signDegree)}°
                        {planet.isRetrograde && (
                          <tspan fill="#f43f5e" fontWeight="bold"> (R)</tspan>
                        )}
                      </text>
                    );
                  })}

                  {houseTransits.map((tPlanet, tIdx) => {
                    const yOffset = (housePlanets.length + tIdx) * 12;
                    const glyph = PLANET_GLYPHS[tPlanet.name] || tPlanet.name.substring(0, 2);

                    return (
                      <text
                        key={`transit-${tPlanet.name}`}
                        y={yOffset}
                        fill="#10b981"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        (T) {glyph} {Math.floor(tPlanet.signDegree)}°
                      </text>
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Central Header Tag */}
          <text
            x="200"
            y="203"
            fill="#a855f7"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="1"
            textAnchor="middle"
            opacity="0.85"
          >
            {nativeName.toUpperCase()} • {chartTitle}
          </text>
        </svg>
      </div>

      {/* Stable, Fixed-Height Interactive Footer Bar (Prevents Layout Shifting & Lag) */}
      <div className="w-full max-w-[500px] sm:max-w-[520px] h-8 mt-2 flex items-center justify-center text-center text-xs px-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md overflow-hidden transition-colors">
        {hoveredHouse !== null ? (
          (() => {
            const signIdx = (baseIndex + (hoveredHouse - 1)) % 12;
            const signName = ZODIAC_NAMES[signIdx];
            const inHouse = safePlanets.filter((p) => p.house === hoveredHouse);
            return (
              <p className="truncate min-w-0 max-w-full text-slate-200">
                <span className="text-amber-300 font-semibold">House {hoveredHouse}</span>:
                <span className="text-purple-300 ml-1 font-medium">{signName}</span>
                {inHouse.length > 0 && (
                  <span className="text-slate-400 ml-1.5 font-mono">
                    • {inHouse.map((p) => `${p.name} ${Math.floor(p.signDegree)}°`).join(', ')}
                  </span>
                )}
              </p>
            );
          })()
        ) : (
          <p className="text-[11px] text-slate-500 truncate min-w-0 max-w-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
            Hover over any diamond house to inspect placements
          </p>
        )}
      </div>
    </div>
  );
};
