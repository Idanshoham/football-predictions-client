import { MatchCard } from '../components/MatchCard';
import { useMatches, usePredictionsForMatch } from '../lib/hooks';
import type { Match } from '../types';

export function Live() {
  const { data: live = [] } = useMatches('live');

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
            <LiveMatchPanel key={m.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function LiveMatchPanel({ match }: { match: Match }) {
  const { data, isLoading } = usePredictionsForMatch(match.id);
  const others = data?.others ?? [];
  const mine = data?.mine;

  return (
    <div className="space-y-2">
      <MatchCard match={match} />
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading && (
          <div className="px-4 py-4 text-center text-slate-500 text-xs">
            טוען תחזיות...
          </div>
        )}

        {mine && (
          <div className="px-4 py-3 border-b border-slate-800 bg-emerald-950/30">
            <div className="text-xs text-emerald-300 font-semibold">
              התחזית שלך
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm">
                {match.homeTeam.flagEmoji} {mine.homeScorePred} -{' '}
                {mine.awayScorePred} {match.awayTeam.flagEmoji}
              </div>
              <div className="text-xs font-bold text-emerald-400">
                +{mine.pointsTotal} נק׳
              </div>
            </div>
          </div>
        )}

        {others.length === 0 && !isLoading && (
          <div className="px-4 py-4 text-center text-slate-500 text-xs">
            אין תחזיות נוספות לחשוף
          </div>
        )}

        <ul className="divide-y divide-slate-800">
          {others.map((p) => (
            <li
              key={p.userId}
              className="px-4 py-2.5 flex items-center justify-between gap-2"
            >
              <div className="font-medium truncate text-sm">{p.userName}</div>
              <div className="flex items-center gap-3 text-sm shrink-0">
                <span className="tabular-nums text-slate-300">
                  {p.homeScorePred}-{p.awayScorePred}
                </span>
                <span className="text-xs font-bold text-emerald-400 tabular-nums w-12 text-end">
                  +{p.pointsTotalForThisMatch}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
