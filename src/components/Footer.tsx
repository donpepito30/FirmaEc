import React from 'react';
import { ShieldCheck, ExternalLink, FileSignature, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base font-display">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileSignature className="w-4 h-4" />
              </div>
              <span className="tracking-tight">FirmaEC PRO Ecuador</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal seguro de firma electrónica, estampado de sellos QR y emisión de archivos PKCS#12 (.p12) bajo la legislación ecuatoriana.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Módulos
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-slate-200 transition-colors">Estampado y Firma PDF</li>
              <li className="hover:text-slate-200 transition-colors">Conversión de Archivos</li>
              <li className="hover:text-slate-200 transition-colors">Generador de Certificados .p12</li>
              <li className="hover:text-slate-200 transition-colors">Inspector Criptográfico</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Enlaces Oficiales
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="https://www.firmadigital.gob.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  FirmaEC - MINTEL <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.bce.fin.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  Banco Central (BCE) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.sri.gob.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  SRI Ecuador <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Privacidad Local
            </h4>
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Procesamiento 100% Local</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Las firmas y operaciones criptográficas ocurren en la memoria de su navegador. Sus documentos y claves privadas nunca se transmiten a servidores externos.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 FirmaEC PRO Ecuador. Cumplimiento con la Ley de Comercio Electrónico y Firmas Digitales (R.O. 557).</p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Infraestructura PKI Estándar X.509 v3 / PKCS#12</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
