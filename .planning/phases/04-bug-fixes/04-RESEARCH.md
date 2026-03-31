# Phase 4: Bug Fixes - Research

**Researched:** 2026-03-31
**Domain:** motion v12 animation timing, CSS viewport units, CSS 3D transforms
**Confidence:** HIGH

## Summary

Phase 4 addresses four bugs in the RPS Challenge game: two effect-triggering failures (confetti and defeat), a mobile viewport layout issue, and a card flip animation backface leak. All bugs have clear, reproducible root causes traceable directly in the existing code.

The effect timing bugs (BFIX-01, BFIX-02) share a common root cause: `AnimatePresence mode="wait"` mounts child components while their parent `motion.div` entry animation is in-flight (opacity 0 -> 1). The child `useEffect` fires immediately on mount, but the DOM element is mid-transition. For `canvas-confetti` (BFIX-01), the confetti fires onto a canvas while the parent is still transparent/invisible, causing particles to render but not be visibly perceived. For `DefeatEffect` (BFIX-02), `useAnimate`'s `scope.current` may not be layout-stable during the parent's entry transition. The mobile viewport fix (BFIX-03) is a straightforward CSS unit swap. The card flip fix (BFIX-04) requires restructuring SuspenseReveal to use a proper dual-face card pattern already established in ChoiceCard.

**Primary recommendation:** Add a `delay` matching the parent entry transition duration (0.5s) before firing effects in BFIX-01/02, swap `min-h-screen` to `min-h-dvh` for BFIX-03, and restructure SuspenseReveal with dual-face card + `backfaceVisibility: 'hidden'` + `transformStyle: 'preserve-3d'` for BFIX-04.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** VictoryConfetti and DefeatEffect timing fix -- ensure execution after AnimatePresence entry animation completes
- **D-02:** canvas-confetti `useWorker: true` option retained. Confetti call must wait until DOM is settled
- **D-03:** DefeatEffect `useAnimate` scope validity -- ensure animate calls run after transition completes
- **D-04:** `min-h-screen` -> `min-h-dvh` for dynamic viewport height
- **D-05:** Fixed bottom bar retained, container uses `min-h-dvh`
- **D-06:** PlayScreen.tsx:90 conflicting `pb-` classes cleaned up
- **D-07:** Game.tsx top-level container also `min-h-screen` -> `min-h-dvh`
- **D-08:** SuspenseReveal restructured to dual-face card with `transformStyle: 'preserve-3d'` and `backfaceVisibility: 'hidden'`
- **D-09:** Card back shows all three icons (rock+paper+scissors) small, card front shows actual AI choice
- **D-10:** Reference ChoiceCard's dual-face pattern for SuspenseReveal implementation

### Claude's Discretion
- Exact delay ms value for effects (after AnimatePresence entry completes)
- dvh fallback strategy (whether to support dvh-unsupported browsers)
- SuspenseReveal back-face icon sizing and arrangement

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BFIX-01 | Victory confetti actually visible on 5-round sweep | Root cause: AnimatePresence entry timing race. Fix: delay confetti fire by parent entry transition duration (0.5s) |
| BFIX-02 | Defeat shake/desaturate effect actually visible on loss | Root cause: same AnimatePresence entry timing race. Fix: delay useAnimate calls by parent entry transition duration (0.5s) |
| BFIX-03 | Mobile choice buttons not hidden behind address bar | Root cause: `min-h-screen` uses `100vh` which excludes mobile chrome. Fix: swap to `min-h-dvh` + clean duplicate pb classes |
| BFIX-04 | AI card content hidden during flip rotation, revealed only on completion | Root cause: missing `backfaceVisibility`/`preserve-3d` on SuspenseReveal. Fix: dual-face card structure from ChoiceCard pattern |

</phase_requirements>

## Root Cause Analysis

### BFIX-01: Victory Confetti Not Firing

**Root cause: AnimatePresence entry transition race**

In `Game.tsx:72-83`, the victory phase renders:
```tsx
<motion.div
  key="victory"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', duration: 0.5 }}
>
  <ResultScreen />
  <VictoryConfetti />
</motion.div>
```

`VictoryConfetti` mounts inside this `motion.div` and its `useEffect` fires immediately when `phase === 'victory'`. However, the parent `motion.div` is still animating from `opacity: 0, scale: 0.9` to `opacity: 1, scale: 1` over 0.5s. Additionally, with `AnimatePresence mode="wait"`, the previous screen's exit animation (the "play" `motion.div` exit with `opacity: 0, scale: 0.95` over 0.3s) must complete before this entry even begins.

