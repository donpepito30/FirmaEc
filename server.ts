import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

// ==================== ERROR HANDLING ====================
class ValidationError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 400,
    message: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

interface AnalysisResponse {
  isValid: boolean | null; // null = no validado (diferente a false)
  documentType?: string;
  hasSignatureField?: boolean | null;
  quality?: "good" | "fair" | "poor" | "unknown";
  recommendations: string[];
  rejectionReason?: string | null;
  validationMode?: "online" | "offline" | "fallback_error";
  error?: string;
  timestamp?: string;
}

// ==================== LOGGER SIMPLE ====================
function logAnalysis(
  status: "success" | "error" | "fallback",
  data: any
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    status,
    fileName: data.fileName || "unknown",
    mimeType: data.mimeType || "unknown",
    dataSize: data.dataSize || 0,
    error: data.error || null,
  };

  // En desarrollo, loguear a consola
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[${status.toUpperCase()}] ${timestamp}:`,
      JSON.stringify(logEntry, null, 2)
    );
  }

  // En producción, enviar a archivo o servicio
  if (process.env.NODE_ENV === "production") {
    // TODO: Conectar con CloudFlare Logpush o Sentry
    // await sendToLoggingService(logEntry);
  }
}

// ==================== VALIDACIÓN DE ENTRADA ====================
function validateDocumentInput(req: any): {
  isValid: boolean;
  errors: string[];
  data?: { base64Data: string; mimeType: string; fileName: string };
} {
  const errors: string[] = [];
  const { base64Data, mimeType, fileName } = req.body || {};

  // Validar que base64Data existe
  if (!base64Data) {
    errors.push("base64Data es requerido");
  } else {
    // Validar que sea base64 válido
    try {
      Buffer.from(base64Data, "base64");
    } catch (e) {
      errors.push("base64Data no es válido");
    }

    // Validar tamaño (máximo 10MB para Gemini)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (base64Data.length > maxSize) {
      errors.push(
        `Documento muy grande (${(base64Data.length / 1024 / 1024).toFixed(1)}MB). Máximo 10MB.`
      );
    }
  }

  // Validar MIME type
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "text/plain",
  ];
  if (!mimeType || !allowedTypes.includes(mimeType)) {
    errors.push(
      `MIME type no permitido. Permitidos: ${allowedTypes.join(", ")}`
    );
  }

  // Validar fileName
  if (!fileName || typeof fileName !== "string" || fileName.length > 255) {
    errors.push("fileName debe ser string válido (máximo 255 caracteres)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? { base64Data, mimeType, fileName }
        : undefined,
  };
}

// ==================== ANÁLISIS CON GEMINI ====================
async function analyzeWithGemini(
  base64Data: string,
  mimeType: string,
  fileName: string,
  apiKey: string
): Promise<AnalysisResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey });

    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Timeout (aborted)")), 30000);
    });

    const generatePromise = ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: `Analiza este documento ("${fileName}") para el proceso oficial de firma electrónica en Ecuador (estándar FirmaEC / Quipux / MINTEL).

IMPORTANTE: Responde EXCLUSIVAMENTE con un JSON válido estructurado así (sin markdown, sin explicaciones adicionales):
{
  "isValid": true,
  "documentType": "contrato|acta|oficio|memorando|comprobante|otro",
  "hasSignatureField": true,
  "quality": "good|fair|poor",
  "recommendations": ["Sugerencia 1", "Sugerencia 2"],
  "rejectionReason": null
}

