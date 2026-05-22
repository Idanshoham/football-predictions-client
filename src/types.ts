// Shared types used across pages and components.
// These mirror the server's view of the domain, kept narrow on purpose.

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'full_time'
  | 'postponed'
  | 'cancelled';

export type MatchStage =
  | 'group'
  | 'r32'
  | 'r16'
  | 'qf'
  | 'sf'
  | 'final'
  | 'third';

export interface Team {
  id: string;
  nameHe: string;
  flagEmoji: string;
  groupName: string | null;
}

export interface Player {
  id: string;
  teamId: string;
  nameHe: string;
  position: string | null;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffAt: string; // ISO UTC
  status: MatchStatus;
  stage: MatchStage;
  homeScore: number | null;
  awayScore: number | null;
  firstScorerPlayerId: string | null;
}

export interface MyPrediction {
  matchId: string;
  homeScorePred: number;
  awayScorePred: number;
  firstScorerPlayerId: string | null;
  pointsTotal: number;
}

export interface OtherPrediction {
  userId: string;
  userName: string;
  homeScorePred: number;
  awayScorePred: number;
  firstScorerPlayerId: string | null;
  pointsTotalForThisMatch: number;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  exactCount: number;
  correctResultCount: number;
  matchesPredicted: number;
}
