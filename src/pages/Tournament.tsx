import { useState } from 'react';
import { LockBanner } from '../components/LockBanner';
import { BracketView } from '../components/BracketView';
import { GroupRankingPicker } from '../components/GroupRankingPicker';
import { TeamPickerSheet } from '../components/TeamPickerSheet';
import {
  TOURNAMENT_OPENER_ISO,
  MOCK_TEAMS,
  MOCK_GROUPS,
  GROUP_NAMES,
} from '../mock-data';
import { isPast } from '../lib/time';
import type { Team } from '../types';

export function Tournament() {
  const isLocked = isPast(TOURNAMENT_OPENER_ISO);
  const [champion, setChampion] = useState<Team | null>(null);
  const [championPickerOpen, setChampionPickerOpen] = useState(false);

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

      <TwoUpCard>
        <PickCard
          title="אלוף המונדיאל"
          emoji="🏆"
          pointsHe="+20 נק׳"
          subtitle="הקבוצה שלפי דעתך תזכה בטורניר"
          selectedName={champion?.nameHe}
          selectedFlag={champion?.flagEmoji}
          locked={isLocked}
          onClick={() => setChampionPickerOpen(true)}
        />
        <PickCard
          title="מלך השערים"
          emoji="⚽"
          pointsHe="+20 נק׳"
          subtitle="השחקן עם מספר השערים הגבוה ביותר"
          selectedName={null}
          locked={isLocked}
          onClick={() => {
            // Player picker is a follow-up — needs full rosters.
          }}
        />
      </TwoUpCard>

      <Section title="דירוגי הבתים" subtitle="5 נקודות לכל קבוצה במקום הנכון בכל בית.">
        <div className="space-y-3">
          {GROUP_NAMES.map((g) => (
            <GroupRankingPicker
              key={g}
              groupName={g}
              teams={MOCK_GROUPS[g]}
              locked={isLocked}
            />
          ))}
        </div>
      </Section>

      <Section
        title="סוללת הנוקאאוט"
        subtitle="5 נקודות לכל מנצח שצדקת בו. ניתן לערוך פעם אחת בסיום שלב הבתים."
      >
        <BracketView teams={MOCK_TEAMS} locked={isLocked} />
      </Section>

      <TeamPickerSheet
        open={championPickerOpen}
        title="בחר את אלוף המונדיאל"
        teams={MOCK_TEAMS}
        selectedId={champion?.id ?? null}
        onPick={(t) => setChampion(t)}
        onClose={() => setChampionPickerOpen(false)}
      />
    </section>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <h2 className="text-base font-semibold text-slate-200">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function TwoUpCard({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function PickCard({
  title,
  emoji,
  pointsHe,
  subtitle,
  selectedName,
  selectedFlag,
  locked,
  onClick,
}: {
  title: string;
  emoji: string;
  pointsHe: string;
  subtitle: string;
  selectedName: string | null | undefined;
  selectedFlag?: string;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="w-full text-start bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 disabled:opacity-60 disabled:hover:border-slate-800 px-4 py-4 flex items-start gap-3 transition"
    >
      <div className="text-3xl shrink-0">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs font-bold text-emerald-400">{pointsHe}</span>
        </div>
        {selectedName ? (
          <div className="mt-2 flex items-center gap-2">
            {selectedFlag && <span className="text-2xl">{selectedFlag}</span>}
            <span className="font-medium">{selectedName}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </button>
  );
}
