import React, { useState, useRef, useEffect } from 'react';
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
  FileCode,
  Upload,
  UploadCloud,
  Film,
  FileUp,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import {
  cpanelMysqlSchema,
  cpanelConfigFilePhp,
  cpanelAuthPhp,
  cpanelViewerPhp,
  cpanelHtaccess,
  cpanelDeploymentSteps
} from '../../data/cpanelDeploymentCode';
import { saveFileToStorage } from '../../utils/fileStorage';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

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
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onAddDocument: (doc: DocumentItem) => void;
  onUpdateDocument: (doc: DocumentItem) => void;
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
  onUpdateProject,
  onDeleteProject,
  onAddDocument,
  onUpdateDocument,
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

  // New Document Modal state with Real File Upload Support
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // ================= EDIT CLIENT STATE & HANDLERS =================
  const [editingClient, setEditingClient] = useState<ClientUser | null>(null);
  const [editClientForm, setEditClientForm] = useState({
    name: '',
    nameEn: '',
    email: '',
    company: '',
    companyEn: '',
    phone: '',
    status: 'active' as 'active' | 'suspended' | 'pending',
    accessExpiry: '2026-12-31',
    allowedIp: '',
    assignedProjectIds: [] as string[]
  });

  const startEditClient = (client: ClientUser) => {
    setEditingClient(client);
    setEditClientForm({
      name: client.name,
      nameEn: client.nameEn || client.name,
      email: client.email,
      company: client.company,
      companyEn: client.companyEn || client.company,
      phone: client.phone || '',
      status: client.status,
      accessExpiry: client.accessExpiry || '2026-12-31',
      allowedIp: client.allowedIp || client.ipAddress || '',
      assignedProjectIds: [...client.assignedProjectIds]
    });
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editClientForm.name.trim() || !editClientForm.email.trim()) return;

    const updated: ClientUser = {
      ...editingClient,
      name: editClientForm.name.trim(),
      nameEn: editClientForm.nameEn.trim() || editClientForm.name.trim(),
      email: editClientForm.email.trim(),
      company: editClientForm.company.trim(),
      companyEn: editClientForm.companyEn.trim() || editClientForm.company.trim(),
      phone: editClientForm.phone.trim() || undefined,
      status: editClientForm.status,
      accessExpiry: editClientForm.accessExpiry,
      allowedIp: editClientForm.allowedIp.trim() || undefined,
      ipAddress: editClientForm.allowedIp.trim() || editingClient.ipAddress,
      assignedProjectIds: editClientForm.assignedProjectIds
    };

    onUpdateClient(updated);
    setEditingClient(null);
  };

  // ================= EDIT PROJECT STATE & HANDLERS =================
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    category: '',
    description: '',
    status: 'active' as 'active' | 'in-progress' | 'completed',
    clientIds: [] as string[]
  });

  const startEditProject = (proj: Project) => {
    setEditingProject(proj);
    setEditProjectForm({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      status: proj.status,
      clientIds: [...proj.clientIds]
    });
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editProjectForm.title.trim()) return;

    const updated: Project = {
      ...editingProject,
      title: editProjectForm.title.trim(),
      titleEn: editProjectForm.title.trim(),
      category: editProjectForm.category,
      categoryEn: editProjectForm.category,
      description: editProjectForm.description.trim() || 'مشروع استراتيجي مخصص لعملاء MMG VIP.',
      descriptionEn: editProjectForm.description.trim() || 'MMG VIP Strategic Dedicated Project.',
      status: editProjectForm.status,
      clientIds: editProjectForm.clientIds,
      updatedAt: 'اليوم (معدّل)'
    };

    onUpdateProject(updated);
    setEditingProject(null);
  };

  // ================= EDIT DOCUMENT STATE & HANDLERS =================
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [editDocForm, setEditDocForm] = useState({
    title: '',
    description: '',
    projectId: '',
    fileType: 'pdf' as FileType,
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    pageCount: 5,
    duration: '03:15'
  });

  const startEditDocument = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setEditDocForm({
      title: doc.title,
      description: doc.description,
      projectId: doc.projectId,
      fileType: doc.fileType,
      isConfidential: doc.isConfidential ?? true,
      watermarkEnabled: doc.watermarkEnabled ?? true,
      downloadRestricted: doc.downloadRestricted ?? true,
      pageCount: doc.pageCount || (doc.fileType === 'presentation' ? 6 : 5),
      duration: doc.duration || '03:15'
    });
  };

  const handleSaveEditDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument || !editDocForm.title.trim() || !editDocForm.projectId) return;

    const updated: DocumentItem = {
      ...editingDocument,
      title: editDocForm.title.trim(),
      titleEn: editDocForm.title.trim(),
      description: editDocForm.description.trim() || 'مستند استراتيجي محمي وخاص ببوابة MMG VIP.',
      descriptionEn: editDocForm.description.trim() || 'MMG VIP Protected Document.',
      projectId: editDocForm.projectId,
      fileType: editDocForm.fileType,
      isConfidential: editDocForm.isConfidential,
      watermarkEnabled: editDocForm.watermarkEnabled,
      downloadRestricted: editDocForm.downloadRestricted,
      pageCount: editDocForm.fileType === 'video' ? undefined : editDocForm.pageCount,
      duration: editDocForm.fileType === 'video' ? editDocForm.duration : undefined
    };

    onUpdateDocument(updated);
    setEditingDocument(null);
  };

  // ================= EDIT PERMISSIONS STATE & HANDLERS =================
  const [editingPermissionsClient, setEditingPermissionsClient] = useState<ClientUser | null>(null);
  const [permissionsForm, setPermissionsForm] = useState({
    status: 'active' as 'active' | 'suspended' | 'pending',
    allowedIp: '',
    accessExpiry: '2026-12-31',
    assignedProjectIds: [] as string[]
  });

  const startEditPermissions = (client: ClientUser) => {
    setEditingPermissionsClient(client);
    setPermissionsForm({
      status: client.status,
      allowedIp: client.allowedIp || client.ipAddress || '',
      accessExpiry: client.accessExpiry || '2026-12-31',
      assignedProjectIds: [...client.assignedProjectIds]
    });
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermissionsClient) return;

    const updated: ClientUser = {
      ...editingPermissionsClient,
      status: permissionsForm.status,
      allowedIp: permissionsForm.allowedIp.trim() || undefined,
      ipAddress: permissionsForm.allowedIp.trim() || editingPermissionsClient.ipAddress,
      accessExpiry: permissionsForm.accessExpiry,
      assignedProjectIds: permissionsForm.assignedProjectIds
    };

    onUpdateClient(updated);
    setEditingPermissionsClient(null);
  };

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

  // Format file size helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Handle incoming file selection (drag & drop or click)
  const processIncomingFile = (file: File) => {
    setUploadError(null);
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const mime = file.type.toLowerCase();

    // Auto-detect file type based on extension & mime
    let detectedType: FileType = newDocForm.fileType;
    if (fileExt === 'pdf' || mime.includes('pdf')) {
      detectedType = 'pdf';
    } else if (
      fileExt === 'pptx' ||
      fileExt === 'ppt' ||
      fileExt === 'key' ||
      fileExt === 'odp' ||
      mime.includes('presentation') ||
      mime.includes('powerpoint')
    ) {
      detectedType = 'presentation';
    } else if (
      fileExt === 'mp4' ||
      fileExt === 'mov' ||
      fileExt === 'webm' ||
      fileExt === 'mkv' ||
      fileExt === 'avi' ||
      mime.startsWith('video/')
    ) {
      detectedType = 'video';
    }

    // Generate Object URL for immediate playback/preview
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFilePreviewUrl(objectUrl);

    // If file is under 12MB, read as Base64 Data URL for persistent storage
    if (file.size < 12 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && typeof ev.target.result === 'string') {
          setSelectedFilePreviewUrl(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }

    // Auto-fill title if empty or clean up extension
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    setNewDocForm((prev) => ({
      ...prev,
      fileType: detectedType,
      title: prev.title.trim() ? prev.title : baseName,
      pageCount: detectedType === 'pdf' ? (prev.pageCount || 6) : (detectedType === 'presentation' ? 8 : undefined),
      duration: detectedType === 'video' ? (prev.duration || '03:45') : undefined
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processIncomingFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIncomingFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const resetDocModal = (keepObjectUrl = false) => {
    // Only revoke if user explicitly cancels upload without creating doc
    if (!keepObjectUrl && selectedFilePreviewUrl && selectedFilePreviewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      } catch {
        // ignore
      }
    }
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    setIsDragOver(false);
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

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.title.trim() || !newDocForm.projectId) {
      setUploadError('يرجى كتابة عنوان للملف واختيار المشروع التابع له.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    // Simulate encryption and watermark embedding pipeline
    await new Promise((r) => setTimeout(r, 200));
    setUploadProgress(65);
    await new Promise((r) => setTimeout(r, 200));
    setUploadProgress(100);

    const docId = `doc-${Date.now()}`;
    const fileSizeFormatted = selectedFile ? formatBytes(selectedFile.size) : (newDocForm.fileType === 'video' ? '45 MB' : '3.4 MB');

    // Save actual uploaded file binary to IndexedDB for reliable permanent persistence
    let finalFileUrl = selectedFilePreviewUrl || undefined;
    if (selectedFile) {
      try {
        const storedUrl = await saveFileToStorage(docId, selectedFile, selectedFile.name);
        if (storedUrl) {
          finalFileUrl = storedUrl;
        }
      } catch (storageErr) {
        console.warn('Failed to store in IndexedDB, fallback to memory url:', storageErr);
      }
    }

    // Extract real document contents, pages, and text dynamically
    let extractedText: string | undefined = undefined;
    let extractedHtml: string | undefined = undefined;
    let calculatedPages: string[] | undefined = undefined;
    let dynamicPageCount = newDocForm.pageCount;
    let base64String: string | undefined = undefined;

    if (selectedFile) {
      const fileNameLower = selectedFile.name.toLowerCase();

      // Read small files as Data URL for instant resilient preview
      if (selectedFile.size < 3 * 1024 * 1024) {
        try {
          base64String = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(selectedFile);
          });
        } catch {
          // ignore
        }
      }

      // 1. PDF real text & page extraction
      if (fileNameLower.endsWith('.pdf') || selectedFile.type.includes('pdf')) {
        try {
          const ab = await selectedFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
          dynamicPageCount = pdf.numPages;
          const pages: string[] = [];
          for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            const page = await pdf.getPage(i);
            const tc = await page.getTextContent();
            const str = tc.items.map((it: any) => it.str || '').filter(Boolean).join(' ');
            pages.push(str.trim() || `صفحة ${i}: مستند رسمي معتمد`);
          }
          if (pages.length > 0) {
            calculatedPages = pages;
            extractedText = pages.join('\n\n');
          }
        } catch (pdfErr) {
          console.warn('PDF parsing error during upload:', pdfErr);
        }
      }
      // 2. Word DOCX real HTML & text extraction
      else if (fileNameLower.endsWith('.docx') || selectedFile.type.includes('wordprocessingml')) {
        try {
          const ab = await selectedFile.arrayBuffer();
          const resHtml = await mammoth.convertToHtml({ arrayBuffer: ab });
          extractedHtml = resHtml.value;
          const resRaw = await mammoth.extractRawText({ arrayBuffer: ab });
          extractedText = resRaw.value;
          if (extractedText) {
            const paras = extractedText.split('\n\n').map((p) => p.trim()).filter(Boolean);
            calculatedPages = paras.length > 0 ? paras : [extractedText];
            dynamicPageCount = Math.max(1, Math.ceil(paras.length / 3));
          }
        } catch (docxErr) {
          console.warn('Docx parsing error during upload:', docxErr);
        }
      }
      // 3. Text / Markdown / CSV / JSON
      else if (
        selectedFile.type.startsWith('text/') ||
        fileNameLower.match(/\.(txt|md|csv|json|html|xml|log|rtf|yaml|yml)$/i)
      ) {
        try {
          const text = await selectedFile.text();
          extractedText = text;
          const paras = text.split('\n\n').map((p) => p.trim()).filter(Boolean);
          calculatedPages = paras.length > 0 ? paras : [text];
          dynamicPageCount = Math.max(1, Math.ceil(paras.length / 3));
        } catch (txtErr) {
          console.warn('Text file read error during upload:', txtErr);
        }
      }
    }

    // Build specialized slides or content pages for preview
    const cleanTitle = newDocForm.title.trim();
    const cleanDesc = newDocForm.description.trim() || 'مستند استراتيجي محمي وخاص ببوابة MMG VIP.';

    const newDoc: DocumentItem = {
      id: docId,
      projectId: newDocForm.projectId,
      title: cleanTitle,
      titleEn: cleanTitle,
      description: cleanDesc,
      descriptionEn: cleanDesc,
      fileType: newDocForm.fileType,
      fileSize: fileSizeFormatted,
      pageCount: newDocForm.fileType === 'video' ? undefined : (dynamicPageCount || (newDocForm.pageCount || (newDocForm.fileType === 'presentation' ? 6 : 5))),
      duration: newDocForm.fileType === 'video' ? (newDocForm.duration || '03:15') : undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      isConfidential: true,
      watermarkEnabled: true,
      downloadRestricted: true,
      viewsCount: 0,
      uploadedFileUrl: finalFileUrl,
      originalFileName: selectedFile?.name || `${cleanTitle}.${newDocForm.fileType === 'pdf' ? 'pdf' : newDocForm.fileType === 'video' ? 'mp4' : 'pptx'}`,
      mimeType: selectedFile?.type,
      extractedText,
      extractedHtml,
      rawBase64: base64String,
      contentPages: calculatedPages || [
        `صفحة 1: ملف معتمد مرفوع حديثاً: ${cleanTitle}`,
        `صفحة 2: بيانات المشروع والتحليلات السرية - ${cleanDesc}`,
        `صفحة 3: دراسة التكاليف والجدول الزمني لتنفيذ المبادرة الإعلامية.`,
        `صفحة 4: مؤشرات الأداء والتقارير الرقابية الصادرة عن Modern Media Global.`,
        `صفحة 5: الاعتمادات الرسمية والشروط القانونية المرفقة بالملف.`
      ],
      slides: [
        {
          title: cleanTitle,
          subtitle: cleanDesc,
          content: [
            'الرؤية والهدف الأساسي للمشروع الاستراتيجي',
            'خطة العمل والجدول الزمني المعتمد لـ Modern Media Global',
            'معايير الحماية والأمان وتدابير منع التسريب'
          ]
        },
        {
          title: 'مؤشرات الأداء والتنفيذ الفعلي',
          subtitle: 'تحليل المعطيات والأهداف المرحلية',
          content: [
            'المرحلة الأولى: التأسيس والبناء الرقمي',
            'المرحلة الثانية: الإطلاق والتوزيع الحصري',
            'المرحلة الثالثة: قياس الأثر والعائد الاستثماري'
          ]
        },
        {
          title: 'التوصيات والخطوات القادمة',
          subtitle: 'اعتماد فريق الإدارة التنفيذية لـ MMG',
          content: [
            'تفعيل التنبيهات الفورية عند استعراض العميل للشرائح',
            'تطبيق العلامة المائية الشفافة لحماية الملكية الفكرية',
            'الربط المباشر مع سجل النشاط والأمان'
          ]
        }
      ],
      videoUrl: finalFileUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    };

    onAddDocument(newDoc);
    setIsUploading(false);
    resetDocModal(true);
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
                          onClick={() => startEditClient(client)}
                          className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="تعديل بيانات العميل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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

                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => startEditProject(proj)}
                        className="flex-1 py-1.5 bg-zinc-900 hover:bg-blue-500/20 text-zinc-300 hover:text-blue-400 rounded-lg text-xs font-semibold border border-zinc-800 hover:border-blue-500/40 transition-all flex items-center justify-center gap-1.5"
                        title="تعديل بيانات المشروع وتعيين العملاء"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل المشروع</span>
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg border border-zinc-800 hover:border-rose-500/40 transition-all"
                        title="حذف المشروع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEditDocument(doc)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-zinc-700/60 transition-colors flex items-center gap-1 text-[11px]"
                            title="تعديل بيانات المستند والمشروع والصلاحيات"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
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
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#E40107]" />
                <span>مصفوفة التحكم في الصلاحيات والأمان (Access Control & Permissions)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                التحكم الشامل في أذونات كل عميل، تقييد عناوين IP، تواريخ انتهاء الصلاحية، وتخصيص المشاريع.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allProjectIds = projects.map((p) => p.id);
                  clients.forEach((c) => {
                    onUpdateClient({ ...c, assignedProjectIds: allProjectIds });
                  });
                }}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                title="منح حق الوصول لجميع المشاريع لجميع العملاء دفعة واحدة"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>منح كافة المشاريع للجميع</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                <tr>
                  <th className="p-3 min-w-[160px]">اسم العميل والشركة</th>
                  <th className="p-3 text-center">حالة الحساب</th>
                  {projects.map((p) => (
                    <th key={p.id} className="p-3 text-center min-w-[120px]">
                      <div className="font-bold text-white truncate max-w-[140px]">{p.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">{p.category}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center">تقييد عنوان IP</th>
                  <th className="p-3 text-center">انتهاء الصلاحية</th>
                  <th className="p-3 text-center min-w-[130px]">إدارة الصلاحيات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-zinc-400">{client.company}</div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const updated = {
                            ...client,
                            status: client.status === 'active' ? ('suspended' as const) : ('active' as const)
                          };
                          onUpdateClient(updated);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                          client.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                        title="تبديل حالة الحساب"
                      >
                        {client.status === 'active' ? 'نشط' : 'موقوف'}
                      </button>
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
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              isAssigned
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                            title={isAssigned ? 'انقر للحجب' : 'انقر لمنح الصلاحية'}
                          >
                            {isAssigned ? '✓ مصرح' : 'محجوب'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-3 text-center font-mono text-zinc-300" dir="ltr">
                      {client.allowedIp || client.ipAddress ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                          {client.allowedIp || client.ipAddress}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">أي عنوان IP</span>
                      )}
                    </td>

                    <td className="p-3 text-center font-mono text-zinc-400">
                      {client.accessExpiry || 'مستمر'}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => startEditPermissions(client)}
                        className="px-3 py-1.5 rounded-lg bg-[#E40107]/15 hover:bg-[#E40107]/25 text-[#ff4b4f] border border-[#E40107]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm"
                        title="تعديل الصلاحيات بالكامل"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>تعديل الصلاحيات</span>
                      </button>
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
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{name}'}</code>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[#ff4b4f] font-mono">{'{date}'}</code>
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono" title="عنوان IP (معطل افتراضياً)">{'{ip}'}</code>
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
                    checked={localWm.showIp === true}
                    onChange={(e) => setLocalWm({ ...localWm, showIp: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>إظهار عنوان IP في العلامة (معطّل افتراضياً لعدم التشويش)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.dynamicFloatingPill === true}
                    onChange={(e) => setLocalWm({ ...localWm, dynamicFloatingPill: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span>شارة الأمان السفلية الثابتة (Bottom DRM Security Badge)</span>
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

              {/* Session Termination & Exit Protection */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <Lock className="w-4 h-4" />
                  <span>سياسة حماية الجلسات وإنهاء الدخول (Session Auto-Termination):</span>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localWm.autoTerminateOnExit !== false}
                    onChange={(e) => setLocalWm({ ...localWm, autoTerminateOnExit: e.target.checked })}
                    className="rounded accent-[#E40107]"
                  />
                  <span className="font-semibold text-white">إنهاء الجلسة فور إغلاق المتصفح أو مغادرة النافذة (حظر تذكر الدخول الدائم)</span>
                </label>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>مهلة الخمول التلقائية لإغلاق الجلسة (دقائق):</span>
                  <select
                    value={localWm.sessionTimeoutMinutes || 15}
                    onChange={(e) => setLocalWm({ ...localWm, sessionTimeoutMinutes: parseInt(e.target.value) || 15 })}
                    className="bg-[#09090b] border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value={5}>5 دقائق من الخمول</option>
                    <option value={10}>10 دقائق من الخمول</option>
                    <option value={15}>15 دقيقة (موصى بها أمنياً)</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={60}>ساعة واحدة</option>
                  </select>
                </div>
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

      {/* MODAL: ADD DOCUMENT WITH FILE UPLOAD */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E40107]/20 border border-[#E40107]/40 flex items-center justify-center text-[#ff4b4f]">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-white">رفع ملف محمي جديد لبوابة MMG VIP</h3>
                  <p className="text-[11px] text-zinc-400">دعم ملفات PDF، العروض التقديمية، ومقاطع الفيديو المحمية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetDocModal}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* PROJECT SELECTION */}
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">المشروع التابع له</label>
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

              {/* FILE TYPE SELECTION TABS */}
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">نوع الملف المصنّف</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDocForm({ ...newDocForm, fileType: 'pdf' })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                      newDocForm.fileType === 'pdf'
                        ? 'bg-[#E40107]/15 border-[#E40107] text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${newDocForm.fileType === 'pdf' ? 'text-[#ff4b4f]' : ''}`} />
                    <span className="font-bold text-[11px]">مستند PDF</span>
                    <span className="text-[9px] text-zinc-500">.pdf</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDocForm({ ...newDocForm, fileType: 'presentation' })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                      newDocForm.fileType === 'presentation'
                        ? 'bg-[#E40107]/15 border-[#E40107] text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Presentation className={`w-4 h-4 ${newDocForm.fileType === 'presentation' ? 'text-[#ff4b4f]' : ''}`} />
                    <span className="font-bold text-[11px]">عرض تقديمي</span>
                    <span className="text-[9px] text-zinc-500">.pptx, .key</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDocForm({ ...newDocForm, fileType: 'video' })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                      newDocForm.fileType === 'video'
                        ? 'bg-[#E40107]/15 border-[#E40107] text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Video className={`w-4 h-4 ${newDocForm.fileType === 'video' ? 'text-[#ff4b4f]' : ''}`} />
                    <span className="font-bold text-[11px]">فيديو مرئي</span>
                    <span className="text-[9px] text-zinc-500">.mp4, .mov</span>
                  </button>
                </div>
              </div>

              {/* FILE UPLOAD DROPZONE */}
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold flex items-center justify-between">
                  <span>رفع الملف الفعلي من جهازك</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {newDocForm.fileType === 'pdf' && 'ملفات PDF حتى 100MB'}
                    {newDocForm.fileType === 'presentation' && 'عروض PowerPoint / Keynote'}
                    {newDocForm.fileType === 'video' && 'مقاطع MP4, MOV, WebM'}
                  </span>
                </label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept={
                    newDocForm.fileType === 'pdf'
                      ? 'application/pdf,.pdf'
                      : newDocForm.fileType === 'presentation'
                      ? '.pptx,.ppt,.key,.odp,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                      : 'video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv'
                  }
                  className="hidden"
                />

                {/* Dropzone container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#E40107] bg-[#E40107]/10'
                      : selectedFile
                      ? 'border-emerald-600/80 bg-emerald-950/20 hover:bg-emerald-950/30'
                      : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/60 hover:bg-zinc-900/60'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-3 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                          {newDocForm.fileType === 'video' ? (
                            <Film className="w-5 h-5" />
                          ) : newDocForm.fileType === 'presentation' ? (
                            <Presentation className="w-5 h-5" />
                          ) : (
                            <FileCheck className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-xs truncate max-w-[220px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-zinc-400 text-[10px] mt-0.5">
                            الحجم: {formatBytes(selectedFile.size)} • النوع: {selectedFile.type || newDocForm.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
                          setSelectedFile(null);
                          setSelectedFilePreviewUrl(null);
                        }}
                        className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="إزالة الملف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-2 group-hover:scale-105 transition-transform">
                        <FileUp className="w-5 h-5 text-[#E40107]" />
                      </div>
                      <p className="text-white font-bold text-xs mb-1">
                        اسحب الملف وأفلته هنا أو <span className="text-[#ff4b4f] underline">تصفّح جهازك</span>
                      </p>
                      <p className="text-zinc-400 text-[10px]">
                        {newDocForm.fileType === 'pdf' && 'يدعم PDF مع ترقيم الصفحات وتطبيق الأمان التلقائي'}
                        {newDocForm.fileType === 'presentation' && 'يدعم عروض الشرائح والملخصات التنفيذية'}
                        {newDocForm.fileType === 'video' && 'يدعم تشغيل الفيديو المباشر ومراقبة معدل الاستعراض'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* TITLE */}
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

              {/* DESCRIPTION */}
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

              {/* DYNAMIC METRICS: PAGES OR DURATION */}
              {newDocForm.fileType === 'video' ? (
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">المدة التقديرية (دقيقة:ثانية)</label>
                  <input
                    type="text"
                    value={newDocForm.duration || '03:15'}
                    onChange={(e) => setNewDocForm({ ...newDocForm, duration: e.target.value })}
                    placeholder="03:15"
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    {newDocForm.fileType === 'presentation' ? 'عدد الشرائح' : 'عدد الصفحات'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={newDocForm.pageCount || (newDocForm.fileType === 'presentation' ? 6 : 5)}
                    onChange={(e) => setNewDocForm({ ...newDocForm, pageCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  />
                </div>
              )}

              {/* UPLOAD PROGRESS BAR IF ACTIVE */}
              {isUploading && (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-300 font-medium">جاري تشفير الملف وتطبيق العلامة المائية...</span>
                    <span className="text-[#ff4b4f] font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#E40107] h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#E40107]" />
                <span>سيتم دمج العلامة المائية وحظر لقطات الشاشة وتتبع وقت القراءة فور حفظ الملف.</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={resetDocModal}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <span>جاري التشفير والحفظ...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>حفظ وتأمين الملف</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT CLIENT ======================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">تعديل بيانات العميل الكاملة</h3>
                  <p className="text-[11px] text-zinc-400">{editingClient.name} ({editingClient.company})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    الاسم الكامل (عربي) <span className="text-[#E40107]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.name}
                    onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={editClientForm.nameEn}
                    onChange={(e) => setEditClientForm({ ...editClientForm, nameEn: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    البريد الإلكتروني لتسجيل الدخول <span className="text-[#E40107]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editClientForm.email}
                    onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={editClientForm.phone}
                    onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">اسم الشركة / المؤسسة</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.company}
                    onChange={(e) => setEditClientForm({ ...editClientForm, company: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">حالة الحساب</label>
                  <select
                    value={editClientForm.status}
                    onChange={(e) => setEditClientForm({ ...editClientForm, status: e.target.value as any })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">نشط ومصرح له بالدخول (Active)</option>
                    <option value="suspended">موقوف مؤقتاً (Suspended)</option>
                    <option value="pending">قيد المراجعة (Pending)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={editClientForm.accessExpiry}
                    onChange={(e) => setEditClientForm({ ...editClientForm, accessExpiry: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">تقييد عنوان IP المسموح</label>
                  <input
                    type="text"
                    value={editClientForm.allowedIp}
                    onChange={(e) => setEditClientForm({ ...editClientForm, allowedIp: e.target.value })}
                    placeholder="فارغ = أي عنوان IP"
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-semibold">المشاريع المخصصة لهذا العميل:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditClientForm({ ...editClientForm, assignedProjectIds: projects.map(p => p.id) })}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditClientForm({ ...editClientForm, assignedProjectIds: [] })}
                      className="text-[10px] text-zinc-400 hover:underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
                  {projects.map((proj) => {
                    const isSelected = editClientForm.assignedProjectIds.includes(proj.id);
                    return (
                      <label
                        key={proj.id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800/60 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditClientForm({
                                ...editClientForm,
                                assignedProjectIds: [...editClientForm.assignedProjectIds, proj.id]
                              });
                            } else {
                              setEditClientForm({
                                ...editClientForm,
                                assignedProjectIds: editClientForm.assignedProjectIds.filter(id => id !== proj.id)
                              });
                            }
                          }}
                          className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span className="text-zinc-200 font-medium">{proj.title}</span>
                        <span className="text-[10px] text-zinc-500 mr-auto font-mono">{proj.category}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/40 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات في السحابة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT PROJECT ======================= */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#E40107]" />
                <div>
                  <h3 className="text-base font-bold text-white">تعديل بيانات المشروع المخصص</h3>
                  <p className="text-[11px] text-zinc-400">{editingProject.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  اسم المشروع <span className="text-[#E40107]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editProjectForm.title}
                  onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">تصنيف المشروع</label>
                  <select
                    value={editProjectForm.category}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, category: e.target.value })}
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
                    value={editProjectForm.status}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value as any })}
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
                  value={editProjectForm.description}
                  onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                  placeholder="وصف مختصر للأهداف والمستندات..."
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-semibold">العملاء المصرح لهم بالاطلاع على هذا المشروع:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProjectForm({ ...editProjectForm, clientIds: clients.map(c => c.id) })}
                      className="text-[10px] text-[#ff4b4f] hover:underline"
                    >
                      تحديد جميع العملاء
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditProjectForm({ ...editProjectForm, clientIds: [] })}
                      className="text-[10px] text-zinc-400 hover:underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
                  {clients.map((client) => {
                    const isSelected = editProjectForm.clientIds.includes(client.id);
                    return (
                      <label
                        key={client.id}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800/60 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditProjectForm({
                                ...editProjectForm,
                                clientIds: [...editProjectForm.clientIds, client.id]
                              });
                            } else {
                              setEditProjectForm({
                                ...editProjectForm,
                                clientIds: editProjectForm.clientIds.filter(id => id !== client.id)
                              });
                            }
                          }}
                          className="rounded border-zinc-700 text-[#E40107] focus:ring-[#E40107]/20"
                        />
                        <span className="text-zinc-200 font-medium">{client.name}</span>
                        <span className="text-[10px] text-zinc-400 mr-auto">({client.company})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ تعديلات المشروع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT DOCUMENT ======================= */}
      {editingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">تعديل بيانات المستند والمشروع والصلاحيات</h3>
                  <p className="text-[11px] text-zinc-400">{editingDocument.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDocument(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  عنوان المستند <span className="text-[#E40107]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDocForm.title}
                  onChange={(e) => setEditDocForm({ ...editDocForm, title: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  المشروع التابع له <span className="text-[#E40107]">*</span>
                </label>
                <select
                  required
                  value={editDocForm.projectId}
                  onChange={(e) => setEditDocForm({ ...editDocForm, projectId: e.target.value })}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">نوع الملف</label>
                  <select
                    value={editDocForm.fileType}
                    onChange={(e) => setEditDocForm({ ...editDocForm, fileType: e.target.value as FileType })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="pdf">مستند استراتيجي (PDF)</option>
                    <option value="presentation">عرض تقديمي تفاعلي (Presentation)</option>
                    <option value="video">محتوى إعلاني / فيديو (Video MP4)</option>
                  </select>
                </div>

                <div>
                  {editDocForm.fileType === 'video' ? (
                    <div>
                      <label className="block text-zinc-300 mb-1 font-semibold">مدة العرض</label>
                      <input
                        type="text"
                        value={editDocForm.duration}
                        onChange={(e) => setEditDocForm({ ...editDocForm, duration: e.target.value })}
                        placeholder="03:15"
                        className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                        dir="ltr"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-zinc-300 mb-1 font-semibold">عدد الصفحات</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={editDocForm.pageCount}
                        onChange={(e) => setEditDocForm({ ...editDocForm, pageCount: parseInt(e.target.value) || 1 })}
                        className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">وصف المستند</label>
                <textarea
                  rows={2}
                  value={editDocForm.description}
                  onChange={(e) => setEditDocForm({ ...editDocForm, description: e.target.value })}
                  placeholder="وصف لمحتويات المستند والتوصيات..."
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Security Switches */}
              <div className="p-3 bg-[#09090b] rounded-xl border border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-semibold text-zinc-300 block">إعدادات الحماية والأمان المطبقة:</span>
                
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDocForm.watermarkEnabled}
                    onChange={(e) => setEditDocForm({ ...editDocForm, watermarkEnabled: e.target.checked })}
                    className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-zinc-200">تفعيل العلامة المائية الديناميكية ببيانات العميل</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDocForm.downloadRestricted}
                    onChange={(e) => setEditDocForm({ ...editDocForm, downloadRestricted: e.target.checked })}
                    className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-zinc-200">حظر التحميل المباشر وتفعيل الحماية من النسخ</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDocForm.isConfidential}
                    onChange={(e) => setEditDocForm({ ...editDocForm, isConfidential: e.target.checked })}
                    className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-zinc-200">وسم الملف كـ "سري للغاية ومحمي بحقوق MMG"</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingDocument(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/40 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ تعديلات المستند</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT PERMISSIONS ======================= */}
      {editingPermissionsClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#E40107]" />
                <div>
                  <h3 className="text-base font-bold text-white">إدارة وتعديل الصلاحيات والأمان المتقدم</h3>
                  <p className="text-[11px] text-zinc-400">{editingPermissionsClient.name} - {editingPermissionsClient.company}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPermissionsClient(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-4 text-xs">
              <div className="p-3 bg-[#09090b] rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{editingPermissionsClient.name}</div>
                  <div className="text-[11px] text-zinc-400">{editingPermissionsClient.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                  {editingPermissionsClient.company}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">حالة الحساب والصلاحية</label>
                  <select
                    value={permissionsForm.status}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, status: e.target.value as any })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  >
                    <option value="active">نشط ومصرح له بالدخول (Active)</option>
                    <option value="suspended">موقوف مؤقتاً (Suspended)</option>
                    <option value="pending">قيد المراجعة (Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={permissionsForm.accessExpiry}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, accessExpiry: e.target.value })}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E40107]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  تقييد عنوان الشبكة (Allowed IP Whitelist)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={permissionsForm.allowedIp}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, allowedIp: e.target.value })}
                    placeholder="مثال: 197.34.12.88 (اتركه فارغاً للسماح من أي عنوان)"
                    className="flex-1 bg-[#09090b] border border-zinc-700 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E40107]"
                    dir="ltr"
                  />
                  {permissionsForm.allowedIp && (
                    <button
                      type="button"
                      onClick={() => setPermissionsForm({ ...permissionsForm, allowedIp: '' })}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs transition-colors"
                    >
                      إلغاء التقييد
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  إذا تم تعيين IP محدد، سيتم حظر أي محاولة دخول من أي شبكة أخرى فورياً.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-semibold">
                    المشاريع المصرح للعميل بالاطلاع عليها ({permissionsForm.assignedProjectIds.length} من {projects.length}):
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPermissionsForm({ ...permissionsForm, assignedProjectIds: projects.map(p => p.id) })}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      منح كافة المشاريع
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => setPermissionsForm({ ...permissionsForm, assignedProjectIds: [] })}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      حظر كافة المشاريع
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
                  {projects.map((proj) => {
                    const isSelected = permissionsForm.assignedProjectIds.includes(proj.id);
                    return (
                      <label
                        key={proj.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                            : 'hover:bg-zinc-800/60 border-transparent text-zinc-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPermissionsForm({
                                ...permissionsForm,
                                assignedProjectIds: [...permissionsForm.assignedProjectIds, proj.id]
                              });
                            } else {
                              setPermissionsForm({
                                ...permissionsForm,
                                assignedProjectIds: permissionsForm.assignedProjectIds.filter(id => id !== proj.id)
                              });
                            }
                          }}
                          className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-xs">{proj.title}</div>
                          <div className="text-[10px] text-zinc-500">{proj.category}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {isSelected ? 'مصرح' : 'محجوب'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>الحماية النشطة تلقائياً لهذا العميل:</span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  العلامة المائية الشاملة + درع منع لقطات الشاشة DLP + تسجيل أوقات القراءة وتنبيهات الدخول الفورية.
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsClient(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E40107] hover:bg-[#c90005] text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تطبيق وحفظ الصلاحيات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
