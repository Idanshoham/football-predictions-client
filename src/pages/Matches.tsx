import { useMemo, useState } from 'react';
import { MatchCard } from '../components/MatchCard';
import { PredictionSheet } from '../components/PredictionSheet';
import { MOCK_MATCHES } from '../mock-data';
import { isPast } from '../lib/time';
import type { Match, MyPrediction } from '../types';

export function Matches() {
  const { upcoming, past } = useMemo(() => {
    const upcoming = MOCK_MATCHES.filter(
      (m) => m.status === 'scheduled' && !isPast(m.kickoffAt),
    );
    const past = MOCK_MATCHES.filter((m) => m.status === 'full_time');
    return { upcoming, past };
  }, []);

  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [drafts, setDrafts] = useState<Record<string, MyPrediction>>({});

  function handleSubmit(input: {
    homeScorePred: number;
    awayScorePred: number;
    firstScorerPlayerId: string | null;
  }) {
    if (!activeMatch) return;
    setDrafts({
      ...drafts,
      [activeMatch.id]: {
        matchId: activeMatch.id,
        ...input,
        pointsTotal: 0,
      },
    });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">משחקים</h1>
        <p className="text-sm text-slate-400">
          הגשת תחזיות עד שריקת הפתיחה של כל משחק. אחרי שריקת הפתיחה, התחזית
          ננעלת.
        </p>
      </header>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 px-1">
          המשחקים הקרובים
        </h2>
        {upcoming.length === 0 && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-6 text-center text-slate-500 text-sm">
            אין משחקים קרובים כרגע
          </div>
        )}
        <div className="space-y-2">
          {upcoming.map((m) => {
            const draft = drafts[m.id];
            return (
              <MatchCard
                key={m.id}
                match={m}
                onClick={() => setActiveMatch(m)}
                annotation={
                  draft ? (
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-900/40 rounded-full px-2 py-1">
                      {draft.homeScorePred}-{draft.awayScorePred}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800 rounded-full px-2 py-1">
                      נחש
                    </span>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 px-1">משחקי עבר</h2>
        {past.length === 0 && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-6 text-center text-slate-500 text-sm">
            עוד לא הסתיים אף משחק
          </div>
        )}
        <div className="space-y-2">
          {past.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              annotation={
                <span className="text-xs font-bold text-emerald-400">
                  +0 נק׳
                </span>
              }
            />
          ))}
        </div>
      </div>

      {activeMatch && (
        <PredictionSheet
          open={true}
          match={activeMatch}
          players={[]}
          initial={drafts[activeMatch.id] ?? null}
          onClose={() => setActiveMatch(null)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
