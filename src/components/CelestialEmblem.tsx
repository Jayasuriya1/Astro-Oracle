import React from 'react';

export const CelestialEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = ''
}) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-900/30 to-slate-950 border border-amber-400/35 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/20 group cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-md group-hover:bg-amber-400/25 transition-all duration-500 pointer-events-none" />

      {/* Intricate Astrolabe Sacred Geometry SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-[82%] h-[82%] transform group-hover:rotate-45 transition-transform duration-700 ease-out"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8db" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Outer Zodiac / Ephemeris Ring with Celestial Degree Ticks */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#goldSheen)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          className="opacity-80"
        />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="url(#goldSheen)"
          strokeWidth="0.8"
          className="opacity-60"
        />

        {/* Intersecting Elliptical Orbits */}
        <ellipse
          cx="50"
          cy="50"
          rx="38"
          ry="15"
          stroke="url(#goldSheen)"
          strokeWidth="1"
          transform="rotate(30 50 50)"
          className="opacity-70"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="38"
          ry="15"
          stroke="url(#goldSheen)"
          strokeWidth="1"
          transform="rotate(-30 50 50)"
          className="opacity-70"
        />

        {/* 8-Point Octagram Golden Star of Celestial Wisdom */}
        <polygon
          points="50,14 53,38 77,41 57,53 66,76 50,62 34,76 43,53 23,41 47,38"
          fill="url(#goldSheen)"
          className="opacity-95 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
        />

        {/* Glowing Sacred Center Core */}
        <circle
          cx="50"
          cy="50"
          r="7"
          fill="url(#coreGlow)"
          className="animate-pulse shadow-lg"
        />
        <circle
          cx="50"
          cy="50"
          r="3"
          fill="#ffffff"
          className="shadow-sm"
        />
      </svg>
    </div>
  );
};
