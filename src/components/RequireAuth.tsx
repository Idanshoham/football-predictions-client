import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { Login } from '../pages/Login';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth();

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-sm">טוען...</div>
      </main>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <>{children}</>;
}
