import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import { MmgLogo } from '../MmgLogo';
import { MobileScreenshotShield } from '../MobileScreenshotShield';
import { getFileUrlFromStorage, getFileArrayBufferFromStorage } from '../../utils/fileStorage';
import { PdfCanvasViewer } from './PdfCanvasViewer';
import {
  X,
  ChevronRight,
  ChevronLeft,
  PieChart,
  Lock,
  Clock,
  Presentation,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileUp,
  LayoutTemplate,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PresentationViewerModalProps {
  document: DocumentItem;
  client: ClientUser;
  watermarkConfig: WatermarkConfig;
  onClose: () => void;
  onRecordView: (log: ViewLog, notification?: AdminNotification) => void;
}

export const PresentationViewerModal: React.FC<PresentationViewerModalProps> = ({
  document,
  client,
  watermarkConfig,
  onClose,
  onRecordView
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileArrayBuffer, setFileArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | null>(
    document.rawBase64 ||
    (document.uploadedFileUrl && !document.uploadedFileUrl.startsWith('indexeddb://') && !document.uploadedFileUrl.startsWith('blob:')
      ? document.uploadedFileUrl
      : null)
  );

  const modalRef = useRef<HTMLDivElement>(null);

  const hasUploadedFile = !!(
    document.uploadedFileUrl ||
    document.rawBase64 ||
    fileArrayBuffer ||
    resolvedFileUrl
  );

  const [viewMode, setViewMode] = useState<'original' | 'slides'>(
    hasUploadedFile ? 'original' : 'slides'
  );

  useEffect(() => {
    let active = true;

    getFileArrayBufferFromStorage(document.id).then((ab) => {
      if (active && ab) {
        setFileArrayBuffer(ab);
        setViewMode('original');
      }
    });

    getFileUrlFromStorage(document.id).then((url) => {
      if (active && url) {
        setResolvedFileUrl(url);
        setViewMode('original');
      }
    });

    return () => {
      active = false;
    };
  }, [document.id]);

  const slides = document.slides && document.slides.length > 0 ? document.slides : [
    {
      title: document.title,
      subtitle: document.description,
      content: ['الهدف الاستراتيجي الأول لـ MMG', 'مؤشرات التنفيذ والأداء الإعلامي', 'المعالم الزمنية المستهدفة للحملة']
    }
  ];

  const totalSlides = slides.length;
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
        title: 'استعراض عرض تقديمي محمي لـ MMG',
        titleEn: 'Protected Presentation Viewed',
        message: `بدأ العميل ${client.name} استعراض شرائح العرض التقديمي: "${document.title}".`,
        messageEn: `Client ${client.name} opened presentation deck "${document.title}".`,
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
        fileType: 'presentation',
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

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        setCurrentSlide((s) => Math.max(0, s - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === ' ') {
        setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, isFullscreen]);

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!isFullscreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    if (isFullscreen && window.document.exitFullscreen) {
      window.document.exitFullscreen().catch(() => {});
    }
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const finalLog: ViewLog = {
      id: `view-${Date.now()}-${uniqueSuffix}`,
      documentId: document.id,
      documentTitle: document.title,
      fileType: 'presentation',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: secondsSpent,
      pagesViewed: currentSlide + 1,
      maxPageReached: currentSlide + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | MMG VIP`
    };
    onRecordView(finalLog);
    onClose();
  };

  const currentSlideData = slides[currentSlide] || slides[0];

  return (
    <div
      ref={modalRef}
      id="presentation-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#08080a] text-zinc-100 select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="h-16 border-b border-zinc-800/80 bg-[#0c0c0f]/95 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3.5">
          <MmgLogo size="sm" variant="icon" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>{document.title}</span>
              <span className="bg-[#E40107]/15 text-[#ff4b4f] text-[11px] px-2.5 py-0.5 rounded-full border border-[#E40107]/30 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> MMG VIP محمي
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              شريحة {currentSlide + 1} من {totalSlides} • {client.company}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Switch Mode if file exists */}
          {hasUploadedFile && (
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setViewMode('slides')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'slides'
                    ? 'bg-[#E40107] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="عرض شرائح MMG التفاعلية عالية الوضوح"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">شرائح العرض</span>
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'original'
                    ? 'bg-[#E40107] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="عرض الملف الأصلي المرفوع"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">الملف الأصلي</span>
              </button>
            </div>
          )}

          {/* Zoom Controls for High Clarity */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-1.5 py-1 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 15))}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-1.5 text-zinc-300 font-semibold min-w-[42px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800 pr-1.5"
              title="إعادة ضبط الحجم الطبيعي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Time Spent Timer */}
          <div className="flex items-center gap-2 text-xs font-mono bg-[#E40107]/10 text-[#ff4b4f] px-3 py-1.5 rounded-xl border border-[#E40107]/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}</span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-[#E40107]/20 hover:text-[#ff4b4f] text-zinc-400 border border-zinc-800 transition-colors"
            title="إغلاق العرض"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage Area */}
      <div className="flex-1 relative overflow-auto bg-[#070709] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        <MobileScreenshotShield
          clientName={client.name}
          clientEmail={client.email}
          clientIp={client.ipAddress || '197.34.12.88'}
          documentTitle={document.title}
          enabled={watermarkConfig.mobileScreenshotShield !== false}
        >
          <div
            className="w-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {viewMode === 'original' && hasUploadedFile ? (
              /* Original Uploaded Presentation (PDF / Canvas) */
              <div className="relative w-full max-w-5xl min-h-[75vh] bg-[#111115] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4">
                <WatermarkOverlay
                  config={watermarkConfig}
                  clientEmail={client.email}
                  clientName={client.name}
                  clientIp={client.ipAddress || '197.34.12.88'}
                  documentTitle={document.title}
                />

                {document.mimeType?.startsWith('image/') ||
                document.originalFileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i) ||
                (resolvedFileUrl && resolvedFileUrl.startsWith('data:image/')) ? (
                  <div className="p-4 flex items-center justify-center w-full h-full">
                    <img
                      src={resolvedFileUrl || document.rawBase64}
                      alt={document.title}
                      className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl shadow-xl select-none"
                    />
                  </div>
                ) : (
                  <div className="w-full p-2 sm:p-4 flex flex-col items-center justify-center min-h-[70vh]">
                    <PdfCanvasViewer
                      data={fileArrayBuffer}
                      url={resolvedFileUrl || document.rawBase64}
                      currentPage={currentSlide + 1}
                      zoom={zoom}
                      onLoadError={(err) => {
                        console.warn('Presentation slide render error:', err);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Full-Width, Crystal-Clear MMG Executive Presentation Deck */
              <div className="relative w-full max-w-5xl min-h-[72vh] bg-gradient-to-b from-[#131318] via-[#0f0f14] to-[#0a0a0e] rounded-3xl border border-zinc-800/90 shadow-2xl flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-visible">
                {/* Dynamic Floating Watermark */}
                <WatermarkOverlay
                  config={watermarkConfig}
                  clientEmail={client.email}
                  clientName={client.name}
                  clientIp={client.ipAddress || '197.34.12.88'}
                  documentTitle={document.title}
                />

                {/* Top Deck Banner */}
                <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-5 gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f]">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wider text-[#ff4b4f] uppercase flex items-center gap-2 font-mono">
                        <span>MODERN MEDIA GLOBAL</span>
                        <span className="text-zinc-600">•</span>
                        <span>SHARIKAH VIP DECK</span>
                      </div>
                      <div className="text-xs text-zinc-400 font-medium mt-0.5">
                        {document.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-950/90 px-3 py-1.5 rounded-xl border border-zinc-800">
                      الشريحة {currentSlide + 1} من {totalSlides}
                    </span>
                    <span className="text-xs font-mono text-[#ff4b4f] bg-red-950/50 px-3 py-1.5 rounded-xl border border-red-900/50">
                      {client.email}
                    </span>
                  </div>
                </div>

                {/* Slide Core Content - Ample Height & Crisp Contrast */}
                <div className="my-auto py-6 sm:py-8 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E40107]/15 border border-[#E40107]/30 text-[#ff4b4f] text-xs font-bold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>عرض المحتوى الاستراتيجي المعتمد</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                      {currentSlideData.title}
                    </h1>
                    {currentSlideData.subtitle && (
                      <p className="text-base sm:text-lg text-zinc-300 mt-2.5 font-medium leading-relaxed max-w-3xl">
                        {currentSlideData.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bullet Points with Crisp Cards */}
                  <div className="grid grid-cols-1 gap-3.5 pt-2">
                    {currentSlideData.content.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 bg-zinc-900/85 hover:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 transition-all shadow-md group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#E40107]/20 text-[#ff4b4f] flex items-center justify-center text-sm font-black shrink-0 mt-0.5 border border-[#E40107]/40 group-hover:bg-[#E40107] group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-100 text-sm sm:text-base md:text-lg font-semibold leading-relaxed">
                            {point}
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500/50 shrink-0 mt-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deck Footer */}
                <div className="flex flex-wrap items-center justify-between pt-5 border-t border-zinc-800/80 text-xs text-zinc-400 gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#E40107]" />
                    <span className="font-medium">
                      بوابة MMG VIP الآمنة • Modern Media Global (mmglobal.vip)
                    </span>
                  </div>
                  <div className="font-mono text-zinc-400 text-left" dir="ltr">
                    CONFIDENTIAL • DO NOT DISTRIBUTE • {currentSlide + 1} / {totalSlides}
                  </div>
                </div>
              </div>
            )}
          </div>
        </MobileScreenshotShield>
      </div>

      {/* Presentation Control Bar */}
      <div className="h-16 border-t border-zinc-800/80 bg-[#0c0c0f] px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Slide Indicator Dots / Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xs sm:max-w-md py-1">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all shrink-0 ${
                index === currentSlide
                  ? 'w-10 bg-[#E40107] shadow-lg shadow-red-950/60'
                  : 'w-2.5 bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={`الشريحة ${index + 1}: ${slide.title}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 text-sm font-semibold border border-zinc-800 transition-colors text-zinc-200"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">الشريحة السابقة</span>
          </button>

          <span className="font-mono text-xs sm:text-sm px-2 text-zinc-300 font-bold bg-zinc-950 py-1.5 rounded-lg border border-zinc-800">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E40107] hover:bg-[#c90005] disabled:opacity-30 disabled:hover:bg-[#E40107] text-sm font-semibold text-white transition-colors shadow-lg shadow-red-950/40"
          >
            <span className="hidden sm:inline">الشريحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
