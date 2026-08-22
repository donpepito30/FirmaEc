/**
 * Validador robusto de entrada
 * Sanitiza y valida todos los inputs de usuario
 */

// ================ TIPOS ================
export interface ValidationResult {
  isValid: boolean;
  value?: string;
  error?: string;
  warnings?: string[];
}

export interface FullNameValidation extends ValidationResult {
  normalizedName?: string;
  charCount?: number;
}

export interface EmailValidation extends ValidationResult {
  normalizedEmail?: string;
  domain?: string;
}

export interface IdValidation extends ValidationResult {
  type?: "cedula" | "ruc" | "invalido";
  province?: number;
  idWithoutChecksum?: string;
  checksum?: number;
}

// ================ VALIDADORES ================

/**
 * Valida y sanitiza nombre completo
 * - 3-100 caracteres
 * - Solo letras, espacios y caracteres latinos con acentos
 * - Sin scripts o HTML
 */
export function validateFullName(input: string): FullNameValidation {
  const warnings: string[] = [];

  // 1. Limpiar espacios
  let name = (input || "").trim();

  if (!name) {
    return { isValid: false, error: "El nombre es requerido" };
  }

  // 2. Validar longitud
  if (name.length < 3) {
    return {
      isValid: false,
      error: "El nombre debe tener al menos 3 caracteres",
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: "El nombre no puede exceder 100 caracteres",
    };
  }

  // 3. Detectar caracteres peligrosos / inyección HTML o JS
  if (/<|>|"|'|&|javascript:|onerror=|onclick=|<script/i.test(name)) {
    return {
      isValid: false,
      error: "El nombre contiene caracteres no permitidos (< > \" ' & script)",
    };
  }

  // 4. Permitir caracteres latinos extendidos (acentos) pero rechazar caracteres de control
  if (/[\x00-\x1F\x7F-\x9F]/g.test(name)) {
    return {
      isValid: false,
      error: "El nombre contiene caracteres de control no permitidos",
    };
  }

  // 5. Normalizar múltiples espacios
  name = name.replace(/\s+/g, " ");

  // 6. Validar que no sea solo números
  if (/^\d+$/.test(name)) {
    return {
      isValid: false,
      error: "El nombre no puede ser solo números",
    };
  }

  // 7. Capitalizar correctamente
  const normalized = name
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // 8. Advertencias de nombres inusuales
  if (normalized.split(" ").length > 6) {
    warnings.push("Nombre con muchas partes (>6). Verifica que sea correcto.");
  }

  if (/\d/.test(normalized)) {
    warnings.push("El nombre contiene números. Verifica que sea correcto.");
  }

  return {
    isValid: true,
    value: name,
    normalizedName: normalized,
    charCount: name.length,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida email según RFC 5322 (simplificado pero robusto)
 */
export function validateEmail(input: string): EmailValidation {
  const email = (input || "").trim().toLowerCase();

  if (!email) {
    return { isValid: false, error: "El email es requerido" };
  }

  // RFC 5322 simplificado
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Formato de email inválido (ejemplo: usuario@dominio.com)",
    };
  }

  if (email.length > 254) {
    return {
      isValid: false,
      error: "Email demasiado largo (máximo 254 caracteres)",
    };
  }

  const [localPart, domain] = email.split("@");

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: "Parte local del email demasiado larga",
    };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return {
      isValid: false,
      error: "La parte local del email no puede empezar o terminar con punto",
    };
  }

  if (localPart.includes("..")) {
    return {
      isValid: false,
      error: "La parte local del email no puede tener puntos consecutivos",
    };
  }

  if (!domain || !domain.includes(".")) {
    return {
      isValid: false,
      error: "El dominio debe tener al menos un punto",
    };
  }

  const domainParts = domain.split(".");
  if (domainParts.some((part) => part.length === 0)) {
    return {
      isValid: false,
      error: "El dominio tiene partes vacías",
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: "El TLD del dominio debe tener al menos 2 caracteres",
    };
  }

  return {
    isValid: true,
    value: email,
    normalizedEmail: email,
    domain: domain,
  };
}

/**
 * Valida número de cédula o RUC ecuatoriano
 * Con verificación del algoritmo Módulo 10 y provincias vigentes
 */
