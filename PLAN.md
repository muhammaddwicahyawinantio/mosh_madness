# PLAN.md — Mosh Madness (mosh_madness)

Production-grade streetwear brand site. Next.js App Router + TS + Tailwind + Framer Motion + Lenis + Prisma/MySQL + ImageKit + shadcn/ui + Docker → Railway.

Aturan eksekusi: satu fase selesai & diverifikasi jalan (no console error, responsive OK) sebelum lanjut fase berikutnya. Setiap fase ditutup dengan ringkasan: apa berubah, file apa disentuh, langkah manual untuk Ilham.

---

## Phase 0 — Project Setup
- [x] `create-next-app` (App Router, TS, Tailwind, ESLint) → folder `mosh_madness`
- [x] TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess`)
- [x] shadcn/ui init (`components.json`, `/components/ui`, CSS variables mode)
- [x] Install deps: `motion` (framer-motion), `lenis`, `@prisma/client` + `prisma`, `mysql2`, `imagekit`, `lucide-react`, `swr`, `recharts`, `zod`, `bcryptjs`, `jose` (atau NextAuth — lihat pertanyaan review)
- [x] Struktur folder: `/app`, `/components` (`/ui`, `/shared`, `/sections`, `/admin`), `/lib`, `/types`, `/prisma`, `/public/assets/{hero,about,reference,sponsor}`
- [x] Design tokens dari DESIGN.md → `tailwind.config.ts` + `globals.css` (CSS vars)
- [x] Font setup via `next/font`: Bebas Neue, Hanken Grotesk, JetBrains Mono
- [x] `.env.example` lengkap: `DATABASE_URL`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`
- [x] Copy asset yang sudah ada: hero (black/white), logo_himati, logo_polihasnur; helper placeholder untuk asset yang belum ada (no crash kalau file kosong)

## Phase 1 — Database & Prisma
- [x] Schema Prisma:
  - `Product` (id, title, subtitle, price Decimal, imageUrl, imageFileId, showOnHome Boolean, sortOrder, createdAt, updatedAt)
  - `VisitLog` (id, path, createdAt, visitorHash, userAgent) — untuk analytics dashboard
  - `AdminUser` (id, email, passwordHash) — kalau pakai credential DB (lihat pertanyaan review)
- [~] `prisma migrate dev` → MANUAL di lokal (engine Prisma diblokir sandbox); seed script sudah siap (beberapa produk dummy dengan gambar placeholder ImageKit)
- [x] `/lib/prisma.ts` singleton client

## Phase 2 — API Layer
- [x] `GET /api/products?home=true` — produk untuk Section 3 (hanya `showOnHome`)
- [x] `GET /api/products` — semua produk (halaman /product)
- [x] `POST/PATCH/DELETE /api/admin/products` — CRUD, protected
- [x] `POST /api/admin/upload` — signed upload ke ImageKit, protected
- [x] `POST /api/track` — visit logging (dipanggil client-side, dedupe per session)
- [x] `GET /api/admin/analytics` — agregat visits per hari, protected
- [x] `GET /api/health` — healthcheck untuk Railway
- [x] Validasi input pakai zod, response typed (`/types/api.ts`), no `any`

## Phase 3 — Shared Foundation (UI global)
- [x] Lenis provider + integrasi dengan Framer Motion scroll (`SmoothScrollProvider`)
- [x] Animation constants `/lib/motion.ts` (easing & duration standar dari DESIGN.md)
- [x] Navbar: transparan di hero → solid `#131313` on scroll, logo center, hard-invert hover
- [x] Footer: WhatsApp + Instagram (link di `/lib/constants.ts`), legal links
- [x] Marquee component (reusable, pause on reduced-motion)
- [x] `prefers-reduced-motion` guard global (CSS + `MotionConfig reducedMotion="user"` + Lenis off)
- [x] Bonus: `SafeImage` fallback + fix path hero `.png` → `.jpeg` di `lib/constants.ts`

