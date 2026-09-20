import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DocumentItem, ViewLog, LoginLog, WatermarkConfig, Project, ClientUser } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with exact database ID from config (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    // Add a race with a timeout so a slow backend does not hang or produce unhandled errors
    const fetchPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('connection timeout')), 8000)
    );
    await Promise.race([fetchPromise, timeoutPromise]);
    console.log('[Firestore] Live Cloud Connection established successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('timeout') || error.message.includes('unavailable')) {
        console.warn('[Firestore] Operating in client cache/offline mode:', error.message);
        return false;
      }
    }
    return false;
  }
}

// Initial test trigger
testConnection().catch(() => {});

// Cloud Sync Helpers for Documents
export async function saveDocumentToFirestore(document: DocumentItem): Promise<void> {
  const path = `documents/${document.id}`;
  try {
    // Sanitize document so huge base64 strings don't exceed Firestore 1MB document limit
    const cleanDoc = { ...document };
    if (cleanDoc.uploadedFileUrl && cleanDoc.uploadedFileUrl.startsWith('blob:')) {
      cleanDoc.uploadedFileUrl = `indexeddb://${cleanDoc.id}`;
    }
    if (cleanDoc.uploadedFileUrl && cleanDoc.uploadedFileUrl.startsWith('data:') && cleanDoc.uploadedFileUrl.length > 200000) {
      cleanDoc.uploadedFileUrl = `indexeddb://${cleanDoc.id}`;
    }
    if (cleanDoc.rawBase64 && cleanDoc.rawBase64.length > 200000) {
      delete cleanDoc.rawBase64;
    }
    await setDoc(doc(db, 'documents', document.id), cleanDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteDocumentFromFirestore(documentId: string): Promise<void> {
  const path = `documents/${documentId}`;
  try {
    await deleteDoc(doc(db, 'documents', documentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function listenToFirestoreDocuments(
  onDocsUpdated: (docs: DocumentItem[]) => void
): () => void {
  const path = 'documents';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const docs: DocumentItem[] = [];
      snapshot.forEach((snapDoc) => {
        docs.push(snapDoc.data() as DocumentItem);
      });
      if (docs.length > 0) {
        onDocsUpdated(docs);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Cloud Sync Helpers for ViewLogs & Security Audits
export async function saveAuditLogToFirestore(log: ViewLog | LoginLog): Promise<void> {
  const path = `auditLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function listenToFirestoreAuditLogs(
  onLogsUpdated: (logs: ViewLog[]) => void
): () => void {
  const path = 'auditLogs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const logs: ViewLog[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data() as ViewLog;
        if (data.documentId || data.timestamp) {
          logs.push(data);
        }
      });
      if (logs.length > 0) {
        onLogsUpdated(logs);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Cloud Sync Helpers for Watermark Settings
export async function saveWatermarkConfigToFirestore(config: WatermarkConfig): Promise<void> {
  const path = 'settings/watermark';
  try {
    await setDoc(doc(db, 'settings', 'watermark'), config);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function listenToFirestoreWatermark(
  onConfigUpdated: (config: WatermarkConfig) => void
): () => void {
  const path = 'settings/watermark';
  return onSnapshot(
    doc(db, 'settings', 'watermark'),
    (snapshot) => {
      if (snapshot.exists()) {
        onConfigUpdated(snapshot.data() as WatermarkConfig);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Cloud Sync Helpers for Clients
export async function saveClientToFirestore(client: ClientUser): Promise<void> {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), client);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  const path = `clients/${clientId}`;
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function listenToFirestoreClients(
  onClientsUpdated: (clients: ClientUser[]) => void
): () => void {
  const path = 'clients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const clients: ClientUser[] = [];
      snapshot.forEach((snapDoc) => {
        clients.push(snapDoc.data() as ClientUser);
      });
      if (clients.length > 0) {
        onClientsUpdated(clients);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Cloud Sync Helpers for Projects
export async function saveProjectToFirestore(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    await setDoc(doc(db, 'projects', project.id), project);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function listenToFirestoreProjects(
  onProjectsUpdated: (projects: Project[]) => void
): () => void {
  const path = 'projects';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const projs: Project[] = [];
      snapshot.forEach((snapDoc) => {
        projs.push(snapDoc.data() as Project);
      });
      if (projs.length > 0) {
        onProjectsUpdated(projs);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}
