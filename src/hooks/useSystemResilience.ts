import { useState, useEffect, useCallback } from 'react';

export interface SystemResilienceState {
  isOnline: boolean;
  lastGlobalError: string | null;
  cryptoHardwareAvailable: boolean;
  clearError: () => void;
}

export function useSystemResilience(): SystemResilienceState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastGlobalError, setLastGlobalError] = useState<string | null>(null);
  const [cryptoHardwareAvailable, setCryptoHardwareAvailable] = useState<boolean>(true);

  // Monitor de estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar disponibilidad de Web Crypto API
    if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
      setCryptoHardwareAvailable(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor de errores asíncronos globales no capturados (unhandled rejections)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason || 'Promesa rechazada no manejada');
      console.warn('⚡ Resiliencia Sistema [Unhandled Promise Rejection]:', reason);

      // Prevenir el mensaje de error feo en consola si es un error recuperable conocido
      if (
        message.toLowerCase().includes('canvas') ||
        message.toLowerCase().includes('font') ||
        message.toLowerCase().includes('resizeobserver')
      ) {
        event.preventDefault();
        return;
      }

      setLastGlobalError(`Aviso de Sistema: ${message}`);
    };

    const handleGlobalError = (event: ErrorEvent) => {
      console.error('⚡ Resiliencia Sistema [Global Uncaught Error]:', event.error);
      if (event.message?.includes('ResizeObserver')) {
        return; // Error benigno de re-renderizado
      }
      setLastGlobalError(`Inconveniente detectado: ${event.message || 'Error de ejecución'}`);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const clearError = useCallback(() => {
    setLastGlobalError(null);
  }, []);

  return {
    isOnline,
    lastGlobalError,
    cryptoHardwareAvailable,
    clearError
  };
}
