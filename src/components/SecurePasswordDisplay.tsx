import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, ShieldAlert, KeyRound } from "lucide-react";
import {
  useCopyToClipboard,
  usePasswordStrength,
} from "../utils/securePasswordManager";

interface SecurePasswordDisplayProps {
  password: string;
  onPasswordCopied?: () => void;
  autoCleanSeconds?: number;
}

export function SecurePasswordDisplay({
  password,
  onPasswordCopied,
  autoCleanSeconds = 10,
}: SecurePasswordDisplayProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { copy, copied } = useCopyToClipboard(autoCleanSeconds * 1000);
  const strength = usePasswordStrength(password);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    const success = await copy(password);

    if (success) {
      onPasswordCopied?.();
      setShowAlert(true);

      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = setTimeout(() => {
        setShowAlert(false);
      }, 4000);
    }
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <KeyRound className="w-3.5 h-3.5 text-blue-400" />
          <span>Contraseña P12 protegida</span>
        </label>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Campo de contraseña */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            className="w-full pl-3 pr-10 py-2 border border-slate-700 rounded-lg font-mono-code text-xs sm:text-sm bg-slate-950 text-emerald-400 focus:outline-none"
          />
          {/* Botón mostrar/ocultar */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Botón copiar */}
        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Indicador de fortaleza */}
      <div className="space-y-1">
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>Fortaleza de clave</span>
          <span>{strength.score}/100 ({strength.label})</span>
        </div>
      </div>

      {/* Alerta de auto-limpieza */}
      {showAlert && (
        <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>✓ Contraseña copiada al portapapeles.</strong>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              Por seguridad, se limpiará automáticamente en {autoCleanSeconds} segundos.
            </p>
          </div>
        </div>
      )}

      {/* Advertencia de seguridad */}
      <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-200 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Seguridad Criptográfica</span>
        </div>
        <ul className="list-disc list-inside text-amber-300/80 space-y-0.5 pl-0.5">
          <li>No comparta ni envíe esta clave por correo o mensajería abierta.</li>
          <li>Guárdela en un gestor seguro de contraseñas (e.g. Bitwarden, 1Password).</li>
          <li>Evite capturas de pantalla para prevenir filtraciones involuntarias.</li>
        </ul>
      </div>
    </div>
  );
}
