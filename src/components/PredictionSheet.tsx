import { useEffect, useMemo, useState } from 'react';
import type { Match, Player, MyPrediction } from '../types';
import { formatIsraelDateTime, secondsUntil, countdownHebrew } from '../lib/time';

interface Props {
  open: boolean;
  match: Match;
  /** Combined roster of both teams. Empty if not loaded yet. */
  players: Player[];
  initial?: MyPrediction | null;
  onClose: () => void;
  onSubmit: (input: {
    homeScorePred: number;
    awayScorePred: number;
    firstScorerPlayerId: string | null;
  }) => Promise<void> | void;
}

const SCORE_MIN = 0;
const SCORE_MAX = 20;

export function PredictionSheet({ open, match, players, initial, onClose, onSubmit }: Props) {
  const [home, setHome] = useState<number>(initial?.homeScorePred ?? 0);
  const [away, setAway] = useState<number>(initial?.awayScorePred ?? 0);
  const [scorerId, setScorerId] = useState<string | null>(
    initial?.firstScorerPlayerId ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Re-render the countdown every second while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHome(initial?.homeScorePred ?? 0);
      setAway(initial?.awayScorePred ?? 0);
      setScorerId(initial?.firstScorerPlayerId ?? null);
      setError(null);
    }
  }, [open, initial]);

  const secondsLeft = secondsUntil(match.kickoffAt);
  const locked = secondsLeft <= 0 || match.status !== 'scheduled';
  const closeToKickoff = secondsLeft > 0 && secondsLeft <= 60 * 60;

  const sides: { side: 'home' | 'away'; team: Match['homeTeam']; list: Player[] }[] =
    useMemo(
      () => [
        {
          side: 'home',
          team: match.homeTeam,
          list: players.filter((p) => p.teamId === match.homeTeam.id),
        },
        {
          side: 'away',
          team: match.awayTeam,
          list: players.filter((p) => p.teamId === match.awayTeam.id),
        },
      ],
      [players, match.homeTeam, match.awayTeam],
    );

  if (!open) return null;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        homeScorePred: home,
        awayScorePred: away,
        firstScorerPlayerId: scorerId,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בשמירה');
    } finally {
      setSubmitting(false);
    }
  }

  // Force "now" usage for next render — `now` already feeds the countdown.
  void now;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="סגור"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm">הימור על המשחק</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div className="text-center text-xs text-slate-500">
            {formatIsraelDateTime(match.kickoffAt)}
          </div>

          {closeToKickoff && !locked && (
            <div
              className={`text-center text-xs rounded-lg px-3 py-2 ${
                secondsLeft <= 60
                  ? 'bg-rose-950/60 border border-rose-700 text-rose-200'
                  : secondsLeft <= 5 * 60
                  ? 'bg-amber-950/60 border border-amber-700 text-amber-200'
                  : 'bg-slate-800/60 border border-slate-700 text-slate-300'
              }`}
            >
              שריקת פתיחה {countdownHebrew(match.kickoffAt)}
            </div>
          )}

          {locked && (
            <div className="text-center text-xs rounded-lg px-3 py-2 bg-slate-800/60 border border-slate-700 text-slate-400">
              ההימור נעול. אי אפשר לשנות יותר.
            </div>
          )}

          <ScoreStepper
            team={match.homeTeam}
            value={home}
            onChange={setHome}
            disabled={locked}
          />
          <ScoreStepper
            team={match.awayTeam}
            value={away}
            onChange={setAway}
            disabled={locked}
          />

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              כובש השער הראשון (+5 נק׳)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-slate-950/40 border border-slate-800 rounded-lg p-2">
              <button
                type="button"
                disabled={locked}
                onClick={() => setScorerId(null)}
                className={`w-full text-start px-3 py-2 rounded-md text-sm transition ${
                  scorerId === null
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                ללא בחירה
              </button>
              {sides.map(({ side, team, list }) => (
                <div key={side}>
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <span>{team.flagEmoji}</span>
                    <span>{team.nameHe}</span>
                  </div>
                  {list.length === 0 && (
                    <div className="px-3 py-1 text-xs text-slate-600">
                      סגל עוד לא טעון
                    </div>
                  )}
                  {list.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setScorerId(p.id)}
                      className={`w-full text-start px-3 py-2 rounded-md text-sm transition ${
                        scorerId === p.id
                          ? 'bg-emerald-900/60 text-emerald-100'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {p.nameHe}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-950/60 border border-rose-700 text-rose-200 px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            disabled={locked || submitting}
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl py-3 font-semibold transition"
          >
            {submitting ? 'שומר...' : locked ? 'נעול' : 'שמור הימור'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreStepper({
  team,
  value,
  onChange,
  disabled,
}: {
  team: Match['homeTeam'];
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-3">
      <span className="text-3xl">{team.flagEmoji}</span>
      <span className="flex-1 font-medium truncate">{team.nameHe}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= SCORE_MIN}
          onClick={() => onChange(Math.max(SCORE_MIN, value - 1))}
          className="size-10 grid place-items-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-xl font-bold transition"
          aria-label="הפחת"
        >
          −
        </button>
        <span className="w-10 text-center text-2xl font-bold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          disabled={disabled || value >= SCORE_MAX}
          onClick={() => onChange(Math.min(SCORE_MAX, value + 1))}
          className="size-10 grid place-items-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-xl font-bold transition"
          aria-label="הוסף"
        >
          +
        </button>
      </div>
    </div>
  );
}
