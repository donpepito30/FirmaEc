import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  FileSignature, 
  ShieldCheck, 
  Download, 
  UploadCloud, 
  FileText, 
  QrCode, 
  Key, 
  Settings2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileCode, 
  Stamp, 
  Lock, 
  Info,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  Copy,
  Scan,
  ExternalLink,
  Trash2,
  Plus,
  Layers,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  GeneratedP12Result, 
  DocumentSigningConfig, 
  StampStyleType, 
  SignedPdfResult, 
  UploadedDocumentInfo 
} from '../types';
import { 
  signAndStampDocumentPdf, 
  convertFileToPdfBuffer, 
  extractKeysFromUploadedP12,
  generateP12Certificate,
  createSamplePdfBuffer,
  splitSignerNameForStamp,
  buildScannerFriendlyQrText,
  generateHighReadabilityQr
} from '../services/p12Generator';
import { validateFileUpload } from '../utils/fileValidation';
import { handleFileError } from '../utils/errorHandler';
import { validateDocumentWithGemini } from '../services/geminiProcessor';
import { InteractiveStampPositioner } from './InteractiveStampPositioner';
import { renderPdfPageToDataUrl } from '../utils/pdfRenderer';

interface DocumentSignerDemoProps {
  initialResult?: GeneratedP12Result | null;
  onNavigateToValidator?: () => void;
  onNavigateToGenerator?: () => void;
}

