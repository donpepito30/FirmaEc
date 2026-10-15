/**
 * ESTÁNDAR OFICIAL DE FIRMA DIGITAL EN ECUADOR (MINTEL / FirmaEC)
 * Especificación exacta para dimensiones, fuentes, colores y posicionamiento.
 */
export const STANDARD_SIGNATURE_SPEC = {
  // DIMENSIONES OFICIALES FIRMAEC AJUSTADAS AL CONTENIDO (puntos PDF)
  // Sin margen muerto a la derecha para permitir firmar pegado al borde derecho de la hoja
  STAMP_WIDTH_PT: 190,      // Ancho ajustado a QR (50pt) + Espacio (7pt) + Texto Courier (~130pt)
  STAMP_HEIGHT_PT: 56,      // Alto estándar oficial para QR (50pt) + márgenes mínimos
  QR_SIZE_PT: 50,           // Código QR fijo (nunca escalar)
  MARGIN_PT: 3,             // Espaciado interno mínimo
  
  // COLORES OFICIALES (RGB 0-255)
  COLOR_BACKGROUND: { r: 255, g: 255, b: 255 }, // Blanco puro
  COLOR_BORDER: { r: 200, g: 200, b: 200 },     // Gris claro #C8C8C8
  COLOR_TEXT: { r: 0, g: 0, b: 0 },             // Negro puro
  COLOR_TEXT_BLUE: { r: 0, g: 51, b: 102 },     // Azul oficial FirmaEC #003366
  COLOR_LINE: { r: 180, g: 180, b: 180 },       // Gris línea divisoria #B4B4B4
  
  // ESPESORES DE LÍNEA
  BORDER_WIDTH_PT: 1,       // 1 punto
  LINE_WIDTH_PT: 0.5,       // Línea divisoria de 0.5 puntos
  
  // TIPOGRAFÍAS DE ALTA COMPATIBILIDAD (Courier / Helvetica)
  FONT_FAMILY: '"Courier New", Courier, monospace',
  FONT_SIZE_HEADER: 7.5,    // "Firmado electrónicamente por:" (Courier Regular, alineado al borde superior del QR)
  FONT_SIZE_NAME: 10,       // Nombre del firmante (Courier Bold destacado)
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
