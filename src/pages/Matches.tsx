import { useMemo, useState } from 'react';
import { MatchCard } from '../components/MatchCard';
import { PredictionSheet } from '../components/PredictionSheet';
import { useMatches, useMyPredictions, useUpsertPrediction } from '../lib/hooks';
import type { Match } from '../types';

export function Matches() {
  const { data: upcoming = [] } = useMatches('upcoming');
  const { data: past = [] } = useMatches('past');
  const { data: myPredictions = [] } = useMyPredictions();
  const upsert = useUpsertPrediction();

  const predictionByMatchId = useMemo(() => {
    const map = new Map<string, (typeof myPredictions)[number]>();
    for (const p of myPredictions) map.set(p.matchId, p);
    return map;
  }, [myPredictions]);

  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const activePrediction = activeMatch
    ? (predictionByMatchId.get(activeMatch.id) ?? null)
    : null;

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
            const pred = predictionByMatchId.get(m.id);
            return (
              <MatchCard
                key={m.id}
                match={m}
                onClick={() => setActiveMatch(m)}
                annotation={
                  pred ? (
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-900/40 rounded-full px-2 py-1">
                      {pred.homeScorePred}-{pred.awayScorePred}
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
          {past.map((m) => {
            const pred = predictionByMatchId.get(m.id);
            return (
              <MatchCard
                key={m.id}
                match={m}
                annotation={
                  pred ? (
                    <span className="text-xs font-bold text-emerald-400">
                      +{pred.pointsTotal} נק׳
                    </span>
                  ) : null
                }
              />
            );
          })}
        </div>
      </div>

      {activeMatch && (
        <PredictionSheet
          open
          match={activeMatch}
          players={[]}
          initial={activePrediction}
          onClose={() => setActiveMatch(null)}
          onSubmit={async (input) => {
            await upsert.mutateAsync({
              matchId: activeMatch.id,
              ...input,
            });
          }}
        />
      )}
    </section>
  );
}
