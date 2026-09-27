import React, { useState } from 'react';
import type { PlanetPosition, HouseCusp, Aspect, WesternChart } from '../types/astrology';
import { useAstrology } from '../context/AstrologyContext';

export interface WesternWheelProps {
  planets?: PlanetPosition[];
  houses?: HouseCusp[];
  aspects?: Aspect[];
  ascendant?: {
    sign: string;
    degree: number;
    formattedDegree: string;
  };
  midheaven?: {
    sign: string;
    degree: number;
    formattedDegree: string;
  };
  tropicalChart?: WesternChart;
  nativeName?: string;
  className?: string;
}

const ZODIAC_SIGNS_DATA = [
  { sign: 'Aries', symbol: '♈', element: 'fire', color: '#f87171' },
  { sign: 'Taurus', symbol: '♉', element: 'earth', color: '#34d399' },
  { sign: 'Gemini', symbol: '♊', element: 'air', color: '#facc15' },
  { sign: 'Cancer', symbol: '♋', element: 'water', color: '#60a5fa' },
  { sign: 'Leo', symbol: '♌', element: 'fire', color: '#fb923c' },
  { sign: 'Virgo', symbol: '♍', element: 'earth', color: '#2dd4bf' },
  { sign: 'Libra', symbol: '♎', element: 'air', color: '#e879f9' },
  { sign: 'Scorpio', symbol: '♏', element: 'water', color: '#c084fc' },
  { sign: 'Sagittarius', symbol: '♐', element: 'fire', color: '#f97316' },
  { sign: 'Capricorn', symbol: '♑', element: 'earth', color: '#a3e635' },
  { sign: 'Aquarius', symbol: '♒', element: 'air', color: '#38bdf8' },
  { sign: 'Pisces', symbol: '♓', element: 'water', color: '#818cf8' }
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Rahu: '☊',
  Ketu: '☋'
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#fbbf24',
  Moon: '#38bdf8',
  Mercury: '#34d399',
  Venus: '#f472b6',
  Mars: '#f87171',
  Jupiter: '#facc15',
  Saturn: '#94a3b8',
  Uranus: '#22d3ee',
  Neptune: '#818cf8',
  Pluto: '#c084fc',
  Rahu: '#e879f9',
  Ketu: '#cbd5e1'
};

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: '#fbbf24',
  Sextile: '#34d399',
  Square: '#f43f5e',
  Trine: '#38bdf8',
  Opposition: '#fb923c'
};

