import React, { useState } from 'react';
import { 
  FileCode, 
  Upload, 
  ShieldCheck, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Code, 
  Info,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { signSriXmlWithP12, validateXadesXmlSignature, XadesSignedResult } from '../services/xadesGenerator';
import { extractKeysFromUploadedP12, generateP12Certificate } from '../services/p12Generator';

interface XadesSignerToolProps {
  initialP12Pem?: { certPem: string; privateKeyPem: string; signerName: string; idNumber: string } | null;
}

const SAMPLE_SRI_FACTURA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>EMPRESA DE PRUEBA ECUADOR S.A.</razonSocial>
    <nombreComercial>FACTURACION ELECTRONICA SRI</nombreComercial>
    <ruc>1792143200001</ruc>
    <claveAcceso>2308202601179214320000110010010000000011234567813</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000001</secuencial>
    <dirMatriz>Av. Amazonas y Eloy Alfaro, Quito, Ecuador</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>23/08/2026</fechaEmision>
    <dirEstablecimiento>Av. Republica y Pradera, Quito</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionComprador>05</tipoIdentificacionComprador>
    <razonSocialComprador>FERNANDEZ CORREA MISAEL VLADIMIR</razonSocialComprador>
    <identificacionComprador>1715894320</identificacionComprador>
    <totalSinImpuestos>100.00</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>100.00</baseImponible>
        <valor>15.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>115.00</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>
    <detalle>
      <codigoPrincipal>SERV-001</codigoPrincipal>
      <descripcion>Servicio de Firma Electrónica y Certificado Digital P12</descripcion>
      <cantidad>1.00</cantidad>
      <precioUnitario>100.00</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>100.00</precioTotalSinImpuesto>
    </detalle>
  </detalles>
</factura>`;

export const XadesSignerTool: React.FC<XadesSignerToolProps> = ({ initialP12Pem }) => {
  const [xmlText, setXmlText] = useState(SAMPLE_SRI_FACTURA_XML);
  const [signerName, setSignerName] = useState(initialP12Pem?.signerName || 'MISAEL VLADIMIR FERNANDEZ CORREA');
  const [idNumber, setIdNumber] = useState(initialP12Pem?.idNumber || '1715894320');
  
  // P12 upload or active keys
  const [p12File, setP12File] = useState<File | null>(null);
  const [p12Password, setP12Password] = useState('');
  const [unlockedKeys, setUnlockedKeys] = useState<{ certPem: string; privateKeyPem: string } | null>(
    initialP12Pem ? { certPem: initialP12Pem.certPem, privateKeyPem: initialP12Pem.privateKeyPem } : null
  );

  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [signedResult, setSignedResult] = useState<XadesSignedResult | null>(null);
  const [copiedXml, setCopiedXml] = useState(false);

  const handleP12FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setP12File(e.target.files[0]);
      setSigningError(null);
    }
  };

  const handleUnlockAndSign = async () => {
    setIsSigning(true);
    setSigningError(null);

    try {
      let certPem = unlockedKeys?.certPem;
      let privateKeyPem = unlockedKeys?.privateKeyPem;

      // Si subió un archivo .p12 custom
      if (p12File && p12Password) {
        const p12Buffer = await p12File.arrayBuffer();
        const extracted = await extractKeysFromUploadedP12(p12Buffer, p12Password);
        certPem = extracted.certPem;
        privateKeyPem = extracted.privateKeyPem;
        setUnlockedKeys({ certPem, privateKeyPem });
      }

      // Si no hay firma previa disponible, generamos una sobre la marcha para pruebas
      if (!certPem || !privateKeyPem) {
        const generated = await generateP12Certificate({
          fullName: signerName,
          idNumber: idNumber,
          email: 'usuario@firmaec.gob.ec',
          city: 'Quito, Ecuador',
          organization: 'SRI Facturación Electrónica',
          country: 'EC',
          validityYears: 2,
          keySize: 2048,
          password: 'Password123!',
          purpose: 'sri_test',
          caAuthority: 'firmaec_mintel',
        });
        certPem = generated.certPem;
        privateKeyPem = generated.privateKeyPem;
        setUnlockedKeys({ certPem, privateKeyPem });
      }

      const result = await signSriXmlWithP12(xmlText, {
        signerName,
        idNumber,
        certPem,
        privateKeyPem,
      });

      setSignedResult(result);
    } catch (err: any) {
      setSigningError(err?.message || 'Error al firmar el XML con XAdES-BES.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadSignedXml = () => {
    if (!signedResult) return;
    const blob = new Blob([signedResult.signedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante_firmado_xades_${signedResult.signatureId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyXml = () => {
    if (!signedResult) return;
    navigator.clipboard.writeText(signedResult.signedXml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estándar Oficial SRI Ecuador (XAdES-BES)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-7 h-7 text-emerald-600" />
            Firmador XML para Comprobantes Electrónicos SRI
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Firma facturación electrónica, retenciones, notas de crédito y guías de remisión cumpliendo la especificación W3C XMLDSig / ETSI XAdES.
          </p>
        </div>

        <button
          onClick={() => setXmlText(SAMPLE_SRI_FACTURA_XML)}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          <Code className="w-4 h-4" />
          <span>Cargar XML Ejemplo SRI (Factura)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: XML Editor & Signer Settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>Contenido XML del Comprobante SRI:</span>
              <span className="text-xs font-normal text-slate-500">Formato UTF-8 sin firmar</span>
            </label>
            <textarea
              value={xmlText}
              onChange={(e) => setXmlText(e.target.value)}
              rows={12}
              className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              placeholder="Pegue aquí el contenido XML del comprobante SRI..."
            />
          </div>

          {/* Config Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nombre del Firmante:</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Cédula o RUC del Emisor:</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optional P12 custom upload */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Certificado Digital PKCS#12 (.p12 / .pfx):
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept=".p12,.pfx"
                onChange={handleP12FileChange}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <input
                type="password"
                placeholder="Contraseña del .p12"
                value={p12Password}
                onChange={(e) => setP12Password(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {unlockedKeys && !p12File && (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Usando certificado activo en sesión.</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleUnlockAndSign}
            disabled={isSigning || !xmlText.trim()}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generando Estructura XAdES-BES para SRI...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Firmar Comprobante XML (XAdES-BES)</span>
              </>
            )}
          </button>

          {signingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{signingError}</span>
            </div>
          )}
        </div>

        {/* Right Col: XAdES Output & Technical Validation */}
        <div className="lg:col-span-5 space-y-6">
          {signedResult ? (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Comprobante Firmado Exitosamente</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  {signedResult.sriDocumentType}
                </span>
              </div>

              {/* Technical breakdown */}
              <div className="space-y-3 text-xs">
                <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Identificador de Firma XAdES:</span>
                  <span className="font-mono text-emerald-300 font-bold">{signedResult.signatureId}</span>
                </div>

                <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Marca de Tiempo ISO 8601:</span>
                  <span className="font-mono text-slate-200">{signedResult.signedTime}</span>
                </div>

                <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Digest SHA-256 del XML Original:</span>
                  <span className="font-mono text-[10px] text-slate-300 break-all">{signedResult.sha256DocumentDigestHex}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDownloadSignedXml}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar XML Firmado para SRI</span>
                </button>

                <button
                  onClick={handleCopyXml}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  {copiedXml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedXml ? '¡Copiado al Portapapeles!' : 'Copiar XML Firmado Completo'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 border-dashed text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Listo para Firmar XML SRI</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  El resultado generará la estructura <code className="text-emerald-700">&lt;ds:Signature&gt;</code> con extensiones ETSI XAdES-BES para validación directa en el portal del SRI.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
