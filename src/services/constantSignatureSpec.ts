/**
 * ESTÁNDAR OFICIAL DE FIRMA DIGITAL EN ECUADOR (MINTEL / FirmaEC)
 * Especificación exacta para dimensiones, fuentes, colores y posicionamiento.
 */
export const STANDARD_SIGNATURE_SPEC = {
  // DIMENSIONES OFICIALES INMUTABLES (puntos PDF)
  STAMP_WIDTH_PT: 245,      // Ancho estándar oficial
  STAMP_HEIGHT_PT: 68,      // Alto estándar oficial
  QR_SIZE_PT: 50,           // Código QR fijo (nunca escalar)
  MARGIN_PT: 3,             // Espaciado interno mínimo
  
  // COLORES OFICIALES (RGB 0-255)
  COLOR_BACKGROUND: { r: 255, g: 255, b: 255 }, // Blanco puro
  COLOR_BORDER: { r: 200, g: 200, b: 200 },     // Gris claro #C8C8C8
  COLOR_TEXT: { r: 0, g: 0, b: 0 },             // Negro puro
  COLOR_LINE: { r: 180, g: 180, b: 180 },       // Gris línea divisoria #B4B4B4
  
  // ESPESORES DE LÍNEA
  BORDER_WIDTH_PT: 1,       // 1 punto
  LINE_WIDTH_PT: 0.5,       // Línea divisoria de 0.5 puntos
  
  // TIPOGRAFÍAS DE ALTA COMPATIBILIDAD (Courier / Helvetica)
  FONT_FAMILY: '"Courier New", Courier, monospace',
  FONT_SIZE_HEADER: 8,      // "Firmado electrónicamente por:" (Bold)
  FONT_SIZE_NAME: 8,        // Nombre del firmante (Bold, máx legible)
  FONT_SIZE_ID: 7,          // Cédula o RUC
  FONT_SIZE_DATE: 7,        // Fecha y hora
  
  // COORDENADAS RECOMENDADAS PARA QUIPUX/FIRMAEC (en %)
  POSITIONS: {
    bottomRight: { x: 88, y: 10 },
    bottomCenter: { x: 50, y: 10 },
    bottomLeft: { x: 5, y: 10 },
    topRight: { x: 88, y: 90 },
  }
};
