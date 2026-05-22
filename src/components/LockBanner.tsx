import { countdownHebrew, isPast } from '../lib/time';

type State = 'open' | 'locked-final' | 'edit-window' | 'locked-permanently';

interface Props {
  state: State;
  /** ISO instant the next state transition will happen at. */
  nextTransitionAt?: string;
}

const COPY: Record<State, { title: string; tone: string }> = {
  open: {
    title: 'ניתן לערוך עד תחילת המשחק הראשון',
    tone: 'bg-emerald-900/40 border-emerald-700/40 text-emerald-200',
  },
  'locked-final': {
    title: 'נעול',
    tone: 'bg-slate-800/80 border-slate-700 text-slate-300',
  },
  'edit-window': {
    title: 'חלון עריכה פתוח עד תחילת שמינית הגמר',
    tone: 'bg-amber-900/40 border-amber-700/40 text-amber-200',
  },
  'locked-permanently': {
    title: 'נעול לצמיתות',
    tone: 'bg-slate-800/80 border-slate-700 text-slate-400',
  },
};

export function LockBanner({ state, nextTransitionAt }: Props) {
  const { title, tone } = COPY[state];
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
      <div className="font-medium">{title}</div>
      {nextTransitionAt && !isPast(nextTransitionAt) && (
        <div className="text-xs opacity-80 mt-1">
          {state === 'open' && `הנעילה: ${countdownHebrew(nextTransitionAt)}`}
          {state === 'edit-window' && `סגירה: ${countdownHebrew(nextTransitionAt)}`}
          {state === 'locked-final' && `חלון העריכה ייפתח בסיום שלב הבתים`}
        </div>
      )}
    </div>
  );
}
