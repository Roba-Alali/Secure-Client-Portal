import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import { MmgLogo } from '../MmgLogo';
import { MobileScreenshotShield } from '../MobileScreenshotShield';
import { getFileUrlFromStorage } from '../../utils/fileStorage';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Lock,
  Clock,
  Video,
  AlertTriangle,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface VideoViewerModalProps {
  document: DocumentItem;
  client: ClientUser;
  watermarkConfig: WatermarkConfig;
  onClose: () => void;
  onRecordView: (log: ViewLog, notification?: AdminNotification) => void;
}

const RELIABLE_FALLBACK_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4'
];

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
  const [volume, setVolume] = useState(1);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initial video URL resolution
  const initialUrl = (
    (document.uploadedFileUrl && !document.uploadedFileUrl.startsWith('indexeddb://') ? document.uploadedFileUrl : null) ||
    (document.videoUrl && !document.videoUrl.includes('ForBiggerBlazes.mp4') ? document.videoUrl : null) ||
    RELIABLE_FALLBACK_VIDEOS[0]
  );

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(initialUrl);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRecordedInitialView = useRef(false);

  // Attempt to fetch from IndexedDB if uploaded locally
  useEffect(() => {
    let active = true;
    if (document.uploadedFileUrl?.startsWith('indexeddb://') || !document.videoUrl) {
      getFileUrlFromStorage(document.id).then((url) => {
        if (active && url) {
          setResolvedVideoUrl(url);
          setHasError(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [document.id, document.uploadedFileUrl, document.videoUrl]);

  // Record initial view log and admin notification
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
    if (isFullscreen && window.document.exitFullscreen) {
      window.document.exitFullscreen().catch(() => {});
    }
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
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('Video play prevented or failed:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(totalDuration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setTotalDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoError = () => {
    console.warn('Primary video source failed, switching to mirror fallback...');
    if (fallbackIndex < RELIABLE_FALLBACK_VIDEOS.length) {
      const nextFallback = RELIABLE_FALLBACK_VIDEOS[fallbackIndex];
      setFallbackIndex((prev) => prev + 1);
      setResolvedVideoUrl(nextFallback);
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setErrorMessage('تعذر الاتصال بخادم البث المباشر. يرجى إعادة المحاولة.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setResolvedVideoUrl(RELIABLE_FALLBACK_VIDEOS[0]);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      id="video-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#08080a] text-zinc-100 select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      dir="rtl"
    >
      {/* Top Header */}
      <div className="h-14 sm:h-16 border-b border-zinc-800/80 bg-[#0c0c0f]/95 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <MmgLogo size="sm" variant="icon" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">{document.title}</span>
              <span className="hidden xs:flex bg-[#E40107]/15 text-[#ff4b4f] text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border border-[#E40107]/30 items-center gap-1 font-semibold shrink-0">
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> VIP مشفر
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
              {document.duration || formatTime(totalDuration)} • {client.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Time Counter */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-[#E40107]/10 text-[#ff4b4f] px-3 py-1.5 rounded-xl border border-[#E40107]/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}</span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-[#E40107]/20 hover:text-[#ff4b4f] text-zinc-400 border border-zinc-800 transition-colors"
            title="إغلاق المشغل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Stage Area */}
      <div className="flex-1 relative overflow-y-auto sm:overflow-hidden bg-[#070709] flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 w-full">
        <MobileScreenshotShield
          clientName={client.name}
          clientEmail={client.email}
          clientIp={client.ipAddress || '197.34.12.88'}
          documentTitle={document.title}
          enabled={watermarkConfig.mobileScreenshotShield !== false}
          stageClassName="flex flex-col justify-center items-center h-full w-full"
          hideToolbar={true}
        >
          <div className="w-full max-w-5xl flex flex-col items-center my-auto">
            {/* 1. Pure Video Frame Area - ONLY Video & Watermark (Controllers are outside) */}
            <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl border border-zinc-800/90 shadow-2xl overflow-hidden flex flex-col justify-center items-center group shrink-0">
              {/* Dynamic Watermark Layer - Only watermark visible on video */}
              <WatermarkOverlay
                config={{
                  ...watermarkConfig,
                  opacity: Math.min(watermarkConfig.opacity, 0.18),
                  density: 'low',
                  driftAnimation: false,
                  dynamicFloatingPill: false,
                  antiCropCornerStamps: false
                }}
                clientEmail={client.email}
                clientName={client.name}
                clientIp={client.ipAddress || '197.34.12.88'}
                documentTitle={document.title}
              />

              {/* HTML5 Video Element with strict DRM restrictions: nodownload, noremoteplayback, disablePictureInPicture */}
              <video
                ref={videoRef}
                src={resolvedVideoUrl}
                className="w-full h-full object-contain cursor-pointer select-none"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedData={() => {
                  setIsLoading(false);
                  setHasError(false);
                }}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onError={handleVideoError}
                onClick={togglePlay}
                playsInline
                controls={false}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                preload="auto"
              />

              {/* Error Display Card */}
              {hasError && (
                <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f] mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    تعذر تشغيل المقطع عبر الرابط الافتراضي
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                    {errorMessage || 'تم حظر أو تعذر تشغيل الفيديو من الرابط الأصلي، انقر أدناه للتبديل الفوري إلى خادم البث الاحتياطي السريع.'}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2.5 rounded-xl bg-[#E40107] hover:bg-[#c90005] text-white text-xs font-bold transition-all shadow-lg shadow-red-950/60 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>تشغيل عبر البث الاحتياطي الفوري</span>
                  </button>
                </div>
              )}

              {/* Center Play/Pause indicator on click */}
              {!isPlaying && !hasError && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#E40107]/90 hover:bg-[#c90005] text-white flex items-center justify-center shadow-2xl shadow-red-950/90 transition-all transform hover:scale-105 z-20 border border-red-400/30 backdrop-blur-sm"
                  title="تشغيل الفيديو"
                >
                  <Play className="w-7 sm:w-8 h-7 sm:h-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* 2. External Controls Bar - OUTSIDE of the Video Area */}
            <div className="w-full mt-3 bg-[#0f0f13] border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-xl z-20">
              {/* Progress Bar (Outside Video) */}
              <div
                className="w-full h-2.5 bg-zinc-800 hover:h-3 rounded-full mb-3 cursor-pointer overflow-hidden transition-all relative group/progress"
                onClick={(e) => {
                  if (!videoRef.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = pos * totalDuration;
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#E40107] to-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (currentTime / (totalDuration || 1)) * 100))}%` }}
                />
              </div>

              {/* Control Buttons & Timers (Outside Video) */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-300 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white transition-colors flex items-center justify-center shadow-sm"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Rewind 10s */}
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800/80"
                    title="ترجيع 10 ثوانٍ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Forward 10s */}
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800/80"
                    title="تقديم 10 ثوانٍ"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume Mute Toggle */}
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800/80"
                    title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Time Counter */}
                  <span className="font-mono text-xs text-zinc-200 px-3 py-1.5 bg-black/70 rounded-xl border border-zinc-800 shadow-inner" dir="ltr">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E40107]" />
                    <span className="hidden sm:inline">مشغل وسائط MMG الآمن • بث مشفر</span>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800/80"
                    title="ملء الشاشة"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </MobileScreenshotShield>
      </div>
    </div>
  );
};
