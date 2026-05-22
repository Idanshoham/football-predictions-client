import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Prevents the entire app from rendering
 * a blank page when a render-time error escapes.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-lg font-bold">משהו השתבש</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              קרתה שגיאה בלתי צפויה בטעינת האפליקציה. רענן את הדף ונסה שוב.
            </p>
            <details className="text-start text-xs text-slate-500 pt-2">
              <summary className="cursor-pointer text-slate-400">פרטים טכניים</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 w-full bg-slate-100 text-slate-900 rounded-xl py-2.5 font-semibold hover:bg-white transition"
            >
              רענן
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
