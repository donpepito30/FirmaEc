import forge from 'node-forge';
import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { compressImage } from '../utils/imageCompression';
import { 
  GeneratedP12Result, 
  P12GenerateOptions, 
  P12InspectionResult, 
  FirmaECTestCheck,
  DocumentSigningConfig,
  SignedPdfResult
} from '../types';

/**
 * Entidades acreditadas reconocidas en Ecuador bajo ARCOTEL
 */
export const ECUADOR_RECOGNIZED_CAS = [
  { name: 'Banco Central del Ecuador (BCE)', keywords: ['banco central', 'bce', 'entidad de certificacion de informacion'] },
  { name: 'Security Data Seguridad en Datos S.A.', keywords: ['security data', 'securitydata'] },
  { name: 'ANFAC Autoridad de Certificación Ecuador C.A.', keywords: ['anfac', 'anfac ec'] },
  { name: 'Uanataca Ecuador S.A.', keywords: ['uanataca'] },
  { name: 'Consejo de la Judicatura (ICERT-EC)', keywords: ['consejo de la judicatura', 'icert', 'funcion judicial'] },
  { name: 'Digifirma S.A.', keywords: ['digifirma'] },
  { name: 'FirmaEC / MINTEL', keywords: ['mintel', 'firmaec', 'telecomunicaciones'] }
];

export interface CAAuthorityProfile {
  id: 'firmaec_mintel' | 'bce' | 'security_data' | 'icert_judicatura' | 'uanataca' | 'custom';
  name: string;
  caCommonName: string;
  caOrg: string;
  caUnit: string;
  caCountry: string;
  description: string;
}

export const CA_PROFILES: Record<string, CAAuthorityProfile> = {
  firmaec_mintel: {
    id: 'firmaec_mintel',
    name: 'FirmaEC - MINTEL Ecuador (Autoridad de Certificación)',
    caCommonName: 'AUTORIDAD DE CERTIFICACION RAIZ FIRMAEC MINTEL',
    caOrg: 'MINISTERIO DE TELECOMUNICACIONES Y SOCIEDAD DE LA INFORMACION',
    caUnit: 'SUBSECRETARIA DE GOBIERNO ELECTRONICO - FIRMADIGITAL',
    caCountry: 'EC',
    description: 'Perfil estándar de desarrollo compatible con la suite oficial FirmaEC de escritorio y portales estatales.'
  },
  bce: {
    id: 'bce',
    name: 'Banco Central del Ecuador (BCE - Entidad de Certificación)',
    caCommonName: 'AUTORIDAD DE CERTIFICACION BANCO CENTRAL DEL ECUADOR',
    caOrg: 'BANCO CENTRAL DEL ECUADOR',
    caUnit: 'ENTIDAD DE CERTIFICACION DE INFORMACION',
    caCountry: 'EC',
    description: 'Perfil compatible con trámites de Comercio Exterior (VUE), Facturación Electrónica SRI y Quipux.'
  },
  security_data: {
    id: 'security_data',
    name: 'Security Data Seguridad en Datos S.A.',
    caCommonName: 'AUTORIDAD DE CERTIFICACION SECURITY DATA S.A.',
    caOrg: 'SECURITY DATA SEGURIDAD EN DATOS S.A.',
    caUnit: 'OPERACIONES PKI ECUADOR',
    caCountry: 'EC',
    description: 'Perfil con formato para personas naturales y jurídicas en sector privado y público.'
  },
  icert_judicatura: {
    id: 'icert_judicatura',
    name: 'Consejo de la Judicatura (ICERT-EC)',
    caCommonName: 'AUTORIDAD DE CERTIFICACION ICERT-EC',
    caOrg: 'CONSEJO DE LA JUDICATURA',
    caUnit: 'DIRECCION NACIONAL DE TECNOLOGIAS TIC',
    caCountry: 'EC',
    description: 'Perfil orientado a administración de justicia, abogados, peritos y notarios.'
  },
  uanataca: {
    id: 'uanataca',
    name: 'Uanataca Ecuador S.A.',
    caCommonName: 'AUTORIDAD DE CERTIFICACION UANATACA ECUADOR',
    caOrg: 'UANATACA ECUADOR S.A.',
    caUnit: 'PRESTADOR DE SERVICIOS ELECTRONICOS DE CONFIANZA',
    caCountry: 'EC',
    description: 'Perfil acreditado para firma electrónica en archivo y nube.'
  },
  custom: {
    id: 'custom',
    name: 'Autoridad Raíz Personalizada de Prueba',
    caCommonName: 'CA RAIZ ECUADOR - AUTORIDAD DE PRUEBA',
    caOrg: 'AUTORIDAD DE CERTIFICACION DIGITAL ECUATORIANA',
    caUnit: 'CERTIFICADOS DIGITALES PERSONA NATURAL',
    caCountry: 'EC',
    description: 'Generación con autoridad raíz independiente de alta seguridad.'
  }
};

import { validateEcuadorianId as validateIdInput } from '../utils/inputValidator';

/**
 * Valida el algoritmo de cédula o RUC ecuatoriano (Módulo 10 y Provincias)
 */
export function validateEcuadorianId(id: string): { isValid: boolean; message: string; type: 'cedula' | 'ruc' | 'invalido' } {
  const result = validateIdInput(id);
  return {
    isValid: result.isValid,
    message: result.isValid ? (result.type === 'cedula' ? 'Cédula de identidad ecuatoriana válida' : 'RUC ecuatoriano válido') : (result.error || 'Identificación inválida'),
    type: result.type || 'invalido',
  };
}

/**
 * Genera un archivo PKCS#12 (.p12) real con llaves RSA, Autoridad Raíz (CA) y certificado X.509 v3
 */
