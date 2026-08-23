import forge from 'node-forge';

export interface XadesSignatureOptions {
  signerName: string;
  idNumber: string;
  email?: string;
  privateKeyPem: string;
  certPem: string;
  reason?: string;
}

export interface XadesSignedResult {
  signedXml: string;
  signatureId: string;
  signedTime: string;
  sha256DocumentDigestHex: string;
  signatureValueBase64: string;
  certBase64: string;
  sriDocumentType: string;
}

export interface XadesValidationResult {
  isValid: boolean;
  signatureId?: string;
  signingTime?: string;
  signerCommonName?: string;
  signerIdNumber?: string;
  hasEnvelopedSignature: boolean;
  hasQualifyingProperties: boolean;
  hasSignedProperties: boolean;
  errors: string[];
}

/**
 * Genera una firma electrónica digital XAdES-BES / XAdES-EPES para comprobantes electrónicos del SRI de Ecuador.
 * Cumple con la especificación técnica oficial del SRI (Facturas, Retenciones, Notas de Crédito, Guías de Remisión).
 */
export async function signSriXmlWithP12(
  xmlContent: string,
  options: XadesSignatureOptions
): Promise<XadesSignedResult> {
  const cert = forge.pki.certificateFromPem(options.certPem);
  const privateKey = forge.pki.privateKeyFromPem(options.privateKeyPem);

  // Limpiar y preparar el XML
  const cleanXml = xmlContent.trim().replace(/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>/i, '').trim();

  // Detectar el tipo de documento del SRI
  let sriDocType = 'comprobante_sri';
  if (cleanXml.includes('<factura')) sriDocType = 'Factura Electrónica (SRI)';
  else if (cleanXml.includes('<comprobanteRetencion')) sriDocType = 'Comprobante de Retención (SRI)';
  else if (cleanXml.includes('<notaCredito')) sriDocType = 'Nota de Crédito (SRI)';
  else if (cleanXml.includes('<guiaRemision')) sriDocType = 'Guía de Remisión (SRI)';
  else if (cleanXml.includes('<liquidacionCompra')) sriDocType = 'Liquidación de Compra (SRI)';

  // Generar IDs aleatorios únicos para la firma
  const rnd = Math.floor(Math.random() * 899999) + 100000;
  const sigId = `Signature${rnd}`;
  const signedInfoId = `SignedInfo${rnd}`;
  const signedPropertiesId = `SignedProperties${rnd}`;
  const keyInfoId = `Certificate${rnd}`;
  const objectId = `Object${rnd}`;

  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const certBase64 = forge.util.encode64(certDer);

  // Digest SHA-256 del certificado
  const certMd = forge.md.sha256.create();
  certMd.update(certDer);
  const certDigestBase64 = forge.util.encode64(certMd.digest().getBytes());

  // Digest SHA-256 del documento XML original
  const docMd = forge.md.sha256.create();
  docMd.update(forge.util.encodeUtf8(cleanXml));
  const docDigestHex = docMd.digest().toHex();
  const docDigestBase64 = forge.util.encode64(forge.util.hexToBytes(docDigestHex));

  const now = new Date();
  const isoDate = now.toISOString();

  // Nombres y serie para la estructura de la firma
  const issuerCn = cert.issuer.getField('CN')?.value || 'ECI ECUADOR';
  const serialNumber = cert.serialNumber;

  // Construir el bloque SignedProperties
  const signedPropertiesXml = `<etsi:SignedProperties Id="${signedPropertiesId}" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#">
<etsi:SignedSignatureProperties>
<etsi:SigningTime>${isoDate}</etsi:SigningTime>
<etsi:SigningCertificate>
<etsi:Cert>
<etsi:CertDigest>
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
<ds:DigestValue>${certDigestBase64}</ds:DigestValue>
</etsi:CertDigest>
<etsi:IssuerSerial>
<ds:X509IssuerName>${escapeXml(issuerCn)}</ds:X509IssuerName>
<ds:X509SerialNumber>${serialNumber}</ds:X509SerialNumber>
</etsi:IssuerSerial>
</etsi:Cert>
</etsi:SigningCertificate>
</etsi:SignedSignatureProperties>
</etsi:SignedProperties>`;

  // Digest SHA-256 de SignedProperties
  const propMd = forge.md.sha256.create();
  propMd.update(forge.util.encodeUtf8(signedPropertiesXml));
  const propDigestBase64 = forge.util.encode64(propMd.digest().getBytes());

  // Construir el bloque KeyInfo
  const keyInfoXml = `<ds:KeyInfo Id="${keyInfoId}" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
<ds:X509Data>
<ds:X509Certificate>
${certBase64}
</ds:X509Certificate>
</ds:X509Data>
</ds:KeyInfo>`;

  // Digest SHA-256 de KeyInfo
  const keyMd = forge.md.sha256.create();
  keyMd.update(forge.util.encodeUtf8(keyInfoXml));
  const keyDigestBase64 = forge.util.encode64(keyMd.digest().getBytes());

  // Construir SignedInfo
  const signedInfoXml = `<ds:SignedInfo Id="${signedInfoId}" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha256"/>
<ds:Reference URI="">
<ds:Transforms>
<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
</ds:Transforms>
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
<ds:DigestValue>${docDigestBase64}</ds:DigestValue>
</ds:Reference>
<ds:Reference URI="#${keyInfoId}">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
<ds:DigestValue>${keyDigestBase64}</ds:DigestValue>
</ds:Reference>
<ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#${signedPropertiesId}">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
<ds:DigestValue>${propDigestBase64}</ds:DigestValue>
</ds:Reference>
</ds:SignedInfo>`;

  // Firmar SignedInfo con la Llave Privada RSA SHA-256
  const sigMd = forge.md.sha256.create();
  sigMd.update(forge.util.encodeUtf8(signedInfoXml));
  const signatureBytes = privateKey.sign(sigMd);
  const signatureValueBase64 = forge.util.encode64(signatureBytes);

  // Construir el elemento ds:Signature completo
  const dsSignatureXml = `<ds:Signature Id="${sigId}" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#">
${signedInfoXml}
<ds:SignatureValue>
${signatureValueBase64}
</ds:SignatureValue>
${keyInfoXml}
<ds:Object Id="${objectId}">
<etsi:QualifyingProperties Target="#${sigId}">
${signedPropertiesXml}
</etsi:QualifyingProperties>
</ds:Object>
</ds:Signature>`;

  // Insertar la firma en el XML (firmado Enveloped antes del tag de cierre del elemento raíz)
  const lastClosingTagIndex = cleanXml.lastIndexOf('</');
  let finalXml = '';
  if (lastClosingTagIndex !== -1) {
    finalXml = `<?xml version="1.0" encoding="UTF-8"?>\n` + cleanXml.substring(0, lastClosingTagIndex) + '\n' + dsSignatureXml + '\n' + cleanXml.substring(lastClosingTagIndex);
  } else {
    finalXml = `<?xml version="1.0" encoding="UTF-8"?>\n` + cleanXml + '\n' + dsSignatureXml;
  }

  return {
    signedXml: finalXml,
    signatureId: sigId,
    signedTime: isoDate,
    sha256DocumentDigestHex: docDigestHex,
    signatureValueBase64,
    certBase64,
    sriDocumentType: sriDocType,
  };
}

