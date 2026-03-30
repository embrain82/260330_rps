# Feature Research

**Domain:** HTML5 Promotional Mini-Game (RPS / 가위바위보 챌린지)
**Researched:** 2026-03-30
**Confidence:** HIGH (core game UX), MEDIUM (promo-specific patterns), LOW (Korean market specifics)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any promotional mini-game. Missing these causes abandonment or distrust.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Tap/click to pick (가위/바위/보) | Core game mechanic — without this there's no game | LOW | Three large touch-friendly buttons, min 44px target per platform HIG |
| Simultaneous reveal of both choices | Users must see what AI picked to trust the result | LOW | Side-by-side reveal with images/icons; critical for perceived fairness |
| Clear win/lose/draw outcome display | Immediate legible outcome is non-negotiable | LOW | Text + color + icon — do not rely on color alone (accessibility) |
| Round counter / progress indicator | Users need to know how many rounds remain (5-round structure) | LOW | "Round 1 of 5" or progress dots; required for tension pacing |
| Animated choice reveal | Any RPS game without reveal animation feels broken | MEDIUM | Short CSS animation (0.3–0.6s), shows choice "appearing" |
| Game over screen on loss | User must know the session ended and why | LOW | Show losing round, choice comparison, "try again" CTA |
| Win state with reward indication | Completing 5 rounds requires a payoff moment | LOW | Fireworks/celebration + coupon display |
| "Play Again" / restart button | Universal game UX — users expect to retry | LOW | Prominent CTA on game over and win screens |
| Mobile-first responsive layout | Game is embedded in mobile apps/services | MEDIUM | Touch targets 44px+, portrait-optimized, no hover-only interactions |
| Load time under 3 seconds | 53% of users abandon apps slower than 3s (mobile data) | MEDIUM | Lightweight assets; CSS animations over JS-heavy engines |

### Differentiators (Competitive Advantage)

Features that elevate this game above a generic RPS implementation and serve the promo/event context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-round win probability system (90% → 30%) | Creates escalating tension unique to this product — the "one more round" hook | MEDIUM | Client-side PRNG with seeded outcome; no server needed. Round 5 at 30% feels dramatic |
| Fireworks celebration effect on full clear | Emotional payoff for winning all 5 rounds; reinforces coupon value | MEDIUM | `canvas-confetti` or `fireworks-js` — both lightweight, zero-dep options |
| Defeat "disappointment" effect | Honest emotional feedback; differentiates from generic flat game-over | LOW | CSS shake + desaturate + sad SFX; must feel sympathetic not punishing |
| Tension-building animation before reveal | The "waiting" moment drives cortisol/excitement; makes 30% final round feel momentous | MEDIUM | 1–2s suspense animation before showing AI choice |
| postMessage API callback on win | Enables clean coupon integration with any parent app/service without coupling | LOW | Emit `{ event: 'GAME_WIN', roundsWon: 5 }` to parent window — follows Mention Me pattern |
| Embeddable as iframe or React component | Maximizes distribution across services without per-integration engineering | MEDIUM | CSS containment + postMessage for iframe; named export for component use |
| Smooth round-to-round transition | Polished between-round UX separates promo-quality from hobbyist | LOW | Brief pause (800ms) + transition animation before next round begins |
| Sound design (optional, off by default) | Adds emotional depth; off by default respects embedded context (silent autoplay rules) | MEDIUM | Web Audio API; must respect user agent autoplay policy — default muted |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Server-side win rate validation | "Prevent cheating" — stop users manipulating client-side probability | For a coupon promo, security cost outweighs gain. Adds latency, requires backend, breaks offline/embed. Coupon code generation happens outside this game anyway | Accept client-side probability. Coupon validation lives in external system |
| Real-time multiplayer (PvP) | "More engaging" — play against real people | Requires WebSocket infrastructure, matchmaking, latency handling. Scope explosion for an event game. Marketing value is not in PvP | Keep AI opponent with well-tuned probability curve |
| Persistent score / leaderboard | "Competitive motivation" | Requires auth, database, GDPR-compliance, Korean privacy law (개인정보보호법). Massive scope for v1 | Leaderboard as v2+ after validating engagement |
| Tutorial / help screens | "Onboarding" for a game everyone knows | RPS rules are universal. A tutorial adds friction before the first rewarding interaction | Use brief placeholder text: "가위바위보로 5판 이겨라!" as the full instruction |
| Complex sound design with background music | "More immersive" | Autoplay restrictions in mobile browsers block audio without user gesture. Background music in embedded iframes is especially problematic | Short, optional SFX only, triggered by user interaction (tap), muted by default |
| Replay statistics / history | "Let users review their games" | Session memory is irrelevant for a single-play promo event. Adds state complexity | Show result of current game only |
| Social share of result | "Virality" | Share APIs are fragmented across apps (KakaoTalk, Instagram, etc.). Hard to implement well for v1. Coupon value should drive sharing, not game design | Add as v1.x when specific share target is identified |
| Undo / take-back mechanic | "More forgiving" | Undermines the tension architecture. The irreversibility of each choice is what makes the 5-round structure work | No undo; reinforce with clear "are you sure?" microcopy if needed |

