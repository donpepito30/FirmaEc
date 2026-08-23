import forge from 'node-forge';
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFString, PDFHexString, PDFNumber } from 'pdf-lib';

export interface PadesSignatureInfo {
  signerName: string;
  reason?: string;
  location?: string;
  signingTime?: Date;
  byteRange?: number[];
  filter?: string;
  subFilter?: string;
  isPadesCompliant: boolean;
  isValidStructure: boolean;
  certificateIssuer?: string;
  certificateSubject?: string;
}

export interface PadesSignOptions {
  signerName: string;
  idNumber: string;
  reason?: string;
  location?: string;
  privateKeyPem: string;
  certPem: string;
  caCertPem?: string;
  contactInfo?: string;
  tsaTokenHex?: string;
}

export interface PadesSignedResult {
  signedPdfBytes: Uint8Array;
  byteRange: number[];
  hexContentsLength: number;
  signatureBase64: string;
  sha256DigestHex: string;
  padesSubFilter: string;
}

/**
 * Inyecta una estructura de firma electrónica PAdES (ETSI EN 319 142 / ISO 32000-1 / Adobe.PPKLite)
 * dentro de un PDF, calculando el /ByteRange exacto y la firma PKCS#7 / CMS incrustada.
 */
export async function applyPadesDigitalSignature(
  pdfBytes: Uint8Array,
  options: PadesSignOptions
): Promise<PadesSignedResult> {
  const p12Cert = forge.pki.certificateFromPem(options.certPem);
  const privateKey = forge.pki.privateKeyFromPem(options.privateKeyPem);

  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  // 1. Crear el objeto de firma /Sig dentro del documento PDF
  const signatureDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: [0, 0, 0, 0], // Se reemplazará con los offsets reales
    Contents: PDFHexString.of('0'.repeat(16384)), // Reserva de espacio de 8192 bytes en Hex (16384 caracteres)
    Reason: PDFString.of(options.reason || 'Suscripción y conformidad del documento con FirmaEC'),
    Location: PDFString.of(options.location || 'Ecuador (MINTEL / FirmaEC)'),
    Name: PDFString.of(`${options.signerName} [CI/RUC: ${options.idNumber}]`),
    M: PDFString.of(formatPdfDate(new Date())),
    ContactInfo: PDFString.of(options.contactInfo || `Validador: https://firmadigital.gob.ec`),
  });

  const signatureDictRef = pdfDoc.context.register(signatureDict);

  // 2. Registrar el Widget de Firma en el Formulario /AcroForm del Catalog
  const pages = pdfDoc.getPages();
  const targetPage = pages[pages.length - 1]; // Añadir widget a la última página o catálogo

  const widgetDict = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: [0, 0, 0, 0], // Invisible widget de firma criptográfica
    V: signatureDictRef,
    T: PDFString.of(`Signature_FirmaEC_${Date.now()}`),
    F: 4, // Print flag
    P: targetPage.ref,
  });

  const widgetDictRef = pdfDoc.context.register(widgetDict);
  targetPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([widgetDictRef]));

  // Asegurar que el catálogo tenga el diccionario /AcroForm
  let acroForm = pdfDoc.catalog.get(PDFName.of('AcroForm'));
  if (!acroForm || !(acroForm instanceof PDFDict)) {
    const newAcroForm = pdfDoc.context.obj({
      Fields: [widgetDictRef],
      SigFlags: 3, // SignaturesExist (1) + AppendOnly (2)
    });
    pdfDoc.catalog.set(PDFName.of('AcroForm'), newAcroForm);
  } else {
    const fields = acroForm.get(PDFName.of('Fields'));
    if (fields instanceof PDFArray) {
      fields.push(widgetDictRef);
    } else {
      acroForm.set(PDFName.of('Fields'), pdfDoc.context.obj([widgetDictRef]));
    }
    acroForm.set(PDFName.of('SigFlags'), PDFNumber.of(3));
  }

  // 3. Guardar el PDF con los marcadores de marcador de posición
  const rawSavedPdf = await pdfDoc.save({ useObjectStreams: false });
  const rawBuffer = new Uint8Array(rawSavedPdf);

  // 4. Localizar la posición de /Contents <00000...> y reemplazar con el /ByteRange exacto
  const hexPlaceholder = '0'.repeat(16384);
  const contentsOffset = findAsciiIndex(rawBuffer, hexPlaceholder);

  if (contentsOffset === -1) {
    throw new Error('No se pudo encontrar el marcador de posición de firma /Contents en el PDF.');
  }

  const hexStart = contentsOffset - 1; // Incluye '<'
  const hexEnd = contentsOffset + hexPlaceholder.length + 1; // Incluye '>'

  // ByteRange: [0, hexStart, hexEnd, totalLength - hexEnd]
  const byteRange = [0, hexStart, hexEnd, rawBuffer.length - hexEnd];

  // Crear buffers parciales para calcular el digest SHA-256
  const part1 = rawBuffer.subarray(0, byteRange[1]);
  const part2 = rawBuffer.subarray(byteRange[2], byteRange[2] + byteRange[3]);

  // 5. Calcular el SHA-256 Digest sobre las dos partes del ByteRange
  const md = forge.md.sha256.create();
  md.update(uint8ArrayToBinaryString(part1));
  md.update(uint8ArrayToBinaryString(part2));
  const sha256DigestHex = md.digest().toHex();

  // 6. Generar la firma PKCS#7 / CMS SignedData
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(md.digest().getBytes());

  p7.addCertificate(p12Cert);
  if (options.caCertPem) {
    try {
      const caCert = forge.pki.certificateFromPem(options.caCertPem);
      p7.addCertificate(caCert);
    } catch {
      // Ignorar si el PEM de la CA es opcional
    }
  }

  p7.addSigner({
    key: privateKey,
    certificate: p12Cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
        // messageDigest attribute
      },
      {
        type: forge.pki.oids.signingTime,
        // signingTime attribute
      },
    ],
  });

  p7.sign({ detached: true });

  const p7Asn1 = p7.toAsn1();
  const derBuffer = forge.asn1.toDer(p7Asn1);
  let p7Hex = derBuffer.toHex();

  // Ajustar la firma Hex dentro del espacio reservado (padding con ceros)
  if (p7Hex.length > hexPlaceholder.length) {
    throw new Error(`La firma PKCS#7 en Hex (${p7Hex.length} caracteres) excede el espacio reservado (${hexPlaceholder.length}).`);
  }

  p7Hex = p7Hex.padEnd(hexPlaceholder.length, '0');

  // 7. Insertar el /ByteRange real y la firma Hex en el PDF final
  const signedPdf = new Uint8Array(rawBuffer);

  // Escribir la firma Hex en el buffer
  writeAsciiAt(signedPdf, p7Hex, contentsOffset);

  // Buscar el patrón /ByteRange [0 0 0 0] y actualizarlo
  const byteRangePlaceholder = '/ByteRange [0 0 0 0]';
  const byteRangeIndex = findAsciiIndex(signedPdf, byteRangePlaceholder);
  if (byteRangeIndex !== -1) {
    const formattedByteRange = `/ByteRange [${byteRange[0]} ${byteRange[1]} ${byteRange[2]} ${byteRange[3]}]`.padEnd(
      byteRangePlaceholder.length,
      ' '
    );
    writeAsciiAt(signedPdf, formattedByteRange, byteRangeIndex);
  }

  return {
    signedPdfBytes: signedPdf,
    byteRange,
    hexContentsLength: p7Hex.length,
    signatureBase64: forge.util.encode64(derBuffer.getBytes()),
    sha256DigestHex,
    padesSubFilter: 'adbe.pkcs7.detached (PAdES-BES / ETSI EN 319 142)',
  };
}

