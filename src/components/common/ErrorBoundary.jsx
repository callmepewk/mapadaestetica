import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for debugging
    console.error("UI ErrorBoundary caught: ", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] m-4 p-4 rounded-lg border-2 border-red-200 bg-red-50 text-red-800">
          <h2 className="font-bold text-lg mb-2">Ocorreu um erro ao carregar esta página.</h2>
          <p className="text-sm mb-2">Detalhes técnicos (ajuda a corrigir rapidamente):</p>
          <pre className="text-xs overflow-auto whitespace-pre-wrap bg-white/70 p-3 rounded border border-red-100">
            {String(this.state.error?.message || this.state.error || 'Unknown error')}
          </pre>
          {this.state.info?.componentStack && (
            <details className="mt-2 text-xs">
              <summary>Stack</summary>
              <pre className="overflow-auto whitespace-pre-wrap bg-white/70 p-3 rounded border border-red-100">{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}