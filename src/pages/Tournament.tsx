import { LockBanner } from '../components/LockBanner';
import { TOURNAMENT_OPENER_ISO } from '../mock-data';
import { isPast } from '../lib/time';

export function Tournament() {
  const isLocked = isPast(TOURNAMENT_OPENER_ISO);

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">תחזיות הטורניר</h1>
        <p className="text-sm text-slate-400">
          חזה את האלוף, את מלך השערים, את דירוגי הבתים ואת כל סוללת הנוקאאוט.
          הכול ננעל בשריקת פתיחת המשחק הראשון.
        </p>
      </header>

      <LockBanner
        state={isLocked ? 'locked-final' : 'open'}
        nextTransitionAt={TOURNAMENT_OPENER_ISO}
      />

      <Card title="אלוף המונדיאל" emoji="🏆" pointsHe="+20 נק׳" placeholder="בחר את הקבוצה שלפי דעתך תזכה בטורניר" />
      <Card title="מלך השערים" emoji="⚽" pointsHe="+20 נק׳" placeholder="בחר את השחקן שלפי דעתך יסיים עם מספר השערים הגבוה ביותר" />

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200 px-1">
          דירוגי הבתים
        </h2>
        <p className="text-xs text-slate-500 px-1">
          5 נקודות לכל קבוצה במקום הנכון בכל בית. עד 240 נקודות.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(
            (g) => (
              <div
                key={g}
                className="bg-slate-900 rounded-xl border border-slate-800 px-3 py-3 text-center"
              >
                <div className="text-xs text-slate-500">בית</div>
                <div className="text-lg font-bold">{g}</div>
                <div className="text-xs text-slate-500 mt-1">דרג</div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200 px-1">
          סוללת הנוקאאוט
        </h2>
        <p className="text-xs text-slate-500 px-1">
          5 נקודות לכל מנצח שצדקת בו (R32, R16, רבע, חצי, גמר, מקום שלישי).
          ניתן לערוך פעם אחת בסיום שלב הבתים.
        </p>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-8 text-center text-slate-500">
          <div className="text-3xl mb-2">🌳</div>
          <p>סוללת הנוקאאוט תופיע כאן.</p>
          <p className="text-xs text-slate-600 mt-2">
            במובייל: רשימה אנכית סיבוב-סיבוב.
            <br />
            בדסקטופ: עץ אופקי במראה RTL.
          </p>
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  emoji,
  pointsHe,
  placeholder,
}: {
  title: string;
  emoji: string;
  pointsHe: string;
  placeholder: string;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-4 flex items-start gap-3">
      <div className="text-3xl shrink-0">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs font-bold text-emerald-400">{pointsHe}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{placeholder}</p>
        <button
          type="button"
          className="mt-3 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-1.5 transition"
        >
          בחר
        </button>
      </div>
    </div>
  );
}