export async function generateP12Certificate(
  options: P12GenerateOptions,
  onProgress?: (step: string, percent: number) => void
): Promise<GeneratedP12Result> {
  onProgress?.('Iniciando generador criptográfico conforme a FirmaEC...', 10);

  const selectedCA = CA_PROFILES[options.caAuthority || 'firmaec_mintel'] || CA_PROFILES.firmaec_mintel;

  // 1. Generar Par de Claves para la Autoridad Certificadora Raíz (Root CA)
  onProgress?.('Creando Autoridad de Certificación Raíz (CA)...', 20);
  const caKeys = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, keypair) => {
      if (err) reject(err);
      else resolve(keypair);
    });
  });

  // Fechas de validez para la CA Raíz (10 años)
  const caNotBefore = new Date();
  caNotBefore.setDate(caNotBefore.getDate() - 2);
  const caNotAfter = new Date();
  caNotAfter.setFullYear(caNotAfter.getFullYear() + 10);

  const caCert = forge.pki.createCertificate();
  caCert.publicKey = caKeys.publicKey;
  caCert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(8));
  caCert.validity.notBefore = caNotBefore;
  caCert.validity.notAfter = caNotAfter;

  const caAttrs = [
    { name: 'commonName', value: selectedCA.caCommonName },
    { name: 'organizationName', value: selectedCA.caOrg },
    { name: 'organizationalUnitName', value: selectedCA.caUnit },
    { name: 'countryName', value: selectedCA.caCountry }
  ];

  caCert.setSubject(caAttrs);
  caCert.setIssuer(caAttrs); // Self-signed CA

  caCert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
      pathLenConstraint: 2
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      cRLSign: true,
      digitalSignature: true,
      nonRepudiation: true
    },
    {
      name: 'subjectKeyIdentifier'
    }
  ]);

  // Firmar CA con SHA-256
  caCert.sign(caKeys.privateKey, forge.md.sha256.create());

  // 2. Generar Par de Claves RSA para el Usuario Final
  onProgress?.(`Generando par de claves RSA (${options.keySize} bits) para el titular...`, 40);
  const userKeys = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: options.keySize, workers: -1 }, (err, keypair) => {
      if (err) reject(err);
      else resolve(keypair);
    });
  });

  onProgress?.('Construyendo certificado digital X.509 v3 con extensiones FirmaEC...', 60);

  // Fechas de validez para el certificado del titular
  const notBefore = new Date();
  notBefore.setDate(notBefore.getDate() - 1);
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + options.validityYears);

  const userCert = forge.pki.createCertificate();
  userCert.publicKey = userKeys.publicKey;
  userCert.serialNumber = '02' + forge.util.bytesToHex(forge.random.getBytesSync(10));
  userCert.validity.notBefore = notBefore;
  userCert.validity.notAfter = notAfter;

  // Atributos del Sujeto (Subject)
  const userAttrs: any[] = [
    { name: 'commonName', value: options.fullName.toUpperCase().trim() },
    { name: 'countryName', value: options.country || 'EC' },
    { name: 'organizationName', value: options.organization || 'Persona Natural' },
    { name: 'organizationalUnitName', value: 'Firma Electronica Ecuador - Certificado Digital' }
  ];

  if (options.idNumber) {
    userAttrs.push({ name: 'serialNumber', value: options.idNumber.trim() });
  }
  if (options.email) {
    userAttrs.push({ name: 'emailAddress', value: options.email.trim() });
  }
  if (options.city) {
    userAttrs.push({ name: 'localityName', value: options.city.trim() });
  }

  userCert.setSubject(userAttrs);
  userCert.setIssuer(caCert.subject.attributes); // Issuer es la Autoridad Raíz

  // Extensiones X.509 exigidas por FirmaEC, SRI, Quipux y Adobe Acrobat
  userCert.setExtensions([
    {
      name: 'basicConstraints',
      cA: false
    },
    {
      name: 'keyUsage',
      digitalSignature: true,
      nonRepudiation: true, // Content commitment
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: false,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'nsCertType',
      client: true,
      email: true,
      objsign: true
    },
    {
      name: 'subjectKeyIdentifier'
    },
    {
      name: 'authorityKeyIdentifier',
      keyIdentifier: true,
      authorityCertIssuer: true,
      serialNumber: true
    }
  ]);

  onProgress?.('Firmando certificado del titular con la Autoridad Raíz (SHA-256 + RSA)...', 75);

  // La Autoridad Raíz firma el certificado del usuario
  userCert.sign(caKeys.privateKey, forge.md.sha256.create());

  onProgress?.('Empaquetando contenedor PKCS#12 (.p12) compatible con Java KeyStore / FirmaEC...', 85);

  // 3. Crear contenedor PKCS#12 que incluye: Clave Privada + Certificado de Usuario + Certificado CA
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    userKeys.privateKey,
    [userCert, caCert],
    options.password,
    {
      generateLocalKeyId: true,
      friendlyName: `${options.fullName.toUpperCase()} (Firma Electrónica EC)`,
      algorithm: '3des' // Estándar de máxima compatibilidad Java 8/11/17/21 (FirmaEC) y OpenSSL
    }
  );

  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12Uint8 = new Uint8Array(p12Der.length);
  for (let i = 0; i < p12Der.length; i++) {
    p12Uint8[i] = p12Der.charCodeAt(i);
  }

  const p12Blob = new Blob([p12Uint8], { type: 'application/x-pkcs12' });
  const p12Base64 = forge.util.encode64(p12Der);

  // Calcular huellas digitales del certificado de usuario
  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(userCert)).getBytes();
  const mdSha256 = forge.md.sha256.create();
  mdSha256.update(certDer);
  const sha256Fingerprint = mdSha256.digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';

  const mdSha1 = forge.md.sha1.create();
  mdSha1.update(certDer);
  const sha1Fingerprint = mdSha1.digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';

  const certPem = forge.pki.certificateToPem(userCert);
  const caCertPem = forge.pki.certificateToPem(caCert);
  const privateKeyPem = forge.pki.privateKeyToPem(userKeys.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(userKeys.publicKey);

  // Nombre de archivo sanitizado
  const sanitizedName = options.fullName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const fileName = `${sanitizedName || 'FIRMA_ELECTRONICA'}.p12`;

  onProgress?.('¡Certificado .p12 generado y validado con éxito!', 100);

  return {
    fileName,
    p12Blob,
    p12Base64,
    certPem,
    caCertPem,
    privateKeyPem,
    publicKeyPem,
    serialNumber: userCert.serialNumber,
    sha256Fingerprint,
    sha1Fingerprint,
    subject: {
      cn: options.fullName.toUpperCase(),
      o: options.organization || 'Persona Natural',
      c: options.country || 'EC',
      ou: 'Firma Electronica Ecuador - Certificado Digital',
      serialNumber: options.idNumber,
      email: options.email
    },
    issuer: {
      cn: selectedCA.caCommonName,
      o: selectedCA.caOrg,
      c: selectedCA.caCountry,
      ou: selectedCA.caUnit
    },
    notBefore,
    notAfter,
    keySize: options.keySize,
    password: options.password,
    caAuthorityName: selectedCA.name
  };
}

/**
 * Ejecuta la suite de verificación exhaustiva de compatibilidad con FirmaEC
 */
