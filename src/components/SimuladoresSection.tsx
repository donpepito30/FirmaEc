import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank,
  Briefcase
} from 'lucide-react';

export const SimuladoresSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'quirografario' | 'jubilacion' | 'aportes'>('quirografario');

  // --- Estado Préstamo Quirografario BIESS ---
  const [salario, setSalario] = useState<number>(650);
  const [fondosDisponibles, setFondosDisponibles] = useState<number>(2500);
  const [montoSolicitado, setMontoSolicitado] = useState<number>(2000);
  const [plazoMeses, setPlazoMeses] = useState<number>(24);
  const [sistemaAmortizacion, setSistemaAmortizacion] = useState<'francesa' | 'alemana'>('francesa');

  // Cálculo Quirografario
  const tasaAnual = 0.1185; // 11.85% tasa anual referencial BIESS
  const tasaMensual = tasaAnual / 12;
  const capacidadMaximaCuota = salario * 0.50; // Máximo 50% de capacidad de pago
  const montoMaximoGarantia = fondosDisponibles * 0.95; // Hasta el 95% de los fondos acumulados

  // Cuota sistema francés: C = P * [i / (1 - (1+i)^-n)]
  const cuotaFrancesa = montoSolicitado * (tasaMensual / (1 - Math.pow(1 + tasaMensual, -plazoMeses)));
  const totalPagarFrancesa = cuotaFrancesa * plazoMeses;
  const totalInteresesFrancesa = totalPagarFrancesa - montoSolicitado;

  const esCuotaValida = cuotaFrancesa <= capacidadMaximaCuota && montoSolicitado <= montoMaximoGarantia;

  // --- Estado Jubilación IESS ---
  const [edad, setEdad] = useState<number>(62);
  const [aniosAporte, setAniosAporte] = useState<number>(32);
  const [sueldoPromedio5Anios, setSueldoPromedio5Anios] = useState<number>(850);

  // Verificación de requisitos IESS
  let cumpleRequisitosJubilacion = false;
  let motivoRequisito = '';

  if (aniosAporte >= 40) {
    cumpleRequisitosJubilacion = true;
    motivoRequisito = 'Cumple: 40 o más años de aportes (sin límite de edad).';
  } else if (edad >= 60 && aniosAporte >= 30) {
    cumpleRequisitosJubilacion = true;
    motivoRequisito = 'Cumple: Mínimo 60 años de edad y 30 años de aportes (360 imposiciones).';
  } else if (edad >= 65 && aniosAporte >= 15) {
    cumpleRequisitosJubilacion = true;
    motivoRequisito = 'Cumple: Mínimo 65 años de edad y 15 años de aportes (180 imposiciones).';
  } else if (edad >= 70 && aniosAporte >= 10) {
    cumpleRequisitosJubilacion = true;
    motivoRequisito = 'Cumple: Mínimo 70 años de edad y 10 años de aportes (120 imposiciones).';
  } else {
    motivoRequisito = `No cumple los requisitos mínimos de edad (${edad} años) y aportes (${aniosAporte} años) para jubilación ordinaria.`;
  }

  // Tabla oficial de coeficientes de pensión por años de aporte
  const getCoeficientePension = (anios: number) => {
    if (anios < 10) return 0;
    if (anios === 10) return 0.4375;
    if (anios === 15) return 0.5312;
    if (anios === 20) return 0.6250;
    if (anios === 25) return 0.7187;
    if (anios === 30) return 0.8125;
    if (anios === 35) return 0.9062;
    if (anios >= 40) return 1.0000;
    // Interpolación lineal
    const base = Math.floor(anios / 5) * 5;
    const baseCoef = getCoeficientePension(base);
    const nextCoef = getCoeficientePension(base + 5);
    return baseCoef + ((anios - base) / 5) * (nextCoef - baseCoef);
  };

  const coefPension = getCoeficientePension(aniosAporte);
  const pensionCalculada = sueldoPromedio5Anios * coefPension;
  const pensionMinimaLegal = 230.00; // Referencial SBU
  const pensionMaximaLegal = 2300.00; // Tope máximo IESS
  const pensionFinal = Math.min(Math.max(pensionCalculada, pensionMinimaLegal), pensionMaximaLegal);

  // --- Estado Aportes Mensuales ---
  const [salarioAportes, setSalarioAportes] = useState<number>(500);
  const aportePersonal = salarioAportes * 0.0945; // 9.45%
  const aportePatronal = salarioAportes * 0.1115; // 11.15%
  const totalAporteMensual = aportePersonal + aportePatronal; // 20.60%
  const fondoReservaMensual = salarioAportes * 0.0833; // 8.33%

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
          <span className="hover:text-slate-600 transition-colors">Seguridad Social</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Simuladores y Calculadoras</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Simuladores Financieros IESS / BIESS
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Cálculo de cuotas de créditos quirografarios, proyección de pensión de jubilación ordinaria y desglose de aportes patronales y personales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
              Tasas Oficiales 2026
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('quirografario')}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'quirografario'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Préstamo Quirografario BIESS
        </button>

        <button
          onClick={() => setActiveSubTab('jubilacion')}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'jubilacion'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Calculadora de Jubilación IESS
        </button>

        <button
          onClick={() => setActiveSubTab('aportes')}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'aportes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          Desglose de Aportes al IESS
        </button>
      </div>

      {/* SUBTAB 1: QUIROGRAFARIO */}
      {activeSubTab === 'quirografario' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Parámetros de Solicitud
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Tasa 11.85% Anual
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sueldo Mensual de Aportación ($ USD)
                </label>
                <input
                  type="number"
                  min={460}
                  value={salario}
                  onChange={(e) => setSalario(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Capacidad máxima de endeudamiento mensual (50%): <strong>${capacidadMaximaCuota.toFixed(2)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fondos de Reserva y Cesantía Disponibles ($ USD)
                </label>
                <input
                  type="number"
                  min={100}
                  value={fondosDisponibles}
                  onChange={(e) => setFondosDisponibles(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Monto máximo garantizado por tus fondos (95%): <strong>${montoMaximoGarantia.toFixed(2)}</strong>
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Monto que Deseas Solicitar ($ USD)</span>
                  <span className="text-blue-600 font-mono-code font-bold">${montoSolicitado}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={Math.max(500, montoMaximoGarantia)}
                  step={50}
                  value={montoSolicitado}
                  onChange={(e) => setMontoSolicitado(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Plazo en Meses
                  </label>
                  <select
                    value={plazoMeses}
                    onChange={(e) => setPlazoMeses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value={6}>6 Meses (Medio año)</option>
                    <option value={12}>12 Meses (1 Año)</option>
                    <option value={24}>24 Meses (2 Años)</option>
                    <option value={36}>36 Meses (3 Años)</option>
                    <option value={48}>48 Meses (4 Años)</option>
                    <option value={60}>60 Meses (5 Años)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Amortización
                  </label>
                  <select
                    value={sistemaAmortizacion}
                    onChange={(e) => setSistemaAmortizacion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="francesa">Francesa (Cuota Fija)</option>
                    <option value="alemana">Alemana (Cuota Decreciente)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Resultado de la Simulación BIESS
              </span>

              <div className="mb-6">
                <span className="text-xs text-slate-400 block">Cuota Mensual Estimada:</span>
                <span className="text-3xl sm:text-4xl font-bold font-display text-emerald-400">
                  ${cuotaFrancesa.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 ml-2">/ mes ({plazoMeses} cuotas)</span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-4 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Monto del Capital Solicitado:</span>
                  <span className="font-bold text-white font-mono-code">${montoSolicitado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Total de Intereses Estimados (11.85% anual):</span>
                  <span className="font-bold text-amber-400 font-mono-code">${totalInteresesFrancesa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Total Final a Devolver:</span>
                  <span className="font-bold text-emerald-400 font-mono-code">${totalPagarFrancesa.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                {esCuotaValida ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Tu cuota está dentro del límite permitido del 50% de tu sueldo (${capacidadMaximaCuota.toFixed(2)}).</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Atención: El monto o cuota supera tu capacidad de pago o tu garantía disponible. Reduce el monto o amplía el plazo.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: JUBILACION */}
      {activeSubTab === 'jubilacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Datos para Proyección de Jubilación Ordinaria
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Edad Actual del Afiliado (Años)
                </label>
                <input
                  type="number"
                  min={40}
                  max={90}
                  value={edad}
                  onChange={(e) => setEdad(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Años de Aportaciones al IESS
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={aniosAporte}
                  onChange={(e) => setAniosAporte(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Equivale a {aniosAporte * 12} imposiciones mensuales registradas.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Promedio de los 5 Mejores Años de Sueldo ($ USD)
                </label>
                <input
                  type="number"
                  min={460}
                  value={sueldoPromedio5Anios}
                  onChange={(e) => setSueldoPromedio5Anios(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  El IESS promedia las 60 mejores remuneraciones de aportación indexadas.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Pensión Mensual Proyectada (IESS)
              </span>

              <div className="mb-6">
                <span className="text-xs text-slate-400 block">Pensión Vitalicia Estimada:</span>
                <span className="text-3xl sm:text-4xl font-bold font-display text-emerald-400">
                  ${pensionFinal.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 ml-2">/ mes</span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-4 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Porcentaje Aplicado sobre Sueldo Promedio:</span>
                  <span className="font-bold text-white">{(coefPension * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Pensión Mínima Legal Referencial:</span>
                  <span className="font-mono-code text-white">${pensionMinimaLegal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Tope Máximo de Jubilación IESS:</span>
                  <span className="font-mono-code text-white">${pensionMaximaLegal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                {cumpleRequisitosJubilacion ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{motivoRequisito}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{motivoRequisito}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: APORTES */}
      {activeSubTab === 'aportes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-blue-600" />
                Calculadora de Aportes a la Seguridad Social
              </h3>
            </div>

            <div className="p-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Remuneración Mensual Bruta ($ USD)
                </label>
                <input
                  type="number"
                  min={460}
                  value={salarioAportes}
                  onChange={(e) => setSalarioAportes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Desglose Legal Mensual (Relación de Dependencia)
              </h3>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                <div>
                  <span className="font-bold text-blue-900 block">Aporte Personal (Descuento al Trabajador)</span>
                  <span className="text-blue-700 text-[11px]">9.45% del salario</span>
                </div>
                <span className="text-base font-bold font-mono-code text-blue-950">${aportePersonal.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg flex justify-between items-center border border-indigo-100">
                <div>
                  <span className="font-bold text-indigo-900 block">Aporte Patronal (Pago del Empleador)</span>
                  <span className="text-indigo-700 text-[11px]">11.15% del salario (incluye SECAP / IECE)</span>
                </div>
                <span className="text-base font-bold font-mono-code text-indigo-950">${aportePatronal.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg flex justify-between items-center border border-emerald-100">
                <div>
                  <span className="font-bold text-emerald-900 block">Fondos de Reserva Mensuales</span>
                  <span className="text-emerald-700 text-[11px]">8.33% (a partir del segundo año)</span>
                </div>
                <span className="text-base font-bold font-mono-code text-emerald-950">${fondoReservaMensual.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Aportación al IESS (20.60%):</span>
                <span className="font-mono-code text-blue-600">${totalAporteMensual.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
