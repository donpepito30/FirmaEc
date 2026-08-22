import { useRef, useEffect, useState } from "react";

/**
 * Gestor de contraseñas seguro
 * - Genera contraseñas fuertes
 * - Copia a portapapeles con autolimpieza
 * - Nunca almacena en React state global
 */

export class SecurePasswordManager {
  /**
   * Genera contraseña aleatoria fuerte (20 caracteres por defecto)
   * Incluye: mayúsculas, minúsculas, números, símbolos
   */
  static generateSecurePassword(length: number = 20): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*-_=+";

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";

    // Asegurar al menos 1 de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Rellenar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * Copia contraseña al portapapeles y la limpia después de X milisegundos
   */
  static async copyAndAutoClean(
    password: string,
    autoCleanMs: number = 10000
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Copiar al portapapeles
      await navigator.clipboard.writeText(password);

      // 2. Auto-limpiar después de X ms
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
        } catch {
          // Si no puede limpiar, ignorar
        }
      }, autoCleanMs);

      return {
        success: true,
        message: `Contraseña copiada. Se borrará en ${autoCleanMs / 1000}s`,
      };
    } catch (error) {
      return {
        success: false,
        message: "No se pudo copiar. Intente manualmente.",
      };
    }
  }

  /**
   * Valida fortaleza de contraseña
   */
  static getPasswordStrength(
    password: string
  ): {
    score: number; // 0-100
    level: "debil" | "regular" | "fuerte" | "muy-fuerte";
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return { score: 0, level: "debil", feedback: ["Ingrese una contraseña"] };
    }

    // Longitud
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    else feedback.push("Usa al menos 12 caracteres");

    // Mayúsculas
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Incluye mayúsculas");

    // Minúsculas
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Incluye minúsculas");

    // Números
    if (/\d/.test(password)) score += 15;
    else feedback.push("Incluye números");

    // Símbolos
    if (/[!@#$%^&*\-_=+]/.test(password)) score += 15;
    else feedback.push("Incluye símbolos (!@#$...)");

    // Caracteres comunes repetidos
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push("Evita caracteres repetidos");
    }

    let level: "debil" | "regular" | "fuerte" | "muy-fuerte";
    if (score >= 90) level = "muy-fuerte";
    else if (score >= 70) level = "fuerte";
    else if (score >= 50) level = "regular";
    else level = "debil";

    return {
      score: Math.max(0, Math.min(100, score)),
      level,
      feedback,
    };
  }

  /**
   * Limpiar portapapeles manualmente
   */
  static async clearClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText("");
      return true;
    } catch {
      return false;
    }
  }
}

// ========== HOOKS DE REACT ==========

/**
 * Hook: Copia texto a portapapeles con feedback visual y autolimpieza
 */
export function useCopyToClipboard(autoCleanMs: number = 10000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Auto-clean portapapeles
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
        } catch {
          // Ignored if permissions lost
        }
      }, autoCleanMs);

      // Feedback visual
      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { copy, copied };
}

/**
 * Hook: Indicador de fortaleza de contraseña
 */
export function usePasswordStrength(password: string) {
  const strength = SecurePasswordManager.getPasswordStrength(password);

  const getColor = (level: string) => {
    switch (level) {
      case "muy-fuerte":
        return "bg-emerald-500 text-white";
      case "fuerte":
        return "bg-blue-500 text-white";
      case "regular":
        return "bg-amber-500 text-white";
      case "debil":
        return "bg-rose-500 text-white";
      default:
        return "bg-slate-300 text-slate-700";
    }
  };

  const getLabel = (level: string) => {
    switch (level) {
      case "muy-fuerte":
        return "Muy fuerte";
      case "fuerte":
        return "Fuerte";
      case "regular":
        return "Regular";
      case "debil":
        return "Débil";
      default:
        return "Desconocido";
    }
  };

  return {
    ...strength,
    color: getColor(strength.level),
    label: getLabel(strength.level),
  };
}
