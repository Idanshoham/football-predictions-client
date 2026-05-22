import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiGet, apiPost } from './api';
import { useAuth } from './auth';
import type {
  LeaderboardRow,
  Match,
  MyPrediction,
  OtherPrediction,
  Team,
  Player,
} from '../types';
import {
  MOCK_LEADERBOARD,
  MOCK_MATCHES,
  MOCK_TEAMS,
  TOURNAMENT_OPENER_ISO,
} from '../mock-data';

export const queryKeys = {
  matches: (status?: string) => ['matches', status ?? 'all'] as const,
  match: (id: string) => ['matches', id] as const,
  myPredictions: () => ['predictions', 'mine'] as const,
  predictionsForMatch: (matchId: string) =>
    ['predictions', 'match', matchId] as const,
  leaderboard: () => ['leaderboard'] as const,
  teams: () => ['teams'] as const,
  players: () => ['players'] as const,
  tournamentInfo: () => ['tournament', 'info'] as const,
  myTournamentPrediction: () => ['tournament', 'predictions', 'mine'] as const,
  myGroupRankings: () => ['tournament', 'groups', 'mine'] as const,
  myBracket: () => ['tournament', 'bracket', 'mine'] as const,
};

/** Synthesises a successful UseQueryResult-like shape for demo mode. */
function fakeQuery<T>(data: T): UseQueryResult<T, Error> {
  return {
    data,
    isLoading: false,
    isFetching: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    status: 'success',
    fetchStatus: 'idle',
    refetch: async () => ({ data } as never),
  } as unknown as UseQueryResult<T, Error>;
}

// ---------------- Matches ----------------

export function useMatches(status?: 'upcoming' | 'live' | 'past') {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.matches(status),
    queryFn: () =>
      apiGet<Match[]>(`/matches${status ? `?status=${status}` : ''}`),
    enabled: !isDemoMode && ready && !!session,
    refetchInterval: status === 'live' ? 30_000 : false,
  });
  if (isDemoMode) {
    const filtered = MOCK_MATCHES.filter((m) => {
      if (status === 'live') return m.status === 'live' || m.status === 'halftime';
      if (status === 'upcoming') return m.status === 'scheduled';
      if (status === 'past') return m.status === 'full_time';
      return true;
    });
    return fakeQuery(filtered);
  }
  return query;
}

// ---------------- Predictions ----------------

export function useMyPredictions() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myPredictions(),
    queryFn: () => apiGet<MyPrediction[]>('/predictions/mine'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery<MyPrediction[]>([]);
  return query;
}

export interface PredictionsForMatchResponse {
  mine: MyPrediction | null;
  others: OtherPrediction[];
}

export function usePredictionsForMatch(matchId: string | undefined) {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: matchId
      ? queryKeys.predictionsForMatch(matchId)
      : ['predictions', 'match', 'noop'],
    queryFn: () =>
      apiGet<PredictionsForMatchResponse>(`/predictions/match/${matchId}`),
    enabled: !isDemoMode && ready && !!session && !!matchId,
  });
  if (isDemoMode) return fakeQuery<PredictionsForMatchResponse>({ mine: null, others: [] });
  return query;
}

export interface UpsertPredictionInput {
  matchId: string;
  homeScorePred: number;
  awayScorePred: number;
  firstScorerPlayerId: string | null;
}

export function useUpsertPrediction() {
  const qc = useQueryClient();
  const { isDemoMode } = useAuth();
  return useMutation({
    mutationFn: async (input: UpsertPredictionInput): Promise<MyPrediction> => {
      if (isDemoMode) {
        return {
          matchId: input.matchId,
          homeScorePred: input.homeScorePred,
          awayScorePred: input.awayScorePred,
          firstScorerPlayerId: input.firstScorerPlayerId,
          pointsTotal: 0,
        };
      }
      return apiPost<MyPrediction>('/predictions', input);
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: queryKeys.myPredictions() });
      qc.invalidateQueries({
        queryKey: queryKeys.predictionsForMatch(input.matchId),
      });
    },
  });
}

// ---------------- Leaderboard ----------------

