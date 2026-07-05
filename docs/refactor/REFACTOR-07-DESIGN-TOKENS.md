# Spec 07 — Font & Color Decisions

## Objective
Resolve the typography decision before any other phase touches text styling, since every other spec (`01`–`06`) inherits whatever is decided here.

## Color — No Action Needed
The requested palette ("hitam, putih, abu, merah dark premium") is **already the current system**, documented in `DESIGN.md`:
- Background/surface: near-black (`#131313` and darker containers down to `#0e0e0e`).
- Primary: white (`#ffffff`).
- Greys: `on-surface-variant` (`#c4c7c8`), `outline` (`#8e9192`), and the `surface-container-*` scale.
- Accent: crimson red `secondary-container` (`#b60025`), reserved strictly for urgency — discounts, sold-out tags, sale UI, and (per `REFACTOR-06`) form focus states.

No changes needed here — this section exists just to confirm alignment, not to reopen the palette.

## Typography — Needs a Decision

### Current state (just finalized, before this message)
- `display-xl`, `headline-lg`, `headline-lg-mobile`, `headline-md` → **Death Stinger** (bold blackletter/gothic display face, used only at large sizes: hero, section titles).
- `body-lg`, `body-md`, `label-caps`, `price` → **Hold Money** (rough vintage blackletter, used for everything else: body copy, technical labels, prices).
- ⚠️ Note: the `Hold Money` font file currently on hand is a **demo build, personal-use only**. A commercial license must be purchased from alitdesign.net before this goes to production — this is independent of the question below and still applies regardless of what's decided about Creepster.

### The conflict
This message also requested adding:
```html
<link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet">
```
**Creepster is a novelty horror/campy display font** (thick, drippy, Halloween-poster style). It does not share the blackletter/gothic-grunge character of Death Stinger or Hold Money — mixing it in risks making the site read as "spooky novelty" rather than "premium dark streetwear." Per the project's own rule #7 ("if in doubt about a significant design decision, ask before proceeding"), this needs an explicit call rather than being silently squeezed in somewhere.

### Options
**A. Skip Creepster.** Keep the two-font system (Death Stinger + Hold Money) exactly as already decided. Recommended if the goal is a cohesive, premium-reading brand.

**B. Very limited, isolated use.** Use Creepster only for a single small "grunge stamp" element — e.g. a rotated "LIMITED DROP" or "SOLD OUT" stamp/badge graphic, styled to look like a spray-painted stencil rather than a horror poster, kept visually separate from headline/body text so it reads as a texture/prop rather than part of the type system.

**B variant styling note:** if going this route, heavy letter distressing (grain overlay, slight rotation, low opacity bleed) will help it blend with the grunge aesthetic instead of looking like a Halloween sticker pasted on top.

**C. Replace one of the two existing fonts.** If the direction has genuinely shifted and Creepster is preferred over Death Stinger or Hold Money for some use case, say which one it replaces and where — this would require the self-hosting/woff2 setup to be redone for that slot (per the project's "no Google Fonts dependency" architecture decision, so the `<link>` tags above would need to become a self-hosted `@font-face` regardless of which option is chosen).

### Font Loading — Applies Regardless of A/B/C
Per existing architecture (self-hosted Fontsource-style woff2, no Google Fonts runtime dependency), whatever is decided should **not** be added as a `<link>` to `fonts.googleapis.com`. Instead:
1. Convert the chosen font file(s) to `.woff2`.
2. Add local `@font-face` declarations (or a Fontsource-style local package) alongside the existing Death Stinger / Hold Money setup.
3. Register the family name in the Tailwind config `fontFamily` block, matching the pattern already used for `display-xl` / `headline-*` / `body-*` / `label-caps` / `price`.

### Files (once decision is made)
- `/app/fonts/` (or wherever the self-hosted woff2 files already live for Death Stinger/Hold Money)
- `tailwind.config.ts` — `fontFamily` block
- `app/globals.css` — `@font-face` declarations

## Acceptance Criteria
- [ ] Ilham has explicitly chosen option A, B, or C above.
- [ ] No Google Fonts `<link>` tags added to the app (self-hosted only, per existing architecture).
- [ ] Hold Money commercial license purchase is tracked as a separate to-do, independent of this decision.

### Open Questions
- Which option (A/B/C)?
- If B: what text/context for the stamp (e.g. "LIMITED", "SOLD OUT", a date, a logo mark)?
