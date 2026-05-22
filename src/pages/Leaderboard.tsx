import { MOCK_LEADERBOARD } from '../mock-data';

export function Leaderboard() {
  const rows = MOCK_LEADERBOARD;

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

        {rows.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">
            עוד אין משתתפים
          </div>
        )}

        {rows.map((row) => (
          <button
            key={row.userId}
            type="button"
            className="w-full grid grid-cols-[2.5rem_1fr_4rem_3rem_3rem] gap-2 px-4 py-3 items-center hover:bg-slate-800/50 transition text-start"
          >
            <div className="font-bold text-slate-400 tabular-nums">
              {row.rank}
            </div>
            <div className="font-medium truncate">{row.name}</div>
            <div className="text-center font-bold tabular-nums">
              {row.totalPoints}
            </div>
            <div className="text-center tabular-nums text-slate-400">
              {row.exactCount}
            </div>
            <div className="text-center tabular-nums text-slate-400">
              {row.correctResultCount}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 text-center pt-2">
        הטורניר עוד לא התחיל. החל מ-11 ביוני 2026 הנקודות יתחילו להצטבר.
      </p>
    </section>
  );
}
