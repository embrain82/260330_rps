# Phase 3: Embed & Integration - Research

**Researched:** 2026-03-30
**Domain:** iframe embedding, postMessage cross-origin communication, coupon reward UI
**Confidence:** HIGH

## Summary

Phase 3 integrates the completed game (Phases 1-2) into an embeddable iframe context with bidirectional postMessage communication. The parent page sends coupon configuration to the game via `RPS_COUPON_CONFIG`, and the game sends session data back via `RPS_GAME_WIN` on victory. The existing codebase already has all game state infrastructure in place -- `SessionPayload` type, `finalizeSession()`, Zustand store with `session` field populated at victory. The work is surgical: add headers to `next.config.ts`, wire postMessage send/receive, upgrade `ResultScreen.tsx` with coupon display, apply CSS containment, and create a test harness HTML page.

The technical risk is LOW. All APIs involved (postMessage, CSS `contain`, Next.js `headers()`) are mature, well-documented, and have full browser support. The main pitfall is security: origin validation must be configurable via `NEXT_PUBLIC_ALLOWED_ORIGIN` and the test page must demonstrate the full bidirectional message flow.

**Primary recommendation:** Implement in 3 focused areas: (1) Next.js config + CSS containment for iframe readiness, (2) postMessage hook for bidirectional communication + Zustand coupon state, (3) coupon UI in ResultScreen + test-embed.html harness.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Coupon data received from parent via postMessage(`RPS_COUPON_CONFIG`). Game stores on receipt, displays on victory only.
- **D-02:** Coupon data structure: `{ type: 'RPS_COUPON_CONFIG', couponCode: string, couponImage?: string, couponText?: string }`
- **D-03:** No coupon data = congratulations message only, coupon area hidden. Game works without coupon.
- **D-05:** Win event fires immediately on victory state entry. Coupon screen renders simultaneously.
- **D-06:** postMessage event type: `RPS_GAME_WIN`. Payload is SessionPayload only (no coupon data).
- **D-07:** postMessage structure: `{ type: 'RPS_GAME_WIN', payload: { sessionId, rounds, startedAt, completedAt, totalPlayTimeMs } }`
- **D-08:** Origin validation via `NEXT_PUBLIC_ALLOWED_ORIGIN` env var. Default `'*'`.
- **D-09:** Allow all domains for iframe embedding. Remove X-Frame-Options, set CSP `frame-ancestors *`. Env var can restrict in production.
- **D-10:** CSS containment applied -- game styles must not leak to parent page.
- **D-11:** Create `public/test-embed.html` -- iframe embed + coupon config send + postMessage log display.

### Claude's Discretion
- Coupon UI layout details -- render flexibly based on available data (code, image, text)
- CSS containment implementation approach (`contain` property, scoped styles, etc.)
- `next.config.ts` headers structure
- postMessage listener implementation location (Game.tsx, store, or dedicated hook)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTG-01 | 5-round victory displays coupon code/image victory screen | Coupon data type defined (D-02), ResultScreen.tsx exists with victory state, Zustand store holds session. Add coupon state to store, render conditionally in ResultScreen. |
| INTG-02 | Victory fires postMessage to parent window with session UUID | SessionPayload type already defined, finalizeSession() populates completedAt/totalPlayTimeMs. Wire `window.parent.postMessage()` in useEffect on `phase === 'victory'`. |
| INTG-03 | Game embeddable in iframe with no style leakage (CSS containment, X-Frame-Options) | Next.js `headers()` API verified for CSP/X-Frame-Options. CSS `contain: strict` for layout/paint isolation. Game already fills container with `min-h-screen`. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js (16.2.1 installed) + React 19.2.4 + TypeScript + Tailwind CSS v4
- **Platform:** Mobile-first responsive, minimum touch target 44px
- **Performance:** CSS-based or lightweight libraries only, no heavy game engines
- **Embed:** Must be embeddable via iframe or component in external services
- **Animation:** Import from `motion/react`, NOT `framer-motion`
- **State:** Zustand v5 for game state
- **Styling:** Tailwind CSS v4 utility classes, no CSS-in-JS
- **Router:** App Router (`app/` directory), no Pages Router APIs
- **GSD workflow:** All edits through GSD commands

## Standard Stack

