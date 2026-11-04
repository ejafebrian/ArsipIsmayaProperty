import { DocumentItem } from '../types';

/**
 * Generate CSV formatted string with UTF-8 BOM suitable for Google Sheets and Excel
 */
export function exportToGoogleSheetsCsv(documents: DocumentItem[]): string {
  const headers = [
    'No',
    'Nomor Dokumen',
    'Abjad Index',
    'Urutan',
    'Tipe Arsip',
    'Kategori',
    'Judul Dokumen',
    'Tanggal Dokumen',
    'Tanggal Arsip',
    'Pengirim / Instansi',
    'Penerima / Tujuan',
    'Sifat Surat',
    'Status Fisik',
    'Lokasi Penyimpanan Fisik',
    'Status Disposisi',
    'Catatan Disposisi',
    'Keterangan Arsip',
    'Nama File PDF',
    'Waktu Catat'
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = documents.map((doc, idx) => [
    idx + 1,
    doc.nomorDokumen,
    doc.abjadPrefix,
    doc.abjadUrutan,
    doc.tipeArsip === 'surat_masuk' ? 'Surat Masuk' : doc.tipeArsip === 'surat_keluar' ? 'Surat Keluar' : 'Dokumen Legalitas',
    doc.kategoriNama,
    doc.judul,
    doc.tanggalDokumen,
    doc.tanggalArsip,
    doc.pengirim,
    doc.penerima,
    doc.sifatSurat,
    doc.statusFisik,
    doc.lokasiFisik,
    doc.disposisiStatus || '-',
    doc.disposisiCatatan || '-',
    doc.keterangan,
    doc.fileName || '-',
    doc.createdAt
  ]);

  const csvRows = [
    headers.map(escapeCsv).join(','),
    ...rows.map(r => r.map(escapeCsv).join(','))
  ];

  // UTF-8 BOM \uFEFF for Google Sheets & Excel
  return '\uFEFF' + csvRows.join('\r\n');
}

/**
 * Generate TSV (Tab Separated) so user can paste directly into Google Sheet cells
 */
export function generateGoogleSheetTsv(documents: DocumentItem[]): string {
  const headers = [
    'Nomor Dokumen',
    'Abjad',
    'Tipe',
    'Kategori',
    'Judul Dokumen',
    'Tanggal Dokumen',
    'Pengirim / Asal',
    'Penerima / Tujuan',
    'Sifat',
    'Status Fisik',
    'Lokasi Fisik',
    'Status Disposisi',
    'Keterangan'
  ];

  const rows = documents.map(doc => [
    doc.nomorDokumen,
    doc.abjadPrefix,
    doc.tipeArsip,
    doc.kategoriNama,
    doc.judul.replace(/\t|\r?\n/g, ' '),
    doc.tanggalDokumen,
    doc.pengirim.replace(/\t|\r?\n/g, ' '),
    doc.penerima.replace(/\t|\r?\n/g, ' '),
    doc.sifatSurat,
    doc.statusFisik,
    doc.lokasiFisik,
    doc.disposisiStatus || '-',
    doc.keterangan.replace(/\t|\r?\n/g, ' ')
  ]);

  return [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
}

/**
 * Trigger browser file download for CSV
 */
export function downloadCsvFile(csvContent: string, fileName = 'Arsip_Dokumen_ISMAYA_PROPERTY.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ready-to-use Google Apps Script code for the user's Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_SAMPLE = `/**
 * GOOGLE APPS SCRIPT - ARSIP DOKUMEN ISMAYA PROPERTY
 * Salin kode ini ke Google Spreadsheet Anda:
 * 1. Buka Google Sheet baru / yang ada
 * 2. Klik menu 'Ekstensi' > 'Apps Script'
 * 3. Hapus kode bawaan dan tempel kode ini
 * 4. Klik tombol 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment)
 * 5. Pilih jenis: 'Aplikasi Web' (Web App)
 * 6. Akses: 'Siapa saja' (Anyone)
 * 7. Salin URL Aplikasi Web yang dihasilkan ke aplikasi E-Arsip Ismaya Property!
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    totalRows: data.length,
    message: 'Koneksi Google Sheet ISMAYA PROPERTY berhasil aktif'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var docs = payload.documents;
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Nomor Dokumen',
        'Abjad',
        'Tipe',
        'Kategori',
        'Judul Dokumen',
        'Tanggal Dokumen',
        'Pengirim',
        'Penerima',
        'Sifat',
        'Status Fisik',
        'Lokasi Fisik',
        'Status Disposisi',
        'Keterangan',
        'Tgl Sinkron'
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
    }
    
    // Clear old data and write fresh sync
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 14).clearContent();
    }
    
    var rows = [];
    var now = new Date().toLocaleString('id-ID');
    for (var i = 0; i < docs.length; i++) {
      var d = docs[i];
      rows.push([
        d.nomorDokumen || '',
        d.abjadPrefix || '',
        d.tipeArsip || '',
        d.kategoriNama || '',
        d.judul || '',
        d.tanggalDokumen || '',
        d.pengirim || '',
        d.penerima || '',
        d.sifatSurat || '',
        d.statusFisik || '',
        d.lokasiFisik || '',
        d.disposisiStatus || '',
        d.keterangan || '',
        now
      ]);
    }
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 14).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      syncedCount: docs.length,
      timestamp: now
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Send payload to Google Apps Script Webhook
 */
export async function syncWithGoogleAppsScript(webAppUrl: string, documents: DocumentItem[]): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script tidak valid. Silakan periksa kembali konfigurasi.' };
  }

  try {
    const payload = {
      action: 'sync_documents',
      timestamp: new Date().toISOString(),
      company: 'ISMAYA PROPERTY',
      documents: documents.map(d => ({
        nomorDokumen: d.nomorDokumen,
        abjadPrefix: d.abjadPrefix,
        abjadUrutan: d.abjadUrutan,
        judul: d.judul,
        kategoriNama: d.kategoriNama,
        tipeArsip: d.tipeArsip,
        tanggalDokumen: d.tanggalDokumen,
        pengirim: d.pengirim,
        penerima: d.penerima,
        sifatSurat: d.sifatSurat,
        statusFisik: d.statusFisik,
        lokasiFisik: d.lokasiFisik,
        disposisiStatus: d.disposisiStatus || '',
        keterangan: d.keterangan
      }))
    };

    // Note: Google Apps Script Web Apps handle POST with JSON. Mode 'no-cors' is common when redirecting,
    // so we handle standard POST with fallback.
    await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });

    return { 
      success: true, 
      message: `Berhasil mengirim ${documents.length} dokumen ke Google Sheets!` 
    };
  } catch (err) {
    return { 
      success: false, 
      message: 'Gagal terhubung dengan Google Apps Script: ' + (err instanceof Error ? err.message : String(err)) 
    };
  }
}
