/**
 * test_pdf_to_jpg.js - End-to-end verification test suite for Convertir PDF a JPG
 */

const http = require('http');

function fetchUrl(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'http://localhost:3000' + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
        }
        return resolve(fetchUrl(redirectUrl, maxRedirects - 1));
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS: CONVERTIR PDF A JPG');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // TEST 1: Route HTTP 200
    console.log('--- TEST 1: Verificación de Ruta Principal ---');
    const pageRes = await fetchUrl('http://localhost:3000/convertir-pdf-a-jpg/');
    assert(pageRes.status === 200, 'Ruta /convertir-pdf-a-jpg/ responde con status 200');

    const html = pageRes.body;

    // TEST 2: Title & Meta Description
    console.log('\n--- TEST 2: Metadatos SEO ---');
    assert(
      html.includes('<title>Convertir PDF a JPG Gratis Online | PDF a Imagen</title>'),
      'Título exacto SEO presente en <title>'
    );
    assert(
      html.includes('Convierte PDF a JPG gratis online. Transforma cada página en imágenes de alta calidad'),
      'Meta descripción SEO exacta presente'
    );
    assert(
      html.includes('rel="canonical" href="/convertir-pdf-a-jpg/"') ||
      html.includes('href="/convertir-pdf-a-jpg/" rel="canonical"'),
      'URL canónica correcta configurada'
    );

    // TEST 3: Single H1
    console.log('\n--- TEST 3: Jerarquía H1 ---');
    const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    assert(h1Matches.length === 1, `Debe haber exactamente un H1 (encontrados: ${h1Matches.length})`);
    assert(
      h1Matches[0] && h1Matches[0].includes('Convertir PDF a JPG Gratis Online'),
      'Texto exacto del H1: Convertir PDF a JPG Gratis Online'
    );

    // TEST 4: Required H2 Headings
    console.log('\n--- TEST 4: Encabezados H2 Requeridos ---');
    const requiredH2s = [
      'Cómo convertir PDF a JPG online',
      'Convierte todas las páginas de PDF a imágenes',
      'Características de nuestro conversor PDF a JPG',
      'Elige la calidad y resolución de tus imágenes',
      'Descarga imágenes JPG individualmente o en ZIP',
      'Formatos y compatibilidad',
      'Preguntas frecuentes sobre PDF a JPG',
    ];

    for (const h2 of requiredH2s) {
      assert(html.includes(h2), `H2 obligatorio presente: "${h2}"`);
    }

    // TEST 5: 12 FAQs
    console.log('\n--- TEST 5: Verificación de 12 FAQs ---');
    const requiredFaqs = [
      '¿Cómo convertir PDF a JPG gratis online?',
      '¿Puedo convertir todas las páginas de un PDF a JPG?',
      '¿Puedo convertir solo algunas páginas del PDF?',
      '¿Cómo convertir PDF a JPG sin perder calidad?',
      '¿Puedo elegir la resolución de las imágenes?',
      '¿Puedo descargar cada página por separado?',
      '¿Puedo descargar todas las imágenes en un archivo ZIP?',
      '¿Funciona el conversor PDF a JPG en el celular?',
      '¿Necesito registrarme para convertir PDF a JPG?',
      '¿Se guardan mis documentos en el servidor?',
      '¿Cuál es la diferencia entre JPG y JPEG?',
      '¿Puedo convertir archivos PDF grandes?',
    ];

    for (let i = 0; i < requiredFaqs.length; i++) {
      assert(html.includes(requiredFaqs[i]), `FAQ ${i + 1} presente: "${requiredFaqs[i]}"`);
    }

    // TEST 6: Schema.org JSON-LD (WebApplication, BreadcrumbList, FAQPage)
    console.log('\n--- TEST 6: Datos Estructurados JSON-LD ---');
    assert(html.includes('&quot;@type&quot;:&quot;WebApplication&quot;') || html.includes('"@type":"WebApplication"'), 'Schema WebApplication presente');
    assert(html.includes('&quot;@type&quot;:&quot;BreadcrumbList&quot;') || html.includes('"@type":"BreadcrumbList"'), 'Schema BreadcrumbList presente');
    assert(html.includes('&quot;@type&quot;:&quot;FAQPage&quot;') || html.includes('"@type":"FAQPage"'), 'Schema FAQPage presente');

    // TEST 7: Sitemap y Robots
    console.log('\n--- TEST 7: Sitemap y Robots ---');
    const sitemapRes = await fetchUrl('http://localhost:3000/sitemap.xml');
    assert(sitemapRes.status === 200, 'sitemap.xml responde con 200');
    assert(
      sitemapRes.body.includes('https://convertirwordapdf.org/convertir-pdf-a-jpg/'),
      'URL /convertir-pdf-a-jpg/ incluida en sitemap.xml'
    );

    // TEST 8: Zero Regressions on Existing Pages
    console.log('\n--- TEST 8: Pruebas de Cero Regresiones en Páginas Existentes ---');
    const homeRes = await fetchUrl('http://localhost:3000/');
    assert(homeRes.status === 200, 'Home (/) responde con 200');
    assert(homeRes.body.includes('Convertir Word a PDF'), 'Home mantiene Convertir Word a PDF');

    const pdfWordRes = await fetchUrl('http://localhost:3000/pdf-a-word');
    assert(pdfWordRes.status === 200, '/pdf-a-word responde con 200');
    assert(pdfWordRes.body.includes('Convertir PDF a Word'), 'Ruta /pdf-a-word intacta');

    const jpgPdfRes = await fetchUrl('http://localhost:3000/convertir-jpg-a-pdf');
    assert(jpgPdfRes.status === 200, '/convertir-jpg-a-pdf responde con 200');
    assert(jpgPdfRes.body.includes('Convertir JPG a PDF'), 'Ruta /convertir-jpg-a-pdf/ intacta');

    console.log('\n====================================================');
    console.log(`RESULTADO FINAL: ${passed} pruebas superadas, ${failed} fallidas.`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error general durante la ejecución de pruebas:', err);
    process.exit(1);
  }
}

runTests();
