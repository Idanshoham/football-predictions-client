import { createClient } from '@supabase/supabase-js';

// In demo mode (env vars missing), we still create a client with a placeholder
// URL so the SDK doesn't throw at module load. `auth.tsx` detects demo mode
// and never actually calls any supabase.* method in that case.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://demo.invalid';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Running in DEMO mode — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Auth is bypassed and no real backend calls are made.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