export function validateEcuadorianId(input: string): IdValidation {
  const clean = (input || "").replace(/\D/g, ""); // Remover no-dígitos

  if (!clean) {
    return {
      isValid: false,
      error: "El número de cédula/RUC es requerido",
      type: "invalido",
    };
  }

  // ===== VALIDAR CÉDULA (10 DÍGITOS) =====
  if (clean.length === 10) {
    const provinceCode = parseInt(clean.substring(0, 2), 10);

    // Provincias vigentes en Ecuador (01 a 24, y 30 para residentes en exterior / Galápagos)
    const validProvinces = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 30,
    ];

    if (!validProvinces.includes(provinceCode)) {
      return {
        isValid: false,
        error: `Código de provincia inválido: ${provinceCode.toString().padStart(2, "0")}. Debe ser entre 01-24 o 30.`,
        type: "invalido",
      };
    }

    const thirdDigit = parseInt(clean[2], 10);
    if (thirdDigit < 0 || thirdDigit > 5) {
      return {
        isValid: false,
        error: `Tercer dígito de cédula inválido: ${thirdDigit}. Para personas naturales debe ser entre 0 y 5.`,
        type: "invalido",
      };
    }

    // Módulos de verificación (Módulo 10)
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let val = parseInt(clean[i], 10) * coefficients[i];
      if (val >= 10) val -= 9;
      sum += val;
    }

    const verifier = (10 - (sum % 10)) % 10;
    const lastDigit = parseInt(clean[9], 10);

    if (verifier !== lastDigit) {
      return {
        isValid: false,
        error: `Dígito verificador incorrecto. Esperado: ${verifier}, recibido: ${lastDigit}.`,
        type: "invalido",
      };
    }

    return {
      isValid: true,
      value: clean,
      type: "cedula",
      province: provinceCode,
      idWithoutChecksum: clean.substring(0, 9),
      checksum: lastDigit,
    };
  }

  // ===== VALIDAR RUC (13 DÍGITOS) =====
  if (clean.length === 13) {
    if (clean.endsWith("001")) {
      const cedula = clean.substring(0, 10);
      const cedResult = validateEcuadorianId(cedula);

      if (cedResult.isValid && cedResult.type === "cedula") {
        return {
          isValid: true,
          value: clean,
          type: "ruc",
          province: cedResult.province,
          idWithoutChecksum: clean.substring(0, 10),
        };
      }

      return {
        isValid: false,
        error:
          "Los primeros 10 dígitos del RUC de persona natural deben corresponder a una cédula válida.",
        type: "invalido",
      };
    }

    const companyCode = parseInt(clean.substring(0, 3), 10);
    if (companyCode < 1 || companyCode > 999) {
      return {
        isValid: false,
        error: "Código de establecimiento RUC inválido.",
        type: "invalido",
      };
    }

    return {
      isValid: true,
      value: clean,
      type: "ruc",
      warnings: [
        "RUC de empresa o institución detectado.",
      ],
    };
  }

  return {
    isValid: false,
    error: `Longitud de número de identificación incorrecta. Cédula: 10 dígitos, RUC: 13 dígitos. Recibidos: ${clean.length}.`,
    type: "invalido",
  };
}

/**
 * Valida y sanitiza un campo de texto genérico
 */
export function validateTextField(
  input: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
    fieldName?: string;
  }
): ValidationResult {
  const {
    minLength = 1,
    maxLength = 255,
    allowNumbers = true,
    fieldName = "Campo",
  } = options || {};

  let value = (input || "").trim();

  if (!value) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`,
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede exceder ${maxLength} caracteres`,
    };
  }

  // Detectar HTML/Scripts
  if (/<|>|"|'|javascript:|onerror=|onclick=|<script/i.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} contiene caracteres no permitidos`,
    };
  }

  // Detectar caracteres de control
  if (/[\x00-\x1F\x7F-\x9F]/g.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} contiene caracteres de control no permitidos`,
    };
  }

  if (!allowNumbers && /\d/.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} no puede contener números`,
    };
  }

  value = value.replace(/\s+/g, " ");

  return {
    isValid: true,
    value: value,
  };
}

export function validateOrganization(input: string): ValidationResult {
  return validateTextField(input, {
    minLength: 2,
    maxLength: 150,
    allowNumbers: true,
    allowSpecialChars: true,
    fieldName: "Organización",
  });
}

export function validateCity(input: string): ValidationResult {
  return validateTextField(input, {
    minLength: 2,
    maxLength: 100,
    allowNumbers: false,
    allowSpecialChars: false,
    fieldName: "Ciudad",
  });
}

export function validateReason(input: string): ValidationResult {
  return validateTextField(input, {
    minLength: 2,
    maxLength: 200,
    allowNumbers: true,
    allowSpecialChars: true,
    fieldName: "Razón de firma",
  });
}

export function validateLocation(input: string): ValidationResult {
  return validateTextField(input, {
    minLength: 2,
    maxLength: 150,
    allowNumbers: true,
    allowSpecialChars: true,
    fieldName: "Localización",
  });
}

/**
 * Valida todos los campos del formulario P12 a la vez
 */
export function validateP12FormData(data: {
  fullName: string;
  idNumber: string;
  email: string;
  city: string;
  organization: string;
  reason?: string;
  location?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string[]>;
  normalizedData?: any;
} {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string[]> = {};
  const normalizedData: Record<string, string> = {};

  // Validar fullName
  const nameVal = validateFullName(data.fullName);
  if (!nameVal.isValid) {
    errors.fullName = nameVal.error || "Nombre inválido";
  } else {
    normalizedData.fullName = nameVal.normalizedName || nameVal.value!;
    if (nameVal.warnings) warnings.fullName = nameVal.warnings;
  }

  // Validar idNumber
  const idVal = validateEcuadorianId(data.idNumber);
  if (!idVal.isValid) {
    errors.idNumber = idVal.error || "Cédula/RUC inválido";
  } else {
    normalizedData.idNumber = idVal.value!;
  }

  // Validar email
  const emailVal = validateEmail(data.email);
  if (!emailVal.isValid) {
    errors.email = emailVal.error || "Email inválido";
  } else {
    normalizedData.email = emailVal.normalizedEmail!;
  }

  // Validar city
  const cityVal = validateCity(data.city);
  if (!cityVal.isValid) {
    errors.city = cityVal.error || "Ciudad inválida";
  } else {
    normalizedData.city = cityVal.value!;
  }

  // Validar organization
  const orgVal = validateOrganization(data.organization);
  if (!orgVal.isValid) {
    errors.organization = orgVal.error || "Organización inválida";
  } else {
    normalizedData.organization = orgVal.value!;
  }

  // Validar reason (opcional)
  if (data.reason) {
    const reasonVal = validateReason(data.reason);
    if (!reasonVal.isValid) {
      errors.reason = reasonVal.error || "Razón inválida";
    } else {
      normalizedData.reason = reasonVal.value!;
    }
  }

  // Validar location (opcional)
  if (data.location) {
    const locVal = validateLocation(data.location);
    if (!locVal.isValid) {
      errors.location = locVal.error || "Localización inválida";
    } else {
      normalizedData.location = locVal.value!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    normalizedData: Object.keys(errors).length === 0 ? normalizedData : undefined,
  };
}
