import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSlots,
  ROUND_TAB_LABEL_HE,
  ROUNDS_IN_ORDER,
  slotsByRound,
  type BracketRound,
} from '../lib/bracket';
import type { Team } from '../types';
import { TeamPickerSheet } from './TeamPickerSheet';

type PicksMap = Record<string, string>; // slotId → teamId

interface Props {
  teams: Team[];
  locked: boolean;
  /** Initial picks from server (when wired to backend). */
  initialPicks?: PicksMap;
  /** Called when picks change. Used by the parent to persist via API. */
  onChange?: (picks: PicksMap) => void;
}

const STORAGE_KEY = 'wc26:bracket-draft';

export function BracketView({ teams, locked, initialPicks, onChange }: Props) {
  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const slots = useMemo(buildSlots, []);
  const groupedSlots = useMemo(slotsByRound, []);
  const [round, setRound] = useState<BracketRound>('r32');
  const [picks, setPicks] = useState<PicksMap>(
    () => initialPicks ?? loadDraft(),
  );
  const [pickerForSlot, setPickerForSlot] = useState<string | null>(null);

  // If the server later sends initial picks, hydrate once.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && initialPicks && Object.keys(initialPicks).length > 0) {
      setPicks(initialPicks);
      saveDraft(initialPicks);
      hydratedRef.current = true;
    }
  }, [initialPicks]);

  const completed = slots.filter((s) => picks[s.id]).length;
  const percent = Math.round((completed / slots.length) * 100);

  function setPick(slotId: string, team: Team) {
    const next = { ...picks, [slotId]: team.id };
    setPicks(next);
    saveDraft(next);
    onChange?.(next);
  }

  function clearPick(slotId: string) {
    const next = { ...picks };
    delete next[slotId];
    setPicks(next);
    saveDraft(next);
    onChange?.(next);
  }

  return (
    <div className="space-y-3">
      <ProgressBar completed={completed} total={slots.length} percent={percent} />

      <RoundTabs round={round} setRound={setRound} />

      <ul className="space-y-2">
        {groupedSlots[round].map((slot) => {
          const teamId = picks[slot.id];
          const team = teamId ? teamsById.get(teamId) : null;
          return (
            <li
              key={slot.id}
              className="bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 transition hover:border-slate-700 has-[:disabled]:opacity-60"
            >
              <button
                type="button"
                disabled={locked}
                onClick={() => setPickerForSlot(slot.id)}
                className="flex-1 px-4 py-3 flex items-center gap-3 text-start min-w-0"
              >
                <div className="text-xs text-slate-500 shrink-0 w-16">
                  {slot.label.split('·')[1]?.trim() ?? slot.label}
                </div>
                <div className="flex-1 min-w-0">
                  {team ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{team.flagEmoji}</span>
                      <span className="font-semibold truncate">{team.nameHe}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">
                      בחר את המנצח (+5 נק׳)
                    </span>
                  )}
                </div>
              </button>
              {team && !locked && (
                <button
                  type="button"
                  onClick={() => clearPick(slot.id)}
                  className="px-3 py-3 text-slate-500 hover:text-slate-200 transition"
                  aria-label="מחק בחירה"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <TeamPickerSheet
        open={!!pickerForSlot}
        title={
          pickerForSlot
            ? slots.find((s) => s.id === pickerForSlot)?.label ?? 'בחר קבוצה'
            : 'בחר קבוצה'
        }
        teams={teams}
        selectedId={pickerForSlot ? picks[pickerForSlot] : null}
        onPick={(team) => {
          if (pickerForSlot) setPick(pickerForSlot, team);
        }}
        onClose={() => setPickerForSlot(null)}
      />
    </div>
  );
}

function ProgressBar({
  completed,
  total,
  percent,
}: {
  completed: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-baseline justify-between text-xs text-slate-400">
        <span>השלמת {completed} מתוך {total} משחקים</span>
        <span className="font-bold text-slate-200 tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function RoundTabs({
  round,
  setRound,
}: {
  round: BracketRound;
  setRound: (r: BracketRound) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
      {ROUNDS_IN_ORDER.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRound(r)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            r === round
              ? 'bg-slate-100 text-slate-900 border-slate-100'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          {ROUND_TAB_LABEL_HE[r]}
        </button>
      ))}
    </div>
  );
}

function loadDraft(): PicksMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveDraft(picks: PicksMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
  } catch {
    // localStorage full / disabled — UI keeps working in-memory.
  }
}
