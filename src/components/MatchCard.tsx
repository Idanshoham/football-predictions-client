import { formatIsraelDateTime, formatIsraelTime } from '../lib/time';
import type { Match } from '../types';

interface Props {
  match: Match;
  /** Right-side annotation, e.g. "+5" points earned or a status badge. */
  annotation?: React.ReactNode;
  onClick?: () => void;
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'live')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
        <span className="size-2 rounded-full bg-red-500 animate-pulse" />
        חי
      </span>
    );
  if (status === 'halftime')
    return <span className="text-xs font-semibold text-amber-400">מחצית</span>;
  if (status === 'full_time')
    return <span className="text-xs font-semibold text-slate-400">הסתיים</span>;
  if (status === 'postponed')
    return <span className="text-xs font-semibold text-amber-500">נדחה</span>;
  if (status === 'cancelled')
    return <span className="text-xs font-semibold text-rose-500">בוטל</span>;
  return null;
}

export function MatchCard({ match, annotation, onClick }: Props) {
  const isFinished = match.status === 'full_time';
  const isLive = match.status === 'live' || match.status === 'halftime';
  const showScore = isFinished || isLive;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-start bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition p-4 flex items-center gap-3"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 text-base font-medium">
          <span className="text-2xl shrink-0">{match.homeTeam.flagEmoji}</span>
          <span className="truncate">{match.homeTeam.nameHe}</span>
          {showScore && (
            <span className="ms-auto tabular-nums font-bold text-lg">
              {match.homeScore}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-base font-medium">
          <span className="text-2xl shrink-0">{match.awayTeam.flagEmoji}</span>
          <span className="truncate">{match.awayTeam.nameHe}</span>
          {showScore && (
            <span className="ms-auto tabular-nums font-bold text-lg">
              {match.awayScore}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <StatusBadge status={match.status} />
          <span>·</span>
          <span>
            {match.status === 'scheduled'
              ? formatIsraelDateTime(match.kickoffAt)
              : formatIsraelTime(match.kickoffAt)}
          </span>
          {match.stage !== 'group' && (
            <>
              <span>·</span>
              <span>{stageLabelHe(match.stage)}</span>
            </>
          )}
        </div>
      </div>

      {annotation && <div className="shrink-0 ms-2">{annotation}</div>}
    </button>
  );
}

function stageLabelHe(stage: Match['stage']): string {
  switch (stage) {
    case 'r32':
      return 'שמינית הגמר';
    case 'r16':
      return 'שמינית';
    case 'qf':
      return 'רבע הגמר';
    case 'sf':
      return 'חצי הגמר';
    case 'final':
      return 'הגמר';
    case 'third':
      return 'משחק על המקום השלישי';
    default:
      return '';
  }
}