No new dependencies needed. Phase 3 uses only existing stack + browser APIs.

### Core (Already Installed)
| Library | Version | Purpose | Phase 3 Usage |
|---------|---------|---------|---------------|
| Next.js | 16.2.1 | App framework | `next.config.ts` headers() for iframe embedding headers |
| React | 19.2.4 | UI components | `useEffect` for postMessage send/receive |
| TypeScript | 5.x | Type safety | Type definitions for message contracts |
| Zustand | 5.0.12 | State management | Add `couponConfig` state for received coupon data |
| Tailwind CSS | v4.x | Styling | Coupon UI layout, CSS containment utilities |
| motion | 12.38.0 | Animation | Coupon reveal animation in ResultScreen |

### Browser APIs Used (No Install)
| API | Purpose | Browser Support |
|-----|---------|-----------------|
| `window.postMessage()` | Cross-origin iframe communication | All modern browsers (IE10+) |
| `window.addEventListener('message')` | Receive messages from parent | All modern browsers |
| `crypto.randomUUID()` | Session UUID (already used) | Chrome 92+, Firefox 95+, Safari 15.4+ |
| CSS `contain` property | Style/layout isolation | Chrome 52+, Firefox 69+, Safari 15.4+ |

**Installation:** None required. All dependencies already installed.

## Architecture Patterns

### Integration Points in Existing Code

```
src/
├── app/
│   └── page.tsx                    # Entry point (already dynamic import, ssr:false)
├── components/
│   ├── Game.tsx                    # ADD: postMessage send on victory
│   └── screens/
│       └── ResultScreen.tsx        # MODIFY: add coupon display UI
├── store/
│   └── gameStore.ts                # ADD: couponConfig state field
├── lib/
│   └── rps/
│       └── types.ts                # ADD: CouponConfig, PostMessageEvent types
├── hooks/                          # NEW: usePostMessage hook (optional)
│   └── usePostMessage.ts
├── next.config.ts                  # MODIFY: add headers() for iframe
└── public/
    └── test-embed.html             # NEW: embed test harness
```

### Pattern 1: Bidirectional postMessage Contract

**What:** Parent sends coupon config to game, game sends win event to parent. Each direction uses a single message type.

**When to use:** Always -- this is the locked decision from CONTEXT.md.

**Implementation approach:**

```typescript
// --- Type definitions (add to src/lib/rps/types.ts) ---

export interface CouponConfig {
  couponCode: string
  couponImage?: string
  couponText?: string
}

// Inbound message from parent
export interface RpsCouponConfigMessage {
  type: 'RPS_COUPON_CONFIG'
  couponCode: string
  couponImage?: string
  couponText?: string
}

// Outbound message to parent
export interface RpsGameWinMessage {
  type: 'RPS_GAME_WIN'
  payload: SessionPayload
}
```

**Message flow:**
1. Parent embeds game in iframe
2. Parent sends `RPS_COUPON_CONFIG` via postMessage (can be sent at any time -- game stores it)
3. Player wins all 5 rounds, game enters `victory` phase
4. Game fires `RPS_GAME_WIN` with SessionPayload to `window.parent`
5. Game renders coupon UI (if config was received) or congratulations only

### Pattern 2: postMessage Hook

**What:** Custom React hook (`usePostMessage`) that handles both sending and receiving.

**Recommended location:** Dedicated hook file at `src/hooks/usePostMessage.ts`, called from `Game.tsx`.

**Why hook, not store middleware:** The postMessage listener needs `useEffect` for cleanup. Zustand actions are synchronous -- they cannot set up/tear down event listeners. A hook that reads/writes to the store is the cleanest separation.

```typescript
// src/hooks/usePostMessage.ts
// Pseudocode structure:
export function usePostMessage() {
  const phase = useGameStore((s) => s.phase)
  const session = useGameStore((s) => s.session)
  const setCouponConfig = useGameStore((s) => s.setCouponConfig)

  // RECEIVE: Listen for RPS_COUPON_CONFIG from parent
  useEffect(() => {
    const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'

    function handleMessage(event: MessageEvent) {
      // Origin validation
      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) return

      // Type guard
      if (event.data?.type === 'RPS_COUPON_CONFIG') {
        setCouponConfig({
          couponCode: event.data.couponCode,
          couponImage: event.data.couponImage,
          couponText: event.data.couponText,
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setCouponConfig])

  // SEND: Fire RPS_GAME_WIN on victory
  useEffect(() => {
    if (phase !== 'victory') return

    const targetOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'
    const message: RpsGameWinMessage = {
      type: 'RPS_GAME_WIN',
      payload: session,
    }
    window.parent.postMessage(message, targetOrigin)
  }, [phase, session])
}
```

