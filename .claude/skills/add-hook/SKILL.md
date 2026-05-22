---
name: add-hook
description: Add a TanStack Query hook to football-predictions-client with the mandatory demo-mode fallback so the public GitHub Pages preview stays interactive. Use whenever calling a new backend endpoint.
---

# add-hook

Every new data hook in this app must work in two modes: real backend (when Supabase env vars are present) and demo mode (when they're not — the public GitHub Pages build). The pattern is identical for every hook; this skill makes it boring.

## When to use

- Adding a new `useQuery` against a backend endpoint.
- Adding a new `useMutation` for a write.
- Adding a derived/composed hook that depends on the auth state.

## Procedure

### 1. Confirm the endpoint shape

Open `football-predictions-server` and locate the controller. Note:
- HTTP method
- Path
- Query/body shape
- Response shape

Add or update the corresponding type in `src/types.ts` if needed. Keep types narrow — never widen a server response to `unknown` or `any`.

### 2. Add a query key entry

In `src/lib/hooks.ts`, add to the `queryKeys` const:

```ts
export const queryKeys = {
  // ... existing entries
  myNewThing: () => ['myNewThing'] as const,
  // For parametric keys:
  thingForId: (id: string) => ['thing', id] as const,
};
```

The `as const` is non-negotiable. It's what makes TanStack Query's typing tight.

### 3. Write the query hook (read path)

The locked template:

```ts
export function useMyThing(arg?: SomeArg) {
  const { ready, session, isDemoMode } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.myNewThing(),
    queryFn: () => apiGet<ThingResponse>(`/api-path`),
    enabled: !isDemoMode && ready && !!session,
    // refetchInterval: 30_000, // ONLY for live/polling endpoints
  });
  if (isDemoMode) {
    return fakeQuery<ThingResponse>(MOCK_THING);
  }
  return query;
}
```

Critical points:

- **`enabled: !isDemoMode && ready && !!session`** prevents the query from firing in demo mode (where it would 404) and before auth has settled.
- **`if (isDemoMode) return fakeQuery(...)`** must be unconditional — never gated on `ready`. Demo mode is detected at module load and never changes during a session.
- **`refetchInterval` is opt-in** — only `useMatches('live')` and downstream `usePredictionsForMatch` should poll. 100 users × 30s polls × N hooks adds up.
- The variable is named `query` and the function returns either `query` or `fakeQuery(...)`. Don't restructure this.

### 4. Add mock data if missing

If `MOCK_THING` doesn't exist in `src/mock-data.ts`, add it. Mock data should be:

- Realistic (Hebrew strings, real WC team flags, plausible scores).
- Stable IDs (don't randomize — breaks React keys across re-renders).
- Small enough that the page is interesting but not overwhelming (3-5 rows is usually right).

For empty mock states (e.g. `useMyPredictions` returns `[]` in demo mode), an empty array is fine — the UI handles the empty state.

### 5. Write the mutation hook (write path)

Mutations follow a parallel pattern but resolve a synthetic value in demo mode:

```ts
export function useUpsertMyThing() {
  const qc = useQueryClient();
  const { isDemoMode } = useAuth();
  return useMutation({
    mutationFn: async (input: UpsertInput): Promise<MyThingResponse> => {
      if (isDemoMode) {
        // Synthesize a plausible response so the UI updates optimistically.
        return { ...input, pointsTotal: 0, id: `demo-${Date.now()}` };
      }
      return apiPost<MyThingResponse>('/api-path', input);
    },
    onSuccess: (_data, input) => {
      // Invalidate every cached query that this mutation could affect.
      qc.invalidateQueries({ queryKey: queryKeys.myNewThing() });
      // If you also affect another query: invalidate it too.
      // qc.invalidateQueries({ queryKey: queryKeys.leaderboard() });
    },
  });
}
```

### 6. Wire the hook into a page or component

```ts
function MyPage() {
  const { data = [], isLoading, isError } = useMyThing();
  // Always default `data` with a fallback — useQuery starts with `data: undefined`.
  // ...
}
```

For mutations:
```ts
const upsert = useUpsertMyThing();
// ...
await upsert.mutateAsync(input);
```

### 7. Cache invalidation

Whenever you write a mutation, list every read it could invalidate. Common patterns:

- A prediction upsert → invalidate `myPredictions` AND `predictionsForMatch(matchId)` AND `leaderboard` (because their points changed).
- A tournament-level upsert → invalidate `myTournamentPrediction` AND `leaderboard`.
- A bracket pick → invalidate `myBracket` AND `leaderboard`.

If you're unsure, err on the side of invalidating more — over-invalidation is a UX bug at worst; under-invalidation is a correctness bug.

### 8. Manual test

```sh
npm run dev
```

- Open `http://localhost:5173`.
- If you have Supabase env vars set: log in via Google, navigate to your new page, confirm the data loads.
- Without env vars: confirm demo mode banner shows, the page still renders with mock data, mutations don't throw.

### 9. Build + push

```sh
npm run lint
npm run build
git add -A
git commit -m "<scope>: add useMyThing hook with demo-mode fallback"
git push
```

The Actions workflow will redeploy. Verify the live URL still works in both modes after deploy.

## Pitfalls

- **Forgetting the demo-mode fallback** — the build will pass, the live URL will silently break with `ApiError: 404` toasts or blank states. Test demo mode locally before pushing.
- **Putting `if (isDemoMode) return fakeQuery(...)` inside the `useQuery` callback** — wrong. The early-return must be after the `useQuery` call (so hooks are called in the same order every render).
- **Returning a plain `{ data, isLoading, isError }` object instead of `fakeQuery`** — TypeScript will yell. Use `fakeQuery<T>(data)`; it returns a `UseQueryResult`-shaped value.
- **Hitting the API in demo mode** — `apiGet` will resolve the auth header to `''` and the request will fail. Always gate with `enabled: !isDemoMode && ...`.
- **Polling without considering the budget** — `refetchInterval: 5000` × 100 users × 4 hooks = 80 req/sec to Render free. Stay at 30s and only on live data.
- **Stale-while-revalidate over-fetching** — the global `staleTime: 30_000` is intentional. Don't override it per-hook unless you have a real reason.

## Examples to copy from

- `src/lib/hooks.ts` — every existing hook follows this pattern.
- `useMatches` for a read with optional polling.
- `useUpsertPrediction` for a mutation with multiple invalidations.
- `useMyBracket` for a read whose response shape includes derived state.

## When you finish

Run [[verify-deploy]] before merging — it confirms demo mode still works on the public preview.