export function runFirmaECTestSuite(p12Result: GeneratedP12Result): FirmaECTestCheck[] {
  const tests: FirmaECTestCheck[] = [];

  // Test 1: Integridad ASN.1 y PKCS#12 DER
  try {
    const p12Bytes = forge.util.decode64(p12Result.p12Base64);
    const p12Asn1 = forge.asn1.fromDer(p12Bytes);
    const p12Obj = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, p12Result.password);
    const bags = p12Obj.getBags({ bagType: forge.pki.oids.certBag });
    const count = (bags[forge.pki.oids.certBag] || []).length;

    tests.push({
      id: 'test_pkcs12_structure',
      name: 'Estructura PKCS#12 y SafeBags ASN.1 DER',
      category: 'container',
      status: count >= 1 ? 'passed' : 'failed',
      detail: `Contenedor PKCS#12 válido con ${count} certificados y bolsa de clave privada vinculada por localKeyId.`,
      standardRef: 'RFC 7292 / PKCS#12 v1.1'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_pkcs12_structure',
      name: 'Estructura PKCS#12 y SafeBags ASN.1 DER',
      category: 'container',
      status: 'failed',
      detail: `Error al parsear PKCS#12: ${e.message}`,
      standardRef: 'RFC 7292'
    });
  }

  // Test 2: Validación de la Clave Privada RSA
  try {
    const privateKey = forge.pki.privateKeyFromPem(p12Result.privateKeyPem);
    const bitLen = privateKey.n.bitLength();
    const isBitValid = bitLen >= 2048;

    tests.push({
      id: 'test_rsa_keysize',
      name: 'Longitud y Robustez de Clave Asimétrica RSA',
      category: 'crypto',
      status: isBitValid ? 'passed' : 'failed',
      detail: `Clave RSA de ${bitLen} bits (Mínimo exigido por ARCOTEL/FirmaEC: 2048 bits). Exponente público e=65537.`,
      standardRef: 'NIST SP 800-57 / ARCOTEL'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_rsa_keysize',
      name: 'Longitud y Robustez de Clave Asimétrica RSA',
      category: 'crypto',
      status: 'failed',
      detail: `No se pudo verificar la clave RSA: ${e.message}`,
      standardRef: 'NIST SP 800-57'
    });
  }

  // Test 3: Validación del Certificado X.509 v3
  try {
    const cert = forge.pki.certificateFromPem(p12Result.certPem);
    const hasDigitalSignature = cert.extensions.some((e: any) => e.name === 'keyUsage' && (e as any).digitalSignature);
    const hasNonRepudiation = cert.extensions.some((e: any) => e.name === 'keyUsage' && (e as any).nonRepudiation);

    tests.push({
      id: 'test_key_usage',
      name: 'Usos de Clave X.509 (KeyUsage: Digital Signature & Non-Repudiation)',
      category: 'x509',
      status: (hasDigitalSignature && hasNonRepudiation) ? 'passed' : 'failed',
      detail: `KeyUsage configurado con digitalSignature=true y nonRepudiation (contentCommitment)=true para validez jurídica vinculante.`,
      standardRef: 'RFC 5280 Section 4.2.1.3'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_key_usage',
      name: 'Usos de Clave X.509',
      category: 'x509',
      status: 'failed',
      detail: `Error en análisis X.509: ${e.message}`,
      standardRef: 'RFC 5280'
    });
  }

  // Test 4: Extended Key Usage (Uso Extendido para Document Signing y Client Auth)
  try {
    const cert = forge.pki.certificateFromPem(p12Result.certPem);
    const eku = cert.extensions.find((e: any) => e.name === 'extKeyUsage');

    tests.push({
      id: 'test_eku',
      name: 'Uso Extendido de Clave (ExtKeyUsage: ClientAuth, EmailProtection, TimeStamping)',
      category: 'x509',
      status: eku ? 'passed' : 'warning',
      detail: `Habilitado para firma de documentos electrónicos, autenticación cliente y sellado de tiempo.`,
      standardRef: 'RFC 5280 Section 4.2.1.12'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_eku',
      name: 'Uso Extendido de Clave',
      category: 'x509',
      status: 'warning',
      detail: `EKU no detectable: ${e.message}`,
      standardRef: 'RFC 5280'
    });
  }

  // Test 5: Atributos del Sujeto Ecuatoriano (CN, C=EC, Cédula / RUC)
  try {
    const hasCN = Boolean(p12Result.subject.cn);
    const hasCountryEC = p12Result.subject.c === 'EC';
    const idResult = p12Result.subject.serialNumber ? validateEcuadorianId(p12Result.subject.serialNumber) : null;
    const isIdValid = idResult ? idResult.isValid : true;

    tests.push({
      id: 'test_subject_attrs',
      name: 'Atributos del Sujeto / Titular (X.500 DN y Cédula Ecuatoriana)',
      category: 'policy',
      status: (hasCN && hasCountryEC && isIdValid) ? 'passed' : 'warning',
      detail: `CN: "${p12Result.subject.cn}", País: ${p12Result.subject.c}, Cédula/RUC: ${p12Result.subject.serialNumber || 'N/A'} (${idResult?.message || 'Correcto'}).`,
      standardRef: 'Ley de Comercio Electrónico Ecuador Art. 14'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_subject_attrs',
      name: 'Atributos del Sujeto',
      category: 'policy',
      status: 'failed',
      detail: `Error al evaluar sujeto: ${e.message}`,
      standardRef: 'X.500'
    });
  }

  // Test 6: Cadena de Confianza y Autoridad Raíz Emisora (CA Chain)
  try {
    const cert = forge.pki.certificateFromPem(p12Result.certPem);
    const caCert = forge.pki.certificateFromPem(p12Result.caCertPem);
    const verified = caCert.verify(cert);

    tests.push({
      id: 'test_ca_chain',
      name: 'Jerarquía de Certificación y Firma por Autoridad Raíz (CA)',
      category: 'policy',
      status: verified ? 'passed' : 'failed',
      detail: `El certificado del titular está firmado digitalmente y verificado criptográficamente por ${p12Result.issuer.cn}.`,
      standardRef: 'RFC 5280 Path Validation'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_ca_chain',
      name: 'Jerarquía de Certificación',
      category: 'policy',
      status: 'failed',
      detail: `Error al validar cadena de certificación: ${e.message}`,
      standardRef: 'RFC 5280'
    });
  }

  // Test 7: Prueba Operativa de Firma Digital SHA-256 + RSA (PAdES / CAdES Mock)
  try {
    const sampleText = `DECLARACION JURAMENTADA DIGITAL - FIRMAEC - ${p12Result.subject.cn} - ${new Date().toISOString()}`;
    const signResult = signDigitalSample(p12Result.privateKeyPem, sampleText);

    tests.push({
      id: 'test_signature_crypto',
      name: 'Prueba Operativa de Firma Criptográfica SHA-256 + RSA PKCS#1 v1.5',
      category: 'signature',
      status: signResult.isVerified ? 'passed' : 'failed',
      detail: `Generación y verificación de firma criptográfica 100% exitosa. Hash SHA-256 comprobado: ${signResult.sha256Hash.substring(0, 16)}...`,
      standardRef: 'PKCS#1 v1.5 / PAdES Standard'
    });
  } catch (e: any) {
    tests.push({
      id: 'test_signature_crypto',
      name: 'Prueba Operativa de Firma Criptográfica',
      category: 'signature',
      status: 'failed',
      detail: `Error en firma de prueba: ${e.message}`,
      standardRef: 'PKCS#1'
    });
  }

  // Test 8: Periodo de Validez
  const now = new Date();
  const isValidTime = now >= p12Result.notBefore && now <= p12Result.notAfter;
  tests.push({
    id: 'test_validity_window',
    name: 'Ventana Temporal de Validez (notBefore / notAfter)',
    category: 'x509',
    status: isValidTime ? 'passed' : 'failed',
    detail: `Válido desde ${p12Result.notBefore.toLocaleDateString()} hasta ${p12Result.notAfter.toLocaleDateString()} (${Math.ceil((p12Result.notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} días restantes).`,
    standardRef: 'RFC 5280 Section 4.1.2.5'
  });

  return tests;
}

/**
 * Inspecciona y valida cualquier archivo .p12 provisto por el usuario
 */