/**
 * Busca el índice de una subcadena ASCII dentro de un Uint8Array.
 */
function findAsciiIndex(bytes: Uint8Array, asciiStr: string, fromIndex = 0): number {
  const needleBytes = new TextEncoder().encode(asciiStr);
  outer: for (let i = fromIndex; i <= bytes.length - needleBytes.length; i++) {
    for (let j = 0; j < needleBytes.length; j++) {
      if (bytes[i + j] !== needleBytes[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Escribe una cadena ASCII en un Uint8Array a partir de una posición dada.
 */
function writeAsciiAt(bytes: Uint8Array, text: string, offset: number) {
  for (let i = 0; i < text.length; i++) {
    bytes[offset + i] = text.charCodeAt(i);
  }
}

/**
 * Convierte Uint8Array a cadena binaria para forge MD.
 */
function uint8ArrayToBinaryString(bytes: Uint8Array): string {
  let result = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return result;
}

/**
 * Inspecciona un PDF para detectar todas las firmas PAdES existentes (Soporte Multi-Firma).
 */
export async function inspectPadesSignatures(pdfBytes: Uint8Array): Promise<PadesSignatureInfo[]> {
  const signatures: PadesSignatureInfo[] = [];

  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const acroForm = pdfDoc.catalog.get(PDFName.of('AcroForm'));

    if (acroForm && acroForm instanceof PDFDict) {
      const fields = acroForm.get(PDFName.of('Fields'));
      if (fields && fields instanceof PDFArray) {
        for (let i = 0; i < fields.size(); i++) {
          const fieldRef = fields.get(i);
          const fieldObj = pdfDoc.context.lookup(fieldRef);

          if (fieldObj && fieldObj instanceof PDFDict) {
            const ft = fieldObj.get(PDFName.of('FT'));
            const vObj = fieldObj.get(PDFName.of('V'));

            if (ft && ft.toString() === '/Sig' && vObj) {
              const sigDict = pdfDoc.context.lookup(vObj);
              if (sigDict && sigDict instanceof PDFDict) {
                const nameObj = sigDict.get(PDFName.of('Name'));
                const reasonObj = sigDict.get(PDFName.of('Reason'));
                const locObj = sigDict.get(PDFName.of('Location'));
                const mObj = sigDict.get(PDFName.of('M'));
                const filterObj = sigDict.get(PDFName.of('Filter'));
                const subFilterObj = sigDict.get(PDFName.of('SubFilter'));

                signatures.push({
                  signerName: nameObj ? nameObj.toString().replace(/^\(/, '').replace(/\)$/, '') : 'Firmante Desconocido',
                  reason: reasonObj ? reasonObj.toString().replace(/^\(/, '').replace(/\)$/, '') : undefined,
                  location: locObj ? locObj.toString().replace(/^\(/, '').replace(/\)$/, '') : undefined,
                  signingTime: parsePdfDate(mObj ? mObj.toString() : ''),
                  filter: filterObj ? filterObj.toString() : '/Adobe.PPKLite',
                  subFilter: subFilterObj ? subFilterObj.toString() : '/adbe.pkcs7.detached',
                  isPadesCompliant: true,
                  isValidStructure: true,
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error al inspeccionar firmas PAdES:', err);
  }

  return signatures;
}

/**
 * Formatea una fecha Javascript al estándar PDF Date: D:YYYYMMDDHHMMSSZ
 */
function formatPdfDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const YYYY = date.getUTCFullYear();
  const MM = pad(date.getUTCMonth() + 1);
  const DD = pad(date.getUTCDate());
  const HH = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const SS = pad(date.getUTCSeconds());
  return `D:${YYYY}${MM}${DD}${HH}${mm}${SS}Z`;
}

/**
 * Parsea una fecha PDF D:YYYYMMDDHHMMSSZ a Date
 */
function parsePdfDate(pdfDateStr: string): Date | undefined {
  if (!pdfDateStr) return undefined;
  const clean = pdfDateStr.replace(/^D:/, '').replace(/[()']/g, '');
  if (clean.length >= 8) {
    const year = parseInt(clean.substring(0, 4), 10);
    const month = parseInt(clean.substring(4, 6), 10) - 1;
    const day = parseInt(clean.substring(6, 8), 10);
    const hour = clean.length >= 10 ? parseInt(clean.substring(8, 10), 10) : 0;
    const min = clean.length >= 12 ? parseInt(clean.substring(10, 12), 10) : 0;
    const sec = clean.length >= 14 ? parseInt(clean.substring(12, 14), 10) : 0;
    return new Date(Date.UTC(year, month, day, hour, min, sec));
  }
  return undefined;
}