The `canvas-confetti` library creates its own global canvas overlay and fires particles immediately when `confetti()` is called. The confetti particles complete their trajectory (with `ticks: 250`) while the parent container is still fading in. By the time the container is fully opaque, most particles have already fallen off screen.

**Additionally:** `useWorker: true` means confetti renders on a web worker off the main thread. There is an initialization overhead the first time the worker is created, which can consume 50-100ms before any particles actually appear.

**Confidence:** HIGH - direct code tracing confirms the timing mismatch.

### BFIX-02: Defeat Effect Not Firing

**Root cause: Same AnimatePresence entry transition race + scope validity**

In `Game.tsx:86-97`:
```tsx
<motion.div
  key="gameover"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', duration: 0.5 }}
>
  <DefeatEffect>
    <ResultScreen />
  </DefeatEffect>
</motion.div>
```

`DefeatEffect`'s `useEffect` fires when `phase === 'gameover'`, calling `animate(scope.current, ...)` for shake and desaturate. But:
1. The parent `motion.div` is mid-entry (opacity 0 -> 1, scale 0.9 -> 1)
2. The shake animation (translateX) may visually conflict with the parent's scale transition
3. The desaturate (grayscale filter) applies to `scope.current` which is the `<div ref={scope}>` wrapping `ResultScreen` -- but the parent `motion.div` is still partially transparent

The user sees the gameover screen appear already desaturated (the effect ran during opacity 0) and already shaken (completed before visible).

**Confidence:** HIGH - same timing analysis as BFIX-01.

### BFIX-03: Mobile Buttons Hidden Behind Address Bar

**Root cause: `100vh` ignores mobile browser chrome**

Three locations use `min-h-screen` which compiles to `min-height: 100vh`:
1. `Game.tsx:46` - top-level container: `min-h-screen`
2. `PlayScreen.tsx:57` - play wrapper: `min-h-screen`
3. `ResultScreen.tsx:11` - result wrapper: `min-h-screen`

On mobile browsers, `100vh` equals the **largest viewport height** (address bar hidden). When the address bar is visible, the actual viewport is smaller than `100vh`, pushing the fixed bottom bar (`PlayScreen.tsx:90`) partially below the visible area.

**Additionally:** `PlayScreen.tsx:90` has conflicting padding-bottom classes:
```tsx
<div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-black/10 backdrop-blur-sm px-4 pt-4 pb-4">
```
Both `pb-[env(safe-area-inset-bottom)]` and `pb-4` are present. In Tailwind CSS, the last class in source order wins when they target the same property, so `pb-4` overrides the safe-area-inset value. This means devices with notches/home indicators lose their safe area padding.

**Confidence:** HIGH - well-documented `vh` vs `dvh` behavior on mobile.

### BFIX-04: AI Card Shows Result During Rotation

**Root cause: Missing backfaceVisibility and dual-face structure**

`SuspenseReveal.tsx` animates a single `<div ref={scope}>` with `rotateY` from 0 to 720 to 900 to 0. The AI icon (`{Icon && <Icon className="w-16 h-16" />}`) is always visible inside this div. During rotation, the card content (the actual AI choice icon) is visible from both sides of the card because:

1. No `transformStyle: 'preserve-3d'` on the container
2. No `backfaceVisibility: 'hidden'` on child faces
3. Single-face structure -- no separate front/back faces

Compare to `ChoiceCard.tsx:30-58` which correctly implements:
- `transformStyle: 'preserve-3d'` on the outer `motion.div`
- Two child `div`s (front face and back face)
- Both with `backfaceVisibility: 'hidden'`
- Back face pre-rotated 180deg (`transform: 'rotateY(180deg)'`)

**Confidence:** HIGH - standard CSS 3D card flip pattern is well-documented and ChoiceCard already demonstrates the correct implementation.

## Architecture Patterns

### Pattern 1: Delayed Effect Execution After AnimatePresence Entry

**What:** Delay imperative animations/effects until the parent `motion.div` entry transition completes.

**When to use:** Any time `useEffect` or `useAnimate` fires inside a component that is a child of an AnimatePresence-wrapped `motion.div` with entry transitions.

