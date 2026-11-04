import { 
  Category, 
  DocumentItem, 
  GoogleSheetConfig, 
  AdminUser, 
  AdminAccount, 
  LoginActivityItem 
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_DOCUMENTS } from '../data/initialData';

const DB_NAME = 'IsmayaPropertyArsipDB';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_CATEGORIES = 'categories';
const STORE_CONFIG = 'config';

const LOCAL_STORAGE_KEY_DOCS = 'ismaya_docs_metadata';
const LOCAL_STORAGE_KEY_CATS = 'ismaya_categories';
const LOCAL_STORAGE_KEY_SHEET = 'ismaya_sheet_config';
const LOCAL_STORAGE_KEY_ADMIN = 'ismaya_admin_session';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initStorage(): Promise<{ documents: DocumentItem[]; categories: Category[] }> {
  try {
    const db = await openDatabase();
    
    // Check categories
    const tx = db.transaction([STORE_CATEGORIES, STORE_DOCS], 'readonly');
    const catStore = tx.objectStore(STORE_CATEGORIES);
    const docStore = tx.objectStore(STORE_DOCS);

    const categoriesReq = catStore.getAll();
    const docsReq = docStore.getAll();

    const [storedCats, storedDocs] = await Promise.all([
      new Promise<Category[]>((res, rej) => {
        categoriesReq.onsuccess = () => res(categoriesReq.result);
        categoriesReq.onerror = () => rej(categoriesReq.error);
      }),
      new Promise<DocumentItem[]>((res, rej) => {
        docsReq.onsuccess = () => res(docsReq.result);
        docsReq.onerror = () => rej(docsReq.error);
      })
    ]);

    let finalCats = storedCats;
    let finalDocs = storedDocs;

    if (!finalCats || finalCats.length === 0) {
      finalCats = INITIAL_CATEGORIES;
      await saveCategories(finalCats);
    }

    if (!finalDocs || finalDocs.length === 0) {
      finalDocs = INITIAL_DOCUMENTS;
      await saveDocuments(finalDocs);
    }

    return { documents: finalDocs, categories: finalCats };
  } catch {
    // LocalStorage fallback
    const localDocs = localStorage.getItem(LOCAL_STORAGE_KEY_DOCS);
    const localCats = localStorage.getItem(LOCAL_STORAGE_KEY_CATS);

    const categories: Category[] = localCats ? JSON.parse(localCats) : INITIAL_CATEGORIES;
    const documents: DocumentItem[] = localDocs ? JSON.parse(localDocs) : INITIAL_DOCUMENTS;

    if (!localCats) localStorage.setItem(LOCAL_STORAGE_KEY_CATS, JSON.stringify(INITIAL_CATEGORIES));
    if (!localDocs) localStorage.setItem(LOCAL_STORAGE_KEY_DOCS, JSON.stringify(INITIAL_DOCUMENTS));

    return { documents, categories };
  }
}

export async function saveDocuments(documents: DocumentItem[]): Promise<void> {
  // Sync to LocalStorage (without big PDF data for fast load fallback)
  try {
    const lightDocs = documents.map(doc => {
      if (doc.fileData && doc.fileData.length > 500000) {
        return { ...doc, fileData: doc.fileData.substring(0, 100) + '...[IN_INDEXED_DB]' };
      }
      return doc;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY_DOCS, JSON.stringify(lightDocs));
  } catch (e) {
    console.warn('LocalStorage limit reached for metadata, using IndexedDB primary', e);
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_DOCS], 'readwrite');
    const store = tx.objectStore(STORE_DOCS);
    
    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const doc of documents) {
      store.put(doc);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error writing to IndexedDB', e);
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_KEY_CATS, JSON.stringify(categories));

  try {
    const db = await openDatabase();
    const tx = db.transaction([STORE_CATEGORIES], 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIES);
    
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const cat of categories) {
      store.put(cat);
    }
  } catch (e) {
    console.error('Error saving categories', e);
  }
}