---

## Feature Dependencies

```
[Core Game Loop]
    ├──requires──> [Choice Input UI (3 buttons)]
    ├──requires──> [AI Choice Generator with per-round probability]
    ├──requires──> [Simultaneous Reveal Animation]
    └──requires──> [Outcome Evaluator (win/lose/draw)]

[Outcome Evaluator]
    ├──requires──> [Win State → Celebration Effect]
    │                   └──requires──> [Coupon Display Screen]
    │                                       └──requires──> [postMessage Win Callback]
    └──requires──> [Lose State → Game Over Screen]
                        └──requires──> [Play Again / Restart]

[Round Counter / Progress]
    └──enhances──> [Per-round Probability System]
                        └──creates──> [Tension Arc (R1=90%, R5=30%)]

[Embed Interface]
    ├──requires──> [postMessage API]
    └──requires──> [CSS Containment / No Global Style Leakage]

[Sound Design]
    └──conflicts──> [Autoplay Policy] → must be user-gesture triggered only

[Celebration Effect (Fireworks)]
    └──requires──> [Win State — all 5 rounds cleared]
    └──enhances──> [Coupon Display Screen]
```

### Dependency Notes

- **AI Choice Generator requires per-round probability:** The probability curve (90%→80%→70%→60%→30%) must be baked into the AI selection logic, not applied as a post-hoc filter. Round number is a required input to the generator.
- **postMessage callback requires Win State:** Emit the callback only after all 5 rounds are confirmed won, not on individual round wins.
- **Celebration Effect requires Win State (5-round clear):** Do not show fireworks on intermediate round wins — reserve the effect for maximum emotional impact on full clear.
- **Sound Design conflicts with Autoplay Policy:** Web Audio context must be created or resumed inside a user gesture handler (the choice button tap). Cannot autoplay on page load in embedded context.
- **Embed Interface requires CSS containment:** Game styles must not leak to parent document. Use CSS Modules or scoped Tailwind. Avoid global resets.

---

## MVP Definition

### Launch With (v1)

Minimum viable product to validate the promo game concept and enable coupon distribution.

- [x] Three-button choice input (가위/바위/보) with 44px+ touch targets
- [x] AI choice generator with per-round probability curve (1:90%, 2:80%, 3:70%, 4:60%, 5:30%)
- [x] Simultaneous choice reveal with icons/images
- [x] Clear win/lose/draw outcome text + color coding
- [x] Round counter (showing current round of 5)
- [x] 5-round progressive structure (lose = immediate game over)
- [x] Win celebration screen (fireworks effect + coupon display area)
- [x] Defeat screen with "try again" CTA
- [x] postMessage callback on full clear (`{ event: 'GAME_WIN' }`)
- [x] Mobile-first responsive layout (portrait, 360px+)
- [x] Reveal animation between choice and outcome

### Add After Validation (v1.x)

Features to add once core engagement is confirmed through usage data.

