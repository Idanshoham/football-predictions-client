# football-predictions-client

Frontend for a private football-tournament prediction platform. V1 targets **World Cup 2026** (Hebrew RTL, Israel timezone, ~100 family/friends users). Designed to be reusable for Euro 2028 and other tournaments.

Companion backend: [football-predictions-server](https://github.com/Idanshoham/football-predictions-server).

**Live**: https://idanshoham.github.io/football-predictions-client/ (deployed via GitHub Actions on push to `main`).

---

## What it is

A prediction game for ~100 family and friends, designed around four screens:

1. **Leaderboard** ("הטבלה") — sorted by total points, then exact-predictions count, then correct-result count.
2. **Matches** ("משחקים") — past results with your prediction & points earned, plus upcoming matches where you submit per-match predictions (score + first scorer).
3. **Live** ("חי") — currently-running matches. Predictions become visible only after kickoff; never before.
4. **Tournament** ("טורניר") — pre-tournament predictions: Champion, Golden Boot, group rankings, full knockout bracket.

Plus a small `/me` view (history, accuracy, logout) reachable from the avatar in the header.

## Why I built it

I wanted a private predictor game for World Cup 2026 with my family and friends, without ads, paid tiers, or English-only UX. Every existing app fails at least one of those. So I built one — with a hard rule of **zero monthly cost** and a deadline of **June 4, 2026** (a week before the opener, so users have time to fill in pre-tournament predictions).

It is also a deliberate exercise in **AI-led implementation**: I architect the system in human conversation (scoring rules, lock semantics, UX flow, free-tier choices, multi-tournament-ready schema) and direct AI agents (Claude Code via [Conductor](https://conductor.build)) to implement it. I review every line of code in the sacred parts (scoring, locks) — the goal is to ship more software than a solo developer normally can, without lowering the quality bar.

## Design constraints worth knowing about

- **Hebrew RTL, mobile-first.** `dir="rtl"` on the `<html>` element; Tailwind's logical properties (`ms-*`, `me-*`) used throughout.
- **No business logic on the client.** Lock checks, point calculations, visibility rules all happen on the server. The frontend just renders.
- **Polling, not WebSockets.** TanStack Query polls the backend every 30 seconds during live windows. Removes a class of cold-start / sticky-session bugs from the free-tier hosting.
- **HashRouter.** GitHub Pages doesn't natively support SPA history routing. HashRouter (`/#/leaderboard`) sidesteps the issue and is fine for a small private app.
- **No i18n library.** Hebrew is the only language. Strings are hardcoded — saves a dependency and a build step.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Familiar, AI-friendly, big ecosystem |
| Build | Vite | Fast dev, painless static output for GitHub Pages |
| Styling | TailwindCSS | RTL-friendly via logical properties; tiny final CSS |
| Data | TanStack Query | Cache + polling + optimistic mutations in one library |
| Auth | Supabase Auth (Google) | Free, drop-in Google login |
| Routing | React Router (HashRouter) | Works on GitHub Pages without server-side routing |
| Time | `date-fns-tz` | Single `formatIsraelTime` helper; no raw Date arithmetic anywhere |
| Hosting | GitHub Pages | Free; deployed by Actions on push to `main` |

Total monthly run cost: **$0**.

## Bracket UX (the hardest screen)

The knockout bracket on a mobile RTL Hebrew screen is the highest-friction UI in the app. The design:

- **Mobile (default, <768px)**: a horizontal scrubber/tab bar (R32 → R16 → QF → SF → F + 3rd). Tap a round to view its matches as a vertical list of cards. No tree visualisation on mobile.
- **Desktop (≥768px)**: classic horizontal tree, but **mirrored** for RTL (final on the LEFT, R32 on the right).
- **Match card** (the building block): two team rows with flag + Hebrew name; tap a team to "promote" it as winner. Picking propagates: the winner appears in the next round's slot automatically. Changing an earlier round resets any dependent picks with a friendly Hebrew toast.
- **Lock state banners** at the top of Section 4 explain in Hebrew exactly what's editable and until when.

## Project layout (planned)

```
src/
  main.tsx
  App.tsx
  pages/
    Leaderboard.tsx     # Section 1
    Matches.tsx         # Section 2 (past + upcoming + prediction form)
    Live.tsx            # Section 3 (live + revealed predictions, polls every 30s)
    Tournament.tsx      # Section 4 (golden boot, champion, groups, bracket)
    Me.tsx
  components/
    BracketView.tsx     # mobile vertical / desktop tree
    MatchCard.tsx
    FirstScorerPicker.tsx
    GroupRankingPicker.tsx
    LockBanner.tsx
  lib/
    api.ts              # fetch wrapper + Supabase JWT
    queryClient.ts
    time.ts             # formatIsraelTime, countdownToKickoff
.github/workflows/
  deploy.yml            # build + deploy to GitHub Pages
```

## Local development

```sh
npm install
cp .env.example .env.local   # fill in backend URL + Supabase anon key
npm run dev
```

Open http://localhost:5173 — you should see the Hebrew RTL welcome screen.

## Skills this project exercises

- React + TypeScript at a non-trivial scale (multi-screen app with shared state)
- Mobile-first responsive design under a hard RTL Hebrew constraint
- Caching + polling patterns with TanStack Query as a "good enough" alternative to WebSockets
- Working effectively with AI agents: architecting in conversation, then directing implementation against a sharp spec, then reviewing the sacred bits
- Pragmatic free-tier engineering: choosing GitHub Pages + Vite over a paid host, polling over WebSockets, HashRouter over a server-side routing layer

## License

MIT