### Pattern 3: Zustand Store Extension for Coupon

**What:** Add `couponConfig` state and `setCouponConfig` action to the existing game store.

**Key constraint:** `couponConfig` must NOT reset on `retry()`. The parent sends it once; it persists across game replays within the same iframe session.

```typescript
// Added to GameStore interface:
couponConfig: CouponConfig | null

// Added to actions:
setCouponConfig: (config: CouponConfig) => void

// In retry(): do NOT reset couponConfig
retry: () => {
  set({
    ...initialState,
    session: { ...emptySession },
    roundResults: [],
    // couponConfig intentionally preserved
    couponConfig: get().couponConfig,
  })
},
```

### Pattern 4: Next.js Headers for iframe Embedding

**What:** Configure `next.config.ts` to allow iframe embedding from any origin.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Notes:**
- `frame-ancestors *` is the modern CSP directive that supersedes X-Frame-Options
- X-Frame-Options `ALLOWALL` is included for legacy browser compatibility
- D-09 says all domains allowed by default; production can restrict via env var
- `source: '/:path*'` applies to all routes

### Pattern 5: CSS Containment

**What:** Apply CSS `contain` property to the game root to prevent style leakage into the parent page.

**Implementation:** On the game's root `<div>` in `Game.tsx`.

```typescript
// Game.tsx root element
<div className="relative min-h-screen overflow-hidden" style={{ contain: 'strict' }}>
```

**Why `contain: strict`:**
- `strict` = `size layout paint style` -- maximum isolation
- `layout`: Element's internal layout is independent of the rest of the page
- `paint`: Descendants don't paint outside the element's bounds
- `style`: Counters and quotes scoping
- `size`: Element can be sized without examining children (may need explicit height)

**Alternative:** `contain: content` (= `layout paint style`, no `size`) is safer if the game needs to auto-size based on content. Since the game already uses `min-h-screen`, `content` is the better choice.

**Tailwind v4 note:** Tailwind v4 does not have a built-in `contain` utility. Use inline style or a custom utility class via `@theme` or arbitrary value syntax: `[contain:content]`.

### Pattern 6: test-embed.html Test Harness

**What:** Static HTML file in `public/` that embeds the game in an iframe and demonstrates the full postMessage contract.

**Location:** `public/test-embed.html` -- served as static file at `/test-embed.html`.

**Features:**
1. iframe embedding the game at `/`
2. Button to send `RPS_COUPON_CONFIG` to the iframe
3. Real-time log panel showing received `RPS_GAME_WIN` messages
4. Visible session data (sessionId, rounds, timestamps) on win

```html
<!-- Simplified structure -->
<iframe id="game" src="/" style="width:375px;height:667px;border:1px solid #ccc;"></iframe>

<button onclick="sendCoupon()">Send Coupon Config</button>
<pre id="log"></pre>

<script>
  const iframe = document.getElementById('game');

  function sendCoupon() {
    iframe.contentWindow.postMessage({
      type: 'RPS_COUPON_CONFIG',
      couponCode: 'TEST-COUPON-2026',
      couponText: '10% 할인 쿠폰',
    }, '*');
  }

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'RPS_GAME_WIN') {
      document.getElementById('log').textContent +=
        JSON.stringify(e.data, null, 2) + '\n';
    }
  });
</script>
```

### Anti-Patterns to Avoid

