# Mosh Madness — Project Documentation

Brand fashion streetwear premium, dark-artistic. Owner: Ilham, Banjarmasin. Est. 16 Mei 2024.
Website production-grade: cinematic dark editorial, scroll-driven, CMS-backed.

## Tech stack
Next.js (App Router) + React + TypeScript strict · Tailwind CSS · Framer Motion · Lenis ·
shadcn/ui · MySQL + Prisma (engine-free: `queryCompiler` + `driverAdapters`) · NextAuth v5 ·
Docker → Railway. Routing pakai `proxy.ts` (bukan `middleware.ts`, Next 16).
Media: upload ke **storage project sendiri** (ImageKit dihapus) — Railway Volume di prod.
TEXT BISA BERUBAH DIHALAMAN USER JIKA DI EDIT OLEH ADMIN SEPERTI FITUR YANG SUDAH ADA
*FITUR ADMIN HARUS BISA DIGUNAKAN CRUD DAN LAIN-LAIN*

## Filosofi kerja
Project jalan pakai **ponytail** (least-code: YAGNI → reuse → native → 1 baris → minimum),
tapi validasi/security/error-handling/accessibility tidak pernah dipotong. Detail: `CLAUDE.md`.

## Struktur
```
/app         routes: (home) /product /contact /admin + /api
/components   UI + sections + /motion (wrapper animasi)
/lib          lenis, motion tokens (EASE/DUR), fetchers (SWR), storage, prisma
/prisma       schema + seed
/types        shared TS types
/public/assets  products/ sponsor/ videos/ + herosection_*.jpeg
```

## Halaman
- **/product**: galeri penuh semua produk, klik → `/product/[id]`.
- **/contact**: judul/subjudul/harga + form (simpan ke DB) + video cards.
- **/admin**: CMS penuh — dashboard, Product CRUD + image manager, Hero 2-image, Sponsor/logo, teks section, pesan contact, media library PESAN TEXT. Protected NextAuth v5. (WAJIB BERFUNGSI)

## Data model (ringkas)
`MediaAsset` (file upload) · `Product` + `ProductImage` (toggle `showInHome`/`showInParallax`, `isPrimary`) ·
`HeroMedia` (BLACK/WHITE) · `Sponsor` · `SiteContent` (teks editable) · `ContactMessage` · `VisitLog` · `AdminUser`.
Semua konten front-end dari DB via API — tidak ada hardcode.

## Design system (ringkas — detail di DESIGN.md)
- Warna: hitam `#131313`, putih `#ffffff`, abu, merah `#b60025` (khusus urgensi + motif `666`).
- Font (Opsi A): Death Stinger (display) · Bebas Neue (headline) · Hanken Grotesk (body) · JetBrains Mono (data) · Creepster (aksen, hemat).
- Radius 0, border 1px brutalist, hover inversi, section-gap besar, motion easing konsisten (`lib/motion.ts`).

## Menjalankan
```bash
npm install
cp .env.example .env         # isi nilainya
npx prisma migrate dev
npx prisma db seed
npm run dev                  # http://localhost:3000