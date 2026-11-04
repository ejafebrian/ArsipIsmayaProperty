import React, { useState } from 'react';
import { AdminUser } from '../types';
import { X, ShieldCheck, Lock, User, Eye, EyeOff, Check } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser;
  onLogin: (user: AdminUser) => void;
  onLogout: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onLogin,
  onLogout
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ismaya123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && (password === 'ismaya123' || password === 'admin')) {
      const loggedUser: AdminUser = {
        username: 'admin',
        namaLengkap: 'Administrator Utama E-Arsip',
        role: 'Administrator',
        isLoggedIn: true,
        lastLogin: new Date().toISOString()
      };
      onLogin(loggedUser);
      setError(null);
      onClose();
    } else {
      setError('Username atau kata sandi tidak cocok. Gunakan akun administrator bawaan.');
    }
  };

  const handleSwitchToGuest = () => {
    const guestUser: AdminUser = {
      username: 'tamu',
      namaLengkap: 'Tamu / Arsiparis Publik',
      role: 'Viewer',
      isLoggedIn: false
    };
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-900" />
            <h2 className="text-base font-bold text-neutral-900">
              {adminUser.isLoggedIn ? 'Status Administrator' : 'Login Administrator'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {adminUser.isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                  ADM
                </div>
                <div>
                  <div className="font-bold text-xs text-neutral-900">{adminUser.namaLengkap}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Akses Penuh: Tambah, Edit, Hapus, & Sync</div>
                </div>
              </div>

              <div className="text-xs text-neutral-500 leading-relaxed">
                Anda sedang masuk sebagai Administrator aktif Sistem Arsip ISMAYA PROPERTY. Semua perubahan arsip akan dicatat.
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                >
                  Keluar dari Sesi Admin
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-white border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-neutral-900 focus:outline-none font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium">
                  {error}
                </p>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSwitchToGuest}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline"
                >
                  Mode Tamu (Lihat Saja)
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Masuk Administrator</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
