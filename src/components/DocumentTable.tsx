import React from 'react';
import { DocumentItem, AdminUser } from '../types';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  MapPin, 
  FileCheck,
  Plus,
  Send,
  Inbox
} from 'lucide-react';
import { formatFileSize } from '../utils/pdfGenerator';

interface DocumentTableProps {
  documents: DocumentItem[];
  adminUser: AdminUser;
  onViewPdf: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onOpenCreate: () => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  adminUser,
  onViewPdf,
  onEdit,
  onDelete,
  onOpenCreate
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyDocNumber = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-8 sm:p-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 mb-1">
          Tidak ada dokumen yang sesuai kriteria
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
          Coba sesuaikan kata kunci pencarian, ubah filter kategori, atau tambahkan dokumen arsip baru.
        </p>
        {adminUser.isLoggedIn && (
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dokumen Baru</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      
      {/* 1. DESKTOP VIEW: High-Density Data Grid (Visible on PC / Tablets >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">No</th>
              <th className="py-3 px-4 min-w-[170px]">Nomor Dokumen</th>
              <th className="py-3 px-4 min-w-[130px]">Tanggal</th>
              <th className="py-3 px-4 min-w-[140px]">Tipe / Kategori</th>
              <th className="py-3 px-4 min-w-[280px]">Perihal / Judul & Keterangan</th>
              <th className="py-3 px-4 min-w-[180px]">Pengirim / Penerima</th>
              <th className="py-3 px-4 min-w-[150px]">Lokasi & Status</th>
              <th className="py-3 px-3 min-w-[100px] text-center">Berkas PDF</th>
              <th className="py-3 px-4 min-w-[90px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
            {documents.map((doc, idx) => {
              const isSuratMasuk = doc.tipeArsip === 'surat_masuk';
              const isSuratKeluar = doc.tipeArsip === 'surat_keluar';

              return (
                <tr 
                  key={doc.id}
                  className="hover:bg-neutral-50/70 transition-colors group"
                >
                  {/* No */}
                  <td className="py-3 px-3 text-center text-neutral-400 font-mono tabular-nums">
                    {idx + 1}
                  </td>

                  {/* Nomor Dokumen with alphabet indicator */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-neutral-900 font-medium">
                      <span className="text-xs bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded font-bold text-neutral-700">
                        {doc.abjadPrefix}
                      </span>
                      <span className="tabular-nums font-semibold">{doc.nomorDokumen}</span>
                      <button
                        onClick={() => copyDocNumber(doc.id, doc.nomorDokumen)}
                        title="Salin Nomor Dokumen"
                        className="text-neutral-300 hover:text-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {doc.sifatSurat && doc.sifatSurat !== 'Biasa' && (
                      <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                        Sifat: {doc.sifatSurat}
                      </div>
                    )}
                  </td>

                  {/* Tanggal */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-neutral-900 tabular-nums">
                      {doc.tanggalDokumen}
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums font-mono mt-0.5">
                      Arsip: {doc.tanggalArsip}
                    </div>
                  </td>

                  {/* Tipe / Kategori */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900">
                      {doc.kategoriNama}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {isSuratMasuk ? 'Surat Masuk' : isSuratKeluar ? 'Surat Keluar' : 'Legalitas'}
                    </div>
                  </td>

                  {/* Judul & Keterangan */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-neutral-900 line-clamp-2 leading-relaxed">
                      {doc.judul}
                    </div>
                    {doc.keterangan && (
                      <div className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-normal">
                        {doc.keterangan}
                      </div>
                    )}
                    {doc.disposisiCatatan && (
                      <div className="text-[11px] text-sky-800 bg-sky-50/70 border border-sky-100 rounded px-2 py-0.5 mt-1.5">
                        <span className="font-semibold">Disposisi:</span> {doc.disposisiCatatan}
                      </div>
                    )}
                  </td>

                  {/* Pengirim / Penerima */}
                  <td className="py-3 px-4">
                    <div className="text-neutral-900 font-medium">
                      {isSuratMasuk ? doc.pengirim : doc.penerima || '-'}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {isSuratMasuk ? 'Dari: Pengirim' : 'Kepada: Penerima'}
                    </div>
                  </td>

                  {/* Lokasi Fisik & Status */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-neutral-700">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[140px]" title={doc.lokasiFisik}>
                        {doc.lokasiFisik || 'Arsip Sentral'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-neutral-400" />
                      <span>{doc.statusFisik}</span>
                    </div>
                  </td>

                  {/* Berkas PDF (Lihat & Unduh) */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onViewPdf(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors whitespace-nowrap cursor-pointer"
                      title={doc.fileName || 'Lihat Dokumen PDF'}
                    >
                      <Eye className="w-3.5 h-3.5 text-rose-600" />
                      <span>PDF</span>
                    </button>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {formatFileSize(doc.fileSize)}
                    </div>
                  </td>

                  {/* Aksi (Edit, Hapus) */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {adminUser.isLoggedIn ? (
                        <>
                          <button
                            onClick={() => onEdit(doc)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Edit Dokumen"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(doc)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onViewPdf(doc)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded cursor-pointer"
                          title="Detail Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE VIEW: Touch-Friendly Card Feed (Visible on Smartphone Screens < 640px) */}
      <div className="block sm:hidden divide-y divide-neutral-200">
        {documents.map((doc, idx) => {
          const isSuratMasuk = doc.tipeArsip === 'surat_masuk';
          const isSuratKeluar = doc.tipeArsip === 'surat_keluar';

          return (
            <div key={doc.id} className="p-3.5 bg-white space-y-2.5">
              
              {/* Header row: Number, Abjad Badge, Date & Copy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-xs bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded font-bold text-neutral-800">
                    {doc.abjadPrefix}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 tabular-nums">
                    {doc.nomorDokumen}
                  </span>
                  <button
                    onClick={() => copyDocNumber(doc.id, doc.nomorDokumen)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 active:text-neutral-900"
                    title="Salin Nomor"
                  >
                    {copiedId === doc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
                  {doc.tanggalDokumen}
                </div>
              </div>

              {/* Title / Perihal */}
              <h4 
                onClick={() => onViewPdf(doc)}
                className="text-sm font-bold text-neutral-900 leading-snug cursor-pointer active:text-blue-600 line-clamp-2"
              >
                {doc.judul}
              </h4>

              {/* Category, Type & Status */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-800">{doc.kategoriNama}</span>
                <span aria-hidden="true">·</span>
                <span>{isSuratMasuk ? 'Surat Masuk' : isSuratKeluar ? 'Surat Keluar' : 'Legalitas'}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.statusFisik}</span>
                {doc.sifatSurat && doc.sifatSurat !== 'Biasa' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-semibold">{doc.sifatSurat}</span>
                  </>
                )}
              </div>

              {/* Sender / Receiver & Physical Location */}
              <div className="space-y-1 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded border border-neutral-150">
                <div className="flex items-start gap-1.5">
                  {isSuratMasuk ? (
                    <Inbox className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-1">
                    <strong className="text-neutral-800">{isSuratMasuk ? 'Dari:' : 'Tujuan:'}</strong>{' '}
                    {isSuratMasuk ? doc.pengirim : doc.penerima || '-'}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1 text-neutral-500">
                    {doc.lokasiFisik || 'Arsip Sentral'}
                  </span>
                </div>

                {doc.disposisiCatatan && (
                  <div className="text-[11px] text-sky-800 pt-0.5">
                    <strong>Disposisi:</strong> {doc.disposisiCatatan}
                  </div>
                )}
              </div>

              {/* Mobile Actions Toolbar with Touch Targets >= 44px */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewPdf(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded transition-colors min-h-[44px]"
                >
                  <Eye className="w-4 h-4 text-rose-600" />
                  <span>Lihat PDF ({formatFileSize(doc.fileSize)})</span>
                </button>

                {adminUser.isLoggedIn && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(doc)}
                      className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit Dokumen"
                      aria-label="Edit dokumen"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc)}
                      className="p-2.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Hapus Dokumen"
                      aria-label="Hapus dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Table Footer */}
      <div className="py-2.5 px-3 sm:px-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-1 font-mono tabular-nums">
        <span>Menampilkan {documents.length} dokumen arsip</span>
        <span className="text-[11px] text-neutral-400 font-sans">
          ISMAYA PROPERTY &copy; 2026
        </span>
      </div>
    </div>
  );
};
