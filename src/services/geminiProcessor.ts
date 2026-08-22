export interface GeminiDocumentAnalysis {
  isValid: boolean | null; // null = no validado (diferente a false)
  documentType?: string;
  hasSignatureField?: boolean | null;
  quality?: 'good' | 'fair' | 'poor' | 'unknown';
  recommendations: string[];
  rejectionReason?: string | null;
  validationMode?: 'online' | 'offline' | 'fallback_error';
  error?: string;
}

/**
 * Analiza un documento llamando al endpoint /api/analyze-document con fallback seguro
 */
export async function analyzeDocumentWithGemini(
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<GeminiDocumentAnalysis> {
  try {
    const response = await fetch('/api/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        mimeType,
        fileName,
      }),
    });

    const data: any = await response.json();

    // ✅ CASO 1: Validación exitosa online
    if (response.ok && data.validationMode === 'online') {
      return {
        isValid: data.isValid === true,
        documentType: data.documentType || 'documento',
        hasSignatureField: data.hasSignatureField ?? true,
        quality: data.quality || 'good',
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : ['Documento analizado'],
        rejectionReason: data.rejectionReason || null,
        validationMode: 'online',
      };
    }

    // ⚠️ CASO 2: Error en Gemini (fallback error, status 503)
    if (response.status === 503) {
      return {
        isValid: null, // IMPORTANTE: null, no false (no validado)
        documentType: data.documentType || 'sin_validar',
        quality: 'unknown',
        hasSignatureField: null,
        recommendations: [
          '❌ Validación con IA no disponible',
          `Razón: ${data.error || 'Servicio de IA no disponible temporalmente'}`,
          '✓ Puede proceder bajo verificación manual',
        ],
        rejectionReason: null,
        validationMode: 'fallback_error',
        error: data.error,
      };
    }

    // ⚠️ CASO 3: Gemini no configurada (offline)
    if (data.validationMode === 'offline') {
      return {
        isValid: null,
        documentType: 'modo_offline',
        quality: 'unknown',
        hasSignatureField: null,
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [
          '✓ Modo offline activo (GEMINI_API_KEY no configurada)',
          '• Proceda con verificación manual de la estructura',
        ],
        rejectionReason: null,
        validationMode: 'offline',
      };
    }

    // 🛑 CASO Rate Limit Exceeded (status 429)
    if (response.status === 429) {
      return {
        isValid: null,
        documentType: 'limite_excedido',
        quality: 'unknown',
        hasSignatureField: null,
        recommendations: [
          '🛑 Límite de análisis por hora alcanzado (10/hora)',
          '• Por razones de seguridad y cuotas, se ha pausado la IA',
          '✓ Puede continuar procesando y firmando su documento manualmente',
        ],
        rejectionReason: null,
        validationMode: 'fallback_error',
        error: data.message || 'Rate Limit Exceeded',
      };
    }

    // 🔴 CASO 4: Input inválido (status 400)
    if (response.status === 400) {
      return {
        isValid: false,
        documentType: 'invalido',
        quality: 'poor',
        hasSignatureField: false,
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : ['Error de validación de entrada'],
        rejectionReason: data.error || 'Estructura o formato de archivo no permitido',
        validationMode: 'offline',
        error: 'Input validation failed',
      };
    }

    // 🔴 CASO 5: Error interno / genérico
    return {
      isValid: null,
      documentType: 'error_servidor',
      quality: 'unknown',
      hasSignatureField: null,
      recommendations: [
        '❌ Error interno en la verificación',
        'Intente nuevamente o realice verificación manual',
      ],
      rejectionReason: null,
      validationMode: 'fallback_error',
      error: data.error || 'Internal Server Error',
    };
  } catch (error: any) {
    // Error de red/conexión
    return {
      isValid: null,
      documentType: 'error_red',
      quality: 'unknown',
      hasSignatureField: null,
      recommendations: [
        '❌ Error de conexión con el servidor',
        'Verifique su conexión de red',
      ],
      rejectionReason: null,
      validationMode: 'fallback_error',
      error: String(error?.message || error),
    };
  }
}

/**
 * Valida un documento pasándole un ArrayBuffer
 */
export async function validateDocumentWithGemini(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string = 'application/pdf'
): Promise<GeminiDocumentAnalysis> {
  const maxBytes = 4 * 1024 * 1024; // 4MB slice for fast transmission
  const bufferSlice = fileBuffer.byteLength > maxBytes ? fileBuffer.slice(0, maxBytes) : fileBuffer;
  const bytes = new Uint8Array(bufferSlice);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  return analyzeDocumentWithGemini(
    base64Data,
    mimeType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
    fileName
  );
}
