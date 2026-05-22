---
name: add-rtl-component
description: Build new React components that work cleanly in Hebrew RTL on mobile. Covers logical Tailwind props, mobile-first patterns, bottom-sheet conventions, and accessibility for RTL.
---

# add-rtl-component

This entire app runs `dir="rtl"` with Hebrew strings. Components that look fine in LTR break in subtle ways under RTL — arrows point the wrong way, text-align defaults are wrong, margins push elements off-screen, drag gestures get reversed. This skill is the discipline that prevents that.

## When to use

- Building a new component from scratch.
- Refactoring an existing component that has hardcoded `left/right`.
- Adding a picker, sheet, or modal.
- Adding any iconography that has a directional meaning (arrows, chevrons, "next" indicators).

## Procedure

### 1. Default to mobile

Phones are the primary device for this user base. Build mobile-first, layer in desktop via Tailwind breakpoints.

- Touch targets: minimum 44×44px (Tailwind `size-11`).
- Hit areas: pad generously around small icons.
- Bottom-sheet pattern for any modal-like UI on mobile — easier to dismiss with thumb.

### 2. Use logical Tailwind properties

The single biggest RTL footgun is `ml-*` / `mr-*` / `pl-*` / `pr-*` / `left-*` / `right-*`. Tailwind v4 provides logical equivalents that respect `dir`:

| Physical (bad) | Logical (good) |
|---|---|
| `ml-2` | `ms-2` (margin-start) |
| `mr-2` | `me-2` (margin-end) |
| `pl-4` | `ps-4` (padding-start) |
| `pr-4` | `pe-4` (padding-end) |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `rounded-l-lg` | `rounded-s-lg` |
| `rounded-r-lg` | `rounded-e-lg` |
| `border-l` | `border-s` |
| `border-r` | `border-e` |

Use the logical variant unconditionally — it works in both directions, so there's never a reason to fall back to physical props.

### 3. Be intentional about icons and arrows

Icons that point have inherent direction. Decisions:

- **Back/forward chevrons** in RTL: visually flipped. A "back" arrow in LTR points left (`←`); in RTL it points right (`→`). If you use a Heroicon-style "ChevronLeft", it'll look wrong in Hebrew. Solutions:
  - Use logical-directional icons (uncommon — most libraries don't have them).
  - Use `[dir=rtl]:rotate-180` on the SVG.
  - Use abstract glyphs (×, ✓, … ) that don't have direction.
- **Progression indicators** (`→`): same flip needed.
- **Flags and emojis** don't need flipping; they're symbolic, not directional.

### 4. Hebrew strings: write them in place

There's no i18n library. Hebrew is hardcoded in JSX:

```tsx
<button>שמור</button>
<p>אין משחקים קרובים כרגע</p>
```

Conventions:
- Quotation marks: use ASCII `"..."` in source, not `״...״` — it's easier to type and renders the same.
- Punctuation order: in source code, write naturally. The browser handles bidi rendering.
- Mixed Hebrew/English content (e.g. "+5 נק׳"): use a non-breaking direction span if alignment looks weird, but usually `<span>` and Hebrew context handle it.
- Currency / numbers / dates: write the digits in their natural order; the browser displays them correctly with the Hebrew text around them.

### 5. Bottom-sheet pattern for modals

The reference implementations are `TeamPickerSheet`, `PlayerPickerSheet`, and `PredictionSheet`. Copy this skeleton:

```tsx
if (!open) return null;

return (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
    <button
      type="button"
      aria-label="סגור"
      className="absolute inset-0"
      onClick={onClose}
    />
    <div className="relative w-full max-w-md max-h-[80vh] bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-slate-200">{title}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="סגור">
          ✕
        </button>
      </div>
      {/* ... content ... */}
    </div>
  </div>
);
```

Key details:

- `items-end sm:items-center`: sheet on mobile, dialog on desktop.
- `rounded-t-2xl sm:rounded-2xl`: rounded top corners on mobile, all corners on desktop.
- `absolute inset-0` backdrop is a button so it dismisses on tap.
- `max-w-md` keeps tablet layout sane.
- `aria-label` in Hebrew for screen readers (`סגור`, not `Close`).

### 6. Form inputs and direction

Inputs respect the document direction by default. For Hebrew-first inputs, no extra work. If you have an input that must always be LTR (e.g., email, URL), add `dir="ltr"` on the input element.

### 7. Avoid drag-and-drop on mobile RTL

It's hard. The user's thumbs are at the bottom of a phone, the drag handle convention is on the right (which in RTL becomes left), and accessibility libraries handle RTL inconsistently. Prefer:

- **Tap-to-promote** with ▲/▼ buttons (see `GroupRankingPicker`).
- **Tap-to-pick** with a modal that lists options.
- **Number steppers** for quantity inputs (see `PredictionSheet`).

Only use drag-and-drop if there's no good alternative AND you've tested it on real iOS Safari + Android Chrome.

### 8. ErrorBoundary-friendly

The app has a top-level `ErrorBoundary`. Don't throw during render unless intentional:
- Don't dereference `props.x.y` without confirming `x` exists.
- Don't call `useSomething()` conditionally.
- Don't `JSON.parse` user-provided strings without try/catch.

If you do want a deliberate render-time error (e.g. catastrophic input), throw explicitly so `ErrorBoundary` can show the Hebrew error card.

### 9. Test the component

Open `http://localhost:5173` after `npm run dev`. Specifically check:

- Renders correctly in Hebrew with `dir="rtl"`.
- Touch targets are tappable on a real phone (or browser DevTools mobile mode).
- The component works in demo mode (no env vars).
- Loading states are visible (avoid blank flashes).
- Empty states are visible (don't render an empty `<ul>` — show "אין תוצאות").

### 10. Build + push

```sh
npm run lint
npm run build
```

If you've used physical Tailwind props, the build won't catch them but the visual will be wrong. There's no automated lint for this — visual inspection is the only safeguard.

## Pitfalls

- **`flex-row`** then expecting it to flow right-to-left because of `dir="rtl"`. It does — but `space-x-*` reverses. Use `gap-*` instead of `space-x-*` to avoid the asymmetry.
- **`absolute right-0`** to position something at the visual right. In RTL that's `start-0`, not `end-0`. Test in both directions before committing.
- **`text-left` in a card** because the design specs LTR. Use `text-start` so Hebrew content aligns properly.
- **Mixing Latin and Hebrew in a single string without spans** — usually browsers handle this with bidi rules, but if the order looks wrong, wrap the Latin part in `<span dir="ltr">`.
- **Reaching for a heavy library** (Headless UI, Radix) for a sheet/modal — they work in RTL but ship dependencies we don't need. Roll the pattern from `TeamPickerSheet` instead.
- **Using `ml-auto`** to push something to the visual end. Use `ms-auto` in RTL; otherwise it'll push to the wrong side.

## Examples to copy from

- `src/components/TeamPickerSheet.tsx` — searchable bottom-sheet with Hebrew search input.
- `src/components/PlayerPickerSheet.tsx` — same pattern, players instead of teams.
- `src/components/PredictionSheet.tsx` — bottom-sheet with form controls (steppers, picker, save button).
- `src/components/GroupRankingPicker.tsx` — tap-to-promote pattern with ▲/▼.
- `src/components/MatchCard.tsx` — list-row layout with logical props throughout.

## When you finish

Run [[verify-deploy]] to confirm the public preview still works.
