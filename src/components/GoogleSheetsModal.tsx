import React, { useState } from 'react';
import { DocumentItem, GoogleSheetConfig } from '../types';
import { 
  X, 
  TableProperties, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Code, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  exportToGoogleSheetsCsv, 
  generateGoogleSheetTsv, 
  downloadCsvFile, 
  GOOGLE_APPS_SCRIPT_SAMPLE,
  syncWithGoogleAppsScript
} from '../utils/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  config: GoogleSheetConfig;
  onSaveConfig: (config: GoogleSheetConfig) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  documents,
  config,
  onSaveConfig
}) => {
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [sheetId, setSheetId] = useState(config.sheetId || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: config.lastSyncStatus || 'idle',
    message: config.lastSyncMessage || ''
  });
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'webhook' | 'script'>('export');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SAMPLE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyTsv = () => {
    const tsv = generateGoogleSheetTsv(documents);
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  const handleDownloadCsv = () => {
    const csv = exportToGoogleSheetsCsv(documents);
    downloadCsvFile(csv, `Arsip_ISMAYA_PROPERTY_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSaveAndSyncWebhook = async () => {
    setIsSyncing(true);
    const updatedConfig: GoogleSheetConfig = {
      ...config,
      webAppUrl: webAppUrl.trim(),
      sheetId: sheetId.trim()
    };
    onSaveConfig(updatedConfig);

    const res = await syncWithGoogleAppsScript(webAppUrl.trim(), documents);
    setIsSyncing(false);

    const finalStatus = res.success ? 'success' : 'error';
    setSyncResult({ status: finalStatus, message: res.message });

    onSaveConfig({
      ...updatedConfig,
      lastSyncStatus: finalStatus,
      lastSyncTime: new Date().toISOString(),
      lastSyncMessage: res.message
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-3xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Integrasi Google Sheets
              </h2>
              <p className="text-xs text-neutral-500">
                ISMAYA PROPERTY - Sinkronisasi otomatis data e-arsip ke Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-neutral-200 px-6 bg-neutral-50/60 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('export')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeSubTab === 'export'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Ekspor & Salin Instan
          </button>
          <button
            onClick={() => setActiveSubTab('webhook')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeSubTab === 'webhook'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Sinkronisasi Webhook Otomatis
          </button>
          <button
            onClick={() => setActiveSubTab('script')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeSubTab === 'script'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Panduan & Kode Apps Script
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          
          {/* TAB 1: Direct Export & One-Click Copy */}
          {activeSubTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <h4 className="font-bold text-emerald-950 text-xs mb-1">
                  Metode Tercepat: Tempel Langsung ke Google Sheets
                </h4>
                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  Cukup klik tombol <strong>"Salin Format Tabel"</strong> di bawah ini, lalu buka Google Sheet Anda dan tekan <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono text-[11px]">Ctrl+V</kbd> (atau <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono text-[11px]">Cmd+V</kbd>). Semua kolom dan baris dokumen akan tersusun otomatis dan rapi!
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyTsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors"
                  >
                    {copiedTsv ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Data Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Format Tabel ({documents.length} Dokumen)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Unduh File CSV Google Sheet</span>
                  </button>
                </div>
              </div>

              {/* Quick Google Sheet opener */}
              <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 text-xs">
                    Tautan Google Spreadsheet Anda:
                  </span>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Buka Spreadsheet Baru di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <input
                  type="url"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded text-xs focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400">
                  Simpan tautan ini untuk memudahkan navigasi langsung ke lembar kerja perusahaan Ismaya Property.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Webhook Sync */}
          {activeSubTab === 'webhook' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold text-neutral-900 text-xs">
                  URL Google Apps Script Web App (Webhook):
                </label>
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full py-2 px-3 font-mono bg-white border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
                <p className="text-[11px] text-neutral-500">
                  Didapatkan dari menu Deploy &gt; New deployment di Google Apps Script (lihat tab 'Panduan & Kode Apps Script').
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndSyncWebhook}
                  disabled={isSyncing || !webAppUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Sedang Mengirim ke Google Sheet...' : 'Sinkronkan Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSaveConfig({ ...config, webAppUrl: webAppUrl.trim(), sheetId: sheetId.trim() });
                    alert('Konfigurasi berhasil disimpan!');
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Simpan Pengaturan
                </button>
              </div>

              {/* Status report */}
              {syncResult.status !== 'idle' && (
                <div className={`p-3 rounded-lg border flex items-start gap-2 text-xs ${
                  syncResult.status === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {syncResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {syncResult.status === 'success' ? 'Sinkronisasi Berhasil' : 'Kendala Koneksi'}
                    </div>
                    <div className="text-[11px] mt-0.5 leading-relaxed">{syncResult.message}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Script & Tutorial */}
          {activeSubTab === 'script' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2 text-xs text-neutral-700">
                <div className="font-bold text-neutral-900">Langkah 1 Menit Menghubungkan Google Sheet:</div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Buat atau buka spreadsheet baru di Google Drive / Google Sheets.</li>
                  <li>Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.</li>
                  <li>Hapus kode bawaan, lalu salin dan tempel kode skrip di bawah ini.</li>
                  <li>Klik tombol biru <strong>Deploy (Terapkan) &gt; New deployment (Penerapan baru)</strong>.</li>
                  <li>Pilih jenis <strong>Web App (Aplikasi Web)</strong>, setel <em>Who has access (Siapa saja yang memiliki akses)</em> menjadi <strong>Anyone (Siapa saja)</strong>.</li>
                  <li>Salin URL Aplikasi Web yang muncul, lalu tempel di tab 'Sinkronisasi Webhook Otomatis'.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-semibold text-neutral-600 font-mono">
                    Google Apps Script Code (Ready-to-use):
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Kode Skrip'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                  {GOOGLE_APPS_SCRIPT_SAMPLE}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono">
            {documents.length} Dokumen siap disinkronkan
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
