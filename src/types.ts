export interface P12GenerateOptions {
  fullName: string;
  idNumber: string; // Cédula o RUC
  email: string;
  city: string;
  organization: string;
  country: string; // 'EC'
  validityYears: number; // 1, 2, 3, 5
  keySize: 2048 | 4096;
  password: string;
  purpose: 'testing' | 'sri_test' | 'quipux_demo' | 'pdf_sign' | 'dev_test' | 'firmaec_prod';
  caAuthority?: 'firmaec_mintel' | 'bce' | 'security_data' | 'icert_judicatura' | 'uanataca' | 'custom';
}

export interface GeneratedP12Result {
  fileName: string;
  p12Blob: Blob;
  p12Base64: string;
  certPem: string;
  caCertPem: string;
  subCaCertPem?: string;
  privateKeyPem: string;
  publicKeyPem: string;
  serialNumber: string;
  sha256Fingerprint: string;
  sha1Fingerprint: string;
  subject: {
    cn: string;
    o: string;
    c: string;
    ou: string;
    serialNumber?: string;
    email?: string;
  };
  issuer: {
    cn: string;
    o: string;
    c: string;
    ou?: string;
  };
  notBefore: Date;
  notAfter: Date;
  keySize: number;
  password: string;
  caAuthorityName: string;
}

export interface FirmaECTestCheck {
  id: string;
  name: string;
  category: 'container' | 'crypto' | 'x509' | 'policy' | 'signature';
  status: 'passed' | 'failed' | 'warning';
  detail: string;
  standardRef: string;
}

export interface P12InspectionResult {
  isValid: boolean;
  error?: string;
  subject: string;
  commonName: string;
  identification?: string;
  issuer: string;
  issuerCommonName: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  isExpired: boolean;
  daysRemaining: number;
  sha256Fingerprint: string;
  keyAlgorithm: string;
  keySize?: number;
  keyUsages: string[];
  isAuthorizedEntity: boolean;
  authorizedEntityName?: string;
  certPem: string;
}

export interface OfficialEntity {
  id: string;
  name: string;
  accreditedBy: string;
  type: 'Público' | 'Privado';
  website: string;
  price1Year: string;
  price5Years: string;
  formats: ('Archivo .p12' | 'Token USB Criptográfico' | 'En la Nube')[];
  issuanceTime: string;
  requirements: string[];
  description: string;
  bestFor: string;
  badge?: string;
}

export interface IessTramite {
  id: string;
  title: string;
  category: 'Afiliados' | 'Jubilados' | 'Empleadores' | 'Salud' | 'Préstamos' | 'Firma Electrónica';
  summary: string;
  requirements: string[];
  steps: string[];
  officialUrl: string;
  timeEstimate: string;
  cost: string;
  tags: string[];
}

export interface StampPositionPreset {
  id: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'custom';
  name: string;
  description: string;
}

export type StampStyleType = 'firmaec-official' | 'quipux-classic' | 'sri-tax' | 'legal-notary' | 'minimal-box';

export interface DocumentSigningConfig {
  pageOption: 'last' | 'first' | 'all' | 'specific';
  specificPage: number;
  positionPreset: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'custom';
  customX: number; // 0 to 100 percentage or points
  customY: number; // 0 to 100 percentage or points
  stampStyle: StampStyleType;
  signerName: string;
  idNumber: string;
  reason: string;
  location: string;
  entityName: string;
  includeQrCode: boolean;
  includeLegalRef: boolean;
  stampWidth: number;
  stampHeight: number;
  enablePadesDictionary?: boolean;
  enableTsaTimestamp?: boolean;
  tsaServerId?: string;
  enableOcspCheck?: boolean;
}

export interface SignedPdfResult {
  pdfBlob: Blob;
  fileName: string;
  originalSha256: string;
  signatureBase64: string;
  timestamp: string;
  pageCount: number;
  signedPages: number[];
  qrDataUrl: string;
  stampCoordinates: { x: number; y: number; width: number; height: number };
  padesInfo?: {
    byteRange: number[];
    padesSubFilter: string;
    isPadesCompliant: boolean;
  };
  tsaInfo?: {
    tsaName: string;
    timestampFormattedEcuador: string;
    serialNumber: string;
    isOfficialEcuadorTsa: boolean;
  };
  ocspInfo?: {
    status: 'good' | 'revoked' | 'unknown';
    eciName: string;
    isArcotelAccredited: boolean;
    details: string[];
  };
  previousSignaturesCount?: number;
}

import { GeminiDocumentAnalysis } from './services/geminiProcessor';

export interface UploadedDocumentInfo {
  name: string;
  size: number;
  type: string; // 'application/pdf' | 'image/png' | 'image/jpeg' | 'text/plain'
  buffer: ArrayBuffer;
  pageCount: number;
  previewDataUrl?: string;
  isConvertedToPdf: boolean;
  geminiAnalysis?: GeminiDocumentAnalysis;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}


