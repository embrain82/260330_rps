<!-- GSD:project-start source:PROJECT.md -->
## Project

**RPS Challenge (가위바위보 챌린지)**

앱/서비스 내 임베드되는 가위바위보 미니게임. 참여자가 AI와 최대 5판까지 대결하며, 판수가 올라갈수록 승률이 떨어지는 구조로 긴장감을 높인다. 최종 승리 시 쿠폰을 지급하는 이벤트/프로모션용 게임.

**Core Value:** "한 판 더" 도전하고 싶은 긴장감 있는 게임 경험 — 참여자가 끝까지 이기면 보상을 받는 구조.

### Constraints

- **Tech**: Next.js + React + TypeScript
- **Platform**: 모바일 우선 반응형 — 최소 터치 타겟 44px
- **Performance**: 이미지/애니메이션은 CSS 기반 또는 경량 라이브러리 — 무거운 게임 엔진 사용 금지
- **Embed**: iframe 또는 컴포넌트로 외부 서비스에 임베드 가능해야 함
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.2.4 (current stable as of 2026-03) | App framework, routing, deployment | Project constraint. App Router + Turbopack dev server. `generateViewport` API handles mobile viewport meta declaratively, no _document hacks. |
| React | 19.2.4 | UI component model | Project constraint. v19 is stable and required by Next.js 15.2.x. `use client` directive makes game components pure client-side — no SSR complexity for a game. |
| TypeScript | 5.7+ (bundled via Next.js) | Type safety | Project constraint. Next.js 15 ships with TS 5.7 support. `next.config.ts` now typed natively. |
| Tailwind CSS | v4.x | Utility-first responsive styling | v4 released Jan 2025, stable for production. CSS-first config (`@import "tailwindcss"`) eliminates `tailwind.config.js`. Full rebuild 5x faster than v3. No reason to use v3 for a greenfield project. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion (formerly framer-motion) | ^12.38.0 | Card flip animations, choice reveal, result transitions, shake/bounce game feel | Use for all stateful game UI transitions: showing player/AI choice simultaneously, win/lose result reveal, round counter progression. Import from `motion/react`, NOT `framer-motion`. |
| canvas-confetti | ^1.x (latest stable) | Fireworks/confetti victory effect | Trigger on final 5-round win only. Has `useWorker: true` option to run off main thread on mobile — use it. Pure canvas, no React wrapper needed; call imperatively on game state change. |
| Zustand | ^5.0.12 | Client-side game state store | Use for game state (currentRound, playerChoice, aiChoice, roundResults, gamePhase). Keeps all game logic out of components. Selective subscriptions prevent unnecessary re-renders during animations. v5 is React 19 native (uses `useSyncExternalStore`). |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev server (via `next dev --turbo`) | Bundled with Next.js 15, stable. Do not use webpack dev mode — Turbopack is significantly faster for iterative animation work. |
| ESLint (Next.js config) | Lint | `eslint-config-next` ships with Next.js. No separate install needed. |
| Prettier | Code formatting | Add `prettier` + `eslint-config-prettier`. One-time setup, prevents formatting noise in diffs. |
## Installation
# Scaffold (if starting fresh)
# Game state
# Animation
# Victory effect
# Dev
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| motion v12 (`motion/react`) | `framer-motion` (old package name) | Never for new projects — `framer-motion` is now a re-export shim of `motion`. Use `motion` directly. |
| motion v12 | GSAP (GreenSock) | Only when you need timeline-based complex sequences (e.g. cutscene-style intros). Overkill for a game with 3 interactive states. GSAP also requires a license for commercial use with advanced plugins. |
| motion v12 | CSS `@keyframes` only | Acceptable for simple static animations (hover, idle pulse). Insufficient for React state-driven transitions (e.g. simultaneously revealing two choices with coordinated timing). Combine: use CSS for ambient/idle animations, `motion` for state-driven sequences. |
| canvas-confetti | react-confetti-explosion | If you want zero canvas dependency and pure CSS particles. react-confetti-explosion is ~4KB and CSS-only, but less visually impactful for a fireworks metaphor. Use if canvas is unavailable (rare) or if performance on very low-end devices is a concern. |
| canvas-confetti | tsParticles / @tsparticles/confetti | tsParticles is far heavier (60KB+ gzipped). Only warranted if you need persistent particle environments (backgrounds, etc). Not appropriate here. |
| Zustand | React `useState` + `useContext` | Acceptable if the game state never crosses more than 2 component levels. For this project, game state (round results array, AI win probability, game phase, coupon trigger) spans the full component tree — Zustand is the right call to avoid prop drilling. |
| Zustand | Redux Toolkit | RTK is ~10x the boilerplate for the same result. Appropriate for apps with complex async flows and dev tools requirements. This game has no async state (all probability calculated client-side). Overkill. |
| Tailwind CSS v4 | CSS Modules | CSS Modules are valid but require more files and more naming work. Tailwind v4's game-specific utility classes (arbitrary values, animation utilities) are faster to iterate for a UI-heavy game. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser.js / PixiJS / Three.js | Heavy game engines (100KB–500KB+ gzipped). This is a 3-button UI game, not a canvas rendering game. These are architectural overkill and conflict with the project's explicit "no heavy game engine" constraint. | React components + CSS animations + motion |
| `framer-motion` (package name) | This package is now a compatibility shim that re-exports from `motion`. Importing from `framer-motion` adds a layer of indirection and may have slower updates. | `motion` (`npm install motion`, import from `motion/react`) |
| React Spring | Physics-based animations are not needed here. React Spring's API is more complex to reason about than `motion`'s declarative variants model. No advantage for this use case. | `motion` with `transition` prop |
| `styled-components` / `emotion` | CSS-in-JS with runtime cost. Tailwind v4 is already installed; mixing CSS-in-JS with Tailwind adds complexity with no payoff. | Tailwind CSS v4 utility classes |
| `react-confetti` (alampros/react-confetti) | Rain-style continuous confetti. Appropriate for celebration pages. Wrong metaphor for a fireworks pop on win — requires manual cleanup, runs as a continuous loop rather than a burst. | `canvas-confetti` with `confetti()` called imperatively |
| Next.js Pages Router | Project should use App Router (Next.js 15 default). Pages Router is legacy and doesn't support React Server Components. For a mini-game this doesn't matter functionally, but App Router is the forward-compatible choice. | App Router (`app/` directory) |
| `getServerSideProps` / `getStaticProps` | Pages Router APIs, irrelevant in App Router. Game logic is entirely client-side anyway. | Client Components (`'use client'`) |
## Stack Patterns by Variant
- Create a dedicated route at `app/game/page.tsx` that renders only the game component
- Add `generateViewport` export with `width=device-width, initialScale=1` for proper mobile scaling inside iframe
- Set `X-Frame-Options: ALLOWALL` or configure `next.config.ts` `headers()` to permit iframe embedding from specific origins
- The host page controls iframe dimensions; game should fill 100% of its container with `min-h-screen` or a fixed aspect ratio container
- Export the game as a standalone client component with its own Zustand store scoped to that component tree
- Wrap in a `StoreProvider` pattern to avoid store leaking between renders (especially in SSR context)
- Use `dynamic(() => import('./GameComponent'), { ssr: false })` to prevent hydration issues with game state
- Use `app/page.tsx` as the game entry point
- No API routes needed — all game logic is client-side
- Add `vercel.json` with `headers` config if iframe embedding requires CORS or framing headers
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15.2.x | React 19.2.x | Required pair — Next.js 15 ships React 19 as peer dep |
| Tailwind CSS v4.x | Next.js 15.x | Use `@tailwindcss/postcss` plugin, not legacy PostCSS setup |
| motion ^12.x | React 19.x | Fully supported. Import from `motion/react`, not legacy `framer-motion` |
| Zustand ^5.0.x | React 19.x | React 19 native via `useSyncExternalStore`. Do not use Zustand v4 with React 19. |
| canvas-confetti ^1.x | Any browser env | Pure canvas, no React dep. Types via `@types/canvas-confetti`. Call imperatively in `useEffect` or event handler. |
| TypeScript 5.7+ | Next.js 15.2.x | Fully supported. `next.config.ts` supported natively. |
## Sources
- [Next.js 15.2.4 current stable (March 2026)](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new) — version confirmed MEDIUM confidence (third-party blog citing official release)
- [Next.js official blog](https://nextjs.org/blog/next-15) — Next.js 15 feature overview HIGH confidence
- [React v19 release](https://react.dev/blog/2024/12/05/react-19) — React 19 stable, v19.2.4 current HIGH confidence
- [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2) — v19.2.x branch confirmed HIGH confidence
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 stable Jan 2025 HIGH confidence
- [Motion (framer-motion) upgrade guide](https://motion.dev/docs/react-upgrade-guide) — rebranding confirmed, v12.38.0 current HIGH confidence
- [Announcing Zustand v5](https://pmnd.rs/blog/announcing-zustand-v5) — v5 stable, React 19 compatible HIGH confidence
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) — useWorker option confirmed HIGH confidence
- [react-confetti-explosion npm](https://www.npmjs.com/package/react-confetti-explosion) — CSS-only alternative confirmed MEDIUM confidence
- [Motion performance tier list](https://motion.dev/magazine/web-animation-performance-tier-list) — WAAPI/CSS vs JS animation analysis MEDIUM confidence
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