**Approach A -- transition.delay on animate() calls (Recommended for BFIX-02):**
```typescript
// DefeatEffect.tsx - add delay matching parent entry transition
useEffect(() => {
  if (phase === 'gameover') {
    const runDefeat = async () => {
      // Wait for parent entry animation (0.5s spring)
      await animate(
        scope.current,
        { x: [0, -4, 4, -4, 4, -2, 2, 0] },
        { duration: 0.3, ease: 'easeOut', delay: 0.5 }
      )
      await animate(
        scope.current,
        { filter: ['grayscale(0%)', 'grayscale(100%)'] },
        { duration: 0.5, ease: 'easeIn' }
      )
    }
    runDefeat()
  }
}, [phase, animate, scope])
```

**Approach B -- setTimeout before imperative call (Recommended for BFIX-01):**
```typescript
// Confetti.tsx - delay confetti() call
useEffect(() => {
  if (phase === 'victory' && !hasFired.current) {
    hasFired.current = true
    // Wait for parent AnimatePresence entry to complete
    const entryDelay = setTimeout(() => {
      confetti({ ...defaults, origin: { x: 0.5, y: 0.7 } })
      // ... subsequent bursts with additional timeouts
    }, 500) // matches parent spring duration
    timerIds.current.push(entryDelay)
  }
  // ...cleanup unchanged
}, [phase])
```

**Why not onAnimationComplete:** The `onAnimationComplete` callback fires on the parent `motion.div` in Game.tsx, not inside the child components. Threading it down via props or context would add coupling. A delay matching the known transition duration is simpler and sufficient.

**Recommended delay value:** 500ms (matches the parent `transition={{ type: 'spring', duration: 0.5 }}` in Game.tsx:78,91). This is a Claude's Discretion item per CONTEXT.md.

### Pattern 2: Dual-Face Card with useAnimate

**What:** Structure SuspenseReveal as a dual-face card (back: 3 icons, front: AI choice) with CSS 3D transforms, animated imperatively via useAnimate.

**When to use:** Card flip animations where content should not be visible through the card during rotation.

**Structure:**
```tsx
function SuspenseReveal({ aiChoice }: SuspenseRevealProps) {
  const revealDone = useGameStore((s) => s.revealDone)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const runSuspense = async () => {
      // Phase 1: Fast shuffle -- rotates the container, backface hides content
      await animate(
        scope.current,
        { rotateY: [0, 360, 720] },
        { duration: 0.6, ease: 'linear' }
      )
      // Phase 2: Deceleration
      await animate(
        scope.current,
        { rotateY: [720, 900] },
        { duration: 0.6, ease: 'easeOut' }
      )
      // Phase 3: Final reveal snap (land on 0 = front face)
      await animate(
        scope.current,
        { rotateY: [900, 1080] }, // 1080 = 6 full rotations, lands front-face-up
        { duration: 0.3, ease: 'easeOut' }
      )
      revealDone()
    }
    runSuspense()
  }, [])

  const Icon = aiChoice ? CHOICE_ICONS[aiChoice] : null

  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-normal text-white mb-2">AI</span>
      <div style={{ perspective: 600 }}>
        <div
          ref={scope}
          className="relative w-28 h-36 rounded-2xl shadow-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front face: AI choice (visible at rotateY 0, 360, 720...) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {Icon && <Icon className="w-16 h-16" />}
          </div>

          {/* Back face: mystery icons (visible at rotateY 180, 540, 900...) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#FF6B6B]"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Three small icons: rock + paper + scissors */}
            <div className="flex gap-1">
              <RockIcon className="w-6 h-6 text-white/80" />
              <PaperIcon className="w-6 h-6 text-white/80" />
              <ScissorsIcon className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Critical animation math:** The final `rotateY` value must be a multiple of 360 (e.g., 1080) so the front face is showing when the animation ends. Current code ends at `rotateY: 0` after `[900, 0]` snap which would work, but a value like `[900, 1080]` is mathematically cleaner (continuous rotation, no reverse).

### Pattern 3: dvh with Fallback

**What:** Replace `min-h-screen` (`100vh`) with `min-h-dvh` (`100dvh`) for mobile-responsive height.

**Browser support:** dvh reached Baseline Widely Available in June 2025. Chrome 108+, Firefox 101+, Safari 15.4+, Edge 108+. ~95% global coverage.

**Fallback strategy (Claude's Discretion -- recommended: no fallback needed):**

Given the target audience (mobile promotional game, likely modern devices), dvh support is near-universal. A simple swap is sufficient:

```css
/* Before */
min-h-screen  /* min-height: 100vh */

