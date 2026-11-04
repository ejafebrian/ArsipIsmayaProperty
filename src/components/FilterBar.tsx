import React from 'react';
import { Category, FilterOptions, DocumentType } from '../types';
import { Search, X, SlidersHorizontal, LayoutList, LayoutGrid, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  categories: Category[];
  availableAlphabetPrefixes: string[];
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  categories,
  availableAlphabetPrefixes,
  viewMode,
  setViewMode,
  onResetFilters
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.kategoriId ||
    filters.abjadPrefix ||
    filters.tanggalAwal ||
    filters.tanggalAkhir ||
    filters.statusFisik ||
    filters.sifatSurat
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] no-print">
      {/* Row 1: Search Input & Quick Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Cari nomor dokumen, perihal/judul, pengirim, penerima..."
            className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800 transition-all min-h-[42px] sm:min-h-[38px]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category dropdown, Sort, Advanced Filter & View Toggles (Responsive Wrap) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          {/* Category Dropdown */}
          <select
            value={filters.kategoriId}
            onChange={(e) => setFilters(prev => ({ ...prev, kategoriId: e.target.value }))}
            className="flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800 min-h-[42px] sm:min-h-[38px] max-w-full sm:max-w-[200px]"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                [{cat.abjadCode}] {cat.nama} ({cat.kode})
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
            className="flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800 min-h-[42px] sm:min-h-[38px]"
          >
            <option value="nomor_asc">Urut Abjad (A - Z)</option>
            <option value="nomor_desc">Urut Abjad (Z - A)</option>
            <option value="tanggal_desc">Dokumen Terbaru</option>
            <option value="tanggal_asc">Dokumen Terlama</option>
            <option value="judul_asc">Judul (A - Z)</option>
          </select>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 sm:p-2.5 border rounded-md text-xs font-medium transition-colors min-h-[42px] min-w-[42px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center shrink-0 cursor-pointer ${
              showAdvanced || hasActiveFilters
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
            title="Filter Lanjutan"
            aria-label="Buka filter lanjutan"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* View mode toggle (PC only) */}
          <div className="hidden sm:flex items-center p-0.5 bg-neutral-100 rounded-md border border-neutral-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Tampilan Kartu Arsip"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Alphabetical Index Bar (A, B, C, D, E...) with touch scrolling on phones */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs touch-pan-x scrollbar-thin">
        <span className="text-neutral-400 font-medium whitespace-nowrap shrink-0 mr-1 text-[11px] uppercase tracking-wider hidden sm:inline">
          Urut Abjad:
        </span>
        <button
          onClick={() => setFilters(prev => ({ ...prev, abjadPrefix: '' }))}
          className={`px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] sm:min-h-[28px] flex items-center justify-center ${
            !filters.abjadPrefix
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Semua
        </button>

        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(char => {
          const isAvailable = availableAlphabetPrefixes.includes(char);
          const isSelected = filters.abjadPrefix === char;
          return (
            <button
              key={char}
              onClick={() => setFilters(prev => ({ ...prev, abjadPrefix: char }))}
              className={`min-w-[34px] h-[34px] sm:min-w-[26px] sm:h-[26px] rounded-md flex items-center justify-center font-mono text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white font-bold'
                  : isAvailable
                  ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200'
                  : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50'
              }`}
              title={isAvailable ? `Dokumen dengan kode abjad ${char}` : `Belum ada dokumen abjad ${char}`}
            >
              {char}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 whitespace-nowrap shrink-0 pl-2 cursor-pointer min-h-[36px] sm:min-h-[28px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Row 3: Collapsible Advanced Filter */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block text-neutral-600 font-medium mb-1">Tanggal Mulai Dokumen</label>
            <input
              type="date"
              value={filters.tanggalAwal}
              onChange={(e) => setFilters(prev => ({ ...prev, tanggalAwal: e.target.value }))}
              className="w-full py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded text-xs min-h-[38px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-600 font-medium mb-1">Tanggal Sampai Dokumen</label>
            <input
              type="date"
              value={filters.tanggalAkhir}
              onChange={(e) => setFilters(prev => ({ ...prev, tanggalAkhir: e.target.value }))}
              className="w-full py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded text-xs min-h-[38px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-600 font-medium mb-1">Status Fisik Dokumen</label>
            <select
              value={filters.statusFisik}
              onChange={(e) => setFilters(prev => ({ ...prev, statusFisik: e.target.value }))}
              className="w-full py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded text-xs min-h-[38px] focus:outline-none"
            >
              <option value="">Semua Status Fisik</option>
              <option value="Asli">Dokumen Asli</option>
              <option value="Salinan">Salinan / Legalisir</option>
              <option value="Digital">Digital / Softcopy</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-600 font-medium mb-1">Sifat / Urgensi Surat</label>
            <select
              value={filters.sifatSurat}
              onChange={(e) => setFilters(prev => ({ ...prev, sifatSurat: e.target.value }))}
              className="w-full py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded text-xs min-h-[38px] focus:outline-none"
            >
              <option value="">Semua Sifat Surat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Rahasia">Rahasia</option>
              <option value="Segera">Segera</option>
            </select>
          </div>
        </div>
      )}

    </div>
  );
};
