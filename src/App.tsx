import React, { useState, useEffect, useMemo } from 'react';
import { 
  DocumentItem, 
  Category, 
  AdminUser, 
  GoogleSheetConfig, 
  FilterOptions, 
  DocumentType 
} from './types';
import { 
  initStorage, 
  saveDocuments, 
  saveCategories, 
  getStoredSheetConfig, 
  saveStoredSheetConfig, 
  getStoredAdminUser, 
  saveStoredAdminUser,
  recordLoginActivity,
  getClientDeviceString
} from './utils/db';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { DocumentTable } from './components/DocumentTable';
import { DocumentCards } from './components/DocumentCards';
import { DocumentModal } from './components/DocumentModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { CategoryModal } from './components/CategoryModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PrintArchiveModal } from './components/PrintArchiveModal';
import { LoginPage } from './components/LoginPage';
import { AdminProfileModal } from './components/AdminProfileModal';
import { 
  Building2, 
  FileSpreadsheet, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  DownloadCloud,
  UserCheck
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser>(getStoredAdminUser());
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(getStoredSheetConfig());
  const [isLoading, setIsLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentItem | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<DocumentItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false);

  // Delete confirmation
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    kategoriId: '',
    tipeArsip: 'semua',
    abjadPrefix: '',
    tanggalAwal: '',
    tanggalAkhir: '',
    sifatSurat: '',
    statusFisik: '',
    sortBy: 'nomor_asc'
  });

  // Sync tab with filters
  useEffect(() => {
    if (activeTab === 'semua') {
      setFilters(prev => ({ ...prev, tipeArsip: 'semua' }));
    } else if (activeTab === 'surat_masuk') {
      setFilters(prev => ({ ...prev, tipeArsip: 'surat_masuk' }));
    } else if (activeTab === 'surat_keluar') {
      setFilters(prev => ({ ...prev, tipeArsip: 'surat_keluar' }));
    } else if (activeTab === 'dokumen_legal') {
      setFilters(prev => ({ ...prev, tipeArsip: 'dokumen_legal' }));
    }
  }, [activeTab]);

  // Load from Storage
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const stored = await initStorage();
        setDocuments(stored.documents);
        setCategories(stored.categories);
      } catch (e) {
        console.error('Failed to init storage', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Save documents to IndexedDB / LocalStorage
  const handleSaveDocument = async (doc: DocumentItem) => {
    let updatedDocs: DocumentItem[];
    const exists = documents.some(d => d.id === doc.id);
    if (exists) {
      updatedDocs = documents.map(d => (d.id === doc.id ? doc : d));
      showToast(`Dokumen "${doc.nomorDokumen}" berhasil diperbarui.`);
    } else {
      updatedDocs = [doc, ...documents];
      showToast(`Dokumen "${doc.nomorDokumen}" berhasil ditambahkan ke arsip.`);
    }

    setDocuments(updatedDocs);
    await saveDocuments(updatedDocs);
    setIsDocModalOpen(false);
    setDocumentToEdit(null);
  };

  // Delete document
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    const updatedDocs = documents.filter(d => d.id !== docToDelete.id);
    setDocuments(updatedDocs);
    await saveDocuments(updatedDocs);
    showToast(`Dokumen "${docToDelete.nomorDokumen}" telah dihapus.`);
    setDocToDelete(null);
  };

  // Categories
  const handleSaveCategory = async (cat: Category) => {
    let updatedCats: Category[];
    const exists = categories.some(c => c.id === cat.id);
    if (exists) {
      updatedCats = categories.map(c => (c.id === cat.id ? cat : c));
      showToast(`Kategori "${cat.nama}" diperbarui.`);
    } else {
      updatedCats = [...categories, cat];
      showToast(`Kategori "${cat.nama}" berhasil ditambahkan.`);
    }
    setCategories(updatedCats);
    await saveCategories(updatedCats);
  };

  const handleDeleteCategory = async (catId: string) => {
    const updatedCats = categories.filter(c => c.id !== catId);
    setCategories(updatedCats);
    await saveCategories(updatedCats);
    showToast('Kategori telah dihapus.');
  };

  // Google Sheets Config
  const handleSaveSheetConfig = (newConfig: GoogleSheetConfig) => {
    setSheetConfig(newConfig);
    saveStoredSheetConfig(newConfig);
  };

  // Admin Session
  const handleLogin = (user: AdminUser) => {
    setAdminUser(user);
    saveStoredAdminUser(user);
    showToast('Berhasil masuk sebagai Administrator.');
  };

  const handleLogout = () => {
    recordLoginActivity({
      timestamp: new Date().toISOString(),
      username: adminUser.username || 'admin',
      status: 'LOGOUT',
      ipAddress: '192.168.1.102',
      device: getClientDeviceString(),
      location: 'Kantor Pusat Ismaya Square, Jakarta',
      note: 'Pengguna mengakhiri sesi administrator'
    });

    const guestUser: AdminUser = {
      username: '',
      namaLengkap: 'Tamu / Belum Login',
      role: 'Viewer',
      isLoggedIn: false
    };
    setAdminUser(guestUser);
    saveStoredAdminUser(guestUser);
    showToast('Anda telah keluar dari sistem e-arsip.');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      kategoriId: '',
      tipeArsip: activeTab === 'semua' ? 'semua' : (activeTab as DocumentType),
      abjadPrefix: '',
      tanggalAwal: '',
      tanggalAkhir: '',
      sifatSurat: '',
      statusFisik: '',
      sortBy: 'nomor_asc'
    });
  };

  // Compute available alphabet prefixes for quick filter bar
  const availableAlphabetPrefixes = useMemo(() => {
    const set = new Set<string>();
    documents.forEach(d => {
      if (d.abjadPrefix) {
        set.add(d.abjadPrefix.toUpperCase());
      }
    });
    return Array.from(set);
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search query (Nomor, Judul, Pengirim, Penerima, Keterangan, Lokasi)
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = doc.judul?.toLowerCase().includes(q);
        const matchNumber = doc.nomorDokumen?.toLowerCase().includes(q);
        const matchSender = doc.pengirim?.toLowerCase().includes(q);
        const matchReceiver = doc.penerima?.toLowerCase().includes(q);
        const matchDesc = doc.keterangan?.toLowerCase().includes(q);
        const matchLocation = doc.lokasiFisik?.toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchSender && !matchReceiver && !matchDesc && !matchLocation) {
          return false;
        }
      }

      // Kategori
      if (filters.kategoriId && doc.kategoriId !== filters.kategoriId) {
        return false;
      }

      // Tipe Arsip
      if (filters.tipeArsip !== 'semua' && doc.tipeArsip !== filters.tipeArsip) {
        return false;
      }

      // Abjad Prefix
      if (filters.abjadPrefix && doc.abjadPrefix.toUpperCase() !== filters.abjadPrefix.toUpperCase()) {
        return false;
      }

      // Tanggal Awal
      if (filters.tanggalAwal && doc.tanggalDokumen < filters.tanggalAwal) {
        return false;
      }

      // Tanggal Akhir
      if (filters.tanggalAkhir && doc.tanggalDokumen > filters.tanggalAkhir) {
        return false;
      }

      // Sifat Surat
      if (filters.sifatSurat && doc.sifatSurat !== filters.sifatSurat) {
        return false;
      }

      // Status Fisik
      if (filters.statusFisik && doc.statusFisik !== filters.statusFisik) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'nomor_asc') {
        // Strict alphabetical + numeric ordering: A-001 < A-002 < B-001
        if (a.abjadPrefix !== b.abjadPrefix) {
          return a.abjadPrefix.localeCompare(b.abjadPrefix);
        }
        return (a.abjadUrutan || 0) - (b.abjadUrutan || 0);
      }
      if (filters.sortBy === 'nomor_desc') {
        if (a.abjadPrefix !== b.abjadPrefix) {
          return b.abjadPrefix.localeCompare(a.abjadPrefix);
        }
        return (b.abjadUrutan || 0) - (a.abjadUrutan || 0);
      }
      if (filters.sortBy === 'tanggal_desc') {
        return b.tanggalDokumen.localeCompare(a.tanggalDokumen);
      }
      if (filters.sortBy === 'tanggal_asc') {
        return a.tanggalDokumen.localeCompare(b.tanggalDokumen);
      }
      if (filters.sortBy === 'judul_asc') {
        return a.judul.localeCompare(b.judul);
      }
      return 0;
    });
  }, [documents, filters]);

  // If loading storage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-12 rounded-xl bg-white p-2 shadow-sm border border-neutral-200 mb-3 flex items-center justify-center animate-pulse">
          <img
            src="/assets/aistudio/436288cc-2e74-4fc9-b640-0cf371e4aa32_53fea3f7.png"
            alt="Logo"
            className="w-10 h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-xs font-semibold text-neutral-600">Memuat Sistem Arsip ISMAYA PROPERTY...</p>
      </div>
    );
  }

  // Initial access requires LoginPage
  if (!adminUser.isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-xl border border-neutral-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans antialiased text-neutral-900">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onOpenLogin={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        onOpenCreate={() => {
          setDocumentToEdit(null);
          setIsDocModalOpen(true);
        }}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onOpenGoogleSheets={() => setIsSheetModalOpen(true)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenProfile={() => setIsAdminProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Section / Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-200 no-print">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1">
              <span>Sistem Informasi Kearsipan</span>
              <span aria-hidden="true">·</span>
              <span>ISMAYA PROPERTY</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-neutral-700">Tahun 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Arsip Dokumen ISMAYA PROPERTY
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
              Pusat penyimpanan surat masuk, surat keluar, akta jual beli (AJB), sertifikat tanah (SHM/HGB), perizinan PBG, dan integrasi lembar kerja Google Sheets.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer min-h-[40px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Sinkron Google Sheets</span>
            </button>

            {adminUser.isLoggedIn && (
              <button
                onClick={() => {
                  setDocumentToEdit(null);
                  setIsDocModalOpen(true);
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-md shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>Input Dokumen Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards Overview */}
        <StatsOverview
          documents={documents}
          onSelectType={(type) => {
            setActiveTab(type);
            setFilters(prev => ({ ...prev, tipeArsip: type }));
          }}
          currentType={filters.tipeArsip}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          availableAlphabetPrefixes={availableAlphabetPrefixes}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* Loading State or View Grid/Table */}
        {isLoading ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-500">
            Memuat arsip dokumen ISMAYA PROPERTY...
          </div>
        ) : viewMode === 'table' ? (
          <DocumentTable
            documents={filteredDocuments}
            adminUser={adminUser}
            onViewPdf={(doc) => {
              setSelectedPdfDoc(doc);
              setIsPdfModalOpen(true);
            }}
            onEdit={(doc) => {
              setDocumentToEdit(doc);
              setIsDocModalOpen(true);
            }}
            onDelete={(doc) => setDocToDelete(doc)}
            onOpenCreate={() => {
              setDocumentToEdit(null);
              setIsDocModalOpen(true);
            }}
          />
        ) : (
          <DocumentCards
            documents={filteredDocuments}
            adminUser={adminUser}
            onViewPdf={(doc) => {
              setSelectedPdfDoc(doc);
              setIsPdfModalOpen(true);
            }}
            onEdit={(doc) => {
              setDocumentToEdit(doc);
              setIsDocModalOpen(true);
            }}
            onDelete={(doc) => setDocToDelete(doc)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 mt-12 text-xs text-neutral-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">ISMAYA PROPERTY</span>
            <span>·</span>
            <span>Arsip Dokumen Elektronik & Tata Kelola Surat</span>
            <span>·</span>
            <span className="text-[11px] text-neutral-400">Siap GitHub Pages / HTML Statis</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Kategori ({categories.length})
            </button>
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Koneksi Spreadsheet
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Cetak Disposisi
            </button>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* 1. Document Add / Edit Modal */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false);
          setDocumentToEdit(null);
        }}
        onSave={handleSaveDocument}
        documentToEdit={documentToEdit}
        categories={categories}
        existingDocuments={documents}
      />

      {/* 2. PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setSelectedPdfDoc(null);
        }}
        document={selectedPdfDoc}
      />

      {/* 3. Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 4. Google Sheets Sync Modal */}
      <GoogleSheetsModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        documents={documents}
        config={sheetConfig}
        onSaveConfig={handleSaveSheetConfig}
      />

      {/* 5. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminUser={adminUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* 6. Print Modal */}
      <PrintArchiveModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documents={filteredDocuments}
      />

      {/* 7. Admin Profile, Password & Login Activity Modal */}
      <AdminProfileModal
        isOpen={isAdminProfileModalOpen}
        onClose={() => setIsAdminProfileModalOpen(false)}
        adminUser={adminUser}
        onProfileUpdated={(updated) => {
          setAdminUser(updated);
          saveStoredAdminUser(updated);
          showToast('Profil & kredensial administrator berhasil disimpan.');
        }}
      />

      {/* 8. Delete Confirmation Dialog */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Konfirmasi Hapus Dokumen
                </h3>
                <p className="text-xs text-neutral-500">
                  Tindakan ini akan menghapus arsip dari penyimpanan lokal.
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 text-xs text-neutral-700 space-y-1">
              <div>Nomor: <strong className="font-mono text-neutral-900">{docToDelete.nomorDokumen}</strong></div>
              <div className="line-clamp-2">Perihal: <span className="font-medium text-neutral-900">{docToDelete.judul}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
              >
                Ya, Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Toast Feedback Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-xl border border-neutral-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