export const DocumentSignerDemo: React.FC<DocumentSignerDemoProps> = ({ 
  initialResult,
  onNavigateToValidator,
  onNavigateToGenerator
}) => {
  // Document List State (Indeterminate quantity of uploaded documents)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentInfo[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Signer / Key Source state
  const [keySource, setKeySource] = useState<'session' | 'custom_p12' | 'quick_generate'>('quick_generate');
  const [uploadedP12File, setUploadedP12File] = useState<File | null>(null);
  const [p12Password, setP12Password] = useState('');
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [unlockedP12Data, setUnlockedP12Data] = useState<{
    privateKeyPem: string;
    certPem: string;
    subjectCn: string;
    subjectId: string;
    issuerCn: string;
    keySize: number;
  } | null>(null);
  const [p12UnlockError, setP12UnlockError] = useState<string | null>(null);
  const [isUnlockingP12, setIsUnlockingP12] = useState(false);

  // Quick generate state with official format sample matching Ecuador standards
  const [quickName, setQuickName] = useState('MISAEL VLADIMIR FERNANDEZ CORREA');
  const [quickId, setQuickId] = useState('1715894320');
  const [quickCity, setQuickCity] = useState('Quito, Ecuador');
  const [quickReason, setQuickReason] = useState('Suscripción y conformidad del documento');

  // Stamping Configuration State - Defaults match Ecuador usage (last page, bottom-right signature field)
  const [pageOption, setPageOption] = useState<'last' | 'first' | 'all' | 'specific'>('last');
  const [specificPage, setSpecificPage] = useState(1);
  const [positionPreset, setPositionPreset] = useState<'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'custom'>('bottom-right');
  const [customX, setCustomX] = useState(65); // % from left
  const [customY, setCustomY] = useState(12); // % from bottom
  const [stampStyle, setStampStyle] = useState<StampStyleType>('firmaec-official');
  const [includeQrCode, setIncludeQrCode] = useState(true);

  // Signing execution state for batch results
  const [isSigning, setIsSigning] = useState(false);
  const [signedResults, setSignedResults] = useState<SignedPdfResult[]>([]);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [copiedQrText, setCopiedQrText] = useState(false);

  // Live QR Preview State
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const p12FileInputRef = useRef<HTMLInputElement>(null);

  // Effective Signer attributes based on selected source
  const effectiveSignerName = 
    keySource === 'session' && initialResult ? initialResult.subject.cn :
    keySource === 'custom_p12' && unlockedP12Data ? unlockedP12Data.subjectCn :
    quickName;

  const effectiveIdNumber = 
    keySource === 'session' && initialResult ? (initialResult.subject.serialNumber || '0802778749') :
    keySource === 'custom_p12' && unlockedP12Data ? (unlockedP12Data.subjectId || '1715894320') :
    quickId;

  // Exact text content encoded inside QR for any scanner app (Google Lens, iOS/Android Camera)
  const qrVerificationReadableText = buildScannerFriendlyQrText({
    signerName: effectiveSignerName,
    idNumber: effectiveIdNumber,
    dateFormatted: `${new Date().toLocaleDateString('es-EC')} ${new Date().toLocaleTimeString('es-EC', { hour12: false })}`,
    entityName: 'MINTEL / FIRMAEC EC',
    validatorUrl: 'https://firmadigital.gob.ec'
  });

  // Prevent browser default navigation when dropping files anywhere
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);
    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  // Generate ultra high-definition QR preview with ISO/IEC 18004 compliance whenever attributes change
  useEffect(() => {
    generateHighReadabilityQr(qrVerificationReadableText, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'M'
    })
      .then(url => setPreviewQrDataUrl(url))
      .catch(() => {});
  }, [effectiveSignerName, effectiveIdNumber, quickReason, quickCity, stampStyle]);

  // Copy QR readable text helper
  const handleCopyQrText = () => {
    navigator.clipboard.writeText(qrVerificationReadableText);
    setCopiedQrText(true);
    setTimeout(() => setCopiedQrText(false), 2000);
  };

  // Process Multiple File Uploads
  const handleFilesUpload = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;
    
    const filesArray = Array.from(filesList);

    // 1. Pre-validación de límites, tamaños y extensiones
    const validation = validateFileUpload(filesArray, uploadedDocs.length);
    if (!validation.valid) {
      setSigningError(validation.errors.join('\n'));
      return;
    }

    setIsProcessingFiles(true);
    setSigningError(null);
    setSignedResults([]);

    const newDocsList: UploadedDocumentInfo[] = [];
    const errorMessages: string[] = [];

    try {
      for (const file of filesArray) {
        try {
          // Convertir y procesar
          const converted = await convertFileToPdfBuffer(file);
          let previewUrl: string | undefined;

          try {
            // Renderizar la página original del PDF con un clon aislado
            const pageToRender = converted.pageCount || 1;
            const rendered = await renderPdfPageToDataUrl(converted.buffer.slice(0), pageToRender, 900);
            previewUrl = rendered.dataUrl;
          } catch (renderErr) {
            if (file.type && file.type.startsWith('image/')) {
              try {
                previewUrl = URL.createObjectURL(file);
              } catch (e) {
                // Ignore preview URL creation error
              }
            }
          }

          // Ejecutar análisis Gemini AI con un clon aislado
          let geminiInfo;
          try {
            geminiInfo = await validateDocumentWithGemini(
              converted.buffer.slice(0),
              file.name,
              converted.fileType
            );
          } catch (gErr) {
            console.warn('Gemini evaluation skipped:', gErr);
          }

          newDocsList.push({
            name: file.name,
            size: file.size,
            type: converted.fileType,
            buffer: converted.buffer.slice(0),
            pageCount: converted.pageCount,
            previewDataUrl: previewUrl,
            isConvertedToPdf: converted.isConverted,
            geminiAnalysis: geminiInfo
          });
        } catch (fileErr: any) {
          console.error('Error procesando archivo individual:', fileErr);
          const handled = handleFileError(fileErr, file.name);
          errorMessages.push(handled.userMessage);
        }
      }

      if (newDocsList.length > 0) {
        setUploadedDocs(prev => [...prev, ...newDocsList]);
      }

      if (errorMessages.length > 0) {
        setSigningError(errorMessages.join('\n'));
      }
    } catch (err: any) {
      setSigningError(`Inconveniente al procesar los archivos: ${err.message || err}`);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Helper to remove an uploaded document from list
  const handleRemoveDoc = (index: number) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index));
    setSignedResults([]);
  };

  // Helper to clear all documents
  const handleClearAllDocs = () => {
    setUploadedDocs([]);
    setSignedResults([]);
  };

  // Load sample Ecuador document directly if user wants a quick demo
  const handleLoadSampleDocument = async () => {
    setIsProcessingFiles(true);
    setSigningError(null);
    setSignedResults([]);
    try {
      const samplePdfBytes = await createSamplePdfBuffer(
        'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES',
        'Comparecen a la suscripción del presente instrumento privado, por una parte el CONTRATANTE y por otra parte el CONTRATISTA, conviniendo en obligarse al tenor de las cláusulas aplicables a la Ley de Comercio Electrónico y Firmas Digitales de la República del Ecuador.',
        effectiveSignerName,
        effectiveIdNumber
      );

      const sampleDoc: UploadedDocumentInfo = {
        name: 'contrato_servicios_profesionales_ecuador.pdf',
        size: samplePdfBytes.byteLength,
        type: 'application/pdf',
        buffer: samplePdfBytes.buffer as ArrayBuffer,
        pageCount: 1,
        isConvertedToPdf: false
      };

      setUploadedDocs([sampleDoc]);
    } catch (err: any) {
      setSigningError(`Error al cargar el documento de ejemplo: ${err.message || err}`);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Handle .p12 File Upload & Decryption
  const handleUnlockCustomP12 = async () => {
    if (!uploadedP12File) {
      setP12UnlockError('Seleccione un archivo .p12 o .pfx primero.');
      return;
    }
    if (!p12Password) {
      setP12UnlockError('Ingrese la contraseña para desbloquear el archivo .p12.');
      return;
    }

    setIsUnlockingP12(true);
    setP12UnlockError(null);
    try {
      const buffer = await uploadedP12File.arrayBuffer();
      const extracted = extractKeysFromUploadedP12(buffer, p12Password);
      setUnlockedP12Data(extracted);
      setQuickName(extracted.subjectCn);
      if (extracted.subjectId) setQuickId(extracted.subjectId);
    } catch (err: any) {
      setP12UnlockError(err.message || 'Contraseña incorrecta o formato .p12 inválido.');
      setUnlockedP12Data(null);
    } finally {
      setIsUnlockingP12(false);
    }
  };

  // Main Batch PDF Signing & Stamping Action
  const handleExecuteSigning = async () => {
    if (uploadedDocs.length === 0) {
      setSigningError('Por favor suba al menos un documento para firmar.');
      return;
    }

    setIsSigning(true);
    setSigningError(null);
    setSignedResults([]);

    try {
      // 1. Resolve Private Key and Certificate PEM
      let privateKeyPem = '';
      let certPem = '';

      if (keySource === 'session' && initialResult) {
        privateKeyPem = initialResult.privateKeyPem;
        certPem = initialResult.certPem;
      } else if (keySource === 'custom_p12' && unlockedP12Data) {
        privateKeyPem = unlockedP12Data.privateKeyPem;
        certPem = unlockedP12Data.certPem;
      } else {
        // Generate ephemeral on-the-fly certificate for signing
        const generated = await generateP12Certificate({
          fullName: effectiveSignerName,
          idNumber: effectiveIdNumber,
          email: 'firma@gob.ec',
          city: quickCity.split(',')[0] || 'Quito',
          organization: 'República del Ecuador',
          country: 'EC',
          validityYears: 2,
          keySize: 2048,
          password: 'Pass_' + Math.random().toString(36).substring(2, 8),
          purpose: 'firmaec_prod',
          caAuthority: 'firmaec_mintel'
        });
        privateKeyPem = generated.privateKeyPem;
        certPem = generated.certPem;
      }

      // 2. Prepare Stamping Configuration
      const config: DocumentSigningConfig = {
        pageOption,
        specificPage,
        positionPreset,
        customX,
        customY,
        stampStyle,
        signerName: effectiveSignerName,
        idNumber: effectiveIdNumber,
        reason: quickReason,
        location: quickCity,
        entityName: 'FirmaEC - Autoridad de Certificación',
        includeQrCode,
        includeLegalRef: true,
        stampWidth: 240,
        stampHeight: 60
      };

      // 3. Process all documents in batch
      const resultsBatch: SignedPdfResult[] = [];

      for (const doc of uploadedDocs) {
        const result = await signAndStampDocumentPdf(
          doc.buffer,
          {
            ...config,
            // Override filename to keep original name clean
            signerName: effectiveSignerName
          },
          privateKeyPem,
          certPem
        );

        // Adjust fileName to include original doc name
        const cleanBaseName = doc.name.replace(/\.[^/.]+$/, '');
        const signedFileName = `${cleanBaseName}_firmado_firmaec.pdf`;
        result.fileName = signedFileName;

        resultsBatch.push(result);
      }

      setSignedResults(resultsBatch);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {}

    } catch (err: any) {
      setSigningError(`Error al firmar y estampar los documentos: ${err.message || err}`);
    } finally {
      setIsSigning(false);
    }
  };

  // Download Individual Signed PDF
  const handleDownloadSinglePdf = (signedRes: SignedPdfResult) => {
    const url = URL.createObjectURL(signedRes.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = signedRes.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download All Signed PDFs sequentially
  const handleDownloadAllSignedPdfs = () => {
    signedResults.forEach((res, idx) => {
      setTimeout(() => {
        handleDownloadSinglePdf(res);
      }, idx * 300);
    });
  };

  const signerNameLines = splitSignerNameForStamp(effectiveSignerName);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER HERO */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Stamp className="w-3.5 h-3.5 text-blue-400" />
            <span>Estándar Oficial Ecuador • FirmaEC & Quipux</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Firmado y Estampado Digital de Documentos PDF
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Sube la cantidad de documentos que requieras (PDF, imágenes o texto). Conforme al uso y estándar en Ecuador, el sello visual con <strong>Código QR de verificación accesible</strong> se estampa directamente <strong>en la última hoja sobre el campo reservado para la firma</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROLS & SETTINGS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 1: DOCUMENT UPLOAD HUB */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Documentos a Firmar</span>
              </h2>
              
              {uploadedDocs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {uploadedDocs.length} {uploadedDocs.length === 1 ? 'documento' : 'documentos'}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllDocs}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                  >
                    Limpiar lista
                  </button>
                </div>
              )}
            </div>

            {/* DRAG & DROP UPLOAD ZONE */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFilesUpload(e.dataTransfer.files);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all group ${
                isDragOver 
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01]' 
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30'
              }`}
            >
              <input
                id="main-document-file-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesUpload(e.target.files);
                    e.target.value = ''; // Reset so user can re-upload same file
                  }
                }}
                className="hidden"
              />
              <label 
                htmlFor="main-document-file-input" 
                className="cursor-pointer block w-full h-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  Arrastra y suelta aquí tus documentos o haz clic para explorar
                </p>
                
                <p className="text-[11px] text-slate-500 mt-1">
                  Soporta archivos <strong>PDF, Imágenes (.png, .jpg) y Texto (.txt)</strong>. Puedes subir 1 o múltiples archivos a la vez.
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs group-hover:border-blue-300">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Seleccionar Archivos de mi Equipo</span>
                </div>
              </label>
            </div>

            {/* Quick 1-click Sample Document Fallback */}
            {uploadedDocs.length === 0 && (
              <div className="pt-2 flex items-center justify-between p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs text-blue-900 font-medium">
                    ¿No tienes un archivo PDF a la mano?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleDocument}
                  disabled={isProcessingFiles}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Cargar Documento de Prueba
                </button>
              </div>
            )}

            {/* LIST OF UPLOADED DOCUMENTS */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">
                  Archivos en cola para firmado ({uploadedDocs.length}):
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {uploadedDocs.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                          {(doc?.type || '').includes('image') ? 'IMG' : 'PDF'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{doc?.name || 'Documento'}</p>
                          <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>{doc?.pageCount || 1} página(s) • {((doc?.size || 0) / 1024).toFixed(1)} KB</span>
                            {doc?.isConvertedToPdf && (
                              <span className="text-emerald-600 font-semibold">
                                • Convertido a PDF
                              </span>
                            )}
                            {doc?.geminiAnalysis && (
                              <span 
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold text-[10px] border ${
                                  doc.geminiAnalysis.isValid === true 
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : doc.geminiAnalysis.isValid === false
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`} 
                                title={(doc.geminiAnalysis.recommendations || []).join('\n')}
                              >
                                <Sparkles className="w-3 h-3 text-current" />
                                <span>
                                  {doc.geminiAnalysis.isValid === true && `IA: ${doc.geminiAnalysis.documentType}`}
                                  {doc.geminiAnalysis.isValid === false && `IA Rechazado (${doc.geminiAnalysis.rejectionReason || 'No válido'})`}
                                  {doc.geminiAnalysis.isValid === null && `IA: Sin validar (${doc.geminiAnalysis.validationMode || 'offline'})`}
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Listo
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: SIGNER IDENTITY & CERTIFICATE SOURCE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Datos del Firmante y Certificado Digital</span>
              </h2>
              
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setKeySource('quick_generate')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    keySource === 'quick_generate' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Firma Rápida
                </button>
                <button
                  type="button"
                  onClick={() => setKeySource('session')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    keySource === 'session' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Certificado Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setKeySource('custom_p12')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    keySource === 'custom_p12' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Cargar mi .p12
                </button>
              </div>
            </div>

            {/* Option A: Quick generate parameters */}
            {keySource === 'quick_generate' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Completo del Firmante (Titular)
                    </label>
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Ej: MISAEL VLADIMIR FERNANDEZ CORREA"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cédula de Identidad o RUC (Ecuador)
                    </label>
                    <input
                      type="text"
                      value={quickId}
                      onChange={(e) => setQuickId(e.target.value)}
                      placeholder="1715894320"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razón de la Firma
                    </label>
                    <input
                      type="text"
                      value={quickReason}
                      onChange={(e) => setQuickReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ubicación / Ciudad
                    </label>
                    <input
                      type="text"
                      value={quickCity}
                      onChange={(e) => setQuickCity(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Option B: Generated session certificate */}
            {keySource === 'session' && (
              <div className="space-y-3">
                {initialResult ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">
                          {initialResult.subject.cn}
                        </p>
                        <p className="text-[11px] text-emerald-800">
                          CI/RUC: {initialResult.subject.serialNumber || '0802778749'} • Entidad: {initialResult.caAuthorityName}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          RSA {initialResult.keySize}-bit • SHA-256 Digest
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                      Llave Lista
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>No hay un certificado generado en esta sesión aún</span>
                    </div>
                    <p className="text-amber-800">
                      Usa la opción <strong>"Firma Rápida"</strong> para firmar inmediatamente con tus datos o genera tu certificado en la pestaña <strong>"Generar .p12"</strong>.
                    </p>
                    {onNavigateToGenerator && (
                      <button
                        type="button"
                        onClick={onNavigateToGenerator}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        Ir al Generador .p12
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Option C: Custom user-uploaded .p12 */}
            {keySource === 'custom_p12' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Archivo de Firma (.p12 / .pfx)
                    </label>
                    <input
                      ref={p12FileInputRef}
                      type="file"
                      accept=".p12,.pfx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedP12File(e.target.files[0]);
                          setUnlockedP12Data(null);
                          setP12UnlockError(null);
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña del archivo .p12
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative flex items-center">
                        <input
                          type={showUnlockPassword ? "text" : "password"}
                          placeholder="Contraseña del .p12"
                          value={p12Password}
                          onChange={(e) => setP12Password(e.target.value)}
                          className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                          className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title={showUnlockPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showUnlockPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleUnlockCustomP12}
                        disabled={isUnlockingP12 || !uploadedP12File || !p12Password}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isUnlockingP12 ? '...' : 'Desbloquear'}
                      </button>
                    </div>
                  </div>
                </div>

                {p12UnlockError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{p12UnlockError}</span>
                  </div>
                )}

                {unlockedP12Data && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Desbloqueado: <strong>{unlockedP12Data.subjectCn}</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700">
                      RSA {unlockedP12Data.keySize}-bit
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: INTERACTIVE STAMP POSITIONER */}
          <InteractiveStampPositioner
            positionPreset={positionPreset}
            setPositionPreset={setPositionPreset}
            customX={customX}
            setCustomX={setCustomX}
            customY={customY}
            setCustomY={setCustomY}
            stampStyle={stampStyle}
            setStampStyle={setStampStyle}
            pageOption={pageOption}
            setPageOption={setPageOption}
            specificPage={specificPage}
            setSpecificPage={setSpecificPage}
            includeQrCode={includeQrCode}
            setIncludeQrCode={setIncludeQrCode}
            signerName={effectiveSignerName}
            idNumber={effectiveIdNumber}
            qrDataUrl={previewQrDataUrl}
            pdfBuffer={uploadedDocs[0]?.buffer}
            documentPreviewUrl={uploadedDocs[0]?.previewDataUrl}
            documentPageCount={uploadedDocs[0]?.pageCount || 1}
            documentName={uploadedDocs[0]?.name}
          />

          {/* ERROR DISPLAY */}
          {signingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error en el proceso de firmado:</p>
                <p className="mt-0.5">{signingError}</p>
              </div>
            </div>
          )}

          {/* MAIN SIGNING EXECUTION BUTTON */}
          <button
            type="button"
            onClick={handleExecuteSigning}
            disabled={isSigning || isProcessingFiles || uploadedDocs.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSigning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Estampando FirmaEC en {uploadedDocs.length} documento(s)...</span>
              </>
            ) : (
              <>
                <FileSignature className="w-5 h-5" />
                <span>
                  {uploadedDocs.length > 1 
                    ? `Estampar Firma Digital en Todos los ${uploadedDocs.length} Documentos`
                    : 'Estampar Firma Digital y Generar PDF Oficial'
                  }
                </span>
              </>
            )}
          </button>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW & SIGNED RESULTS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* SUCCESSFUL BATCH RESULT CARD (When signed) */}
          {signedResults.length > 0 ? (
            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                    Firma Válida e Íntegra
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {signedResults.length === 1 
                      ? 'Documento PDF Firmado y Estampado' 
                      : `¡${signedResults.length} Documentos PDF Firmados y Estampados!`
                    }
                  </h3>
                </div>
              </div>

              {/* LIST OF SIGNED FILES */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {signedResults.map((res, i) => (
                  <div key={i} className="p-3 bg-slate-800/90 rounded-xl text-xs space-y-1.5 font-mono text-slate-300 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">{res.fileName}</p>
                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePdf(res)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </button>
                    </div>
                    <p className="text-[10.5px] text-slate-400">
                      Páginas firmadas: <span className="text-emerald-400 font-bold">{res.signedPages.join(', ')}</span> de {res.pageCount}
                    </p>
                    <p className="text-[9.5px] text-slate-400 break-all truncate">
                      SHA-256: <span className="text-blue-400">{res.originalSha256}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Download All & Validator Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {signedResults.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllSignedPdfs}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Todos los PDF Firmados ({signedResults.length})</span>
                  </button>
                )}

                {signedResults.length === 1 && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePdf(signedResults[0])}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Documento PDF Firmado</span>
                  </button>
                )}

                {onNavigateToValidator && (
                  <button
                    type="button"
                    onClick={onNavigateToValidator}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Verificar en Validador de Firmas</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* LIVE STAMP PREVIEW (Exact match to standard format) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Vista Previa del Sello Estampado
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                ESTÁNDAR OFICIAL
              </span>
            </div>

            <div className="p-5 space-y-4">
              
              {/* STAMP BOX RENDERING ACCORDING TO SELECTED STYLE */}
              {stampStyle === 'quipux-classic' ? (
                <div className="p-3.5 rounded-xl border border-slate-400 bg-slate-50/80 text-slate-900 text-xs space-y-2 relative shadow-xs">
                  <div className="bg-slate-800 text-white px-2.5 py-1 rounded text-[10px] font-bold tracking-wide flex items-center justify-between">
                    <span>GESTIÓN DOCUMENTAL QUIPUX</span>
                    <span className="text-[9px] text-slate-300">REPÚBLICA DEL ECUADOR</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 space-y-1 text-[11px]">
                      <p className="text-slate-500 text-[10px]">Firmado digitalmente por:</p>
                      <p className="font-bold text-slate-950 uppercase">{effectiveSignerName}</p>
                      <p className="text-slate-600 text-[10px]">CI/RUC: {effectiveIdNumber}</p>
                      <p className="text-slate-600 text-[10px]">Fecha: {new Date().toLocaleDateString('es-EC')} GMT-5</p>
                      <p className="text-slate-500 text-[10px]">Razón: {quickReason}</p>
                    </div>
                    {includeQrCode && previewQrDataUrl && (
                      <div className="w-16 h-16 bg-white p-1 rounded border border-slate-300 flex-shrink-0 flex items-center justify-center">
                        <img src={previewQrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              ) : stampStyle === 'sri-tax' ? (
                <div className="p-3.5 rounded-xl border border-emerald-500 bg-emerald-50/50 text-slate-900 text-xs space-y-2 relative shadow-xs">
                  <div className="bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold tracking-wide flex items-center justify-between">
                    <span>SRI - COMPROBANTE FIRMADO DIGITALMENTE</span>
                    <span className="text-[9px] text-emerald-200">VALIDEZ TRIBUTARIA</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 space-y-1 text-[11px]">
                      <p className="text-emerald-950 font-bold uppercase">{effectiveSignerName}</p>
                      <p className="text-slate-700 text-[10px]">RUC: {effectiveIdNumber}</p>
                      <p className="text-slate-700 text-[10px]">Fecha Emisión: {new Date().toLocaleDateString('es-EC')} GMT-5</p>
                      <p className="text-emerald-800 text-[9px] font-mono">SHA-256: 4a8f9c2d1b... (Verificable)</p>
                    </div>
                    {includeQrCode && previewQrDataUrl && (
                      <div className="w-16 h-16 bg-white p-1 rounded border border-emerald-300 flex-shrink-0 flex items-center justify-center">
                        <img src={previewQrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              ) : stampStyle === 'legal-notary' ? (
                <div className="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/40 text-slate-900 text-xs space-y-2 relative shadow-xs">
                  <div className="border-b border-amber-300 pb-1 text-center font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                    Certificación Digital y Validez Probatoria
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 space-y-1 text-[11px]">
                      <p className="font-bold text-slate-950 uppercase">{effectiveSignerName}</p>
                      <p className="text-slate-700 text-[10px]">Identificación: {effectiveIdNumber}</p>
                      <p className="text-slate-700 text-[10px]">Fecha: {new Date().toLocaleDateString('es-EC')} | {quickCity}</p>
                      <p className="text-amber-900 text-[9px] font-semibold">Art. 14 Ley de Comercio Electrónico</p>
                    </div>
                    {includeQrCode && previewQrDataUrl && (
                      <div className="w-16 h-16 bg-white p-1 rounded border border-amber-300 flex-shrink-0 flex items-center justify-center">
                        <img src={previewQrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ESTÁNDAR OFICIAL ECUADOR (QR + MONOSPACE) */
                <div className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm relative font-mono select-none">
                  <div className="flex items-center gap-3.5">
                    {/* QR Code on the left */}
                    {includeQrCode && previewQrDataUrl && (
                      <div className="w-20 h-20 bg-white p-0.5 border border-slate-200 rounded flex-shrink-0 flex items-center justify-center">
                        <img src={previewQrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* Monospace Typewriter Text on the right */}
                    <div className="flex-1 space-y-0.5 text-slate-950 leading-tight">
                      <p className="text-[11px] text-slate-700 font-normal">
                        Firmado electrónicamente por:
                      </p>
                      <p className="text-sm font-extrabold tracking-tight text-slate-950 uppercase font-mono">
                        {signerNameLines[0]}
                      </p>
                      {signerNameLines[1] && (
                        <p className="text-sm font-extrabold tracking-tight text-slate-950 uppercase font-mono">
                          {signerNameLines[1]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION OF STAMP OVER SIGNATURE FIELD */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Estampado en el Documento</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Posición: {positionPreset}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 text-center relative overflow-hidden">
                  <div className="text-[10px] text-slate-400 font-serif italic mb-3">
                    "... las partes suscriben en conformidad al tenor del presente instrumento ..."
                  </div>
                  
                  {/* Visual Signature Line representation */}
                  <div className="max-w-[240px] mx-auto pt-2 border-t border-slate-400 text-center">
                    <p className="text-[10px] font-bold text-slate-700 uppercase">
                      FIRMA DEL TITULAR / DECLARANTE
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      C.I./RUC: {effectiveIdNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: QR CODE CONTENT ACCESSIBLE BY SCANNER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Código QR de Verificación Universal (ISO/IEC 18004)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {previewQrDataUrl && (
                  <a
                    href={previewQrDataUrl}
                    download={`qr_verificacion_${(effectiveSignerName || 'firma').toLowerCase().replace(/\s+/g, '_')}.png`}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Descargar imagen PNG del QR en alta resolución (1024px)"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Descargar QR HD</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyQrText}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {copiedQrText ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW + SPECS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
              {previewQrDataUrl && (
                <div className="sm:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                  <div className="w-28 h-28 bg-white p-1 rounded flex items-center justify-center">
                    <img 
                      src={previewQrDataUrl} 
                      alt="Código QR de Verificación en Alta Definición" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-700 font-semibold mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    100% Escaneable
                  </span>
                </div>
              )}

              <div className="sm:col-span-8 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Zona de Silencio</span>
                    <strong className="text-slate-800">4 Módulos (ISO)</strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Corrección Error</span>
                    <strong className="text-slate-800">Nivel M (15%)</strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Resolución</span>
                    <strong className="text-slate-800">1024px Hi-Res</strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Compatibilidad</span>
                    <strong className="text-slate-800">Cámaras Móviles</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Compatible con <strong>Google Lens</strong>, <strong>Cámara iOS</strong>, <strong>Samsung Scanner</strong>, <strong>Xiaomi</strong> y lectores ópticos 2D.
                </p>
              </div>
            </div>

            {/* RAW READABLE OUTPUT */}
            <div>
              <p className="text-[11px] text-slate-600 mb-1.5">
                Texto descifrado al escanear con el teléfono móvil:
              </p>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10.5px] leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                {qrVerificationReadableText}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Validador estatal compatible: <strong>firmadigital.gob.ec (MINTEL)</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