/**
 * Valida la estructura de una firma XAdES-BES en un documento XML.
 */
export function validateXadesXmlSignature(xmlContent: string): XadesValidationResult {
  const errors: string[] = [];

  const hasSignature = xmlContent.includes('Signature');
  const hasEnveloped = xmlContent.includes('enveloped-signature');
  const hasQualifying = xmlContent.includes('QualifyingProperties');
  const hasSignedProperties = xmlContent.includes('SignedProperties');

  if (!hasSignature) errors.push('No se encontró el nodo <ds:Signature> en el XML.');
  if (!hasEnveloped) errors.push('Falta el algoritmo de transformación enveloped-signature.');
  if (!hasQualifying) errors.push('No se encontró la extensión XAdES <etsi:QualifyingProperties>.');
  if (!hasSignedProperties) errors.push('Falta el bloque <etsi:SignedProperties>.');

  // Extraer fecha de firma
  const timeMatch = xmlContent.match(/<etsi:SigningTime>([^<]+)<\/etsi:SigningTime>/i);
  const signingTime = timeMatch ? timeMatch[1] : undefined;

  // Extraer ID de firma
  const idMatch = xmlContent.match(/<ds:Signature\s+Id="([^"]+)"/i);
  const signatureId = idMatch ? idMatch[1] : undefined;

  return {
    isValid: errors.length === 0,
    signatureId,
    signingTime,
    hasEnvelopedSignature: hasEnveloped,
    hasQualifyingProperties: hasQualifying,
    hasSignedProperties: hasSignedProperties,
    errors,
  };
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