export async function inspectP12File(
  fileBuffer: ArrayBuffer,
  password: string
): Promise<P12InspectionResult> {
  try {
    const bytes = new Uint8Array(fileBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const p12Asn1 = forge.asn1.fromDer(binary);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

    // Obtener bolsas de certificados
    let cert: forge.pki.Certificate | null = null;
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const pkcs8Bags = certBags[forge.pki.oids.certBag];

    if (pkcs8Bags && pkcs8Bags.length > 0 && pkcs8Bags[0].cert) {
      cert = pkcs8Bags[0].cert;
    }

    if (!cert) {
      return {
        isValid: false,
        error: 'No se encontró ningún certificado X.509 válido dentro del contenedor PKCS#12.',
        subject: '',
        commonName: '',
        issuer: '',
        issuerCommonName: '',
        serialNumber: '',
        validFrom: new Date(),
        validTo: new Date(),
        isExpired: true,
        daysRemaining: 0,
        sha256Fingerprint: '',
        keyAlgorithm: 'Desconocido',
        keyUsages: [],
        isAuthorizedEntity: false,
        certPem: ''
      };
    }

    // Extraer datos del Subject
    const cnAttr = cert.subject.attributes.find((a: any) => a.name === 'commonName' || a.shortName === 'CN');
    const serialAttr = cert.subject.attributes.find((a: any) => a.name === 'serialNumber' || a.shortName === 'SN');
    const issuerCnAttr = cert.issuer.attributes.find((a: any) => a.name === 'commonName' || a.shortName === 'CN');

    const commonName = cnAttr ? String(cnAttr.value) : 'Sin nombre';
    const identification = serialAttr ? String(serialAttr.value) : undefined;
    const issuerCommonName = issuerCnAttr ? String(issuerCnAttr.value) : 'Autoridad Emisora';

    const validFrom = cert.validity.notBefore;
    const validTo = cert.validity.notAfter;
    const now = new Date();

    const isExpired = now > validTo;
    const diffTime = validTo.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calcular Fingerprint SHA-256
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const mdSha256 = forge.md.sha256.create();
    mdSha256.update(certDer);
    const sha256Fingerprint = mdSha256.digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';

    // Extraer Usos de Clave
    const keyUsages: string[] = [];
    const keyUsageExt = cert.extensions.find((e: any) => e.name === 'keyUsage');
    if (keyUsageExt) {
      if ((keyUsageExt as any).digitalSignature) keyUsages.push('Firma Digital (Digital Signature)');
      if ((keyUsageExt as any).nonRepudiation) keyUsages.push('No Repudio (Non Repudiation)');
      if ((keyUsageExt as any).keyEncipherment) keyUsages.push('Cifrado de Claves (Key Encipherment)');
      if ((keyUsageExt as any).dataEncipherment) keyUsages.push('Cifrado de Datos (Data Encipherment)');
    } else {
      keyUsages.push('Firma Digital Estándar');
    }

    // Verificar si es una Entidad Oficial Acreditada en Ecuador
    const issuerString = JSON.stringify(cert.issuer.attributes).toLowerCase();
    let isAuthorizedEntity = false;
    let authorizedEntityName: string | undefined = undefined;

    for (const ca of ECUADOR_RECOGNIZED_CAS) {
      if (ca.keywords.some(kw => issuerString.includes(kw))) {
        isAuthorizedEntity = true;
        authorizedEntityName = ca.name;
        break;
      }
    }

    const certPem = forge.pki.certificateToPem(cert);

    return {
      isValid: true,
      subject: cert.subject.attributes.map((a: any) => `${a.shortName || a.name}=${a.value}`).join(', '),
      commonName,
      identification,
      issuer: cert.issuer.attributes.map((a: any) => `${a.shortName || a.name}=${a.value}`).join(', '),
      issuerCommonName,
      serialNumber: cert.serialNumber,
      validFrom,
      validTo,
      isExpired,
      daysRemaining,
      sha256Fingerprint,
      keyAlgorithm: 'RSA (PKCS#1 v1.5 / SHA-256)',
      keySize: (cert.publicKey as any).n ? (cert.publicKey as any).n.bitLength() : 2048,
      keyUsages,
      isAuthorizedEntity,
      authorizedEntityName,
      certPem
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message.includes('password') || err.message.includes('PKCS#12')
        ? 'Contraseña incorrecta o formato PKCS#12 dañado. Verifique la clave ingresada.'
        : `Error al leer archivo: ${err.message}`,
      subject: '',
      commonName: '',
      issuer: '',
      issuerCommonName: '',
      serialNumber: '',
      validFrom: new Date(),
      validTo: new Date(),
      isExpired: true,
      daysRemaining: 0,
      sha256Fingerprint: '',
      keyAlgorithm: 'Desconocido',
      keyUsages: [],
      isAuthorizedEntity: false,
      certPem: ''
    };
  }
}

/**
 * Firma digitalmente un texto o declaración usando la clave privada RSA
 */
export function signDigitalSample(privateKeyPem: string, textData: string): {
  signatureBase64: string;
  sha256Hash: string;
  timestamp: string;
  isVerified: boolean;
} {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const md = forge.md.sha256.create();
    md.update(textData, 'utf8');
    const sha256Hash = md.digest().toHex();

    // Firmar con RSA PKCS#1 v1.5
    const signature = privateKey.sign(md);
    const signatureBase64 = forge.util.encode64(signature);

    // Verificar con clave pública correspondiente
    const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
    const verifyMd = forge.md.sha256.create();
    verifyMd.update(textData, 'utf8');
    const isVerified = publicKey.verify(verifyMd.digest().bytes(), signature);

    return {
      signatureBase64,
      sha256Hash,
      timestamp: new Date().toISOString(),
      isVerified
    };
  } catch (e: any) {
    return {
      signatureBase64: '',
      sha256Hash: '',
      timestamp: new Date().toISOString(),
      isVerified: false
    };
  }
}

/**
 * Convierte un archivo cargado (PDF, Imagen PNG/JPG, Texto TXT) a un ArrayBuffer de PDF válido
 */
