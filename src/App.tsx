import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentSignerDemo } from './components/DocumentSignerDemo';
import { P12GeneratorView } from './components/P12GeneratorView';
import { P12ValidatorView } from './components/P12ValidatorView';
import { OfficialEntitiesGuide } from './components/OfficialEntitiesGuide';
import { FirmaEcGuideView } from './components/FirmaEcGuideView';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ResilienceBanner } from './components/ResilienceBanner';
import { GeneratedP12Result } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('signer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadedResultForSigner, setLoadedResultForSigner] = useState<GeneratedP12Result | null>(null);

  const handleLoadIntoSigner = (generated: GeneratedP12Result) => {
    setLoadedResultForSigner(generated);
    setActiveTab('signer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToEntities = () => {
    setActiveTab('entities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Resilience & System Status Banner */}
      <ResilienceBanner />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "FirmaEC Pro - Firmador y Estampador de PDF Ecuador",
                "operatingSystem": "All",
                "applicationCategory": "SecurityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0.00",
                  "priceCurrency": "USD"
                },
                "description": "Herramienta para firmar digitalmente y estampar documentos PDF con estándares FirmaEC, SRI y Quipux en Ecuador."
              },
              {
                "@type": "WebSite",
                "name": "FirmaEC Pro Ecuador",
                "url": "https://firmaec.pro",
                "inLanguage": "es-EC",
                "description": "Firma electrónica, estampado visual de sellos QR en documentos PDF y certificados .p12 para Ecuador."
              }
            ]
          })
        }}
      />

      {/* Institutional Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        <ErrorBoundary key={activeTab}>
          {activeTab === 'signer' && (
            <DocumentSignerDemo 
              initialResult={loadedResultForSigner}
              onNavigateToValidator={() => {
                setActiveTab('validator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToGenerator={() => {
                setActiveTab('generator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'generator' && (
            <P12GeneratorView
              onLoadIntoSigner={handleLoadIntoSigner}
              onNavigateToEntities={handleNavigateToEntities}
            />
          )}

          {activeTab === 'validator' && <P12ValidatorView />}

          {activeTab === 'entities' && <OfficialEntitiesGuide />}

          {activeTab === 'guide' && <FirmaEcGuideView />}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