- **Sending coupon data in RPS_GAME_WIN:** The parent already knows the coupon. D-06 says payload is SessionPayload only.
- **Resetting couponConfig on retry:** The parent sends config once. Replaying the game should retain coupon for next victory.
- **Using `window.top.postMessage()` instead of `window.parent.postMessage()`:** Use `window.parent` -- it targets the immediate parent. `window.top` skips intermediate frames in nested iframe scenarios.
- **postMessage listener in Zustand store:** Store is synchronous; event listeners need useEffect lifecycle for cleanup. Use a hook.
- **Sending postMessage before session is finalized:** The `advance()` action finalizes the session (sets completedAt, totalPlayTimeMs) BEFORE setting phase to 'victory'. By the time the useEffect fires on `phase === 'victory'`, session data is complete.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-origin messaging | Custom WebSocket bridge | `window.postMessage()` | Browser-native, zero dependencies, purpose-built for iframe communication |
| UUID generation | Manual UUID v4 function | `crypto.randomUUID()` | Already used in Phase 1, built-in to all target browsers |
| iframe header configuration | Express middleware or custom server | Next.js `headers()` in next.config.ts | Native Next.js feature, no custom server needed |
| Style isolation | Shadow DOM or CSS-in-JS scoping | CSS `contain` property | Browser-native, zero JS overhead, sufficient for iframe embedding |

**Key insight:** Phase 3 requires zero new dependencies. Every integration point uses browser-native APIs or existing Next.js configuration. The complexity is in wiring -- connecting existing pieces correctly -- not in bringing in new technology.

## Common Pitfalls

### Pitfall 1: postMessage fires before session is finalized
**What goes wrong:** The `RPS_GAME_WIN` message contains `completedAt: ''` and `totalPlayTimeMs: 0` because postMessage fires before `finalizeSession()`.
**Why it happens:** If the useEffect sending the message runs before the store update propagates.
**How to avoid:** The Zustand `advance()` action already calls `finalizeSession()` in the same synchronous `set()` call that transitions to `phase: 'victory'`. The session is guaranteed finalized when the React re-render triggers the useEffect. Verify by checking `session.completedAt !== ''` before sending.
**Warning signs:** Empty `completedAt` or zero `totalPlayTimeMs` in test-embed.html log output.

### Pitfall 2: postMessage fires on every re-render during victory phase
**What goes wrong:** Multiple `RPS_GAME_WIN` messages sent to parent.
**Why it happens:** If the useEffect dependency array includes mutable objects that change during victory animations (e.g., the whole session object reference).
**How to avoid:** Use a `useRef` flag (`hasSentWinMessage`) that prevents re-firing. Set it in the useEffect, reset it in the cleanup or on phase change away from victory.
**Warning signs:** Multiple log entries in test-embed.html for a single game win.

### Pitfall 3: couponConfig lost on retry
**What goes wrong:** Player wins, sees coupon, retries, wins again -- no coupon shown.
**Why it happens:** `retry()` resets all state including couponConfig.
**How to avoid:** Explicitly preserve `couponConfig` in the `retry()` action: `couponConfig: get().couponConfig`.
**Warning signs:** Coupon shows on first win but not on subsequent wins in the same iframe session.

### Pitfall 4: X-Frame-Options DENY sent by default
**What goes wrong:** Browser blocks iframe embedding.
**Why it happens:** Some hosting platforms (Vercel included) may add security headers by default.
**How to avoid:** Explicitly set X-Frame-Options and CSP frame-ancestors in `next.config.ts`. The custom header overrides any default. Test with the test-embed.html page.
**Warning signs:** Browser console error: "Refused to display in a frame because 'X-Frame-Options' is set to 'DENY'."

### Pitfall 5: CSS `contain: strict` breaks game layout
**What goes wrong:** Game content becomes invisible or collapses to 0 height.
**Why it happens:** `contain: strict` includes `size` containment, which requires explicit dimensions. If the container relies on content for sizing, it collapses.
**How to avoid:** Use `contain: content` (layout + paint + style, no size) OR ensure the container has explicit height. The game already uses `min-h-screen` which provides intrinsic height, but test both approaches.
**Warning signs:** Blank screen when game loads in iframe.

### Pitfall 6: Message listener not cleaned up on unmount
**What goes wrong:** Memory leak; stale listener processes messages after component unmounts.
**Why it happens:** Missing return cleanup function in `useEffect`.
**How to avoid:** Always return `() => window.removeEventListener('message', handleMessage)` from the useEffect.
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 7: NEXT_PUBLIC_ prefix missing on env var
**What goes wrong:** `process.env.NEXT_PUBLIC_ALLOWED_ORIGIN` is `undefined` in client-side code.
**Why it happens:** Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to client-side bundles.
**How to avoid:** The decision already specifies `NEXT_PUBLIC_ALLOWED_ORIGIN` (correct prefix). Verify the var name in all usages.
**Warning signs:** Origin validation always falls back to `'*'` even when env var is set.

