import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import { MmgLogo } from '../MmgLogo';
import { MobileScreenshotShield } from '../MobileScreenshotShield';
import { getFileUrlFromStorage } from '../../utils/fileStorage';
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
  FileUp,
  LayoutTemplate
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
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | null>(
    document.uploadedFileUrl && !document.uploadedFileUrl.startsWith('indexeddb://')
      ? document.uploadedFileUrl
      : null
  );
  const [viewMode, setViewMode] = useState<'original' | 'slides'>(
    document.uploadedFileUrl ? 'original' : 'slides'
  );

  useEffect(() => {
    let active = true;
    if (!resolvedFileUrl || document.uploadedFileUrl?.startsWith('indexeddb://')) {
      getFileUrlFromStorage(document.id).then((url) => {
        if (active && url) {
          setResolvedFileUrl(url);
          setViewMode('original');
        }
      });
    }
    return () => {
      active = false;
    };
  }, [document.id, resolvedFileUrl]);

  const slides = document.slides || [
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

  const handleClose = () => {
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

  const currentSlideData = slides[currentSlide];

  return (
    <div
      id="presentation-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#09090b] text-zinc-100 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 bg-[#0c0c0e]/95 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <MmgLogo size="sm" variant="icon" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              {document.title}
              <span className="bg-[#E40107]/15 text-[#ff4b4f] text-xs px-2 py-0.5 rounded border border-[#E40107]/30 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> MMG VIP محمي
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              شريحة {currentSlide + 1} من {totalSlides} • {client.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {resolvedFileUrl && (
            <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'original'
                    ? 'bg-[#E40107] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="عرض المستند/العرض المرفوع الأصلي"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>الملف المرفوع</span>
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'slides'
                    ? 'bg-[#E40107] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="عرض شرائح MMG"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>شرائح MMG</span>
              </button>
            </div>
          )}

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

      {/* Main Slide Presentation Stage with Mobile Screenshot Shield */}
      <div className="flex-1 relative overflow-hidden bg-[#09090b]/90">
        <MobileScreenshotShield
          clientName={client.name}
          clientEmail={client.email}
          clientIp={client.ipAddress || '197.34.12.88'}
          documentTitle={document.title}
          enabled={watermarkConfig.mobileScreenshotShield !== false}
        >
          <div className="w-full h-full flex items-center justify-center p-4 md:p-10 overflow-auto">
            {viewMode === 'original' && resolvedFileUrl ? (
              <div className="relative w-full max-w-5xl h-[82vh] bg-[#121216] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                <WatermarkOverlay
                  config={watermarkConfig}
                  clientEmail={client.email}
                  clientName={client.name}
                  clientIp={client.ipAddress || '197.34.12.88'}
                  documentTitle={document.title}
                />

                {document.mimeType?.startsWith('image/') ||
                document.originalFileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i) ||
                resolvedFileUrl.startsWith('data:image/') ? (
                  <div className="p-4 flex items-center justify-center w-full h-full">
                    <img
                      src={resolvedFileUrl}
                      alt={document.title}
                      className="max-h-[78vh] w-auto max-w-full object-contain rounded-lg shadow-xl select-none"
                    />
                  </div>
                ) : (
                  <object
                    data={`${resolvedFileUrl}#toolbar=0&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full border-0 rounded-2xl"
                  >
                    <iframe
                      src={`${resolvedFileUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-0 rounded-2xl bg-white"
                      title={document.title}
                    />
                  </object>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-4xl aspect-[16/10] bg-[#121216] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col justify-between p-8 md:p-12">
                {/* Dynamic Watermark Overlay */}
                <WatermarkOverlay
                  config={watermarkConfig}
                  clientEmail={client.email}
                  clientName={client.name}
                  clientIp={client.ipAddress || '197.34.12.88'}
                  documentTitle={document.title}
                />

                {/* Slide Top Banner */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2 text-xs text-[#ff4b4f] font-bold uppercase tracking-wider">
                    <PieChart className="w-4 h-4 text-[#E40107]" />
                    <span>MMG PRESENTATION • SLIDE {currentSlide + 1}</span>
                    {document.originalFileName && (
                      <span className="hidden sm:inline-block text-[10px] text-zinc-400 font-normal lowercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        ({document.originalFileName})
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                    {client.email}
                  </div>
                </div>

                {/* Slide Body */}
                <div className="my-auto py-6">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-relaxed font-sans">
                    {currentSlideData.title}
                  </h1>
                  <p className="text-base text-zinc-300 mb-8 font-medium">
                    {currentSlideData.subtitle}
                  </p>

                  <div className="space-y-3">
                    {currentSlideData.content.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                        <div className="w-6 h-6 rounded-full bg-[#E40107]/20 text-[#ff4b4f] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#E40107]/30">
                          {idx + 1}
                        </div>
                        <span className="text-zinc-200 text-sm md:text-base font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#E40107]" />
                    <span>بوابة MMG VIP الآمنة • Modern Media Global (mmglobal.vip)</span>
                  </div>
                  <div className="font-mono text-zinc-400">
                    CONFIDENTIAL • {currentSlide + 1} / {totalSlides}
                  </div>
                </div>
              </div>
            )}
          </div>
        </MobileScreenshotShield>
      </div>

      {/* Presentation Control Bar */}
      <div className="h-16 border-t border-zinc-800 bg-[#0c0c0e] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-[#E40107]'
                  : 'w-2 bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={`الانتقال للشريحة ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-sm font-medium border border-zinc-800 transition-colors text-zinc-200"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الشريحة السابقة</span>
          </button>

          <span className="font-mono text-sm px-2 text-zinc-300">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E40107] hover:bg-[#c90005] disabled:opacity-30 text-sm font-medium text-white transition-colors shadow-lg shadow-red-950/40"
          >
            <span>الشريحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
