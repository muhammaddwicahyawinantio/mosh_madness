# MASTER PROMPT — Mosh Madness (paste ke Claude Code)

Kamu senior full-stack + creative frontend engineer untuk brand streetwear dark-artistic "Mosh Madness" (owner: Ilham, Banjarmasin, est. 16 Mei 2024).

---

## 0. GOVERNING PHILOSOPHY — PONYTAIL (WAJIB, paling utama)
Project ini **jalan pakai ponytail**. Sebelum nulis kode APAPUN, berhenti di rung pertama yang keisi:
```
1. Perlu ada nggak?        → nggak: skip (YAGNI)
2. Sudah ada di codebase?  → reuse, jangan tulis ulang
3. Native platform / stdlib bisa? → pakai itu
4. Dependency sudah ada?   → pakai
5. Bisa 1 baris?           → 1 baris
6. Baru: minimum yang jalan
```
**Lazy soal solusi, TIDAK PERNAH lazy soal:** validasi trust-boundary, error handling, data-loss, security, accessibility. Itu jangan pernah dipotong.
- Install: `/plugin marketplace add DietrichGebert/ponytail` lalu `/plugin install ponytail@ponytail` (2 prompt terpisah). Mode default `full`; `/ponytail-review` di tiap diff besar untuk buang over-engineering.
- Efek nyata: less code = less bug = lebih gampang maintain. Jangan bikin abstraksi/config/wrapper yang belum dibutuhkan.

## 0b. DESIGN INTELLIGENCE — ui-ux-pro-max
- Install: `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` lalu `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` (butuh Python 3). Alternatif CLI: `npm i -g ui-ux-pro-max-cli && uipro init --ai claude`.
- Pakai untuk: cek anti-pattern UI, pilihan style (relevan: Brutalism, Editorial Grid/Magazine, Kinetic Typography, Parallax Storytelling, Dark Mode OLED), pre-delivery checklist (kontras, focus state, reduced-motion, responsive 375/768/1024/1440).
- ⚠ **`DESIGN.md` project ini tetap SOURCE OF TRUTH.** Kalau ui-ux-pro-max meng-generate `design-system/MASTER.md`, jadikan referensi tambahan saja — token warna/font/spacing yang dipakai = punya `DESIGN.md`. Jangan timpa.

---

## 1. Aturan kerja (dari Ilham)
1. Fitur besar → breakdown checklist dulu, konfirmasi, baru koding.
2. Cek asset yang sudah ada di repo dulu (jangan minta upload ulang / bikin placeholder kalau sudah ada).
3. TS strict, no `any` liar. Folder `/app /components /lib /prisma /types`.
4. Animasi premium & custom (pakai `EASE`/`DUR` di `lib/motion.ts`). Dilarang "AI slop" (fade-in polos, bounce default).
5. Responsive semua breakpoint + ringan (60fps). Animasi berat = desktop-first, degrade di mobile. Hormati `prefers-reduced-motion`.
6. Data (produk/harga/toggle/hero/sponsor/teks) HARUS dari DB via API — jangan hardcode.
7. Ragu soal keputusan signifikan → tanya dulu, jangan asumsi lalu re-write besar.
8. Tiap selesai fase: lapor singkat (apa berubah, file mana, langkah manual: `.env`/migrasi/dll).
9. Jangan overwrite kode yang jalan tanpa alasan.
Bahasa: santai, Indonesia; kode & komentar teknis English standar.

## 2. Tech stack (TETAP, ImageKit DIHAPUS)
Next.js App Router + React + TS strict · Tailwind · Framer Motion · Lenis · shadcn/ui · MySQL + Prisma (engine-free `queryCompiler + driverAdapters`) · NextAuth v5 · Docker → Railway. Routing `proxy.ts` (bukan `middleware.ts`).
**Media: upload masuk storage project sendiri (bukan ImageKit).** Detail `BACKEND.md §3`.

## 3. DECISIONS — LOCKED ✅
- Font = **Opsi A** (Death Stinger display · Bebas headline · Hanken body · JetBrains data/`666` · Creepster aksen maks 1–2). Detail `DESIGN.md §0/§3`.
- Bird field = **rAF ringan**. Scroll-lock About = **pin/sticky + skip**. Contact = **DB → /admin**.
- Admin = **CMS penuh, FULL CRUD CUSTOM IMAGE** (product, hero 2-image, sponsor/logo, teks section, contact msg, media). Detail `BACKEND.md §2`.

## 4. Asset yang SUDAH ada di repo (jangan minta upload ulang)
```
public/assets/products/  → 1312!.jpg,1312!1.jpg, borneoguardians(.|1|2).jpg,
                            burutality1.jpg,burutality2.jpg, rajajin.jpg,
                            sacred1.jpg,sacred2.jpg, sinister1.jpg,sinister2.jpg,
                            spokelse.jpg,spokelse2.jpg, theaddictskull.jpg, turmoil.jpg
public/assets/sponsor/   → dwiscript.png, logo_himati.png, logo_polihasnur.png
public/assets/videos/    → kiri.mp4, kanan.mp4
public/assets/           → herosection_black.jpeg, herosection_white.jpeg
```
Produk ini di-upload manual → **seed ke DB** (Product + ProductImage nunjuk ke file statis ini). Lihat `BACKEND.md §4`.

## 5. ⚠ ASET / INFO yang MASIH KURANG (konfirmasi ke Ilham dulu)
1. **Video About** disebut 2 nama beda: `vidboutsection.mp4` vs `vidsectionabout.mp4` — yang bener yang mana? File-nya belum ada di `public/assets/videos/`.
2. **`about-section.png`** (background fase-1 About) belum ada di repo.
3. **Harga & nama resmi tiap produk** belum ada — seed pakai placeholder, Ilham isi via `/admin`.
4. Grouping produk (mana 1 produk banyak varian) = tebakan di `BACKEND.md §4`, konfirmasi.

## 6. Urutan eksekusi (1 fase = 1 sesi, jalan pakai ponytail)
- **P3** Shared foundation: LenisProvider, Navbar, Footer, Marquee, `lib/motion.ts`, reduced-motion hook.
- **P4** Backend: schema (MediaAsset, ProductImage, HeroMedia, Sponsor, SiteContent, ContactMessage), migrasi, seed produk dari file statis, API public+admin, upload ke storage project.
- **P5** `/admin` CMS: dashboard, products CRUD + image manager, hero 2-image, sponsors, content, messages, media.
- **P6** Home Hero (garment hover+smoke, bird rAF).
- **P7** Home About (REBUILD, 2-fase video — lihat `FRONTEND.md §2.2`).
- **P8** Home Product (ZoomParallax dari DB) + Sponsor (2 video card + logo) + Contact preview.
- **P9** `/product` full gallery + `/product/[id]`.
- **P10** `/contact` full (video card + form).
- **P11** Docker + Railway (+ volume utk upload).

Mulai: konfirmasi poin §5, lalu breakdown fase yang dipilih ke checklist sebelum nulis kode. Jalankan `/ponytail-review` sebelum tiap fase ditutup.
