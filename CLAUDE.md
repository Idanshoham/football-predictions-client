# CLAUDE.md — football-predictions-client

Vite + React + TypeScript frontend for a private World Cup 2026 prediction platform. Hebrew RTL, mobile-first. Deployed to GitHub Pages at `https://idanshoham.github.io/football-predictions-client/` via GitHub Actions on push to `main`.

The companion backend repo is **football-predictions-server**.

---

## How to run

```sh
npm install                # uses default registry
cp .env.example .env.local # fill in VITE_SUPABASE_URL, _ANON_KEY, VITE_API_BASE_URL
npm run dev                # Vite on http://localhost:5173
npm run build              # tsc -b && vite build → dist/
npm run lint               # ESLint flat config; runs typescript-eslint + react-hooks rules
```

If env vars are missing the app runs in **demo mode**: a fake session is provided, an amber "מצב דמו" banner shows at the top, mutations are no-ops, and every `useQuery` hook returns mock data via the `fakeQuery()` helper. This is how the public GitHub Pages preview stays interactive.

---

## Architecture invariants — DO NOT VIOLATE

1. **Backend is source of truth.** The client never:
   - Calculates points (server does it; we just render)
   - Decides whether a prediction is locked (server returns 403; we just display)
   - Reveals other users' predictions (server filters; we just render what comes back)
   - Trusts user input for routing or auth state
   The frontend's job is rendering and form ergonomics. Nothing more.

2. **No raw `Date` arithmetic in business code.** All time handling goes through `src/lib/time.ts` (`formatIsraelTime`, `secondsUntil`, `countdownHebrew`, `isPast`). ESLint enforces this with a `no-restricted-syntax` rule banning `new Date()` (no args). If you genuinely need `new Date()` (e.g., capturing "now"), add a helper to `lib/time.ts` and use that.

3. **HashRouter, not BrowserRouter.** GitHub Pages doesn't serve SPA history routes from arbitrary paths; HashRouter (`/#/leaderboard`) sidesteps that. Don't switch routers.

4. **Tailwind v4 — CSS-based config.** No `tailwind.config.js`, no `postcss.config.js`. Theme tokens live in `src/index.css` under `@theme { … }`. The `@tailwindcss/vite` plugin handles everything. If you need RTL spacing, prefer logical Tailwind properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) over `ml-*/mr-*`.

5. **Demo-mode fallback is mandatory for every new data hook.** Any new `useQuery` hook in `src/lib/hooks.ts` must check `isDemoMode` from `useAuth()` and return `fakeQuery(mockData)` instead of hitting the API. Mutations should resolve with a synthetic value in demo mode. This is what keeps the public site usable without a backend.

6. **No admin UI.** There is no admin role, no admin route, no privileged endpoint exposure. If something needs fixing it happens via the backend's secret-gated `/__rescore` (operational runbook).

7. **Visibility is strict.** Section 3 ("חי") shows other users' predictions only for matches that are live or past — the backend filters this; the client just renders what it receives. Future predictions are NEVER displayed.

---

## Codebase tour

```
.github/workflows/
  deploy.yml             # Vite build → GitHub Pages (no lockfile yet, uses npm install)
src/
  main.tsx               # ErrorBoundary → AuthProvider → QueryClient → HashRouter → App
  App.tsx                # Routes inside <RequireAuth>; / → Leaderboard, /matches, /live, /tournament, /me
  index.css              # Tailwind v4 @import + @theme tokens (Heebo font, brand colors)
  vite-env.d.ts          # /// <reference types="vite/client" /> (needed for CSS imports)
  types.ts               # Match / Team / Player / MyPrediction / OtherPrediction / LeaderboardRow
  mock-data.ts           # MOCK_TEAMS / MOCK_GROUPS / MOCK_LEADERBOARD / MOCK_MATCHES / TOURNAMENT_OPENER_ISO
  lib/
    supabase.ts          # singleton client — placeholder URL in demo mode (don't crash on init)
    auth.tsx             # AuthProvider + useAuth(); detects DEMO_MODE
    api.ts               # apiGet / apiPost with Bearer token from Supabase session
    hooks.ts             # all useQuery / useMutation hooks with demo-mode fallback
    time.ts              # formatIsraelTime / countdownHebrew / secondsUntil / isPast
    bracket.ts           # slot definitions matching server's bracket-scoring slot names
  components/
    Layout.tsx           # header + bottom nav; renders demo banner
    RequireAuth.tsx      # gate that shows Login until session is ready
    ErrorBoundary.tsx    # top-of-tree; renders Hebrew error card on render-time crash
    MatchCard.tsx        # reusable match row with status badge + Hebrew stage labels
    PredictionSheet.tsx  # bottom-sheet modal with score steppers + first-scorer picker
    TeamPickerSheet.tsx  # searchable team picker (used by Champion + Bracket slot)
    PlayerPickerSheet.tsx# searchable player picker (used by Golden Boot)
    GroupRankingPicker.tsx # per-group ▲▼ swap UI (no drag-and-drop)
    BracketView.tsx      # round tabs (R32 → R16 → … → third), 32 slot cards, progress bar
    LockBanner.tsx       # 4-state tournament lock banner with Hebrew countdown
  pages/
    Login.tsx            # Google OAuth via Supabase
    Leaderboard.tsx      # Section 1
    Matches.tsx          # Section 2 — past + upcoming + PredictionSheet
    Live.tsx             # Section 3 — live matches + revealed predictions
    Tournament.tsx       # Section 4 — Champion + Golden Boot + 8 groups + Bracket
    Me.tsx               # avatar + signOut
eslint.config.js         # flat config; bans `new Date()` arithmetic in business code
```