## Phase 4 — Home Page (5 sections)
- [x] **S1 Hero**: crossfade hitam↔putih mengikuti hover/pointer (fallback scroll-driven di touch), headline display-xl overlay, particle canvas "burung terbang" (boids ringan, canvas 2D, capped particle count, pause off-screen & di reduced-motion)
- [x] **S2 About**: parallax zoom-in ke foto referensi (scroll-linked scale + clip), copywriting ID dark-artistic (Ilham, Banjarmasin, 16 Mei 2024, filosofi 666 simbolik)
- [x] **S3 Product Selector**: interactive selector TS + lucide-react, data via SWR dari `/api/products?home=true` (refresh 15s + revalidate on focus), flex-grow expand, tema dark editorial, price pakai style `price` (Bebas)
- [x] S3 CTA button → `/product`
- [x] **S4 Contact**: form (name, email/WA, message) dengan entrance stagger + micro-interaction focus (bottom-border input per DESIGN.md), submit → WhatsApp prefilled, link WA & IG
- [x] **S5 Sponsor**: React Three Fiber — logo himati & polihasnur sebagai textured plane dengan tilt-on-pointer + float idle + reveal on scroll; DPR capped [1,1.5], lazy mount saat in-view, fallback statis di reduced-motion
- [x] Marquee separator antar section
- [x] Bonus: `TrackVisit` client (dedupe per session) → `/api/track` Phase 2 sekarang beneran dipanggil
- [x] **Revisi (request Ilham)**: scroll experience ala oryzo.ai/Lusion — sticky stack per section (`StackPanel`: section pin, ditimpa section berikutnya, yang tertimpa shrink+dim scroll-linked) + parallax zoom imagery per section; foto dummy picsum grayscale sementara (`DUMMY_IMAGES` di `lib/constants.ts`)

## Phase 5 — /product & /contact
- [x] `/product`: grid blueprint (1px border cells), staggered reveal on scroll, hover invert, semua produk dari API
- [x] Product detail: halaman `/product/[id]` (keputusan final) — parallax zoom imagery, info stagger, CTA pesan via WhatsApp, `generateMetadata`
- [x] `/contact`: reuse Section 4 sebagai standalone page

## Phase 6 — Admin
- [x] Auth: login page (`/admin/login`, server action + useActionState) + proxy protect `/admin/*`; `/api/admin/*` sudah dijaga `requireAdmin` sejak Phase 2 — diverifikasi 307/401
- [x] Dashboard: visitor count, page views, chart per tanggal (recharts line 2 series, palet crimson-family lolos validator dataviz, + table view 7 hari)
- [x] Product CRUD table: create/edit (upload ImageKit), delete (hapus file ImageKit juga), toggle "Tampilkan di Home" (optimistic update + rollback)
- [x] Admin UI pakai shadcn components (button/input/label/card/table/dialog/switch via CLI), dark fungsional; Navbar/Footer brand disembunyikan via `SiteChrome`

## Phase 7 — Polish & QA
- [ ] Audit animasi: konsisten easing/duration, no jank (test di CPU throttle 4x)
- [ ] Responsive pass semua breakpoint (390 / 768 / 1024 / 1440)
- [ ] Image optimization: ImageKit transformation params (`tr=w-...,q-80,f-auto`), `next/image` di tempat relevan
- [ ] Lighthouse check, cleanup unused code, no console error/warning

## Phase 8 — Dockerize & Deploy
- [ ] `next.config` → `output: "standalone"`
- [ ] Multi-stage `Dockerfile` (deps → build → node:alpine runner, non-root user, `PORT` env dari Railway)
- [ ] `docker-compose.yml` untuk local test (app + mysql)
- [ ] Prisma migrate deploy step di start command / release phase
- [ ] Deploy checklist Railway (env vars, healthcheck `/api/health`, domain)

---

## Keputusan yang perlu Ilham konfirmasi sebelum Phase 0
1. **Auth admin**: gue rencana pakai credential sederhana (email + password hash di env / tabel AdminUser) + session JWT via `jose` + middleware — lebih ringan daripada full NextAuth untuk 1 admin. Setuju, atau mau NextAuth?
2. **Product detail**: gue condong ke **halaman** `/product/[id]` (bukan modal) — lebih clean, shareable, dan bisa dikasih transisi masuk yang premium. OK?
3. **Realtime Section 3**: SWR dengan `refreshInterval` ~15s + revalidate on focus (bukan websocket). Cukup?
