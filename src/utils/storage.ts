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
    return saved ? deduplicateById<DocumentItem>(JSON.parse(saved)) : initialDocuments;
  } catch {
    return initialDocuments;
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(deduplicateById(docs)));
};

export const getStoredWatermarkConfig = (): WatermarkConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WATERMARK);
    return saved ? JSON.parse(saved) : initialWatermarkConfig;
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
