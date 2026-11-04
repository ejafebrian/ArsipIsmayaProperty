/**
 * Minimalist valid client-side PDF generator for archive previews and exports.
 * Generates valid standard PDF-1.4 binary data without external dependencies.
 */

export function createSamplePdfDataUrl(title: string, docNumber: string, category: string, date: string, content: string): string {
  const sanitize = (text: string) => text.replace(/[()\\]/g, ' ').substring(0, 80);
  
  const safeTitle = sanitize(title);
  const safeDocNumber = sanitize(docNumber);
  const safeCat = sanitize(category);
  const safeDate = sanitize(date);
  const safeContent = sanitize(content);

  const streamContent = `BT
/F1 18 Tf
50 750 Td
(ARSIP DOKUMEN ISMAYA PROPERTY) Tj
/F1 10 Tf
0 -24 Td
(ISMAYA PROPERTY - SISTEM DOKUMEN ELEKTRONIK) Tj
0 -12 Td
(Alamat: Kawasan Bisnis Ismaya Square Blok A-01, Jakarta) Tj
0 -20 Td
(------------------------------------------------------------------------------------------------------------------) Tj
/F2 13 Tf
0 -30 Td
(Nomor Dokumen : ${safeDocNumber}) Tj
/F1 11 Tf
0 -22 Td
(Kategori      : ${safeCat}) Tj
0 -18 Td
(Tanggal       : ${safeDate}) Tj
0 -24 Td
(Perihal / Judul:) Tj
/F2 12 Tf
0 -18 Td
(${safeTitle}) Tj
/F1 10 Tf
0 -30 Td
(Keterangan Arsip:) Tj
0 -16 Td
(${safeContent}) Tj
0 -40 Td
(Status        : Dokumen Asli Terverifikasi dalam Database E-Arsip) Tj
0 -60 Td
([ TERCATAT DALAM DATABASE ARSIP DOKUMEN RESMI ISMAYA PROPERTY ]) Tj
ET`;

  const streamLength = streamContent.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000300 00000 n 
0000000366 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
438
%%EOF`;

  return `data:application/pdf;base64,${btoa(pdf)}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