/* After */
min-h-dvh     /* min-height: 100dvh */
```

If fallback is desired for edge cases (Samsung Internet <22, UC Browser):
```css
min-h-screen min-h-dvh
```
Tailwind processes classes left-to-right; `min-h-dvh` overrides `min-h-screen` in supporting browsers and is ignored in non-supporting ones. However, this is unnecessary given the target demographic.

### Anti-Patterns to Avoid

- **Using `requestAnimationFrame` for delay:** Unreliable for coordinating with spring-based transitions. A fixed delay matching the known transition duration is more predictable.
- **Using `onAnimationComplete` on parent and prop-drilling:** Over-engineers the solution. The delay value is derived from a constant that both parent and children can reference.
- **Using `svh` instead of `dvh`:** `svh` is the smallest viewport (address bar always shown) which wastes space on desktop and when address bar is hidden. `dvh` adapts dynamically.
- **Animating `rotateY` to a non-360-multiple final value:** The card would end in a rotated state, showing the back face or an angle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card flip with hidden backface | Manual opacity toggling to show/hide card sides | CSS `backfaceVisibility: 'hidden'` + `transformStyle: 'preserve-3d'` | Browser composites this on GPU; toggling opacity causes layout shifts and timing bugs |
| Mobile-safe viewport height | JavaScript `window.innerHeight` listener | CSS `100dvh` via Tailwind `min-h-dvh` | JS resize listeners are janky on mobile, fire at wrong times during address bar animation |
| Animation delay after parent entry | Complex state machine to track parent animation completion | `transition.delay` or `setTimeout` matching known duration | The parent duration is a constant; threading callbacks is over-engineering |

## Common Pitfalls

### Pitfall 1: Confetti Cleanup on Rapid Phase Changes
**What goes wrong:** If the user wins and rapidly clicks "retry", `confetti.reset()` in the cleanup function may race with pending `setTimeout` bursts.
**Why it happens:** `confetti.reset()` clears the canvas, but queued `setTimeout` callbacks can still fire after reset.
**How to avoid:** Clear all timer IDs before calling `confetti.reset()` (current code already does this correctly in cleanup).
**Warning signs:** Ghost confetti particles appearing on the idle/selecting screen after retry.

### Pitfall 2: useAnimate scope.current Null During SSR
**What goes wrong:** `scope.current` is null until the component mounts in the browser.
**Why it happens:** Next.js SSR renders components without a real DOM.
**How to avoid:** Both DefeatEffect and SuspenseReveal are `'use client'` and guard with `phase` checks. The existing guards are sufficient; no additional null checks needed.
**Warning signs:** `TypeError: Cannot read properties of null` in server logs.

### Pitfall 3: dvh Jitter on Scroll
**What goes wrong:** Elements sized with `dvh` can jitter as the browser address bar animates in/out during scroll.
**Why it happens:** `dvh` updates in real-time as the viewport size changes.
**How to avoid:** Use `dvh` for the outermost container (min-height only), not for absolutely positioned elements or elements that animate during scroll. This game has no scrolling, so this is not a concern.
**Warning signs:** Visible layout shifting when slowly scrolling on mobile.

### Pitfall 4: Tailwind Class Order for Conflicting Properties
**What goes wrong:** `pb-[env(safe-area-inset-bottom)]` is overridden by `pb-4` when both are on the same element.
**Why it happens:** Tailwind v4 generates CSS where the last matching utility wins. Both target `padding-bottom`.
**How to avoid:** Use only one `pb-*` class. For safe-area with minimum padding, use: `pb-[max(1rem,env(safe-area-inset-bottom))]`.
**Warning signs:** Buttons touching the bottom edge on notched devices (iPhone with home indicator).

### Pitfall 5: rotateY End Value Must Be 360-Multiple
**What goes wrong:** Card ends in a partially rotated state, showing edge or wrong face.
**Why it happens:** Animation ends at a value that is not a multiple of 360.
**How to avoid:** Ensure final rotateY keyframe value is 0, 360, 720, 1080, etc. for front face, or 180, 540, 900, etc. for back face.
**Warning signs:** Card appears at an angle or shows the wrong side after animation completes.

## Code Examples

### Fix 1: VictoryConfetti with Entry Delay (BFIX-01)

```typescript
// Source: Direct analysis of Game.tsx:72-83 entry transition timing
// Key change: wrap all confetti calls in a parent delay matching entry transition

