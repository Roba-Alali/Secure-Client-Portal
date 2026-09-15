import React, { useState } from 'react';

interface MmgLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge' | 'minimal' | 'official_image';
  showTagline?: boolean;
  className?: string;
}

export const MmgLogo: React.FC<MmgLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const [iconError, setIconError] = useState(false);

  // Height and scale mappings for actual official logo
  const logoHeights = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  }[size];

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
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  }[size];

  const subSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  }[size];

  // 1. Standalone Icon Variant (Used in compact headers, tabs, navigation)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 p-1 rounded-lg bg-white/95 border border-zinc-300 shadow-sm ${className}`}>
        <img
          src="/images/mmg-logo.png"
          alt="MMG Logo"
          className={`${iconSizes} object-contain`}
          referrerPolicy="no-referrer"
          onError={() => setIconError(true)}
        />
      </div>
    );
  }

  // 2. Pure Official Logo Image (Full high-res logo from mmglobal.vip)
  if (variant === 'official_image') {
    return (
      <div className={`flex items-center justify-center p-2 rounded-2xl bg-white/95 border border-zinc-300 shadow-md ${className}`}>
        <img
          src="/images/mmg-logo.png"
          alt="Modern Media Global - mmglobal.vip Official Logo"
          className={`${logoHeights} w-auto object-contain transition-all`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // 3. Full Brand Variant (Official Logo Image + VIP Portal typography & verified badge)
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* The Actual Official mmglobal.vip Logo Image with Crisp Backdrop */}
      <div className="relative shrink-0 flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-white/95 border border-zinc-300 shadow-md">
        <img
          src="/images/mmg-logo.png"
          alt="Modern Media Global Official Logo"
          className={`${logoHeights} w-auto max-w-[150px] sm:max-w-[200px] object-contain transition-transform hover:scale-105`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Brand & Portal Identifiers */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-2">
          <span className={`font-black text-white tracking-tight font-sans ${titleSizes}`}>
            MMG
          </span>
          <span className="text-[10px] bg-[#E40107] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm shadow-red-950/60">
            VIP
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            mmglobal.vip
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`font-bold text-zinc-200 tracking-wider uppercase font-sans ${subSizes}`}>
            Modern Media Global
          </span>
        </div>

        {(variant === 'badge' || showTagline) && (
          <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5 max-w-xs truncate">
            Strategic Marketing Communication Holding Company
          </span>
        )}
      </div>
    </div>
  );
};
