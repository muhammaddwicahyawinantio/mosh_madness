# Spec 06 — `/contact` Page

## Objective
Build a `/contact` page with a distinctive dark-editorial background, expressive headline typography, and an interactive contact form — consistent with the rest of the site's signature motion (from `REFACTOR-01`), not a generic template contact form.

## Requirements

### Background & Headline
- Background should carry the same grunge/editorial atmosphere as the rest of the site (grain texture, dark tonal layering per `DESIGN.md`) rather than a flat solid color.
- Headline ("GET IN TOUCH" or similar — confirm exact copy with Ilham) uses the same display typography (Death Stinger, per `REFACTOR-07`) and reveal treatment established in `REFACTOR-01`'s intro (letter/word stagger), for visual consistency across the site rather than a one-off effect.

### Form
- Fields: name, email, message (confirm if phone/subject should be added).
- Built on shadcn/ui form primitives (`Form`, `Input`, `Textarea`, `Button`) with `react-hook-form` + `zod` validation — this is the standard pairing with shadcn and keeps validation type-safe.
- Interaction details to avoid a "generic AI template" feel:
  - Inputs follow the bottom-border-only style already defined in `DESIGN.md` ("Input Fields: Bottom-border only, label top-left in `label-caps`").
  - Focus state: label and bottom border animate (color shift to crimson accent `#b60025`, per DESIGN.md's rule that red is reserved for urgency/accent moments) rather than a default browser outline.
  - Submit button uses the signature motion + a custom loading/success state (e.g. text swaps to a small motion-driven confirmation) instead of a spinner icon.
- Client-side validation errors should appear inline, styled consistently with the rest of the type system (no default red browser validation bubbles).

### Data Flow (needs your decision — see Open Questions)
Two valid options:
1. **Store in DB:** add a `ContactMessage` Prisma model (name, email, message, createdAt), submit via a new API route (`/app/api/contact/route.ts`), and surface submissions in the admin dashboard later.
2. **Email delivery:** submit via an email service (e.g. Resend) directly from the API route, no DB storage.

Do not implement either silently — this is a real architectural decision (adds a migration in option 1, adds a new env var/service dependency in option 2).

## Files
- `/app/contact/page.tsx`
- `/components/contact/ContactBackground.tsx`
- `/components/contact/ContactForm.tsx`
- `/app/api/contact/route.ts`
- (if DB option chosen) new model in `/prisma/schema.prisma` + migration

## Acceptance Criteria
- [ ] Background/headline visually consistent with the rest of the site's grunge-editorial language, not a plain dark rectangle.
- [ ] Form fully keyboard-accessible, validated with zod, errors styled in-system.
- [ ] Submit flow gives clear feedback (success/error) using the signature motion, not a generic toast/spinner.
- [ ] Data flow matches whichever option Ilham confirms (DB vs. email).

### Open Questions
- DB storage vs. email delivery for form submissions (see above) — this determines whether a migration is needed.
- Exact headline copy and whether additional fields (phone, subject/topic dropdown) are needed.
