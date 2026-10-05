# Mobile Wallet Motion UX Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile Persian wallet feel responsive and polished while keeping financial values immediate, RTL motion predictable, and loading non-blocking.

**Architecture:** Refine the existing Motion React and CSS behavior; do not add a new animation dependency or redesign the page. Let the existing route skeleton handle real lazy-loading, show the exact balance immediately, keep initial visual motion on the integrated sparkline, and scope list exits to the wallet asset list. Keep motion restrained and honor reduced-motion preferences in both Motion and CSS.

**Tech Stack:** React, TypeScript, Motion React, CSS, Vitest (already configured).

**Spec:** User request and motion UX review in this conversation, 2026-10-05. No separate product spec exists.

## Global Constraints

- Preserve the current Persian copy, RTL layout, number formatting, and existing visual design system.
- Do not add dependencies or introduce horizontal page transitions.
- Show the exact formatted balance on the first frame; use a 500 ms opacity and blur-to-clear entrance with no movement. On genuine same-unit balance updates, fade only changed digits over 300 ms. Unit changes remain immediate. Draw the existing balance-card sparkline over about 1.1 seconds. Keep the amount free of decorative color or glow, accessible immediately, and honor reduced motion.
- Respect `prefers-reduced-motion` for JavaScript and CSS transforms while retaining clear state feedback.
- Keep changes focused on the mobile wallet and its initial route-loading behavior.

## Review Focus

- **Fast initial route:** The ready wallet must not remain covered or inert for a minimum animation duration. Verify a normal reload shows the wallet without an imposed wait.
- **Slow lazy route:** A genuinely pending route must show its existing route skeleton, with usable bottom navigation. Verify using browser network throttling or a suspended lazy route.
- **Balance and unit changes:** The first displayed amount must equal the formatted total; switching Toman/USDT or hiding/revealing must not show zero, stale digits, or a wrong unit.
- **Filtering and empty results:** Rapid filter/search changes must not leave ghost rows, overlap the empty state, or make the list jump unpredictably.
- **Reduced motion and repeat actions:** Reduced-motion mode must not scale or translate controls; repeated chart open/close and taps must remain stable.

---

## File Structure

- `src/components/AppShell.tsx` — remove the forced first-load gate and rely on the existing route-specific `Suspense` fallback.
- `src/components/LoadingStates.tsx` — remove the branded full-screen overlay if it becomes unused; retain `RouteLoadingSkeleton` and `WalletSkeleton`.
- `src/animation/motion-tokens.ts` — remove only tokens that become unused; tune wallet list/chart transitions in place.
- `src/pages/WalletPage.tsx` — show the final amount immediately, enable presence-aware asset filtering, and refine chart selection/collapse behavior.
- `src/components/AnimatedInteractions.tsx` — add an opt-in presence mode for lists so this wallet change does not alter other lists.
- `src/style.css` — remove unused first-load overlay styles, consolidate quick-action press feedback, and make reduced-motion behavior explicit for CSS transforms.
- `src/pages/wallet-flows.test.tsx` — extend the existing wallet-flow assertions for immediate balance and filtered/empty-list states during implementation.

