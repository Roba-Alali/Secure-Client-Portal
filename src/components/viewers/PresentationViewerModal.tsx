import React, { useState, useEffect } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import {
  X,
  ChevronRight,
  ChevronLeft,
  PieChart,
  Lock,
  Clock,
  Presentation,
  ShieldCheck,
  Maximize2
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
  const slides = document.slides || [
    {
      title: document.title,
      subtitle: document.description,
      content: ['الهدف الاستراتيجي الأول', 'مؤشرات التنفيذ والأداء', 'المعالم الزمنية المستهدفة']
    }
  ];

  const totalSlides = slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    const alertNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: 'استعراض عرض تقديمي محمي',
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
      id: `view-${Date.now()}`,
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
      fileType: 'presentation',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: secondsSpent,
      pagesViewed: currentSlide + 1,
      maxPageReached: currentSlide + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | ${client.ipAddress || '197.34.12.88'}`
    };
    onRecordView(finalLog);
    onClose();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      id="presentation-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              {document.title}
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> محمي
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              شريحة {currentSlide + 1} من {totalSlides} • {client.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">
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

      {/* Main Slide Presentation Stage */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-slate-900/50">
        <div className="relative w-full max-w-4xl aspect-[16/10] bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col justify-between p-8 md:p-12">
          {/* Dynamic Watermark Overlay */}
          <WatermarkOverlay
            config={watermarkConfig}
            clientEmail={client.email}
            clientName={client.name}
            clientIp={client.ipAddress || '197.34.12.88'}
            documentTitle={document.title}
          />

          {/* Slide Top Banner */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <PieChart className="w-4 h-4" />
              <span>PRESENTATION SLIDE {currentSlide + 1}</span>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
              {client.email}
            </div>
          </div>

          {/* Slide Body */}
          <div className="my-auto py-6">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-relaxed">
              {currentSlideData.title}
            </h1>
            <p className="text-base text-slate-300 mb-8 font-medium">
              {currentSlideData.subtitle}
            </p>

            <div className="space-y-3">
              {currentSlideData.content.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-slate-200 text-sm md:text-base font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>بوابة العملاء الآمنة • Namecheap Business Host</span>
            </div>
            <div className="font-mono">
              CONFIDENTIAL • {currentSlide + 1} / {totalSlides}
            </div>
          </div>
        </div>
      </div>

      {/* Presentation Control Bar */}
      <div className="h-16 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`الانتقال للشريحة ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm font-medium transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الشريحة السابقة</span>
          </button>

          <span className="font-mono text-sm px-2 text-slate-300">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-sm font-medium text-white transition-colors"
          >
            <span>الشريحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
