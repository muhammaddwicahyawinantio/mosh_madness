# CLAUDE.md — Mosh Madness

Brand fashion streetwear premium, dark-artistic. Owner: Ilham (Banjarmasin, est. 17 Maret 2024).
File ini dibaca Claude Code tiap sesi. Untuk detail, buka spec di bawah.

## Spec files (WAJIB dibaca sebelum ngoding)
- `DESIGN.md`          → SOURCE OF TRUTH visual (token warna, font, motion). Jangan ditimpa.
- `FRONTEND.md`        → spec 5 halaman + animasi (hero, about, product, sponsor, contact).
- `BACKEND.md`         → Prisma, API, admin CMS, media storage, Docker/Railway.
- `REFACTOR-PROMPT.md` → urutan fase eksekusi.

---

## GOVERNING PHILOSOPHY — PONYTAIL (berlaku ke SEMUA kode di repo ini)
Sebelum nulis kode apa pun, berhenti di rung pertama yang keisi:
```
1. Perlu ada nggak?            → nggak: skip (YAGNI)
2. Sudah ada di codebase?      → reuse, jangan tulis ulang
3. Native platform / stdlib?   → pakai itu
4. Dependency sudah ada?       → pakai
5. Bisa 1 baris?               → 1 baris
6. Baru: tulis minimum yang jalan
```
Lazy soal SOLUSI. **TIDAK PERNAH lazy** soal: validasi trust-boundary, error handling, pencegahan data-loss, security, accessibility. Empat hal itu jangan pernah dipotong.
Prinsip: less code = less bug = gampang maintain. Jangan bikin abstraksi/config/wrapper yang belum dibutuhkan. Kalau ragu apakah suatu kode perlu → default-nya JANGAN tulis, tanya dulu.

> Kalau plugin ponytail asli sudah keinstall, jalankan `/ponytail-review` di tiap diff besar. Kalau belum bisa (env nggak support `/plugin`), cukup patuhi tangga di atas secara manual.

---

## ATURAN KERJA (dari Ilham)
1. Fitur besar → breakdown checklist dulu, konfirmasi, baru koding.
2. Cek asset yang sudah ada di repo dulu — jangan minta upload ulang / bikin placeholder kalau sudah ada.
3. TypeScript strict, no `any` liar. Folder `/app /components /lib /prisma /types`.
4. Animasi premium & custom (pakai `EASE`/`DUR` di `lib/motion.ts`). Dilarang "AI slop".
5. Responsive semua breakpoint + ringan (60fps). Animasi berat = desktop-first, degrade di mobile. Hormati `prefers-reduced-motion`.
6. Data (produk/harga/toggle/hero/sponsor/teks) HARUS dari DB via API — jangan hardcode.
7. Ragu soal keputusan signifikan → tanya dulu, jangan asumsi lalu re-write besar.
8. Selesai fase → lapor singkat: apa berubah, file mana, langkah manual (env/migrasi).
9. Jangan overwrite kode yang jalan tanpa alasan.
Bahasa: santai, Indonesia; kode & komentar teknis English standar.

---

## TECH STACK (tetap)
Next.js App Router + React + TS strict · Tailwind · Framer Motion · Lenis · shadcn/ui ·
MySQL + Prisma (engine-free `queryCompiler + driverAdapters`) · NextAuth v5 · Docker → Railway.
Routing pakai `proxy.ts` (BUKAN `middleware.ts`, Next 16).

⚠ **ImageKit DIHAPUS dari project ini.** Media/upload masuk **storage project sendiri**
(`MediaAsset` + serve `/media/[...]`, di Railway pakai Volume). Lihat `BACKEND.md §3`.
Catatan: kalau ada template lama yang masih nyebut "ImageKit sebagai asset manager", itu
sudah tidak berlaku — ikut file ini.

---

## DECISIONS — LOCKED
- Font Opsi A: Death Stinger (display hero-scale + logo navbar) · Bebas Neue (headline section) · Hanken Grotesk (body + typewriter About) · JetBrains Mono (data/label/counter/nav/`666`) · Metal Mania (aksen — HANYA marquee + slogan). **Creepster DIHAPUS** (bekas woff2 masih di disk tapi tidak direferensikan).
- Bird field = rAF ringan · Scroll-lock About = pin/sticky + skip · Contact → DB (`ContactMessage`) muncul di `/admin`.
- Admin = CMS penuh, FULL CRUD CUSTOM IMAGE (product, hero 2-image, sponsor/logo, teks section, contact, media).

## ASET yang sudah ada di repo
```
public/assets/products/  → 1312!(.|1).jpg, borneoguardians(.|1|2).jpg, burutality(1|2).jpg,
                            rajajin.jpg, sacred(1|2).jpg, sinister(1|2).jpg,
                            spokelse(.|2).jpg, theaddictskull.jpg, turmoil.jpg
public/assets/sponsor/   → dwiscript.png, logo_himati.png, logo_polihasnur.png
public/assets/videos/    → kiri.mp4, kanan.mp4
public/assets/           → herosection_black.jpeg, herosection_white.jpeg
```
Produk di-seed ke DB dari file statis ini (lihat `BACKEND.md §4`).

## MASIH KURANG (konfirmasi/upload dulu sebelum fase terkait)
- Video About: nama `vidsectionabout.mp4` vs `vidboutsection.mp4`? + file belum ada.
- `about-section.png` (bg fase-1 About) belum ada.
- Harga & nama resmi produk (isi via `/admin`, sementara DRAFT/placeholder).

## URUTAN FASE (1 fase = 1 sesi)
P3 shared foundation → P4 backend+seed → P5 admin CMS → P6 hero → P7 about (rebuild 2-fase video)
→ P8 product+sponsor+contact-preview → P9 /product → P10 /contact → P11 Docker/Railway.