## Task 1: Remove the blocking first-load intro

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/LoadingStates.tsx`
- Modify: `src/animation/motion-tokens.ts`
- Modify: `src/style.css`

- [x] Remove the `minimumIntroElapsed`, `initialRouteReady`, and `initialOverlayExitComplete` gate from `AppShell`; the app shell must not mark the ready route or bottom navigation inert behind a decorative animation.
- [x] Keep the existing `Suspense` fallback as the single loading surface. Show `RouteLoadingSkeleton` only while the lazy route is unresolved, then show the route as soon as it is ready.
- [x] Remove `InitialLoadingOverlay`, `RouteReadySignal`, `minimumIntroVisibleMs`, and `.first-load-*` styles only after confirming they have no other callers.
- [x] Verify a normal `/wallet` load has no fixed 560 ms wait; the initial skeleton state appeared while the route loaded and the bottom navigation remained available.

## Task 2: Make the balance truthful from first paint

**Files:**
- Modify: `src/pages/WalletPage.tsx`
- Modify: `src/pages/wallet-flows.test.tsx`

  - [x] Render the exact Persian-formatted balance on the first frame; use only a 500 ms opacity/blur entrance with no translation, scaling, or value interpolation.
  - [x] On genuine same-unit balance changes, crossfade only the Persian digits whose place values changed over 300 ms; leave separators and unit changes immediate.
  - [x] Draw the sparkline already integrated into the balance card over 1.1 seconds, with a smooth ease-in-out curve.
  - [x] Keep the amount area free of decorative color and glow so the value stays clear and visually calm.
  - [x] Preserve `tabular-nums`, hidden-balance behavior, direct unit switching, and immediate access to the exact amount for assistive technology.

  **Follow-up revision (2026-10-05):** Replaced the repeated count-up approach after user feedback that the changing digits still felt too fast and unnatural. The amount remains exact from the first frame; initial movement belongs to the existing card sparkline. The open wallet's accessibility tree showed the exact `۱۲۵٬۴۵۰٬۰۰۰ تومان` value. The sparkline draw was stretched to 1.1 seconds, and the colored glow behind the amount was removed after user feedback. Added a colorless focus fade for the initial amount and changed-digit fades only for real same-unit balance updates; expanded their timings after the first fade was imperceptible. Follow-up integration checks passed: `npm test` (20 tests), `npm run lint`, and `npm run build`.

## Task 3: Animate wallet asset exits during filtering

**Files:**
- Modify: `src/components/AnimatedInteractions.tsx`
- Modify: `src/pages/WalletPage.tsx`
- Modify: `src/animation/motion-tokens.ts`
- Modify: `src/pages/wallet-flows.test.tsx`

- [x] Add an opt-in `withPresence?: boolean` prop to `AnimatedList` (default `false`); when enabled, place its keyed children directly inside `AnimatePresence` with `initial={false}`.
- [x] Add an exit state to `AnimatedListItem`: opacity to 0, vertical offset no greater than 4 px, and height to 0 over 120–160 ms; clip overflow during the exit so rows do not overlap.
- [x] Enable presence only on the wallet asset list. Keep the empty state keyed and animated through the same list boundary; do not add stagger to search results.
- [x] Filtering/searching now waits for outgoing rows to finish and leaves one matching row; the exit test confirms old rows remain only during the transition.

## Task 4: Unify quick-action touch feedback and reduced motion

**Files:**
- Modify: `src/style.css`
- Modify: `src/components/AnimatedInteractions.tsx` only if the shared tap scale must be adjusted

- [x] Remove the nested `.quick-action:active > span` scale that compounds with the parent `TapLink` scale; remove the nested icon press scale too.
- [x] Keep one restrained press response on the link (about 0.985 scale) and use a subtle surface/border change on the inner tile for tactile clarity.
- [x] In `prefers-reduced-motion: reduce`, disable the quick-action transform itself, not only its transition duration; keep a non-motion pressed color/surface state.
- [x] Source review confirms one scale at most and an explicit reduced-motion transform override; live media emulation was unavailable in the browser.

## Task 5: Refine allocation-chart selection and collapse

**Files:**
- Modify: `src/pages/WalletPage.tsx`
- Modify: `src/animation/motion-tokens.ts`

- [x] Keep the chart’s one-time initial reveal restrained; reduce the arc draw to 420 ms with a 35 ms stagger and selection feedback to 180 ms.
- [x] Keep the chart’s existing reduced-motion branch immediate. Do not introduce horizontal movement or replay a full arc draw for unrelated wallet state changes.
- [x] Preserve the current layout spring when expanding/collapsing; browser review at a scrolled position kept the asset-list heading within 4 px of its prior screen position.
- [x] Repeated selection, collapse, and expansion update the selected label and `aria-expanded` state without stale chart content.

## Integration Verification

- [x] Run `npm test`, `npm run lint`, and `npm run build`; all pass.
- [x] Review `/wallet` at 360×740 and 390×844 in normal mode; both widths have no horizontal overflow. The browser did not expose live `prefers-reduced-motion` emulation, so that path was reviewed in source instead.
- [x] Check RTL order and motion direction for the balance switch, chart legend, asset filters, and bottom navigation; page transitions remain vertical/fade-based.
  - [x] Confirm initial loading, balance display, hide/reveal, filter/search, chart selection/collapse, and scroll-anchor behavior against the Review Focus criteria before the count-up follow-up.
