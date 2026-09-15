import React, { useMemo } from 'react';
import { WatermarkConfig } from '../types';

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

  const watermarkText = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA') + ' ' + now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    let text = config.template || '{email} | {ip} | {date}';
    text = text.replace(/{email}/g, clientEmail);
    text = text.replace(/{ip}/g, clientIp);
    text = text.replace(/{date}/g, dateStr);
    text = text.replace(/{name}/g, clientName);
    text = text.replace(/{doc}/g, documentTitle);
    return text;
  }, [config.template, clientEmail, clientIp, clientName, documentTitle]);

  // Determine grid density
  const gridCount = config.density === 'high' ? 16 : config.density === 'low' ? 6 : 9;
  const items = useMemo(() => Array.from({ length: gridCount }), [gridCount]);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: config.density === 'high' ? 'repeat(4, 1fr)' : config.density === 'low' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gridTemplateRows: config.density === 'high' ? 'repeat(4, 1fr)' : config.density === 'low' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
        padding: '24px'
      }}
      aria-hidden="true"
    >
      {items.map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-center p-4 transition-transform duration-1000 ${
            config.driftAnimation ? 'animate-pulse' : ''
          }`}
          style={{
            transform: `rotate(${config.rotation}deg)`,
            opacity: config.opacity,
            color: config.color || '#ffffff',
            fontSize: `${config.fontSize}px`,
            fontWeight: 700,
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            letterSpacing: '0.04em',
            direction: 'ltr',
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          <div className="bg-slate-900/30 backdrop-blur-[1px] px-3 py-1.5 rounded border border-white/5 shadow-sm whitespace-normal max-w-[280px]">
            {watermarkText}
          </div>
        </div>
      ))}
    </div>
  );
};
