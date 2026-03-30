# Pitfalls Research

**Domain:** HTML5 promotional mini-game (RPS / 가위바위보 챌린지)
**Researched:** 2026-03-30
**Confidence:** HIGH (core pitfalls), MEDIUM (security/fraud specifics)

---

## Critical Pitfalls

### Pitfall 1: Client-Side Probability Is Fully Visible and Manipulable

**What goes wrong:**
The weighted probability table (round 1 = 80–90%, round 5 = 30%) lives in JavaScript that users can read, pause, and override in browser DevTools. A determined user can set a breakpoint before the AI choice is resolved, inspect the computed outcome, or monkey-patch `Math.random` to always return a value that forces a win. Because the coupon is the reward, this is an attractive target.

**Why it happens:**
The project explicitly chose client-side probability to avoid server round-trips. This is the correct tradeoff for speed, but developers often implement it without acknowledging the exposure surface.

**How to avoid:**
- Keep the probability logic opaque: compute AI's choice in a single, minimal function with no intermediate state leakage. Do not store the AI's decision in a variable before the animation resolves — compute and commit atomically.
- Accept that sophisticated users can cheat, but raise the bar: obfuscate variable names in production builds (Next.js production build does this automatically via minification).
- Coupon issuance must happen server-side. The game client fires a "win" event; the server validates session context and issues the coupon. Never pass the coupon code back in the same postMessage payload that triggers the win screen.
- If abuse becomes a real problem: move round 5 probability resolution to a serverless function call (single API call, low latency, eliminates the attack surface for the hardest round).

**Warning signs:**
- Coupon redemption rate far exceeds the theoretical win probability (5 consecutive wins at declining odds ≈ 90%×80%×70%×60%×30% ≈ ~9% theoretical). If redemption spikes above 20%, client-side manipulation is likely.
- Users reporting "the game feels rigged against me" AND users reporting abnormally easy wins simultaneously — indicates someone shared a cheat method.

**Phase to address:**
Phase 1 (Core game logic). Architecture decision must be made before implementing probability. Define where probability resolves, and define the coupon issuance interface contract upfront.

---

### Pitfall 2: Coupon Replay and Duplicate Issuance

**What goes wrong:**
The game emits a "win" event (postMessage or callback). If the parent app processes this naively, a user can replay the event (re-trigger postMessage from DevTools), or the event fires twice due to animation/state race conditions, resulting in multiple coupon issuances per play session.

**Why it happens:**
Developers treat postMessage as a reliable event and the parent app processes every received message. No idempotency guard is added because "the game only wins once" — but the game's message can be sent multiple times.

**How to avoid:**
- Assign each game session a UUID generated at game load. Include this session ID in the win event payload.
- The coupon-issuing backend must treat the session ID as an idempotency key — second issuance attempt for the same session ID is silently ignored or returns the already-issued coupon.
- The game UI must set an `issuancePending` flag the moment the win event is fired. Block any re-trigger while pending. Disable all interaction buttons on game completion.
- Validate on the server that the session ID has not been used before issuance.

**Warning signs:**
- Same user receiving two identical coupons in backend logs.
- Error logs showing duplicate postMessage handlers in the parent app.
- Coupon issuance count exceeds unique game session count.

**Phase to address:**
Phase 1 (API contract definition) + Phase 2 (coupon integration). Define idempotency requirements before integration work begins.

---

### Pitfall 3: Touch Event Double-Firing and Button Spam

**What goes wrong:**
On mobile, attaching both `touchend` and `click` listeners to the RPS choice buttons causes the handler to fire twice per tap. The event order on touch devices is `touchstart → touchend → mousedown → mouseup → click`. If both listeners are attached, the player's choice is submitted twice — potentially advancing game state before the first round's animation completes.

Additionally, without input locking during the AI reveal animation, rapid taps let users submit a second-round choice before the first outcome is even displayed, corrupting game state.

**Why it happens:**
React's `onClick` synthesizes the click event, which fires after the 300ms touch delay on older iOS without `viewport-fit` configured. Developers then add `onTouchEnd` to feel faster, creating double-fire. Separately, developers forget to disable buttons during animation sequences.

**How to avoid:**
- Use React `onClick` only. Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is present — this eliminates the 300ms delay on modern iOS/Android without additional libraries.
- Implement a `gamePhase` state enum: `IDLE | CHOOSING | REVEALING | RESULT | GAME_OVER | WIN`. Only accept input during the `IDLE` phase. All choice buttons render as `disabled` or `pointer-events: none` during any other phase.
- Use `pointer-events: none` on the entire choice container during the reveal animation, re-enabling only after the animation `onAnimationEnd` callback fires.

**Warning signs:**
- Console logs showing duplicate game state transitions within the same animation frame.
- Users reporting "I picked rock but it showed scissors" — first choice ignored, second registered.
- Flickering during the reveal sequence on low-end Android devices.

