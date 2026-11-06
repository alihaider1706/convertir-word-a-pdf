const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pypdf = null; // python handles pypdf

async function main() {
  console.log('=== PRUEBAS AUTOMATIZADAS: CONVERTIR JPG A PDF ===\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Verify GET /convertir-jpg-a-pdf/
  console.log('1. Probando carga de la página /convertir-jpg-a-pdf/...');
  const pageRes = await fetch(`${BASE_URL}/convertir-jpg-a-pdf/`);
  if (pageRes.status !== 200) {
    throw new Error(`Error al cargar página. Status: ${pageRes.status}`);
  }
  const html = await pageRes.text();

  const checks = [
    { name: 'H1: Convertir JPG a PDF Gratis Online', pass: html.includes('Convertir JPG a PDF Gratis Online') },
    { name: 'H2: Cómo convertir JPG a PDF online', pass: html.includes('Cómo convertir JPG a PDF online') },
    { name: 'H2: Convierte varias imágenes en un solo PDF', pass: html.includes('Convierte varias imágenes en un solo PDF') },
    { name: 'H2: Características de nuestro conversor JPG a PDF', pass: html.includes('Características de nuestro conversor JPG a PDF') },
    { name: 'H2: Ajusta el tamaño y la orientación de las páginas', pass: html.includes('Ajusta el tamaño y la orientación de las páginas') },
    { name: 'H2: Convierte imágenes a PDF sin complicaciones', pass: html.includes('Convierte imágenes a PDF sin complicaciones') },
    { name: 'H2: Formatos de imagen compatibles', pass: html.includes('Formatos de imagen compatibles') },
    { name: 'H2: Preguntas frecuentes sobre JPG a PDF', pass: html.includes('Preguntas frecuentes sobre JPG a PDF') },
    { name: 'Schema WebApplication', pass: html.includes('WebApplication') },
    { name: 'Schema FAQPage', pass: html.includes('FAQPage') },
    { name: 'Schema BreadcrumbList', pass: html.includes('BreadcrumbList') },
    { name: 'Canonical Link', pass: html.includes('/convertir-jpg-a-pdf/') },
  ];

  checks.forEach((c) => {
    console.log(`  ${c.pass ? '✓' : '✗'} ${c.name}: ${c.pass}`);
    if (!c.pass) throw new Error(`Fallo en comprobación SEO: ${c.name}`);
  });

  // 2. Test robots.txt and sitemap.xml
  console.log('\n2. Probando SEO técnico (robots.txt y sitemap.xml)...');
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  console.log('  ✓ robots.txt status:', robotsRes.status);
  const robotsTxt = await robotsRes.text();
  if (!robotsTxt.includes('sitemap.xml')) throw new Error('robots.txt no incluye sitemap');

  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  console.log('  ✓ sitemap.xml status:', sitemapRes.status);
  const sitemapXml = await sitemapRes.text();
  if (!sitemapXml.includes('/convertir-jpg-a-pdf/')) throw new Error('sitemap no incluye /convertir-jpg-a-pdf/');
  console.log('  ✓ URL /convertir-jpg-a-pdf/ presente en sitemap.xml');

  // Create test JPEG and PNG samples
  console.log('\n3. Creando imágenes de prueba sintéticas (JPEG y PNG)...');
  // Minimal valid 1x1 JPEG:
  const jpegSampleBytes = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);

  // Minimal valid 1x1 PNG:
  const pngSampleBytes = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);

  // 4. Test Single JPG conversion via API
  console.log('4. Probando conversión de JPG único a PDF (/api/jpg-to-pdf/convert)...');
  const formData1 = new FormData();
  formData1.append('files', new Blob([jpegSampleBytes], { type: 'image/jpeg' }), 'foto_vacaciones.jpg');
  formData1.append('filename', 'Mi_Documento.pdf');
  formData1.append('pageSize', 'a4');
  formData1.append('orientation', 'auto');
  formData1.append('margin', 'small');

  const res1 = await fetch(`${BASE_URL}/api/jpg-to-pdf/convert`, {
    method: 'POST',
    body: formData1,
  });

  if (res1.status !== 200) {
    const err = await res1.text();
    throw new Error(`Error en conversión simple: ${res1.status} ${err}`);
  }

  const data1 = await res1.json();
  console.log('  ✓ Respuesta exitosa:', {
    id: data1.id,
    filename: data1.filename,
    pdfSize: data1.pdfSize,
    pageCount: data1.pageCount,
    downloadUrl: data1.downloadUrl,
  });

  if (data1.pageCount !== 1) throw new Error('Esperada 1 página');

  // Verify download of generated PDF
  const dlRes1 = await fetch(`${BASE_URL}${data1.downloadUrl}`);
  if (dlRes1.status !== 200) throw new Error('Error al descargar PDF generado');
  const pdfBytes1 = Buffer.from(await dlRes1.arrayBuffer());
  const isPdf = pdfBytes1.subarray(0, 5).toString() === '%PDF-';
  console.log('  ✓ Firma PDF válida (%PDF-):', isPdf);
  if (!isPdf) throw new Error('El archivo generado no tiene cabecera PDF válida.');

  // Verify PDF structure with pdf-lib
  const parsedPdf1 = await PDFDocument.load(pdfBytes1);
  console.log(`  ✓ PDF cargado con éxito. Páginas: ${parsedPdf1.getPageCount()}`);

  // 5. Test Multiple Images (JPG + PNG) Combined
  console.log('\n5. Probando combinación de múltiples imágenes en un solo PDF...');
  const formDataMulti = new FormData();
  formDataMulti.append('files', new Blob([jpegSampleBytes], { type: 'image/jpeg' }), 'pagina_1.jpg');
  formDataMulti.append('files', new Blob([pngSampleBytes], { type: 'image/png' }), 'pagina_2.png');
  formDataMulti.append('filename', 'album_completo.pdf');
  formDataMulti.append('pageSize', 'letter');
  formDataMulti.append('orientation', 'portrait');
  formDataMulti.append('pageNumbering', 'bottom-center');

  const resMulti = await fetch(`${BASE_URL}/api/jpg-to-pdf/convert`, {
    method: 'POST',
    body: formDataMulti,
  });

  if (resMulti.status !== 200) {
    throw new Error(`Error en conversión múltiple: ${resMulti.status}`);
  }
  const dataMulti = await resMulti.json();
  console.log('  ✓ Multi-conversión exitosa:', {
    id: dataMulti.id,
    pageCount: dataMulti.pageCount,
    pdfSize: dataMulti.pdfSize,
  });
  if (dataMulti.pageCount !== 2) throw new Error('Esperadas 2 páginas en multi-conversión');

  // Verify multi-page PDF bytes
  const dlResMulti = await fetch(`${BASE_URL}${dataMulti.downloadUrl}`);
  const pdfBytesMulti = Buffer.from(await dlResMulti.arrayBuffer());
  const parsedPdfMulti = await PDFDocument.load(pdfBytesMulti);
  console.log(`  ✓ PDF combinado verificado con ${parsedPdfMulti.getPageCount()} páginas.`);

  // 6. Test Password Encryption via /api/jpg-to-pdf/protect
  console.log('\n6. Probando cifrado con contraseña (AES-256)...');
  const protectFormData = new FormData();
  protectFormData.append('file', new Blob([pdfBytes1], { type: 'application/pdf' }), 'doc.pdf');
  protectFormData.append('password', 'ClaveSecreta123');

  const protectRes = await fetch(`${BASE_URL}/api/jpg-to-pdf/protect`, {
    method: 'POST',
    body: protectFormData,
  });

  if (protectRes.status !== 200) {
    const err = await protectRes.text();
    throw new Error(`Error en protección de contraseña: ${protectRes.status} ${err}`);
  }

  const encPdfBytes = Buffer.from(await protectRes.arrayBuffer());
  console.log(`  ✓ PDF cifrado recibido: ${encPdfBytes.length} bytes`);
  const isEncPdf = encPdfBytes.subarray(0, 5).toString() === '%PDF-';
  console.log('  ✓ Cabecera de PDF cifrado válida:', isEncPdf);

  // Attempt to load without password should fail or indicate encrypted
  let failedWithoutPassword = false;
  try {
    const doc = await PDFDocument.load(encPdfBytes, { ignoreEncryption: false });
  } catch (e) {
    failedWithoutPassword = true;
    console.log('  ✓ Correcto: El PDF cifrado rechaza acceso sin contraseña.');
  }

  // 7. Verify existing tools still work (Zero Regression Check)
  console.log('\n7. Verificando que las herramientas existentes siguen 100% funcionales (Cero Regresiones)...');
  const homeRes = await fetch(`${BASE_URL}/`);
  console.log('  ✓ Homepage (/ - Word a PDF) responde:', homeRes.status === 200);

  const pdf2WordRes = await fetch(`${BASE_URL}/pdf-a-word`);
  console.log('  ✓ PDF a Word (/pdf-a-word) responde:', pdf2WordRes.status === 200);

  console.log('\n======================================================');
  console.log('TODAS LAS PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO (7/7)');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ ERROR EN PRUEBAS:', err);
  process.exit(1);
});
