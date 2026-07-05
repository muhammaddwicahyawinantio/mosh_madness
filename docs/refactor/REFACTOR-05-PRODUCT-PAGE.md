# Spec 05 — `/product/[id]` Detail Page Transitions

## Objective
Implement the product detail page image gallery with manual (user-controlled) slide-left/slide-right transitions, alongside title, subtitle, and price — per the project's earlier architectural decision to use dedicated `/product/[id]` pages instead of modals.

## Reference
Ilham referenced Awwwards' "product transitions" inspiration collection generally — the specific pattern requested is: **manual slide transitions (not autoplay)**, image + title + subtitle + price moving together per slide.

## Requirements
- Product images slide horizontally on explicit user action (arrow buttons and/or drag/swipe) — **no autoplay carousel**.
- Each slide transition should move the image, title, subtitle, and price together as a coordinated unit (e.g. image slides fully across, text elements slide in with a slight delay/offset for depth — using Framer Motion's `AnimatePresence` with a `custom` direction prop so the exit/enter direction matches which arrow was pressed).
- Direction-aware: sliding to the "next" image enters from the right/exits to the left, and vice-versa for "previous."
- Use the project's signature easing/duration from `/lib/motion.ts` (established in `REFACTOR-01`) — do not introduce a new easing curve here.
- Keyboard support: left/right arrow keys should also trigger the transition (accessibility).
- Touch: horizontal drag/swipe triggers the same transition logic as the arrow buttons.

## Data
- Product images, title, subtitle/description, and price come from the Prisma-backed product API (`/app/api/products/[id]/route.ts` — confirm this exists from Phase 0–2, extend rather than duplicate).
- Page: `/app/product/[id]/page.tsx` (Server Component fetching initial data; the interactive gallery itself is a Client Component).

## Files
- `/app/product/[id]/page.tsx`
- `/components/product/ProductGallery.tsx` (client component, houses the `AnimatePresence` slide logic)
- `/components/product/ProductInfo.tsx` (title/subtitle/price block, animates in sync with the gallery)

## Acceptance Criteria
- [ ] No autoplay — transitions only happen on explicit user input (click, keyboard, swipe).
- [ ] Slide direction matches user intent (next → from right, prev → from left).
- [ ] Title/subtitle/price transition in a coordinated way with the image, not as a disconnected static block.
- [ ] Keyboard arrow navigation works.
- [ ] Touch swipe works and doesn't conflict with page scroll (only horizontal drag should trigger a slide; vertical drag should still scroll the page normally).
- [ ] All product data comes from the API — nothing hardcoded.

### Open Questions
- Confirm whether product variants (e.g. size/color) need to be selectable on this page, or if that's a separate future phase.
