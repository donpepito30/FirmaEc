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
          <span>Infraestructura PKI Ecuador</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">Guía Técnica & Normativa Oficial</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Guía Técnica de FirmaEC & Estándares Digitales
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Manual operativo, configuración de almacén de certificados en Java y Adobe Acrobat, y marco legal de la Ley de Comercio Electrónico de la República del Ecuador.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
        {[
          { id: 'desktop', label: 'Uso con Software FirmaEC Desktop', icon: Terminal },
          { id: 'trust', label: 'Instalación de CA Raíz en Sistema Operativo', icon: ShieldCheck },
          { id: 'pki', label: 'Formatos: Archivo .p12 vs Token USB', icon: Cpu },
          { id: 'legal', label: 'Marco Legal & Validez Probatoria', icon: BookOpen }
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
              <span>Cómo usar tu archivo .p12 en la aplicación oficial FirmaEC (MINTEL)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>FirmaEC</strong> es el software oficial desarrollado por el Ministerio de Telecomunicaciones y de la Sociedad de la Información (MINTEL) de la República del Ecuador para firmar y verificar documentos PDF y XML (comprobantes electrónicos SRI).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {[
                {
                  step: '01',
                  title: 'Descargar .p12 y CA',
                  desc: 'Genera o descarga tu archivo con extensión .p12 y la contraseña configurada desde nuestro portal.'
                },
                {
                  step: '02',
                  title: 'Abrir FirmaEC Desktop',
                  desc: 'Inicia la aplicación FirmaEC en tu equipo (Windows, macOS o Linux). Asegúrate de tener Java 8+ instalado.'
                },
                {
                  step: '03',
                  title: 'Seleccionar Modo Archivo',
                  desc: 'En la pestaña "Firmar Documento", marca la opción "Archivo (.p12 / .pfx)" y selecciona tu archivo.'
                },
                {
                  step: '04',
                  title: 'Ingresar Contraseña & Estampar',
                  desc: 'Escribe tu contraseña, selecciona el documento PDF, ubica la estampa visual en la vista previa y pulsa "Estampar".'
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
                <span>Requisitos Técnicos del Software FirmaEC</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Java Runtime Environment (JRE):</strong> Versión 1.8 o superior (Oracle JRE u OpenJDK).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Algoritmo Criptográfico:</strong> RSA con longitud mínima de 2048 bits y digest SHA-256.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Extensiones X.509 v3:</strong> Digital Signature y Key Encipherment requeridos.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Enlaces Oficiales de Descarga FirmaEC</span>
              </h3>
              <p className="text-xs text-slate-600">
                Puedes obtener el instalador oficial y actualizado directamente desde los repositorios del MINTEL:
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.firmadigital.gob.ec"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors"
                >
                  <span>Portal Oficial Firma Digital MINTEL</span>
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
              <span>Instalación del Certificado de Entidad Emisora (CA Raíz)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Para que los lectores de PDF como Adobe Acrobat Reader, Foxit o el navegador muestren el distintivo <strong>"Firma Válida e Íntegra"</strong> con el visto verde en lugar de una advertencia de emisor desconocido, debes registrar el certificado de la Autoridad Certificadora (CA) en el almacén de confianza de tu equipo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">En Windows 10 / 11</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Haz doble clic en el archivo <strong>CA_Raiz.crt</strong> descargado.</li>
                  <li>Pulsa en <strong>"Instalar certificado..."</strong>.</li>
                  <li>Selecciona <em>"Equipo local"</em> o <em>"Usuario actual"</em>.</li>
                  <li>Elige <strong>"Colocar todos los certificados en el siguiente almacén"</strong>.</li>
                  <li>Selecciona <strong>"Entidades de certificación raíz de confianza"</strong> y finaliza.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">En macOS</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre la aplicación <strong>Acceso a Llaveros (Keychain Access)</strong>.</li>
                  <li>Arrastra el archivo <strong>CA_Raiz.crt</strong> a la pestaña <em>"Sistema"</em>.</li>
                  <li>Haz doble clic sobre el certificado importado.</li>
                  <li>Despliega la sección <strong>"Confiar"</strong> y selecciona <em>"Confiar siempre"</em>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">En Adobe Acrobat Reader</h3>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Ve a <strong>Edición &gt; Preferencias &gt; Firmas</strong>.</li>
                  <li>En <em>"Identidades y certificados de confianza"</em>, pulsa <strong>Más...</strong></li>
                  <li>Ve a <em>"Certificados de confianza"</em> e importa el archivo CRT.</li>
                  <li>Marca la casilla <strong>"Utilizar este certificado como raíz de confianza"</strong>.</li>
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
                  Más Popular
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Archivo Software (.p12 / .pfx)</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Se almacena como archivo en tu computador, celular o servidor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ideal para <strong>Facturación Electrónica SRI</strong>, Quipux y firma de PDFs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Fácil respaldo y portabilidad protegida por contraseña AES/3DES.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                  Máxima Seguridad
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Token USB Criptográfico</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dispositivo físico de hardware con certificación FIPS 140-2 Nivel 3.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>La clave privada nunca puede ser extraída ni copiada del chip.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Requerido para trámites aduaneros VUE / SENAE y comercio exterior.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                  Acceso Remoto
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Firma en la Nube (Cloud HSM)</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Alojada en módulos de seguridad HSM de la entidad certificadora.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Permite firmar desde cualquier dispositivo con autenticación 2FA/OTP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ideal para empresas con múltiples firmantes o sistemas web centralizados.</span>
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
              <span>Marco Legal Ecuatoriano: Ley de Comercio Electrónico (R.O. 557)</span>
            </h2>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-blue-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 13.- Concepto de Firma Electrónica</h4>
                <p className="text-slate-600 text-xs">
                  "Son los datos en forma electrónica consignados en un mensaje de datos, o adjuntados o lógicamente asociados al mismo, que puedan ser utilizados para identificar al titular de la firma en relación con el mensaje de datos, e indicar la aprobación del titular de la información contenida en el mensaje de datos."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 14.- Efectos y Validez de la Firma Electrónica</h4>
                <p className="text-slate-600 text-xs">
                  "La firma electrónica tendrá igual validez y se le reconocerán los mismos efectos jurídicos que a una firma manuscrita en relación con los datos consignados en documentos escritos, y será admitida como prueba en juicio."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-amber-600 space-y-1">
                <h4 className="font-bold text-slate-900">Artículo 17.- Extinción del Certificado de Firma</h4>
                <p className="text-slate-600 text-xs">
                  "El certificado de firma electrónica quedará extinguido por: expiración del plazo de validez, revocación por parte de la entidad de certificación, o solicitud voluntaria del titular."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