- [ ] Sound effects — measure if users want audio before building; add toggle if yes
- [ ] Social share button — only when specific target platform (KakaoTalk etc.) is defined
- [ ] Richer between-round transition animation — if user testing shows pacing feels abrupt
- [ ] Haptic feedback via Vibration API — on choice confirm and on outcome reveal

### Future Consideration (v2+)

Defer until product-market fit is established.

- [ ] Leaderboard / win streak tracking — requires auth + backend
- [ ] Configurable win-rate curve via props — allows A/B testing by parent service
- [ ] Multiple game skin themes — if used across multiple campaigns
- [ ] Analytics event hooks — expose `onRoundEnd`, `onGameEnd` callbacks for parent tracking

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Choice input (3 buttons) | HIGH | LOW | P1 |
| Per-round probability system | HIGH | LOW | P1 |
| Simultaneous reveal + outcome | HIGH | LOW | P1 |
| Round counter / progress | HIGH | LOW | P1 |
| Win celebration (fireworks) | HIGH | MEDIUM | P1 |
| Defeat screen + restart | HIGH | LOW | P1 |
| postMessage win callback | HIGH | LOW | P1 |
| Mobile responsive layout | HIGH | MEDIUM | P1 |
| Reveal suspense animation | MEDIUM | LOW | P1 |
| Disappointment defeat effect | MEDIUM | LOW | P2 |
| Sound effects (optional) | MEDIUM | MEDIUM | P2 |
| Haptic feedback (Vibration API) | LOW | LOW | P2 |
| Social share | LOW | HIGH | P3 |
| Leaderboard | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Generic RPS (codepen/open-source) | Spin-to-Win Promo Games | Our Approach |
|---------|----------------------------------|-------------------------|--------------|
| Win probability | Always 33% (fair random) | Pre-set single win rate | Per-round degrading curve (90%→30%) for tension arc |
| Outcome feedback | Text only | Flash animation | Combined: text + animation + emotional effect (fireworks vs disappointment) |
| Reward integration | None | Email capture / popup | postMessage callback → parent handles coupon; clean separation |
| Round structure | Best of 3 or infinite | Single spin | 5-round elimination — uniquely raises stakes per round |
| Mobile optimization | Variable | Good (marketing-focused) | First-class: designed portrait-first, 44px targets |
| Embed support | No | Via script tag | iframe + React component export |
| Sound | Basic or none | Often intrusive | Off by default, user-triggered SFX only |

---

## Sources

- [Top UI/UX Practices for HTML5 Games — Genieee](https://genieee.com/top-ui-ux-practices-for-html5-games-enhance-player-engagement-and-retention/) (MEDIUM confidence — not dated, general best practices)
- [Gamified promotions: psychology and campaign patterns — Voucherify](https://www.voucherify.io/blog/psychology-behind-promotions-gamification) (MEDIUM confidence — industry blog, well-sourced)
- [Best practices of building mobile-friendly HTML5 games — Gamedev.js](https://gamedevjs.com/articles/best-practices-of-building-mobile-friendly-html5-games/) (MEDIUM confidence)
- [canvas-confetti — GitHub/npm](https://github.com/catdad/canvas-confetti) (HIGH confidence — actively maintained, 10k+ stars)
- [Window.postMessage() — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) (HIGH confidence — official spec)
- [Vibration API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) (HIGH confidence — W3C spec, but note: not supported on iOS Safari)
- [Using postMessage to control an iframe — Mention Me](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/grantPromotionRewardForGame.html) (MEDIUM confidence — production pattern reference)
- [Mobile Game UX Design Trends 2025 — Red Apple Technologies](https://redappletechnologies.medium.com/user-experience-ux-design-trends-for-mobile-games-in-2025-ff8293c63d87) (LOW confidence — Medium blog, 2025)
- [Next.js Bundle Optimization 2025 — Catchmetrics](https://www.catchmetrics.io/blog/optimizing-nextjs-performance-bundles-lazy-loading-and-images) (MEDIUM confidence)

---
*Feature research for: HTML5 promotional RPS mini-game (가위바위보 챌린지)*
*Researched: 2026-03-30*
