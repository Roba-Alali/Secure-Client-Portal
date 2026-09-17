// IndexedDB Persistent Storage for Uploaded Media & Documents (PDF, Video, Images, Presentations)
// Bypasses the 5MB localStorage limit and supports files up to several hundred megabytes.

const DB_NAME = 'MMG_VIP_STORAGE';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

const urlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredFileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  updatedAt: number;
}

export async function saveFileToStorage(
  id: string,
  file: File | Blob,
  fileName?: string
): Promise<string> {
  try {
    const db = await openDatabase();
    const name = fileName || (file instanceof File ? file.name : `file-${id}`);
    const type = file.type || 'application/octet-stream';

    const record: StoredFileRecord = {
      id,
      name,
      type,
      size: file.size,
      data: file,
      updatedAt: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });

    // Create and cache persistent object URL for the active session
    if (urlCache.has(id)) {
      const oldUrl = urlCache.get(id);
      if (oldUrl && oldUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(oldUrl);
        } catch {
          // ignore
        }
      }
    }
    const newUrl = URL.createObjectURL(file);
    urlCache.set(id, newUrl);
    return newUrl;
  } catch (err) {
    console.warn('[Storage] Failed to save file to IndexedDB, fallback to in-memory URL', err);
    const fallbackUrl = URL.createObjectURL(file);
    urlCache.set(id, fallbackUrl);
    return fallbackUrl;
  }
}

export async function getFileUrlFromStorage(id: string): Promise<string | null> {
  if (urlCache.has(id)) {
    return urlCache.get(id)!;
  }

  try {
    const db = await openDatabase();
    const record = await new Promise<StoredFileRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (record && record.data) {
      const url = URL.createObjectURL(record.data);
      urlCache.set(id, url);
      return url;
    }
    return null;
  } catch (err) {
    console.warn('[Storage] Failed to retrieve file from IndexedDB', err);
    return null;
  }
}

export async function deleteFileFromStorage(id: string): Promise<void> {
  try {
    if (urlCache.has(id)) {
      const url = urlCache.get(id);
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      urlCache.delete(id);
    }
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Storage] Failed to delete file from IndexedDB', err);
  }
}
