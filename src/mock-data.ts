import type { LeaderboardRow, Match, Team } from './types';

// Mock data used until the backend is wired up. Realistic enough to design the UI against.

const TEAMS: Record<string, Team> = {
  BR: { id: 'BR', nameHe: 'ברזיל', flagEmoji: '🇧🇷', groupName: 'A' },
  AR: { id: 'AR', nameHe: 'ארגנטינה', flagEmoji: '🇦🇷', groupName: 'B' },
  FR: { id: 'FR', nameHe: 'צרפת', flagEmoji: '🇫🇷', groupName: 'C' },
  EN: { id: 'EN', nameHe: 'אנגליה', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupName: 'D' },
  ES: { id: 'ES', nameHe: 'ספרד', flagEmoji: '🇪🇸', groupName: 'E' },
  DE: { id: 'DE', nameHe: 'גרמניה', flagEmoji: '🇩🇪', groupName: 'F' },
  PT: { id: 'PT', nameHe: 'פורטוגל', flagEmoji: '🇵🇹', groupName: 'G' },
  IT: { id: 'IT', nameHe: 'איטליה', flagEmoji: '🇮🇹', groupName: 'H' },
};

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm-opener',
    homeTeam: TEAMS.BR,
    awayTeam: TEAMS.AR,
    kickoffAt: '2026-06-11T18:00:00Z',
    status: 'scheduled',
    stage: 'group',
    homeScore: null,
    awayScore: null,
    firstScorerPlayerId: null,
  },
  {
    id: 'm-2',
    homeTeam: TEAMS.FR,
    awayTeam: TEAMS.EN,
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'scheduled',
    stage: 'group',
    homeScore: null,
    awayScore: null,
    firstScorerPlayerId: null,
  },
  {
    id: 'm-live-1',
    homeTeam: TEAMS.ES,
    awayTeam: TEAMS.DE,
    kickoffAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'live',
    stage: 'group',
    homeScore: 1,
    awayScore: 0,
    firstScorerPlayerId: 'p-rodrigo',
  },
  {
    id: 'm-past-1',
    homeTeam: TEAMS.PT,
    awayTeam: TEAMS.IT,
    kickoffAt: '2026-06-10T18:00:00Z',
    status: 'full_time',
    stage: 'group',
    homeScore: 2,
    awayScore: 1,
    firstScorerPlayerId: 'p-cr7',
  },
];

export const MOCK_LEADERBOARD: LeaderboardRow[] = [
  {
    rank: 1,
    userId: 'u-1',
    name: 'דניאל כהן',
    avatarUrl: null,
    totalPoints: 0,
    exactCount: 0,
    correctResultCount: 0,
    matchesPredicted: 0,
  },
  {
    rank: 2,
    userId: 'u-2',
    name: 'נועה לוי',
    avatarUrl: null,
    totalPoints: 0,
    exactCount: 0,
    correctResultCount: 0,
    matchesPredicted: 0,
  },
  {
    rank: 3,
    userId: 'u-3',
    name: 'איתי מזרחי',
    avatarUrl: null,
    totalPoints: 0,
    exactCount: 0,
    correctResultCount: 0,
    matchesPredicted: 0,
  },
];

// Tournament opener — the global lock instant for tournament-level predictions.
export const TOURNAMENT_OPENER_ISO = '2026-06-11T18:00:00Z';
