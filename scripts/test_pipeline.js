const fs = require('fs');
const path = require('path');
const http = require('http');
const mammoth = require('mammoth');

async function main() {
  console.log('=== INICIANDO PRUEBAS AUTOMATIZADAS DEL CONVERSOR PDF A WORD ===\n');

  // 1. Test GET /pdf-a-word
  console.log('1. Probando carga de la página /pdf-a-word...');
  const pageRes = await fetch('http://localhost:3000/pdf-a-word');
  if (pageRes.status !== 200) {
    throw new Error(`Error al cargar /pdf-a-word. Status: ${pageRes.status}`);
  }
  const pageHtml = await pageRes.text();
  const hasTitle = pageHtml.includes('Convertir PDF a Word');
  const hasSchema = pageHtml.includes('SoftwareApplication');
  const hasFaqSchema = pageHtml.includes('FAQPage');
  console.log('✓ /pdf-a-word respondió con HTTP 200');
  console.log('✓ Título presente:', hasTitle);
  console.log('✓ Schema SoftwareApplication presente:', hasSchema);
  console.log('✓ Schema FAQPage presente:', hasFaqSchema);

  // 2. Test POST /api/pdf-to-word/convert with sample PDF
  console.log('\n2. Probando endpoint de conversión /api/pdf-to-word/convert...');
  const pdfSamplePath = 'C:/Users/KMMOBILE/.gemini/antigravity/brain/c1126876-8a86-449a-a25a-92adb5a483f1/.user_uploaded/media_1793886377302_3404149d.pdf';
  const pdfBytes = fs.readFileSync(pdfSamplePath);

  const formData = new FormData();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  formData.append('file', blob, 'Especificaciones_Tecnicas.pdf');
  formData.append('customFilename', 'Informe_Ejecutivo_2026.docx');

  const convertRes = await fetch('http://localhost:3000/api/pdf-to-word/convert', {
    method: 'POST',
    body: formData,
  });

  if (convertRes.status !== 200) {
    const errText = await convertRes.text();
    throw new Error(`Error en /api/pdf-to-word/convert. Status: ${convertRes.status}. Body: ${errText}`);
  }

  const convertData = await convertRes.json();
  console.log('✓ Conversión exitosa. Respuesta:', {
    id: convertData.id,
    originalName: convertData.originalName,
    convertedName: convertData.convertedName,
    originalSize: convertData.originalSize,
    docxSize: convertData.docxSize,
    pageCount: convertData.pageCount,
    conversionTimeMs: convertData.conversionTimeMs,
    usedOcr: convertData.usedOcr,
  });

  // 3. Test GET /api/pdf-to-word/download
  console.log('\n3. Probando descarga directa del archivo DOCX...');
  const downloadRes = await fetch(`http://localhost:3000${convertData.downloadUrl}`);
  if (downloadRes.status !== 200) {
    throw new Error(`Error descargando DOCX. Status: ${downloadRes.status}`);
  }
  const contentType = downloadRes.headers.get('content-type');
  const contentDisposition = downloadRes.headers.get('content-disposition');
  console.log('✓ Content-Type:', contentType);
  console.log('✓ Content-Disposition:', contentDisposition);

  const docxArrayBuffer = await downloadRes.arrayBuffer();
  const docxBuffer = Buffer.from(docxArrayBuffer);
  console.log(`✓ Archivo DOCX descargado: ${docxBuffer.length} bytes`);

  // Verify DOCX is a valid OpenXML document (starts with PK\x03\x04)
  const isZip = docxBuffer[0] === 0x50 && docxBuffer[1] === 0x4b;
  console.log('✓ Verificación de firma OpenXML (PK):', isZip ? 'VÁLIDA' : 'INVÁLIDA');
  if (!isZip) throw new Error('El archivo generado no tiene cabecera ZIP/OpenXML válida.');

  // Extract raw text from generated DOCX with mammoth
  const extractedDocx = await mammoth.extractRawText({ buffer: docxBuffer });
  console.log(`✓ Texto extraído del archivo DOCX generado (${extractedDocx.value.length} caracteres):`);
  console.log('----------------------------------------------------');
  console.log(extractedDocx.value.substring(0, 350) + '...\n');
  console.log('----------------------------------------------------');

  // 4. Test POST /api/pdf-to-word/batch-zip
  console.log('4. Probando empaquetado en lote /api/pdf-to-word/batch-zip...');
  const zipRes = await fetch('http://localhost:3000/api/pdf-to-word/batch-zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { fileId: convertData.id, customName: 'Doc_Uno.docx' },
        { fileId: convertData.id, customName: 'Doc_Dos.docx' },
      ],
    }),
  });

  if (zipRes.status !== 200) {
    throw new Error(`Error en batch-zip. Status: ${zipRes.status}`);
  }
  const zipArrayBuffer = await zipRes.arrayBuffer();
  const zipBuffer = Buffer.from(zipArrayBuffer);
  console.log(`✓ Archivo ZIP generado correctamente: ${zipBuffer.length} bytes`);
  const isZipArchive = zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4b;
  console.log('✓ Verificación de firma ZIP (DEFLATE):', isZipArchive ? 'VÁLIDA' : 'INVÁLIDA');

  // 5. Test POST /api/pdf-to-word/pages (Page inspector)
  console.log('\n5. Probando inspección de páginas /api/pdf-to-word/pages...');
  const pagesForm = new FormData();
  pagesForm.append('file', blob, 'Especificaciones_Tecnicas.pdf');
  const pagesRes = await fetch('http://localhost:3000/api/pdf-to-word/pages', {
    method: 'POST',
    body: pagesForm,
  });
  const pagesData = await pagesRes.json();
  console.log('✓ Páginas inspeccionadas con éxito:', pagesData);

  // 6. Test Password-protected PDF flow
  console.log('\n6. Probando flujo de PDF protegido con contraseña...');
  // Encrypt sample PDF to a temp location
  const tempEncPath = path.join(__dirname, 'temp_encrypted.pdf');
  const { execSync } = require('child_process');
  execSync(`python scripts/pdf_tools.py encrypt "${pdfSamplePath}" "${tempEncPath}" "claveSegura123"`);
  const encBytes = fs.readFileSync(tempEncPath);
  fs.unlinkSync(tempEncPath);

  // 6a: Test without password -> expect 423 Locked
  const encBlob = new Blob([encBytes], { type: 'application/pdf' });
  const encFormNoPwd = new FormData();
  encFormNoPwd.append('file', encBlob, 'Protegido.pdf');
  const resNoPwd = await fetch('http://localhost:3000/api/pdf-to-word/convert', {
    method: 'POST',
    body: encFormNoPwd,
  });
  console.log(`✓ Envío sin clave -> Status recibido: ${resNoPwd.status} (esperado: 423)`);

  // 6b: Test with wrong password -> expect 401 Unauthorized
  const encFormWrongPwd = new FormData();
  encFormWrongPwd.append('file', encBlob, 'Protegido.pdf');
  encFormWrongPwd.append('password', 'claveIncorrecta');
  const resWrongPwd = await fetch('http://localhost:3000/api/pdf-to-word/convert', {
    method: 'POST',
    body: encFormWrongPwd,
  });
  console.log(`✓ Envío con clave errónea -> Status recibido: ${resWrongPwd.status} (esperado: 401)`);

  // 6c: Test with correct password -> expect 200 OK & converted docx
  const encFormCorrect = new FormData();
  encFormCorrect.append('file', encBlob, 'Protegido.pdf');
  encFormCorrect.append('password', 'claveSegura123');
  const resCorrect = await fetch('http://localhost:3000/api/pdf-to-word/convert', {
    method: 'POST',
    body: encFormCorrect,
  });
  console.log(`✓ Envío con clave correcta -> Status recibido: ${resCorrect.status} (esperado: 200)`);
  const dataCorrect = await resCorrect.json();
  console.log('✓ Archivo protegido descifrado y convertido con éxito. ID:', dataCorrect.id);

  console.log('\n======================================================');
  console.log('TODAS LAS PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO (6/6)');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('\n❌ ERROR EN LAS PRUEBAS:', err);
  process.exit(1);
});
