import type { LeaderboardRow, Match, Team } from './types';

// Mock data used until the backend is wired up. Realistic enough to design the UI against.

export const MOCK_TEAMS: Team[] = [
  // Group A
  { id: 'BR', nameHe: 'ברזיל', flagEmoji: '🇧🇷', groupName: 'A' },
  { id: 'NL', nameHe: 'הולנד', flagEmoji: '🇳🇱', groupName: 'A' },
  { id: 'NG', nameHe: 'ניגריה', flagEmoji: '🇳🇬', groupName: 'A' },
  { id: 'CA', nameHe: 'קנדה', flagEmoji: '🇨🇦', groupName: 'A' },
  // Group B
  { id: 'AR', nameHe: 'ארגנטינה', flagEmoji: '🇦🇷', groupName: 'B' },
  { id: 'BE', nameHe: 'בלגיה', flagEmoji: '🇧🇪', groupName: 'B' },
  { id: 'EC', nameHe: 'אקוודור', flagEmoji: '🇪🇨', groupName: 'B' },
  { id: 'AU', nameHe: 'אוסטרליה', flagEmoji: '🇦🇺', groupName: 'B' },
  // Group C
  { id: 'FR', nameHe: 'צרפת', flagEmoji: '🇫🇷', groupName: 'C' },
  { id: 'HR', nameHe: 'קרואטיה', flagEmoji: '🇭🇷', groupName: 'C' },
  { id: 'SN', nameHe: 'סנגל', flagEmoji: '🇸🇳', groupName: 'C' },
  { id: 'PL', nameHe: 'פולין', flagEmoji: '🇵🇱', groupName: 'C' },
  // Group D
  { id: 'EN', nameHe: 'אנגליה', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupName: 'D' },
  { id: 'UY', nameHe: 'אורוגוואי', flagEmoji: '🇺🇾', groupName: 'D' },
  { id: 'CM', nameHe: 'קמרון', flagEmoji: '🇨🇲', groupName: 'D' },
  { id: 'CR', nameHe: 'קוסטה ריקה', flagEmoji: '🇨🇷', groupName: 'D' },
  // Group E
  { id: 'ES', nameHe: 'ספרד', flagEmoji: '🇪🇸', groupName: 'E' },
  { id: 'MX', nameHe: 'מקסיקו', flagEmoji: '🇲🇽', groupName: 'E' },
  { id: 'CH', nameHe: 'שווייץ', flagEmoji: '🇨🇭', groupName: 'E' },
  { id: 'IR', nameHe: 'איראן', flagEmoji: '🇮🇷', groupName: 'E' },
  // Group F
  { id: 'DE', nameHe: 'גרמניה', flagEmoji: '🇩🇪', groupName: 'F' },
  { id: 'US', nameHe: 'ארה"ב', flagEmoji: '🇺🇸', groupName: 'F' },
  { id: 'DK', nameHe: 'דנמרק', flagEmoji: '🇩🇰', groupName: 'F' },
  { id: 'MA', nameHe: 'מרוקו', flagEmoji: '🇲🇦', groupName: 'F' },
  // Group G
  { id: 'PT', nameHe: 'פורטוגל', flagEmoji: '🇵🇹', groupName: 'G' },
  { id: 'JP', nameHe: 'יפן', flagEmoji: '🇯🇵', groupName: 'G' },
  { id: 'CO', nameHe: 'קולומביה', flagEmoji: '🇨🇴', groupName: 'G' },
  { id: 'GH', nameHe: 'גאנה', flagEmoji: '🇬🇭', groupName: 'G' },
  // Group H
  { id: 'IT', nameHe: 'איטליה', flagEmoji: '🇮🇹', groupName: 'H' },
  { id: 'KR', nameHe: 'דרום קוריאה', flagEmoji: '🇰🇷', groupName: 'H' },
  { id: 'TR', nameHe: 'טורקיה', flagEmoji: '🇹🇷', groupName: 'H' },
  { id: 'TN', nameHe: 'תוניסיה', flagEmoji: '🇹🇳', groupName: 'H' },
];

const T: Record<string, Team> = Object.fromEntries(MOCK_TEAMS.map((t) => [t.id, t]));

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm-opener',
    homeTeam: T.BR,
    awayTeam: T.AR,
    kickoffAt: '2026-06-11T18:00:00Z',
    status: 'scheduled',
    stage: 'group',
    homeScore: null,
    awayScore: null,
    firstScorerPlayerId: null,
  },
  {
    id: 'm-2',
    homeTeam: T.FR,
    awayTeam: T.EN,
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'scheduled',
    stage: 'group',
    homeScore: null,
    awayScore: null,
    firstScorerPlayerId: null,
  },
  {
    id: 'm-live-1',
    homeTeam: T.ES,
    awayTeam: T.DE,
    kickoffAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'live',
    stage: 'group',
    homeScore: 1,
    awayScore: 0,
    firstScorerPlayerId: 'p-rodrigo',
  },
  {
    id: 'm-past-1',
    homeTeam: T.PT,
    awayTeam: T.IT,
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

/** All groups and their teams, used by the group ranking UI. */
export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const MOCK_GROUPS: Record<string, Team[]> = Object.fromEntries(
  GROUP_NAMES.map((g) => [g, MOCK_TEAMS.filter((t) => t.groupName === g)]),
);
