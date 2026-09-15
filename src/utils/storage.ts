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

export const getStoredClients = (): ClientUser[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  } catch {
    return initialClients;
  }
};

export const saveStoredClients = (clients: ClientUser[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getStoredProjects = (): Project[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : initialProjects;
  } catch {
    return initialProjects;
  }
};

export const saveStoredProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getStoredDocuments = (): DocumentItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : initialDocuments;
  } catch {
    return initialDocuments;
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
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
    return saved ? JSON.parse(saved) : initialLoginLogs;
  } catch {
    return initialLoginLogs;
  }
};

export const saveStoredLoginLogs = (logs: LoginLog[]) => {
  localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(logs));
};

export const getStoredViewLogs = (): ViewLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_LOGS);
    return saved ? JSON.parse(saved) : initialViewLogs;
  } catch {
    return initialViewLogs;
  }
};

export const saveStoredViewLogs = (logs: ViewLog[]) => {
  localStorage.setItem(STORAGE_KEYS.VIEW_LOGS, JSON.stringify(logs));
};

export const getStoredNotifications = (): AdminNotification[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch {
    return initialNotifications;
  }
};

export const saveStoredNotifications = (notifs: AdminNotification[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};
