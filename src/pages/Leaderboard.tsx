import { useLeaderboard } from '../lib/hooks';

export function Leaderboard() {
  const { data: rows = [], isLoading } = useLeaderboard();

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">הטבלה</h1>
        <p className="text-sm text-slate-400">
          מדורג לפי סך נקודות, ואז לפי תחזיות מדויקות, ואז לפי תוצאות נכונות.
        </p>
      </header>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_4rem_3rem_3rem] gap-2 px-4 py-2 text-xs text-slate-500 uppercase tracking-wide bg-slate-900/60">
          <div>דירוג</div>
          <div>שם</div>
          <div className="text-center">נק׳</div>
          <div className="text-center">מדויק</div>
          <div className="text-center">תוצאה</div>
        </div>

        {isLoading && (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">
            טוען...
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">
            עוד אין משתתפים
          </div>
        )}

        {rows.map((row) => (
          <div
            key={row.userId}
            className="grid grid-cols-[2.5rem_1fr_4rem_3rem_3rem] gap-2 px-4 py-3 items-center"
          >
            <div className="font-bold text-slate-400 tabular-nums">{row.rank}</div>
            <div className="font-medium truncate">{row.name}</div>
            <div className="text-center font-bold tabular-nums">{row.totalPoints}</div>
            <div className="text-center tabular-nums text-slate-400">{row.exactCount}</div>
            <div className="text-center tabular-nums text-slate-400">{row.correctResultCount}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 text-center pt-2">
        הטורניר עוד לא התחיל. החל מ-11 ביוני 2026 הנקודות יתחילו להצטבר.
      </p>
    </section>
  );
}
