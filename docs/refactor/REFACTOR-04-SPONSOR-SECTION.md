# Spec 04 — Sponsor Section

## Objective
Add a new sponsor/partnership section featuring the two already-provided logos, animated in a way that feels intentional and premium rather than a plain static logo strip.

## Assets (already available, do not re-request)
- `logo_polihasnur.png` — Politeknik Hasnur (Technopreneur Campus), navy/gold crest logo on transparent background.
- `logo_himati.png` — HIMA TI Politeknik Hasnur (student association), blue/gold badge logo on transparent background.

## Layout
- Two-column split: **Politeknik Hasnur on the left, HIMA TI on the right**, per Ilham's instruction.
- Keep it simple — this is a credibility/partnership section, not a hero moment. A thin divider (1px, `outline` color per DESIGN.md) between the two columns fits the site's brutalist-bordering language.

## Motion Direction (pick one, or propose alternative in review — do not default to a plain fade)
Options, roughly ordered by implementation cost:
1. **Reveal-on-scroll clip-path wipe:** each logo's container clips in from its respective side (left logo wipes in from the left, right logo from the right) as the section enters the viewport. Cheap, reads as intentional.
2. **Cursor-reactive tilt card:** each logo sits in a card that tilts subtly in 3D (`rotateX`/`rotateY` via Framer Motion, small range like ±6deg) following cursor position within the card bounds, snapping back on mouse leave. A soft radial highlight can follow the cursor as a spotlight (`radial-gradient` positioned via CSS custom properties updated on `onMouseMove`).
3. **Grain/halftone mask reveal:** logo appears through an animated halftone or grain mask that resolves into full clarity — ties back to the "film grain" texture note already in `DESIGN.md`.

Recommendation: option 2 (tilt + spotlight) gives the most "premium interactive" feel for a relatively small time investment and doesn't need any new asset processing (unlike option 3, which needs a mask texture).

## Requirements
- Both logos keep their original colors (navy/gold, blue/gold) — do not desaturate them to fit the black/white/red palette; sponsor logos are an exception to the brand palette by nature (this is standard practice for partner logo sections).
- Section background stays consistent with the site's dark surface tokens (`surface-container-low` or similar from `DESIGN.md`), so the colorful logos read as accents against the dark canvas.
- Must be responsive: stacks vertically (Politeknik Hasnur above HIMA TI) below the tablet breakpoint, tilt/spotlight interaction disabled on touch (no meaningful hover on touch — just show the logos with the scroll-in reveal from option 1 as the touch fallback).

## Files
- `/components/sponsors/SponsorSection.tsx`
- `/components/sponsors/SponsorCard.tsx`

## Data
Static — logos and labels can be hardcoded here (this is not "product data" under rule #6, it's fixed brand/partnership content).

## Acceptance Criteria
- [ ] Politeknik Hasnur left, HIMA TI right, on desktop.
- [ ] Chosen motion direction feels distinct from a plain `opacity` fade-in.
- [ ] Logos remain in their original brand colors.
- [ ] Responsive stacking on mobile with a touch-appropriate fallback interaction.

### Open Questions
- Confirm which of the 3 motion directions above to build (recommend #2).
- Any sponsor attribution text needed (e.g. "In collaboration with") or logos-only?
