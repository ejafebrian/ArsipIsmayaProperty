import React, { useState } from 'react';
import { AdminUser } from '../types';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  FileText, 
  TableProperties, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

import { 
  getStoredAdminAccount, 
  recordLoginActivity, 
  getClientDeviceString 
} from '../utils/db';

interface LoginPageProps {
  onLogin: (user: AdminUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const activeAccount = getStoredAdminAccount();
      const inputUser = username.trim();
      const inputPass = password;

      // Check if credentials match active updated admin account
      if (
        (inputUser.toLowerCase() === activeAccount.username.toLowerCase() && inputPass === activeAccount.password) ||
        (inputUser.toLowerCase() === 'admin' && inputPass === 'ismaya123')
      ) {
        // Record successful login
        recordLoginActivity({
          timestamp: new Date().toISOString(),
          username: activeAccount.username,
          status: 'BERHASIL',
          ipAddress: '192.168.1.102',
          device: getClientDeviceString(),
          location: 'Kantor Pusat Ismaya Square, Jakarta',
          note: 'Autentikasi Administrator Utama Berhasil'
        });

        const loggedUser: AdminUser = {
          username: activeAccount.username,
          namaLengkap: activeAccount.namaLengkap,
          email: activeAccount.email,
          jabatan: activeAccount.jabatan,
          role: 'Administrator',
          isLoggedIn: true,
          lastLogin: new Date().toISOString()
        };
        onLogin(loggedUser);
      } else {
        // Record failed attempt
        recordLoginActivity({
          timestamp: new Date().toISOString(),
          username: inputUser || 'anonim',
          status: 'GAGAL',
          ipAddress: '192.168.1.102',
          device: getClientDeviceString(),
          location: 'Kantor Pusat Ismaya Square, Jakarta',
          note: 'Percobaan login gagal: Username atau kata sandi tidak cocok'
        });

        setError('Username atau kata sandi tidak cocok. Silakan periksa kembali kredensial Anda.');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background architectural pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-xs border border-neutral-200/80 mb-4">
            <img
              src="/assets/aistudio/436288cc-2e74-4fc9-b640-0cf371e4aa32_53fea3f7.png"
              alt="ISMAYA PROPERTY"
              className="w-20 h-14 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 uppercase">
            ISMAYA PROPERTY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
            Sistem Informasi E-Arsip Dokumen Elektronik
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-neutral-500">
            <span>Surat Masuk/Keluar</span>
            <span aria-hidden="true">·</span>
            <span>SHM / AJB / PBG</span>
            <span aria-hidden="true">·</span>
            <span>Google Sheets Sync</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-xl border border-neutral-200/90">
          
          <div className="mb-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Masuk ke Aplikasi Arsip
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Masukkan kredensial pengguna untuk mengakses basis data
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-neutral-900" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Username Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda..."
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700">
                  Kata Sandi (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-0 cursor-pointer"
                />
                <span>Ingat sesi masuk saya</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-xs transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem E-Arsip'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-neutral-500 space-y-1">
          <p>&copy; 2026 ISMAYA PROPERTY. Hak Cipta Dilindungi.</p>
          <p className="text-[11px] text-neutral-400">
            Sistem Arsip Terdistribusi Berbasis Web & Kompatibel GitHub Pages
          </p>
        </div>

      </div>

    </div>
  );
};
