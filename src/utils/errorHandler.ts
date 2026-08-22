export type ErrorCode = 
  | 'FILE_TOO_LARGE' 
  | 'INVALID_FORMAT' 
  | 'CORRUPT_PDF' 
  | 'ENCRYPTION' 
  | 'NETWORK' 
  | 'UNKNOWN';

export class DocumentProcessingError extends Error {
  constructor(
    public code: ErrorCode,
    public userMessage: string,
    public technicalDetails?: string
  ) {
    super(userMessage);
    this.name = 'DocumentProcessingError';
  }
}

export function handleFileError(error: any, fileName: string): DocumentProcessingError {
  const message = (error?.message || String(error)).toLowerCase();

  if (message.includes('size') || message.includes('large') || message.includes('límite') || message.includes('excede')) {
    return new DocumentProcessingError(
      'FILE_TOO_LARGE',
      `El archivo "${fileName}" es demasiado grande. El tamaño máximo permitido es 25MB.`,
      error.message
    );
  }

  if (message.includes('encrypt') || message.includes('password') || message.includes('protegida')) {
    return new DocumentProcessingError(
      'ENCRYPTION',
      `El PDF "${fileName}" está protegido con contraseña. Por favor remueva la contraseña antes de subirlo.`,
      error.message
    );
  }

  if (message.includes('corrupt') || message.includes('invalid') || message.includes('no pudo ser procesado')) {
    return new DocumentProcessingError(
      'CORRUPT_PDF',
      `El archivo "${fileName}" tiene un formato dañado o no compatible. Pruebe re-guardándolo o convirtiéndolo a PDF.`,
      error.message
    );
  }

  if (message.includes('format') || message.includes('soportado') || message.includes('extensión')) {
    return new DocumentProcessingError(
      'INVALID_FORMAT',
      `El formato del archivo "${fileName}" no es soportado. Utilice PDF, PNG, JPG, WEBP o TXT.`,
      error.message
    );
  }

  return new DocumentProcessingError(
    'UNKNOWN',
    `Inconveniente al procesar "${fileName}": ${error.message || 'Error de lectura del archivo.'}`,
    error.message
  );
}