**Phase to address:**
Phase 1 (core game loop). The phase state machine must be designed before any UI work.

---

### Pitfall 4: CSS Animation Jank on Mid-Range Android Devices

**What goes wrong:**
Animating CSS properties that trigger layout (e.g., `width`, `height`, `top`, `left`, `margin`) forces browser reflow on every frame. On mid-range Android devices (the actual target demographic for promotional apps), this produces visible jank at the precise moment of game tension — the AI reveal. Confetti/fireworks effects using many DOM nodes simultaneously are especially prone to this.

**Why it happens:**
Developers test on high-end iPhones or desktop Chrome, where the GPU compositor masks layout thrashing. The game ships with `box-shadow` pulses, bounce animations using `scale+margin`, or particle effects using absolute-positioned `<div>` elements.

**How to avoid:**
- Animate exclusively using `transform` and `opacity`. These are compositor-only properties and never trigger layout or paint.
- For the win confetti effect, use `canvas-confetti` (the `catdad/canvas-confetti` library): it renders entirely on a canvas element, never touches the DOM layout tree, and handles cleanup automatically. Keep particle count under 300 on mobile.
- For the RPS choice reveal animation: use `transform: scale()` and `transform: translateY()`, not `width/height` or `top/left`.
- Add `will-change: transform` to elements that animate frequently, but only to those elements (overuse causes excessive GPU memory consumption on mobile).
- Test specifically on a mid-range Android (e.g., Chrome DevTools throttled to "Mid-tier mobile" CPU 4x slowdown) before shipping.

**Warning signs:**
- Chrome DevTools Performance panel shows long paint/composite frames (>16ms) during animation.
- The reveal animation stutters or skips frames when tested at 4x CPU throttle.
- `requestAnimationFrame` callbacks running slower than 30fps during the fireworks sequence.

**Phase to address:**
Phase 2 (UI/animation implementation). Establish animation property rules at the start of UI work, before any animation code is written.

---

### Pitfall 5: iOS Safari Viewport Height Cuts Off Game UI

**What goes wrong:**
`100vh` on iOS Safari calculates to the maximum possible viewport height — including the collapsed browser chrome. When the page first loads, the browser chrome is visible, making the actual visible area shorter than `100vh`. Game UI elements at the bottom (choice buttons, score display) are hidden behind or very close to the Safari navigation bar. On iPhone notch/Dynamic Island models, `safe-area-inset-bottom` is also ignored without explicit configuration.

**Why it happens:**
Developers test on desktop Chrome or Android, where `100vh` behaves predictably. iOS Safari's quirk has existed since 2015 and persists in 2026 for apps not using the newer viewport units.

**How to avoid:**
- Use `dvh` (dynamic viewport height) instead of `vh` for full-screen game containers: `height: 100dvh`. This unit dynamically adapts as the browser chrome shows/hides. Browser support is high (95%+ as of 2026).
- Add `viewport-fit=cover` to the viewport meta tag and apply `padding-bottom: env(safe-area-inset-bottom)` to the bottom action bar containing choice buttons.
- Minimum touch target size of 44px (per project constraint) must be measured from above the safe area inset, not from the raw screen bottom.
- Fallback: `min-height: -webkit-fill-available` for older iOS versions that lack `dvh` support.

**Warning signs:**
- On iOS, the choice buttons appear partially or fully obscured when page loads.
- Bottom padding looks correct on desktop and Android but cramped on iPhone.
- User complaints about inability to see all three choices on smaller iPhones.

**Phase to address:**
Phase 2 (mobile-first UI layout). Apply `dvh` and safe-area patterns before building any layout, not as a fix after.

---

### Pitfall 6: iframe Embed Height Is Static or Breaks Resize

**What goes wrong:**
The game is embedded via iframe into a parent app. If the iframe is given a fixed pixel height, it either clips content on small screens or leaves dead whitespace on large screens. If the game uses dynamic content (victory screen vs. game screen have different heights), the iframe frame becomes mismatched after phase transitions. Developers set `height: 100%` on the iframe, which does nothing unless the parent has an explicit height.

**Why it happens:**
iframe height inheritance is counterintuitive. `height: 100%` on an iframe refers to the parent container's height, not the iframe's content height. Cross-origin iframes cannot be read by the parent for content sizing.

**How to avoid:**
- The game (iframe child) must send its content height to the parent via `postMessage` after each significant state change (game start, round result, win/game-over screen).
- Parent app listens to the message event and sets `iframe.style.height` dynamically.
- Always validate `event.origin` in the parent's message listener — never use `'*'` as the allowed origin.
- For same-origin embeds, use `iframe-resizer` library which handles edge cases automatically.
- Design the game to a fixed aspect ratio (e.g., mobile-card style, max-width 400px, fixed height proportional) to minimize the dynamic resize problem entirely.

