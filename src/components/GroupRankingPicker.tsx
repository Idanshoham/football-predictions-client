import { useState } from 'react';
import type { Team } from '../types';

interface Props {
  groupName: string;
  teams: Team[];
  initial?: string[]; // team ids in current ranking
  locked: boolean;
  onChange?: (ranking: string[]) => void;
}

export function GroupRankingPicker({
  groupName,
  teams,
  initial,
  locked,
  onChange,
}: Props) {
  const [ranking, setRanking] = useState<string[]>(
    initial && initial.length === teams.length ? initial : teams.map((t) => t.id),
  );

  const teamsById = new Map(teams.map((t) => [t.id, t]));

  function swap(idx: number, delta: number) {
    const next = [...ranking];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setRanking(next);
    onChange?.(next);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-baseline justify-between">
        <h3 className="font-semibold">בית {groupName}</h3>
        <span className="text-xs text-slate-500">
          5 נק׳ לכל מקום נכון
        </span>
      </div>
      <ul className="divide-y divide-slate-800">
        {ranking.map((teamId, idx) => {
          const team = teamsById.get(teamId);
          if (!team) return null;
          return (
            <li
              key={teamId}
              className="px-3 py-2.5 flex items-center gap-3"
            >
              <span className="size-7 grid place-items-center rounded-full bg-slate-800 text-xs font-bold tabular-nums shrink-0">
                {idx + 1}
              </span>
              <span className="text-2xl shrink-0">{team.flagEmoji}</span>
              <span className="flex-1 font-medium truncate">{team.nameHe}</span>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => swap(idx, -1)}
                  disabled={locked || idx === 0}
                  className="size-8 grid place-items-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
                  aria-label="העלה דירוג"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => swap(idx, 1)}
                  disabled={locked || idx === ranking.length - 1}
                  className="size-8 grid place-items-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
                  aria-label="הורד דירוג"
                >
                  ▼
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
