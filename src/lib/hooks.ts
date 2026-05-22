import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from './api';
import { useAuth } from './auth';
import type { Match, MyPrediction, OtherPrediction, LeaderboardRow } from '../types';

export const queryKeys = {
  matches: (status?: string) => ['matches', status ?? 'all'] as const,
  match: (id: string) => ['matches', id] as const,
  myPredictions: () => ['predictions', 'mine'] as const,
  predictionsForMatch: (matchId: string) =>
    ['predictions', 'match', matchId] as const,
  leaderboard: () => ['leaderboard'] as const,
};

export function useMatches(status?: 'upcoming' | 'live' | 'past') {
  const { ready, session } = useAuth();
  return useQuery({
    queryKey: queryKeys.matches(status),
    queryFn: () => apiGet<Match[]>(`/matches${status ? `?status=${status}` : ''}`),
    enabled: ready && !!session,
    // Section 3 polls every 30s; the others use the default (no polling).
    refetchInterval: status === 'live' ? 30_000 : false,
  });
}

export function useMyPredictions() {
  const { ready, session } = useAuth();
  return useQuery({
    queryKey: queryKeys.myPredictions(),
    queryFn: () => apiGet<MyPrediction[]>('/predictions/mine'),
    enabled: ready && !!session,
  });
}

interface PredictionsForMatchResponse {
  mine: MyPrediction | null;
  others: OtherPrediction[];
}

export function usePredictionsForMatch(matchId: string | undefined) {
  const { ready, session } = useAuth();
  return useQuery({
    queryKey: matchId ? queryKeys.predictionsForMatch(matchId) : ['predictions', 'match', 'noop'],
    queryFn: () =>
      apiGet<PredictionsForMatchResponse>(`/predictions/match/${matchId}`),
    enabled: ready && !!session && !!matchId,
  });
}

export function useLeaderboard() {
  const { ready, session } = useAuth();
  return useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: () => apiGet<LeaderboardRow[]>('/leaderboard'),
    enabled: ready && !!session,
  });
}

export interface UpsertPredictionInput {
  matchId: string;
  homeScorePred: number;
  awayScorePred: number;
  firstScorerPlayerId: string | null;
}

export function useUpsertPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPredictionInput) =>
      apiPost<MyPrediction>('/predictions', input),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: queryKeys.myPredictions() });
      qc.invalidateQueries({
        queryKey: queryKeys.predictionsForMatch(input.matchId),
      });
    },
  });
}
