const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Import the converter module
const {
  convertPdfToPpt,
  validatePdfSignature,
  createBatchPptxZip,
  getCachedPptFile,
} = require('../src/lib/pdfToPptConverter');

async function runTests() {
  console.log('==========================================================');
  console.log('🧪 EJECUTANDO BANCO DE PRUEBAS AUTOMATIZADAS: PDF A PPT');
  console.log('==========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  const samplePdfPath = path.join(
    __dirname,
    '../public/Convertir_Word_a_PDF_Features_Document.pdf'
  );
  if (!fs.existsSync(samplePdfPath)) {
    console.error('Documento PDF de prueba no encontrado en:', samplePdfPath);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(samplePdfPath);
  console.log(`Documento PDF cargado: ${samplePdfPath} (${pdfBuffer.length} bytes)\n`);

  // -------------------------------------------------------------
  // Test 1: Validación de Cabecera PDF
  // -------------------------------------------------------------
  console.log('--- Test 1: Validación de Firma PDF ---');
  const validSig = validatePdfSignature(pdfBuffer);
  assert(validSig.isValid, 'Firma PDF válida detectada correctamente', `Versión: ${validSig.version}`);

  const fakeBuffer = Buffer.from('NOT A REAL PDF FILE HEADER');
  const invalidSig = validatePdfSignature(fakeBuffer);
  assert(!invalidSig.isValid, 'Firma no válida rechazada correctamente');

  // -------------------------------------------------------------
  // Test 2: Conversión en Modo Editable
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Conversión en Modo Editable ---');
  const resultEditable = await convertPdfToPpt({
    buffer: pdfBuffer,
    originalFilename: 'documento_test.pdf',
    customFilename: 'presentacion_editable_resultado.pptx',
    mode: 'editable',
  });

  assert(Boolean(resultEditable.id), 'ID único de conversión generado', resultEditable.id);
  assert(resultEditable.slideCount === 2, 'Número de diapositivas coincide con páginas PDF', `${resultEditable.slideCount} diapositivas`);
  assert(resultEditable.pptxSize > 5000, 'Tamaño del archivo PPTX válido', `${resultEditable.pptxSize} bytes`);
  assert(resultEditable.convertedName === 'presentacion_editable_resultado.pptx', 'Nombre personalizado normalizado y asignado');

  // Programmatic OpenXML verification
  const cachedEditable = getCachedPptFile(resultEditable.id);
  assert(Boolean(cachedEditable && fs.existsSync(cachedEditable.pptxPath)), 'Archivo PPTX físico persistido en cache temporal');

  if (cachedEditable && fs.existsSync(cachedEditable.pptxPath)) {
    const pptxBuffer = fs.readFileSync(cachedEditable.pptxPath);
    const pptxZip = await JSZip.loadAsync(pptxBuffer);
    assert(Boolean(pptxZip.file('[Content_Types].xml')), 'Estructura OpenXML válida: [Content_Types].xml presente');
    assert(Boolean(pptxZip.file('ppt/presentation.xml')), 'Estructura OpenXML válida: ppt/presentation.xml presente');
    assert(Boolean(pptxZip.file('ppt/slides/slide1.xml')), 'Diapositiva 1 presente en paquete PPTX');
    assert(Boolean(pptxZip.file('ppt/slides/slide2.xml')), 'Diapositiva 2 presente en paquete PPTX');

    // Read slide 1 XML and verify native text blocks exist
    const slide1Xml = await pptxZip.file('ppt/slides/slide1.xml').async('text');
    assert(slide1Xml.includes('Convertir Word a PDF') || slide1Xml.includes('Report'), 'Texto editable genuino incrustado en XML de diapositiva');
  }

  // -------------------------------------------------------------
  // Test 3: Conversión en Modo Alta Fidelidad
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Conversión en Modo Alta Fidelidad ---');
  const resultFidelity = await convertPdfToPpt({
    buffer: pdfBuffer,
    originalFilename: 'documento_test.pdf',
    customFilename: 'presentacion_fidelidad_resultado.pptx',
    mode: 'fidelity',
  });

  assert(resultFidelity.mode === 'fidelity', 'Modo de conversión asignado correctamente');
  assert(resultFidelity.slideCount === 2, 'Diapositivas generadas en modo fidelidad', `${resultFidelity.slideCount} slides`);

  const cachedFidelity = getCachedPptFile(resultFidelity.id);
  if (cachedFidelity && fs.existsSync(cachedFidelity.pptxPath)) {
    const pptxFidBuffer = fs.readFileSync(cachedFidelity.pptxPath);
    const pptxFidZip = await JSZip.loadAsync(pptxFidBuffer);
    const mediaFiles = Object.keys(pptxFidZip.files).filter((f) => f.startsWith('ppt/media/'));
    assert(mediaFiles.length >= 2, 'Imágenes de alta resolución 1:1 incrustadas en paquete PPTX', `${mediaFiles.length} imágenes`);
  }

  // -------------------------------------------------------------
  // Test 4: Selección de Rango de Páginas
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Selección de Rango de Páginas (Página 1 únicamente) ---');
  const resultRange = await convertPdfToPpt({
    buffer: pdfBuffer,
    originalFilename: 'documento_test.pdf',
    mode: 'editable',
    pageRange: '1',
  });

  assert(resultRange.slideCount === 1, 'Extracción y conversión precisa de página individual', `1 diapositiva generada de 2 totales`);

  // -------------------------------------------------------------
  // Test 5: Empaquetado por Lotes en Archivo ZIP
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Creación de Archivo ZIP para Lotes ---');
  const zipBuffer = await createBatchPptxZip([
    { fileId: resultEditable.id, customName: 'doc1.pptx' },
    { fileId: resultFidelity.id, customName: 'doc2.pptx' },
  ]);

  assert(zipBuffer.length > 10000, 'Archivo ZIP generado correctamente', `${zipBuffer.length} bytes`);
  const loadedZip = await JSZip.loadAsync(zipBuffer);
  const zipEntries = Object.keys(loadedZip.files);
  assert(zipEntries.includes('doc1.pptx'), 'Archivo doc1.pptx incluido en ZIP');
  assert(zipEntries.includes('doc2.pptx'), 'Archivo doc2.pptx incluido en ZIP');

  // -------------------------------------------------------------
  // Test 6: Manejo de Errores y Validaciones
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Manejo de Errores y Validaciones Robustas ---');
  let threwCorrupted = false;
  try {
    await convertPdfToPpt({
      buffer: Buffer.from('%PDF-1.4\nCORRUPTED CONTENT THAT CRASHES PARSERS'),
      originalFilename: 'bad.pdf',
    });
  } catch (err) {
    threwCorrupted = true;
  }
  assert(threwCorrupted, 'Error capturado limpiamente al procesar PDF corrupto');

  let threwInvalidSig = false;
  try {
    await convertPdfToPpt({
      buffer: Buffer.from('GIF89a this is not a pdf'),
      originalFilename: 'fake.pdf',
    });
  } catch (err) {
    threwInvalidSig = true;
  }
  assert(threwInvalidSig, 'Error capturado limpiamente al detectar firma inválida');

  console.log('\n==========================================================');
  console.log(`📊 RESULTADO FINAL: ${passedTests} de ${totalTests} pruebas superadas (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('==========================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante las pruebas:', err);
  process.exit(1);
});
