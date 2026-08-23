import React from 'react';
import { WifiOff, ShieldCheck, AlertCircle, X, Cpu } from 'lucide-react';
import { useSystemResilience } from '../hooks/useSystemResilience';

export const ResilienceBanner: React.FC = () => {
  const { isOnline, lastGlobalError, cryptoHardwareAvailable, clearError } = useSystemResilience();

  if (isOnline && cryptoHardwareAvailable && !lastGlobalError) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          {/* Offline Mode Indicator */}
          {!isOnline && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo Sin Conexión (Offline) Activo</span>
            </div>
          )}

          {/* Web Crypto Status */}
          {!cryptoHardwareAvailable && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Criptografía ejecutándose en modo software seguro (Forge JS)</span>
            </div>
          )}

          {/* Global Uncaught Error Alert */}
          {lastGlobalError && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-md">{lastGlobalError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Las operaciones criptográficas y firmas ocurren 100% en tu navegador</span>
          </span>

          {lastGlobalError && (
            <button
              onClick={clearError}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Desestimar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
