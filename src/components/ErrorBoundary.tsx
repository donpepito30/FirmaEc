import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onResetCustom?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('⚡ ErrorBoundary capturó una excepción en vista:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null, showDetails: false });
    const props = (this as any).props as Props;
    if (props && props.onResetCustom) {
      props.onResetCustom();
    }
  };

  private handleFullReload = () => {
    window.location.reload();
  };

  public render() {
    const currentState = (this as any).state as State;
    const currentProps = (this as any).props as Props;

    if (currentState?.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 my-8">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                {currentProps?.fallbackTitle || 'Ocurrió un inconveniente en esta vista'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentState.error?.message || 'Inconveniente inesperado al procesar la información. El resto de la aplicación continúa operando con normalidad.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar esta vista</span>
              </button>

              <button
                onClick={this.handleFullReload}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Restaurar aplicación</span>
              </button>
            </div>

            {/* Technical details accordion */}
            {currentState.error && (
              <div className="pt-3 border-t border-slate-100 text-left">
                <button
                  onClick={() => (this as any).setState({ showDetails: !currentState.showDetails })}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer mx-auto"
                >
                  <span>Detalles técnicos del error</span>
                  {currentState.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {currentState.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-32 leading-normal">
                    {currentState.error.stack || currentState.error.message}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return currentProps?.children || null;
  }
}
