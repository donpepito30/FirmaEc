import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  FileCheck2, 
  Download, 
  ExternalLink, 
  Terminal, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Cpu, 
  Lock, 
  ShieldAlert, 
  Building2,
  Layers,
  FileSignature
} from 'lucide-react';

export const FirmaEcGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'trust' | 'pki' | 'legal'>('desktop');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
          <span>Firma electrónica</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">Guía oficial</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Guía de firma electrónica
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Aprende a usar tu firma y validar tus documentos en tu equipo.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
        {[
          { id: 'desktop', label: 'Uso en FirmaEC', icon: Terminal },
          { id: 'trust', label: 'Instalar certificado raíz', icon: ShieldCheck },
          { id: 'pki', label: 'Archivo vs Token', icon: Cpu },
          { id: 'legal', label: 'Marco legal', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FIRMAEC DESKTOP GUIDE */}
      {activeTab === 'desktop' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>Pasos para usar FirmaEC</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              FirmaEC es la aplicación oficial del MINTEL para firmar documentos en Ecuador.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                {
                  step: '01',
                  title: 'Instala FirmaEC',
                  desc: 'Descarga e instala la aplicación oficial desde el sitio del MINTEL.'
                },
                {
                  step: '02',
                  title: 'Abre la aplicación',
                  desc: 'Inicia FirmaEC y ve a la pestaña Firmar Documento.'
                },
                {
                  step: '03',
                  title: 'Elige tu archivo',
                  desc: 'Selecciona la opción Archivo y busca tu firma (.p12).'
                },
                {
                  step: '04',
                  title: 'Ingresa tu clave',
                  desc: 'Escribe tu contraseña y selecciona tu documento PDF.'
                },
                {
                  step: '05',
                  title: 'Ubica la firma',
                  desc: 'Elige la página y acomoda el sello en la vista previa.'
                },
                {
                  step: '06',
                  title: 'Estampa y guarda',
                  desc: 'Haz clic en Estampar para guardar el documento firmado.'
                }
              ].map((s) => (
                <div key={s.step} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-blue-600 font-extrabold text-lg">{s.step}</span>
                  <h3 className="font-bold text-slate-900 text-xs mt-1 mb-1">{s.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Requisitos del sistema</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Java 8 o superior instalado en tu equipo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Tu archivo de firma (.p12) y contraseña.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Descarga oficial</span>
              </h3>
              <p className="text-xs text-slate-600">
                Obtén el instalador oficial desde el portal del MINTEL.
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.firmadigital.gob.ec"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors"
                >
                  <span>Portal de firma MINTEL</span>
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOT CA TRUST INSTALLATION */}
      {activeTab === 'trust' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Instalar certificado raíz</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Registra el certificado en tu equipo para que tus firmas muestren el visto verde.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">Windows</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Haz doble clic en el archivo descargado.</li>
                  <li>Pulsa en "Instalar certificado".</li>
                  <li>Elige "Usuario actual" o "Equipo local".</li>
                  <li>Selecciona "Entidades de certificación raíz de confianza".</li>
                  <li>Haz clic en Finalizar para completar la instalación.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">macOS</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre la aplicación Acceso a Llaveros.</li>
                  <li>Arrastra el archivo a la pestaña Sistema.</li>
                  <li>Haz doble clic sobre el certificado importado.</li>
                  <li>En la sección Confiar, elige "Confiar siempre".</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">Adobe Acrobat Reader</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Ve a Preferencias y selecciona Firmas.</li>
                  <li>En Identidades y certificados, pulsa Más.</li>
                  <li>Importa el certificado descargado.</li>
                  <li>Marca "Utilizar este certificado como raíz de confianza".</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FORMATS COMPARISON */}
      {activeTab === 'pki' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-blue-500/40 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  Más usado
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Archivo (.p12)</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Guárdalo en tu computador o celular.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Sirve para facturas del SRI y firmar PDFs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Protegido con tu contraseña personal.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                  Alta seguridad
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Token USB</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dispositivo físico de alta seguridad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>La clave no sale del dispositivo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Requerido para aduana y comercio exterior.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                  Remoto
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Firma en la nube</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Alojada en servidores de la entidad emisora.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Firma desde cualquier equipo con tu clave.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ideal para empresas con varios firmantes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL FRAMEWORK */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Ley de Comercio Electrónico</span>
            </h2>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-blue-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 13.- Firma electrónica</h4>
                <p className="text-slate-600 text-xs">
                  Identifica al titular y confirma su aprobación sobre el documento.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 14.- Validez jurídica</h4>
                <p className="text-slate-600 text-xs">
                  Tiene el mismo valor jurídico que la firma manuscrita y sirve como prueba en juicio.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-amber-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 17.- Extinción</h4>
                <p className="text-slate-600 text-xs">
                  Se extingue al expirar su plazo, por revocación o por renuncia del titular.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
