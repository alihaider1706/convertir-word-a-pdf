# Convertir Word a PDF – Herramienta Online Profesional (Versión Avanzada)

Aplicación web moderna, robusta y 100% responsiva desarrollada en **Next.js 14**, **TypeScript** y **Tailwind CSS** para la conversión individual y por lotes de documentos Microsoft Word (`.doc` y `.docx`) a formato PDF de alta fidelidad vectorial.

---

## 🚀 Nuevas Funcionalidades Avanzadas Implementadas

1. **Personalización del Nombre del Archivo PDF (Filename Customization)**:
   - Generación automática del nombre a partir del documento original.
   - Campo de edición en tiempo real antes y después de la conversión.
   - Sanitización contra caracteres ilegales (`/ \ : * ? " < > | \0`) preservando caracteres acentuados y Unicode (`ñ`, `á`, `é`).
   - Prevención automática de extensiones duplicadas (evita `.pdf.pdf`).
   - La descarga individual y el empaquetado en ZIP utilizan el nombre personalizado exacto.

2. **Carga Múltiple y Conversión por Lotes (Batch Word to PDF)**:
   - Carga simultánea mediante arrastrar y soltar (Drag and Drop) o selector múltiple.
   - Lista interactiva de archivos con nombre, tamaño, formato y estado individual (`En espera`, `Procesando...`, `Completado`, `Falló`).
   - Cola de procesamiento con límite de concurrencia (máximo 2 en paralelo) para evitar sobrecargas del servidor.
   - Validación independiente de cada archivo: un documento dañado no interrumpe la conversión del resto.
   - Botón de reintento individual y botón de vaciado de lista (*Vaciar lista*).

3. **Descarga de Todos los Archivos en ZIP (Batch ZIP Download)**:
   - Botón destacado **"Descargar todos (.ZIP)"** tras finalizar la conversión por lotes.
   - Empaquetado en memoria usando compresión `DEFLATE`.
   - Resolución automática de nombres duplicados (`documento.pdf`, `documento_1.pdf`).
   - Archivo ZIP 100% válido y extraíble.

4. **Configuración de Página (Page Settings)**:
   - Panel desplegable para ajustar el documento antes de convertir:
     - Tamaño de papel: **A4** (estándar) o **Carta (Letter)**.
     - Orientación: **Vertical (Portrait)** u **Horizontal (Landscape)**.
   - Preserva fuentes, márgenes, tablas e imágenes con renderizado vectorial nativo.

5. **Visor Interactivo Multipágina (PDF Preview)**:
   - Modal de vista previa integrado sin necesidad de descargas previas.
   - Navegación entre páginas: botones Anterior / Siguiente, indicador `Página X de Y`.
   - Controles de zoom: Reducir (`-`), Ampliar (`+`), Ajustar ancho (`100%`).
   - Apertura en nueva pestaña y descarga directa.
   - Adaptado a dispositivos móviles y de escritorio.

6. **Organizador y Gestor de Páginas (Rotate, Reorder, Delete)**:
   - Modal interactivo para manipular el documento PDF generado:
     - **Girar páginas:** Rotación horaria de 90° en 90°.
     - **Reordenar páginas:** Desplazamiento hacia la izquierda o derecha.
     - **Eliminar páginas:** Selección de páginas a descartar con opción de deshacer.
   - Generación y descarga directa del nuevo PDF editado conservando intacto el original.

7. **Compresión de PDF (PDF Compression)**:
   - Niveles de compresión: Baja, Mediana (recomendada), Alta.
   - Optimización de flujos de contenido y eliminación de duplicados de objetos.
   - Muestra tamaño original, tamaño comprimido y porcentaje de reducción real.
   - Mensajes honestos: si el archivo ya está optimizado, se notifica al usuario sin inventar reducciones falsas.

8. **Protección con Contraseña (PDF Password Protection)**:
   - Cifrado seguro del documento PDF mediante contraseñas con confirmación y validación.
   - Verificación interna post-cifrado para garantizar que el archivo abre correctamente.
   - Descarga del PDF protegido preservando el documento original en la sesión.
   - Ninguna contraseña se registra en los registros (logs) del servidor.

9. **Seguridad, Privacidad y Rendimiento**:
   - Validación en servidor de la firma binaria de archivo (magic bytes `PK\x03\x04` para DOCX y `\xD0\xCF\x11\xE0` para DOC).
   - Nombres temporales aleatorios con UUID para prevenir colisiones o acceso cruzado entre usuarios.
   - Eliminación automática de archivos temporales transcurrida 1 hora.

---

## 🛠️ Rutas de la API

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/convert` | `POST` | Convierte DOC/DOCX a PDF con soporte de configuración de página y nombre personalizado. |
| `/api/download` | `GET` | Descarga de PDF (`attachment`) o previsualización (`inline=true`) con nombre dinámico. |
| `/api/batch-zip` | `POST` | Empaqueta múltiples archivos PDF convertidos en un archivo ZIP de-duplicado. |
| `/api/compress` | `POST` | Comprime flujos y objetos de un archivo PDF existente. |
| `/api/protect` | `POST` | Cifra un archivo PDF con contraseña de apertura. |
| `/api/pages` | `POST` | Reordena, rota y elimina páginas de un archivo PDF con `pdf-lib`. |

---

## 💻 Instrucciones de Uso y Ejecución

```bash
cd "C:\Users\KMMOBILE\.gemini\antigravity\scratch\convertir-word-a-pdf"

# Modo Desarrollo
npm run dev

# Compilar para Producción
npm run build

# Iniciar Servidor de Producción
npm start
```
Disponible en: **`http://localhost:3000`**
