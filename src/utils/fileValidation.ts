export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 25MB
export const MAX_DOCUMENTS = 10;
export const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];

export function validateFileUpload(files: File[], currentCount: number = 0): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length + currentCount > MAX_DOCUMENTS) {
    errors.push(`Máximo ${MAX_DOCUMENTS} documentos permitidos en total (actualmente tienes ${currentCount}).`);
  }

  for (const file of files) {
    if (!file) continue;

    // 1. Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `"${file.name}": Excede el límite de ${MAX_FILE_SIZE_MB}MB (Tamaño: ${(file.size / (1024 * 1024)).toFixed(1)}MB). Por favor comprima o reduzca el archivo.`
      );
    }

    // 2. Validar extensión
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`"${file.name}": Extensión .${ext || 'desconocida'} no permitida. Formatos soportados: PDF, PNG, JPG, WEBP o TXT.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
