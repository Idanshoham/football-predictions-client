import { useMemo, useState } from 'react';
import { LockBanner } from '../components/LockBanner';
import { BracketView } from '../components/BracketView';
import { GroupRankingPicker } from '../components/GroupRankingPicker';
import { TeamPickerSheet } from '../components/TeamPickerSheet';
import { PlayerPickerSheet } from '../components/PlayerPickerSheet';
import {
  useTeams,
  usePlayers,
  useTournamentInfo,
  useMyTournamentPrediction,
  useUpsertTournamentPrediction,
  useMyGroupRankings,
  useUpsertGroupRanking,
  useMyBracket,
  useUpsertBracket,
} from '../lib/hooks';
import type { Player, Team } from '../types';

export function Tournament() {
  const { data: tournamentInfo } = useTournamentInfo();
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();
  const { data: myTournament } = useMyTournamentPrediction();
  const upsertTournament = useUpsertTournamentPrediction();
  const { data: myGroups = [] } = useMyGroupRankings();
  const upsertGroup = useUpsertGroupRanking();
  const { data: myBracket } = useMyBracket();
  const upsertBracket = useUpsertBracket();

  const [championPickerOpen, setChampionPickerOpen] = useState(false);
  const [goldenBootPickerOpen, setGoldenBootPickerOpen] = useState(false);

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const playersById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const groupsByName = useMemo(() => {
    const map = new Map<string, Team[]>();
    for (const t of teams) {
      if (!t.groupName) continue;
      const arr = map.get(t.groupName) ?? [];
      arr.push(t);
      map.set(t.groupName, arr);
    }
    return map;
  }, [teams]);

  const groupNames = useMemo(
    () => [...groupsByName.keys()].sort(),
    [groupsByName],
  );

  const myGroupByName = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const g of myGroups) map.set(g.groupName, g.ranking);
    return map;
  }, [myGroups]);

  const initialBracketPicks = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of myBracket?.picks ?? []) map[p.matchSlot] = p.winnerTeamId;
    return map;
  }, [myBracket]);

  const champion = myTournament?.championTeamId
    ? (teamsById.get(myTournament.championTeamId) ?? null)
    : null;
  const goldenBoot = myTournament?.goldenBootPlayerId
    ? (playersById.get(myTournament.goldenBootPlayerId) ?? null)
    : null;

  const bracketLockState = tournamentInfo?.bracketLockState ?? 'open';
  const tournamentLocked = tournamentInfo?.tournamentLocked ?? false;

  function handleSelectChampion(team: Team) {
    upsertTournament.mutate({
      championTeamId: team.id,
      goldenBootPlayerId: myTournament?.goldenBootPlayerId ?? null,
    });
  }
  function handleSelectGoldenBoot(player: Player) {
    upsertTournament.mutate({
      championTeamId: myTournament?.championTeamId ?? null,
      goldenBootPlayerId: player.id,
    });
  }

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
        state={bracketLockState}
        nextTransitionAt={tournamentInfo?.openerKickoffAt}
      />

      <PickCard
        title="אלוף המונדיאל"
        emoji="🏆"
        pointsHe="+20 נק׳"
        subtitle="הקבוצה שלפי דעתך תזכה בטורניר"
        selectedName={champion?.nameHe}
        selectedFlag={champion?.flagEmoji}
        locked={tournamentLocked}
        onClick={() => setChampionPickerOpen(true)}
      />
      <PickCard
        title="מלך השערים"
        emoji="⚽"
        pointsHe="+20 נק׳"
        subtitle={
          players.length === 0
            ? 'סגלי הקבוצות עוד לא נטענו'
            : 'השחקן עם מספר השערים הגבוה ביותר'
        }
        selectedName={goldenBoot?.nameHe}
        locked={tournamentLocked || players.length === 0}
        onClick={() => setGoldenBootPickerOpen(true)}
      />

      <Section
        title="דירוגי הבתים"
        subtitle="5 נקודות לכל קבוצה במקום הנכון בכל בית."
      >
        <div className="space-y-3">
          {groupNames.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-6 text-center text-slate-500 text-sm">
              אין בתים זמינים עדיין
            </div>
          )}
          {groupNames.map((g) => (
            <GroupRankingPicker
              key={g}
              groupName={g}
              teams={groupsByName.get(g) ?? []}
              initial={myGroupByName.get(g)}
              locked={tournamentLocked}
              onChange={(ranking) => {
                upsertGroup.mutate({ groupName: g, ranking });
              }}
            />
          ))}
        </div>
      </Section>

      <Section
        title="סוללת הנוקאאוט"
        subtitle="5 נקודות לכל מנצח שצדקת בו. ניתן לערוך פעם אחת בסיום שלב הבתים."
      >
        <BracketView
          teams={teams}
          locked={
            bracketLockState === 'locked-final' ||
            bracketLockState === 'locked-permanently'
          }
          initialPicks={initialBracketPicks}
          onChange={(picks) => {
            upsertBracket.mutate({ winnersBySlot: picks });
          }}
        />
      </Section>

      <TeamPickerSheet
        open={championPickerOpen}
        title="בחר את אלוף המונדיאל"
        teams={teams}
        selectedId={champion?.id ?? null}
        onPick={handleSelectChampion}
        onClose={() => setChampionPickerOpen(false)}
      />
      <PlayerPickerSheet
        open={goldenBootPickerOpen}
        title="בחר את מלך השערים"
        players={players}
        selectedId={goldenBoot?.id ?? null}
        onPick={handleSelectGoldenBoot}
        onClose={() => setGoldenBootPickerOpen(false)}
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
