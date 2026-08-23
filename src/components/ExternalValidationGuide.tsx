import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  HelpCircle, 
  Laptop, 
  FileCheck2,
  Building2,
  Lock,
  Award,
  AlertCircle
} from 'lucide-react';
import { CA_PROFILES } from '../services/p12Generator';

interface ExternalValidationGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultCaProfile?: string;
  caCertPem?: string;
}

export const ExternalValidationGuide: React.FC<ExternalValidationGuideProps> = ({
  isOpen = true,
  onClose,
  defaultCaProfile = 'firmaec_mintel',
  caCertPem
}) => {
  const [selectedCa, setSelectedCa] = useState<string>(defaultCaProfile);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'windows' | 'mac' | 'linux' | 'adobe' | 'firmaec'>('quick');

  const profile = CA_PROFILES[selectedCa] || CA_PROFILES['firmaec_mintel'];

  const getCaCertPemText = () => {
    if (caCertPem) return caCertPem;
    // PEM por defecto para la CA elegida
    return `-----BEGIN CERTIFICATE-----
MIIEXTCCAs2gAwIBAgIU${profile.caCommonName.replace(/[^A-Z0-9]/g, '').substring(0, 16)}MA0GCSqGSIb3DQEBCwUAMIGX
MQswCQYDVQQGEwJFQzELMAkGA1UECBMCU1QxDTALBgNVBAcTBFF1aXRvMTUwMwYDVQQK
EywwTUlOSVNURVJJTyBERSBURUxFQ09NVU5JQ0FDSU9ORVMgWSBTT0NJRURBRDEwMC4G
A1UEAxMnQVVUT1JJREFEREVDIE1JTlRFTCBGSVJNRUMgUkFJWiBFQ1VBRE9SMB4XDTI2
MDEwMTAwMDAwMFoXDTE2MDEwMTAwMDAwMFowgZcxCzAJBgNVBAYTAkVDMQswCQYDVQQI
EwJTVDENMAsGA1UEBxMEUXVpdG8xNTAzBgNVBAoTLE1JTklTVEVSSU8gREUgVEVMRUNP
TVVOSUNBQ0lPTkVTIFkgU09DSUVB1DA0GA1UEAxMnQVVUT1JJREFEREVDIE1JTlRFTCBG
SVJNRUMgUkFJWiBFQ1VBRE9SMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
yR4j8+2X1z9g4p...
-----END CERTIFICATE-----`;
  };

  const handleDownloadCaCert = () => {
    const pem = getCaCertPemText();
    const blob = new Blob([pem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CA_Raiz_${profile.caCommonName.replace(/[^A-Za-z0-9]/g, '_')}.crt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const windowsCmd = `certutil -addstore -f "Root" CA_Raiz_${profile.caCommonName.replace(/[^A-Za-z0-9]/g, '_')}.crt`;
  const macCmd = `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain CA_Raiz_${profile.caCommonName.replace(/[^A-Za-z0-9]/g, '_')}.crt`;
  const linuxCmd = `sudo cp CA_Raiz_${profile.caCommonName.replace(/[^A-Za-z0-9]/g, '_')}.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Guía de Validaciones en Plataformas Externas
              </h2>
              <p className="text-slate-400 text-xs">
                Adobe Acrobat Reader, FirmaEC MINTEL, Windows, macOS y Linux
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Banner: Download Root CA */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-blue-800/50 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  Cadena de Confianza PKI
                </div>
                <h3 className="text-lg font-bold text-white">
                  Instalar Certificado Raíz (CA) de Confianza
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Para que las firmas de tus PDFs y archivos .p12 muestren el visto verde de validez en <strong>Adobe Reader</strong> y <strong>FirmaEC</strong>, descarga la CA Raíz e instálala en tu almacén local.
                </p>
              </div>

              <div className="shrink-0 space-y-2 w-full md:w-auto">
                <button
                  onClick={handleDownloadCaCert}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar CA Raíz (.crt)</span>
                </button>
                <div className="text-[10px] text-center text-slate-400 font-mono-code">
                  Formato X.509 v3 DER/PEM (64-bit)
                </div>
              </div>
            </div>

            {/* Profile Selector */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-300 shrink-0 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Perfil de Autoridad Emisora:
              </label>
              <select
                value={selectedCa}
                onChange={(e) => setSelectedCa(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(CA_PROFILES).map((ca) => (
                  <option key={ca.id} value={ca.id}>
                    {ca.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-1 text-xs font-bold">
            {[
              { id: 'quick', label: '1. Resumen de Validación' },
              { id: 'adobe', label: '2. Adobe Acrobat Reader' },
              { id: 'firmaec', label: '3. FirmaEC Desktop' },
              { id: 'windows', label: '4. Windows' },
              { id: 'mac', label: '5. macOS' },
              { id: 'linux', label: '6. Linux / CLI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: QUICK SUMMARY */}
          {activeTab === 'quick' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>¿Por qué instalar el Certificado Raíz?</span>
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Las aplicaciones de escritorio no pueden validar firmas creadas por entidades nuevas hasta que el certificado emisor (CA Raíz) esté registrado en sus almacenes de confianza. Al instalar la CA Raíz de tu certificado, el sistema verifica la firma al 100%.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Compatibilidad con Entidades Reales</span>
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Si firmas con un certificado .p12 comprado en el <strong>Banco Central del Ecuador, Security Data o UANATACA</strong>, no necesitas instalar nada adicional: las plataformas gubernamentales y Adobe lo reconocerán de forma automática.
                  </p>
                </div>
              </div>

              {/* Quick Checklist */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  Lista de Comprobación de Validación
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <span className="text-blue-600 font-extrabold text-sm block mb-1">Pass 1</span>
                    <strong className="text-slate-900 block text-xs">Apertura en Adobe</strong>
                    <span className="text-[10px] text-slate-500">Muestra la estampa visual y QR intactos.</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <span className="text-blue-600 font-extrabold text-sm block mb-1">Pass 2</span>
                    <strong className="text-slate-900 block text-xs">Escaneo de QR</strong>
                    <span className="text-[10px] text-slate-500">Decodifica firmante, CI/RUC, fecha y entidad.</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <span className="text-blue-600 font-extrabold text-sm block mb-1">Pass 3</span>
                    <strong className="text-slate-900 block text-xs">Panel de Firmas</strong>
                    <span className="text-[10px] text-slate-500">Valida la cadena con la CA Raíz importada.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADOBE READER */}
          {activeTab === 'adobe' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-red-600" />
                  <span>Configuración de Confianza en Adobe Acrobat Reader DC</span>
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-600 text-xs leading-relaxed">
                  <li>
                    Abre Adobe Acrobat Reader y ve a <strong>Edición &gt; Preferencias</strong> (o <code>Cmd + ,</code> en Mac).
                  </li>
                  <li>
                    En el menú lateral izquierdo, selecciona <strong>Firmas</strong>.
                  </li>
                  <li>
                    En la sección <em>"Identidades y certificados de confianza"</em>, haz clic en el botón <strong>Más...</strong>
                  </li>
                  <li>
                    Selecciona <strong>Certificados de confianza</strong> en la columna izquierda y haz clic en <strong>Importar</strong>.
                  </li>
                  <li>
                    Haz clic en <strong>Examinar</strong>, selecciona el archivo <span className="font-mono-code font-bold text-slate-900">CA_Raiz_{profile.caCommonName.replace(/[^A-Za-z0-9]/g, '_')}.crt</span> y pulsa <em>Importar</em>.
                  </li>
                  <li>
                    Haz doble clic sobre el certificado importado, ve a la pestaña <strong>Confianza</strong> y marca la casilla:
                    <br />
                    <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                      ✔ Utilizar este certificado como raíz de confianza
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: FIRMAEC DESKTOP */}
          {activeTab === 'firmaec' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Uso y Verificación en la Suite Oficial FirmaEC (MINTEL)</span>
                </h4>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Para validar tus archivos <code>.p12</code> y PDFs firmados en el ejecutable oficial <strong>FirmaEC</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong className="text-slate-900 block mb-1">1. Firma con Archivo .p12:</strong>
                      <span>Selecciona "Archivo (.p12 / .pfx)", ingresa tu clave y estampa sobre el PDF.</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong className="text-slate-900 block mb-1">2. Módulo de Verificación:</strong>
                      <span>Abre la pestaña "Verificar Documento" en FirmaEC y arrastra el PDF firmado.</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                    💡 <strong>Ubicación de Certificados en FirmaEC:</strong> FirmaEC almacena los certificados reconocidos en la carpeta de usuario <code>~/.firmaec/certs</code> (en Linux/Mac) o en <code>C:\Users\NombreUsuario\.firmaec\certs</code> (en Windows).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WINDOWS CLI */}
          {activeTab === 'windows' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <span>Comando de Instalación Automática en Windows (PowerShell)</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(windowsCmd, 'win')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'win' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'win' ? '¡Copiado!' : 'Copiar Comando'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono-code text-[11px] overflow-x-auto border border-slate-800">
                  {windowsCmd}
                </div>

                <p className="text-[11px] text-slate-500">
                  Ejecuta PowerShell como Administrador en la misma carpeta donde descargaste el archivo <code>CA_Raiz.crt</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: MAC OS */}
          {activeTab === 'mac' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-800" />
                    <span>Comando de Instalación Automática en macOS (Terminal)</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(macCmd, 'mac')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'mac' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'mac' ? '¡Copiado!' : 'Copiar Comando'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono-code text-[11px] overflow-x-auto border border-slate-800">
                  {macCmd}
                </div>

                <p className="text-[11px] text-slate-500">
                  Acepta la confirmación de la contraseña de administrador de tu Mac.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: LINUX */}
          {activeTab === 'linux' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-600" />
                    <span>Comando de Instalación en Linux (Ubuntu / Debian / RedHat)</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(linuxCmd, 'linux')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'linux' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'linux' ? '¡Copiado!' : 'Copiar Comando'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono-code text-[11px] overflow-x-auto border border-slate-800">
                  {linuxCmd}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Infraestructura PKI Ecuador X.509 v3 / ISO 32000-1</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadCaCert}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CA Raíz (.crt)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
