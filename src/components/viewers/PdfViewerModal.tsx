import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
import { MmgLogo } from '../MmgLogo';
import { MobileScreenshotShield } from '../MobileScreenshotShield';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  Lock,
  Eye,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface PdfViewerModalProps {
  document: DocumentItem;
  client: ClientUser;
  watermarkConfig: WatermarkConfig;
  onClose: () => void;
  onRecordView: (log: ViewLog, notification?: AdminNotification) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document,
  client,
  watermarkConfig,
  onClose,
  onRecordView
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [maxPageSeen, setMaxPageSeen] = useState(1);
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRecordedInitialView = useRef(false);

  const totalPages = document.pageCount || document.contentPages?.length || 5;

  // View tracking timer (heartbeat)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    if (!hasRecordedInitialView.current) {
      hasRecordedInitialView.current = true;
      const uniqueSuffix = Math.random().toString(36).substring(2, 9);
      // Initial alert for Admin
      const initialLog: ViewLog = {
        id: `view-${Date.now()}-${uniqueSuffix}`,
        documentId: document.id,
        documentTitle: document.title,
        fileType: 'pdf',
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        ipAddress: client.ipAddress || '197.34.12.88',
        durationSeconds: 1,
        pagesViewed: 1,
        maxPageReached: 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        watermarkApplied: `${client.email} | ${client.ipAddress || '197.34.12.88'} | ${new Date().toLocaleTimeString()}`
      };

      const alertNotif: AdminNotification = {
        id: `notif-${Date.now()}-${uniqueSuffix}`,
        title: 'فتح مستند محمي (PDF Viewer)',
        titleEn: 'Protected PDF Opened',
        message: `قام العميل ${client.name} (${client.company}) بفتح المستند المحمي: "${document.title}". تم تطبيق العلامة المائية الديناميكية.`,
        messageEn: `Client ${client.name} opened protected document "${document.title}". Dynamic watermark active.`,
        type: 'view',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
        metadata: {
          clientId: client.id,
          documentId: document.id,
          ipAddress: client.ipAddress
        }
      };

      onRecordView(initialLog, alertNotif);
    }

    return () => clearInterval(timer);
  }, []);

  // Update max page seen
  useEffect(() => {
    if (currentPage > maxPageSeen) {
      setMaxPageSeen(currentPage);
    }
  }, [currentPage, maxPageSeen]);

  // Handle Close and update final duration
  const handleClose = () => {
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const finalLog: ViewLog = {
      id: `view-${Date.now()}-${uniqueSuffix}`,
      documentId: document.id,
      documentTitle: document.title,
      fileType: 'pdf',
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      ipAddress: client.ipAddress || '197.34.12.88',
      durationSeconds: secondsSpent,
      pagesViewed: maxPageSeen,
      maxPageReached: maxPageSeen,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      watermarkApplied: `${client.email} | ${client.ipAddress || '197.34.12.88'}`
    };
    onRecordView(finalLog);
    onClose();
  };

  // Anti-download, Anti-inspect prevention
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerSecurityNotice('حماية المحتوى: تم حظر النقر بالزر الأيمن لمنع نسخ المستند.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
      e.preventDefault();
      triggerSecurityNotice('حماية المحتوى: التحميل والطباعة والاطلاع على المصدر مقفل بواسطة نظام الأمان.');
    }
    if (e.key === 'ArrowRight') {
      setCurrentPage((p) => Math.max(1, p - 1));
    } else if (e.key === 'ArrowLeft') {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    }
  };

  const triggerSecurityNotice = (msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => setSecurityToast(null), 3500);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentContentText = document.contentPages?.[currentPage - 1] ||
    `الصفحة رقم ${currentPage} من مستند "${document.title}". تحتوي هذه الصفحة على بنود التعاقد والتحليل التفصيلي والبيانات المعتمدة للمشروع.`;

  return (
    <div
      id="pdf-viewer-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#09090b]/98 backdrop-blur-md select-none text-zinc-100"
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Security Toast Notification */}
      {securityToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#E40107] text-white font-bold px-6 py-3 rounded-xl shadow-2xl shadow-red-950 flex items-center gap-3 border border-red-400 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-white" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* Top Bar: Controls & Protection Badge */}
      <div className="h-16 border-b border-zinc-800 bg-[#0c0c0e]/95 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Document Info & MMG Emblem */}
        <div className="flex items-center gap-3.5 min-w-0">
          <MmgLogo size="sm" variant="icon" />
          <div className="truncate">
            <h2 className="text-sm md:text-base font-bold text-white truncate flex items-center gap-2">
              {document.title}
              <span className="bg-[#E40107]/15 text-[#ff4b4f] text-xs px-2 py-0.5 rounded border border-[#E40107]/30 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> MMG VIP محمي
              </span>
            </h2>
            <p className="text-xs text-zinc-400 truncate">
              {client.company} • {client.name} ({client.email})
            </p>
          </div>
        </div>

        {/* Toolbar Center: Pagination & Zoom */}
        <div className="hidden sm:flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium px-2 text-zinc-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="p-1 rounded hover:bg-zinc-800 transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-300 min-w-[36px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 rounded hover:bg-zinc-800 transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right Info & Close */}
        <div className="flex items-center gap-3">
          {/* Active View Heartbeat */}
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span>{formatSeconds(secondsSpent)}</span>
          </div>

          <button
            id="close-pdf-viewer-btn"
            onClick={handleClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-[#E40107]/20 hover:text-[#ff4b4f] text-zinc-400 border border-zinc-800 transition-colors"
            title="إغلاق العارض"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Document Stage with Mobile Screenshot Shield */}
      <div className="flex-1 relative overflow-hidden bg-[#09090b]/90">
        <MobileScreenshotShield
          clientName={client.name}
          clientEmail={client.email}
          clientIp={client.ipAddress || '197.34.12.88'}
          documentTitle={document.title}
          enabled={watermarkConfig.mobileScreenshotShield !== false}
        >
          <div
            ref={containerRef}
            className="w-full h-full overflow-auto p-4 md:p-8 flex justify-center items-start"
          >
        <div
          className="relative transition-all duration-200 shadow-2xl rounded-sm border border-slate-700/60 overflow-hidden"
          style={{
            width: `${Math.round(750 * (zoom / 100))}px`,
            minHeight: `${Math.round(1000 * (zoom / 100))}px`,
            backgroundColor: '#ffffff'
          }}
        >
          {/* DYNAMIC WATERMARK LAYER */}
          <WatermarkOverlay
            config={watermarkConfig}
            clientEmail={client.email}
            clientName={client.name}
            clientIp={client.ipAddress || '197.34.12.88'}
            documentTitle={document.title}
          />

          {/* SIMULATED PDF RENDER CANVAS */}
          <div className="p-10 md:p-14 text-zinc-900 flex flex-col justify-between h-full min-h-[960px] font-sans">
            {/* Header Document Banner */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-zinc-900/20 pb-4 mb-8">
                <div className="flex items-center gap-3">
                  <MmgLogo size="sm" variant="icon" />
                  <div>
                    <h3 className="text-xs font-black text-zinc-900 tracking-wider">MMG VIP ENTERPRISE DOCS</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">REF: #{document.id.toUpperCase()}-2026 • MODERN MEDIA GLOBAL</p>
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] text-zinc-500">
                  <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-[#c90005] font-bold mb-1 border border-red-200">
                    MMG RESTRICTED & CONFIDENTIAL
                  </span>
                  <div>DATE: {document.uploadedAt}</div>
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <span className="text-xs font-semibold text-[#c90005] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  وثيقة رسمية معتمدة • مخصصة لـ: {client.company}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-zinc-900 mt-2 mb-2 leading-relaxed">
                  {document.title}
                </h1>
                <p className="text-xs text-zinc-600 leading-relaxed border-r-2 border-[#E40107] pr-3">
                  {document.description}
                </p>
              </div>

              {/* Body Text Mock */}
              <div className="space-y-4 text-xs md:text-sm text-zinc-700 leading-relaxed text-justify">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                  <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#E40107]" />
                    محتوى الصفحة ({currentPage} من {totalPages}):
                  </h4>
                  <p className="text-zinc-800 font-medium leading-relaxed">
                    {currentContentText}
                  </p>
                </div>

                <p className="leading-relaxed">
                  يقر المستلم والمطلع على هذه الوثيقة بأن كافة المعلومات الواردة بها محمية بموجب أنظمة حماية البيانات وحقوق الملكية الفكرية لشركة Modern Media Global، ولا يجوز نسخها أو تصوير الشاشة أو تداولها أو إعادة بثها بأي شكل من الأشكال تحت طائلة المسؤولية القانونية المدنية والجنائية.
                </p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-3 bg-zinc-100/80 rounded-xl border border-zinc-200">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Recipient Entity</div>
                    <div className="text-xs font-bold text-zinc-900 mt-0.5">{client.company}</div>
                    <div className="text-[11px] text-zinc-600">{client.name}</div>
                  </div>
                  <div className="p-3 bg-zinc-100/80 rounded-xl border border-zinc-200">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Access Security Level</div>
                    <div className="text-xs font-bold text-[#c90005] mt-0.5">Level 3 - MMG Dynamic Watermarked</div>
                    <div className="text-[11px] text-zinc-600">IP: {client.ipAddress || '197.34.12.88'}</div>
                  </div>
                </div>

                {currentPage === totalPages && (
                  <div className="mt-8 pt-6 border-t-2 border-zinc-200 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">MMG Authorized Seal</div>
                      <div className="w-36 h-14 border-2 border-dashed border-[#E40107] bg-red-50/70 rounded-xl flex items-center justify-center text-[#c90005] text-xs font-bold rotate-[-2deg] mt-1 shadow-sm">
                        ✓ Modern Media Global
                      </div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-zinc-500">
                      <div>AUDIT HASH: MMG-SHA256-8F29A03E</div>
                      <div>PORTAL HOST: MMG VIP Secure Host (mmglobal.vip)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Footer */}
              <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <div>CONFIDENTIAL • FOR AUTHORIZED EYES ONLY • MMGLOBAL.VIP</div>
                <div>PAGE {currentPage} OF {totalPages}</div>
              </div>
            </div>
          </div>
        </div>
      </MobileScreenshotShield>
    </div>

      {/* Bottom Bar: Mobile Pagination & Security Reminder */}
      <div className="h-12 bg-[#0c0c0e] border-t border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E40107]" />
          <span className="hidden sm:inline">حماية MMG PDF.js مع طبقة علامة مائية ديناميكية مخصصة</span>
          <span className="sm:hidden">MMG PDF محمي</span>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-zinc-800 text-zinc-200 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-zinc-800 text-zinc-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="font-mono text-[11px] text-zinc-400">
          IP: {client.ipAddress || '197.34.12.88'}
        </div>
      </div>
    </div>
  );
};
