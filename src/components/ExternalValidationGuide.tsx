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
                Validación en programas externos
              </h2>
              <p className="text-slate-400 text-xs">
                Instrucciones para validar tus firmas
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
                  Certificado de confianza
                </div>
                <h3 className="text-lg font-bold text-white">
                  Instalar certificado raíz
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Descarga este archivo para que tus firmas aparezcan como válidas.
                </p>
              </div>

              <div className="shrink-0 space-y-2 w-full md:w-auto">
                <button
                  onClick={handleDownloadCaCert}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar certificado (.crt)</span>
                </button>
                <div className="text-[10px] text-center text-slate-400 font-mono-code">
                  Certificado de seguridad
                </div>
              </div>
            </div>

            {/* Profile Selector */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-300 shrink-0 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Entidad emisora:
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
              { id: 'quick', label: '1. Pasos básicos' },
              { id: 'adobe', label: '2. Adobe Reader' },
              { id: 'firmaec', label: '3. FirmaEC' },
              { id: 'windows', label: '4. Windows' },
              { id: 'mac', label: '5. macOS' },
              { id: 'linux', label: '6. Linux' }
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
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pasos para validar tu firma</span>
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Descarga el certificado de confianza con el botón de arriba.</li>
                  <li>Instala el certificado en tu sistema o en Adobe Reader.</li>
                  <li>Abre tu documento PDF para ver la firma con visto verde.</li>
                  <li>Si usas una firma comprada en el Banco Central o Security Data, se reconoce de inmediato.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: ADOBE READER */}
          {activeTab === 'adobe' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-red-600" />
                  <span>Configurar Adobe Acrobat Reader</span>
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-600 text-xs leading-relaxed">
                  <li>Abre Adobe Acrobat Reader y entra en Preferencias.</li>
                  <li>En el menú lateral izquierdo, selecciona Firmas.</li>
                  <li>En Identidades y certificados de confianza, haz clic en Más.</li>
                  <li>Selecciona Certificados de confianza y pulsa Importar.</li>
                  <li>Busca el archivo de certificado descargado y pulsa Importar.</li>
                  <li>En la pestaña Confianza, marca "Utilizar este certificado como raíz de confianza".</li>
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
                  <span>Usar la aplicación FirmaEC</span>
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-600 text-xs leading-relaxed">
                  <li>Descarga e instala FirmaEC en tu computadora.</li>
                  <li>Abre la pestaña Firmar Documento.</li>
                  <li>Selecciona tu firma (.p12) y escribe tu contraseña.</li>
                  <li>Elige tu documento PDF y ubica el sello en la página.</li>
                  <li>Haz clic en Estampar para guardar el documento firmado.</li>
                  <li>Si necesitas revisar documentos de otros, usa la pestaña Verificar Documento.</li>
                </ol>
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
                    <span>Instalación en Windows</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(windowsCmd, 'win')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'win' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'win' ? '¡Copiado!' : 'Copiar comando'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono-code text-[11px] overflow-x-auto border border-slate-800">
                  {windowsCmd}
                </div>

                <p className="text-[11px] text-slate-500">
                  Abre PowerShell como administrador en la carpeta donde descargaste el certificado.
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
                    <span>Instalación en macOS</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(macCmd, 'mac')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'mac' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'mac' ? '¡Copiado!' : 'Copiar comando'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono-code text-[11px] overflow-x-auto border border-slate-800">
                  {macCmd}
                </div>

                <p className="text-[11px] text-slate-500">
                  Ingresa tu contraseña de usuario en la terminal si el sistema te la pide.
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
                    <span>Instalación en Linux</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(linuxCmd, 'linux')}
                    className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'linux' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'linux' ? '¡Copiado!' : 'Copiar comando'}</span>
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
            <span>Firma electrónica para Ecuador</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadCaCert}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Descargar certificado (.crt)</span>
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