**Warning signs:**
- iframe shows scrollbars inside the game area on mobile.
- Victory/coupon screen is partially clipped inside the iframe.
- Parent app's page has unexpected extra whitespace below the game.

**Phase to address:**
Phase 3 (embed integration). Define postMessage protocol — including height reporting messages — before any integration work with the parent app.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode probability values in component | Fast to implement | Cannot A/B test reward rates; changing values requires redeploy | Only if rates are permanently fixed by business decision |
| Use `Math.random()` directly without abstraction | Simple | Cannot be mocked in tests; cannot be replaced with server-side RNG later | Never for logic that determines real rewards |
| No game session ID / idempotency key | Saves backend work | Enables duplicate coupon issuance | Never |
| Inline animation logic in component render | Fast to prototype | Becomes unmaintainable; hard to test timing; blocks phase state machine extension | Only in throwaway prototypes |
| Skip `disabled` state on buttons during animation | Simpler code | Race conditions on fast taps; corrupted game state | Never |
| `100vh` instead of `dvh` | Works on desktop | Broken layout on iOS Safari | Never for new code |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Parent app postMessage (win event) | Send coupon code in the win postMessage payload | Send a win event with a session ID only; parent app calls backend to validate session and issue coupon |
| Parent app postMessage (origin check) | Use `event.origin === '*'` or skip origin check | Whitelist specific allowed origins; reject all others silently |
| Coupon backend API | No idempotency — issue coupon on every win event received | Use session UUID as idempotency key; backend returns existing coupon for duplicate session IDs |
| Parent app iframe height | Set fixed pixel height | Listen for height postMessages from game; update `iframe.style.height` dynamically |
| Animation library (confetti) | Use large DOM-node particle systems | Use canvas-confetti for particle effects; never DOM-based particles for high-count effects |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating `box-shadow` / `filter: drop-shadow` on each frame | Jank during RPS reveal; paint layer compositing overhead | Use `transform` and `opacity` only; fake shadows with pseudo-elements that don't animate | Every mid-range Android on page load |
| DOM-based confetti (many `<div>` particles) | Win screen jank; 15+ fps on iPhone SE | Use canvas-confetti | 100+ particles on any device |
| Multiple `useEffect` listeners for animation timing | Race conditions between state transitions and animation end | Single state machine with phase enum; one source of truth | As soon as animations exceed 300ms |
| Uncleared `requestAnimationFrame` / `setTimeout` on unmount | Memory leaks and stale state updates if user closes game mid-round | Return cleanup functions from every `useEffect`; cancel all timers/frames | After first component unmount |
| Loading large RPS imagery in-frame without size constraints | Blocking renders; visible image pop-in | Use Next.js `<Image>` with explicit `width`/`height`; or inline SVG | On first load over 4G |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Expose probability weights in readable variable names | User can inspect and understand the rigging; adjust their strategy or publish the weights publicly, damaging promotional trust | Minification handles names; but also avoid logging probability values to console in production |
| Trust win events from the client for coupon issuance without session validation | Replay attack: user resends win postMessage without playing; anyone who reads the event format can issue arbitrary coupons | Server validates session ID exists, was created within the last N minutes, and has not been used before issuing coupon |
| Use `*` as postMessage targetOrigin when sending win event | Any page with an iframe pointing to the game can intercept win events or inject fake win events | Set targetOrigin to the specific parent origin; validate event.origin on receive |
| No rate limiting on coupon issuance endpoint | Single user with many session IDs can abuse at scale; bot scripts can farm coupons | Rate limit by device fingerprint / user account / IP at the backend; cap coupons per user per event period |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback during the "AI thinking" phase | Users tap again thinking their first tap was missed | Show a loading/shake animation immediately on choice tap (within 100ms); disable buttons visually |
| Game over screen with no retry CTA | Users close the app/page; they never re-engage | Show a prominent "다시 도전" (Try Again) button on game over; reset to IDLE state cleanly |
| Win probability too transparent in UI | Users who lose round 5 blame unfairness; chilling effect on re-engagement | Never display win probability percentages in the UI; keep the sense of "almost made it" without mathematical framing |
| Coupon screen with no copy or share mechanism | Users screenshot awkwardly; coupon code gets cropped | Provide a dedicated "쿠폰 코드 복사" button; ensure coupon code is displayed in a large, selectable font |
| Sudden difficulty jump to round 5 (30%) | Users who won rounds 1–4 easily feel the game is suddenly broken/rigged | Add visible tension signals (UI darkens, music changes, AI confidence animations) earlier — make the difficulty curve feel intentional, not random |
| Replay button resets without animation cleanup | Previous confetti or effect overlaps the new game start | Ensure all animation frames are cancelled and canvas cleared before IDLE state is re-entered |

---

## "Looks Done But Isn't" Checklist

