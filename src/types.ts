export type UserRole = 'client' | 'admin';

export interface ClientUser {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  company: string;
  companyEn: string;
  phone?: string;
  status: 'active' | 'suspended' | 'pending';
  assignedProjectIds: string[];
  lastLogin?: string;
  ipAddress?: string;
  accessExpiry?: string;
  allowedIp?: string;
}

export type FileType = 'pdf' | 'presentation' | 'video';

export interface DocumentItem {
  id: string;
  projectId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  fileType: FileType;
  fileSize: string;
  pageCount?: number;
  duration?: string;
  uploadedAt: string;
  isConfidential: boolean;
  watermarkEnabled: boolean;
  downloadRestricted: boolean;
  viewsCount: number;
  // Demo content simulated
  contentPages?: string[];
  slides?: { title: string; subtitle: string; content: string[] }[];
  videoUrl?: string;
  uploadedFileUrl?: string;
  originalFileName?: string;
  mimeType?: string;
  extractedText?: string;
  extractedHtml?: string;
  rawBase64?: string;
}

export interface Project {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  clientIds: string[];
  status: 'active' | 'in-progress' | 'completed';
  updatedAt: string;
  documentCount: {
    pdf: number;
    presentation: number;
    video: number;
  };
}

export interface WatermarkConfig {
  enabled: boolean;
  template: string; // e.g. "{email} | {ip} | {date} | سري للغاية"
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  density: 'low' | 'medium' | 'high';
  driftAnimation: boolean;
  showClientName: boolean;
  showTimestamp: boolean;
  showIp: boolean;
  // Mobile Screenshot Shield & DLP properties
  mobileScreenshotShield: boolean;
  obscureOnAppSwitch: boolean;
  multiTouchGestureShield: boolean;
  dynamicFloatingPill: boolean;
  antiCropCornerStamps: boolean;
  // Session Security & Auto-Termination
  autoTerminateOnExit: boolean;
  sessionTimeoutMinutes: number;
}

export interface LoginLog {
  id: string;
  clientId: string;
  clientName: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;
  timestamp: string;
  status: 'success' | 'failed' | '2fa_verified';
}

export interface ViewLog {
  id: string;
  documentId: string;
  documentTitle: string;
  fileType: FileType;
  clientId: string;
  clientName: string;
  clientEmail: string;
  ipAddress: string;
  durationSeconds: number;
  pagesViewed?: number;
  maxPageReached?: number;
  timestamp: string;
  watermarkApplied: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: 'login' | 'view' | 'security' | 'export';
  timestamp: string;
  read: boolean;
  metadata?: {
    clientId?: string;
    documentId?: string;
    ipAddress?: string;
  };
}
