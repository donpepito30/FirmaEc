import React, { useState } from 'react';
import { 
  FileCheck2, 
  UploadCloud, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  FileText, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { P12InspectionResult } from '../types';
import { inspectP12File } from '../services/p12Generator';
import { verifyCertificateRevocationStatus, OcspCrlCheckResult } from '../services/ocspCrlService';

export const P12ValidatorView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<P12InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isCheckingOcsp, setIsCheckingOcsp] = useState(false);
  const [ocspResult, setOcspResult] = useState<OcspCrlCheckResult | null>(null);

  const handleCheckOcspRevocation = async () => {
    if (!result?.certPem) return;
    setIsCheckingOcsp(true);
    try {
      const ocspRes = await verifyCertificateRevocationStatus(result.certPem);
      setOcspResult(ocspRes);
    } catch {
      // Ignorar error
    } finally {
      setIsCheckingOcsp(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor seleccione un archivo .p12 o .pfx.');
      return;
    }

    setIsInspecting(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const inspection = await inspectP12File(buffer, password);

      if (!inspection.isValid) {
        setError(inspection.error || 'No se pudo leer el archivo con la contraseña provista.');
        setResult(null);
      } else {
        setResult(inspection);
      }
      setIsInspecting(false);
    } catch (err: any) {
      setIsInspecting(false);
      setError(`Error al procesar el archivo: ${err.message || err}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
          <span className="hover:text-slate-600 transition-colors">Certificados</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Validador de firma</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Validador de firma
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Verifica la vigencia y titular de cualquier archivo de firma (.p12).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verificación segura
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & Inspect Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Cargar archivo de firma
              </h2>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                Archivo .p12
              </span>
            </div>

            <div className="p-6">
              <form onSubmit={handleInspect} className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    file ? 'border-blue-500 bg-blue-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <input
                    id="p12-file-upload-input"
                    type="file"
                    accept=".p12,.pfx,application/x-pkcs12"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="p12-file-upload-input" className="cursor-pointer block">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    {file ? (
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate max-w-xs mx-auto">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB • Clic para cambiar
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-blue-600 hover:underline block">
                          Haz clic para seleccionar o arrastra tu archivo .p12
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          Formatos admitidos: .p12, .pfx
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contraseña del archivo
                  </label>
                  <div className="relative">
                    <input
                      id="p12-validate-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Escribe tu contraseña..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Necesaria para abrir el archivo.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Inspect Button */}
                <button
                  id="p12-inspect-submit-button"
                  type="submit"
                  disabled={!file || isInspecting}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isInspecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Consultando el certificado…</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Verificar certificado</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Privacidad:</strong> Tus archivos no salen de tu equipo.
            </div>
          </div>
        </div>

        {/* Inspection Result (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Estado
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {result.isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Caducado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Vigente ({result.daysRemaining} días)
                      </span>
                    )}
                  </div>
                </div>

                {result.isAuthorizedEntity ? (
                  <span className="text-right text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Entidad Acreditada
                  </span>
                ) : (
                  <span className="text-right text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Pruebas / Sandbox
                  </span>
                )}
              </div>

              {/* Key Details Grid */}
              <div className="p-6 space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Titular:</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {result.commonName}
                  </span>
                </div>

                {result.identification && (
                  <div>
                    <span className="text-slate-500 font-medium block">Cédula / RUC:</span>
                    <span className="font-mono-code font-bold text-slate-800">
                      {result.identification}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 font-medium block">Emisor:</span>
                  <span className="font-semibold text-slate-800">
                    {result.issuerCommonName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-500 font-medium block">Desde:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {result.validFrom.toLocaleDateString('es-EC')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Hasta:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {result.validTo.toLocaleDateString('es-EC')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block mb-1">Usos permitidos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyUsages.map((usage, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                      >
                        {usage}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OCSP / CRL LIVE VERIFICATION SECTION */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <button
                    type="button"
                    onClick={handleCheckOcspRevocation}
                    disabled={isCheckingOcsp}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {isCheckingOcsp ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verificando vigencia…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verificar vigencia en línea</span>
                      </>
                    )}
                  </button>

                  {ocspResult && (
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 border border-slate-800 font-mono">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Estado: {ocspResult.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-300">Entidad: {ocspResult.eciName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-8 border-2 border-dashed border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Esperando archivo para validar
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sube tu archivo de firma electrónica (.p12) y su clave para inspeccionar todos los certificados X.509 incluidos y verificar su fecha de vencimiento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
