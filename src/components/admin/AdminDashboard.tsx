import React, { useState } from 'react';
import {
  ClientUser,
  Project,
  DocumentItem,
  LoginLog,
  ViewLog,
  AdminNotification,
  WatermarkConfig,
  FileType
} from '../../types';
import { MmgLogo } from '../MmgLogo';
import {
  Users,
  FolderKanban,
  FileText,
  Video,
  ShieldAlert,
  History,
  Eye,
  Bell,
  Sparkles,
  Server,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Copy,
  Check,
  Search,
  Sliders,
  Play,
  Presentation,
  Key,
  ShieldCheck,
  Smartphone,
  Send,
  FileCode
} from 'lucide-react';
import {
  cpanelMysqlSchema,
  cpanelConfigFilePhp,
  cpanelAuthPhp,
  cpanelViewerPhp,
  cpanelHtaccess,
  cpanelDeploymentSteps
} from '../../data/cpanelDeploymentCode';

interface AdminDashboardProps {
  clients: ClientUser[];
  projects: Project[];
  documents: DocumentItem[];
  loginLogs: LoginLog[];
  viewLogs: ViewLog[];
  notifications: AdminNotification[];
  watermarkConfig: WatermarkConfig;
  onUpdateWatermark: (config: WatermarkConfig) => void;
  onAddClient: (client: ClientUser) => void;
  onUpdateClient: (client: ClientUser) => void;
  onDeleteClient: (id: string) => void;
  onAddProject: (project: Project) => void;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onMarkNotificationsRead: () => void;
  onPreviewDocument: (doc: DocumentItem, client: ClientUser) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clients,
  projects,
  documents,
  loginLogs,
  viewLogs,
  notifications,
  watermarkConfig,
  onUpdateWatermark,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddProject,
  onAddDocument,
  onDeleteDocument,
  onMarkNotificationsRead,
  onPreviewDocument
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'overview'
    | 'clients'
    | 'projects'
    | 'documents'
    | 'access_control'
    | 'login_activity'
    | 'view_activity'
    | 'notifications'
    | 'watermarks'
    | 'mmg_deploy'
  >('overview');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Client Modal state
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    accessExpiry: '2026-12-31'
  });

  // New Project Modal state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    category: 'استراتيجية تسويقية وتواصل إعلامي',
    description: '',
    clientIds: [] as string[],
    status: 'active' as 'active' | 'in-progress' | 'completed'
  });

  // New Document Modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    projectId: projects[0]?.id || '',
    title: '',
    description: '',
    fileType: 'pdf' as FileType,
    pageCount: 5,
    duration: '02:30'
  });

  // Watermark local edit state
  const [localWm, setLocalWm] = useState<WatermarkConfig>({ ...watermarkConfig });
  const [wmSavedNotice, setWmSavedNotice] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveWatermark = () => {
    onUpdateWatermark(localWm);
    setWmSavedNotice(true);
    setTimeout(() => setWmSavedNotice(false), 2500);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.email) return;

    const newClient: ClientUser = {
      id: `client-${Date.now()}`,
      name: newClientForm.name,
      nameEn: newClientForm.name,
      email: newClientForm.email,
      company: newClientForm.company || 'شركة عميل',
      companyEn: newClientForm.company || 'Client Co.',
      phone: newClientForm.phone,
      status: 'active',
      assignedProjectIds: projects.map((p) => p.id),
      accessExpiry: newClientForm.accessExpiry,
      ipAddress: '197.34.12.88'
    };

    onAddClient(newClient);
    setShowAddClientModal(false);
    setNewClientForm({
      name: '',
      email: '',
      company: '',
      phone: '',
      accessExpiry: '2026-12-31'
    });
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.title || !newDocForm.projectId) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      projectId: newDocForm.projectId,
      title: newDocForm.title,
      titleEn: newDocForm.title,
      description: newDocForm.description || 'مستند مخصص محمي للعميل.',
      descriptionEn: newDocForm.description || 'Client document.',
      fileType: newDocForm.fileType,
      fileSize: newDocForm.fileType === 'video' ? '45 MB' : '3.4 MB',
      pageCount: newDocForm.pageCount,
      duration: newDocForm.duration,
      uploadedAt: new Date().toISOString().split('T')[0],
      isConfidential: true,
      watermarkEnabled: true,
      downloadRestricted: true,
      viewsCount: 0,
      contentPages: [
        `صفحة 1: مستند جديد معتمد: ${newDocForm.title}`,
        'صفحة 2: الشروط والتحليلات وبيانات المشروع السرية.'
      ],
      slides: [
        {
          title: newDocForm.title,
          subtitle: newDocForm.description,
          content: ['الهدف الأول', 'خطة التنفيذ', 'المؤشرات']
        }
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    };

    onAddDocument(newDoc);
    setShowAddDocModal(false);
    setNewDocForm({
      projectId: projects[0]?.id || '',
      title: '',
      description: '',
      fileType: 'pdf',
      pageCount: 5,
      duration: '02:30'
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.title.trim()) return;

    const assignedClients = newProjectForm.clientIds.length > 0 
      ? newProjectForm.clientIds 
      : (clients.length > 0 ? [clients[0].id] : []);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newProjectForm.title.trim(),
      titleEn: newProjectForm.title.trim(),
      category: newProjectForm.category,
      categoryEn: newProjectForm.category,
      description: newProjectForm.description.trim() || 'مشروع استراتيجي مخصص لعملاء MMG VIP.',
      descriptionEn: newProjectForm.description.trim() || 'MMG VIP Strategic Dedicated Project.',
      clientIds: assignedClients,
      status: newProjectForm.status,
      updatedAt: 'اليوم',
      documentCount: {
        pdf: 0,
        presentation: 0,
        video: 0
      }
    };

    onAddProject(newProj);
    setShowAddProjectModal(false);
    setNewProjectForm({
      title: '',
      category: 'استراتيجية تسويقية وتواصل إعلامي',
      description: '',
      clientIds: [],
      status: 'active'
    });
  };

  // Calculations for KPI Cards
  const totalViews = documents.reduce((acc, d) => acc + d.viewsCount, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const getTabClass = (tab: typeof activeAdminTab) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
      activeAdminTab === tab
        ? 'bg-[#E40107] text-white shadow-lg shadow-red-950/40'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
    }`;

  return (
    <div className="space-y-6">
      {/* Top Admin Header Banner */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <MmgLogo size="md" variant="badge" />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#ff4b4f] bg-[#E40107]/15 px-2.5 py-0.5 rounded-full border border-[#E40107]/30">
                🛡️ لوحة تحكم إدارة MMG المركزية (Super Admin)
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-[#E40107]" /> خادم MMG VIP المعتمد • mmglobal.vip
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight font-sans">
              إدارة بوابة Modern Media Global وحماية المستندات
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              متابعة المشاهدات الحية، تخصيص العلامة المائية الديناميكية لـ MMG، وسجل تدقيق الجلسات بدون ووردبريس.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveAdminTab('mmg_deploy')}
            className="px-3.5 py-2 rounded-xl bg-[#E40107]/15 hover:bg-[#E40107]/25 text-[#ff4b4f] border border-[#E40107]/30 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <FileCode className="w-4 h-4" />
            <span>كود نشر MMG VIP & SQL</span>
          </button>

          <button
            onClick={() => setShowAddClientModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#E40107] hover:bg-[#c90005] text-white text-xs font-bold transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800 scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={getTabClass('overview')}
        >
          <Sliders className="w-4 h-4" />
          <span>نظرة عامة</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('clients')}
          className={getTabClass('clients')}
        >
          <Users className="w-4 h-4" />
          <span>العملاء ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('projects')}
          className={getTabClass('projects')}
        >
          <FolderKanban className="w-4 h-4" />
          <span>المشاريع ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('documents')}
          className={getTabClass('documents')}
        >
          <FileText className="w-4 h-4" />
          <span>المستندات والفيديوهات ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('access_control')}
          className={getTabClass('access_control')}
        >
          <Key className="w-4 h-4" />
          <span>الصلاحيات (Access Control)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('login_activity')}
          className={getTabClass('login_activity')}
        >
          <History className="w-4 h-4" />
          <span>سجل تسجيل الدخول ({loginLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('view_activity')}
          className={getTabClass('view_activity')}
        >
          <Eye className="w-4 h-4" />
          <span>سجل المشاهدات ({viewLogs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('notifications');
            onMarkNotificationsRead();
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 relative ${
            activeAdminTab === 'notifications'
              ? 'bg-[#E40107] text-white shadow-lg shadow-red-950/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>الإشعارات</span>
          {unreadNotifs > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#E40107] text-[10px] text-white flex items-center justify-center font-bold">
              {unreadNotifs}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('watermarks')}
          className={getTabClass('watermarks')}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>العلامات المائية (Watermarks)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('mmg_deploy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'mmg_deploy'
              ? 'bg-[#E40107] text-white shadow-lg shadow-red-950/40'
              : 'text-[#ff4b4f] hover:bg-[#E40107]/10'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>مركز نشر وخادم MMG</span>
        </button>
      </div>

      {/* ======================= TAB 1: OVERVIEW ======================= */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">العملاء النشطون</span>
                <Users className="w-4 h-4 text-[#ff4b4f]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{clients.length}</div>
              <p className="text-[11px] text-emerald-400 mt-1">جميع الحسابات مفعلة ومرتبطة</p>
            </div>

            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">المستندات المحمية</span>
                <FileText className="w-4 h-4 text-[#E40107]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{documents.length}</div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {documents.filter((d) => d.fileType === 'pdf').length} PDF • {documents.filter((d) => d.fileType === 'presentation').length} عروض • {documents.filter((d) => d.fileType === 'video').length} فيديو
              </p>
            </div>

            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">إجمالي المشاهدات الآمنة</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{totalViews}</div>
              <p className="text-[11px] text-amber-400 mt-1">كل جلسة موثقة بالعلامة المائية</p>
            </div>

            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">تنبيهات الأمان والإشعارات</span>
                <Bell className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{notifications.length}</div>
              <p className="text-[11px] text-zinc-400 mt-1">إرسال فوري لبريد الإدارة المعتمد</p>
            </div>
          </div>

          {/* Dual Split: Recent Logins & Recent View Audits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Logins */}
            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-[#ff4b4f]" />
                  <span>آخر عمليات تسجيل الدخول</span>
                </h3>
                <button
                  onClick={() => setActiveAdminTab('login_activity')}
                  className="text-xs text-[#ff4b4f] hover:underline"
                >
                  عرض السجل كاملاً
                </button>
              </div>

              <div className="space-y-2.5">
                {loginLogs.slice(0, 4).map((log, idx) => (
                  <div
                    key={`${log.id}-${idx}`}
                    className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{log.clientName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({log.email})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                        IP: {log.ipAddress} • {log.location}
                      </div>
                    </div>

                    <div className="text-left">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          log.status === '2fa_verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : log.status === 'success'
                            ? 'bg-[#E40107]/10 text-[#ff4b4f] border-[#E40107]/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {log.status === '2fa_verified'
                          ? '✓ 2FA مؤكد'
                          : log.status === 'success'
                          ? 'دخول ناجح'
                          : 'محظور'}
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                        {log.timestamp.split(' ')[1] || log.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent View Logs */}
            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>آخر مشاهدات الوثائق المحمية</span>
                </h3>
                <button
                  onClick={() => setActiveAdminTab('view_activity')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  عرض سجل التدقيق
                </button>
              </div>

              <div className="space-y-2.5">
                {viewLogs.slice(0, 4).map((view, idx) => (
                  <div
                    key={`${view.id}-${idx}`}
                    className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="max-w-[70%]">
                      <div className="font-bold text-white truncate">{view.documentTitle}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        المشاهد: <span className="text-amber-400 font-semibold">{view.clientName}</span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="text-emerald-400 text-xs font-bold">
                        {Math.floor(view.durationSeconds / 60)} د و {view.durationSeconds % 60} ث
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {view.pagesViewed ? `${view.pagesViewed} صفحة` : 'فيديو'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: CLIENTS ======================= */}
      {activeAdminTab === 'clients' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">إدارة حسابات العملاء</h2>
              <p className="text-xs text-zinc-400">إضافة عملاء جدد، تعيين المشاريع، وضبط صلاحيات الوصول وتاريخ الانتهاء.</p>
            </div>
            <button
              onClick={() => setShowAddClientModal(true)}
              className="px-4 py-2 bg-[#E40107] hover:bg-[#c90005] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start shadow-lg shadow-red-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3">العميل والمؤسسة</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">المشاريع المخصصة</th>
                  <th className="p-3">آخر عنوان IP</th>
                  <th className="p-3">صلاحية الحساب</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-zinc-400">{client.company}</div>
                    </td>
                    <td className="p-3 font-mono text-zinc-300" dir="ltr">
                      {client.email}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          client.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {client.status === 'active' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                        {client.assignedProjectIds.length} مشاريع
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-400" dir="ltr">
                      {client.ipAddress || '197.34.12.88'}
                    </td>
                    <td className="p-3 text-zinc-400 font-mono">
                      {client.accessExpiry || 'مستمر'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            const updated = {
                              ...client,
                              status: client.status === 'active' ? ('suspended' as const) : ('active' as const)
                            };
                            onUpdateClient(updated);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            client.status === 'active'
                              ? 'hover:bg-amber-500/20 text-amber-400'
                              : 'hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                          title={client.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}
                        >
                          {client.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onDeleteClient(client.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: PROJECTS ======================= */}
      {activeAdminTab === 'projects' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#E40107]" />
                <h2 className="text-lg font-bold text-white">إدارة المشاريع المخصصة</h2>
                <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                  {projects.length} مشاريع
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                تنظيم وتصنيف المشاريع، وربطها بالمستندات المحمية وتحديد صلاحيات اطلاع العملاء.
              </p>
            </div>
            <button
              id="btn-add-new-project"
              onClick={() => {
                setNewProjectForm({
                  title: '',
                  category: 'استراتيجية تسويقية وتواصل إعلامي',
                  description: '',
                  clientIds: clients.length > 0 ? [clients[0].id] : [],
                  status: 'active'
                });
                setShowAddProjectModal(true);
              }}
              className="px-4 py-2.5 bg-[#E40107] hover:bg-[#c90005] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-red-950/50 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة مشروع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const projDocs = documents.filter((d) => d.projectId === proj.id);
              const assignedClientObjects = clients.filter((c) => proj.clientIds.includes(c.id));

              return (
                <div
                  key={proj.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-5 flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-semibold text-[#ff4b4f] bg-[#E40107]/10 px-2.5 py-1 rounded-lg border border-[#E40107]/20">
                        {proj.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        proj.status === 'active'
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                      }`}>
                        {proj.status === 'active' ? 'نشط' : proj.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-red-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Assigned Clients Preview */}
                    <div className="mb-4 bg-[#121216] p-2.5 rounded-lg border border-zinc-800/80">
                      <div className="text-[10px] font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
                        <span>العملاء المصرح لهم:</span>
                        <span className="text-zinc-500 font-mono">({proj.clientIds.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assignedClientObjects.length > 0 ? (
                          assignedClientObjects.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 truncate max-w-[140px]"
                              title={`${c.name} (${c.company})`}
                            >
                              {c.company || c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">لا يوجد عملاء مخصصين حالياً</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between mb-3">
                      <span className="font-mono text-zinc-300">
                        {projDocs.length} ملفات محمية
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        تحديث: {proj.updatedAt}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setNewDocForm({
                          projectId: proj.id,
                          title: '',
                          description: '',
                          fileType: 'pdf',
                          pageCount: 5,
                          duration: '02:30'
                        });
                        setShowAddDocModal(true);
                      }}
                      className="w-full py-2 bg-zinc-900 hover:bg-[#E40107]/20 hover:text-[#ff4b4f] hover:border-[#E40107]/40 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-800 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E40107]" />
                      <span>رفع مستند لهذا المشروع</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: DOCUMENTS & VIDEOS ======================= */}
      {activeAdminTab === 'documents' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">المستندات، العروض التقديمية، والفيديوهات</h2>
              <p className="text-xs text-zinc-400">إدارة الملفات المشفرة وتفعيل العلامة المائية وحظر التنزيل المباشر.</p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-4 py-2 bg-[#E40107] hover:bg-[#c90005] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start shadow-lg shadow-red-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ملف جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3">عنوان الملف</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">المشروع</th>
                  <th className="p-3">العلامة المائية</th>
                  <th className="p-3">الحماية والسرية</th>
                  <th className="p-3">المشاهدات</th>
                  <th className="p-3 text-center">معاينة وإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {documents.map((doc) => {
                  const project = projects.find((p) => p.id === doc.projectId);
                  return (
                    <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{doc.title}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1">{doc.description}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            doc.fileType === 'pdf'
                              ? 'bg-rose-500/15 text-rose-400'
                              : doc.fileType === 'presentation'
                              ? 'bg-[#E40107]/15 text-[#ff4b4f]'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {doc.fileType}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-300">
                        {project?.title || doc.projectId}
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> نشطة
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#ff4b4f] font-bold flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> محمي من التحميل
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        {doc.viewsCount}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onPreviewDocument(doc, clients[0])}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[#ff4b4f] transition-colors flex items-center gap-1 text-[11px]"
                            title="معاينة بالعلامة المائية"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 5: ACCESS CONTROL ======================= */}
      {activeAdminTab === 'access_control' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">مصفوفة التحكم في الصلاحيات (Access Control Matrix)</h2>
            <p className="text-xs text-zinc-400">تحديد وصول كل عميل إلى المشاريع وأنواع الملفات المصرح بها بشكل فوري.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3">اسم العميل والشركة</th>
                  {projects.map((p) => (
                    <th key={p.id} className="p-3 text-center">
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{p.category}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center">تقييد عنوان IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-zinc-400">{client.company}</div>
                    </td>

                    {projects.map((p) => {
                      const isAssigned = client.assignedProjectIds.includes(p.id);
                      return (
                        <td key={p.id} className="p-3 text-center">
                          <button
                            onClick={() => {
                              const newAssigned = isAssigned
                                ? client.assignedProjectIds.filter((id) => id !== p.id)
                                : [...client.assignedProjectIds, p.id];
                              onUpdateClient({ ...client, assignedProjectIds: newAssigned });
                            }}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              isAssigned
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-white'
                            }`}
                          >
                            {isAssigned ? '✓ مصرح بالوصول' : 'محجوب'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-3 text-center font-mono text-zinc-400" dir="ltr">
                      {client.ipAddress ? `مسموح (${client.ipAddress})` : 'أي عنوان IP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 6: LOGIN ACTIVITY ======================= */}
      {activeAdminTab === 'login_activity' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">سجل تسجيل الدخول والأمان (Login Audit Logs)</h2>
              <p className="text-xs text-zinc-400">توثيق جميع محاولات الدخول، التحقق الثنائي، العناوين الرقمية IP، ونوع الجهاز.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3">العميل</th>
                  <th className="p-3">البريد المستخدم</th>
                  <th className="p-3">عنوان IP</th>
                  <th className="p-3">الموقع الجغرافي والجهاز</th>
                  <th className="p-3">الحالة الأمنية</th>
                  <th className="p-3">التوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono">
                {loginLogs.map((log, idx) => (
                  <tr key={`${log.id}-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-sans font-bold text-white">
                      {log.clientName}
                    </td>
                    <td className="p-3 text-zinc-300" dir="ltr">
                      {log.email}
                    </td>
                    <td className="p-3 text-amber-400" dir="ltr">
                      {log.ipAddress}
                    </td>
                    <td className="p-3 font-sans text-zinc-400">
                      {log.location} • ({log.deviceType})
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.status === '2fa_verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : log.status === 'success'
                            ? 'bg-[#E40107]/10 text-[#ff4b4f] border-[#E40107]/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {log.status === '2fa_verified'
                          ? '✓ 2FA Verified'
                          : log.status === 'success'
                          ? 'Credentials OK'
                          : 'Blocked / Failed'}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 7: VIEW ACTIVITY ======================= */}
      {activeAdminTab === 'view_activity' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">سجل المشاهدات والتفاعل (View Tracking & Auditing)</h2>
            <p className="text-xs text-zinc-400">توثيق بالثانية لكل من فتح مستند أو عرض أو فيديو، مع نص العلامة المائية المحقونة.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3">الوثيقة المعروضة</th>
                  <th className="p-3">نوع الملف</th>
                  <th className="p-3">العميل والمؤسسة</th>
                  <th className="p-3">مدة المشاهدة</th>
                  <th className="p-3">الصفحات</th>
                  <th className="p-3">العلامة المائية المحقونة في الـ Canvas</th>
                  <th className="p-3">وقت المشاهدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {viewLogs.map((log, idx) => (
                  <tr key={`${log.id}-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">
                      {log.documentTitle}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] uppercase text-[#ff4b4f]">
                        {log.fileType}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-zinc-200">{log.clientName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono" dir="ltr">{log.clientEmail}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {Math.floor(log.durationSeconds / 60)}د {log.durationSeconds % 60}ث
                    </td>
                    <td className="p-3 font-mono text-zinc-300">
                      {log.pagesViewed ? `${log.pagesViewed} صفحة` : 'فيديو'}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-amber-300/90 max-w-xs truncate" dir="ltr">
                      {log.watermarkApplied}
                    </td>
                    <td className="p-3 font-mono text-zinc-400">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 8: NOTIFICATIONS ======================= */}
      {activeAdminTab === 'notifications' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">إشعارات وتنبيهات الإدارة الفورية</h2>
              <p className="text-xs text-zinc-400">تصلك هذه التنبيهات عبر خادم MMG المعتمد تلقائياً عند دخول أي عميل أو فتح أي وثيقة.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-mono">
                SMTP: security@mmglobal.vip
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div
                key={`${notif.id}-${idx}`}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  notif.type === 'security'
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : notif.type === 'view'
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-[#E40107]/10 border-[#E40107]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'security'
                        ? 'bg-rose-500/20 text-rose-400'
                        : notif.type === 'view'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[#E40107]/20 text-[#ff4b4f]'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.metadata?.ipAddress && (
                      <div className="text-[11px] font-mono text-zinc-400 mt-1.5" dir="ltr">
                        Client IP: {notif.metadata.ipAddress}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] text-zinc-400 shrink-0">
                  {notif.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 9: WATERMARKS ======================= */}
      {activeAdminTab === 'watermarks' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>إعدادات وتخصيص العلامة المائية الديناميكية (Watermark Designer)</span>
              </h2>
              <p className="text-xs text-zinc-400">
                تحكم كامل في نص العلامة، الشفافية، زاوية الدوران، وكثافة التكرار لمنع تصوير الشاشة وتحديد هوية المشاهد بدقة.
              </p>
            </div>

            <button
              onClick={handleSaveWatermark}
              className="px-5 py-2.5 bg-[#E40107] hover:bg-[#c90005] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-950/40 flex items-center gap-2 self-start"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق العلامة</span>
            </button>
          </div>

          {wmSavedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>تم حفظ إعدادات العلامة المائية وتطبيقها فورياً على جميع عارضي PDF والشرائح والفيديوهات!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  قالب نص العلامة المائية (يدعم المتغيرات الديناميكية)
                </label>
                <input
                  type="text"
                  value={localWm.template}
                  onChange={(e) => setLocalWm({ ...localWm, template: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E40107] font-mono"
                  dir="ltr"
                />
                <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-zinc-400">
                  <span>المتغيرات المدعومة:</span>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{email}'}</code>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{ip}'}</code>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{date}'}</code>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{name}'}</code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    درجة الشفافية (Opacity): {Math.round(localWm.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.01"
                    value={localWm.opacity}
                    onChange={(e) => setLocalWm({ ...localWm, opacity: parseFloat(e.target.value) })}
                    className="w-full accent-[#E40107]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    زاوية الميل (Rotation): {localWm.rotation}°
                  </label>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="5"
                    value={localWm.rotation}
                    onChange={(e) => setLocalWm({ ...localWm, rotation: parseInt(e.target.value) })}
                    className="w-full accent-[#E40107]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    حجم الخط: {localWm.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={localWm.fontSize}
                    onChange={(e) => setLocalWm({ ...localWm, fontSize: parseInt(e.target.value) })}
                    className="w-full accent-[#E40107]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    كثافة التكرار
                  </label>
                  <select
                    value={localWm.density}
                    onChange={(e) => setLocalWm({ ...localWm, density: e.target.value as any })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="low">منخفضة (6 علامات)</option>
                    <option value="medium">متوسطة (9 علامات)</option>
                    <option value="high">مكثفة (16 علامة)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>إعدادات درع حماية الهاتف من لقطات الشاشة (Mobile Screenshot Shield):</span>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.mobileScreenshotShield !== false}
                    onChange={(e) => setLocalWm({ ...localWm, mobileScreenshotShield: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span className="font-semibold text-white">تفعيل درع حماية الهاتف الذكي من التقاط الشاشة</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.obscureOnAppSwitch !== false}
                    onChange={(e) => setLocalWm({ ...localWm, obscureOnAppSwitch: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>التعتيم التلقائي الفوري عند تبديل التطبيق أو ضغط أزرار الهاتف</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.multiTouchGestureShield !== false}
                    onChange={(e) => setLocalWm({ ...localWm, multiTouchGestureShield: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>حظر إيماءات اللمس المتعدد (سحب 3 أصابع لتصوير الشاشة على أندرويد)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.dynamicFloatingPill !== false}
                    onChange={(e) => setLocalWm({ ...localWm, dynamicFloatingPill: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>الشارة المائية العائمة المتحركة ضد القص (Anti-Crop Floating Pill)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.driftAnimation}
                    onChange={(e) => setLocalWm({ ...localWm, driftAnimation: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>تفعيل النبض الديناميكي للعلامة المائية (Drift Pulse)</span>
                </label>
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#ff4b4f] mb-3 block">
                  معاينة حية للمستند مع العلامة المائية الحالية:
                </span>

                <div className="relative w-full aspect-[4/3] bg-white rounded-lg p-6 shadow-inner overflow-hidden border border-zinc-300 select-none">
                  {/* Watermark Pattern in Preview */}
                  <div
                    className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-around p-4"
                    style={{
                      opacity: localWm.opacity
                    }}
                  >
                    {Array.from({ length: localWm.density === 'high' ? 6 : 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="font-mono font-bold text-zinc-900 whitespace-nowrap p-2"
                        style={{
                          transform: `rotate(${localWm.rotation}deg)`,
                          fontSize: `${localWm.fontSize}px`
                        }}
                        dir="ltr"
                      >
                        client@company.com | 197.34.12.88
                      </div>
                    ))}
                  </div>

                  {/* Mock Text inside preview */}
                  <div className="text-zinc-800 text-[11px] space-y-2 opacity-80">
                    <div className="h-3 w-1/3 bg-zinc-300 rounded" />
                    <div className="h-2 w-full bg-zinc-200 rounded" />
                    <div className="h-2 w-5/6 bg-zinc-200 rounded" />
                    <div className="h-2 w-4/6 bg-zinc-200 rounded" />
                    <div className="h-16 w-full bg-zinc-100 rounded mt-4 p-2 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-500">
                      [مستند PDF محمي بتقنية PDF.js والعلامة المائية الديناميكية لـ MMG VIP]
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 mt-4">
                تظهر هذه العلامة وتتحرك تلقائياً وتغطي كافة محتويات الملف بما يستحيل إخفاؤها حتى مع التقاط لقطة شاشة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 10: MMG HUB ======================= */}
      {activeAdminTab === 'mmg_deploy' && (
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#ff4b4f] bg-[#E40107]/15 px-2.5 py-0.5 rounded-full border border-[#E40107]/30">
                جاهز للرفع 100% إلى خادم MMG المعتمد (cPanel & MySQL)
              </span>
            </div>
            <h2 className="text-xl font-black text-white font-sans">
              ملفات وخطة النشر المباشر لبوابة MMG VIP (Deployment Code & MySQL Schema)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              بدون ووردبريس، بدون إضافات، وبدون تكلفة إضافية. يمكنك نسخ وتحميل الجداول وأكواد PHP و .htaccess بنقرة واحدة لرفعها مباشرة لخادم Modern Media Global (mmglobal.vip).
            </p>
          </div>

          {/* Deployment Steps Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {cpanelDeploymentSteps.map((step) => (
              <div
                key={step.step}
                className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#E40107]/20 text-[#ff4b4f] border border-[#E40107]/30 font-bold flex items-center justify-center mb-2">
                  {step.step}
                </div>
                <h4 className="font-bold text-white mb-1">{step.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Code Tabs: SQL, config.php, auth.php, viewer.php, .htaccess */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            {/* 1. MySQL Schema */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="bg-[#0c0c0e] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#ff4b4f] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#E40107]" /> schema.sql (قاعدة بيانات MySQL للـ cPanel)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(cpanelMysqlSchema, 'sql')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sql' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile(cpanelMysqlSchema, 'schema.sql')}
                    className="px-2.5 py-1 rounded-lg bg-[#E40107]/20 hover:bg-[#E40107]/30 text-xs font-semibold text-[#ff4b4f] border border-[#E40107]/30 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل .sql</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 text-[11px] font-mono text-zinc-300 max-h-60 overflow-y-auto leading-relaxed" dir="ltr">
                {cpanelMysqlSchema}
              </pre>
            </div>

            {/* 2. config.php */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="bg-[#0c0c0e] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#ff4b4f] flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#E40107]" /> config.php (إعدادات الاتصال والأمان والبريد)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(cpanelConfigFilePhp, 'config_php')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'config_php' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'config_php' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile(cpanelConfigFilePhp, 'config.php')}
                    className="px-2.5 py-1 rounded-lg bg-[#E40107]/20 hover:bg-[#E40107]/30 text-xs font-semibold text-[#ff4b4f] border border-[#E40107]/30 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل .php</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 text-[11px] font-mono text-zinc-300 max-h-60 overflow-y-auto leading-relaxed" dir="ltr">
                {cpanelConfigFilePhp}
              </pre>
            </div>

            {/* 3. viewer.php & .htaccess */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="bg-[#0c0c0e] px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">viewer.php (عارض PDF.js المحمي)</span>
                  <button
                    onClick={() => downloadFile(cpanelViewerPhp, 'viewer.php')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل
                  </button>
                </div>
                <pre className="p-3 text-[10px] font-mono text-zinc-300 max-h-48 overflow-y-auto" dir="ltr">
                  {cpanelViewerPhp}
                </pre>
              </div>

              <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="bg-[#0c0c0e] px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400">.htaccess (حماية مجلد الملفات)</span>
                  <button
                    onClick={() => downloadFile(cpanelHtaccess, '.htaccess')}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل
                  </button>
                </div>
                <pre className="p-3 text-[10px] font-mono text-zinc-300 max-h-48 overflow-y-auto" dir="ltr">
                  {cpanelHtaccess}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">إضافة عميل جديد لبوابة MMG VIP</h3>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">اسم العميل / المسؤول</label>
                <input
                  type="text"
                  required
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  placeholder="م. سامي الحربي"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">البريد الإلكتروني للعميل</label>
                <input
                  type="email"
                  required
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                  placeholder="sami@clientco.com"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">اسم الشركة / الجهة</label>
                <input
                  type="text"
                  value={newClientForm.company}
                  onChange={(e) => setNewClientForm({ ...newClientForm, company: e.target.value })}
                  placeholder="شركة المدى للاستثمار"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">تاريخ انتهاء صلاحية الوصول</label>
                <input
                  type="date"
                  value={newClientForm.accessExpiry}
                  onChange={(e) => setNewClientForm({ ...newClientForm, accessExpiry: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40"
                >
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#E40107]" />
                <h3 className="text-base font-bold text-white">إضافة مشروع مخصص جديد</h3>
              </div>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  اسم المشروع <span className="text-[#E40107]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectForm.title}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                  placeholder="مثال: حملة الهوية البصرية 2026 وإطلاق العلامة التجارية"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">تصنيف المشروع</label>
                  <select
                    value={newProjectForm.category}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, category: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  >
                    <option value="استراتيجية تسويقية وتواصل إعلامي">استراتيجية تسويقية وتواصل إعلامي</option>
                    <option value="إنتاج إعلاني ومحتوى مرئي">إنتاج إعلاني ومحتوى مرئي</option>
                    <option value="تطوير هوية بصرية وبراندينج">تطوير هوية بصرية وبراندينج</option>
                    <option value="حملات رقمية وعلاقات عامة">حملات رقمية وعلاقات عامة</option>
                    <option value="شراكات استثمارية واستشارات">شراكات استثمارية واستشارات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">حالة المشروع</label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value as any })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="in-progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتمل (Completed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">وصف المشروع ونطاق العمل</label>
                <textarea
                  rows={2}
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="وصف مختصر للأهداف، المستندات المرتبطة، والجهات المعنية..."
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  تحديد العملاء المصرح لهم بالاطلاع على هذا المشروع:
                </label>
                <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                  {clients.map((c) => {
                    const isChecked = newProjectForm.clientIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProjectForm({
                                ...newProjectForm,
                                clientIds: [...newProjectForm.clientIds, c.id]
                              });
                            } else {
                              setNewProjectForm({
                                ...newProjectForm,
                                clientIds: newProjectForm.clientIds.filter((id) => id !== c.id)
                              });
                            }
                          }}
                          className="rounded accent-[#E40107]"
                        />
                        <span className="font-medium">{c.name}</span>
                        <span className="text-zinc-500 text-[11px]">({c.company})</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  * سيتمكن العملاء المحدّدون فقط من رؤية المستندات المندرجة تحت هذا المشروع في بوابتهم.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40"
                >
                  إنشاء المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCUMENT */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">رفع ملف محمي جديد لبوابة MMG VIP</h3>
            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">المشروع التابع له</label>
                <select
                  value={newDocForm.projectId}
                  onChange={(e) => setNewDocForm({ ...newDocForm, projectId: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">نوع الملف</label>
                <select
                  value={newDocForm.fileType}
                  onChange={(e) => setNewDocForm({ ...newDocForm, fileType: e.target.value as FileType })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                >
                  <option value="pdf">مستند PDF (محمي بتقنية PDF.js)</option>
                  <option value="presentation">عرض تقديمي (Slide Deck)</option>
                  <option value="video">فيديو مرئي محمي (Video)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">عنوان الملف</label>
                <input
                  type="text"
                  required
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  placeholder="تقرير الموازنة العامة والحملة الإعلامية 2025"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">وصف المستند</label>
                <textarea
                  rows={2}
                  value={newDocForm.description}
                  onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                  placeholder="بيان مالي وتكاليف استثمارية للحملة..."
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#E40107]" />
                <span>سيتم دمج العلامة المائية وتفعيل حظر التحميل فور حفظ المستند.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40"
                >
                  حفظ وحماية الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