export const WesternWheel: React.FC<WesternWheelProps> = ({
  planets: propsPlanets,
  houses: propsHouses,
  aspects: propsAspects,
  ascendant: propsAscendant,
  midheaven: propsMidheaven,
  tropicalChart,
  nativeName = 'Native',
  className = ''
}) => {
  const { inspectPlacement } = useAstrology();
  const planets = propsPlanets || tropicalChart?.planets || [];
  const houses = propsHouses || tropicalChart?.houses || [];
  const aspects = propsAspects || tropicalChart?.aspects || [];
  const ascendant = propsAscendant || tropicalChart?.ascendant || { sign: 'Aries', degree: 0, formattedDegree: "0°00' Aries" };
  const midheaven = propsMidheaven || tropicalChart?.midheaven || { sign: 'Capricorn', degree: 270, formattedDegree: "0°00' Capricorn" };

  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const cx = 220;
  const cy = 220;
  const rOuter = 205;
  const rZodiac = 175;
  const rHouses = 135;
  const rAspects = 100;

  const ascDeg = ascendant.degree;

  // Convert absolute zodiac longitude (0-360°) to SVG coordinate
  const lonToCoords = (lon: number, radius: number) => {
    // Ascendant fixed at 180° (9 o'clock position)
    const angleDeg = 180 - (lon - ascDeg);
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
      angleDeg
    };
  };

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      <div className="w-full max-w-[500px] sm:max-w-[520px] aspect-square rounded-2xl p-1 sm:p-2 bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <svg
          viewBox="0 0 440 440"
          className="w-full h-full font-sans block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            <radialGradient id="wheelCenterGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Wheel Background */}
          <rect x={1} y={1} width={438} height={438} fill="#030712" stroke="#334155" strokeWidth="1" rx={12} />

          {/* 1. Zodiac Arcs (Outer Wheel) */}
          {ZODIAC_SIGNS_DATA.map((z, idx) => {
            const startLon = idx * 30;
            const endLon = (idx + 1) * 30;
            const midLon = startLon + 15;

            const p1 = lonToCoords(startLon, rOuter);
            const p2 = lonToCoords(endLon, rOuter);
            const p3 = lonToCoords(endLon, rZodiac);
            const p4 = lonToCoords(startLon, rZodiac);
            const midP = lonToCoords(midLon, (rOuter + rZodiac) / 2);

            const path = `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rZodiac} ${rZodiac} 0 0 1 ${p4.x} ${p4.y} Z`;

            return (
              <g key={z.sign}>
                <path d={path} fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text
                  x={midP.x}
                  y={midP.y}
                  fill={z.color}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {z.symbol}
                </text>
              </g>
            );
          })}

          {/* 2. Placidus House Cusps */}
          {houses.map((house) => {
            const innerP = lonToCoords(house.degree, rAspects);
            const outerP = lonToCoords(house.degree, rZodiac);
            const isAxis = house.house === 1 || house.house === 7 || house.house === 4 || house.house === 10;

            return (
              <g key={house.house}>
                <line
                  x1={innerP.x}
                  y1={innerP.y}
                  x2={outerP.x}
                  y2={outerP.y}
                  stroke={isAxis ? '#a855f7' : '#334155'}
                  strokeWidth={isAxis ? '1.8' : '0.8'}
                  strokeDasharray={isAxis ? 'none' : '2 2'}
                />
              </g>
            );
          })}

          {/* House Numbers */}
          {houses.map((house) => {
            const nextH = house.house === 12 ? 1 : house.house + 1;
            const nextCusp = houses.find((h) => h.house === nextH)?.degree || house.degree + 30;
            const midHouseDeg = house.degree + ((nextCusp - house.degree + 360) % 360) / 2;
            const houseNumP = lonToCoords(midHouseDeg, (rHouses + rAspects) / 2);

            return (
              <text
                key={`num-${house.house}`}
                x={houseNumP.x}
                y={houseNumP.y}
                fill="#64748b"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {house.house}
              </text>
            );
          })}

          {/* 3. Center Aspect Circle */}
          <circle cx={cx} cy={cy} r={rAspects} fill="url(#wheelCenterGrad)" stroke="#334155" strokeWidth="1" />

          {/* 4. Aspect Lines inside Center Circle */}
          {aspects.map((asp, idx) => {
            const p1 = planets.find((p) => p.name === asp.planet1);
            const p2 = planets.find((p) => p.name === asp.planet2);
            if (!p1 || !p2) return null;

            const c1 = lonToCoords(p1.longitude, rAspects);
            const c2 = lonToCoords(p2.longitude, rAspects);
            const strokeColor = ASPECT_COLORS[asp.aspectType] || '#94a3b8';
            const isHovered = hoveredPlanet === p1.name || hoveredPlanet === p2.name;

            return (
              <line
                key={`asp-${idx}`}
                x1={c1.x}
                y1={c1.y}
                x2={c2.x}
                y2={c2.y}
                stroke={strokeColor}
                strokeWidth={isHovered ? '2' : '1'}
                strokeOpacity={isHovered ? 1 : 0.6}
              />
            );
          })}

          {/* 5. Plotted Planets */}
          {planets.map((planet) => {
            const pCoord = lonToCoords(planet.longitude, (rZodiac + rHouses) / 2);
            const glyph = PLANET_SYMBOLS[planet.name] || '•';
            const color = PLANET_COLORS[planet.name] || '#f1f5f9';
            const isHovered = hoveredPlanet === planet.name;

            return (
              <g
                key={planet.name}
                transform={`translate(${pCoord.x}, ${pCoord.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPlanet(planet.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onClick={() => inspectPlacement(`Explain the psychological impact of ${planet.name} in ${planet.sign} (House ${planet.house}) in my Western chart`)}
              >
                <circle
                  r={isHovered ? 9 : 7.5}
                  fill="#090d16"
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <text
                  fill={color}
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {glyph}
                </text>
              </g>
            );
          })}

          {/* Solid Hub Background Circle to prevent aspect line collision */}
          <circle cx={cx} cy={cy} r={55} fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" />

          {/* Center Chart Branding */}
          <g transform={`translate(${cx}, ${cy})`} textAnchor="middle">
            <text y="-10" fill="#fbbf24" fontSize="10.5" fontWeight="bold" fontFamily="serif" letterSpacing="0.5">
              {nativeName.toUpperCase()}
            </text>
            <text y="3" fill="#94a3b8" fontSize="8" letterSpacing="0.5">
              TROPICAL • PLACIDUS
            </text>
            <text y="16" fill="#c084fc" fontSize="7.5">
              Asc: {ascendant.sign} • MC: {midheaven.sign}
            </text>
          </g>
        </svg>
      </div>

      {/* Stable, Fixed-Height Interactive Footer Bar (Prevents Layout Shifting & Lag) */}
      <div className="w-full max-w-[500px] sm:max-w-[520px] h-8 mt-2 flex items-center justify-center text-center text-xs px-3 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md overflow-hidden transition-colors">
        {hoveredPlanet ? (
          (() => {
            const pl = planets.find((p) => p.name === hoveredPlanet);
            if (!pl) return null;
            return (
              <p className="truncate min-w-0 max-w-full text-slate-200">
                <span className="text-amber-300 font-semibold">{pl.name}</span> in{' '}
                <span className="text-cyan-300 font-medium">{pl.sign} ({pl.formattedDegree})</span> • House {pl.house}
                {pl.isRetrograde && <span className="text-rose-400 font-bold ml-1">(R)</span>}
              </p>
            );
          })()
        ) : (
          <p className="text-[11px] text-slate-500 truncate min-w-0 max-w-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
            Hover over any planet node to inspect coordinates
          </p>
        )}
      </div>
    </div>
  );
};
