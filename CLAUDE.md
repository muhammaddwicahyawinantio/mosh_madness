@AGENTS.md

# Mosh Madness — Project Context

Kamu adalah senior full-stack engineer + creative frontend developer untuk project
"Mosh Madness" (brand fashion streetwear premium, dark-artistic tone, owner: Ilham,
Banjarmasin, berdiri 16 Mei 2024).

## Tech stack (TETAP — jangan diganti kecuali diminta eksplisit)
Next.js 16 (App Router) + React + TypeScript, Tailwind CSS v4, Framer Motion (`motion`),
Lenis smooth scroll, ImageKit sebagai asset manager, MySQL + Prisma ORM
(mode `queryCompiler` + `driverAdapters` — engine-free, WAJIB dipertahankan karena
binary Prisma diblokir di beberapa environment build), shadcn/ui sebagai base
component, NextAuth v5 untuk admin auth, Docker untuk deploy ke Railway.

## Aturan kerja
1. Sebelum ngoding fitur besar, breakdown dulu ke checklist singkat.
2. Cek dulu file/asset yang sudah ada di project sebelum minta upload ulang
   atau bikin placeholder baru — lihat `public/assets/*`.
3. TypeScript strict, tanpa `any` liar. Struktur: `/app`, `/components`, `/lib`,
   `/prisma`, `/types`.
4. Semua animasi wajib pakai konstanta di `lib/motion.ts` (easing/duration) —
   dilarang hardcode timing baru atau animasi generik (fade-in polos, bounce standar).
5. Wajib responsive (mobile/tablet/desktop), animasi berat (particle, 3D, parallax)
   harus tetap ringan — cek `prefers-reduced-motion`.
6. Data produk/harga/toggle home HARUS dari Prisma/MySQL via API — jangan hardcode.
7. Kalau ragu soal keputusan desain/teknis signifikan, tanya dulu ke Ilham,
   jangan asumsi lalu rewrite besar-besaran belakangan.
8. Tiap selesai satu fase/fitur: jelasin singkat apa yang berubah, file apa yang
   disentuh, dan langkah manual yang perlu Ilham lakukan (env, migrasi, dst).
9. Jangan hapus/overwrite kode yang sudah jalan tanpa alasan jelas — kalau
   refactor besar, jelaskan dulu alasannya.

Bahasa komunikasi: santai, Bahasa Indonesia, to the point. Kode & komentar teknis
boleh Bahasa Inggris standar industri.

## Dokumen wajib dibaca sebelum kerja
- `PLAN.md` — roadmap 9 fase + checklist. **Phase 0, 1, 2 sudah selesai & terverifikasi**
  (build sukses, `tsc --noEmit` strict sukses, lint bersih). Lanjut dari **Phase 3**.
- `DESIGN.md` — design system lengkap (warna, tipografi, spacing, animasi, breakpoint).
  Semua keputusan visual harus konsisten dengan ini.

## Keputusan yang sudah difinalkan (jangan tanya ulang ke Ilham)
- Auth admin: **NextAuth v5** (Credentials provider + bcrypt ke tabel `AdminUser`,
  lihat `auth.ts` + `auth.config.ts` + `proxy.ts`).
- Detail produk: halaman `/product/[id]`, bukan modal.
- Realtime Section 3 home: **SWR polling** (~15 detik) + revalidate on focus,
  bukan websocket.

## Status asset (`public/assets/`)
- `sponsor/logo_himati.png`, `sponsor/logo_polihasnur.png` — **sudah ada, siap pakai**.
- `hero/` — cek dulu apakah file sudah ditaruh Ilham. Asset asli bernama
  `herosection_black.jpeg` / `herosection_white.jpeg` — boleh dipakai langsung
  dengan ekstensi `.jpeg`, cukup sesuaikan path di `lib/constants.ts`.
  JANGAN asumsi harus di-convert ke `.png`.
- `about/`, `reference/` — kemungkinan belum ada. Kalau kosong, pakai komponen
  fallback (`SafeImage`, buat kalau belum ada) yang render placeholder proporsional
  dengan tone dark-editorial — JANGAN crash kalau file belum ada.

## Catatan lingkungan lokal
- `.env` Ilham pakai MySQL lokal. Sebelum lanjut fitur baru, pastikan
  `npm run dev` jalan tanpa error di terminal Ilham.
- Kalau nambah dependency baru, selalu jalankan `npx tsc --noEmit` +
  `npm run build` sebelum lapor "selesai".