import React from 'react';
import { DocumentItem } from '../types';
import { Inbox, Send, ShieldCheck, FileSpreadsheet } from 'lucide-react';

interface StatsOverviewProps {
  documents: DocumentItem[];
  onSelectType: (type: 'semua' | 'surat_masuk' | 'surat_keluar' | 'dokumen_legal') => void;
  currentType: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  documents,
  onSelectType,
  currentType
}) => {
  const totalDocs = documents.length;
  const suratMasuk = documents.filter(d => d.tipeArsip === 'surat_masuk').length;
  const suratKeluar = documents.filter(d => d.tipeArsip === 'surat_keluar').length;
  const legalDocs = documents.filter(d => d.tipeArsip === 'dokumen_legal' || d.tipeArsip === 'keuangan').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 no-print">
      
      {/* Stat 1: Total Dokumen */}
      <button
        onClick={() => onSelectType('semua')}
        className={`text-left p-4 rounded-lg border transition-all ${
          currentType === 'semua' 
            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
            : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${currentType === 'semua' ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Total Dokumen
          </span>
          <FileSpreadsheet className={`w-4 h-4 ${currentType === 'semua' ? 'text-neutral-300' : 'text-neutral-600'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums">
          {totalDocs}
        </div>
        <div className={`text-xs mt-1 ${currentType === 'semua' ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Keseluruhan arsip aktif
        </div>
      </button>

      {/* Stat 2: Surat Masuk */}
      <button
        onClick={() => onSelectType('surat_masuk')}
        className={`text-left p-4 rounded-lg border transition-all ${
          currentType === 'surat_masuk' 
            ? 'bg-sky-950 text-white border-sky-900 shadow-sm' 
            : 'bg-white text-neutral-900 border-neutral-200 hover:border-sky-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${currentType === 'surat_masuk' ? 'text-sky-300' : 'text-sky-700'}`}>
            Surat Masuk
          </span>
          <Inbox className={`w-4 h-4 ${currentType === 'surat_masuk' ? 'text-sky-300' : 'text-sky-600'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums">
          {suratMasuk}
        </div>
        <div className={`text-xs mt-1 ${currentType === 'surat_masuk' ? 'text-sky-300' : 'text-neutral-500'}`}>
          Korespondensi & disposisi
        </div>
      </button>

      {/* Stat 3: Surat Keluar */}
      <button
        onClick={() => onSelectType('surat_keluar')}
        className={`text-left p-4 rounded-lg border transition-all ${
          currentType === 'surat_keluar' 
            ? 'bg-teal-950 text-white border-teal-900 shadow-sm' 
            : 'bg-white text-neutral-900 border-neutral-200 hover:border-teal-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${currentType === 'surat_keluar' ? 'text-teal-300' : 'text-teal-700'}`}>
            Surat Keluar
          </span>
          <Send className={`w-4 h-4 ${currentType === 'surat_keluar' ? 'text-teal-300' : 'text-teal-600'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums">
          {suratKeluar}
        </div>
        <div className={`text-xs mt-1 ${currentType === 'surat_keluar' ? 'text-teal-300' : 'text-neutral-500'}`}>
          Penawaran & BAST konsumen
        </div>
      </button>

      {/* Stat 4: Legalitas & Sertifikat */}
      <button
        onClick={() => onSelectType('dokumen_legal')}
        className={`text-left p-4 rounded-lg border transition-all ${
          currentType === 'dokumen_legal' 
            ? 'bg-amber-950 text-white border-amber-900 shadow-sm' 
            : 'bg-white text-neutral-900 border-neutral-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${currentType === 'dokumen_legal' ? 'text-amber-300' : 'text-amber-800'}`}>
            Legal & Sertifikat
          </span>
          <ShieldCheck className={`w-4 h-4 ${currentType === 'dokumen_legal' ? 'text-amber-300' : 'text-amber-700'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums">
          {legalDocs}
        </div>
        <div className={`text-xs mt-1 ${currentType === 'dokumen_legal' ? 'text-amber-300' : 'text-neutral-500'}`}>
          SHM, AJB, PBG & PBB
        </div>
      </button>

    </div>
  );
};
