import React from 'react';
import { Lock, FileSignature } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-500 text-xs py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Logo & Copyright */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <FileSignature className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200">FirmaEC PRO</span>
          <span className="text-slate-600">|</span>
          <p>© 2026. Todos los derechos reservados.</p>
        </div>

        {/* Right Side: Plain, non-technical Security Statement */}
        <div className="flex items-center gap-2 text-slate-400 font-medium text-center sm:text-right">
          <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Firma segura: Sus documentos se procesan de forma 100% privada y local en su equipo.</span>
        </div>

      </div>
    </footer>
  );
};
