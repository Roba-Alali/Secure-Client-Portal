import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import { MmgLogo } from '../MmgLogo';
import { MobileScreenshotShield } from '../MobileScreenshotShield';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  Lock,
  Clock,
  Video,
  AlertTriangle
} from 'lucide-react';

interface VideoViewerModalProps {
  document: DocumentItem;
  client: ClientUser;
  watermarkConfig: WatermarkConfig;
  onClose: () => void;
  onRecordView: (log: ViewLog, notification?: AdminNotification) => void;
}

export const VideoViewerModal: React.FC<VideoViewerModalProps> = ({
  document,
  client,
  watermarkConfig,
  onClose,
  onRecordView
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(90);
  const [isMuted, setIsMuted] = useState(false);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasRecordedInitialView = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    if (!hasRecordedInitialView.current) {
      hasRecordedInitialView.current = true;
      const uniqueSuffix = Math.random().toString(36).substring(2, 9);
      const alertNotif: AdminNotification = {
        id: `notif-${Date.now()}-${uniqueSuffix}`,
        title: 'مشاهدة فيديو إعلامي محمي لـ MMG',
        titleEn: 'Protected Video Stream Opened',
        message: `بدأ العميل ${client.name} مشاهدة البث المحمي: "${document.title}".`,
        messageEn: `Client ${client.name} began streaming protected video "${document.title}".`,
        type: 'view',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
        metadata: {
          clientId: client.id,
          documentId: document.id
        }
      };

      const initialLog: ViewLog = {
        id: `view-${Date.now()}-${uniqueSuffix}`,
        documentId: document.id,
        documentTitle: document.title,
        fileType: 'video',
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        ipAddress: client.ipAddress || '197.34.12.88',
        durationSeconds: 1,
        pagesViewed: 1,
        maxPageReached: 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        watermarkApplied: `${client.email} | MMG VIP`
      };

      onRecordView(initialLog, alertNotif);
    }

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const finalLog: ViewLog = {
      id: `view-${Date.now()}-${uniqueSuffix}`,
      documentId: document.id,
      documentTitle: document.title,
      fileType: 'video',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: secondsSpent,
      pagesViewed: 1,
      maxPageReached: 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | MMG VIP`
    };
    onRecordView(finalLog);
    onClose();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setTotalDuration(videoRef.current.duration);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="video-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#09090b] text-zinc-100 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-800 bg-[#0c0c0e]/95 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <MmgLogo size="sm" variant="icon" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              {document.title}
              <span className="bg-[#E40107]/15 text-[#ff4b4f] text-xs px-2 py-0.5 rounded border border-[#E40107]/30 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> MMG VIP مشفر
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              مدة البث: {document.duration || '01:30'} • {client.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-[#E40107]/10 text-[#ff4b4f] px-3 py-1.5 rounded-xl border border-[#E40107]/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-[#E40107]/20 hover:text-[#ff4b4f] text-zinc-400 border border-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Stage with Dynamic Drift Watermark and Mobile Screenshot Shield */}
      <div className="flex-1 relative overflow-hidden bg-[#09090b]/90">
        <MobileScreenshotShield
          clientName={client.name}
          clientEmail={client.email}
          clientIp={client.ipAddress || '197.34.12.88'}
          documentTitle={document.title}
          enabled={watermarkConfig.mobileScreenshotShield !== false}
        >
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-auto">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden group">
          {/* Dynamic Watermark Layer */}
          <WatermarkOverlay
            config={watermarkConfig}
            clientEmail={client.email}
            clientName={client.name}
            clientIp={client.ipAddress || '197.34.12.88'}
            documentTitle={document.title}
          />

          {/* Discreet Static Security Badge (Clean, NO IP) */}
          <div className="absolute top-4 right-4 z-40 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#E40107]/30 text-xs font-mono text-[#ff4b4f] font-bold flex items-center gap-2 pointer-events-none shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E40107] animate-pulse" />
            <span>MMG VIP • {client.email}</span>
          </div>

          <video
            ref={videoRef}
            src={document.uploadedFileUrl || document.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
            controls={false}
          />

          {/* Big Center Play Button if paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#E40107] hover:bg-[#c90005] text-white flex items-center justify-center shadow-2xl shadow-red-950/80 transition-all transform hover:scale-105 z-30 border border-red-400/40"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {/* Bottom Video Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent p-4 z-40">
            {/* Progress Bar */}
            <div
              className="w-full h-1.5 bg-zinc-800 rounded-full mb-3 cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (!videoRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = pos * totalDuration;
              }}
            >
              <div
                className="h-full bg-[#E40107] transition-all"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="font-mono text-[11px] text-zinc-400">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E40107]" />
                <span>مشغل وسائط MMG المحمي • تشفير البث المباشر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileScreenshotShield>
  </div>
</div>
  );
};
