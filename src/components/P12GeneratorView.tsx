import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  KeyRound, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  FileCode2, 
  ExternalLink,
  Sparkles,
  Info,
  Laptop,
  HelpCircle,
  Building2,
  FileCheck2,
  Shield,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';
import { GeneratedP12Result, P12GenerateOptions, FirmaECTestCheck } from '../types';
import { 
  generateP12Certificate, 
  runFirmaECTestSuite, 
  CA_PROFILES 
} from '../services/p12Generator';
import { SecurePasswordManager, usePasswordStrength } from '../utils/securePasswordManager';
import { SecurePasswordDisplay } from './SecurePasswordDisplay';
import { ExternalValidationGuide } from './ExternalValidationGuide';
import { 
  validateP12FormData, 
  validateFullName, 
  validateEmail, 
  validateEcuadorianId, 
  validateCity, 
  validateOrganization 
} from '../utils/inputValidator';

interface P12GeneratorViewProps {
  onLoadIntoSigner?: (generated: GeneratedP12Result) => void;
  onNavigateToEntities?: () => void;
  onNavigateToFirmaEc?: () => void;
}

export const P12GeneratorView: React.FC<P12GeneratorViewProps> = ({
  onLoadIntoSigner,
  onNavigateToEntities,
  onNavigateToFirmaEc
}) => {
  // Estado del formulario con datos predeterminados
  const [form, setForm] = useState<P12GenerateOptions>({
    fullName: 'JOSE RICARDO CANCHINGRE NAPA',
    idNumber: '0802778749',
    email: 'jose.canchingre@ejemplo.ec',
    city: 'Esmeraldas',
    organization: 'Persona Natural',
    country: 'EC',
    validityYears: 2,
    keySize: 2048,
    password: 'FirmaSegura2026*',
    purpose: 'firmaec_prod',
    caAuthority: 'firmaec_mintel'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedResult, setGeneratedResult] = useState<GeneratedP12Result | null>(null);
  const [testResults, setTestResults] = useState<FirmaECTestCheck[]>([]);
  const [activeResultsTab, setActiveResultsTab] = useState<'info' | 'tests' | 'firmaec_guide'>('info');
  const [showValidationGuide, setShowValidationGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validaciones en tiempo real
  const fullNameValidation = useMemo(() => validateFullName(form.fullName), [form.fullName]);
  const idValidation = useMemo(() => validateEcuadorianId(form.idNumber), [form.idNumber]);
  const emailValidation = useMemo(() => validateEmail(form.email), [form.email]);
  const cityValidation = useMemo(() => validateCity(form.city), [form.city]);
  const orgValidation = useMemo(() => validateOrganization(form.organization), [form.organization]);

  // Indicador de fortaleza de contraseña en vivo
  const passwordStrength = usePasswordStrength(form.password);

  const generateRandomPassword = () => {
    const pass = SecurePasswordManager.generateSecurePassword(20);
    setForm(prev => ({ ...prev, password: pass }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar con el motor robusto de entrada
    const formValidation = validateP12FormData({
      fullName: form.fullName,
      idNumber: form.idNumber,
      email: form.email,
      city: form.city,
      organization: form.organization,
    });

    if (!formValidation.isValid) {
      const firstError = Object.values(formValidation.errors)[0];
      setError(`Error de validación de entrada: ${firstError}`);
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('La contraseña del archivo .p12 debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgressPercent(10);
    setProgressStep('Inicializando motor criptográfico RSA conforme a FirmaEC...');

    try {
      await new Promise(r => setTimeout(r, 120));

      // Usar los datos sanitizados/normalizados
      const sanitizedOptions: P12GenerateOptions = {
        ...form,
        fullName: formValidation.normalizedData?.fullName || form.fullName,
        email: formValidation.normalizedData?.email || form.email,
        idNumber: formValidation.normalizedData?.idNumber || form.idNumber,
        city: formValidation.normalizedData?.city || form.city,
        organization: formValidation.normalizedData?.organization || form.organization,
      };

      const result = await generateP12Certificate(sanitizedOptions, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });

      // Ejecutar suite de pruebas de compatibilidad FirmaEC
      const tests = runFirmaECTestSuite(result);
      setTestResults(tests);

      setGeneratedResult(result);
      setIsGenerating(false);

      // Confeti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Ignored
      }
    } catch (err: any) {
      setIsGenerating(false);
      setError(`Error al generar el certificado: ${err.message || err}`);
    }
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadP12 = () => {
    if (!generatedResult) return;
    downloadFile(generatedResult.p12Blob, generatedResult.fileName);
  };

  const handleDownloadCertPem = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult.certPem], { type: 'application/x-pem-file' });
    downloadFile(blob, `${generatedResult.fileName.replace('.p12', '')}_certificado.crt`);
  };

  const handleDownloadCaCertPem = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult.caCertPem], { type: 'application/x-pem-file' });
    downloadFile(blob, `CA_Raiz_${generatedResult.caAuthorityName.replace(/[^A-Za-z0-9]/g, '_')}.crt`);
  };

  const handleDownloadKeyPem = () => {
    if (!generatedResult) return;
    const blob = new Blob([generatedResult.privateKeyPem], { type: 'application/x-pem-file' });
    downloadFile(blob, `${generatedResult.fileName.replace('.p12', '')}_clave_privada.key`);
  };

  const handleCopyPassword = () => {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCopyFingerprint = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.sha256Fingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Section Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
          <span className="hover:text-slate-600 transition-colors">Certificados Digitales</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Generador de Firma Electrónica (.p12)</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Generador de Firma Electrónica (.p12)
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Generación criptográfica completa de contenedores PKCS#12 con par de llaves RSA 2048/4096-bit, Autoridad Raíz (CA) y certificados X.509 v3 100% compatibles con FirmaEC, SRI y Adobe Acrobat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValidationGuide(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guía de Validación Externa & CA Raíz</span>
            </button>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              100% Compatible con FirmaEC
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on left, Result & Guide on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Validation Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start space-x-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">
                Configuración Criptográfica Avanzada para Ecuador
              </h3>
              <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                El contenedor se genera con estructura <strong>PKCS#12 v1.1</strong>, cifrado PBE con 3DES/AES y extensiones X.509 v3 (<code>Digital Signature</code>, <code>Non-Repudiation</code> y <code>Document Signing</code>) para apertura directa en la aplicación de escritorio <strong>FirmaEC</strong>.
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Parámetros del Certificado Digital
                </h2>
                <p className="text-xs text-slate-500">
                  Defina los atributos de identidad y perfil de Autoridad Certificadora (CA)
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                X.509 v3
              </span>
            </div>

            <div className="p-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* CA Authority Profile Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Autoridad de Certificación Emisora (Perfil CA) *
                  </label>
                  <select
                    id="p12-ca-select"
                    value={form.caAuthority}
                    onChange={(e) => setForm({ ...form, caAuthority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {Object.values(CA_PROFILES).map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {CA_PROFILES[form.caAuthority || 'firmaec_mintel']?.description}
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nombre Completo del Titular (CN) *
                  </label>
                  <input
                    id="p12-fullname-input"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value.toUpperCase() })}
                    placeholder="Ej. JOSE RICARDO CANCHINGRE NAPA"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 transition-all uppercase ${
                      !fullNameValidation.isValid ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {!fullNameValidation.isValid ? (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fullNameValidation.error}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Aparecerá en el Common Name (CN), la estampa visual y la cadena X.500.
                    </p>
                  )}
                  {fullNameValidation.warnings && fullNameValidation.warnings.map((w, idx) => (
                    <p key={idx} className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{w}</span>
                    </p>
                  ))}
                </div>

                {/* ID Number & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Cédula / RUC Ecuatoriano *
                      </label>
                      <span className={`text-[10px] font-semibold ${idValidation.isValid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {idValidation.isValid ? (idValidation.type === 'cedula' ? '✓ Cédula Válida (Módulo 10)' : '✓ RUC Válido') : '✗ Invalida'}
                      </span>
                    </div>
                    <input
                      id="p12-idnumber-input"
                      type="text"
                      maxLength={13}
                      value={form.idNumber}
                      onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                      placeholder="10 dígitos o RUC 13 dígitos"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 text-xs sm:text-sm font-mono-code focus:bg-white focus:ring-2 transition-all ${
                        !idValidation.isValid ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {!idValidation.isValid ? (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{idValidation.error}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Identificación verificada {idValidation.province ? `(Provincia ${idValidation.province.toString().padStart(2, '0')})` : ''}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Ciudad / Provincia
                    </label>
                    <input
                      id="p12-city-input"
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Esmeraldas, Quito, Guayaquil..."
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 transition-all ${
                        !cityValidation.isValid ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {!cityValidation.isValid && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{cityValidation.error}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Email & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Correo Electrónico (SAN / RFC822)
                    </label>
                    <input
                      id="p12-email-input"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="correo@ejemplo.ec"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 transition-all ${
                        !emailValidation.isValid ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {!emailValidation.isValid && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailValidation.error}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Tipo de Organización (O)
                    </label>
                    <select
                      id="p12-org-select"
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Persona Natural">Persona Natural (Firma Personal)</option>
                      <option value="Profesional Independiente">Profesional Independiente (RUC)</option>
                      <option value="Representante Legal">Representante Legal (Empresa)</option>
                      <option value="Servidor Público">Servidor Público / Quipux</option>
                    </select>
                  </div>
                </div>

                {/* Password for .p12 */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      Contraseña del Contenedor .p12 *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generar Clave Segura
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id="p12-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Ingrese o genere la clave..."
                      className="w-full pl-3.5 pr-24 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-mono-code focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title="Copiar contraseña"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md cursor-pointer"
                      >
                        {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">Fortaleza de contraseña:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${passwordStrength.color}`}>
                        {passwordStrength.label} ({passwordStrength.score}/100)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Esta es la contraseña que solicitará FirmaEC al seleccionar el archivo .p12.</span>
                  </p>
                </div>

                {/* Validity & Key Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Vigencia del Certificado
                    </label>
                    <select
                      id="p12-validity-select"
                      value={form.validityYears}
                      onChange={(e) => setForm({ ...form, validityYears: parseInt(e.target.value, 10) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value={1}>1 Año de Vigencia</option>
                      <option value={2}>2 Años de Vigencia (Recomendado)</option>
                      <option value={3}>3 Años de Vigencia</option>
                      <option value={5}>5 Años de Vigencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Algoritmo Asimétrico RSA
                    </label>
                    <select
                      id="p12-keysize-select"
                      value={form.keySize}
                      onChange={(e) => setForm({ ...form, keySize: parseInt(e.target.value, 10) as 2048 | 4096 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value={2048}>RSA 2048-bit (Estándar FirmaEC / SRI)</option>
                      <option value={4096}>RSA 4096-bit (Alta Seguridad)</option>
                    </select>
                  </div>
                </div>

                {/* Error Box */}
                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Atención: </span>
                      {error}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  id="generate-p12-submit-button"
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{progressStep || 'Generando llaves y certificados...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Generar Archivo .p12 y Certificado Digital</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Legal Clarity Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-slate-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Validez Criptográfica y Procedimiento para FirmaEC
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El archivo <code>.p12</code> generado es un contenedor PKCS#12 real con certificados X.509 v3 y llaves asimétricas RSA. Para que FirmaEC y Adobe Acrobat validen la firma con estado <strong>VERDE (100% de confianza)</strong>, descargue también el archivo <strong>CA_Raiz.crt</strong> e instálelo en el almacén de "Entidades Emisoras Raíz de Confianza" de su sistema operativo.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onNavigateToEntities}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Ver Entidades de Certificación Acreditadas por ARCOTEL →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Result Box & Quick Guides (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {generatedResult ? (
            <div className="space-y-6">
              {/* Generated Certificate Card */}
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col items-center text-center shadow-lg border border-slate-800">
                <div className="w-20 h-24 border-4 border-dashed border-slate-700 rounded-xl mb-4 flex items-center justify-center">
                  <div className="w-12 h-16 bg-blue-600 rounded-md relative overflow-hidden flex items-center justify-center text-white shadow-inner">
                    <KeyRound className="w-6 h-6" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Contenedor PKCS#12 Listo
                </div>

                <h2 className="text-xl font-bold font-display text-white mb-1">
                  {generatedResult.fileName}
                </h2>
                <p className="text-slate-400 text-xs mb-5 max-w-xs">
                  Titular: <strong className="text-white">{generatedResult.subject.cn}</strong>
                </p>

                <button
                  id="download-p12-main-button"
                  onClick={handleDownloadP12}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo .p12</span>
                </button>

                <div className="w-full mt-4">
                  <SecurePasswordDisplay
                    password={generatedResult.password}
                    autoCleanSeconds={10}
                  />
                </div>
              </div>

              {/* Tabs for Details vs Compatibility Tests vs FirmaEC Guide */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
                  <button
                    onClick={() => setActiveResultsTab('info')}
                    className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors cursor-pointer ${
                      activeResultsTab === 'info'
                        ? 'border-blue-600 text-blue-600 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Detalles X.509
                  </button>
                  <button
                    onClick={() => setActiveResultsTab('tests')}
                    className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeResultsTab === 'tests'
                        ? 'border-blue-600 text-blue-600 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Test FirmaEC</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold">
                      {testResults.filter(t => t.status === 'passed').length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveResultsTab('firmaec_guide')}
                    className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors cursor-pointer ${
                      activeResultsTab === 'firmaec_guide'
                        ? 'border-blue-600 text-blue-600 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Uso FirmaEC
                  </button>
                </div>

                {activeResultsTab === 'info' && (
                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Titular</span>
                      <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">{generatedResult.subject.cn}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Autoridad Emisora</span>
                      <span className="font-semibold text-blue-600 text-right truncate max-w-[200px]">{generatedResult.issuer.cn}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Vigencia</span>
                      <span className="font-semibold text-slate-900">Hasta {generatedResult.notAfter.toLocaleDateString('es-EC')}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Criptografía</span>
                      <span className="font-semibold text-slate-900">RSA {generatedResult.keySize}-bit / SHA-256</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Número de Serie</span>
                      <span className="font-mono-code text-slate-700 text-[11px]">{generatedResult.serialNumber}</span>
                    </div>

                    <div className="pt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500 font-medium">Huella Digital SHA-256:</span>
                        <button
                          onClick={handleCopyFingerprint}
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedFingerprint ? '¡Copiada!' : 'Copiar'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono-code text-slate-700 break-all">
                        {generatedResult.sha256Fingerprint}
                      </div>
                    </div>

                    {/* Descargas Complementarias */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700">Descargas Complementarias:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handleDownloadCaCertPem}
                          title="Descargar Certificado de Autoridad Raíz para confianza en Windows/Adobe/FirmaEC"
                          className="py-1.5 px-2 rounded bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-200 transition-colors cursor-pointer text-center"
                        >
                          CA_Raiz.crt
                        </button>
                        <button
                          onClick={handleDownloadCertPem}
                          title="Descargar Certificado Público del Titular"
                          className="py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors cursor-pointer text-center"
                        >
                          Titular.crt
                        </button>
                        <button
                          onClick={handleDownloadKeyPem}
                          title="Descargar Clave Privada en formato PEM"
                          className="py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors cursor-pointer text-center"
                        >
                          Privada.key
                        </button>
                      </div>
                    </div>

                    {onLoadIntoSigner && (
                      <div className="pt-2">
                        <button
                          onClick={() => onLoadIntoSigner(generatedResult)}
                          className="w-full py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer"
                        >
                          <Laptop className="w-4 h-4 text-emerald-600" />
                          Probar Firma Digital de PDF con este Certificado →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeResultsTab === 'tests' && (
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">Resultados de Conformidad Técnica</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {testResults.filter(t => t.status === 'passed').length}/{testResults.length} Pasadas
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {testResults.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {t.status === 'passed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span>{t.name}</span>
                            </span>
                            <span className="text-[9px] font-mono-code text-slate-400 shrink-0">
                              {t.standardRef}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 pl-5">
                            {t.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeResultsTab === 'firmaec_guide' && (
                  <div className="p-5 text-xs text-slate-600 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Pasos para Abrir y Firmar en FirmaEC:
                    </h4>
                    <ol className="space-y-2 list-decimal pl-4">
                      <li>
                        Abre <strong>FirmaEC</strong> en tu computador (descargable desde <em>firmadigital.gob.ec</em>).
                      </li>
                      <li>
                        En la pestaña <strong>"Firmar Documento"</strong>, selecciona la opción <strong>"Archivo (.p12 / .pfx)"</strong>.
                      </li>
                      <li>
                        Haz clic en <em>Examinar</em> y selecciona el archivo <span className="font-mono-code text-[11px] bg-slate-100 px-1 py-0.5 rounded">{generatedResult.fileName}</span>.
                      </li>
                      <li>
                        Ingresa la contraseña exacta: <span className="font-mono-code font-bold text-slate-900">{generatedResult.password}</span>.
                      </li>
                      <li>
                        Selecciona el archivo PDF que deseas firmar, ubica la estampa visual y haz clic en <strong>"Estampar / Firmar"</strong>.
                      </li>
                    </ol>
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 mt-2">
                      💡 <strong>Tip de Confianza:</strong> Para que FirmaEC no muestre "Certificado no confiable", instala el archivo <code>CA_Raiz.crt</code> en las Entidades de Confianza de Windows (ejecutar <code>certmgr.msc</code> &gt; Entidades de certificación raíz de confianza).
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Placeholder State */
            <div className="bg-slate-900 rounded-2xl p-8 text-white h-full flex flex-col items-center text-center justify-center border border-slate-800 shadow-sm min-h-[380px]">
              <div className="w-20 h-24 border-4 border-dashed border-slate-700 rounded-xl mb-6 flex items-center justify-center">
                <div className="w-12 h-16 bg-blue-600/60 rounded-md relative overflow-hidden flex items-center justify-center text-white">
                  <KeyRound className="w-6 h-6 text-blue-200" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Archivo de Firma Digital
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-xs leading-relaxed">
                Haga clic en el botón inferior del formulario para generar su archivo de firma electrónica personal con llaves RSA y Autoridad Raíz.
              </p>
              <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium">
                Esperando generación de llaves criptográficas...
              </div>
            </div>
          )}

          {/* Quick Steps Guide */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Laptop className="w-4 h-4 text-blue-600" />
              Requisitos de Firma Electrónica en Ecuador
            </h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Formato Oficial:</strong> PKCS#12 (.p12) protegido con clave simétrica.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Estándar Criptográfico:</strong> RSA 2048-bits con hashing SHA-256.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Uso en Trámites:</strong> Facturación electrónica SRI, Quipux, IESS, BIESS y Supercías.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* External Validation Guide Modal */}
      {showValidationGuide && (
        <ExternalValidationGuide
          isOpen={showValidationGuide}
          onClose={() => setShowValidationGuide(false)}
          defaultCaProfile={form.caAuthority}
          caCertPem={generatedResult?.caCertPem}
        />
      )}
    </div>
  );
};
