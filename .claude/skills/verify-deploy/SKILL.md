---
name: verify-deploy
description: Pre-merge checklist for football-predictions-client. Catches lint errors, build failures, demo-mode regressions, bundle-size explosions, and post-deploy smoke-test gaps. Use before pushing to main.
---

# verify-deploy

The public GitHub Pages URL (`https://idanshoham.github.io/football-predictions-client/`) is the user-visible artefact of every change. A broken deploy means visitors see a blank page or a 404. This skill is the cheap gate before merge.

## When to use

- Before pushing to `main` (the GH Pages deploy is triggered on push).
- After completing [[add-hook]] or [[add-rtl-component]].
- After bumping a dependency.
- After editing `vite.config.ts` or `.github/workflows/deploy.yml`.

## Procedure

### 1. Lint must pass

```sh
npm run lint
```

The ESLint flat config includes a `no-restricted-syntax` rule that bans `new Date()` (no args) in business code. If lint complains, move the time call into `src/lib/time.ts` and re-export.

Fix every error. Warnings are OK to land but flag them in the PR description.

### 2. Build must pass locally

```sh
npm run build
```

This runs `tsc -b` (full TypeScript project build) then `vite build`. Common failures:

- **Missing type declarations** — usually CSS or asset imports. Add a triple-slash reference in `src/vite-env.d.ts` (`/// <reference types="vite/client" />`).
- **`@prisma/client` types missing** — only relevant if you accidentally imported server types. Don't share types across repos; duplicate them in `src/types.ts`.
- **Strict-null violations** — use `??` defaults or `!` only with justification.
- **Unused locals/parameters** — `tsconfig.app.json` has `noUnusedLocals` and `noUnusedParameters`. Prefix with `_` to silence.

If you see "Vite build successful" but `dist/index.html` doesn't reference your assets, you have a base-path issue. Verify `vite.config.ts` has `base: '/football-predictions-client/'`.

### 3. Bundle-size sanity check

```sh
du -sh dist/assets/*.js | sort -h
```

The main bundle is currently ~520KB. Compare against the previous build. If a single new entry adds >50KB:

- **Reject the dep if you can.** Is there a lighter alternative? Can you implement the small surface you need yourself?
- **Accept with eyes open** if you must. Note it in the PR description.

Common bundle bloat sources:
- Moment / Luxon (use `date-fns-tz` — already a dep).
- Lodash (use native JS or `lodash-es` with tree-shaking).
- Heavy UI libraries (Material UI, Headless UI — we roll our own).

### 4. Demo mode regression check

This is the easy one to forget and the hardest to catch in CI.

```sh
# Temporarily move .env.local aside so demo mode is forced
mv .env.local .env.local.bak 2>/dev/null
npm run dev
```

Then open `http://localhost:5173` and verify:

- The amber "מצב דמו" banner shows at the top.
- The leaderboard renders 3 mock users.
- `/matches` shows the upcoming + past matches.
- `/live` shows the live mock match (Spain-Germany 1-0).
- `/tournament` shows the champion picker, golden boot (empty roster), 8 group cards, and the bracket with R32 tab.
- Tap a match → prediction sheet opens; close it without error.
- Tap a team in the bracket → team picker opens; pick a team → see it filled in.

Restore:

```sh
mv .env.local.bak .env.local 2>/dev/null
```

If any of these break in demo mode, your change has a regression. The most likely culprits:
- A new hook that doesn't have `if (isDemoMode) return fakeQuery(...)`.
- A new component that derefs `data.something` without checking `data` exists.
- A new dep that throws at module init when an env var is missing.

### 5. Inspect the GitHub Actions run after push

```sh
git push
# Wait ~10 seconds
gh run list --limit 1
# Get the ID, then:
gh run watch <id>
```

The workflow has two jobs: `build` (~30s) and `deploy` (~10s). Both must be green.

If the build fails:
- Check the deprecated-Node warning — non-blocking until 2026-06-02.
- Lockfile mismatch — we don't have a `package-lock.json` yet; the workflow uses `npm install` (not `npm ci`). If you ran `npm install` locally and want to commit the lockfile, switch the workflow to `npm ci` for faster CI.

### 6. Live-URL smoke test

After deploy succeeds:

1. Open `https://idanshoham.github.io/football-predictions-client/` on a fresh tab (cache-bypass with cmd-shift-R).
2. Open on a real phone in Hebrew Safari/Chrome.
3. Walk through every section (טבלה / משחקים / חי / טורניר).
4. Confirm the `/me` page loads (avatar in header → tap).
5. Open the browser console — there should be only the demo-mode warning, no errors.

### 7. If demo mode is broken on prod

Catch:
- Blank page → check console for "Cannot find module" or "Invalid URL" (the Supabase init bug).
- Layout broken → check the `Network` tab for the CSS bundle 200.
- Some routes broken → HashRouter routes should be `/#/section`; if you see `/section` paths, somebody changed the router.

Roll back:

```sh
git revert HEAD
git push
```

Then debug locally before re-attempting.

## Pitfalls

- **Skipping the demo-mode check.** ~30s of work, catches the most embarrassing class of regression.
- **Trusting "it works on my machine" with `.env.local` present.** If you've never run without env vars since you joined the project, you don't know if demo mode works for your branch.
- **Pushing to `main` without watching the Actions run.** A failed deploy leaves the previous version live (good) but you won't know your change didn't ship (bad).
- **Forgetting that `npm run dev` is more permissive than `npm run build`.** Vite dev uses esbuild; build uses tsc. Strict-null and unused-variable errors only show in build. Always run build before pushing.
- **Bumping a dep without rebuilding.** Lockfile (or lack thereof) means CI may pull a different version than you tested with. Run `npm install && npm run build` after dep changes.

## When you finish

If all checks pass: push to main, watch the deploy, smoke-test the live URL. Done.

If a check fails: fix, re-run this skill from step 1.
