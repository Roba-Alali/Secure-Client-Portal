import React, { useState } from 'react';
import { ClientUser, Project, DocumentItem, WatermarkConfig, ViewLog, AdminNotification } from '../../types';
import {
  FolderKanban,
  FileText,
  Presentation,
  Video,
  ShieldCheck,
  Eye,
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ClientPortalProps {
  currentClient: ClientUser;
  projects: Project[];
  documents: DocumentItem[];
  watermarkConfig: WatermarkConfig;
  onOpenPdf: (doc: DocumentItem) => void;
  onOpenPresentation: (doc: DocumentItem) => void;
  onOpenVideo: (doc: DocumentItem) => void;
  onSwitchToAdmin: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  currentClient,
  projects,
  documents,
  watermarkConfig,
  onOpenPdf,
  onOpenPresentation,
  onOpenVideo,
  onSwitchToAdmin
}) => {
  // Filter projects assigned to this client
  const clientProjects = projects.filter((p) =>
    currentClient.assignedProjectIds.includes(p.id)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    clientProjects[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'all' | 'pdf' | 'presentation' | 'video'>('all');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filter documents in selected project
  const projectDocs = documents.filter((d) => d.projectId === selectedProjectId);

  const filteredDocs = projectDocs.filter((d) => {
    if (activeTab === 'all') return true;
    return d.fileType === activeTab;
  });

  const pdfCount = projectDocs.filter((d) => d.fileType === 'pdf').length;
  const presentationCount = projectDocs.filter((d) => d.fileType === 'presentation').length;
  const videoCount = projectDocs.filter((d) => d.fileType === 'video').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & MMG VIP Security Strip */}
      <div className="bg-gradient-to-r from-[#121216] via-[#121216] to-[#E40107]/15 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#ff4b4f] bg-[#E40107]/15 px-3 py-0.5 rounded-full border border-[#E40107]/30">
                بوابة MMG VIP المعتمدة • جلسة آمنة
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                IP: {currentClient.ipAddress || '197.34.12.88'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
              أهلاً بك، {currentClient.name}
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              <span className="text-zinc-200 font-semibold">{currentClient.company}</span> • وثائق وعروض ومواد إعلامية مشفرة ومحمية بعلامات مائية ديناميكية مخصصة لك عبر شركة Modern Media Global.
            </p>
          </div>

          {/* Dynamic Watermark Compliance Preview */}
          <div className="bg-[#09090b]/80 border border-zinc-800 p-3.5 rounded-2xl text-xs max-w-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#ff4b4f] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                العلامة المائية النشطة لحسابك:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">MMG Protected</span>
            </div>
            <div className="font-mono text-[11px] text-zinc-200 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800 truncate" dir="ltr">
              MMG VIP • {currentClient.email} | {currentClient.ipAddress || '197.34.12.88'}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5">
              يتم ختم هذه العلامة تلقائياً فوق جميع الصفحات والشرائح لتوثيق حق الاطلاع لشركة {currentClient.company}.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Selection Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#E40107]" />
            <span>مشاريع MMG المخصصة لك ({clientProjects.length})</span>
          </h2>
          <span className="text-xs text-zinc-400">اختر المشروع لاستعراض ملفاته المحمية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clientProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`text-right p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#E40107]/10 border-[#E40107]/50 shadow-lg shadow-red-950/20 text-white'
                    : 'bg-[#121216] hover:bg-zinc-800/60 border-zinc-800 text-zinc-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#E40107]" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {project.category}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {project.status === 'active' ? 'نشط ومصرح' : 'قيد المراجعة'}
                  </span>
                </div>
                <h3 className="text-sm font-bold truncate mb-1 text-white">
                  {project.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                  {project.description}
                </p>

                {/* Counts */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-800/80">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-400" /> {project.documentCount.pdf} مستندات
                  </span>
                  <span className="flex items-center gap-1">
                    <Presentation className="w-3.5 h-3.5 text-indigo-400" /> {project.documentCount.presentation} عروض
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-emerald-400" /> {project.documentCount.video} فيديو
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Details & Files Section */}
      {selectedProject && (
        <div className="bg-[#121216] border border-zinc-800 rounded-3xl p-6 shadow-xl">
          {/* Project Details Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#ff4b4f] font-semibold mb-1">
                <Layers className="w-4 h-4 text-[#E40107]" />
                <span>تفاصيل المشروع المحدد:</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {selectedProject.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                {selectedProject.description}
              </p>
            </div>

            {/* Document Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#E40107] text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                الكل ({projectDocs.length})
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'pdf'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>المستندات ({pdfCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('presentation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'presentation'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Presentation className="w-3.5 h-3.5 text-indigo-400" />
                <span>العروض ({presentationCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'video'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>الفيديوهات ({videoCount})</span>
              </button>
            </div>
          </div>

          {/* Files Grid */}
          <div className="mt-6">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 font-medium">
                  لا توجد ملفات متطابقة مع هذا التصنيف في المشروع المختار.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => {
                  const isPdf = doc.fileType === 'pdf';
                  const isPresentation = doc.fileType === 'presentation';
                  const isVideo = doc.fileType === 'video';

                  return (
                    <div
                      key={doc.id}
                      className="bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-black/40"
                    >
                      <div>
                        {/* Type Icon & Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                              isPdf
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : isPresentation
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {isPdf && <FileText className="w-5 h-5" />}
                            {isPresentation && <Presentation className="w-5 h-5" />}
                            {isVideo && <Video className="w-5 h-5" />}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {doc.isConfidential && (
                              <span className="text-[10px] font-bold bg-[#E40107]/15 text-[#ff4b4f] px-2 py-0.5 rounded border border-[#E40107]/25 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> سري
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              {doc.fileSize}
                            </span>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h4 className="text-sm font-bold text-white group-hover:text-[#ff4b4f] transition-colors line-clamp-2 mb-1.5">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                          {doc.description}
                        </p>
                      </div>

                      {/* Card Footer & Action */}
                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-zinc-400" /> {doc.viewsCount}
                          </span>
                          <span>•</span>
                          <span>
                            {isPdf && `${doc.pageCount} صفحات`}
                            {isPresentation && `${doc.pageCount} شرائح`}
                            {isVideo && doc.duration}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (isPdf) onOpenPdf(doc);
                            else if (isPresentation) onOpenPresentation(doc);
                            else if (isVideo) onOpenVideo(doc);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                            isPdf
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : isPresentation
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>فتح محمي</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Info Notice */}
      <div className="p-4 bg-[#121216] border border-zinc-800 rounded-2xl flex items-start gap-3 text-xs text-zinc-400">
        <Info className="w-5 h-5 text-[#E40107] shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200">سياسة الخصوصية وحماية وثائق Modern Media Global (MMG):</strong>
          <p className="mt-0.5 leading-relaxed">
            جميع المستندات المعروضة في بوابة MMG VIP محمية بتقنية عارض PDF المخصص والمحمي بعلامات مائية ديناميكية مدمجة تحتوي على البريد الإلكتروني وعنوان IP الخاص بك وتاريخ الاطلاع. يتم حظر التنزيل والطباعة والتسجيل لحماية حقوق الملكية الفكرية لشركة Modern Media Global وعملائها.
          </p>
        </div>
      </div>
    </div>
  );
};
