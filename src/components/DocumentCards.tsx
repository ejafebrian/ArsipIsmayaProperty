import React from 'react';
import { DocumentItem, AdminUser } from '../types';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  MapPin, 
  Calendar, 
  Send, 
  Inbox, 
  FileCheck
} from 'lucide-react';
import { formatFileSize } from '../utils/pdfGenerator';

interface DocumentCardsProps {
  documents: DocumentItem[];
  adminUser: AdminUser;
  onViewPdf: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const DocumentCards: React.FC<DocumentCardsProps> = ({
  documents,
  adminUser,
  onViewPdf,
  onEdit,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => {
        const isSuratMasuk = doc.tipeArsip === 'surat_masuk';
        const isSuratKeluar = doc.tipeArsip === 'surat_keluar';

        return (
          <div
            key={doc.id}
            className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div>
              {/* Top metadata line: Unboxed text with dot separator */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                    {doc.abjadPrefix}
                  </span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {doc.nomorDokumen}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
                  {doc.tanggalDokumen}
                </div>
              </div>

              {/* Title */}
              <h3 
                onClick={() => onViewPdf(doc)}
                className="text-sm font-bold text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
              >
                {doc.judul}
              </h3>

              {/* Category & Type Info (Zero pill discipline) */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3 pb-2 border-b border-neutral-100">
                <span className="font-medium text-neutral-800">{doc.kategoriNama}</span>
                <span aria-hidden="true">·</span>
                <span>{isSuratMasuk ? 'Surat Masuk' : isSuratKeluar ? 'Surat Keluar' : 'Legalitas'}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.statusFisik}</span>
              </div>

              {/* Description & Sender/Receiver */}
              <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
                <div className="flex items-start gap-1.5">
                  {isSuratMasuk ? (
                    <Inbox className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-1">
                    <strong className="text-neutral-800">{isSuratMasuk ? 'Pengirim:' : 'Penerima:'}</strong>{' '}
                    {isSuratMasuk ? doc.pengirim : doc.penerima}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1 text-neutral-500">
                    {doc.lokasiFisik || 'Arsip Sentral'}
                  </span>
                </div>

                {doc.keterangan && (
                  <p className="text-[11px] text-neutral-500 line-clamp-2 pt-1">
                    {doc.keterangan}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => onViewPdf(doc)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-800 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-rose-600" />
                <span>Lihat PDF ({formatFileSize(doc.fileSize)})</span>
              </button>

              {adminUser.isLoggedIn && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(doc)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                    title="Edit Dokumen"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(doc)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
