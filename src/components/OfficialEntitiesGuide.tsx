import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileCode2, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { OFFICIAL_ENTITIES } from '../data/ecuadorData';

export const OfficialEntitiesGuide: React.FC = () => {
  const [filterType, setFilterType] = useState<'Todos' | 'Público' | 'Privado'>('Todos');
  const [search, setSearch] = useState('');

  const filtered = OFFICIAL_ENTITIES.filter(entity => {
    const matchesType = filterType === 'Todos' || entity.type === filterType;
    const matchesSearch = entity.name.toLowerCase().includes(search.toLowerCase()) ||
                          entity.bestFor.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
          <span className="hover:text-slate-600 transition-colors">Entidades</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Autoridades de Certificación Acreditadas</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Entidades Acreditadas por ARCOTEL
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Para que su firma electrónica tenga <strong className="text-slate-800">plena validez jurídica vinculante</strong> en el SRI (producción), Quipux, IESS y ámbito legal en Ecuador.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
              Ley de Comercio Electrónico EC
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white mb-8 border border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Costo Promedio (1 Año)</span>
            <p className="text-lg font-bold font-display text-white">$15.00 a $22.00 + IVA</p>
            <p className="text-slate-400 text-[11px]">En formato archivo (.p12) descargable al instante.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Tiempo de Emisión</span>
            <p className="text-lg font-bold font-display text-emerald-400">15 Minutos a 24 Horas</p>
            <p className="text-slate-400 text-[11px]">100% en línea mediante validación biométrica con cámara.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Requisitos Principales</span>
            <p className="text-lg font-bold font-display text-white">Cédula + Selfie / RUC</p>
            <p className="text-slate-400 text-[11px]">Foto clara de cédula o pasaporte y verificación facial en vivo.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'Todos' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todas las Entidades
          </button>
          <button
            onClick={() => setFilterType('Público')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'Público' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sector Público (BCE / Judicatura)
          </button>
          <button
            onClick={() => setFilterType('Privado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'Privado' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sector Privado (Entrega Rápida)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar entidad o uso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Entities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((entity) => (
          <div
            key={entity.id}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {entity.type === 'Público' ? '🏛️ Entidad Pública' : '🏢 Entidad Privada'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {entity.name}
                  </h3>
                </div>
                {entity.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                    {entity.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {entity.description}
              </p>

              <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Precio 1 Año (.p12):
                  </span>
                  <span className="font-bold text-slate-900">{entity.price1Year}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tiempo de Entrega:
                  </span>
                  <span className="font-semibold text-emerald-700">{entity.issuanceTime}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                    Formatos:
                  </span>
                  <span className="font-medium text-slate-800 text-right">
                    {entity.formats.join(', ')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Requisitos Principales:
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  {entity.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <a
                href={entity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-200"
              >
                <span>Solicitar Firma en {entity.name.split(' ')[0]}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Step-by-Step Guide on How to Apply */}
      <div className="mt-10 bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display mb-4">
          Guía Paso a Paso: Cómo Solicitar tu Firma Electrónica Oficial en Ecuador
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              1
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Elegir Entidad y Formato</h4>
            <p className="text-slate-600">
              Selecciona una entidad acreditada (ej. Banco Central o Security Data) y elige el formato <strong>Archivo (.p12)</strong> para máxima comodidad en celulares y computadoras.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              2
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Llenar Formulario y Subir Cédula</h4>
            <p className="text-slate-600">
              Ingresa tus datos personales (nombres, cédula, correo, RUC si aplica) y adjunta fotos nítidas de ambos lados de tu cédula o pasaporte.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              3
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Validación Biométrica</h4>
            <p className="text-slate-600">
              Realiza la prueba de vida mirando a la cámara web de tu teléfono o laptop para comprobar que eres el titular legítimo del documento.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              4
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Descargar Archivo .p12</h4>
            <p className="text-slate-600">
              Recibirás un enlace por correo electrónico para descargar tu archivo <strong>.p12</strong> y establecer tu contraseña definitiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
