import React, { useState } from 'react';
import { AdminUser, DocumentType } from '../types';
import { 
  FileText, 
  Plus, 
  TableProperties, 
  Layers, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Printer,
  Menu,
  X,
  User,
  Inbox,
  Send,
  FileCheck2,
  FolderOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminUser: AdminUser;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCreate: () => void;
  onOpenCategories: () => void;
  onOpenGoogleSheets: () => void;
  onOpenPrint: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  adminUser,
  onOpenLogin,
  onLogout,
  onOpenCreate,
  onOpenCategories,
  onOpenGoogleSheets,
  onOpenPrint,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-8">
          
          {/* Zone 1: Brand Logo & Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="p-1 bg-white rounded-lg border border-neutral-200 shadow-2xs flex items-center justify-center">
              <img 
                src="/assets/aistudio/436288cc-2e74-4fc9-b640-0cf371e4aa32_53fea3f7.png" 
                alt="ISMAYA PROPERTY" 
                className="w-8 h-6 sm:w-9 sm:h-7 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 leading-tight whitespace-nowrap">
                ISMAYA PROPERTY
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 font-medium whitespace-nowrap">
                Sistem E-Arsip Dokumen
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Links (PC / Tablet) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => setActiveTab('semua')}
              className={`pb-1 text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                activeTab === 'semua'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent hover:text-neutral-900'
              }`}
            >
              Semua Dokumen
            </button>
            <button
              onClick={() => setActiveTab('surat_masuk')}
              className={`pb-1 text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                activeTab === 'surat_masuk'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent hover:text-neutral-900'
              }`}
            >
              Surat Masuk
            </button>
            <button
              onClick={() => setActiveTab('surat_keluar')}
              className={`pb-1 text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                activeTab === 'surat_keluar'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent hover:text-neutral-900'
              }`}
            >
              Surat Keluar
            </button>
            <button
              onClick={() => setActiveTab('dokumen_legal')}
              className={`pb-1 text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                activeTab === 'dokumen_legal'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent hover:text-neutral-900'
              }`}
            >
              Legalitas & SHM
            </button>
            <button
              onClick={onOpenCategories}
              className="pb-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent cursor-pointer"
            >
              Kelola Kategori
            </button>
            <button
              onClick={onOpenGoogleSheets}
              className="pb-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent flex items-center gap-1.5 cursor-pointer"
            >
              <TableProperties className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sheets</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Auth Profile (Desktop & Mobile trigger) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop Cetak Rekap */}
            <button
              onClick={onOpenPrint}
              title="Cetak Rekap Arsip"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>

            {adminUser.isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Desktop Profile */}
                <button
                  onClick={onOpenProfile}
                  title="Buka Profil Administrator, Ganti Sandi, dan Riwayat Login"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-800 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[120px] truncate">{adminUser.namaLengkap || adminUser.username || 'Profil'}</span>
                </button>

                {/* Tambah Arsip (Primary Action) */}
                <button
                  onClick={onOpenCreate}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah Arsip</span>
                  <span className="sm:hidden">Tambah</span>
                </button>

                {/* Desktop Logout */}
                <button
                  onClick={onLogout}
                  title="Keluar dari sesi dan kembali ke halaman login"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
                >
                  <LogOut className="w-3.5 h-3.5 text-neutral-500 hover:text-rose-600" />
                  <span>Keluar</span>
                </button>

                {/* Mobile Menu Hamburger Button (Touch Target >= 44px) */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Buka menu navigasi"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Admin</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Horizontal Quick Navigation Tab Bar (Swipable) */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 text-xs font-medium text-neutral-600 border-t border-neutral-100 no-scrollbar touch-pan-x">
          <button
            onClick={() => handleMobileNav('semua')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center ${
              activeTab === 'semua'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Semua Dokumen
          </button>
          <button
            onClick={() => handleMobileNav('surat_masuk')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center ${
              activeTab === 'surat_masuk'
                ? 'bg-sky-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Surat Masuk
          </button>
          <button
            onClick={() => handleMobileNav('surat_keluar')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center ${
              activeTab === 'surat_keluar'
                ? 'bg-teal-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Surat Keluar
          </button>
          <button
            onClick={() => handleMobileNav('dokumen_legal')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] flex items-center justify-center ${
              activeTab === 'dokumen_legal'
                ? 'bg-amber-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Legalitas & SHM
          </button>
          <button
            onClick={() => {
              onOpenCategories();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer min-h-[36px] flex items-center justify-center"
          >
            Kategori
          </button>
          <button
            onClick={() => {
              onOpenGoogleSheets();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 cursor-pointer min-h-[36px]"
          >
            <TableProperties className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sheets</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-down Menu (For full smartphone access) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          
          {/* User profile strip on mobile */}
          {adminUser.isLoggedIn && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                  ADM
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 truncate max-w-[170px]">
                    {adminUser.namaLengkap || adminUser.username}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">Administrator Aktif</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onOpenProfile();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded shadow-2xs hover:bg-neutral-100"
              >
                Edit Profil
              </button>
            </div>
          )}

          {/* Mobile Menu List Links */}
          <div className="space-y-1 text-sm font-medium text-neutral-700">
            <button
              onClick={() => handleMobileNav('semua')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${
                activeTab === 'semua' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'hover:bg-neutral-50'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-neutral-500" />
              <span>Semua Dokumen Arsip</span>
            </button>

            <button
              onClick={() => handleMobileNav('surat_masuk')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${
                activeTab === 'surat_masuk' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-neutral-50'
              }`}
            >
              <Inbox className="w-4 h-4 text-sky-600" />
              <span>Surat Masuk & Disposisi</span>
            </button>

            <button
              onClick={() => handleMobileNav('surat_keluar')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${
                activeTab === 'surat_keluar' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-neutral-50'
              }`}
            >
              <Send className="w-4 h-4 text-teal-600" />
              <span>Surat Keluar & Penawaran</span>
            </button>

            <button
              onClick={() => handleMobileNav('dokumen_legal')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left ${
                activeTab === 'dokumen_legal' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-neutral-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              <span>Legalitas, SHM, AJB & PBG</span>
            </button>

            <button
              onClick={() => {
                onOpenCategories();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left hover:bg-neutral-50"
            >
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>Kelola Kategori Dokumen</span>
            </button>

            <button
              onClick={() => {
                onOpenGoogleSheets();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left hover:bg-emerald-50 text-emerald-800"
            >
              <TableProperties className="w-4 h-4 text-emerald-600" />
              <span>Sinkronisasi Google Sheets</span>
            </button>

            <button
              onClick={() => {
                onOpenPrint();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left hover:bg-neutral-50"
            >
              <Printer className="w-4 h-4 text-neutral-500" />
              <span>Cetak Rekapitulasi Dokumen</span>
            </button>
          </div>

          {/* Mobile Bottom Action: Logout */}
          {adminUser.isLoggedIn && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Sesi Administrator</span>
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
};
