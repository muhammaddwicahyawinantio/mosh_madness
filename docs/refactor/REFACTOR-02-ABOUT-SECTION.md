# Spec 02 — About Section

## Objective
Rebuild the "About The Brand" section from `code.html` with a photo background combined with a lightweight Three.js effect layer, and a typewriter-style text reveal for the brand copy.

## Current State
`code.html` About section: a grainy concrete-room background photo at low opacity (`mix-blend-luminosity`), a 12-col grid with brand copy top-left, a giant "MOSH MADNESS" wordmark centered, and a tagline bottom-right. All static.

## Requirements

### Background: Photo + Three.js
- Keep the existing grunge concrete-room photo as the base background layer.
- Add a **lightweight** Three.js layer on top (via `@react-three/fiber` + `drei`), for example:
  - A plane using the photo as a texture with a subtle scroll- or mouse-reactive displacement/distortion shader, OR
  - A sparse particle/dust layer (a few dozen points max) drifting over the photo.
- This is explicitly **not** a full 3D scene — no complex geometry, no heavy lighting setup. Budget: should not add more than ~1-2ms per frame on a mid-range laptop GPU. Lazy-load the Three.js canvas (`next/dynamic`, `ssr: false`) so it never blocks initial page load, and only mount it once the section enters the viewport (IntersectionObserver).
- Fallback: on `prefers-reduced-motion` or if WebGL isn't available, render the static photo layer alone (no crash, no blank section).

### Text: Typewriter Reveal
- Reuse the provided `Typewriter` component (`/components/ui/typewriter-text.tsx`) largely as-is — it's already reasonably clean TypeScript.
- Required adjustments before use:
  - Remove the demo default text ("Welcome to HextaUI" etc.) — pass the real About copy as props.
  - Trigger the typing animation only when the section scrolls into view (wrap with an `IntersectionObserver`-based trigger, e.g. a small `useInView` hook), not on mount — so it doesn't fire off-screen.
  - Confirm `loop` should be `false` for brand copy (typing once, no delete/retype loop) — a looping typewriter reads as a chat-bot gimmick, not premium editorial. Default to `loop={false}` unless told otherwise.
- Apply to the About paragraph and/or the "create your own unique look" line — your call on which reads better; propose both in review before finalizing.

### Layout
- Preserve the 12-column grid structure and content placement (top-left copy, centered wordmark, bottom-right tagline) from `code.html` — this refactor is about motion and depth, not re-laying-out content that already works.

### Files
- `/components/about/AboutSection.tsx`
- `/components/about/AboutSceneCanvas.tsx` (Three.js layer, dynamically imported)
- `/components/ui/typewriter-text.tsx` (adapted from provided snippet)

### Data
Static marketing copy — no DB needed.

### Acceptance Criteria
- [ ] Three.js layer never blocks or delays LCP (lazy-mounted, only when in view).
- [ ] Section still looks correct with WebGL disabled/unsupported (graceful fallback to photo only).
- [ ] Typewriter fires once, on scroll-into-view, does not loop for brand copy.
- [ ] Grid layout/content matches the structure already validated in `code.html`.
- [ ] No frame drops introduced when scrolling through this section (verify with browser performance profiler).

### Open Questions
- Confirm: displacement-shader-on-photo vs. sparse-dust-particles — which direction for the Three.js layer? (Recommend dust particles — cheaper, and reads as "grunge atmosphere" which matches DESIGN.md's mention of film grain/texture.)
- Which copy block gets the typewriter treatment — the intro paragraph, the tagline, or both?