useEffect(() => {
  if (phase === 'victory' && !hasFired.current) {
    hasFired.current = true

    const defaults = {
      particleCount: 50,
      spread: 80,
      startVelocity: 45,
      gravity: 1.2,
      ticks: 250,
      disableForReducedMotion: true,
      useWorker: true,
    }

    // Delay all bursts by 500ms to wait for parent entry animation
    const ENTRY_DELAY = 500

    timerIds.current.push(
      setTimeout(() => {
        confetti({ ...defaults, origin: { x: 0.5, y: 0.7 } })
      }, ENTRY_DELAY)
    )

    timerIds.current.push(
      setTimeout(() => {
        confetti({ ...defaults, origin: { x: 0.1, y: 0.8 }, angle: 60 })
      }, ENTRY_DELAY + 400)
    )

    timerIds.current.push(
      setTimeout(() => {
        confetti({ ...defaults, origin: { x: 0.9, y: 0.8 }, angle: 120 })
      }, ENTRY_DELAY + 800)
    )

    timerIds.current.push(
      setTimeout(() => {
        confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.5 } })
      }, ENTRY_DELAY + 1200)
    )
  }

  if (phase !== 'victory') {
    hasFired.current = false
  }

  return () => {
    confetti.reset()
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []
  }
}, [phase])
```

### Fix 2: DefeatEffect with Entry Delay (BFIX-02)

```typescript
// Source: Direct analysis of Game.tsx:86-97 entry transition timing
// Key change: add delay to first animate() call

useEffect(() => {
  if (phase === 'gameover') {
    const runDefeat = async () => {
      // Step 1: Shake -- delayed to wait for parent entry animation (0.5s)
      await animate(
        scope.current,
        { x: [0, -4, 4, -4, 4, -2, 2, 0] },
        { duration: 0.3, ease: 'easeOut', delay: 0.5 }
      )
      // Step 2: Desaturate (runs immediately after shake completes)
      await animate(
        scope.current,
        { filter: ['grayscale(0%)', 'grayscale(100%)'] },
        { duration: 0.5, ease: 'easeIn' }
      )
    }
    runDefeat()
  }
}, [phase, animate, scope])
```

### Fix 3: PlayScreen Bottom Bar (BFIX-03)

```tsx
// Source: Tailwind CSS v4 docs - min-height viewport utilities
// Before (line 90):
<div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-black/10 backdrop-blur-sm px-4 pt-4 pb-4">

