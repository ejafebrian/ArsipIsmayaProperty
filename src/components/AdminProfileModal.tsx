import React, { useState } from 'react';
import { AdminUser, AdminAccount, LoginActivityItem } from '../types';
import { 
  X, 
  User, 
  KeyRound, 
  History, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Monitor, 
  Clock, 
  Building, 
  Mail, 
  Phone,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { 
  getStoredAdminAccount, 
  saveStoredAdminAccount, 
  getStoredLoginActivity, 
  clearStoredLoginActivity,
  recordLoginActivity,
  getClientDeviceString 
} from '../utils/db';
import { downloadCsvFile } from '../utils/googleSheets';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser;
  onProfileUpdated: (updatedUser: AdminUser) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity'>('profile');
  
  // Stored account data
  const [account, setAccount] = useState<AdminAccount>(getStoredAdminAccount());
  
  // Profile form
  const [namaLengkap, setNamaLengkap] = useState(account.namaLengkap);
  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email || '');
  const [jabatan, setJabatan] = useState(account.jabatan || '');
  const [nomorTelepon, setNomorTelepon] = useState(account.nomorTelepon || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Activity Log
  const [activities, setActivities] = useState<LoginActivityItem[]>(getStoredLoginActivity());
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'BERHASIL' | 'GAGAL' | 'LOGOUT'>('ALL');
  const [activitySearch, setActivitySearch] = useState('');

  if (!isOpen) return null;

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setProfileErrorMsg('Username tidak boleh kosong.');
      return;
    }
    if (cleanUser.length < 3) {
      setProfileErrorMsg('Username minimal terdiri dari 3 karakter.');
      return;
    }

    const updatedAccount: AdminAccount = {
      ...account,
      namaLengkap: namaLengkap.trim(),
      username: cleanUser,
      email: email.trim(),
      jabatan: jabatan.trim(),
      nomorTelepon: nomorTelepon.trim(),
      terakhirDiperbarui: new Date().toISOString()
    };

    saveStoredAdminAccount(updatedAccount);
    setAccount(updatedAccount);

    // Update active admin session
    const updatedUser: AdminUser = {
      ...adminUser,
      username: cleanUser,
      namaLengkap: namaLengkap.trim(),
      email: email.trim(),
      jabatan: jabatan.trim()
    };
    onProfileUpdated(updatedUser);

    setProfileSuccessMsg('Profil dan data akun administrator berhasil diperbarui!');
    setTimeout(() => setProfileSuccessMsg(null), 3500);
  };

  // Handle Password Update
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    if (currentPassword !== account.password) {
      setPasswordErrorMsg('Kata sandi saat ini yang Anda masukkan salah.');
      return;
    }

    if (newPassword.length < 5) {
      setPasswordErrorMsg('Kata sandi baru minimal harus 5 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    const updatedAccount: AdminAccount = {
      ...account,
      password: newPassword,
      terakhirDiperbarui: new Date().toISOString()
    };

    saveStoredAdminAccount(updatedAccount);
    setAccount(updatedAccount);

    // Record activity of password change
    const updatedLogs = recordLoginActivity({
      timestamp: new Date().toISOString(),
      username: account.username,
      status: 'BERHASIL',
      ipAddress: '192.168.1.102',
      device: getClientDeviceString(),
      location: 'Pengaturan Akun',
      note: 'Pembaharuan kata sandi administrator berhasil'
    });
    setActivities(updatedLogs);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccessMsg('Kata sandi administrator berhasil diubah! Gunakan sandi baru pada login berikutnya.');
    setTimeout(() => setPasswordSuccessMsg(null), 4000);
  };

  // Activity filter and search
  const filteredActivities = activities.filter(item => {
    if (activityFilter !== 'ALL' && item.status !== activityFilter) {
      return false;
    }
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      const matchIp = item.ipAddress.toLowerCase().includes(q);
      const matchDevice = item.device.toLowerCase().includes(q);
      const matchUser = item.username.toLowerCase().includes(q);
      const matchNote = item.note?.toLowerCase().includes(q);
      return matchIp || matchDevice || matchUser || matchNote;
    }
    return true;
  });

  const handleExportActivityCsv = () => {
    const headers = ['Waktu', 'Username', 'Status', 'Alamat IP', 'Perangkat & OS', 'Lokasi', 'Catatan'];
    const rows = activities.map(a => [
      `"${new Date(a.timestamp).toLocaleString('id-ID')}"`,
      `"${a.username}"`,
      `"${a.status}"`,
      `"${a.ipAddress}"`,
      `"${a.device}"`,
      `"${a.location}"`,
      `"${a.note || '-'}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadCsvFile(csvContent, `Login_Activity_ISMAYA_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleClearActivity = () => {
    if (confirm('Bersihkan seluruh riwayat aktivitas login?')) {
      clearStoredLoginActivity();
      setActivities([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
              ADM
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight">
                Profil & Pengaturan Akun Administrator
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 line-clamp-1">
                Kelola identitas akun, ubah username & sandi, serta pantau login
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Tutup profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Scrollable on mobile) */}
        <div className="flex border-b border-neutral-200 px-3 sm:px-6 bg-white text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-thin touch-pan-x shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Akun</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'password'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Sandi</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'activity'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Login Activity ({activities.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm">
          
          {/* TAB 1: Profil & Username */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-2xl mx-auto space-y-5">
              
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Akun Aktif Saat Ini
                  </div>
                  <div className="text-base font-bold text-neutral-900 mt-0.5">
                    {account.namaLengkap}
                  </div>
                  <div className="text-xs text-neutral-600 font-mono mt-0.5">
                    Username: <span className="font-bold text-neutral-900">{account.username}</span> · Role: <span className="text-emerald-700 font-bold">Administrator Penuh</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-neutral-400 font-mono tabular-nums">
                  Pembaruan: {new Date(account.terakhirDiperbarui).toLocaleDateString('id-ID')}
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Lengkap Administrator <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Digunakan saat login ke sistem e-arsip.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Resmi Perusahaan
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@ismayaproperty.com"
                    className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Kepala Divisi Legal & Arsip"
                    className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Nomor Telepon */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={nomorTelepon}
                    onChange={(e) => setNomorTelepon(e.target.value)}
                    placeholder="+62 812-..."
                    className="w-full py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Profil & Username</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: Ganti Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="max-w-md mx-auto space-y-4">
              
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900 block mb-0.5">Keamanan Akun:</span>
                Pastikan kata sandi baru mudah diingat oleh Anda dan tidak dibagikan kepada pihak yang tidak berkepentingan.
              </div>

              {passwordSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan sandi lama..."
                    required
                    className="w-full pr-10 py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 5 karakter..."
                    required
                    className="w-full pr-10 py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru..."
                  required
                  className="w-full py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Perbaharui Kata Sandi</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: Login Activity Audit Trail */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              
              {/* Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Total Log</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">{activities.length}</div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">Login Berhasil</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-900 mt-0.5">
                    {activities.filter(a => a.status === 'BERHASIL').length}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold">Percobaan Gagal</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-rose-900 mt-0.5">
                    {activities.filter(a => a.status === 'GAGAL').length}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Sesi Saat Ini</div>
                  <div className="text-sm font-bold text-neutral-900 mt-1 font-mono">Aktif (Admin)</div>
                </div>
              </div>

              {/* Action & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Cari IP, perangkat, username, atau catatan..."
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Filter buttons (Zero-pill compliant tabs) */}
                <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs">
                  <button
                    onClick={() => setActivityFilter('ALL')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activityFilter === 'ALL' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setActivityFilter('BERHASIL')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activityFilter === 'BERHASIL' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Berhasil
                  </button>
                  <button
                    onClick={() => setActivityFilter('GAGAL')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activityFilter === 'GAGAL' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Gagal
                  </button>
                  <button
                    onClick={() => setActivityFilter('LOGOUT')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activityFilter === 'LOGOUT' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Logout
                  </button>
                </div>

                {/* CSV & Clear Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportActivityCsv}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                  </button>
                  {activities.length > 0 && (
                    <button
                      onClick={handleClearActivity}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Bersihkan riwayat aktivitas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Activity Log - Responsive Dual Presentation */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                
                {/* 1. Desktop / Tablet Grid View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 min-w-[150px]">Waktu Akses</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Username</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Status</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Perangkat & Sistem</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Alamat IP</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Catatan Aktivitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredActivities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-400">
                            Tidak ada catatan aktivitas login yang sesuai kriteria filter.
                          </td>
                        </tr>
                      ) : (
                        filteredActivities.map((act) => (
                          <tr key={act.id} className="hover:bg-neutral-50/70 transition-colors">
                            
                            {/* Waktu */}
                            <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-900 whitespace-nowrap">
                              {new Date(act.timestamp).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>

                            {/* Username */}
                            <td className="py-2.5 px-3 font-mono font-bold text-neutral-800">
                              {act.username}
                            </td>

                            {/* Status (Unboxed Zero-Pill) */}
                            <td className="py-2.5 px-3 font-semibold">
                              {act.status === 'BERHASIL' ? (
                                <span className="text-emerald-700">Berhasil Masuk</span>
                              ) : act.status === 'GAGAL' ? (
                                <span className="text-rose-700">Percobaan Gagal</span>
                              ) : (
                                <span className="text-neutral-500">Keluar (Logout)</span>
                              )}
                            </td>

                            {/* Device */}
                            <td className="py-2.5 px-3 text-neutral-700 whitespace-nowrap">
                              {act.device}
                            </td>

                            {/* IP Address */}
                            <td className="py-2.5 px-3 font-mono text-neutral-600 tabular-nums">
                              {act.ipAddress}
                            </td>

                            {/* Note */}
                            <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                              {act.note || '-'}
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Smartphone Card Feed (< 640px) */}
                <div className="block sm:hidden divide-y divide-neutral-200 max-h-80 overflow-y-auto">
                  {filteredActivities.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 text-xs p-4">
                      Tidak ada catatan aktivitas login yang sesuai kriteria filter.
                    </div>
                  ) : (
                    filteredActivities.map((act) => (
                      <div key={act.id} className="p-3 space-y-1.5 bg-white text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900">{act.username}</span>
                          <span className={`font-semibold text-[11px] ${
                            act.status === 'BERHASIL' 
                              ? 'text-emerald-700' 
                              : act.status === 'GAGAL' 
                              ? 'text-rose-700' 
                              : 'text-neutral-500'
                          }`}>
                            {act.status === 'BERHASIL' ? 'Berhasil Masuk' : act.status === 'GAGAL' ? 'Gagal' : 'Keluar'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
                          <span>{new Date(act.timestamp).toLocaleString('id-ID')}</span>
                          <span>{act.ipAddress}</span>
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          {act.device}
                        </div>
                        {act.note && (
                          <div className="text-[11px] text-neutral-400">
                            {act.note}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            ISMAYA PROPERTY &copy; 2026 · Audit Trail & Keamanan Akun
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
