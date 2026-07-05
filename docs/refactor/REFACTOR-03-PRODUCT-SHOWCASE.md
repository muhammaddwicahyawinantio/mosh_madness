# Spec 03 — Home Product Showcase (Scroll-Driven 3D Carousel)

## Objective
Replace the static Bestseller grid in `code.html` with a scroll-driven, rotating 3D carousel of products, adapted from the `ThreeDPhotoCarousel` reference component Ilham provided — but rebuilt to be TypeScript-strict, data-driven from the database, and free of the placeholder/demo pieces in the original snippet.

## Current State
`code.html` Bestseller section: a static CSS grid of product cards (image, tag, title, price), plus a "VIEW LOOKS" CTA cell. Fully hardcoded HTML, no data source.

Reference component provided (`ThreeDPhotoCarousel`): a Framer Motion drag-rotated 3D cylinder carousel, click-to-preview lightbox, using `picsum.photos` placeholder images and hardcoded `keywords` array.

## Required Fixes to the Reference Component (before/while adapting)
The snippet as provided **violates several of the project's own rules** and must not be reused verbatim:
- `controls: any` in the `Carousel` props → type it as `AnimationControls` (from `framer-motion`).
- `console.log("Cards loaded:", cards)` inside a `useEffect` → remove, it's debug leftover.
- `cards.map((keyword) => picsum.photos/...)` → replace entirely with real product image URLs coming from ImageKit via the product API.
- The click-to-preview lightbox (`activeImg` / fullscreen overlay) → **remove**. Ilham's spec explicitly says "tidak perlu dikasih preview" (no preview needed) — clicking/selecting a card should navigate to `/product/[id]` instead of opening an overlay.

## New Requirements

### Data
- Products shown here must come from the existing product API (Prisma-backed, per project history: "SWR polling for home page product section" was already an architectural decision) — filtered to whichever field marks a product as "show on home" (confirm exact field name against the current Prisma schema before wiring this up; do not guess and invent a new column if one already exists).
- Each carousel face needs: image URL (ImageKit), title, price, and the product's `id`/slug for linking to `/product/[id]`.

### Scroll Behavior
- While the carousel is in view, page scroll is intercepted (wheel/touch delta) and mapped to the carousel's rotation instead of scrolling the page — i.e. "scroll-jacked" until the carousel completes one full rotation through all products, then normal page scroll resumes.
- **Desktop only** by default (per Master Plan open question #2). On mobile/tablet, replace with a normal horizontal swipe carousel (drag, no scroll interception) — scroll-jacking on touch devices is a common source of janky, frustrating UX and should be avoided unless Ilham explicitly confirms otherwise after seeing the desktop version.
- Once the rotation completes, release the scroll lock and let the page continue scrolling normally to the next section.
- Must have an escape hatch: if a user scrolls fast/hard, don't trap them indefinitely — cap the max scroll-lock duration or let a fast enough gesture skip through.

### Card Content
- Each face shows: product image, title (`label-caps` / `price` type styles per DESIGN.md), and price directly beneath — always visible, not on hover.
- No modal/lightbox preview (see fix list above).

### CTA
- A button (style consistent with existing `SHOP NOW` / `VIEW LOOKS` treatment) that navigates to `/product` (the catalog listing), with the same signature motion/hover treatment defined in `REFACTOR-01`.

### Files
- `/components/product/ProductShowcase.tsx` (replaces the old `ThreeDPhotoCarousel` naming — rename to reflect it's product-specific, not a generic photo carousel)
- `/components/product/ProductCarouselCard.tsx`
- `/lib/hooks/useScrollLockedCarousel.ts` (the wheel/touch → rotation mapping logic, kept separate from the rendering component)
- `/app/api/products/route.ts` — confirm this already exists from Phase 0–2; extend/reuse rather than duplicating if so.

### Acceptance Criteria
- [ ] No hardcoded product data anywhere in the component tree — everything comes from the API.
- [ ] No `any` types remain from the original reference snippet.
- [ ] No debug `console.log` in shipped code.
- [ ] Clicking/selecting a card navigates to `/product/[id]`, no lightbox/preview overlay opens.
- [ ] Desktop: scroll-lock rotation works and reliably releases after one full pass.
- [ ] Mobile/tablet: swipe-based carousel, no scroll-jacking.
- [ ] CTA button routes to `/product` and matches the site's signature hover motion.

### Open Questions
- Confirm the exact Prisma field name used for "show on home" (from the Phase 0–2 schema) so this isn't reinvented.
- Confirm scroll-lock is desktop-only, as recommended above.
- Confirm whether "one full rotation" should map 1:1 to number of products fetched, or a fixed number of degrees regardless of count.
