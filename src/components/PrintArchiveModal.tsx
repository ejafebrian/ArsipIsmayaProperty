import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { X, Printer, FileText } from 'lucide-react';

interface PrintArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export const PrintArchiveModal: React.FC<PrintArchiveModalProps> = ({
  isOpen,
  onClose,
  documents
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [printMode, setPrintMode] = useState<'rekap' | 'disposisi'>('rekap');

  if (!isOpen) return null;

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header (no-print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80 no-print">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Pratinjau Cetak / Ekspor PDF Resmi
              </h2>
              <p className="text-xs text-neutral-500">
                Dokumen resmi berstandar arsip ISMAYA PROPERTY
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-neutral-200/80 rounded-md text-xs">
              <button
                onClick={() => setPrintMode('rekap')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  printMode === 'rekap' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Daftar Rekap Arsip
              </button>
              <button
                onClick={() => setPrintMode('disposisi')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  printMode === 'disposisi' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Lembar Disposisi Surat
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Document Selector when in disposisi mode */}
        {printMode === 'disposisi' && (
          <div className="px-6 py-2.5 bg-neutral-100 border-b border-neutral-200 flex items-center gap-3 no-print text-xs">
            <span className="font-semibold text-neutral-700 shrink-0">Pilih Dokumen Surat:</span>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full py-1.5 px-3 bg-white border border-neutral-300 rounded font-medium text-neutral-900"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  [{d.abjadPrefix}] {d.nomorDokumen} - {d.judul}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-neutral-100">
          
          <div className="max-w-[800px] mx-auto bg-white p-8 sm:p-12 shadow-md border border-neutral-200 text-neutral-900 print:shadow-none print:border-none print:p-0">
            
            {/* Kop Surat Resmi ISMAYA PROPERTY */}
            <div className="border-b-2 border-neutral-900 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-neutral-950 uppercase">
                    ISMAYA PROPERTY
                  </h1>
                  <p className="text-xs text-neutral-600 font-medium">
                    Kawasan Bisnis Ismaya Square Blok A-01, Jakarta | Telp: (021) 8899-7700
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Sistem Manajemen Dokumen Elektronik & Kearsipan Terpadu
                  </p>
                </div>
                <div className="w-20 h-14 rounded border border-neutral-300 p-1 flex items-center justify-center shrink-0 bg-white">
                  <img
                    src="/assets/aistudio/436288cc-2e74-4fc9-b640-0cf371e4aa32_53fea3f7.png"
                    alt="Logo Ismaya"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Content: Mode Rekapitulasi */}
            {printMode === 'rekap' ? (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                    DAFTAR REKAPITULASI ARSIP DOKUMEN PERUSAHAAN
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} · Total: {documents.length} Berkas
                  </p>
                </div>

                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-y-2 border-neutral-900 bg-neutral-100 font-bold uppercase">
                      <th className="py-2 px-2 text-center w-8">No</th>
                      <th className="py-2 px-2 w-32">Nomor Dokumen</th>
                      <th className="py-2 px-2 w-20">Tanggal</th>
                      <th className="py-2 px-2">Perihal / Keterangan</th>
                      <th className="py-2 px-2 w-28">Kategori</th>
                      <th className="py-2 px-2 w-28">Lokasi Fisik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {documents.map((doc, idx) => (
                      <tr key={doc.id}>
                        <td className="py-2 px-2 text-center font-mono tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono font-semibold">{doc.nomorDokumen}</td>
                        <td className="py-2 px-2 font-mono tabular-nums">{doc.tanggalDokumen}</td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-neutral-900">{doc.judul}</div>
                          {doc.pengirim && <div className="text-[10px] text-neutral-500">Pengirim: {doc.pengirim}</div>}
                        </td>
                        <td className="py-2 px-2">{doc.kategoriNama}</td>
                        <td className="py-2 px-2 font-mono text-[10px]">{doc.lokasiFisik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signature Row */}
                <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-xs text-center">
                  <div>
                    <p className="text-neutral-500">Mengetahui,</p>
                    <p className="font-bold text-neutral-900 mb-16">Kepala Divisi Legal & Arsip</p>
                    <p className="font-bold border-t border-neutral-400 pt-1 inline-block min-w-[160px]">
                      ( Bpk. Hendrawan, S.H. )
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Dicatat oleh,</p>
                    <p className="font-bold text-neutral-900 mb-16">Petugas Arsiparis</p>
                    <p className="font-bold border-t border-neutral-400 pt-1 inline-block min-w-[160px]">
                      ( Admin Ismaya Property )
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Content: Mode Lembar Disposisi Surat */
              selectedDoc && (
                <div className="space-y-4 text-xs">
                  <div className="text-center pb-2 border-b border-neutral-300">
                    <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                      LEMBAR DISPOSISI KOORDINASI SURAT
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Kerahasiaan Dokumen: <strong className="uppercase">{selectedDoc.sifatSurat}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-b border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Nomor Dokumen / Surat:</span>
                      <strong className="font-mono text-sm">{selectedDoc.nomorDokumen}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Tanggal Diterima / Arsip:</span>
                      <span className="font-mono font-semibold">{selectedDoc.tanggalArsip}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-b border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Asal / Pengirim:</span>
                      <span className="font-semibold text-neutral-900">{selectedDoc.pengirim || '-'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Tujuan / Penerima:</span>
                      <span className="font-semibold text-neutral-900">{selectedDoc.penerima || '-'}</span>
                    </div>
                  </div>

                  <div className="py-2 border-b border-neutral-200">
                    <span className="text-neutral-500 block text-[11px]">Perihal / Judul Surat:</span>
                    <strong className="text-neutral-900 text-sm leading-relaxed block mt-0.5">
                      {selectedDoc.judul}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-b border-neutral-200">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Diteruskan Kepada (Disposisi):</span>
                      <span className="font-bold text-neutral-900 text-xs">
                        {selectedDoc.disposisiTujuan || 'Divisi Terkait'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Status Tindak Lanjut:</span>
                      <span className="font-bold text-neutral-900 text-xs">
                        {selectedDoc.disposisiStatus || 'Diarsipkan'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border border-neutral-300 rounded bg-neutral-50 min-h-[120px]">
                    <span className="font-bold text-neutral-900 text-xs block mb-1">
                      Catatan & Instruksi Pimpinan:
                    </span>
                    <p className="text-neutral-800 text-xs leading-relaxed italic">
                      "{selectedDoc.disposisiCatatan || selectedDoc.keterangan || 'Harap diperiksa dan ditindaklanjuti sesuai SOP operasional perusahaan.'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-xs text-center">
                    <div>
                      <p className="text-neutral-500">Tanggal Selesai Disposisi:</p>
                      <p className="font-mono pt-1 text-neutral-600">.... / .... / 20....</p>
                      <p className="font-bold border-t border-neutral-400 pt-1 inline-block min-w-[160px] mt-12">
                        Penerima Disposisi
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Tanda Tangan Pimpinan,</p>
                      <p className="font-bold text-neutral-900 mb-14">Direksi Ismaya Property</p>
                      <p className="font-bold border-t border-neutral-400 pt-1 inline-block min-w-[160px]">
                        ( ..................................... )
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
