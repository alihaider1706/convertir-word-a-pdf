/**
 * test_api_pdf_jpg.js - Tests API endpoints /api/pdf-to-jpg/validate and /api/pdf-to-jpg/zip
 */

const fs = require('fs');
const path = require('path');

async function testApi() {
  console.log('--- TEST API: /api/pdf-to-jpg/validate y /api/pdf-to-jpg/zip ---');

  // Find a sample PDF in public/
  const samplePdfPath = path.join(__dirname, '..', 'public', 'Convertir_Word_a_PDF_Features_Document.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    console.error('No se encontró el PDF de prueba.');
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(samplePdfPath);
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

  // 1. Test validate endpoint
  const formData = new FormData();
  formData.append('file', pdfBlob, 'sample.pdf');

  const valRes = await fetch('http://localhost:3000/api/pdf-to-jpg/validate', {
    method: 'POST',
    body: formData,
  });

  const valJson = await valRes.json();
  console.log('Respuesta validate:', valJson);
  if (!valJson.success || !valJson.pageCount) {
    console.error('Fallo en validate endpoint');
    process.exit(1);
  }
  console.log(`✅ PASS: /api/pdf-to-jpg/validate detectó ${valJson.pageCount} páginas.`);

  // 2. Test zip endpoint
  const zipFormData = new FormData();
  const mockJpg1 = new Blob([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])], { type: 'image/jpeg' });
  const mockJpg2 = new Blob([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])], { type: 'image/jpeg' });
  zipFormData.append('files', mockJpg1, 'doc-pagina-1.jpg');
  zipFormData.append('files', mockJpg2, 'doc-pagina-2.jpg');
  zipFormData.append('zipName', 'prueba-imagenes.zip');

  const zipRes = await fetch('http://localhost:3000/api/pdf-to-jpg/zip', {
    method: 'POST',
    body: zipFormData,
  });

  const zipBuffer = await zipRes.arrayBuffer();
  console.log('Status zip:', zipRes.status, 'Tamaño buffer ZIP:', zipBuffer.byteLength);
  if (zipRes.status !== 200 || zipBuffer.byteLength < 50) {
    console.error('Fallo en zip endpoint');
    process.exit(1);
  }
  console.log('✅ PASS: /api/pdf-to-jpg/zip generó un archivo ZIP válido con éxito.');

  console.log('\n🎉 TODOS LOS ENDPOINTS DE LA API FUNCIONAN CORRECTAMENTE.');
}

testApi().catch((e) => {
  console.error(e);
  process.exit(1);
});
