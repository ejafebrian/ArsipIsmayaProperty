export type DocumentType = 
  | 'surat_masuk' 
  | 'surat_keluar' 
  | 'dokumen_legal' 
  | 'keuangan' 
  | 'lainnya';

export type DocumentPhysicalStatus = 'Asli' | 'Salinan' | 'Digital';

export type LetterPriority = 'Biasa' | 'Penting' | 'Rahasia' | 'Segera';

export type DispositionStatus = 
  | 'Menunggu Tindak Lanjut' 
  | 'Sedang Diproses' 
  | 'Selesai' 
  | 'Diarsipkan';

export interface Category {
  id: string;
  nama: string;
  kode: string; // e.g. "SM", "SK", "AJB", "SHM", "PBG", "PBB"
  abjadCode: string; // e.g. "A", "B", "C", "D"
  tipeDefault: DocumentType;
  deskripsi: string;
  warna: string;
}

export interface DocumentItem {
  id: string;
  nomorDokumen: string;       // e.g. "A-001/IP-SM/X/2026"
  abjadPrefix: string;        // e.g. "A"
  abjadUrutan: number;        // e.g. 1
  judul: string;
  kategoriId: string;
  kategoriNama: string;
  tipeArsip: DocumentType;
  tanggalDokumen: string;     // YYYY-MM-DD
  tanggalArsip: string;       // YYYY-MM-DD
  pengirim: string;           // Untuk surat masuk / instansi penerbit
  penerima: string;           // Untuk surat keluar / pihak yang dituju
  keterangan: string;         // Ringkasan isi / catatan penting
  lokasiFisik: string;        // e.g. "Lemari A - Rak 2 - Box 01"
  statusFisik: DocumentPhysicalStatus;
  sifatSurat: LetterPriority;
  disposisiStatus?: DispositionStatus;
  disposisiCatatan?: string;
  disposisiTujuan?: string;
  fileData?: string;          // base64 Data URL
  fileName?: string;
  fileSize?: number;          // bytes
  fileType?: string;          // MIME type
  createdAt: string;
  updatedAt: string;
}

export interface LoginActivityItem {
  id: string;
  timestamp: string;
  username: string;
  status: 'BERHASIL' | 'GAGAL' | 'LOGOUT';
  ipAddress: string;
  device: string;
  location: string;
  note?: string;
}

export interface AdminAccount {
  username: string;
  password: string;
  namaLengkap: string;
  email: string;
  jabatan: string;
  nomorTelepon: string;
  terakhirDiperbarui: string;
}

export interface AdminUser {
  username: string;
  namaLengkap: string;
  email?: string;
  jabatan?: string;
  role: 'Administrator' | 'Viewer';
  isLoggedIn: boolean;
  lastLogin?: string;
}

export interface GoogleSheetConfig {
  webAppUrl: string;
  sheetId: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';
  lastSyncMessage?: string;
}

export interface FilterOptions {
  searchQuery: string;
  kategoriId: string;
  tipeArsip: 'semua' | DocumentType;
  abjadPrefix: string; // '' for all, or 'A', 'B', etc.
  tanggalAwal: string;
  tanggalAkhir: string;
  sifatSurat: string;
  statusFisik: string;
  sortBy: 'nomor_asc' | 'nomor_desc' | 'tanggal_desc' | 'tanggal_asc' | 'judul_asc';
}