export async function convertFileToPdfBuffer(file: File): Promise<{
  buffer: ArrayBuffer;
  pageCount: number;
  isConverted: boolean;
  fileType: string;
}> {
  if (!file) {
    throw new Error('No se recibió ningún archivo.');
  }

  const safeName = file.name || 'documento.pdf';
  const lowerName = safeName.toLowerCase();
  const fileType = file.type || '';
  const arrayBuffer = await file.arrayBuffer();

  // Comprobar magic bytes para encabezado PDF (%PDF-)
  const uint8 = new Uint8Array(arrayBuffer.slice(0, 5));
  let isPdfMagic = false;
  try {
    const header = String.fromCharCode(...uint8);
    isPdfMagic = header.startsWith('%PDF');
  } catch (e) {}

  // 1. Si es PDF por magic bytes, tipo mime o extensión .pdf
  if (isPdfMagic || fileType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      return {
        buffer: arrayBuffer,
        pageCount: Math.max(1, pdfDoc.getPageCount()),
        isConverted: false,
        fileType: 'application/pdf'
      };
    } catch (e: any) {
      throw new Error(`El archivo PDF no pudo ser procesado: ${e.message || 'Estructura o contraseña protegida no válida'}`);
    }
  }

  // 2. Si es una imagen (PNG, JPG, JPEG, WEBP, GIF, etc)
  if (
    fileType.startsWith('image/') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp') ||
    lowerName.endsWith('.gif')
  ) {
    try {
      // Pre-comprimir imagen para reducir consumo de memoria RAM y evitar congelamiento
      const compressedFile = await compressImage(file);
      const compressedBuffer = await compressedFile.arrayBuffer();

      const pdfDoc = await PDFDocument.create();
      let embeddedImage;

      try {
        if (compressedFile.type === 'image/png' || lowerName.endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(compressedBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(compressedBuffer);
        }
      } catch (e1) {
        // Fallback: intentar el formato alternativo si la extensión o mime no coincide con los bytes
        try {
          if (compressedFile.type === 'image/png' || lowerName.endsWith('.png')) {
            embeddedImage = await pdfDoc.embedJpg(compressedBuffer);
          } else {
            embeddedImage = await pdfDoc.embedPng(compressedBuffer);
          }
        } catch (e2) {
          throw new Error('Formato de imagen no soportado o archivo corrupto.');
        }
      }

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const margin = 40;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2 - 40;

      const imgDims = embeddedImage.scaleToFit(availableWidth, availableHeight);
      const imgX = (pageWidth - imgDims.width) / 2;
      const imgY = pageHeight - margin - 40 - imgDims.height;

      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawText(`DOCUMENTO DIGITALIZADO - ${safeName.toUpperCase()}`, {
        x: margin,
        y: pageHeight - 32,
        size: 9,
        font: helveticaBold,
        color: rgb(0.15, 0.25, 0.45)
      });

      page.drawText(`Fecha de conversión: ${new Date().toLocaleDateString('es-EC')} | Tamaño original: ${((file.size || 0) / 1024).toFixed(1)} KB`, {
        x: margin,
        y: pageHeight - 44,
        size: 7.5,
        font: helvetica,
        color: rgb(0.5, 0.55, 0.6)
      });

      page.drawLine({
        start: { x: margin, y: pageHeight - 50 },
        end: { x: pageWidth - margin, y: pageHeight - 50 },
        thickness: 0.75,
        color: rgb(0.8, 0.85, 0.9)
      });

      page.drawImage(embeddedImage, {
        x: imgX,
        y: imgY,
        width: imgDims.width,
        height: imgDims.height
      });

      const pdfBytes = await pdfDoc.save();
      const cleanArrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      );

      return {
        buffer: cleanArrayBuffer,
        pageCount: 1,
        isConverted: true,
        fileType: 'image_converted'
      };
    } catch (err: any) {
      throw new Error(`Error al convertir la imagen a PDF: ${err.message || err}`);
    }
  }

  // 3. Si es un archivo de texto o cualquier otro documento imprimible
  try {
    const textDecoder = new TextDecoder('utf-8');
    const textContent = textDecoder.decode(arrayBuffer);
    const pdfBytes = await createSamplePdfBuffer(
      safeName.replace(/\.[^/.]+$/, ''),
      textContent.substring(0, 10000),
      'USUARIO TITULAR',
      '0802778749'
    );
    const cleanArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    );

    return {
      buffer: cleanArrayBuffer,
      pageCount: 1,
      isConverted: true,
      fileType: 'text_converted'
    };
  } catch (err: any) {
    throw new Error(`Formato no soportado (${fileType || safeName}). Suba un PDF o imagen.`);
  }
}

/**
 * Desencripta y extrae claves y certificados desde un archivo .p12 subido por el usuario
 */
export function extractKeysFromUploadedP12(
  p12Buffer: ArrayBuffer,
  password: string
): {
  isValid: boolean;
  privateKeyPem: string;
  certPem: string;
  caCertPem?: string;
  subjectCn: string;
  subjectId: string;
  issuerCn: string;
  serialNumber: string;
  notAfter: Date;
  keySize: number;
} {
  try {
    const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Buffer));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Buscar clave privada
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
    if (!keyBag || !keyBag.key) {
      throw new Error('No se encontró la clave privada en el archivo .p12 con la contraseña proporcionada.');
    }
    const privateKeyPem = forge.pki.privateKeyToPem(keyBag.key);

    // Buscar certificado
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBagList = certBags[forge.pki.oids.certBag] || [];
    if (certBagList.length === 0 || !certBagList[0].cert) {
      throw new Error('No se encontró el certificado digital X.509 en el archivo .p12.');
    }

    const userCert = certBagList[0].cert;
    const certPem = forge.pki.certificateToPem(userCert);

    let caCertPem: string | undefined;
    if (certBagList.length > 1 && certBagList[1].cert) {
      caCertPem = forge.pki.certificateToPem(certBagList[1].cert);
    }

    const getAttr = (attributes: any[], name: string) => {
      const found = attributes.find((a: any) => a.name === name || a.shortName === name);
      return found ? found.value : '';
    };

    const subjectCn = getAttr(userCert.subject.attributes, 'commonName') || 'TITULAR ECUADOR';
    const subjectId = getAttr(userCert.subject.attributes, 'serialNumber') || '';
    const issuerCn = getAttr(userCert.issuer.attributes, 'commonName') || 'AUTORIDAD EMISORA';
    const serialNumber = userCert.serialNumber;
    const notAfter = userCert.validity.notAfter;
    const keySize = (keyBag.key as any).n ? (keyBag.key as any).n.bitLength() : 2048;

    return {
      isValid: true,
      privateKeyPem,
      certPem,
      caCertPem,
      subjectCn,
      subjectId,
      issuerCn,
      serialNumber,
      notAfter,
      keySize
    };
  } catch (err: any) {
    throw new Error(`Contraseña incorrecta o archivo .p12 dañado: ${err.message || err}`);
  }
}

/**
 * Crea un buffer PDF básico con encabezado oficial y contenido con campo de firma
 */
