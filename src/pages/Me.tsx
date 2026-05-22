import { useAuth } from '../lib/auth';

export function Me() {
  const { session, signOut } = useAuth();
  const name =
    (session?.user.user_metadata?.full_name as string | undefined) ??
    (session?.user.user_metadata?.name as string | undefined) ??
    session?.user.email ??
    '';
  const email = session?.user.email ?? '';
  const avatar =
    (session?.user.user_metadata?.avatar_url as string | undefined) ??
    (session?.user.user_metadata?.picture as string | undefined);

  return (
    <section className="space-y-5">
      <header className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-slate-800 grid place-items-center overflow-hidden text-2xl">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{name}</h1>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="נק׳ סה״כ" value="0" />
        <Stat label="מדויק" value="0" />
        <Stat label="תוצאה נכונה" value="0" />
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-6 text-center text-slate-500">
        <div className="text-3xl mb-2">📊</div>
        <p>היסטוריה תופיע כאן עם פתיחת הטורניר.</p>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="w-full bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800/50 text-rose-200 rounded-xl py-3 font-medium transition"
      >
        התנתק
      </button>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 px-3 py-4 text-center">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
