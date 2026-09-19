import {
  ClientUser,
  Project,
  DocumentItem,
  LoginLog,
  ViewLog,
  AdminNotification,
  WatermarkConfig
} from '../types';
import {
  initialClients,
  initialProjects,
  initialDocuments,
  initialLoginLogs,
  initialViewLogs,
  initialNotifications,
  initialWatermarkConfig
} from '../data/mockData';

const STORAGE_KEYS = {
  CLIENTS: 'scp_clients_data',
  PROJECTS: 'scp_projects_data',
  DOCUMENTS: 'scp_documents_data',
  WATERMARK: 'scp_watermark_data',
  LOGIN_LOGS: 'scp_login_logs',
  VIEW_LOGS: 'scp_view_logs',
  NOTIFICATIONS: 'scp_notifications',
  CURRENT_USER: 'scp_current_user',
  LANGUAGE: 'scp_language'
};

const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const getStoredClients = (): ClientUser[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? deduplicateById<ClientUser>(JSON.parse(saved)) : initialClients;
  } catch {
    return initialClients;
  }
};

export const saveStoredClients = (clients: ClientUser[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(deduplicateById(clients)));
};

export const getStoredProjects = (): Project[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? deduplicateById<Project>(JSON.parse(saved)) : initialProjects;
  } catch {
    return initialProjects;
  }
};

export const saveStoredProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(deduplicateById(projects)));
};

export const getStoredDocuments = (): DocumentItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const docs = saved ? deduplicateById<DocumentItem>(JSON.parse(saved)) : initialDocuments;
    return docs.map((d) => {
      if (
        d.fileType === 'video' &&
        (!d.videoUrl || d.videoUrl.includes('ForBiggerBlazes.mp4') || d.videoUrl.includes('gtv-videos-bucket'))
      ) {
        return {
          ...d,
          videoUrl:
            d.id === 'doc-4'
              ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
              : 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4'
        };
      }
      return d;
    });
  } catch {
    return initialDocuments;
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]) => {
  try {
    const cleanDocs = deduplicateById(docs).map((doc) => {
      // If uploadedFileUrl is a huge data URL, avoid blowing up localStorage 5MB quota
      if (doc.uploadedFileUrl && doc.uploadedFileUrl.startsWith('data:') && doc.uploadedFileUrl.length > 500000) {
        return {
          ...doc,
          uploadedFileUrl: `indexeddb://${doc.id}`
        };
      }
      return doc;
    });
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(cleanDocs));
  } catch (err) {
    console.warn('[Storage] LocalStorage quota exceeded for documents list:', err);
    try {
      // Emergency stripped save
      const strippedDocs = docs.map((d) => ({
        ...d,
        uploadedFileUrl: d.uploadedFileUrl && d.uploadedFileUrl.length > 1000 ? `indexeddb://${d.id}` : d.uploadedFileUrl
      }));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(deduplicateById(strippedDocs)));
    } catch {
      // ignore
    }
  }
};

export const getStoredWatermarkConfig = (): WatermarkConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WATERMARK);
    if (!saved) return initialWatermarkConfig;
    const parsed: WatermarkConfig = JSON.parse(saved);
    // Sanitize any existing stored config that had IP scrolling everywhere
    let template = parsed.template || 'MMG VIP • {name} • {email}';
    if (!parsed.showIp) {
      template = template
        .replace(/\s*\|\s*\{ip\}\s*/g, ' ')
        .replace(/\s*•\s*\{ip\}\s*/g, ' ')
        .replace(/\{ip\}\s*\|\s*/g, '')
        .replace(/\{ip\}\s*•\s*/g, '')
        .replace(/\{ip\}/g, '')
        .trim();
    }
    return {
      ...initialWatermarkConfig,
      ...parsed,
      template: template || 'MMG VIP • {name} • {email} • سري للغاية',
      showIp: false, // Default to no IP scrolling everywhere
      dynamicFloatingPill: false // Disable annoying wandering pill
    };
  } catch {
    return initialWatermarkConfig;
  }
};

export const saveStoredWatermarkConfig = (config: WatermarkConfig) => {
  localStorage.setItem(STORAGE_KEYS.WATERMARK, JSON.stringify(config));
};

export const getStoredLoginLogs = (): LoginLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
    return saved ? deduplicateById<LoginLog>(JSON.parse(saved)) : initialLoginLogs;
  } catch {
    return initialLoginLogs;
  }
};

export const saveStoredLoginLogs = (logs: LoginLog[]) => {
  localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(deduplicateById(logs)));
};

export const getStoredViewLogs = (): ViewLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_LOGS);
    return saved ? deduplicateById<ViewLog>(JSON.parse(saved)) : initialViewLogs;
  } catch {
    return initialViewLogs;
  }
};

export const saveStoredViewLogs = (logs: ViewLog[]) => {
  localStorage.setItem(STORAGE_KEYS.VIEW_LOGS, JSON.stringify(deduplicateById(logs)));
};

export const getStoredNotifications = (): AdminNotification[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? deduplicateById<AdminNotification>(JSON.parse(saved)) : initialNotifications;
  } catch {
    return initialNotifications;
  }
};

export const saveStoredNotifications = (notifs: AdminNotification[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(deduplicateById(notifs)));
};
