import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Erro inesperado na interface:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-center p-6">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">
            Algo deu errado ao exibir esta tela.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Um erro inesperado interrompeu a interface, mas nenhum dado foi perdido — tudo continua salvo normalmente. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-1 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
