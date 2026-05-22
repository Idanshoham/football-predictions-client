import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthState {
  session: Session | null;
  ready: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const DEMO_MODE =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// A minimal fake session used in demo mode so the UI is navigable
// without Supabase credentials (matches the shape we read from `session.user`).
const DEMO_SESSION = {
  access_token: 'demo',
  refresh_token: '',
  expires_in: 3600,
  expires_at: 0,
  token_type: 'bearer',
  user: {
    id: 'demo-user',
    aud: 'authenticated',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'משתמש דמו',
      avatar_url: undefined,
    },
    app_metadata: {},
    created_at: new Date().toISOString(),
  },
} as unknown as Session;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(
    DEMO_MODE ? DEMO_SESSION : null,
  );
  const [ready, setReady] = useState(DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (DEMO_MODE) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
  };

  const signOut = async () => {
    if (DEMO_MODE) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, ready, isDemoMode: DEMO_MODE, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