### Files that need extra care when editing

- **`src/lib/auth.tsx`** — `DEMO_MODE` detection MUST come from `import.meta.env.VITE_SUPABASE_URL/_ANON_KEY`. If you change the detection logic, the public GH Pages preview can break.
- **`src/lib/hooks.ts`** — every hook must handle demo mode. The `fakeQuery<T>()` helper exists for this purpose. Mutations must resolve in demo mode (no throws).
- **`src/lib/supabase.ts`** — uses a placeholder URL (`https://demo.invalid`) when env vars are missing because `createClient('', '', …)` throws "Invalid URL" at module init and blanks the page.
- **`src/components/BracketView.tsx`** — autosaves drafts to `localStorage` (key: `wc26:bracket-draft`). Don't remove the localStorage path; it's the offline-resilience layer. Server initial picks via `initialPicks` prop hydrate once.
- **`src/components/PredictionSheet.tsx`** — countdown re-renders every second while open. The colour escalates: slate (default), amber (< 5 min), red (< 1 min). Don't replace this with a static label.
- **`vite.config.ts`** — `base: '/football-predictions-client/'` is required for GitHub Pages asset paths to resolve. If the repo is renamed, update this.

---

## Gotchas / non-obvious things

- **No `package-lock.json` yet** — the Pages workflow uses `npm install` (not `npm ci`) because the initial lockfile hasn't been committed. Once you run `npm install` locally and commit `package-lock.json`, switch the workflow to `npm ci` for faster CI.
- **Match IDs are server-generated cuids.** Mock data uses readable IDs (`m-opener`); real data uses cuids. Don't pattern-match on ID format.
- **`groupName`** on a Team is null for knockout-only teams (rare for WC since all start in a group). On a Match, `groupName` is null for knockout matches.
- **`bracketLockState` from the server drives the LockBanner.** Don't compute lock state on the client — request it via `useTournamentInfo()` and trust the server.
- **`refetchInterval: 30_000`** is only set for `useMatches('live')` and downstream `usePredictionsForMatch` calls in `LiveMatchPanel`. Don't add polling to other hooks without thinking about Render free-tier load (100 users × poll-frequency = req/min budget).
- **Hebrew RTL specifics:** `dir="rtl"` is on `<html>` in `index.html`. Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) flip automatically. Avoid hardcoded `left/right` in custom CSS.
- **The flag emoji for England (🏴) requires the regional indicator subdivision sequence** to render the St George's Cross. It often appears as a black flag on systems without the full font set — acceptable trade-off.

---

## Common tasks

- **Adding a new API endpoint on the client side** → add the hook to `src/lib/hooks.ts` with both a real branch and a demo-mode fallback.
- **Adding a new picker** → start from `TeamPickerSheet.tsx` or `PlayerPickerSheet.tsx` — both have searchable filter + bottom-sheet pattern + RTL-aware layout.
- **Wiring auth-gated behavior** → use the `useAuth()` hook for `session`, `isDemoMode`, `signInWithGoogle`, `signOut`. Never read from `supabase.auth.*` directly outside `auth.tsx`.
- **Adding RTL component styles** → reach for logical Tailwind properties first; only fall back to `[dir=rtl]:` selectors for edge cases.

---

## When you finish a change

- `npm run build` must succeed locally (or via the GH Actions deploy run on push).
- `npm run lint` must be clean.
- Verify the GH Pages preview still loads after deploy. If you see a blank page in demo mode, check the browser console: 99% chance it's a module-init throw (e.g. an SDK that requires a valid URL). The `ErrorBoundary` will catch render-time errors but not module-init errors.
- Don't use `--no-verify` on commits.
