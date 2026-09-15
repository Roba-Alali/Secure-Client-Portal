import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, ClientUser, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import { WatermarkOverlay } from '../WatermarkOverlay';
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

  const totalPages = document.pageCount || document.contentPages?.length || 5;

  // View tracking timer (heartbeat)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    // Initial alert for Admin
    const initialLog: ViewLog = {
      id: `view-${Date.now()}`,
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
      id: `notif-${Date.now()}`,
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
    const finalLog: ViewLog = {
      id: `view-${Date.now()}`,
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
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md select-none text-slate-100"
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Security Toast Notification */}
      {securityToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-300 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-slate-950" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* Top Bar: Controls & Protection Badge */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h2 className="text-sm md:text-base font-bold text-white truncate flex items-center gap-2">
              {document.title}
              <span className="bg-rose-500/10 text-rose-400 text-xs px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> PDF محمي
              </span>
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {client.company} • {client.name} ({client.email})
            </p>
          </div>
        </div>

        {/* Toolbar Center: Pagination & Zoom */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium px-2 text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-40 transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 min-w-[36px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right Info & Close */}
        <div className="flex items-center gap-3">
          {/* Active View Heartbeat */}
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span>{formatSeconds(secondsSpent)}</span>
          </div>

          <button
            id="close-pdf-viewer-btn"
            onClick={handleClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
            title="إغلاق العارض"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Document Stage */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-slate-950/80"
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
          <div className="p-10 md:p-14 text-slate-900 flex flex-col justify-between h-full min-h-[960px] font-sans">
            {/* Header Document Banner */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900/20 pb-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    CP
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 tracking-wider">CLIENT PORTAL SECURE DOCS</h3>
                    <p className="text-[10px] text-slate-500 font-mono">REF: #{document.id.toUpperCase()}-2025</p>
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] text-slate-500">
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold mb-1">
                    RESTRICTED & CONFIDENTIAL
                  </span>
                  <div>DATE: {document.uploadedAt}</div>
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  وثيقة رسمية معتمدة • مخصصة لـ: {client.company}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-2 mb-2 leading-relaxed">
                  {document.title}
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed border-r-2 border-slate-300 pr-3">
                  {document.description}
                </p>
              </div>

              {/* Body Text Mock */}
              <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    محتوى الصفحة ({currentPage} من {totalPages}):
                  </h4>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {currentContentText}
                  </p>
                </div>

                <p className="leading-relaxed">
                  يقر المستلم والمطلع على هذه الوثيقة بأن كافة المعلومات الواردة بها محمية بموجب أنظمة حماية البيانات الملكية الفكرية، ولا يجوز نسخها أو تصوير الشاشة أو تداولها أو إعادة بثها بأي شكل من الأشكال تحت طائلة المسؤولية القانونية المدنية والجنائية.
                </p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-3 bg-slate-100/80 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Recipient Entity</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{client.company}</div>
                    <div className="text-[11px] text-slate-600">{client.name}</div>
                  </div>
                  <div className="p-3 bg-slate-100/80 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Access Security Level</div>
                    <div className="text-xs font-bold text-emerald-700 mt-0.5">Level 3 - Dynamic Watermarked</div>
                    <div className="text-[11px] text-slate-600">IP: {client.ipAddress || '197.34.12.88'}</div>
                  </div>
                </div>

                {currentPage === totalPages && (
                  <div className="mt-8 pt-6 border-t-2 border-slate-200 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Executive Authorized Seal</div>
                      <div className="w-32 h-14 border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded flex items-center justify-center text-emerald-700 text-xs font-bold rotate-[-3deg] mt-1">
                        ✓ مصادق إلكترونياً
                      </div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-slate-500">
                      <div>AUDIT HASH: SHA256-8F29A03E</div>
                      <div>PORTAL HOST: Namecheap cPanel SSL</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <div>CONFIDENTIAL • FOR AUTHORIZED EYES ONLY</div>
              <div>PAGE {currentPage} OF {totalPages}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Mobile Pagination & Security Reminder */}
      <div className="h-12 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">حماية PDF.js مع طبقة علامة مائية ديناميكية مخصصة</span>
          <span className="sm:hidden">PDF محمي</span>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-slate-800 text-slate-200 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-slate-800 text-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          IP: {client.ipAddress || '197.34.12.88'}
        </div>
      </div>
    </div>
  );
};
