import * as pdfjsLib from 'pdfjs-dist';
// Importar el worker de pdfjs-dist directamente con Vite para evitar timeouts de red o CDN caídos
// @ts-ignore
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

/**
 * Cache de documentos cargados en memoria para re-renderizado instantáneo de páginas
 */
const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

/**
 * Clona de forma segura un ArrayBuffer para aislar la memoria de transferencias
 */
export function cloneArrayBuffer(buffer: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (!buffer) return new ArrayBuffer(0);
  if (buffer instanceof Uint8Array) {
    if (buffer.byteLength === 0 || buffer.buffer.byteLength === 0) return new ArrayBuffer(0);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  if (buffer.byteLength === 0) return new ArrayBuffer(0);
  return buffer.slice(0);
}

/**
 * Crea una copia segura del ArrayBuffer/Uint8Array para evitar que el Web Worker de pdfjs-dist
 * desasocie (detach) la memoria original del hilo principal.
 */
function getSafePdfBytes(pdfBuffer: Uint8Array | ArrayBuffer): Uint8Array {
  if (!pdfBuffer) {
    throw new Error('No se proporcionó ningún buffer de PDF.');
  }

  let rawBuffer: ArrayBuffer;
  let byteOffset = 0;
  let byteLength = 0;

  if (pdfBuffer instanceof Uint8Array) {
    if (pdfBuffer.byteLength === 0 || pdfBuffer.buffer.byteLength === 0) {
      throw new Error('El buffer del PDF está desasociado (detached).');
    }
    rawBuffer = pdfBuffer.buffer;
    byteOffset = pdfBuffer.byteOffset;
    byteLength = pdfBuffer.byteLength;
  } else if (pdfBuffer instanceof ArrayBuffer) {
    if (pdfBuffer.byteLength === 0) {
      throw new Error('El ArrayBuffer del PDF está desasociado (detached).');
    }
    rawBuffer = pdfBuffer;
    byteOffset = 0;
    byteLength = pdfBuffer.byteLength;
  } else {
    throw new Error('El formato del buffer no es válido.');
  }

  // Clonar el tramo de memoria para que la transferencia al worker sea sobre el clon
  const clonedBuffer = rawBuffer.slice(byteOffset, byteOffset + byteLength);
  return new Uint8Array(clonedBuffer);
}

async function getPdfDocument(pdfBuffer: Uint8Array | ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  const bytes = getSafePdfBytes(pdfBuffer);
  
  // Hash simple para cache basado en la muestra del buffer
  let hash = 0;
  const sampleLength = Math.min(bytes.length, 1024);
  for (let i = 0; i < sampleLength; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash |= 0;
  }
  const cacheKey = `${bytes.length}_${hash}`;

  if (pdfDocCache.has(cacheKey)) {
    return pdfDocCache.get(cacheKey)!;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    useSystemFonts: true,
    stopAtErrors: false,
  });

  const doc = await loadingTask.promise;
  
  // Mantener máx 5 documentos en cache para cuidar memoria
  if (pdfDocCache.size > 5) {
    const firstKey = pdfDocCache.keys().next().value;
    if (firstKey) pdfDocCache.delete(firstKey);
  }
  pdfDocCache.set(cacheKey, doc);

  return doc;
}

export interface RenderedPdfPageResult {
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  numPages: number;
  pageNumber: number;
}

/**
 * Renderiza la página exacta de un archivo PDF a una imagen DataURL de alta definición (PNG)
 */
export async function renderPdfPageToDataUrl(
  pdfBuffer: Uint8Array | ArrayBuffer,
  pageNumber: number = 1,
  targetWidth: number = 900
): Promise<RenderedPdfPageResult> {
  try {
    const pdf = await getPdfDocument(pdfBuffer);
    const numPages = pdf.numPages;

    // Ajustar número de página dentro del rango válido
    const clampedPage = Math.max(1, Math.min(pageNumber, numPages));

    const page = await pdf.getPage(clampedPage);
    const viewportOriginal = page.getViewport({ scale: 1.0 });

    const aspectRatio = viewportOriginal.width / viewportOriginal.height;
    const scale = targetWidth / viewportOriginal.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo inicializar el contexto 2D del Canvas');
    }

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/png');

    return {
      dataUrl,
      width: viewportOriginal.width,
      height: viewportOriginal.height,
      aspectRatio,
      numPages,
      pageNumber: clampedPage,
    };
  } catch (err) {
    console.error('Error al renderizar la página del PDF original:', err);
    throw err;
  }
}
