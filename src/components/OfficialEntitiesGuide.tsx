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
          <span className="text-slate-700 font-semibold">Entidades acreditadas</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Entidades autorizadas en Ecuador
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Emisores de firma válidos para el SRI, Quipux e IESS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Entidades oficiales
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white mb-8 border border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Costo promedio anual</span>
            <p className="text-lg font-bold font-display text-white">$15.00 a $22.00 + IVA</p>
            <p className="text-slate-400 text-[11px]">En archivo (.p12) descargable.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Tiempo de entrega</span>
            <p className="text-lg font-bold font-display text-emerald-400">15 Minutos a 24 Horas</p>
            <p className="text-slate-400 text-[11px]">Trámite en línea con tu cámara.</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Requisitos básicos</span>
            <p className="text-lg font-bold font-display text-white">Cédula + Selfie / RUC</p>
            <p className="text-slate-400 text-[11px]">Foto de tu cédula y verificación facial.</p>
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
            Todas
          </button>
          <button
            onClick={() => setFilterType('Público')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'Público' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Públicas
          </button>
          <button
            onClick={() => setFilterType('Privado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'Privado' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Privadas
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar entidad..."
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
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider whitespace-nowrap">
                    · {entity.badge}
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
                    Precio anual:
                  </span>
                  <span className="font-bold text-slate-900">{entity.price1Year}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tiempo de entrega:
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
                  Requisitos:
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
                <span>Solicitar firma en {entity.name.split(' ')[0]}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Step-by-Step Guide on How to Apply */}
      <div className="mt-10 bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display mb-4">
          Cómo solicitar tu firma
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              1
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Elige entidad y formato</h4>
            <p className="text-slate-600">
              Selecciona una entidad acreditada y pide tu firma en archivo (.p12) para usarla en tu computador o celular.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              2
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Llena tus datos</h4>
            <p className="text-slate-600">
              Ingresa tus datos personales y adjunta fotos claras de tu documento de identidad.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              3
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Verificación facial</h4>
            <p className="text-slate-600">
              Mira a la cámara de tu teléfono o computador para confirmar tu identidad.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-2">
              4
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Descarga tu firma</h4>
            <p className="text-slate-600">
              Recibe el enlace en tu correo para descargar el archivo (.p12) y crea tu contraseña.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
