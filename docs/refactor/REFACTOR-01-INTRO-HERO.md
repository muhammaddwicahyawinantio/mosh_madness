# Spec 01 — Intro Reveal + Hero Section

## Objective
Replace the current static hero markup (`code.html` hero `<section>`) with a React implementation that opens with a branded intro reveal, then a hero section with an interactive garment hover-swap and an ambient bird particle field, all tied into a per-section scroll rhythm powered by Lenis.

## Current State
- `code.html` hero: full-bleed background image, a giant `CUSTOMIZATION` headline in `mix-blend-overlay`, a bottom-right `SHOP NOW` CTA. Static, no motion.
- No intro/loader currently exists.
- Lenis is listed in the stack but not yet wired into the app shell.

## Part A — Intro Reveal

### Requirements
- On first paint (root layout mount), show a full-screen intro overlay (`background`, pure black) with the wordmark **MOSH MADNESS** revealing letter-by-letter or word-by-word — not a plain opacity fade.
- Suggested technique: split text into spans, stagger each span's `y`/`opacity`/`clipPath` in with the project's signature easing (define once, reuse everywhere — see "Signature Motion" below).
- After the reveal completes (and a short hold), the overlay exits (wipe or scale down) to reveal the hero underneath.
- Only show this intro once per session (`sessionStorage` flag) — returning visitors within the same tab session should not see it again on internal navigation.
- Must respect `prefers-reduced-motion`: reduced version = quick fade, no stagger, under 400ms.

### Signature Motion (define here, reuse in every later phase)
Pick one easing curve and one duration scale for the whole site, e.g.:
```ts
export const EASE_SIGNATURE = [0.16, 1, 0.3, 1] as const // expo-out, "snappy premium" feel
export const DURATION = { fast: 0.25, base: 0.5, slow: 0.9 } as const
```
Put this in `/lib/motion.ts` and import everywhere instead of ad-hoc `ease-in-out` / arbitrary durations.

### Files
- `/components/intro/IntroReveal.tsx`
- `/lib/motion.ts`

## Part B — Hero Section

### Requirements
1. **Background stays static** — do not animate the environment/background photo itself.
2. **Garment hover-swap:** on hover/tap of the garment subject, cross-transition from the black-garment photo (`herosection_black.jpeg`) to the white-garment photo (`herosection_white.jpeg`), or back, with a "smoke dissolve" transition rather than a plain crossfade.
   - Suggested technique: two stacked `<img>`/`<Image>` layers; animate the opacity of the top layer through an animated SVG turbulence mask (`feTurbulence` + `feDisplacementMap`) so the edges look like dissipating smoke instead of a hard fade. This stays GPU-cheap since it's a CSS/SVG filter, not a particle sim.
   - On touch devices, tap toggles the state (no hover available).
3. **Bird particle field:** a small flock of birds drifts across the hero, above the background, below the foreground UI.
   - Implementation: `<canvas>` + `requestAnimationFrame`, simple flocking/boid logic (NOT DOM nodes per bird — canvas only, for performance).
   - Cap the flock at ~8–14 birds on desktop; reduce to ~4–6 or disable entirely below a chosen viewport width (mobile), your call in review.
   - **Cursor interaction:** birds within a radius of the cursor should react — accelerate/scatter away as if startled, then resume their path. This must be a lightweight distance check per frame, not a full physics engine.
   - Must pause (stop the RAF loop) when the hero section is out of view (IntersectionObserver) to avoid wasting cycles on background tabs/scrolled-away sections.
   - Respect `prefers-reduced-motion`: birds render static or are omitted entirely.
4. **Fade-down transition into the next section:** as the user scrolls past the hero, hero content (headline + CTA) should fade and translate down/away, scroll-linked (use Framer Motion's `useScroll` + `useTransform` against the hero's scroll progress) — not a fixed-duration autoplay animation.
5. **Per-section scroll:** wire Lenis at the app-shell level (`/app/layout.tsx` or a client wrapper `/components/providers/SmoothScrollProvider.tsx`). Combine with CSS `scroll-snap-type: y proximity` (not `mandatory`, to avoid fighting the user) on the main sections so scrolling settles per-section, while still allowing the fade-down effect above to play out based on scroll progress.

### Files
- `/components/hero/HeroSection.tsx`
- `/components/hero/GarmentSwap.tsx`
- `/components/hero/BirdParticles.tsx` (canvas logic can live in `/lib/birds.ts` if it gets long)
- `/components/providers/SmoothScrollProvider.tsx`

### Data
No DB data needed for this phase — hero copy/CTA text can stay static content (not "product data").

### Acceptance Criteria
- [ ] Intro plays once per session, skippable via reduced-motion, doesn't block interaction longer than ~2s total.
- [ ] Garment hover-swap works on both mouse (hover) and touch (tap), transition reads as "smoke," not a hard cut or plain fade.
- [ ] Background image never moves/animates.
- [ ] Birds render on canvas, flock convincingly, react to cursor proximity, pause when off-screen.
- [ ] Scrolling past hero triggers scroll-linked fade-down, not a fixed timer animation.
- [ ] Lighthouse performance score on mobile does not regress by more than 5 points vs. the current static page.
- [ ] `prefers-reduced-motion` is respected across all of the above.

### Open Questions
- Confirm bird count / whether birds should be hidden entirely below a specific breakpoint (e.g. `<768px`) for performance.
- Confirm whether tap-to-toggle on mobile for the garment swap is acceptable, or if mobile should just show one static variant.