export function useLeaderboard() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: () => apiGet<LeaderboardRow[]>('/leaderboard'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery(MOCK_LEADERBOARD);
  return query;
}

// ---------------- Teams & Players ----------------

export function useTeams() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.teams(),
    queryFn: () => apiGet<Team[]>('/teams'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery(MOCK_TEAMS);
  return query;
}

export function usePlayers() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.players(),
    queryFn: () => apiGet<Player[]>('/players'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery<Player[]>([]);
  return query;
}

// ---------------- Tournament info ----------------

export interface TournamentInfo {
  id: string;
  slug: string;
  nameHe: string;
  nameEn: string;
  openerKickoffAt: string;
  bracketLockState: 'open' | 'locked-final' | 'edit-window' | 'locked-permanently';
  tournamentLocked: boolean;
}

export function useTournamentInfo() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.tournamentInfo(),
    queryFn: () => apiGet<TournamentInfo>('/tournament/active'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) {
    return fakeQuery<TournamentInfo>({
      id: 'demo',
      slug: 'wc2026',
      nameHe: 'מונדיאל 2026',
      nameEn: 'World Cup 2026',
      openerKickoffAt: TOURNAMENT_OPENER_ISO,
      bracketLockState: 'open',
      tournamentLocked: false,
    });
  }
  return query;
}

// ---------------- Tournament-level predictions ----------------

export interface MyTournamentPrediction {
  championTeamId: string | null;
  goldenBootPlayerId: string | null;
  pointsTotal: number;
}

export function useMyTournamentPrediction() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myTournamentPrediction(),
    queryFn: () =>
      apiGet<MyTournamentPrediction | null>('/tournament/predictions/mine'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery<MyTournamentPrediction | null>(null);
  return query;
}

export function useUpsertTournamentPrediction() {
  const qc = useQueryClient();
  const { isDemoMode } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      championTeamId: string | null;
      goldenBootPlayerId: string | null;
    }): Promise<MyTournamentPrediction> => {
      if (isDemoMode) return { ...input, pointsTotal: 0 };
      return apiPost<MyTournamentPrediction>('/tournament/predictions', input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myTournamentPrediction() });
    },
  });
}

// ---------------- Group rankings ----------------

export interface MyGroupPrediction {
  groupName: string;
  ranking: string[];
  points: number;
}

export function useMyGroupRankings() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myGroupRankings(),
    queryFn: () => apiGet<MyGroupPrediction[]>('/tournament/groups/mine'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) return fakeQuery<MyGroupPrediction[]>([]);
  return query;
}

export function useUpsertGroupRanking() {
  const qc = useQueryClient();
  const { isDemoMode } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      groupName: string;
      ranking: string[];
    }): Promise<MyGroupPrediction> => {
      if (isDemoMode) return { ...input, points: 0 };
      return apiPost<MyGroupPrediction>('/tournament/groups', input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myGroupRankings() });
    },
  });
}

// ---------------- Bracket ----------------

export interface MyBracketResponse {
  version: 1 | 2;
  lockState:
    | 'open'
    | 'locked-final'
    | 'edit-window'
    | 'locked-permanently';
  picks: { matchSlot: string; winnerTeamId: string; points: number }[];
}

export function useMyBracket() {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myBracket(),
    queryFn: () => apiGet<MyBracketResponse>('/tournament/bracket/mine'),
    enabled: !isDemoMode && ready && !!session,
  });
  if (isDemoMode) {
    return fakeQuery<MyBracketResponse>({
      version: 1,
      lockState: 'open',
      picks: [],
    });
  }
  return query;
}

export function useUpsertBracket() {
  const qc = useQueryClient();
  const { isDemoMode } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      winnersBySlot: Record<string, string>;
    }): Promise<MyBracketResponse> => {
      if (isDemoMode) {
        return {
          version: 1,
          lockState: 'open',
          picks: Object.entries(input.winnersBySlot).map(([matchSlot, winnerTeamId]) => ({
            matchSlot,
            winnerTeamId,
            points: 0,
          })),
        };
      }
      return apiPost<MyBracketResponse>('/tournament/bracket', input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myBracket() });
    },
  });
}