- [ ] **Probability implementation:** The weighted probability uses a proper random draw against the configured weights — not just `Math.random() > 0.7`. Verify all 5 rounds have correct bounds and the calculation is in one testable function.
- [ ] **Button locking:** All three choice buttons and the replay button are `disabled` or `pointer-events: none` during any non-IDLE game phase. Verify by rapidly tapping during reveal animation.
- [ ] **iOS Safari layout:** Test on a real iPhone or Safari simulator with browser chrome visible — confirm all three choice buttons are fully visible without scrolling.
- [ ] **Coupon screen idempotency:** Trigger the win event twice in succession (simulate programmatically). Confirm only one coupon is issued.
- [ ] **postMessage origin validation:** In the parent app, log `event.origin` on message receipt. Confirm only the game's origin is accepted.
- [ ] **Animation cleanup on unmount:** Navigate away from the game mid-animation. Confirm no React state update warnings in console ("Can't perform a React state update on an unmounted component").
- [ ] **Confetti on win:** Verify confetti animation does not cause frame drops below 30fps on Chrome with 4x CPU throttle enabled.
- [ ] **Game over state is final:** Confirm that after game over, no interaction is possible until explicit replay action. No stray timers can revive the game loop.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Client-side probability manipulation discovered | MEDIUM | Move round 5 resolution to a serverless function; existing game sessions unaffected; deploy fix same-day |
| Duplicate coupon issuance discovered | HIGH | Audit backend coupon logs; revoke duplicates; add idempotency key to endpoint; requires backend work |
| iOS layout broken in production | LOW | CSS-only fix (`dvh` + safe-area-inset); deploy without rebuild in most cases |
| Touch double-fire causing state corruption | MEDIUM | Add `gamePhase` guard to choice handler; requires frontend rebuild and test pass |
| iframe height broken in parent app | LOW-MEDIUM | Add postMessage height reporting to game; parent adds listener; can be done independently |
| Confetti jank on production devices | LOW | Swap DOM confetti for canvas-confetti; props-compatible API; 1-day fix |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Client-side probability manipulation | Phase 1 (game logic architecture) | Code review: probability in single function; no intermediate variable exposure; build outputs minified |
| Coupon replay / duplicate issuance | Phase 1 (API contract) + Phase 2 (integration) | QA: send win event twice; confirm single coupon |
| Touch double-fire and button spam | Phase 1 (game state machine design) | QA: rapid-tap all buttons during every animation; no state corruption |
| CSS animation jank on Android | Phase 2 (UI/animation implementation) | Performance test: Chrome DevTools 4x CPU throttle; all animations ≥30fps |
| iOS Safari viewport height | Phase 2 (mobile layout) | Test on Safari simulator; all buttons visible on iPhone SE screen |
| iframe embed height | Phase 3 (embed integration) | QA: resize browser window during game; iframe height follows content |
| postMessage origin not validated | Phase 3 (embed integration) | Security review: event.origin check present in parent listener |
| No idempotency on coupon issuance | Phase 2 (coupon integration) | Code review + QA: duplicate win event produces single coupon |

---

## Sources

- Chrome for Developers: [300ms tap delay, gone away](https://developer.chrome.com/blog/300ms-tap-delay-gone-away)
- MDN: [Animation performance and frame rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- MDN: [CSS and JavaScript animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)
- Bram.us: [The Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/)
- MDN: [Window: postMessage() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- Medium: [PostMessage Vulnerabilities: When Cross-Window Communication Goes Wrong](https://medium.com/@instatunnel/postmessage-vulnerabilities-when-cross-window-communication-goes-wrong-4c82a5e8da63)
- Fingerprint.com: [How to Prevent Coupon and Promo Abuse](https://fingerprint.com/blog/prevent-coupon-promo-abuse-increase-sales/)
- Sumsub: [Bonus Abuse in Gambling: Types, Risks & How to Prevent It 2025](https://sumsub.com/blog/promo-abuse-fraud-how-to-avoid-it/)
- DeepSource: [Don't use Math.random()](https://deepsource.com/blog/dont-use-math-random)
- GitHub: [canvas-confetti](https://github.com/catdad/canvas-confetti)
- DEV Community: [Building a mini casual game with Next.js](https://dev.to/lansolo99/building-a-mini-casual-game-with-nextjs-1db8)
- Medium: [How to Build a Responsive iFrame Using postMessage](https://medium.com/@pratikmathur279/how-to-build-a-responsive-iframe-using-postmessage-60b33ffa860f)
- SitePoint: [5 Ways to Prevent the 300ms Click Delay on Mobile Devices](https://www.sitepoint.com/5-ways-prevent-300ms-click-delay-mobile-devices/)

---
*Pitfalls research for: HTML5 promotional mini-game / 가위바위보 챌린지*
*Researched: 2026-03-30*
