import React, { useState, useRef, useEffect } from 'react';
import { 
  Move, 
  Target, 
  Info, 
  Eye, 
  Stamp, 
  Layers, 
  FileText, 
  Plus, 
  Minus, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { StampStyleType } from '../types';
import { splitSignerNameForStamp } from '../services/p12Generator';
import { renderPdfPageToDataUrl } from '../utils/pdfRenderer';

interface InteractiveStampPositionerProps {
  positionPreset: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
  setPositionPreset: (preset: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-left' | 'custom') => void;
  customX: number;
  setCustomX: (x: number) => void;
  customY: number;
  setCustomY: (y: number) => void;
  stampStyle: StampStyleType;
  setStampStyle: (style: StampStyleType) => void;
  pageOption: 'last' | 'all' | 'first' | 'specific';
  setPageOption: (page: 'last' | 'all' | 'first' | 'specific') => void;
  specificPage: number;
  setSpecificPage: (page: number) => void;
  includeQrCode: boolean;
  setIncludeQrCode: (inc: boolean) => void;
  signerName: string;
  idNumber: string;
  qrDataUrl: string;
  pdfBuffer?: ArrayBuffer;
  documentPreviewUrl?: string;
  documentPageCount: number;
  documentName?: string;
}

export const InteractiveStampPositioner: React.FC<InteractiveStampPositionerProps> = ({
  positionPreset,
  setPositionPreset,
  customX,
  setCustomX,
  customY,
  setCustomY,
  stampStyle,
  setStampStyle,
  pageOption,
  setPageOption,
  specificPage,
  setSpecificPage,
  includeQrCode,
  setIncludeQrCode,
  signerName,
  idNumber,
  qrDataUrl,
  pdfBuffer,
  documentPreviewUrl,
  documentPageCount,
  documentName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Estados para renderizado dinámico de la página real del PDF
  const [renderedPageUrl, setRenderedPageUrl] = useState<string | null>(null);
  const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);

  // Renderizar la página real del PDF cuando cambia la página seleccionada o el documento
  useEffect(() => {
    if (!pdfBuffer) {
      setRenderedPageUrl(null);
      setPageAspectRatio(null);
      return;
    }

    let pageNum = 1;
    const total = documentPageCount || 1;
    if (pageOption === 'last') {
      pageNum = total;
    } else if (pageOption === 'first' || pageOption === 'all') {
      pageNum = 1;
    } else if (pageOption === 'specific') {
      pageNum = Math.max(1, Math.min(specificPage, total));
    }

    let isSubscribed = true;
    setIsRenderingPage(true);

    renderPdfPageToDataUrl(pdfBuffer.slice(0), pageNum, 900)
      .then((res) => {
        if (isSubscribed) {
          setRenderedPageUrl(res.dataUrl);
          setPageAspectRatio(res.aspectRatio);
          setIsRenderingPage(false);
        }
      })
      .catch((err) => {
        console.warn('No se pudo renderizar la vista previa exacta del PDF:', err);
        if (isSubscribed) {
          setIsRenderingPage(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [pdfBuffer, pageOption, specificPage, documentPageCount]);

  // Divide el nombre del firmante para el sello
  const signerNameLines = splitSignerNameForStamp(signerName || 'TITULAR ECUADOR');

  // Calcular las coordenadas porcentuales efectivas para la vista visual
  const getEffectivePct = () => {
    switch (positionPreset) {
      case 'bottom-right':
        return { x: 88, y: 10 };
      case 'bottom-center':
        return { x: 50, y: 10 };
      case 'bottom-left':
        return { x: 5, y: 10 };
      case 'top-right':
        return { x: 88, y: 90 };
      case 'top-left':
        return { x: 5, y: 90 };
      case 'custom':
      default:
        return { x: customX, y: customY };
    }
  };

  const effective = getEffectivePct();

  // Convertir porcentaje PDF (donde 0% es abajo/izquierda, 100% es arriba/derecha) a HTML
  const stampWidthPercent = 48; // El sello en HTML ocupa el ~48% del ancho del lienzo
  const stampHeightPercent = 14; // El sello en HTML ocupa el ~14% del alto del lienzo

  const htmlLeft = Math.max(0, Math.min(100 - stampWidthPercent, (effective.x / 100) * (100 - stampWidthPercent)));
  const htmlTop = Math.max(0, Math.min(100 - stampHeightPercent, ((100 - effective.y) / 100) * (100 - stampHeightPercent)));

  // Manejador para posicionamiento por clic o arrastre
  const handlePointerUpdate = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Asumir que el elemento sello mide ~160px x 52px en pantalla
    const stampW = 160;
    const stampH = 52;
    const availW = Math.max(1, rect.width - stampW);
    const availH = Math.max(1, rect.height - stampH);

    // Posición del centro del puntero relativa a la esquina superior izquierda del lienzo
    let clickX = clientX - rect.left - (stampW / 2);
    let clickY = clientY - rect.top - (stampH / 2);

    // Clampear para que el sello no sobresalga del lienzo
    clickX = Math.max(0, Math.min(availW, clickX));
    clickY = Math.max(0, Math.min(availH, clickY));

    // Convertir a porcentajes X (0..100) e Y (0..100 desde abajo)
    const newCustomX = Math.round((clickX / availW) * 100);
    const newCustomY = Math.round((1 - (clickY / availH)) * 100);

    setCustomX(newCustomX);
    setCustomY(newCustomY);
    if (positionPreset !== 'custom') {
      setPositionPreset('custom');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerUpdate(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handlePointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handlePointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Restaurar posición estándar
  const handleResetPosition = () => {
    setPositionPreset('bottom-right');
    setCustomX(88);
    setCustomY(10);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* HEADER DE LA SECCIÓN DE POSICIONAMIENTO */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Ubicación Interactiva de la Firma
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Previsualización en Tiempo Real</span>
          </span>
        </div>
      </div>

      {/* EXPLICACIÓN BREVE */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11.5px]">
          Arrastre o haga clic sobre el documento para ubicar el sello de la <strong>FirmaEC</strong> exactamente sobre la casilla o línea requerida.
        </p>
      </div>

      {/* GRID PRINCIPAL: CANVAS INTERACTIVO + CONTROLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMNA IZQUIERDA: CANVAS INTERACTIVO DEL DOCUMENTO (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Lienzo del Documento (A4)</span>
            </span>

            {/* ZOOM CONTROLS */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition-colors cursor-pointer"
                title="Reducir zoom"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1 font-mono text-slate-700">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition-colors cursor-pointer"
                title="Aumentar zoom"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* LIENZO DE PÁGINA INTERACTIVA */}
          <div className="bg-slate-800/90 p-4 sm:p-6 rounded-2xl border border-slate-700 shadow-inner overflow-hidden flex items-center justify-center min-h-[420px] select-none">
            
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
              className="transition-transform duration-200"
            >
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  aspectRatio: pageAspectRatio ? `${pageAspectRatio}` : '595/842'
                }}
                className={`relative w-[280px] sm:w-[320px] max-h-[460px] bg-white rounded-lg shadow-2xl border border-slate-300 cursor-crosshair overflow-hidden transition-all ${
                  isDragging ? 'ring-2 ring-blue-500 shadow-blue-500/20' : 'hover:border-blue-400'
                }`}
              >
                {/* 1. INDICADOR DE CARGA MIENTRAS SE RENDERIZA LA PÁGINA REAL */}
                {isRenderingPage && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-4 text-center">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                    <p className="text-xs font-bold text-slate-800">Cargando vista previa original...</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Renderizando contenido real del PDF</p>
                  </div>
                )}

                {/* 2. CONTENIDO DE FONDO (Página real renderizada o fallback) */}
                {renderedPageUrl || documentPreviewUrl ? (
                  <img 
                    src={renderedPageUrl || documentPreviewUrl} 
                    alt="Documento cargado original" 
                    className="w-full h-full object-fill pointer-events-none select-none opacity-95"
                  />
                ) : (
                  <div className="p-4 h-full flex flex-col justify-between pointer-events-none text-slate-400 font-sans text-[8px] space-y-2">
                    {/* Encabezado del documento */}
                    <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="w-24 h-2 bg-blue-900/20 rounded"></div>
                        <div className="w-16 h-1.5 bg-slate-200 rounded"></div>
                      </div>
                      <span className="text-[7px] font-mono text-slate-400">REPÚBLICA DEL ECUADOR</span>
                    </div>

                    {/* Título y texto de relleno */}
                    <div className="space-y-2 my-2 flex-1">
                      <div className="w-3/4 h-3 bg-slate-800/10 rounded mx-auto my-2"></div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded"></div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded"></div>
                      <div className="w-11/12 h-1.5 bg-slate-200/80 rounded"></div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded"></div>
                      <div className="w-4/5 h-1.5 bg-slate-200/80 rounded"></div>

                      <div className="pt-2 space-y-1">
                        <div className="w-full h-1.5 bg-slate-200/80 rounded"></div>
                        <div className="w-full h-1.5 bg-slate-200/80 rounded"></div>
                        <div className="w-2/3 h-1.5 bg-slate-200/80 rounded"></div>
                      </div>
                    </div>

                    {/* Sección inferior con línea de firma dibujada */}
                    <div className="pt-4 border-t border-slate-200 text-center space-y-1 relative">
                      <div className="w-36 h-0.5 bg-slate-400 mx-auto"></div>
                      <p className="text-[7.5px] font-bold text-slate-600 uppercase">
                        FIRMA DEL DECLARANTE / TITULAR
                      </p>
                      <p className="text-[6.5px] text-slate-400 font-mono">
                        C.I. / RUC: {idNumber || '1715894320'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. LÍNEAS GUÍA DE ALINEACIÓN (CROSSHAIRS) */}
                <div 
                  className="absolute left-0 right-0 border-b border-dashed border-blue-400/40 pointer-events-none transition-all duration-75"
                  style={{ top: `${htmlTop}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 border-r border-dashed border-blue-400/40 pointer-events-none transition-all duration-75"
                  style={{ left: `${htmlLeft}%` }}
                />

                {/* 3. CAJA INTERACTIVA DEL SELLO FIRMAEC SOBREPUESTA */}
                <div
                  style={{
                    left: `${htmlLeft}%`,
                    top: `${htmlTop}%`,
                  }}
                  className={`absolute transition-all duration-100 ease-out z-20 pointer-events-auto transform hover:scale-105 ${
                    isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab'
                  }`}
                >
                  {/* Etiqueta flotante con coordenadas en vivo */}
                  <div className="absolute -top-6 left-0 bg-blue-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1 z-30">
                    <Move className="w-2.5 h-2.5" />
                    <span>X:{effective.x}% Y:{effective.y}%</span>
                  </div>

                  {/* Renderizado de la estampa según el estilo */}
                  <div className="p-1.5 bg-white border-2 border-blue-600 rounded shadow-lg max-w-[170px] sm:max-w-[190px] font-mono text-[8px] leading-tight select-none pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      {includeQrCode && qrDataUrl && (
                        <div className="w-8 h-8 bg-white p-0.5 rounded flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={qrDataUrl} 
                            alt="QR" 
                            className="w-full h-full object-contain" 
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[7px] text-slate-500 leading-none">Firmado por:</p>
                        <p className="font-extrabold text-slate-900 truncate uppercase text-[8.5px]">
                          {signerNameLines[0]}
                        </p>
                        {signerNameLines[1] && (
                          <p className="font-extrabold text-slate-900 truncate uppercase text-[8.5px]">
                            {signerNameLines[1]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MARCA DE PÁGINA */}
                <div className="absolute bottom-1 right-2 bg-slate-900/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded pointer-events-none">
                  Página {pageOption === 'specific' ? specificPage : (documentPageCount || 1)}
                </div>
              </div>
            </div>

          </div>

          {/* INDICADOR DE COORDENADAS OFICIALES EN PUNTOS PDF (PT) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-700">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Coordenadas PDF (A4 595x842 pt):</span>
            </div>
            <div className="flex items-center gap-3 font-bold text-slate-900">
              <span className="bg-white px-2 py-0.5 border border-slate-300 rounded">
                X: {Math.round((effective.x / 100) * 595)} pt ({effective.x}%)
              </span>
              <span className="bg-white px-2 py-0.5 border border-slate-300 rounded">
                Y: {Math.round((effective.y / 100) * 842)} pt ({effective.y}%)
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SELECCIONADORES DE PREAJUSTES Y AJUSTES (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. SELECCIÓN DE PÁGINA */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Página de Estampado</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'last', label: 'Última Hoja (Estándar)' },
                { id: 'all', label: 'Todas las Hojas' },
                { id: 'first', label: 'Primera Hoja' },
                { id: 'specific', label: 'Página Específica' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPageOption(p.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    pageOption === p.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {pageOption === 'specific' && (
              <div className="mt-2.5 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-600">Número de página:</span>
                <input
                  type="number"
                  min={1}
                  max={documentPageCount || 100}
                  value={specificPage}
                  onChange={(e) => setSpecificPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500">de {documentPageCount || 1} pág(s)</span>
              </div>
            )}
          </div>

          {/* 2. PREAJUSTES RÁPIDOS DE UBICACIÓN EN EL CAMPO DE FIRMA */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-blue-600" />
                <span>Ubicación Predefinida</span>
              </label>

              {positionPreset === 'custom' && (
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'bottom-right', label: 'Sobre Campo Firma (Inf. Derecha - Oficial)' },
                { id: 'bottom-center', label: 'Sobre Campo Firma (Inf. Centro)' },
                { id: 'bottom-left', label: 'Sobre Campo Firma (Inf. Izquierda)' },
                { id: 'top-right', label: 'Superior Derecha' },
                { id: 'top-left', label: 'Superior Izquierda' },
                { id: 'custom', label: 'Personalizado (Arrastrar o usar deslizadores)' }
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPositionPreset(preset.id as any);
                    if (preset.id === 'bottom-right') { setCustomX(88); setCustomY(10); }
                    if (preset.id === 'bottom-center') { setCustomX(50); setCustomY(10); }
                    if (preset.id === 'bottom-left') { setCustomX(5); setCustomY(10); }
                    if (preset.id === 'top-right') { setCustomX(88); setCustomY(90); }
                    if (preset.id === 'top-left') { setCustomX(5); setCustomY(90); }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                    positionPreset === preset.id
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{preset.label}</span>
                  {positionPreset === preset.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. DESLIZADORES DE AJUSTE FINO (X% e Y%) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 pt-3">
            <p className="text-xs font-bold text-slate-800">
              Ajuste Fino Manual (Porcentajes %):
            </p>

            {/* Slider X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Horizontal (X):</span>
                <span className="font-mono font-bold text-slate-900">{effective.x}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomX(Math.max(0, effective.x - 1));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="p-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  -1%
                </button>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={effective.x}
                  onChange={(e) => {
                    setCustomX(parseInt(e.target.value));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomX(Math.min(90, effective.x + 1));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="p-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  +1%
                </button>
              </div>
            </div>

            {/* Slider Y */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Vertical (Y desde abajo):</span>
                <span className="font-mono font-bold text-slate-900">{effective.y}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomY(Math.max(0, effective.y - 1));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="p-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  -1%
                </button>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={effective.y}
                  onChange={(e) => {
                    setCustomY(parseInt(e.target.value));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomY(Math.min(90, effective.y + 1));
                    if (positionPreset !== 'custom') setPositionPreset('custom');
                  }}
                  className="p-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  +1%
                </button>
              </div>
            </div>
          </div>

          {/* ESTILO DEL SELLO Y CHECKBOX DE CÓDIGO QR */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Estilo del Sello Visual
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'firmaec-official', name: 'FirmaEC Estándar' },
                  { id: 'quipux-classic', name: 'Gestión Quipux' },
                  { id: 'sri-tax', name: 'Facturación SRI' },
                  { id: 'legal-notary', name: 'Legal / Notaría' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStampStyle(st.id as StampStyleType)}
                    className={`py-1.5 px-2 rounded-lg text-center text-xs transition-all border cursor-pointer ${
                      stampStyle === st.id
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate block">{st.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
              <input
                type="checkbox"
                checked={includeQrCode}
                onChange={(e) => setIncludeQrCode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Incluir Código QR de verificación criptográfica</span>
            </label>
          </div>

        </div>

      </div>
    </div>
  );
};
