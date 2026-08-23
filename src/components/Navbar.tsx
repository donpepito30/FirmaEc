import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  FileCheck2, 
  Building2, 
  BookOpen, 
  Search,
  FileSignature,
  FileText,
  Lock
} from 'lucide-react';
import headerLogo from '../assets/logo.png';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with Official Notice */}
      <div className="bg-slate-900 py-1.5 px-4 text-xs font-medium text-slate-300 border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
              ECUADOR 🇪🇨
            </span>
            <span className="text-[11px] text-slate-300">
              Infraestructura de Llave Pública (PKI) • FirmaEC, PAdES & Certificados .p12
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Estándar PKCS#12 / RSA 2048-4096 bit
            </span>
            <span>•</span>
            <span>Ley de Comercio Electrónico (Art. 13-14)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div 
            id="brand-logo-button"
            onClick={() => setActiveTab('signer')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/50 p-0.5 overflow-hidden shadow-sm group-hover:border-blue-500 transition-colors flex items-center justify-center relative">
              <img 
                src={headerLogo} 
                alt="FirmaEC PRO Logo" 
                className="w-full h-full object-contain rounded-lg relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/favicon.svg')) {
                    target.src = '/favicon.svg';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 font-display tracking-tight">
                  FirmaEC <span className="text-blue-600">PRO</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Ecuador PKI
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Estampado PDF • .p12 • ARCOTEL • SRI</p>
            </div>
          </div>

          {/* Navigation Links with Status Dots */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <button
              id="nav-signer-tab"
              onClick={() => setActiveTab('signer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'signer'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'signer' ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <FileSignature className="w-3.5 h-3.5" />
              Firmar Documentos PDF
            </button>

            <button
              id="nav-generator-tab"
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'generator'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'generator' ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <KeyRound className="w-3.5 h-3.5" />
              Generar .p12
            </button>

            <button
              id="nav-validator-tab"
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'validator'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'validator' ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <FileCheck2 className="w-3.5 h-3.5" />
              Validar .p12 y Firmas
            </button>

            <button
              id="nav-entities-tab"
              onClick={() => setActiveTab('entities')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'entities'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'entities' ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <Building2 className="w-3.5 h-3.5" />
              Entidades Acreditadas
            </button>

            <button
              id="nav-guide-tab"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'guide'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'guide' ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <BookOpen className="w-3.5 h-3.5" />
              Guía FirmaEC & Ley
            </button>
          </nav>

          {/* User Badge Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Módulo Seguro</p>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">Firma Digital EC</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-2xs">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

