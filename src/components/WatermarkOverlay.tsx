import React, { useMemo, useState, useEffect } from 'react';
import { WatermarkConfig } from '../types';
import { Shield, Lock } from 'lucide-react';

interface WatermarkOverlayProps {
  config: WatermarkConfig;
  clientEmail: string;
  clientName?: string;
  clientIp?: string;
  documentTitle?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  config,
  clientEmail,
  clientName = 'Client',
  clientIp = '197.34.12.88',
  documentTitle = ''
}) => {
  if (!config.enabled) return null;

  // Real-time second counter for non-falsifiable watermark
  const [liveSeconds, setLiveSeconds] = useState(new Date().getSeconds());
  
  // Coordinates for wandering anti-crop floating watermark
  const [pillCoords, setPillCoords] = useState({ top: 35, left: 45 });

  useEffect(() => {
    const secTimer = setInterval(() => {
      setLiveSeconds(new Date().getSeconds());
    }, 1000);

    // Reposition wandering anti-crop watermark pill every 3.5 seconds
    const moveTimer = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 60) + 15; // 15% to 75%
      const randomLeft = Math.floor(Math.random() * 60) + 15; // 15% to 75%
      setPillCoords({ top: randomTop, left: randomLeft });
    }, 3500);

    return () => {
      clearInterval(secTimer);
      clearInterval(moveTimer);
    };
  }, []);

  const watermarkText = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA') + ' ' + now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let text = config.template || '{email} | {ip} | {date}';
    text = text.replace(/{email}/g, clientEmail);
    text = text.replace(/{ip}/g, clientIp);
    text = text.replace(/{date}/g, dateStr);
    text = text.replace(/{name}/g, clientName);
    text = text.replace(/{doc}/g, documentTitle);
    return text;
  }, [config.template, clientEmail, clientIp, clientName, documentTitle, liveSeconds]);

  // Determine grid density
  const gridCount = config.density === 'high' ? 16 : config.density === 'low' ? 6 : 9;
  const items = useMemo(() => Array.from({ length: gridCount }), [gridCount]);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Diagonal Watermark Matrix */}
      <div
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: config.density === 'high' ? 'repeat(4, 1fr)' : config.density === 'low' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gridTemplateRows: config.density === 'high' ? 'repeat(4, 1fr)' : config.density === 'low' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
          padding: '16px'
        }}
      >
        {items.map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center p-3 transition-transform duration-1000 ${
              config.driftAnimation ? 'animate-pulse' : ''
            }`}
            style={{
              transform: `rotate(${config.rotation}deg)`,
              opacity: config.opacity,
              color: config.color || '#E40107',
              fontSize: `${config.fontSize}px`,
              fontWeight: 700,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              letterSpacing: '0.04em',
              direction: 'ltr',
              textAlign: 'center',
              lineHeight: 1.4
            }}
          >
            <div className="bg-zinc-950/40 backdrop-blur-[1px] px-3 py-1.5 rounded-lg border border-red-500/10 shadow-sm whitespace-normal max-w-[280px]">
              {watermarkText}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Dynamic Wandering Anti-Crop Floating Watermark Pill */}
      {/* Impossible to crop out on mobile screens because it drifts across the document */}
      {config.dynamicFloatingPill !== false && (
        <div
          className="absolute z-40 transition-all duration-1000 ease-in-out pointer-events-none"
          style={{
            top: `${pillCoords.top}%`,
            left: `${pillCoords.left}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/85 border border-[#E40107]/50 shadow-2xl backdrop-blur-md text-[11px] font-mono font-bold text-white whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#E40107] animate-ping" />
            <Shield className="w-3.5 h-3.5 text-[#ff4b4f]" />
            <span className="text-[#ff4b4f]">MMG VIP</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-200">{clientEmail}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-amber-400">IP: {clientIp}</span>
            <span className="text-zinc-500">[{liveSeconds}s]</span>
          </div>
        </div>
      )}

      {/* 3. Four-Corner Anti-Crop Security Micro-Stamps */}
      {config.antiCropCornerStamps !== false && (
        <>
          <div className="absolute top-2 left-2 z-30 text-[9px] font-mono text-zinc-500/80 bg-black/50 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
            MMG-VIP • {clientIp} • CONFIDENTIAL
          </div>
          <div className="absolute top-2 right-2 z-30 text-[9px] font-mono text-zinc-500/80 bg-black/50 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
            DO NOT CAPTURE • {clientEmail}
          </div>
          <div className="absolute bottom-2 left-2 z-30 text-[9px] font-mono text-zinc-500/80 bg-black/50 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
            PROTECTED ASSET • MMG VIP DRM
          </div>
          <div className="absolute bottom-2 right-2 z-30 text-[9px] font-mono text-zinc-500/80 bg-black/50 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
            AUDIT LOGGED • {clientName}
          </div>
        </>
      )}
    </div>
  );
};
