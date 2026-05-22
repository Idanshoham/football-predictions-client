import { MatchCard } from '../components/MatchCard';
import { MOCK_MATCHES } from '../mock-data';

export function Live() {
  const live = MOCK_MATCHES.filter(
    (m) => m.status === 'live' || m.status === 'halftime',
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">משחקים חיים</h1>
        <p className="text-sm text-slate-400">
          תחזיות חבריך נחשפות כאן כשמשחק מתחיל. עדכון מתבצע כל 30 שניות.
        </p>
      </header>

      {live.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-10 text-center text-slate-500">
          <div className="text-3xl mb-2">📺</div>
          <p>אין כרגע משחק חי.</p>
          <p className="text-xs text-slate-600 mt-2">
            כשמשחק יתחיל הוא יופיע כאן עם תחזיות כל המשתתפים.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {live.map((m) => (
            <div key={m.id} className="space-y-2">
              <MatchCard match={m} />
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 px-4 py-3 text-xs">
                <div className="font-semibold mb-2 text-slate-300">
                  תחזיות כל המשתתפים
                </div>
                <div className="text-slate-500">
                  (יופיע כשרשימת המשתתפים תעלה. כרגע מסך זמני.)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
