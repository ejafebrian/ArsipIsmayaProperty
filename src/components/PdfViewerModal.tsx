import React from 'react';
import { DocumentItem } from '../types';
import { X, Download, Printer, FileText, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../utils/pdfGenerator';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!isOpen || !document) return null;

  const handleDownload = () => {
    if (!document.fileData) return;
    const link = window.document.createElement('a');
    link.href = document.fileData;
    link.download = document.fileName || `${document.nomorDokumen.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${document.nomorDokumen} - ${document.judul}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: bold; }
            .sub { font-size: 13px; color: #555; }
            .row { display: flex; margin-bottom: 8px; font-size: 13px; }
            .label { width: 180px; font-weight: bold; color: #444; }
            .val { flex: 1; }
            .box { margin-top: 24px; padding: 16px; border: 1px solid #ddd; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ISMAYA PROPERTY</div>
            <div class="sub">LEMBAR ARSIP DOKUMEN ELEKTRONIK RESMI</div>
          </div>
          <div class="row"><div class="label">Nomor Dokumen:</div><div class="val"><strong>${document.nomorDokumen}</strong> (Index: ${document.abjadPrefix})</div></div>
          <div class="row"><div class="label">Kategori / Tipe:</div><div class="val">${document.kategoriNama} (${document.tipeArsip})</div></div>
          <div class="row"><div class="label">Tanggal Dokumen:</div><div class="val">${document.tanggalDokumen} (Diarsipkan: ${document.tanggalArsip})</div></div>
          <div class="row"><div class="label">Perihal / Judul:</div><div class="val"><strong>${document.judul}</strong></div></div>
          <div class="row"><div class="label">Pengirim:</div><div class="val">${document.pengirim || '-'}</div></div>
          <div class="row"><div class="label">Penerima:</div><div class="val">${document.penerima || '-'}</div></div>
          <div class="row"><div class="label">Sifat Surat:</div><div class="val">${document.sifatSurat}</div></div>
          <div class="row"><div class="label">Lokasi Fisik:</div><div class="val">${document.lokasiFisik}</div></div>
          <div class="row"><div class="label">Status Fisik:</div><div class="val">${document.statusFisik}</div></div>
          ${document.disposisiCatatan ? `<div class="row"><div class="label">Disposisi:</div><div class="val">${document.disposisiCatatan} (${document.disposisiStatus})</div></div>` : ''}
          <div class="box">
            <strong>Keterangan / Catatan Arsip:</strong><br/>
            ${document.keterangan || '-'}
          </div>
          <p style="margin-top: 40px; font-size: 11px; color: #777;">Dokumen diverifikasi melalui Sistem E-Arsip Ismaya Property pada ${new Date().toLocaleString('id-ID')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-5xl h-[94vh] sm:h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-200 bg-neutral-50/90 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-1">
            <span className="bg-neutral-900 text-white font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded font-bold shrink-0">
              {document.abjadPrefix}
            </span>
            <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm truncate">
              {document.nomorDokumen}
            </span>
            <span className="text-neutral-400 hidden sm:inline">·</span>
            <span className="text-xs text-neutral-600 truncate max-w-md hidden sm:inline">
              {document.judul}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded transition-colors cursor-pointer min-h-[36px]"
              title="Cetak Lembar Arsip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors cursor-pointer min-h-[36px]"
              title="Download Berkas PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Tutup pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content split: Document Preview (Left) + Document Metadata (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* PDF Frame */}
          <div className="flex-1 bg-neutral-900 flex flex-col relative h-[48vh] md:h-full">
            {document.fileData ? (
              <iframe
                src={`${document.fileData}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={document.judul}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-6 text-center">
                <FileText className="w-10 h-10 mb-2 text-neutral-600" />
                <p className="text-xs sm:text-sm font-medium">Pratinjau PDF tidak tersedia</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                  Dokumen ini tersimpan sebagai metadata teks. Anda dapat mengunggah file PDF pada menu Edit.
                </p>
              </div>
            )}
          </div>

          {/* Metadata Inspector Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-200 bg-white p-3.5 sm:p-4 overflow-y-auto shrink-0 text-xs space-y-3 sm:space-y-4 max-h-[44vh] md:max-h-none">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Detail Arsip Dokumen
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                {document.judul}
              </h3>
            </div>

            <div className="space-y-2.5 text-neutral-700 border-t border-neutral-100 pt-3">
              <div>
                <span className="text-neutral-400 block text-[11px]">Kategori</span>
                <span className="font-semibold text-neutral-900">{document.kategoriNama}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Tanggal Surat</span>
                  <span className="font-mono tabular-nums text-neutral-900">{document.tanggalDokumen}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Tanggal Arsip</span>
                  <span className="font-mono tabular-nums text-neutral-900">{document.tanggalArsip}</span>
                </div>
              </div>

              {document.pengirim && (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Instansi Pengirim</span>
                  <span className="font-medium text-neutral-900">{document.pengirim}</span>
                </div>
              )}

              {document.penerima && (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Tujuan / Penerima</span>
                  <span className="font-medium text-neutral-900">{document.penerima}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Sifat Surat</span>
                  <span className="font-medium text-neutral-900">{document.sifatSurat}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Status Fisik</span>
                  <span className="font-medium text-neutral-900">{document.statusFisik}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Lokasi Fisik</span>
                <div className="flex items-center gap-1 font-medium text-neutral-900">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>{document.lokasiFisik}</span>
                </div>
              </div>

              {document.disposisiCatatan && (
                <div className="bg-sky-50 p-2.5 rounded border border-sky-100">
                  <span className="text-[11px] font-semibold text-sky-900 block mb-0.5">Disposisi & Instruksi</span>
                  <p className="text-neutral-800 text-[11px]">{document.disposisiCatatan}</p>
                  <span className="text-[10px] text-sky-700 font-mono mt-1 block">
                    Status: {document.disposisiStatus}
                  </span>
                </div>
              )}

              {document.keterangan && (
                <div>
                  <span className="text-neutral-400 block text-[11px]">Keterangan Arsip</span>
                  <p className="text-neutral-600 text-xs leading-relaxed mt-0.5 whitespace-pre-wrap">
                    {document.keterangan}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-400">
                <div>Berkas: {document.fileName || 'Dokumen.pdf'}</div>
                <div>Ukuran: {formatFileSize(document.fileSize)}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