export function getStoredSheetConfig(): GoogleSheetConfig {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_SHEET);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return {
    webAppUrl: '',
    sheetId: 'https://docs.google.com/spreadsheets/d/1ISMAYA_PROPERTY_EXAMPLE/edit',
    sheetName: 'E-Arsip Ismaya',
    autoSync: false,
    lastSyncTime: null,
    lastSyncStatus: 'idle',
    lastSyncMessage: ''
  };
}

export function saveStoredSheetConfig(config: GoogleSheetConfig): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_SHEET, JSON.stringify(config));
}

export function getStoredAdminUser(): AdminUser {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return {
    username: '',
    namaLengkap: 'Tamu / Belum Login',
    role: 'Viewer',
    isLoggedIn: false, // Initial access requires login page
    lastLogin: undefined
  };
}

export function saveStoredAdminUser(user: AdminUser): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, JSON.stringify(user));
}

const LOCAL_STORAGE_KEY_ADMIN_ACCOUNT = 'ismaya_admin_account';
const LOCAL_STORAGE_KEY_LOGIN_ACTIVITY = 'ismaya_login_activity';

export const DEFAULT_ADMIN_ACCOUNT: AdminAccount = {
  username: 'admin',
  password: 'ismaya123',
  namaLengkap: 'Administrator Utama Arsip',
  email: 'admin.arsip@ismayaproperty.com',
  jabatan: 'Kepala Divisi Legal & Tata Kelola Arsip',
  nomorTelepon: '+62 812-8877-6600',
  terakhirDiperbarui: new Date().toISOString()
};

export function getStoredAdminAccount(): AdminAccount {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN_ACCOUNT);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return DEFAULT_ADMIN_ACCOUNT;
}

export function saveStoredAdminAccount(account: AdminAccount): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN_ACCOUNT, JSON.stringify(account));
}

export const INITIAL_LOGIN_ACTIVITIES: LoginActivityItem[] = [
  {
    id: 'act-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    username: 'admin',
    status: 'BERHASIL',
    ipAddress: '192.168.1.102',
    device: 'Chrome 124 / Windows 11',
    location: 'Kantor Pusat Ismaya Square, Jakarta',
    note: 'Autentikasi administrator utama via web portal'
  },
  {
    id: 'act-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    username: 'admin',
    status: 'BERHASIL',
    ipAddress: '192.168.1.105',
    device: 'Safari / macOS Sonoma',
    location: 'Kantor Pusat Ismaya Square, Jakarta',
    note: 'Sesi kearsipan reguler divisi legal'
  },
  {
    id: 'act-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    username: 'admin',
    status: 'GAGAL',
    ipAddress: '180.252.162.88',
    device: 'Firefox / Android 14',
    location: 'Jakarta Timur, Indonesia',
    note: 'Kata sandi salah (percobaan 1)'
  },
  {
    id: 'act-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    username: 'admin',
    status: 'LOGOUT',
    ipAddress: '192.168.1.102',
    device: 'Chrome 124 / Windows 11',
    location: 'Kantor Pusat Ismaya Square, Jakarta',
    note: 'Pengguna mengakhiri sesi secara aman'
  }
];

export function getStoredLoginActivity(): LoginActivityItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_LOGIN_ACTIVITY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return INITIAL_LOGIN_ACTIVITIES;
}

export function recordLoginActivity(activity: Omit<LoginActivityItem, 'id'>): LoginActivityItem[] {
  const current = getStoredLoginActivity();
  const newItem: LoginActivityItem = {
    ...activity,
    id: `act-${Date.now()}`
  };
  const updated = [newItem, ...current].slice(0, 50); // keep last 50
  localStorage.setItem(LOCAL_STORAGE_KEY_LOGIN_ACTIVITY, JSON.stringify(updated));
  return updated;
}

export function clearStoredLoginActivity(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY_LOGIN_ACTIVITY);
}

export function getClientDeviceString(): string {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'OS';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} / ${os}`;
}