## Code Examples

### Example 1: next.config.ts with iframe headers

```typescript
// Source: Next.js official docs - headers configuration
// https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
import type { NextConfig } from 'next'

const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${allowedOrigins}`,
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Note on X-Frame-Options values:** The standard values are `DENY` and `SAMEORIGIN`. `ALLOWALL` is non-standard but widely recognized by browsers to mean "allow all origins." The CSP `frame-ancestors *` directive is the standards-compliant way to achieve this. Including both provides maximum compatibility.

### Example 2: postMessage send pattern (victory event)

```typescript
// useEffect in Game.tsx or usePostMessage hook
// Source: MDN Window.postMessage()
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

const hasSentRef = useRef(false)

useEffect(() => {
  if (phase !== 'victory') {
    hasSentRef.current = false
    return
  }
  if (hasSentRef.current) return
  if (!session.completedAt) return // guard: session must be finalized

  const targetOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'
  window.parent.postMessage(
    {
      type: 'RPS_GAME_WIN',
      payload: session,
    },
    targetOrigin
  )
  hasSentRef.current = true
}, [phase, session])
```

### Example 3: postMessage receive pattern (coupon config)

```typescript
// useEffect in Game.tsx or usePostMessage hook
useEffect(() => {
  const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'

  function handleMessage(event: MessageEvent) {
    if (allowedOrigin !== '*' && event.origin !== allowedOrigin) return
    if (!event.data || event.data.type !== 'RPS_COUPON_CONFIG') return

    setCouponConfig({
      couponCode: event.data.couponCode,
      couponImage: event.data.couponImage,
      couponText: event.data.couponText,
    })
  }

  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [setCouponConfig])
```

### Example 4: Coupon UI conditional rendering

```typescript
// Inside ResultScreen.tsx for victory phase
const couponConfig = useGameStore((s) => s.couponConfig)

// In JSX:
{phase === 'victory' && (
  <div>
    <h1>축하합니다!</h1>
    {couponConfig ? (
      <div className="coupon-area">
        {couponConfig.couponImage && (
          <img src={couponConfig.couponImage} alt="쿠폰" />
        )}
        <p className="coupon-code">{couponConfig.couponCode}</p>
        {couponConfig.couponText && (
          <p>{couponConfig.couponText}</p>
        )}
      </div>
    ) : (
      <p>5판 연속 승리!</p>
    )}
  </div>
)}
```

### Example 5: CSS containment with Tailwind arbitrary value

```typescript
// Game.tsx root element using Tailwind v4 arbitrary value syntax
<div className="relative min-h-screen overflow-hidden [contain:content]">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| X-Frame-Options header | CSP `frame-ancestors` directive | ~2020 (CSP Level 2) | `frame-ancestors` supports multiple origins and wildcards; X-Frame-Options only supports DENY/SAMEORIGIN. Use both for compatibility. |
| `window.postMessage(data, origin)` (2-arg) | Same API, unchanged | Stable since 2010+ | API is mature and unchanged. The optional `transfer` parameter was added but not relevant here. |
| CSS `all: initial` for isolation | CSS `contain` property | 2022 (wide browser support) | `contain` isolates layout/paint without resetting all styles. Better performance, less side effects. |

**Deprecated/outdated:**
- `X-Frame-Options: ALLOW-FROM` -- removed from most browsers. Use CSP `frame-ancestors` instead.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + jsdom + @testing-library/react |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` (runs `vitest run`) |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTG-01 | Victory screen shows coupon when config received | unit | `npx vitest run src/components/screens/__tests__/ResultScreen.test.tsx` | No - Wave 0 |
| INTG-01 | Victory screen shows congratulations only when no coupon config | unit | `npx vitest run src/components/screens/__tests__/ResultScreen.test.tsx` | No - Wave 0 |
| INTG-02 | Victory phase fires RPS_GAME_WIN postMessage to parent | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - Wave 0 |
| INTG-02 | Win message contains complete SessionPayload (non-empty completedAt) | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - Wave 0 |
| INTG-02 | Win message fires exactly once per victory (no duplicates on re-render) | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - Wave 0 |
| INTG-03 | Coupon config received via RPS_COUPON_CONFIG message | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - Wave 0 |
| INTG-03 | Origin validation rejects messages from disallowed origins | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - Wave 0 |
| INTG-03 | couponConfig persists across retry() calls | unit | `npx vitest run src/store/__tests__/gameStore.test.ts` | Exists (extend) |
| INTG-03 | CSS containment applied to game root | manual | Visual inspection in test-embed.html | N/A |
| INTG-03 | iframe loads without X-Frame-Options DENY blocking | manual | Load test-embed.html, verify game renders | N/A |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/screens/__tests__/ResultScreen.test.tsx` -- covers INTG-01 (coupon display)
- [ ] `src/hooks/__tests__/usePostMessage.test.ts` -- covers INTG-02, INTG-03 (postMessage send/receive)
- [ ] Extend `src/store/__tests__/gameStore.test.ts` -- covers couponConfig persistence across retry

### Testing postMessage in jsdom

Testing postMessage requires mocking `window.parent.postMessage` and dispatching `MessageEvent`:

```typescript
// Mock parent.postMessage for send tests
const postMessageSpy = vi.fn()
Object.defineProperty(window, 'parent', {
  value: { postMessage: postMessageSpy },
  writable: true,
})

