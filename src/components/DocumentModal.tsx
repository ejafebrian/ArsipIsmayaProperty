import React, { useState, useEffect } from 'react';
import { DocumentItem, Category, DocumentType, DocumentPhysicalStatus, LetterPriority, DispositionStatus } from '../types';
import { X, Upload, FileText, Check, AlertCircle, RefreshCw, Trash } from 'lucide-react';
import { fileToBase64, formatFileSize, createSamplePdfDataUrl } from '../utils/pdfGenerator';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: DocumentItem) => void;
  documentToEdit: DocumentItem | null;
  categories: Category[];
  existingDocuments: DocumentItem[];
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  documentToEdit,
  categories,
  existingDocuments,
}) => {
  const [formData, setFormData] = useState<Partial<DocumentItem>>({
    nomorDokumen: '',
    abjadPrefix: 'A',
    abjadUrutan: 1,
    judul: '',
    kategoriId: categories[0]?.id || '',
    kategoriNama: categories[0]?.nama || '',
    tipeArsip: 'surat_masuk',
    tanggalDokumen: new Date().toISOString().split('T')[0],
    tanggalArsip: new Date().toISOString().split('T')[0],
    pengirim: '',
    penerima: '',
    keterangan: '',
    lokasiFisik: 'Lemari A1 - Rak 1 - Box 01',
    statusFisik: 'Asli',
    sifatSurat: 'Biasa',
    disposisiStatus: 'Diarsipkan',
    disposisiTujuan: '',
    disposisiCatatan: '',
    fileName: '',
    fileSize: 0,
    fileType: 'application/pdf',
    fileData: ''
  });

  const [pdfUploadLoading, setPdfUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto calculate next sequential alphabetical number
  const generateNextNumber = (category: Category) => {
    const abjad = category.abjadCode || 'A';
    const sameAbjadDocs = existingDocuments.filter(d => 
      d.abjadPrefix.toUpperCase() === abjad.toUpperCase() ||
      d.kategoriId === category.id
    );

    let maxUrutan = 0;
    sameAbjadDocs.forEach(d => {
      if (d.abjadUrutan && d.abjadUrutan > maxUrutan) {
        maxUrutan = d.abjadUrutan;
      }
    });

    const nextUrutan = maxUrutan + 1;
    const formattedUrutan = String(nextUrutan).padStart(3, '0');
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const generatedNumber = `${abjad}-${formattedUrutan}/IP-${category.kode}/${currentMonthRoman}/${currentYear}`;

    return {
      nomorDokumen: generatedNumber,
      abjadPrefix: abjad,
      abjadUrutan: nextUrutan
    };
  };

  useEffect(() => {
    if (documentToEdit) {
      setFormData({ ...documentToEdit });
    } else {
      const defaultCat = categories[0] || {
        id: 'cat-sm',
        nama: 'Surat Masuk',
        kode: 'SM',
        abjadCode: 'A',
        tipeDefault: 'surat_masuk',
        deskripsi: '',
        warna: '#0284C7'
      };

      const numberData = generateNextNumber(defaultCat);
      setFormData({
        nomorDokumen: numberData.nomorDokumen,
        abjadPrefix: numberData.abjadPrefix,
        abjadUrutan: numberData.abjadUrutan,
        judul: '',
        kategoriId: defaultCat.id,
        kategoriNama: defaultCat.nama,
        tipeArsip: defaultCat.tipeDefault || 'surat_masuk',
        tanggalDokumen: new Date().toISOString().split('T')[0],
        tanggalArsip: new Date().toISOString().split('T')[0],
        pengirim: '',
        penerima: '',
        keterangan: '',
        lokasiFisik: 'Lemari A1 - Rak 1 - Box 01',
        statusFisik: 'Asli',
        sifatSurat: 'Biasa',
        disposisiStatus: 'Selesai',
        disposisiTujuan: '',
        disposisiCatatan: '',
        fileName: '',
        fileSize: 0,
        fileType: 'application/pdf',
        fileData: ''
      });
    }
  }, [documentToEdit, isOpen]);

  const handleCategoryChange = (catId: string) => {
    const selected = categories.find(c => c.id === catId);
    if (!selected) return;

    if (!documentToEdit) {
      const numInfo = generateNextNumber(selected);
      setFormData(prev => ({
        ...prev,
        kategoriId: selected.id,
        kategoriNama: selected.nama,
        tipeArsip: selected.tipeDefault,
        nomorDokumen: numInfo.nomorDokumen,
        abjadPrefix: numInfo.abjadPrefix,
        abjadUrutan: numInfo.abjadUrutan
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        kategoriId: selected.id,
        kategoriNama: selected.nama,
        tipeArsip: selected.tipeDefault
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Harap unggah file berformat PDF (.pdf)');
      return;
    }

    setPdfUploadLoading(true);
    setUploadError(null);

    try {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        fileData: base64
      }));
    } catch {
      setUploadError('Gagal membaca file PDF. Silakan coba kembali.');
    } finally {
      setPdfUploadLoading(false);
    }
  };

  const handleGenerateSamplePdf = () => {
    const pdfData = createSamplePdfDataUrl(
      formData.judul || 'Dokumen Resmi ISMAYA PROPERTY',
      formData.nomorDokumen || 'A-001/IP/2026',
      formData.kategoriNama || 'Umum',
      formData.tanggalDokumen || new Date().toISOString().split('T')[0],
      formData.keterangan || 'Dokumen terarsip dalam database sistem ISMAYA PROPERTY.'
    );

    setFormData(prev => ({
      ...prev,
      fileName: `Arsip_${(formData.nomorDokumen || 'Dokumen').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      fileSize: 450000,
      fileType: 'application/pdf',
      fileData: pdfData
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul?.trim()) {
      alert('Judul / Perihal dokumen wajib diisi.');
      return;
    }
    if (!formData.nomorDokumen?.trim()) {
      alert('Nomor dokumen wajib diisi.');
      return;
    }

    // If no PDF uploaded, automatically create standard verified electronic archive PDF
    let finalFileData = formData.fileData;
    let finalFileName = formData.fileName;
    let finalFileSize = formData.fileSize;

    if (!finalFileData) {
      finalFileData = createSamplePdfDataUrl(
        formData.judul,
        formData.nomorDokumen,
        formData.kategoriNama || 'Arsip',
        formData.tanggalDokumen || new Date().toISOString().split('T')[0],
        formData.keterangan || 'Tercatat dalam basis data resmi Ismaya Property.'
      );
      finalFileName = `${(formData.nomorDokumen).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      finalFileSize = 380000;
    }

    const docToSave: DocumentItem = {
      id: documentToEdit ? documentToEdit.id : `doc-${Date.now()}`,
      nomorDokumen: formData.nomorDokumen.trim(),
      abjadPrefix: (formData.abjadPrefix || formData.nomorDokumen.charAt(0) || 'A').toUpperCase(),
      abjadUrutan: Number(formData.abjadUrutan) || 1,
      judul: formData.judul.trim(),
      kategoriId: formData.kategoriId || categories[0]?.id || '',
      kategoriNama: formData.kategoriNama || categories[0]?.nama || '',
      tipeArsip: formData.tipeArsip as DocumentType,
      tanggalDokumen: formData.tanggalDokumen || new Date().toISOString().split('T')[0],
      tanggalArsip: formData.tanggalArsip || new Date().toISOString().split('T')[0],
      pengirim: formData.pengirim?.trim() || '',
      penerima: formData.penerima?.trim() || '',
      keterangan: formData.keterangan?.trim() || '',
      lokasiFisik: formData.lokasiFisik?.trim() || 'Lemari Arsip Utama',
      statusFisik: (formData.statusFisik as DocumentPhysicalStatus) || 'Asli',
      sifatSurat: (formData.sifatSurat as LetterPriority) || 'Biasa',
      disposisiStatus: formData.disposisiStatus as DispositionStatus,
      disposisiTujuan: formData.disposisiTujuan || '',
      disposisiCatatan: formData.disposisiCatatan || '',
      fileData: finalFileData,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileType: formData.fileType || 'application/pdf',
      createdAt: documentToEdit ? documentToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(docToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 bg-neutral-50/70 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight">
              {documentToEdit ? 'Edit Dokumen Arsip' : 'Tambah Dokumen Arsip Baru'}
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              ISMAYA PROPERTY - Penomoran berurutan abjad & penyimpanan PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 text-xs sm:text-sm">
          
          {/* Section 1: Nomor Dokumen & Urutan Abjad */}
          <div className="bg-neutral-50/80 p-3.5 sm:p-4 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
                1. Klasifikasi & Penomoran Dokumen Sesuai Abjad
              </span>
              {!documentToEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const cat = categories.find(c => c.id === formData.kategoriId) || categories[0];
                    const num = generateNextNumber(cat);
                    setFormData(prev => ({
                      ...prev,
                      nomorDokumen: num.nomorDokumen,
                      abjadPrefix: num.abjadPrefix,
                      abjadUrutan: num.abjadUrutan
                    }));
                  }}
                  className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Nomor Otomatis</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kategori Dokumen <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kategoriId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-neutral-800 focus:outline-none"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.abjadCode}] {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipe Dokumen */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tipe Arsip <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.tipeArsip}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipeArsip: e.target.value as DocumentType }))}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-neutral-800 focus:outline-none"
                  required
                >
                  <option value="surat_masuk">Surat Masuk</option>
                  <option value="surat_keluar">Surat Keluar</option>
                  <option value="dokumen_legal">Dokumen Legalitas & Sertifikat</option>
                  <option value="keuangan">Keuangan & Pajak</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {/* Nomor Dokumen */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nomor Dokumen (Otomatis/Kustom) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomorDokumen}
                  onChange={(e) => setFormData(prev => ({ ...prev, nomorDokumen: e.target.value }))}
                  placeholder="Contoh: A-001/IP-SM/X/2026"
                  className="w-full py-2 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs sm:text-sm font-semibold focus:ring-1 focus:ring-neutral-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Abjad Index Prefix & Urutan */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Kode Abjad Index (A - Z)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.abjadPrefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, abjadPrefix: e.target.value.toUpperCase() }))}
                  className="w-full py-1.5 px-3 font-mono uppercase bg-white border border-neutral-300 rounded-md text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nomor Urut Abjad
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.abjadUrutan}
                  onChange={(e) => setFormData(prev => ({ ...prev, abjadUrutan: parseInt(e.target.value) || 1 }))}
                  className="w-full py-1.5 px-3 font-mono bg-white border border-neutral-300 rounded-md text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Dokumen */}
          <div className="space-y-3">
            <span className="font-semibold text-neutral-900 text-xs uppercase tracking-wider block">
              2. Informasi & Perihal Dokumen
            </span>

            {/* Judul / Perihal */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Perihal / Judul Dokumen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.judul}
                onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                placeholder="Contoh: Surat Rekomendasi Pertimbangan Teknis Pertanahan ATR/BPN"
                className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-neutral-800 focus:outline-none"
                required
              />
            </div>

            {/* Tanggal Dokumen & Tanggal Arsip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tanggal Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalDokumen}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalDokumen: e.target.value }))}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tanggal Pencatatan / Diterima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalArsip}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalArsip: e.target.value }))}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Pengirim & Penerima */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {formData.tipeArsip === 'surat_masuk' ? 'Instansi Pengirim / Asal Surat' : 'Pihak Pengirim'}
                </label>
                <input
                  type="text"
                  value={formData.pengirim}
                  onChange={(e) => setFormData(prev => ({ ...prev, pengirim: e.target.value }))}
                  placeholder="Contoh: Kantor Pertanahan ATR / BPN Jakarta"
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {formData.tipeArsip === 'surat_keluar' ? 'Pihak Penerima / Tujuan Surat' : 'Pihak Dituju / Penerima'}
                </label>
                <input
                  type="text"
                  value={formData.penerima}
                  onChange={(e) => setFormData(prev => ({ ...prev, penerima: e.target.value }))}
                  placeholder="Contoh: Direksi ISMAYA PROPERTY"
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Sifat Surat & Status Fisik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Sifat Surat
                </label>
                <select
                  value={formData.sifatSurat}
                  onChange={(e) => setFormData(prev => ({ ...prev, sifatSurat: e.target.value as LetterPriority }))}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Penting">Penting</option>
                  <option value="Rahasia">Rahasia</option>
                  <option value="Segera">Segera</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Status Dokumen Fisik
                </label>
                <select
                  value={formData.statusFisik}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusFisik: e.target.value as DocumentPhysicalStatus }))}
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
                >
                  <option value="Asli">Dokumen Asli</option>
                  <option value="Salinan">Salinan / Legalisir</option>
                  <option value="Digital">Digital / Softcopy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Lokasi Fisik Penyimpanan
                </label>
                <input
                  type="text"
                  value={formData.lokasiFisik}
                  onChange={(e) => setFormData(prev => ({ ...prev, lokasiFisik: e.target.value }))}
                  placeholder="Contoh: Lemari A - Rak 2 - Box 01"
                  className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Keterangan & Ringkasan */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Keterangan / Ringkasan Isi Dokumen
              </label>
              <textarea
                rows={2}
                value={formData.keterangan}
                onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                placeholder="Catatan penting, batas waktu, nomor sertifikat, atau ringkasan disposisi..."
                className="w-full py-2 px-3 bg-white border border-neutral-300 rounded-md text-xs sm:text-sm focus:outline-none"
              />
            </div>

            {/* Disposisi (Khusus Surat) */}
            <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-100 space-y-2">
              <span className="font-semibold text-sky-950 text-xs block">
                Disposisi & Instruksi Tindak Lanjut
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">Diteruskan ke (Divisi / Pejabat):</label>
                  <input
                    type="text"
                    value={formData.disposisiTujuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, disposisiTujuan: e.target.value }))}
                    placeholder="Contoh: Divisi Legal, Tim Arsitek"
                    className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">Status Disposisi:</label>
                  <select
                    value={formData.disposisiStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, disposisiStatus: e.target.value as DispositionStatus }))}
                    className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded text-xs"
                  >
                    <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
                    <option value="Sedang Diproses">Sedang Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600 mb-1">Catatan Disposisi:</label>
                <input
                  type="text"
                  value={formData.disposisiCatatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, disposisiCatatan: e.target.value }))}
                  placeholder="Contoh: Tindak lanjuti sebelum tanggal 30 bulan ini."
                  className="w-full py-1.5 px-2 bg-white border border-neutral-300 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload File PDF */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-900 text-xs uppercase tracking-wider block">
              3. Berkas Dokumen PDF
            </span>

            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-lg p-4 text-center bg-neutral-50/50 transition-colors">
              <input
                type="file"
                id="pdf-upload-input"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {formData.fileData ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-neutral-900 truncate max-w-xs sm:max-w-md">
                        {formData.fileName || 'Dokumen_Arsip.pdf'}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {formatFileSize(formData.fileSize)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="pdf-upload-input"
                      className="px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer transition-colors"
                    >
                      Ganti PDF
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fileData: '', fileName: '', fileSize: 0 }))}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                      title="Hapus file"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-neutral-700 mb-1">
                    Klik untuk memilih berkas PDF atau seret ke sini
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Format: PDF (.pdf), tersimpan aman dalam database e-arsip
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <label
                      htmlFor="pdf-upload-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File PDF</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSamplePdf}
                      className="text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2 px-2 py-1"
                    >
                      Buat PDF Dokumen Otomatis
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center justify-center gap-1 text-xs text-rose-600 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons (Sticky on mobile for immediate access) */}
          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-5 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-xs border-t border-neutral-200 flex items-center justify-end gap-2.5 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer min-h-[42px] sm:min-h-[38px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pdfUploadLoading}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-black rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[42px] sm:min-h-[38px]"
            >
              <Check className="w-4 h-4" />
              <span>{documentToEdit ? 'Simpan Perubahan' : 'Simpan ke Arsip'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