// After -- single pb with max() for safe-area + minimum:
<div className="fixed bottom-0 left-0 right-0 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/10 backdrop-blur-sm px-4 pt-4">
```

### Fix 4: All min-h-screen -> min-h-dvh locations

```
Game.tsx:46       min-h-screen -> min-h-dvh
PlayScreen.tsx:57 min-h-screen -> min-h-dvh
ResultScreen.tsx:11 min-h-screen -> min-h-dvh
```

## Standard Stack

No new libraries needed. All fixes use existing dependencies:

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| motion | ^12.38.0 | useAnimate, AnimatePresence (existing) | Installed |
| canvas-confetti | ^1.9.4 | Victory confetti (existing) | Installed |
| Tailwind CSS | v4.x | min-h-dvh utility (native) | Installed |

**No npm install needed for this phase.**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for mobile full-height | `100dvh` via `min-h-dvh` | CSS viewport units spec, June 2025 baseline | Fixes mobile address bar issues without JS hacks |
| `framer-motion` package | `motion` package, import from `motion/react` | 2025 rebrand | Already using correct package |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vitest.config.ts) |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BFIX-01 | Confetti fires visibly after parent entry animation | manual-only | N/A -- canvas-confetti creates its own canvas, not testable in jsdom | N/A |
| BFIX-02 | Defeat shake/desaturate visible after parent entry | manual-only | N/A -- useAnimate imperative calls not testable in jsdom (no Web Animations API) | N/A |
| BFIX-03 | Mobile buttons not hidden behind address bar | manual-only | N/A -- viewport behavior requires real mobile browser | N/A |
| BFIX-04 | AI card content hidden during rotation | unit | `npx vitest run src/components/battle/__tests__/SuspenseReveal.test.tsx` | No -- Wave 0 |

**Justification for manual-only:** BFIX-01/02/03 are visual/timing bugs that depend on browser rendering behavior (canvas, WAAPI, mobile viewport). jsdom does not support these APIs. BFIX-04 can have a structural test verifying the dual-face DOM structure and presence of `backfaceVisibility: 'hidden'` style props.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + manual verification of all 4 fixes in mobile browser

### Wave 0 Gaps
- [ ] `src/components/battle/__tests__/SuspenseReveal.test.tsx` -- structural test for dual-face card DOM (covers BFIX-04)
- Existing tests for PlayScreen, ResultScreen, gameStore should continue passing (regression check)

## Open Questions

1. **Exact delay for effects**
   - What we know: Parent entry transition is `type: 'spring', duration: 0.5`. Spring animations can overshoot and settle after the stated duration.
   - What's unclear: Whether 500ms is sufficient or if spring settling takes longer
   - Recommendation: Use 500ms (the stated duration). If testing shows effects still fire too early, increase to 600ms. The spring's `damping: undefined` (default) with `duration: 0.5` should settle within 500ms.

2. **SuspenseReveal final rotateY value**
   - What we know: Current code goes 0->720->900->0. The snap from 900->0 is a large reverse rotation that looks unnatural.
   - What's unclear: Whether to continue forward (900->1080 = front face) or snap to 0 (reverse direction)
   - Recommendation: Use continuous forward rotation: 0->720->900->1080. At 1080 (3 full rotations), front face is showing. More natural motion than reversing.

## Sources

### Primary (HIGH confidence)
- [Motion.dev - useAnimate docs](https://motion.dev/docs/react-use-animate) - scope ref behavior, animate() API
- [Motion.dev - AnimatePresence docs](https://motion.dev/docs/react-animate-presence) - mode="wait" behavior, entry/exit lifecycle
- [Motion.dev - motion component docs](https://motion.dev/docs/react-motion-component) - onAnimationComplete, transition props
- [Motion.dev - transitions docs](https://motion.dev/docs/react-transitions) - transition.delay confirmed
- [Tailwind CSS v4 - min-height docs](https://tailwindcss.com/docs/min-height) - min-h-dvh utility confirmed native
- [David DeSandro - Card Flip 3D transforms](https://3dtransforms.desandro.com/card-flip) - backfaceVisibility + preserve-3d pattern
- [MDN - backface-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility) - CSS spec reference
- Direct code analysis of Game.tsx, Confetti.tsx, DefeatEffect.tsx, SuspenseReveal.tsx, ChoiceCard.tsx, PlayScreen.tsx

### Secondary (MEDIUM confidence)
- [Can I Use - dvh](https://caniuse.com/?search=dvh) - browser support data, Baseline Widely Available June 2025
- [web.dev - viewport units](https://web.dev/blog/viewport-units) - dvh/svh/lvh explanation
- [Tailwind CSS v3.4 blog](https://tailwindcss.com/blog/tailwindcss-v3-4) - dynamic viewport units introduction (carried to v4)

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js 16.2.1 + React 19.2.4 + TypeScript -- all fixes are client-side component changes
- **Animation library:** motion v12 (`motion/react`), NOT `framer-motion` -- already correctly used
- **CSS framework:** Tailwind CSS v4 (CSS-first config, `@import "tailwindcss"`) -- `min-h-dvh` is native utility
- **Canvas confetti:** canvas-confetti ^1.9.4 with `useWorker: true` -- retained per D-02
- **Mobile-first:** minimum touch target 44px -- bottom bar buttons unaffected by this fix
- **Performance:** CSS-based or lightweight animations only -- all fixes use existing libraries, no additions
- **GSD Workflow:** Changes must go through GSD commands, not direct edits

## Metadata

**Confidence breakdown:**
- Root cause analysis: HIGH - direct code tracing, all bugs reproducible from reading the code
- Fix approach (BFIX-01/02): HIGH - delay pattern is well-established, motion v12 `transition.delay` confirmed in docs
- Fix approach (BFIX-03): HIGH - `min-h-dvh` is a standard Tailwind v4 utility, dvh is Baseline
- Fix approach (BFIX-04): HIGH - exact same pattern already exists in ChoiceCard.tsx

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable libraries, CSS specs, no fast-moving concerns)
