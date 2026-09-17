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
import { DocumentItem, ViewLog, LoginLog, WatermarkConfig } from '../types';

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
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Live Cloud Connection established successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Connection warning: the client is offline or starting.');
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
    if (cleanDoc.uploadedFileUrl && cleanDoc.uploadedFileUrl.startsWith('data:') && cleanDoc.uploadedFileUrl.length > 200000) {
      cleanDoc.uploadedFileUrl = `indexeddb://${cleanDoc.id}`;
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
