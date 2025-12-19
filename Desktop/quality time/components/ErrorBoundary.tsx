import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to external service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050b18] flex items-center justify-center text-white px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-serif font-bold text-[#c5a059] mb-4">حدث خطأ ما</h1>
            <p className="text-gray-400 mb-6">
              نعتذر عن هذا الإزعاج. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#c5a059] text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#e2c58a] transition-colors"
            >
              تحديث الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-500 text-sm">
                  تفاصيل الخطأ (وضع التطوير)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/20 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
