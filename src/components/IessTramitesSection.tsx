import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Tag
} from 'lucide-react';
import { FAQ_DATA, IESS_TRAMITES_DATA } from '../data/ecuadorData';
import { IessTramite } from '../types';

interface IessTramitesSectionProps {
  searchFilter?: string;
  onNavigateToP12Generator?: () => void;
}

export const IessTramitesSection: React.FC<IessTramitesSectionProps> = ({
  searchFilter = '',
  onNavigateToP12Generator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [expandedTramiteId, setExpandedTramiteId] = useState<string | null>('fondos_reserva');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeSearch = searchFilter || localSearch;

  const categories = ['Todos', 'Afiliados', 'Jubilados', 'Préstamos', 'Salud', 'Firma Electrónica'];

  const filteredTramites = IESS_TRAMITES_DATA.filter((tramite) => {
    const matchesCategory = selectedCategory === 'Todos' || tramite.category === selectedCategory;
    const matchesSearch = 
      tramite.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      tramite.summary.toLowerCase().includes(activeSearch.toLowerCase()) ||
      tramite.tags.some(t => t.toLowerCase().includes(activeSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
          <span className="hover:text-slate-600 transition-colors">Servicios Ciudadanos</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Guía de Trámites IESS & BIESS</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Guía de Trámites IESS & BIESS Ecuador
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              Instrucciones oficiales paso a paso, requisitos vigentes, tiempos de respuesta y enlaces directos para los trámites más solicitados ante el Instituto Ecuatoriano de Seguridad Social.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
              Portal Oficial Actualizado
            </span>
          </div>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar fondos, jubilación, citas..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Tramites Accordion / Cards */}
      <div className="space-y-4 mb-14">
        {filteredTramites.map((tramite) => {
          const isExpanded = expandedTramiteId === tramite.id;

          return (
            <div
              key={tramite.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Header clickable */}
              <div
                onClick={() => setExpandedTramiteId(isExpanded ? null : tramite.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                      {tramite.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {tramite.timeEstimate}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      {tramite.cost}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                    {tramite.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tramite.summary}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 border-t border-slate-100 bg-slate-50/50 pt-5 space-y-6">
                  {/* Requisitos */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Requisitos Obligatorios
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                      {tramite.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pasos */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Pasos para Realizar el Trámite en Línea
                    </h4>
                    <ol className="space-y-2 text-xs text-slate-700">
                      {tramite.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {tramite.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {tramite.id === 'firma_electronica_guia' && onNavigateToP12Generator && (
                        <button
                          onClick={onNavigateToP12Generator}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Generar Archivo .p12 Ahora →
                        </button>
                      )}
                      <a
                        href={tramite.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Ir al Portal Oficial IESS / BIESS</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preguntas Frecuentes (FAQ) */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            Preguntas Frecuentes (FAQ)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            Dudas Comunes sobre Firma Electrónica, IESS y BIESS
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-600">Q:</span>
                    <span>{faq.question}</span>
                  </span>
                  <span className="text-slate-400 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-4 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
