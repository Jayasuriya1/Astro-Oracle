import React, { useId } from 'react';

export const CelestialEmblem: React.FC<{ size?: number; className?: string }> = ({
  size,
  className = ''
}) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `emblemBgGrad_${uid}`;
  const goldId = `emblemGoldGrad_${uid}`;
  const purpleId = `emblemPurpleGrad_${uid}`;
  const glowId = `emblemGlowGrad_${uid}`;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden group cursor-pointer transition-transform hover:scale-105 flex-shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full transform group-hover:rotate-12 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={bgId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={purpleId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Base */}
        <rect width="512" height="512" rx="110" fill={`url(#${bgId})`} />
        <rect width="504" height="504" x="4" y="4" rx="106" fill="none" stroke={`url(#${goldId})`} strokeWidth="4" strokeOpacity="0.4" />

        {/* Outer Glow Circle */}
        <circle cx="256" cy="256" r="210" fill={`url(#${glowId})`} />

        {/* Celestial Zodiac Ring */}
        <circle cx="256" cy="256" r="185" fill="none" stroke={`url(#${goldId})`} strokeWidth="4" strokeDasharray="8 6" />
        <circle cx="256" cy="256" r="160" fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeOpacity="0.8" />

        {/* 8-Pointed Celestial Star Rays */}
        <g stroke={`url(#${goldId})`} strokeWidth="5" strokeLinecap="round">
          <line x1="256" y1="70" x2="256" y2="442" />
          <line x1="70" y1="256" x2="442" y2="256" />
          <line x1="125" y1="125" x2="387" y2="387" strokeWidth="3.5" strokeOpacity="0.7" />
          <line x1="387" y1="125" x2="125" y2="387" strokeWidth="3.5" strokeOpacity="0.7" />
        </g>

        {/* Mystic Crescent Moon */}
        <path d="M 275 140 A 115 115 0 1 0 372 237 A 95 95 0 1 1 275 140 Z" fill={`url(#${goldId})`} />

        {/* Inner Sparkle Star */}
        <path d="M 256 186 Q 256 256 186 256 Q 256 256 256 326 Q 256 256 326 256 Q 256 256 256 186 Z" fill={`url(#${purpleId})`} />
        <circle cx="256" cy="256" r="12" fill="#fff" />
      </svg>
    </div>
  );
};