Si el documento tiene problemas, pon isValid en false y explica en rejectionReason.`,
            },
          ],
        },
      ],
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const text = response.text || "";

    // Intentar parsear JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isValid: parsed.isValid ?? true,
          documentType: parsed.documentType || "documento",
          hasSignatureField: parsed.hasSignatureField ?? true,
          quality: parsed.quality || "good",
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : ["Documento analizado"],
          rejectionReason: parsed.rejectionReason || null,
          validationMode: "online",
        };
      } catch (jsonError) {
        // JSON inválido de Gemini
        return {
          isValid: null,
          recommendations: [
            "Respuesta de Gemini inválida. Validar manualmente.",
          ],
          validationMode: "fallback_error",
          error: "JSON parsing error",
        };
      }
    }

    // No se encontró JSON en respuesta
    return {
      isValid: null,
      recommendations: [
        "Gemini respondió sin JSON válido. Validar manualmente.",
      ],
      validationMode: "fallback_error",
      error: "No JSON found in response",
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);

    // Timeout
    if (errorMessage.includes("aborted")) {
      return {
        isValid: null,
        recommendations: [
          "Análisis tardó demasiado (>30s). Intente con documento más pequeño.",
        ],
        validationMode: "fallback_error",
        error: "Timeout",
      };
    }

    // API Key inválida
    if (errorMessage.includes("API_KEY_INVALID")) {
      return {
        isValid: null,
        recommendations: [
          "Error de configuración en servidor (API Key inválida)",
        ],
        validationMode: "offline",
        error: "Invalid API Key",
      };
    }

    // Otros errores de Gemini
    return {
      isValid: null,
      recommendations: [
        `Gemini API no disponible: ${errorMessage}. Validar manualmente.`,
      ],
      validationMode: "fallback_error",
      error: errorMessage,
    };
  }
}

// ==================== RATE LIMITING ====================
// Límite de 10 análisis por hora por IP
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 requests por ventana
  message: {
    error: "Demasiados análisis. Límite: 10 por hora. Intente más tarde.",
    retryAfter: "1 hora",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No limitar en desarrollo local
    return req.ip === "::1" || req.ip === "127.0.0.1";
  },
  keyGenerator: (req) => {
    // Usar IP real en Cloudflare o proxy
    const cfIp = req.headers["cf-connecting-ip"];
    if (typeof cfIp === "string") return cfIp;
    if (Array.isArray(cfIp)) return cfIp[0];
    return req.ip || "unknown";
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados análisis",
      message: "Límite: 10 análisis por hora",
      retryAfter: "1 hora",
      timestamp: new Date().toISOString(),
    });
  },
});

// ==================== SERVIDOR PRINCIPAL ====================
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "15mb" })); // Reducido de 50mb a 15mb (más seguro)

  // ============ ENDPOINT DE ANÁLISIS DE DOCUMENTOS (CON RATE LIMITING) ============
  app.post("/api/analyze-document", analysisLimiter, async (req, res) => {
    const requestStartTime = Date.now();

    try {
      // 1. VALIDAR INPUT
      const validation = validateDocumentInput(req);
      if (!validation.isValid) {
        logAnalysis("error", {
          fileName: req.body?.fileName,
          mimeType: req.body?.mimeType,
          dataSize: req.body?.base64Data?.length || 0,
          error: validation.errors.join("; "),
        });

        return res.status(400).json({
          isValid: false,
          recommendations: validation.errors,
          validationMode: "offline",
          error: "Input validation failed",
        } as AnalysisResponse);
      }

      const { base64Data, mimeType, fileName } = validation.data!;

      // 2. OBTENER API KEY
      const apiKey = process.env.GEMINI_API_KEY;

      // 3. SI NO HAY API KEY: MODO OFFLINE
      if (!apiKey) {
        const offlineResponse: AnalysisResponse = {
          isValid: null, // null = no validado
          documentType: "documento_no_validado",
          hasSignatureField: null,
          quality: "unknown",
          recommendations: [
            "✓ Validación con IA está deshabilitada (GEMINI_API_KEY no configurada)",
            "• Puede proceder pero sin validación automática",
            "• Revise manualmente la estructura del documento",
          ],
          validationMode: "offline",
        };

        logAnalysis("success", {
          fileName,
          mimeType,
          dataSize: base64Data.length,
          error: "No API Key - Offline Mode",
        });

        return res.status(200).json(offlineResponse);
      }

      // 4. ANALIZAR CON GEMINI
      const analysisResult = await analyzeWithGemini(
        base64Data,
        mimeType,
        fileName,
        apiKey
      );

      // 5. PROCESAR RESULTADO
      const requestDuration = Date.now() - requestStartTime;

      // Si validación fue exitosa
      if (analysisResult.validationMode === "online") {
        logAnalysis("success", {
          fileName,
          mimeType,
          dataSize: base64Data.length,
          duration: `${requestDuration}ms`,
        });

        return res.status(200).json({
          ...analysisResult,
          timestamp: new Date().toISOString(),
        });
      }

      // Si hubo error en Gemini (fallback error)
      if (analysisResult.validationMode === "fallback_error") {
        logAnalysis("fallback", {
          fileName,
          mimeType,
          dataSize: base64Data.length,
          error: analysisResult.error,
        });

        // Retornar 503 (Service Unavailable) para que cliente sepa que falló
        return res.status(503).json({
          ...analysisResult,
          timestamp: new Date().toISOString(),
        });
      }

      // Si está en modo offline (API key no configurada)
      return res.status(200).json({
        ...analysisResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // Error no esperado
      const errorMessage = error?.message || String(error);

      logAnalysis("error", {
        fileName: req.body?.fileName,
        mimeType: req.body?.mimeType,
        error: errorMessage,
      });

      return res.status(500).json({
        isValid: null,
        recommendations: [
          "Error interno en servidor. Contacte al administrador.",
        ],
        validationMode: "fallback_error",
        error: "Internal Server Error",
      } as AnalysisResponse);
    }
  });

  // ============ CONFIGURACIÓN VITE/EXPRESS ==============
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ============ INICIAR SERVIDOR ==============
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Servidor FirmaEC iniciado en http://0.0.0.0:${PORT}`);
    console.log(
      `✓ Gemini API: ${process.env.GEMINI_API_KEY ? "CONFIGURADA" : "NO CONFIGURADA (modo offline)"}`
    );
    console.log(`✓ Rate Limiting: ACTIVO (10 análisis/hora)`);
  });
}

startServer();
