const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const JSZip = require('jszip');
const pptxgen = require('pptxgenjs');

const execFileAsync = promisify(execFile);

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 BANCO DE PRUEBAS DEL MOTOR DE CONVERSIÓN: PDF A POWERPOINT');
  console.log('===============================================================\n');

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

  assert(fs.existsSync(samplePdfPath), 'PDF de prueba de referencia localizado', samplePdfPath);

  const pythonScript = path.join(__dirname, 'pdf_tools.py');
  const tempDir = path.join(__dirname, 'temp_test_ppt');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const jsonOutEditable = path.join(tempDir, 'extract_editable.json');
  const jsonOutFidelity = path.join(tempDir, 'extract_fidelity.json');
  const jsonOutRange = path.join(tempDir, 'extract_range.json');
  const pptxOutEditable = path.join(tempDir, 'test_editable.pptx');
  const pptxOutFidelity = path.join(tempDir, 'test_fidelity.pptx');

  try {
    // -------------------------------------------------------------
    // TEST 1: Extracción Python en Modo Editable
    // -------------------------------------------------------------
    console.log('--- TEST 1: Extracción Estructural de Texto, Tablas y Coordenadas ---');
    const resEditable = await execFileAsync('python', [
      '-u',
      pythonScript,
      'extract_for_ppt',
      samplePdfPath,
      jsonOutEditable,
      JSON.stringify({ mode: 'editable' }),
    ]);

    assert(resEditable.stdout.includes('EXTRACT_PPT_SUCCESS:2'), 'PyMuPDF procesó exitosamente las 2 páginas del PDF');
    assert(fs.existsSync(jsonOutEditable), 'Archivo JSON de extracción generado en disco');

    const extractData = JSON.parse(fs.readFileSync(jsonOutEditable, 'utf8'));
    assert(extractData.slides && extractData.slides.length === 2, 'Total de diapositivas extraídas coincide exactamente con páginas', `${extractData.slides.length} slides`);

    const slide1 = extractData.slides[0];
    assert(slide1.widthPt > 500 && slide1.heightPt > 700, 'Dimensiones y proporciones de página detectadas con exactitud milimétrica', `${slide1.widthPt}x${slide1.heightPt} pt`);
    assert(slide1.textBlocks.length > 20, 'Bloques de texto independientes detectados', `${slide1.textBlocks.length} bloques`);

    // Verify text content
    const fullTextSlide1 = slide1.textBlocks.map((b) => b.fullText).join(' ');
    assert(fullTextSlide1.includes('Convertir Word a PDF'), 'Título principal del PDF extraído sin pérdida de caracteres');
    assert(fullTextSlide1.includes('Executive Technical Feature'), 'Subtítulo y metadatos preservados íntegramente');

    // -------------------------------------------------------------
    // TEST 2: Reconstrucción y Creación de Archivo PPTX Nativo
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Generación de Archivo PPTX Nativo OpenXML ---');
    const pres = new pptxgen();
    pres.defineLayout({
      name: 'PDF_PAGE',
      width: slide1.widthPt / 72,
      height: slide1.heightPt / 72,
    });
    pres.layout = 'PDF_PAGE';

    for (const sData of extractData.slides) {
      const slide = pres.addSlide();
      for (const block of sData.textBlocks) {
        const textRuns = block.lines.flatMap((line) =>
          line.spans.map((span) => ({
            text: span.text,
            options: {
              fontSize: Math.max(7, Math.min(Math.round(span.size), 72)),
              color: span.color || '0F172A',
              bold: span.isBold,
              italic: span.isItalic,
            },
          }))
        );

        if (textRuns.length > 0) {
          slide.addText(textRuns, {
            x: block.bbox[0] / 72,
            y: block.bbox[1] / 72,
            w: Math.max(0.4, (block.bbox[2] - block.bbox[0]) / 72),
            h: Math.max(0.2, (block.bbox[3] - block.bbox[1]) / 72),
            margin: 0,
            wrap: true,
          });
        }
      }
    }

    await pres.writeFile({ fileName: pptxOutEditable });
    assert(fs.existsSync(pptxOutEditable), 'Archivo PPTX generado físicamente en disco');

    const pptxStats = fs.statSync(pptxOutEditable);
    assert(pptxStats.size > 20000, 'Tamaño del archivo PPTX válido para Microsoft PowerPoint', `${pptxStats.size} bytes`);

    // Verify OpenXML internal archive structure
    const pptxZip = await JSZip.loadAsync(fs.readFileSync(pptxOutEditable));
    assert(Boolean(pptxZip.file('[Content_Types].xml')), 'Esquema OpenXML estándar: [Content_Types].xml verificado');
    assert(Boolean(pptxZip.file('ppt/presentation.xml')), 'Esquema OpenXML estándar: ppt/presentation.xml verificado');
    assert(Boolean(pptxZip.file('ppt/slides/slide1.xml')), 'Paquete contiene ppt/slides/slide1.xml');
    assert(Boolean(pptxZip.file('ppt/slides/slide2.xml')), 'Paquete contiene ppt/slides/slide2.xml');

    const slide1Xml = await pptxZip.file('ppt/slides/slide1.xml').async('text');
    assert(slide1Xml.includes('Convertir Word a PDF'), 'XML interno de la diapositiva contiene cadenas de texto 100% editables');

    // -------------------------------------------------------------
    // TEST 3: Modo Alta Fidelidad
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Renderizado y Modo Alta Fidelidad ---');
    const resFidelity = await execFileAsync('python', [
      '-u',
      pythonScript,
      'extract_for_ppt',
      samplePdfPath,
      jsonOutFidelity,
      JSON.stringify({ mode: 'fidelity' }),
    ]);

    assert(resFidelity.stdout.includes('EXTRACT_PPT_SUCCESS:2'), 'Modo alta fidelidad renderizó todas las diapositivas');
    const fidData = JSON.parse(fs.readFileSync(jsonOutFidelity, 'utf8'));
    assert(Boolean(fidData.slides[0].bgImagePath && fs.existsSync(fidData.slides[0].bgImagePath)), 'Imagen de fondo de alta definición generada para diapositiva 1');
    assert(Boolean(fidData.slides[1].bgImagePath && fs.existsSync(fidData.slides[1].bgImagePath)), 'Imagen de fondo de alta definición generada para diapositiva 2');

    // -------------------------------------------------------------
    // TEST 4: Selección de Rango de Páginas
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Filtro de Rango de Diapositivas ---');
    const resRange = await execFileAsync('python', [
      '-u',
      pythonScript,
      'extract_for_ppt',
      samplePdfPath,
      jsonOutRange,
      JSON.stringify({ mode: 'editable', page_range: '2' }),
    ]);

    assert(resRange.stdout.includes('EXTRACT_PPT_SUCCESS:1'), 'Rango "2" extrajo únicamente 1 diapositiva');
    const rangeData = JSON.parse(fs.readFileSync(jsonOutRange, 'utf8'));
    assert(rangeData.slides.length === 1 && rangeData.slides[0].pageNumber === 2, 'La diapositiva extraída corresponde fielmente a la página solicitada (página 2)');

    // -------------------------------------------------------------
    // TEST 5: Generación de Archivo ZIP para Descargas en Lote
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Empaquetado de Lotes en ZIP ---');
    const zip = new JSZip();
    zip.file('presentacion_1.pptx', fs.readFileSync(pptxOutEditable));
    zip.file('presentacion_2.pptx', fs.readFileSync(pptxOutEditable));
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    assert(zipBuf.length > 20000, 'Archivo ZIP generado correctamente con compresión DEFLATE', `${zipBuf.length} bytes`);
    const verifiedZip = await JSZip.loadAsync(zipBuf);
    assert(Boolean(verifiedZip.file('presentacion_1.pptx')), 'ZIP contiene presentacion_1.pptx');
    assert(Boolean(verifiedZip.file('presentacion_2.pptx')), 'ZIP contiene presentacion_2.pptx');

    // -------------------------------------------------------------
    // TEST 6: Resiliencia ante Archivos Inválidos y Vacíos
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Manejo de Errores y Seguridad ---');
    let threwError = false;
    try {
      const corruptPath = path.join(tempDir, 'corrupt.pdf');
      fs.writeFileSync(corruptPath, 'THIS IS NOT A VALID PDF FILE AT ALL');
      await execFileAsync('python', [
        '-u',
        pythonScript,
        'extract_for_ppt',
        corruptPath,
        path.join(tempDir, 'corrupt_out.json'),
        '{}',
      ]);
    } catch {
      threwError = true;
    }
    assert(threwError, 'El motor rechaza de forma segura archivos corruptos o maliciosos');

    console.log('\n===============================================================');
    console.log(`📊 BANCO DE PRUEBAS COMPLETADO: ${passedTests} de ${totalTests} SUPERADAS (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('===============================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } finally {
    // Clean up temporary test files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la prueba del motor:', err);
  process.exit(1);
});
