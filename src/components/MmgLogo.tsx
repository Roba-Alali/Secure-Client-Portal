import React from 'react';

interface MmgLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge' | 'minimal';
  showTagline?: boolean;
  className?: string;
}

export const MmgEmblemSvg: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} drop-shadow-[0_4px_12px_rgba(228,1,7,0.35)] shrink-0 transition-transform`}
  >
    <defs>
      {/* Top Facet - High Intensity Crimson */}
      <linearGradient id="mmg-facet-top" x1="18" y1="14" x2="82" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff4b4f" />
        <stop offset="100%" stopColor="#E40107" />
      </linearGradient>
      {/* Left Front Facet - Deep Ruby */}
      <linearGradient id="mmg-facet-left" x1="18" y1="32" x2="50" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E40107" />
        <stop offset="100%" stopColor="#b80005" />
      </linearGradient>
      {/* Right Front Facet - Shadow Wine */}
      <linearGradient id="mmg-facet-right" x1="50" y1="48" x2="82" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#b80005" />
        <stop offset="100%" stopColor="#7a0004" />
      </linearGradient>
      {/* Specular Edge Glow */}
      <linearGradient id="mmg-edge-glow" x1="50" y1="14" x2="50" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ff4b4f" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Facet 1: Top Diamond */}
    <path
      d="M50 14 L84 33 L50 50 L16 33 Z"
      fill="url(#mmg-facet-top)"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Facet 2: Left Side */}
    <path
      d="M16 33 L50 50 L50 88 L16 70 Z"
      fill="url(#mmg-facet-left)"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Facet 3: Right Side */}
    <path
      d="M50 50 L84 33 L84 70 L50 88 Z"
      fill="url(#mmg-facet-right)"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Central Ridge Highlight */}
    <path
      d="M50 14 L50 88"
      stroke="url(#mmg-edge-glow)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MmgLogo: React.FC<MmgLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = ''
}) => {
  // Size mapping
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  const titleSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }[size];

  const subSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  }[size];

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <MmgEmblemSvg className={iconSizes} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Polyhedron MMG Mark */}
      <MmgEmblemSvg className={iconSizes} />

      {/* Typography block */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-2">
          <span className={`font-black text-white tracking-tight font-sans ${titleSizes}`}>
            MMG
          </span>
          <span className="text-[10px] bg-[#E40107] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm shadow-red-950">
            VIP
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`font-bold text-zinc-200 tracking-wider uppercase font-sans ${subSizes}`}>
            Modern Media Global
          </span>
        </div>

        {(variant === 'badge' || showTagline) && (
          <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5">
            Strategic Marketing Communication Holding Company
          </span>
        )}
      </div>
    </div>
  );
};