// Dispatch MessageEvent for receive tests
window.dispatchEvent(
  new MessageEvent('message', {
    data: { type: 'RPS_COUPON_CONFIG', couponCode: 'TEST-123' },
    origin: 'http://localhost:3000',
  })
)
```

## Open Questions

1. **X-Frame-Options ALLOWALL standardization**
   - What we know: `ALLOWALL` is non-standard but widely recognized. Some sources recommend omitting X-Frame-Options entirely and relying solely on CSP `frame-ancestors`.
   - What's unclear: Whether Vercel's edge network adds default security headers that would override next.config.ts settings.
   - Recommendation: Set both `X-Frame-Options: ALLOWALL` and `Content-Security-Policy: frame-ancestors *`. If Vercel overrides, the CSP directive takes precedence per spec. Test with test-embed.html to verify.

2. **iframe height in parent page**
   - What we know: Game uses `min-h-screen` which fills the iframe viewport. The parent controls iframe dimensions.
   - What's unclear: Whether some parent pages will provide very small iframes (< 500px height) that break the layout.
   - Recommendation: Out of scope for Phase 3. Game fills its container; parent is responsible for sizing. Document minimum recommended iframe dimensions (375x667 mobile) in test-embed.html.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev server | Yes | v24.11.0 | -- |
| npm | Package management | Yes | 11.6.1 | -- |
| Next.js | Framework | Yes | 16.2.1 | -- |
| Vitest | Testing | Yes | 4.1.2 | -- |
| Browser postMessage API | iframe communication | Yes (all modern browsers) | -- | -- |
| CSS contain property | Style isolation | Yes (Chrome 52+, Firefox 69+, Safari 15.4+) | -- | -- |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Sources

### Primary (HIGH confidence)
- [Next.js headers() API documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) -- exact syntax for configuring custom HTTP headers in next.config.ts, verified for v16.2.1
- [MDN Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) -- complete API specification, security model, MessageEvent properties
- [MDN CSS contain property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain) -- containment types, browser support, performance implications
- [MDN CSS Containment guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment) -- usage patterns and best practices

### Secondary (MEDIUM confidence)
- [HTTP Security Headers in Next.js](https://blog.kieranroberts.dev/http-security-headers-and-how-to-set-them-in-nextjs) -- practical patterns for X-Frame-Options and CSP in Next.js
- [Secure Cross-Window Communication guide](https://www.bindbee.dev/blog/secure-cross-window-communication) -- origin validation best practices
- [Frontend Masters CSS contain property](https://frontendmasters.com/blog/the-css-contain-property/) -- practical usage guidance for CSS containment

### Tertiary (LOW confidence)
- None -- all findings verified against official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing tech verified installed and working
- Architecture: HIGH -- postMessage API is stable and well-documented, Next.js headers() API verified against official docs
- Pitfalls: HIGH -- based on established patterns in Phase 1/2 codebase (Zustand store structure, useEffect patterns) and verified browser API behavior

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable APIs, no fast-moving dependencies)