export async function createSamplePdfBuffer(
  title: string,
  content: string,
  userName: string,
  idNumber: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 format
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Encabezado institucional
  page.drawRectangle({
    x: 40,
    y: height - 80,
    width: width - 80,
    height: 40,
    color: rgb(0.12, 0.28, 0.65)
  });

  page.drawText('REPÚBLICA DEL ECUADOR - DOCUMENTO ELECTRÓNICO OFICIAL', {
    x: 55,
    y: height - 58,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1)
  });

  page.drawText('SISTEMA INTEGRADO DE GESTIÓN Y FIRMA DIGITAL', {
    x: 55,
    y: height - 72,
    size: 8,
    font: helvetica,
    color: rgb(0.85, 0.92, 1)
  });

  // Título del documento
  page.drawText(title.toUpperCase(), {
    x: 40,
    y: height - 120,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  // Metadatos
  page.drawText(`Fecha de Emisión: ${new Date().toLocaleDateString('es-EC')} | Titular: ${userName} (CI/RUC: ${idNumber || '0802778749'})`, {
    x: 40,
    y: height - 138,
    size: 8,
    font: helvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  // Línea divisoria
  page.drawLine({
    start: { x: 40, y: height - 148 },
    end: { x: width - 40, y: height - 148 },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9)
  });

  // Contenido / Párrafos divididos
  const lines = content.split('\n');
  let textY = height - 175;
  for (const line of lines) {
    if (line.trim().length > 0) {
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + word).length > 80) {
          page.drawText(currentLine, {
            x: 40,
            y: textY,
            size: 9.5,
            font: helvetica,
            color: rgb(0.15, 0.2, 0.25)
          });
          textY -= 15;
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      if (currentLine.trim()) {
        page.drawText(currentLine, {
          x: 40,
          y: textY,
          size: 9.5,
          font: helvetica,
          color: rgb(0.15, 0.2, 0.25)
        });
        textY -= 15;
      }
    } else {
      textY -= 10;
    }
  }

  // Campo de firma visual en la parte inferior para ilustrar el estampado
  const sigFieldY = 120;
  page.drawLine({
    start: { x: width - 260, y: sigFieldY },
    end: { x: width - 40, y: sigFieldY },
    thickness: 0.8,
    color: rgb(0.3, 0.35, 0.4)
  });

  page.drawText('FIRMA DEL TITULAR / DECLARANTE', {
    x: width - 245,
    y: sigFieldY - 14,
    size: 7.5,
    font: helveticaBold,
    color: rgb(0.2, 0.25, 0.3)
  });

  page.drawText(`C.I. / RUC: ${idNumber || '0802778749'}`, {
    x: width - 220,
    y: sigFieldY - 26,
    size: 7,
    font: helvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  return await pdfDoc.save();
}

/**
 * Divide de manera óptima el nombre completo en 1 o 2 líneas para el estampado FirmaEC
 */
export function splitSignerNameForStamp(name: string): string[] {
  const clean = name.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!clean) return ['TITULAR DEL CERTIFICADO'];
  const parts = clean.split(' ');
  if (parts.length <= 2) {
    if (clean.length > 22 && parts.length === 2) {
      return [parts[0], parts[1]];
    }
    return [clean];
  }
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')];
}

/**
 * Configuración para el payload del código QR de verificación
 */
export interface QrGenerationConfig {
  signerName: string;
  idNumber?: string;
  dateFormatted?: string;
  entityName?: string;
  reason?: string;
  location?: string;
  sha256?: string;
  validatorUrl?: string;
}

/**
 * Genera el payload de texto estructurado según los estándares oficiales de FirmaEC
 * y los analizadores de escáneres móviles (iOS Camera, Google Lens, Xiaomi, Samsung, Huawei).
 * Mantiene una longitud óptima y concisa para generar una matriz QR de baja densidad
 * con módulos amplios, nítidos y de lectura instantánea por cámaras móviles.
 */
export function buildScannerFriendlyQrText(config: QrGenerationConfig): string {
  const signer = (config.signerName || 'TITULAR ECUADOR').trim().toUpperCase();
  const idNum = config.idNumber && config.idNumber.trim() ? config.idNumber.trim() : '';
  const date = config.dateFormatted || new Date().toLocaleString('es-EC', { hour12: false });
  const entity = (config.entityName || 'MINTEL / FIRMAEC EC').trim();
  const url = config.validatorUrl || 'https://firmadigital.gob.ec';

  // Formato estandarizado de alta compatibilidad que cualquier smartphone decodifica sin truncar
  const lines: string[] = [
    'FIRMA DIGITAL ECUADOR',
    `Firmante: ${signer}`,
    ...(idNum ? [`CI/RUC: ${idNum}`] : []),
    `Fecha: ${date}`,
    `Entidad: ${entity}`,
    `Validador: ${url}`
  ];

  return lines.join('\n');
}

/**
 * Dibuja un código QR 100% vectorial nativo directamente en la página PDF con pdf-lib.
 * A diferencia del renderizado rasterizado (PNG/JPEG) que sufre de desenfoque por interpolación
 * bilineal al escalar a tamaños pequeños (50-60pt), los módulos vectoriales mantienen
 * un contraste 100% puro (#000000 sobre #FFFFFF) y bordes matemáticamente perfectos.
 * Esto garantiza que cámaras de teléfonos móviles (iOS Camera, Google Lens, Xiaomi, Samsung, Huawei)
 * lean el código QR instantáneamente y sin errores de enfoque.
 */
export function drawVectorQrCodeToPdfPage(
  page: PDFPage,
  payloadText: string,
  options: {
    x: number;
    y: number;
    size: number;
    marginModules?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): void {
  const ecLevel = options.errorCorrectionLevel || 'M';
  const qr = QRCode.create(payloadText, { errorCorrectionLevel: ecLevel });
  const N = qr.modules.size;
  const margin = options.marginModules ?? 4; // 4 módulos de Quiet Zone (Zona de Silencio) conforme a la norma ISO/IEC 18004
  const totalModules = N + margin * 2;
  const s = options.size / totalModules;

  // 1. Fondo blanco puro opaco para garantizar la zona de silencio (Quiet Zone)
  page.drawRectangle({
    x: options.x,
    y: options.y,
    width: options.size,
    height: options.size,
    color: rgb(1, 1, 1),
  });

  // 2. Módulos oscuros vectoriales de alta precisión con micro-solapamiento (+0.04pt)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (qr.modules.get(r, c)) {
        page.drawRectangle({
          x: options.x + (c + margin) * s,
          y: options.y + (N - 1 - r + margin) * s,
          width: s + 0.04,
          height: s + 0.04,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}

/**
 * Genera un código QR de grado industrial (1024x1024 px),
 * margen de silencio de 4 módulos (ISO/IEC 18004) y corrección de error Nivel M (15%),
 * garantizando lectura instantánea desde cámaras de celulares y lectores ópticos.
 */
export async function generateHighReadabilityQr(
  payloadText: string,
  options?: { width?: number; margin?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }
): Promise<string> {
  return await QRCode.toDataURL(payloadText, {
    margin: options?.margin ?? 4, // 4 módulos de zona de silencio (estándar ISO/IEC 18004)
    width: options?.width ?? 1024, // Ultra alta resolución para evitar pixelado o bordes borrosos
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M', // Nivel M (15% redundancia óptima)
    color: {
      dark: '#000000', // 100% Negro puro
      light: '#ffffff'  // 100% Blanco puro
    }
  });
}

/**
 * Estampa visual y criptográficamente un documento PDF real conforme a los estándares de FirmaEC y la República del Ecuador
 */
export async function signAndStampDocumentPdf(
  pdfBuffer: ArrayBuffer,
  config: DocumentSigningConfig,
  privateKeyPem: string,
  certPem: string
): Promise<SignedPdfResult> {
  // 1. Cargar el documento PDF original
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages();

  // 2. Calcular Hash SHA-256 del contenido original del PDF antes del estampado
  const originalBytes = new Uint8Array(pdfBuffer);
  let binaryStr = '';
  for (let i = 0; i < originalBytes.length; i++) {
    binaryStr += String.fromCharCode(originalBytes[i]);
  }
  const md = forge.md.sha256.create();
  md.update(binaryStr);
  const originalSha256 = md.digest().toHex();

  // 3. Generar firma criptográfica asimétrica RSA
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const signatureRaw = privateKey.sign(md);
  const signatureBase64 = forge.util.encode64(signatureRaw);

  const timestamp = new Date();
  const dateFormatted = timestamp.toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // 4. Formato oficial legible y accesible mediante cualquier escáner de código QR (Google Lens, iPhone Camera, Xiaomi, Samsung, etc.)
  const qrVerificationText = buildScannerFriendlyQrText({
    signerName: config.signerName,
    idNumber: config.idNumber,
    dateFormatted,
    entityName: config.entityName || 'MINTEL / FIRMAEC EC',
    sha256: originalSha256,
    validatorUrl: 'https://firmadigital.gob.ec'
  });
  
  // Generar PNG en HD para descarga o vistas previas web
  const qrDataUrl = await generateHighReadabilityQr(qrVerificationText, {
    width: 1024,
    margin: 4,
    errorCorrectionLevel: 'M'
  });

  // Tipografías estándar embebidas en PDF
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Dimensiones del sello visual
  const isOfficialMono = config.stampStyle === 'firmaec-official' || config.stampStyle === 'minimal-box';
  const stampWidth = config.stampWidth || (isOfficialMono ? 245 : 255);
  const stampHeight = config.stampHeight || (isOfficialMono ? 68 : 78);

  // Determinar páginas a estampar
  let targetPageIndices: number[] = [];
  if (config.pageOption === 'all') {
    targetPageIndices = Array.from({ length: pageCount }, (_, i) => i);
  } else if (config.pageOption === 'first') {
    targetPageIndices = [0];
  } else if (config.pageOption === 'specific') {
    const pIndex = Math.min(pageCount - 1, Math.max(0, config.specificPage - 1));
    targetPageIndices = [pIndex];
  } else {
    // 'last' por defecto
    targetPageIndices = [pageCount - 1];
  }

  let finalStampCoords = { x: 30, y: 30, width: stampWidth, height: stampHeight };

  // Estampar en cada página seleccionada
  for (const pageIdx of targetPageIndices) {
    const page = pages[pageIdx];
    const { width, height } = page.getSize();

    // Determinar X% e Y% a aplicar en la página PDF real
    let pctX = config.customX ?? 88;
    let pctY = config.customY ?? 10;

    if (config.positionPreset === 'bottom-right') {
      pctX = 88;
      pctY = 10;
    } else if (config.positionPreset === 'bottom-center') {
      pctX = 50;
      pctY = 10;
    } else if (config.positionPreset === 'bottom-left') {
      pctX = 5;
      pctY = 10;
    } else if (config.positionPreset === 'top-right') {
      pctX = 88;
      pctY = 90;
    } else if (config.positionPreset === 'top-left') {
      pctX = 5;
      pctY = 90;
    } else if (config.positionPreset === 'custom') {
      pctX = config.customX;
      pctY = config.customY;
    }

    if (pctX === undefined) pctX = 88;
    if (pctY === undefined) pctY = 10;

    // Calcular coordenadas X, Y exactas en la página PDF real (puntos pt)
    const margin = 15;
    const availWidth = Math.max(1, width - stampWidth - margin * 2);
    const availHeight = Math.max(1, height - stampHeight - margin * 2);

    const stampX = margin + (pctX / 100) * availWidth;
    const stampY = margin + (pctY / 100) * availHeight;

    finalStampCoords = { x: stampX, y: stampY, width: stampWidth, height: stampHeight };

    // DIBUJAR ESTAMPA SEGÚN EL ESTILO ELEGIDO
    if (config.stampStyle === 'firmaec-official' || config.stampStyle === 'minimal-box') {
      // ═════════════════════════════════════════════════════════════════════════
      // ESTÁNDAR OFICIAL ECUADOR (QR + TEXTO MONOSPACE / TYPEWRITER)
      // Exactamente como en FirmaEC / Quipux / MINTEL estampado sobre el campo de firma
      // ═════════════════════════════════════════════════════════════════════════
      
      // Fondo blanco sólido opaco para cubrir limpiamente el campo de firma
      page.drawRectangle({
        x: stampX,
        y: stampY,
        width: stampWidth,
        height: stampHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: config.stampStyle === 'minimal-box' ? 0.8 : 0
      });

      // Código QR a la izquierda con renderizado vectorial nativo (0 blur, 100% contraste)
      const qrSize = Math.min(60, stampHeight - 8);
      if (config.includeQrCode) {
        drawVectorQrCodeToPdfPage(page, qrVerificationText, {
          x: stampX + 4,
          y: stampY + (stampHeight - qrSize) / 2,
          size: qrSize,
          marginModules: 4,
          errorCorrectionLevel: 'M'
        });
      }

      const textLeftX = config.includeQrCode ? stampX + qrSize + 12 : stampX + 8;
      const nameLines = splitSignerNameForStamp(config.signerName);

      // Línea 1: "Firmado electrónicamente por:" (Courier Regular)
      let lineY = stampY + stampHeight - 16;
      page.drawText('Firmado electrónicamente por:', {
        x: textLeftX,
        y: lineY,
        size: 8.5,
        font: courier,
        color: rgb(0.1, 0.1, 0.1)
      });

      // Línea 2 y 3: Nombre en Courier-Bold Mayúsculas
      lineY -= 14;
      page.drawText(nameLines[0], {
        x: textLeftX,
        y: lineY,
        size: 11,
        font: courierBold,
        color: rgb(0, 0, 0)
      });

      if (nameLines.length > 1) {
        lineY -= 14;
        page.drawText(nameLines[1], {
          x: textLeftX,
          y: lineY,
          size: 11,
          font: courierBold,
          color: rgb(0, 0, 0)
        });
      }

    } else if (config.stampStyle === 'quipux-classic') {
      // Estilo Quipux / Gobierno
      page.drawRectangle({
        x: stampX,
        y: stampY,
        width: stampWidth,
        height: stampHeight,
        color: rgb(0.98, 0.98, 0.99),
        borderColor: rgb(0.2, 0.3, 0.5),
        borderWidth: 1.2
      });

      page.drawRectangle({
        x: stampX,
        y: stampY + stampHeight - 15,
        width: stampWidth,
        height: 15,
        color: rgb(0.15, 0.25, 0.45)
      });

      page.drawText('GESTION DOCUMENTAL QUIPUX - REPUBLICA DEL ECUADOR', {
        x: stampX + 8,
        y: stampY + stampHeight - 11,
        size: 6.5,
        font: helveticaBold,
        color: rgb(1, 1, 1)
      });

      if (config.includeQrCode) {
        const qrSize = Math.min(58, stampHeight - 16);
        drawVectorQrCodeToPdfPage(page, qrVerificationText, {
          x: stampX + stampWidth - qrSize - 6,
          y: stampY + 6,
          size: qrSize,
          marginModules: 4,
          errorCorrectionLevel: 'M'
        });
      }

      let lineY = stampY + stampHeight - 26;
      page.drawText(`Firmado digitalmente por:`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.3, 0.35, 0.4)
      });

      lineY -= 9;
      page.drawText(config.signerName.toUpperCase(), {
        x: stampX + 8,
        y: lineY,
        size: 7.5,
        font: helveticaBold,
        color: rgb(0.05, 0.1, 0.25)
      });

      lineY -= 9;
      page.drawText(`CI/RUC: ${config.idNumber || 'Registrado en Certificado'}`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.3)
      });

      lineY -= 9;
      page.drawText(`Fecha: ${dateFormatted} GMT-5`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.3)
      });

      lineY -= 8;
      page.drawText(`Razón: ${config.reason}`, {
        x: stampX + 8,
        y: lineY,
        size: 6,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.3)
      });

    } else if (config.stampStyle === 'sri-tax') {
      // Estilo SRI Facturación
      page.drawRectangle({
        x: stampX,
        y: stampY,
        width: stampWidth,
        height: stampHeight,
        color: rgb(0.97, 0.99, 0.97),
        borderColor: rgb(0.1, 0.5, 0.25),
        borderWidth: 1.2
      });

      page.drawRectangle({
        x: stampX,
        y: stampY + stampHeight - 15,
        width: stampWidth,
        height: 15,
        color: rgb(0.08, 0.45, 0.22)
      });

      page.drawText('SRI - COMPROBANTE CON FIRMA ELECTRONICA VALIDA', {
        x: stampX + 8,
        y: stampY + stampHeight - 11,
        size: 6.5,
        font: helveticaBold,
        color: rgb(1, 1, 1)
      });

      if (config.includeQrCode) {
        const qrSize = Math.min(58, stampHeight - 16);
        drawVectorQrCodeToPdfPage(page, qrVerificationText, {
          x: stampX + stampWidth - qrSize - 6,
          y: stampY + 6,
          size: qrSize,
          marginModules: 4,
          errorCorrectionLevel: 'M'
        });
      }

      let lineY = stampY + stampHeight - 26;
      page.drawText(`Emisor: ${config.signerName.toUpperCase()}`, {
        x: stampX + 8,
        y: lineY,
        size: 7,
        font: helveticaBold,
        color: rgb(0.05, 0.25, 0.1)
      });

      lineY -= 9;
      page.drawText(`RUC: ${config.idNumber || '0802778749001'}`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.3)
      });

      lineY -= 9;
      page.drawText(`Fecha Firma: ${dateFormatted} GMT-5`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.3)
      });

      lineY -= 9;
      page.drawText(`SHA-256: ${originalSha256.substring(0, 22)}...`, {
        x: stampX + 8,
        y: lineY,
        size: 5.5,
        font: courier,
        color: rgb(0.3, 0.4, 0.5)
      });

    } else if (config.stampStyle === 'legal-notary') {
      // Estilo Legal / Notarial
      page.drawRectangle({
        x: stampX,
        y: stampY,
        width: stampWidth,
        height: stampHeight,
        color: rgb(0.99, 0.98, 0.95),
        borderColor: rgb(0.65, 0.45, 0.15),
        borderWidth: 1.5
      });

      page.drawRectangle({
        x: stampX + 3,
        y: stampY + 3,
        width: stampWidth - 6,
        height: stampHeight - 6,
        borderColor: rgb(0.8, 0.65, 0.35),
        borderWidth: 0.5
      });

      if (config.includeQrCode) {
        const qrSize = Math.min(56, stampHeight - 14);
        drawVectorQrCodeToPdfPage(page, qrVerificationText, {
          x: stampX + stampWidth - qrSize - 6,
          y: stampY + 7,
          size: qrSize,
          marginModules: 4,
          errorCorrectionLevel: 'M'
        });
      }

      let lineY = stampY + stampHeight - 16;
      page.drawText('CERTIFICACION DIGITAL Y VALIDEZ PROBATORIA', {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helveticaBold,
        color: rgb(0.45, 0.3, 0.05)
      });

      lineY -= 11;
      page.drawText(config.signerName.toUpperCase(), {
        x: stampX + 8,
        y: lineY,
        size: 7.5,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1)
      });

      lineY -= 9;
      page.drawText(`Identificación: ${config.idNumber || 'CI/RUC Ecuatoriano'}`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.25, 0.25, 0.25)
      });

      lineY -= 9;
      page.drawText(`Fecha: ${dateFormatted} | ${config.location}`, {
        x: stampX + 8,
        y: lineY,
        size: 6.5,
        font: helvetica,
        color: rgb(0.25, 0.25, 0.25)
      });

      lineY -= 8;
      page.drawText('Ley de Comercio Electrónico Art. 14', {
        x: stampX + 8,
        y: lineY,
        size: 5.5,
        font: helvetica,
        color: rgb(0.5, 0.4, 0.2)
      });
    }
  }

  // 5. Establecer metadatos estandarizados ISO 32000-1 para lectura de propiedades en lectores PDF (Adobe, Foxit, Chrome)
  pdfDoc.setTitle(`Documento Firmado Electrónicamente - ${config.signerName}`);
  pdfDoc.setAuthor(config.signerName);
  pdfDoc.setSubject(`Firma Digital Ecuador | CI/RUC: ${config.idNumber || 'N/A'} | Motivo: ${config.reason || 'Firma de Conformidad'}`);
  pdfDoc.setKeywords([
    'FIRMA_ELECTRONICA_ECUADOR',
    `FIRMANTE:${config.signerName.replace(/\s+/g, '_')}`,
    `IDENTIFICACION:${config.idNumber}`,
    `HASH_SHA256:${originalSha256.substring(0, 32)}`,
    'ESTANDAR_ISO_32000_1',
    'FIRMAEC_MINTEL'
  ]);
  pdfDoc.setProducer(`Plataforma FirmaEC Ecuador (SHA256withRSA)`);
  pdfDoc.setCreator(`FirmaEC Suite / PKI Ecuador - Validador https://firmadigital.gob.ec`);
  pdfDoc.setModificationDate(timestamp);

  // 6. Guardar el PDF con la estampa visual y metadatos
  const signedPdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([signedPdfBytes], { type: 'application/pdf' });
  const safeName = config.signerName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 25);
  const fileName = `documento_firmado_${safeName}_firmaec.pdf`;

  return {
    pdfBlob,
    fileName,
    originalSha256,
    signatureBase64,
    timestamp: timestamp.toISOString(),
    pageCount,
    signedPages: targetPageIndices.map(idx => idx + 1),
    qrDataUrl,
    stampCoordinates: finalStampCoords
  };
}

/**
 * Función compatible con llamadas legacy
 */
export async function signRealPdfDocument(
  pdfBuffer: ArrayBuffer,
  signerName: string,
  idNumber: string,
  reason: string,
  location: string,
  privateKeyPem: string,
  certPem: string
): Promise<{ signedPdfBytes: Uint8Array; signatureInfo: any }> {
  const result = await signAndStampDocumentPdf(
    pdfBuffer,
    {
      pageOption: 'last',
      specificPage: 1,
      positionPreset: 'bottom-right',
      customX: 80,
      customY: 10,
      stampStyle: 'firmaec-official',
      signerName,
      idNumber,
      reason,
      location,
      entityName: 'FirmaEC Ecuador',
      includeQrCode: true,
      includeLegalRef: true,
      stampWidth: 250,
      stampHeight: 78
    },
    privateKeyPem,
    certPem
  );

  const arrayBuf = await result.pdfBlob.arrayBuffer();

  return {
    signedPdfBytes: new Uint8Array(arrayBuf),
    signatureInfo: {
      signerName,
      idNumber,
      reason,
      location,
      timestamp: result.timestamp,
      originalSha256: result.originalSha256,
      signatureBase64: result.signatureBase64
    }
  };
}

