import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Lock,
  Clock,
  Video,
  ShieldCheck,
  AlertCircle
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
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(90); // default seconds
  const [secondsSpent, setSecondsSpent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    const alertNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: 'مشاهدة فيديو تدريبي محمي',
      titleEn: 'Protected Video Streamed',
      message: `بدأ العميل ${client.name} مشاهدة المقطع المرئي المحمي: "${document.title}".`,
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
      id: `view-${Date.now()}`,
      documentId: document.id,
      documentTitle: document.title,
      fileType: 'video',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | ${client.ipAddress || '197.34.12.88'}`
    };

    onRecordView(initialLog, alertNotif);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    const finalLog: ViewLog = {
      id: `view-${Date.now()}`,
      documentId: document.id,
      documentTitle: document.title,
      fileType: 'video',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: secondsSpent,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | ${client.ipAddress || '197.34.12.88'}`
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
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              {document.title}
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> فيديو مشفر
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              مدة البث: {document.duration || '01:30'} • {client.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Stage with Dynamic Drift Watermark */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-950">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group">
          {/* Dynamic Watermark Layer */}
          <WatermarkOverlay
            config={watermarkConfig}
            clientEmail={client.email}
            clientName={client.name}
            clientIp={client.ipAddress || '197.34.12.88'}
            documentTitle={document.title}
          />

          {/* Floating Drift Watermark Pill (prevents corner cropping) */}
          <div className="absolute top-4 right-4 z-40 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-emerald-400 font-bold flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{client.email} • {client.ipAddress || '197.34.12.88'}</span>
          </div>

          <video
            ref={videoRef}
            src={document.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
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
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 z-30"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {/* Bottom Video Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 z-40">
            {/* Progress Bar */}
            <div
              className="w-full h-1.5 bg-slate-700/60 rounded-full mb-3 cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (!videoRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                videoRef.current.currentTime = pos * totalDuration;
              }}
            >
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
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
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="font-mono text-[11px]">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>مشغل فيديو محمي • يمنع التحميل</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
