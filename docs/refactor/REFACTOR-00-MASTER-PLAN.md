# Mosh Madness — Frontend Refactor Master Plan

## Project Context
- **Brand:** Mosh Madness — premium dark-artistic streetwear. Owner: Ilham. Based in Banjarmasin. Established May 16, 2024.
- **Stack (fixed, do not change without explicit request):** Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS + Framer Motion + Lenis (smooth scroll) + ImageKit (asset manager) + MySQL + Prisma ORM + shadcn/ui (base components) + Docker → Railway.
- **Existing references:**
  - `code.html` — current static markup / visual language (source of truth for spacing, grid, component shapes; will be ported into real React components, not copy-pasted as-is).
  - `DESIGN.md` — design tokens: colors (black/white/grey + crimson `#b60025` accent), typography (Death Stinger for display/headline sizes, Hold Money for body/label/price), radius `0`, no shadows, tonal layering instead of elevation.
  - Phases 0–2 of the original build (scaffold, Prisma schema, API routes) are complete and verified (`tsc --noEmit`, `npm run build`, `npm run lint` all clean).

## Scope of This Refactor
Full UI/UX overhaul of the public-facing frontend so it reads as *premium dark editorial*, not generic AI-template output. Split into 7 independent, sequential specs so each can be reviewed and shipped on its own:

| # | File | Area |
|---|------|------|
| 1 | `REFACTOR-01-INTRO-HERO.md` | Intro text reveal + Hero section (garment hover swap, bird particle field, per-section scroll) |
| 2 | `REFACTOR-02-ABOUT-SECTION.md` | About section (photo background + lightweight Three.js layer, typewriter text) |
| 3 | `REFACTOR-03-PRODUCT-SHOWCASE.md` | Home product showcase (scroll-driven 3D carousel, DB-backed) |
| 4 | `REFACTOR-04-SPONSOR-SECTION.md` | Sponsor logos section (Politeknik Hasnur / HIMA TI) |
| 5 | `REFACTOR-05-PRODUCT-PAGE.md` | `/product/[id]` detail page image transitions |
| 6 | `REFACTOR-06-CONTACT-PAGE.md` | `/contact` page |
| 7 | `REFACTOR-07-DESIGN-TOKENS.md` | Font & color decisions (Creepster conflict, final palette confirmation) |

## Execution Rules (apply to every phase, non-negotiable)
1. **Breakdown before code.** Every spec file already contains its own checklist. Confirm the checklist with Ilham before writing implementation code — do not jump straight to hundreds of lines.
2. **Reuse existing assets.** Do not re-request or placeholder-generate assets that already exist in the project: `logo_polihasnur.png`, `logo_himati.png`, `herosection_black.jpeg`, `herosection_white.jpeg`, `code.html`, `DESIGN.md`.
3. **TypeScript strict.** No stray `any`. Respect folder structure: `/app`, `/components`, `/lib`, `/prisma`, `/types`.
4. **No generic/template animation.** Every motion must be interaction-driven (scroll progress, cursor position, hover/focus state) and use the project's signature easing (defined in `REFACTOR-01`, reused everywhere after). No plain fade-in, no default bounce.
5. **Performance & responsiveness first.** Every animation-heavy feature (particles, Three.js, scroll-lock) must define a mobile/low-end fallback and respect `prefers-reduced-motion`. Target 60fps; no layout thrash.
6. **Data from DB, not hardcoded.** Product name, price, images, "show on home" toggle — always via Prisma → API route → client (SWR), never inline arrays in components.
7. **Flag ambiguity, don't resolve it silently.** Each spec lists its own "Open Questions." Get an explicit answer before implementing that part.
8. **Report after each phase.** What changed, which files were touched, and any manual step needed (env vars, migration, asset upload, npm install).
9. **Don't silently overwrite working code.** If a phase requires refactoring something that already works, explain why before doing it.

## Assets Inventory (already available — do not re-request)
- `logo_polihasnur.png`, `logo_himati.png` — sponsor logos, transparent PNG.
- `herosection_black.jpeg`, `herosection_white.jpeg` — garment photography, black-garment and white-garment variants (for the hero hover swap).
- Two reference component snippets provided by Ilham (need adaptation, not verbatim use — see individual specs for required fixes):
  - A Framer Motion 3D drag-carousel (`ThreeDPhotoCarousel`) — currently uses placeholder `picsum.photos` images, an untyped `controls: any`, and a stray `console.log`. Must be cleaned up before reuse (see `REFACTOR-03`).
  - A `Typewriter` component (`components/ui/typewriter-text.tsx`) — reasonably clean already, reusable mostly as-is (see `REFACTOR-02`).

## Open Questions (answer before implementation starts)
1. **Font conflict — Creepster vs. Death Stinger/Hold Money.** See `REFACTOR-07` for options.
2. **Scroll-lock on the Product Showcase carousel.** Confirm desktop-only, with a simple swipe carousel on mobile/tablet. See `REFACTOR-03`.
3. **Three.js budget on the About section.** Confirm this should be a lightweight effect layered over the photo (particles/displacement), not a full 3D scene. See `REFACTOR-02`.
4. **Contact form destination.** Should submissions be stored via Prisma (new `ContactMessage` model) or sent by email (e.g. Resend/Nodemailer)? See `REFACTOR-06`.

## Suggested Working Order
1. `REFACTOR-07` — design tokens (fast, unblocks everything, needs your call on Creepster)
2. `REFACTOR-01` — intro + hero (defines the site's animation "signature": easing curve, timing, scroll behavior — reused in every later phase)
3. `REFACTOR-04` — sponsor section (small, self-contained, good warm-up)
4. `REFACTOR-02` — about section
5. `REFACTOR-03` — product showcase (heaviest phase; needs the Prisma product API wired in first)
6. `REFACTOR-05` — product detail page
7. `REFACTOR-06` — contact page

Do not run multiple phases in a single Claude Code session. One phase → review → `tsc --noEmit` + `npm run build` + `npm run lint` clean → next phase.
