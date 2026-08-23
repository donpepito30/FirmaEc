/**
 * Servicio de Gestión de Memoria y Ciclo de Vida de URLs Objeto (Blobs)
 * Previene fugas de memoria (memory leaks) liberando recursos de Blob cuando
 * los componentes o vistas se desmontan o cambian de documento.
 */

class BlobManagerService {
  private activeUrls: Set<string> = new Set();

  /**
   * Crea una URL de objeto rastreada y gestionada
   */
  public createUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  /**
   * Revoca y libera una URL de objeto específica
   */
  public revokeUrl(url: string | null | undefined): void {
    if (!url) return;
    if (this.activeUrls.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignorar si ya fue liberado por el navegador
      }
      this.activeUrls.delete(url);
    }
  }

  /**
   * Libera todas las URLs de objeto activas acumuladas en sesión
   */
  public revokeAll(): void {
    this.activeUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignorar
      }
    });
    this.activeUrls.clear();
  }

  /**
   * Retorna el número total de referencias Blob activas en memoria
   */
  public getActiveCount(): number {
    return this.activeUrls.size;
  }
}

export const blobManager = new BlobManagerService();
