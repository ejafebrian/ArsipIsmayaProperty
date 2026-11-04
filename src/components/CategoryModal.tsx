import React, { useState } from 'react';
import { Category, DocumentType } from '../types';
import { X, Plus, Edit2, Trash2, Check, Tag } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [abjadCode, setAbjadCode] = useState('A');
  const [tipeDefault, setTipeDefault] = useState<DocumentType>('dokumen_legal');
  const [deskripsi, setDeskripsi] = useState('');
  const [warna, setWarna] = useState('#0284C7');

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNama(cat.nama);
    setKode(cat.kode);
    setAbjadCode(cat.abjadCode);
    setTipeDefault(cat.tipeDefault);
    setDeskripsi(cat.deskripsi);
    setWarna(cat.warna);
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setNama('');
    setKode('');
    setAbjadCode('A');
    setTipeDefault('dokumen_legal');
    setDeskripsi('');
    setWarna('#0284C7');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kode.trim()) return;

    const newCat: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      nama: nama.trim(),
      kode: kode.trim().toUpperCase(),
      abjadCode: (abjadCode || 'A').trim().toUpperCase(),
      tipeDefault,
      deskripsi: deskripsi.trim(),
      warna
    };

    onSaveCategory(newCat);
    handleResetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Kelola Kategori & Kode Abjad Dokumen
            </h2>
            <p className="text-xs text-neutral-500">
              Pengaturan klasifikasi dokumen, kode singkatan, dan indeks abjad
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Form input */}
          <form onSubmit={handleSubmit} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
            <span className="font-semibold text-neutral-900 text-xs uppercase tracking-wider block">
              {editingCategory ? 'Edit Kategori Dokumen' : 'Tambah Kategori Baru'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Akta Jual Beli (AJB)"
                  className="w-full py-1.5 px-3 bg-white border border-neutral-300 rounded text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Kode Singkatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  placeholder="Contoh: AJB"
                  className="w-full py-1.5 px-3 uppercase font-mono bg-white border border-neutral-300 rounded text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Indeks Abjad (A - Z)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={abjadCode}
                  onChange={(e) => setAbjadCode(e.target.value.toUpperCase())}
                  placeholder="A"
                  className="w-full py-1.5 px-3 uppercase font-mono bg-white border border-neutral-300 rounded text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tipe Default
                </label>
                <select
                  value={tipeDefault}
                  onChange={(e) => setTipeDefault(e.target.value as DocumentType)}
                  className="w-full py-1.5 px-3 bg-white border border-neutral-300 rounded text-xs focus:outline-none"
                >
                  <option value="surat_masuk">Surat Masuk</option>
                  <option value="surat_keluar">Surat Keluar</option>
                  <option value="dokumen_legal">Dokumen Legalitas</option>
                  <option value="keuangan">Keuangan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Warna Identitas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={warna}
                    onChange={(e) => setWarna(e.target.value)}
                    className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5 bg-white"
                  />
                  <span className="text-xs font-mono text-neutral-600">{warna}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Deskripsi
              </label>
              <input
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Penjelasan dokumen yang termasuk dalam kategori ini"
                className="w-full py-1.5 px-3 bg-white border border-neutral-300 rounded text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded"
                >
                  Batal Edit
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}</span>
              </button>
            </div>
          </form>

          {/* List of existing categories */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Daftar Kategori Terdaftar ({categories.length})
            </span>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden bg-white">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.warna }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-xs">
                          {cat.nama}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded font-semibold">
                          Kode: {cat.kode} (Abjad {cat.abjadCode})
                        </span>
                      </div>
                      {cat.deskripsi && (
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                          {cat.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kategori "${cat.nama}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
