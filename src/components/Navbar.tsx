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
import { PWAInstallButton } from './PWAInstallButton';

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
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider">
              ECUADOR 🇪🇨
            </span>
            <span className="text-[11px] text-slate-500">·</span>
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
                  FirmaEC <span className="text-blue-600 font-extrabold">PRO</span>
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">
                  · Ecuador PKI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Estampado PDF · .p12 · ARCOTEL · SRI</p>
            </div>
          </div>

          {/* Navigation Links with Clean Typography & Underlines */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none h-full">
            <button
              id="nav-signer-tab"
              onClick={() => setActiveTab('signer')}
              className={`flex items-center gap-1.5 px-3 py-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer h-full ${
                activeTab === 'signer'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Firmar PDF</span>
            </button>

            <button
              id="nav-generator-tab"
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-1.5 px-3 py-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer h-full ${
                activeTab === 'generator'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Generar .p12</span>
            </button>

            <button
              id="nav-validator-tab"
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-1.5 px-3 py-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer h-full ${
                activeTab === 'validator'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Validar .p12</span>
            </button>

            <button
              id="nav-entities-tab"
              onClick={() => setActiveTab('entities')}
              className={`flex items-center gap-1.5 px-3 py-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer h-full ${
                activeTab === 'entities'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Entidades</span>
            </button>

            <button
              id="nav-guide-tab"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer h-full ${
                activeTab === 'guide'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía Técnica</span>
            </button>
          </nav>

          {/* User Badge Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 flex-shrink-0">
            <PWAInstallButton inline />
            <div className="h-4 w-px bg-slate-200" />
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

