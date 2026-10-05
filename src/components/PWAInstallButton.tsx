import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, AppWindow } from 'lucide-react';

export const PWAInstallButton: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, show a subtle confirmation badge or hide
  if (isInstalled) {
    if (inline) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Aplicación Instalada</span>
        </span>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs cursor-pointer ${
          inline ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        }`}
        title="Instalar FirmaEC PRO en tu dispositivo"
      >
        <AppWindow className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer ${
            inline ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
          }`}
          title="Instalar en tu iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instalar en tu iPhone / iPad</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">PWA Compatible con iOS</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <p>
                  Sigue estos dos sencillos pasos para agregar **FirmaEC PRO** directamente a tu pantalla de inicio:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <span className="font-extrabold text-blue-600">1.</span>
                    <p>
                      Presiona el botón de <strong>Compartir</strong> en la barra inferior de Safari (ícono con un cuadrado y una flecha hacia arriba).
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <span className="font-extrabold text-blue-600">2.</span>
                    <p>
                      Desplázate hacia abajo en el menú de opciones y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  ¡Listo! Podrás ingresar de manera directa e incluso utilizarlo de forma offline.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-500/10"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
