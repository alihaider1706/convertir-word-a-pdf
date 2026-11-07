const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchUrl(url, options = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).toString();
        }
        return resolve(fetchUrl(redirectUrl, options, maxRedirects - 1));
      }

      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: buffer.toString('utf8'),
          rawBuffer: buffer,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function makeMultipartBody(fields, fileField) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  let postData = [];

  for (const [key, val] of Object.entries(fields)) {
    postData.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${val}${crlf}`));
  }

  if (fileField) {
    postData.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"${crlf}Content-Type: ${fileField.contentType}${crlf}${crlf}`
      )
    );
    postData.push(fileField.buffer);
    postData.push(Buffer.from(crlf));
  }

  postData.push(Buffer.from(`--${boundary}--${crlf}`));

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat(postData),
  };
}

async function runTests() {
  console.log('===============================================================');
  console.log('🌐 BANCO DE PRUEBAS END-TO-END HTTP: CONVERTIR PDF A PPT');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${name} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      console.error(`❌ [FAIL] ${name} ${detail ? '(' + detail + ')' : ''}`);
    }
  }

  const PORT = 3055;
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -----------------------------------------------------------
    // TEST 1: Verificación de Ruta Principal
    // -----------------------------------------------------------
    console.log('--- TEST 1: Respuesta HTTP 200 y Renderizado de Página ---');
    const pageRes = await fetchUrl(`${baseUrl}/convertir-pdf-a-ppt/`);
    assert(pageRes.status === 200, 'Ruta /convertir-pdf-a-ppt/ responde con código 200 OK');

    const html = pageRes.body;

    // -----------------------------------------------------------
    // TEST 2: Metadatos SEO Exactos
    // -----------------------------------------------------------
    console.log('\n--- TEST 2: Metadatos SEO y Etiquetas Canónicas ---');
    assert(
      html.includes('Convertir PDF a PPT Gratis Online | PDF a PowerPoint'),
      'Etiqueta <title> contiene el título SEO exacto'
    );
    assert(
      html.includes('Convierte PDF a PPT gratis y online'),
      'Meta descripción SEO exacta presente en el documento HTML'
    );
    assert(
      html.includes('rel="canonical"') && html.includes('https://convertirwordapdf.net/convertir-pdf-a-ppt/'),
      'URL canónica oficial configurada (https://convertirwordapdf.net/convertir-pdf-a-ppt/)'
    );

    // -----------------------------------------------------------
    // TEST 3: Jerarquía H1
    // -----------------------------------------------------------
    console.log('\n--- TEST 3: Jerarquía de Encabezados H1 ---');
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    assert(h1Matches.length === 1, 'Exactamente un único encabezado H1 presente en la página', `Encontrados: ${h1Matches.length}`);
    assert(
      h1Matches[0] && h1Matches[0].includes('Convertir PDF a PPT Gratis'),
      'Texto exacto del H1: "Convertir PDF a PPT Gratis"'
    );

    // -----------------------------------------------------------
    // TEST 4: Encabezados H2 Requeridos
    // -----------------------------------------------------------
    console.log('\n--- TEST 4: Encabezados H2 Requeridos por la Estrategia SEO ---');
    const requiredH2s = [
      'Cómo convertir PDF a PPT online gratis',
      'Convierte PDF a PowerPoint editable',
      'Características de nuestro convertidor de PDF a PPT',
      'Cómo funciona la conversión de PDF a PowerPoint',
      'Ventajas de convertir PDF a PPT',
      'Preguntas frecuentes sobre convertir PDF a PPT',
    ];

    for (const h2 of requiredH2s) {
      assert(html.includes(h2), `H2 obligatorio verificado: "${h2}"`);
    }

    // -----------------------------------------------------------
    // TEST 5: Datos Estructurados JSON-LD Schema.org
    // -----------------------------------------------------------
    console.log('\n--- TEST 5: Esquemas JSON-LD Schema.org ---');
    assert(
      html.includes('&quot;@type&quot;:&quot;SoftwareApplication&quot;') || html.includes('"@type":"SoftwareApplication"'),
      'Esquema SoftwareApplication presente para indexación enriquecida'
    );
    assert(
      html.includes('&quot;@type&quot;:&quot;BreadcrumbList&quot;') || html.includes('"@type":"BreadcrumbList"'),
      'Esquema BreadcrumbList presente'
    );

    // -----------------------------------------------------------
    // TEST 6: Inclusión en Sitemap y Robots
    // -----------------------------------------------------------
    console.log('\n--- TEST 6: Sitemap.xml y Robots.txt ---');
    const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
    assert(sitemapRes.status === 200, 'Sitemap.xml responde con código 200');
    assert(
      sitemapRes.body.includes('/convertir-pdf-a-ppt/'),
      'Nueva ruta /convertir-pdf-a-ppt/ indexada correctamente en el sitemap'
    );

    const robotsRes = await fetchUrl(`${baseUrl}/robots.txt`);
    assert(robotsRes.status === 200, 'Robots.txt responde con código 200');
    assert(robotsRes.body.toLowerCase().includes('sitemap:'), 'Directiva sitemap presente en robots.txt');

    // -----------------------------------------------------------
    // TEST 7: API /api/pdf-to-ppt/pages
    // -----------------------------------------------------------
    console.log('\n--- TEST 7: Endpoint API de Inspección de Páginas (/api/pdf-to-ppt/pages) ---');
    const samplePdfPath = path.join(__dirname, '../public/Convertir_Word_a_PDF_Features_Document.pdf');
    const pdfBuf = fs.readFileSync(samplePdfPath);

    const pagesMultipart = makeMultipartBody({}, {
      name: 'file',
      filename: 'test.pdf',
      contentType: 'application/pdf',
      buffer: pdfBuf,
    });

    const pagesRes = await fetchUrl(`${baseUrl}/api/pdf-to-ppt/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': pagesMultipart.contentType,
        'Content-Length': pagesMultipart.body.length,
      },
      body: pagesMultipart.body,
    });

    assert(pagesRes.status === 200, 'API /api/pdf-to-ppt/pages responde con 200 OK');
    const pagesJson = JSON.parse(pagesRes.body);
    assert(pagesJson.success === true, 'Respuesta API indica success: true');
    assert(pagesJson.pageCount === 2, 'Conteo exacto de páginas retornado: 2 páginas');

    // -----------------------------------------------------------
    // TEST 8: API /api/pdf-to-ppt/convert (Conversión Completa HTTP)
    // -----------------------------------------------------------
    console.log('\n--- TEST 8: Endpoint API de Conversión Completa (/api/pdf-to-ppt/convert) ---');
    const convertMultipart = makeMultipartBody(
      {
        customFilename: 'presentacion_http_test.pptx',
        mode: 'editable',
      },
      {
        name: 'file',
        filename: 'informe_completo.pdf',
        contentType: 'application/pdf',
        buffer: pdfBuf,
      }
    );

    const convertRes = await fetchUrl(`${baseUrl}/api/pdf-to-ppt/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': convertMultipart.contentType,
        'Content-Length': convertMultipart.body.length,
      },
      body: convertMultipart.body,
    });

    assert(convertRes.status === 200, 'API /api/pdf-to-ppt/convert responde con código 200 OK');
    const convertJson = JSON.parse(convertRes.body);
    assert(convertJson.success === true, 'Conversión procesada con éxito');
    assert(Boolean(convertJson.id), 'ID de descarga generado', convertJson.id);
    assert(convertJson.slideCount === 2, '2 diapositivas generadas');
    assert(convertJson.pptxSize > 5000, 'Tamaño del archivo PPTX generado', `${convertJson.pptxSize} bytes`);

    // -----------------------------------------------------------
    // TEST 9: API /api/pdf-to-ppt/download (Descarga de Archivo Binario)
    // -----------------------------------------------------------
    console.log('\n--- TEST 9: Endpoint API de Descarga (/api/pdf-to-ppt/download) ---');
    const downloadRes = await fetchUrl(`${baseUrl}${convertJson.downloadUrl}`);
    assert(downloadRes.status === 200, 'Descarga responde con código 200 OK');
    assert(
      downloadRes.headers['content-type'].includes('presentationml'),
      'Cabecera Content-Type oficial de Microsoft PowerPoint (.pptx) servida'
    );
    assert(downloadRes.rawBuffer.length > 5000, 'Buffer binario descargado íntegro', `${downloadRes.rawBuffer.length} bytes`);

    // -----------------------------------------------------------
    // TEST 10: API /api/pdf-to-ppt/batch-zip (Descarga por Lotes ZIP)
    // -----------------------------------------------------------
    console.log('\n--- TEST 10: Endpoint API de Empaquetado por Lotes (/api/pdf-to-ppt/batch-zip) ---');
    const zipPayload = JSON.stringify({
      items: [
        { fileId: convertJson.id, customName: 'presentacion_descargada.pptx' },
      ],
    });

    const zipRes = await fetchUrl(`${baseUrl}/api/pdf-to-ppt/batch-zip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(zipPayload),
      },
      body: Buffer.from(zipPayload),
    });

    assert(zipRes.status === 200, 'API /api/pdf-to-ppt/batch-zip responde con código 200 OK');
    assert(zipRes.headers['content-type'].includes('zip'), 'Cabecera Content-Type es application/zip');
    assert(zipRes.rawBuffer.length > 5000, 'Buffer ZIP binario generado', `${zipRes.rawBuffer.length} bytes`);

    console.log('\n===============================================================');
    console.log(`🎉 BANCO DE PRUEBAS END-TO-END FINALIZADO: ${passed} de ${total} SUPERADAS (${Math.round((passed / total) * 100)}%)`);
    console.log('===============================================================\n');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error fatal durante las pruebas HTTP:', err);
    process.exit(1);
  }
}

runTests();
