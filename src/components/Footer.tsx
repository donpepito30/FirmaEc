import React from 'react';
import { ShieldCheck, ExternalLink, FileSignature, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base font-display">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <FileSignature className="w-4 h-4" />
              </div>
              <span className="tracking-tight">FirmaEC Pro Ecuador</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de firmado electrónico, estampado visual en documentos PDF, generación de archivos PKCS#12 (.p12) e inspección criptográfica bajo la Ley de Comercio Electrónico del Ecuador.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Módulos de Firma Digital
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-slate-200 transition-colors">Estampado y Firma de Documentos PDF</li>
              <li className="hover:text-slate-200 transition-colors">Conversión de Imágenes y Texto a PDF</li>
              <li className="hover:text-slate-200 transition-colors">Generador de Certificados .p12 / .pfx</li>
              <li className="hover:text-slate-200 transition-colors">Validador e Inspector Criptográfico</li>
              <li className="hover:text-slate-200 transition-colors">Guía Técnica de FirmaEC y ARCOTEL</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Autoridades de Certificación Ecuador
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="https://www.firmadigital.gob.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  FirmaEC - MINTEL <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.bce.fin.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  Banco Central del Ecuador (BCE) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.securitydata.net.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  Security Data Seguridad en Datos <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.sri.gob.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  Servicio de Rentas Internas (SRI) <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.arcotel.gob.ec" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
                  ARCOTEL Ecuador <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Seguridad & Privacidad Local
            </h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Privacidad Garantizada</span>
              </div>
              <p className="text-slate-400">
                Todo el proceso criptográfico y el firmado de tus documentos PDF se realiza 100% en la memoria de tu navegador. Ningún documento ni clave privada es enviada a servidores externos.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 FirmaEC Pro Ecuador. Cumplimiento estricto con la Ley de Comercio Electrónico y Firmas Digitales (R.O. 557).</p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Infraestructura PKI Estándar X.509 v3 / PKCS#12</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

