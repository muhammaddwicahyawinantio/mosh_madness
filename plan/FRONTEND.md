# FRONTEND.md — Mosh Madness

> Tunduk ke `DESIGN.md`. Semua data produk/harga/toggle **dari DB via API** (lihat `BACKEND.md`) — jangan hardcode di komponen.
> Stack frontend: Next.js App Router + React + TS (strict) + Tailwind + Framer Motion + Lenis + shadcn/ui. ImageKit untuk media.

---

## 0. Prinsip global
1. **Cleancode:** komponen kecil & satu tanggung jawab, tidak ada `any` liar, tipe di `/types`.
2. **Responsive** di semua breakpoint. Animasi berat (parallax/particle/scroll-lock) = **desktop-first, degrade di mobile**.
3. **Performa:** particle & parallax jangan bikin lag. Target 60fps, hormati `prefers-reduced-motion`.
4. Struktur folder:
```
/app            → routes (home, product, contact, admin)
/components      → UI + sections (dumb components)
/components/motion → wrapper animasi reusable
/lib            → lenis, motion tokens, fetchers (SWR), utils
/prisma         → schema, seed
/types          → shared TS types
```

---

## 1. Shared foundation (kerjakan PALING AWAL — Phase 3)
- `LenisProvider` (global smooth scroll, `lerp 0.1`, sinkron `useScroll`).
- `Navbar` — sticky, logo center, gaya `DESIGN.md §6`.
- `Footer` — link + copyright.
- `Marquee` — reusable, arah & speed prop.
- `lib/motion.ts` — `EASE` + `DUR` dari `DESIGN.md §5`.
- Reduced-motion hook: `useReducedMotion()` (dari framer-motion) dipakai di semua section animatif.

---

## 2. Halaman `/home` (5 section, scroll-driven ala oryzo.ai)

Urutan scroll: **Hero → About (locked writer) → Product (zoom parallax) → Sponsor → Contact preview**.
Marquee "ABOUT THE BRAND" / "BESTSELLER" tetap dipertahankan sebagai pemisah section (sudah ada di code lama).

### 2.1 HERO — interactive garment + bird field
Referensi feel: velocity scroll + overlap oryzo.ai.

**Layer:**
- Background: gelap, garment di tengah (`herosection_black.jpeg` default).
- **Hover swap garment (center object only):** saat cursor di area baju tengah → cross-fade ke `herosection_white.jpeg` dengan **smoke transition kecil** (mask/opacity displacement, bukan puff besar). Efek smoke = subtle, area terbatas ke object, bukan seluruh hero.
- **Display word:** Death Stinger, mix-blend, boleh bleed.

**Bird field — LOCKED: rAF ringan (bukan canvas):**
- Burung = 8–14 SVG absolute (banyak tapi tidak memenuhi hero).
- Idle drift = CSS keyframes (Tailwind `animate-*` custom).
- **Cursor avoidance + scroll-up dihitung via `requestAnimationFrame`** (bukan physics engine, bukan canvas). Satu rAF loop untuk semua burung; posisi ditulis ke `transform` via ref (jangan re-render React tiap frame). Cleanup loop di unmount.
- Repel radius ~120px dari cursor; scroll down → semua `translateY` naik keluar layar atas + fade (baca `scrollY` sekali per frame, jangan listener boros).
- Warna burung: **putih pudar** (`text-white/30`–`/50`), jangan terang. Blur tipis di sebagian biar ada depth.
- Perilaku: idle drift terus → mendekat cursor = menghindar (repel radius ~120px) → scroll down = semua `translateY` naik keluar layar atas + fade.
- Mobile: kurangi jumlah (≤6) atau matikan avoidance (device tanpa hover), tetap ada idle drift.

**Checklist Hero:** `[ ] layout` `[ ] hover swap + smoke` `[ ] bird idle` `[ ] bird avoidance` `[ ] bird scroll-up` `[ ] reduced-motion fallback` `[ ] mobile`

### 2.2 ABOUT — REBUILD TOTAL (2 fase, video background)
> ⚠ **Hapus semua animasi About yang lama, build ulang dari nol** dengan spec ini. Scroll writer tetap: teks harus selesai dulu baru bisa lanjut section berikut.

**Fase 1 — intro text (di atas `about-section.png`):**
- Background full = `about-section.png` (⚠ belum ada di repo — minta upload).
- Teks besar: **"MOSH MADNESS"** + **"ABOUT"**, warna **putih**, font display dari `DESIGN.md` (Death Stinger), dengan **angka `666` merah** (`#b60025`) sebagai aksen.
- Teks ini **fade-in** dulu. Lanjut scroll → fade-out, masuk fase 2.

**Fase 2 — writer di atas video:**
- Background = video `vidsectionabout.mp4` (⚠ konfirmasi nama — lihat master §5; belum di repo), autoplay **loop, muted, playsinline** (wajib utk mobile), `object-cover`. Video **jalan terus** sambil user scroll.
- Di atas video: teks "tentang About" dengan **writer effect di-drive `scrollYProgress`** (pin/sticky, lihat teknik di bawah).
- **Gate:** sampai writer 100% baru boleh lanjut ke section Product.

**Teknik scroll (LOCKED — pin/sticky, bukan hard-lock):**
- Container `h-[Nvh]` + inner `sticky top-0 h-screen`. Progress fase1→fase2→writer dipetakan dari `scrollYProgress` (mis. `[0,0.3]` fade intro, `[0.3,1]` writer). User tetap menggerakkan lewat scroll (kerasa nahan, tidak freeze) + tombol **Skip**.
- **Mobile & reduced-motion:** JANGAN lock. Tampilkan `about-section.png` → teks langsung, lalu video (atau poster statis kalau reduced-motion) → teks about tampil penuh. Stabil dulu, fancy belakangan.

**STABILITAS mobile↔desktop = prioritas.** Uji di 375/768/1024/1440. Video: sediakan `poster`, `preload="metadata"`, matikan autoplay di `prefers-reduced-motion`.

**Checklist About:** `[ ] fase1 png+teks(666) fade` `[ ] fase2 video loop bg` `[ ] writer driven by scroll` `[ ] gate release + skip` `[ ] mobile stabil` `[ ] reduced-motion fallback`

### 2.3 PRODUCT — Zoom Parallax
Pakai komponen `ZoomParallax` referensimu (Framer Motion `useScroll`/`useTransform`, `h-[300vh]`, sticky). Wajib diperbaiki:
- **TS strict:** ketik ulang interface, ganti `<img>` mentah → `next/image`, `alt` wajib.
- **Sumber dari DB** (produk `showInParallax=true`, ambil **hanya image `isPrimary`**), **max 7**. Produk real sudah ada di `public/assets/products/` & di-seed ke DB (lihat `BACKEND.md §4`) — jadi parallax narik dari DB, bukan hardcode path.
- Analog "file ujung `1.jpg`" = image `isPrimary` per produk (bisa diatur di `/admin`).
- Reduced-motion → grid statis tanpa scale transform.

### 2.4 SPONSOR — 2 video card + logo strip
**Video cards (komponen reusable `VideoCards`, dipakai juga di `/contact`):**
- 2 card video: **`kiri.mp4` di kartu kiri-atas**, **`kanan.mp4` di kartu kanan-bawah** (komposisi diagonal/staggered).
- `autoplay loop muted playsinline`, `object-cover`, kualitas HD, `poster` + `preload="metadata"`. Bungkus **backdrop abu tipis** (`bg-white/5`–`/10` atau overlay `#ffffff0d`).
- Animasi card: keren tapi **sederhana** — reveal on-scroll (`EASE.out`) + hover lift/scale halus + border tajam. Jangan berat.
- **Stabil mobile↔desktop:** desktop = staggered diagonal; mobile = stack vertikal (kiri lalu kanan), video tetap autoplay. Reduced-motion → tampilkan poster/frame statis.

**Logo strip:** `logo_himati.png`, `logo_polihasnur.png`, `dwiscript.png` — marquee infinite, default `grayscale opacity-40`, hover → full color (magnetic hover halus). Semua transform ringan, no canvas. Sumber logo dari DB (`Sponsor`), bisa CRUD di `/admin`.

### 2.5 CONTACT preview (di home)
- Reuse komponen **`VideoCards`** (kiri.mp4 / kanan.mp4) sebagai visual utama.
- Lottie metal = **opsional** (kalau video sudah cukup, skip biar ringan — prinsip ponytail). Kalau dipakai: file kecil (`<~50KB`), lazy `dynamic import ssr:false`, render saat in-view saja.
- Link ke `/contact` penuh.

---

## 3. Halaman `/product` — full gallery
- Tampilkan **semua** foto produk (semua varian, bukan cuma varian utama) dari DB/ImageKit.
- Animasi galeri "full product": grid brutalist + **reveal on scroll** (stagger, `EASE.out`), hover = zoom halus dalam frame (overflow hidden). Filter/kategori kalau ada di DB.
- Klik item → `/product/[id]` (page, bukan modal — sudah jadi keputusan lama).
- Responsive: 1 col mobile → 2 → 3.

## 4. Halaman `/contact` — full
- Layout umum & bersih: **judul + subjudul + (harga/pricelist jika relevan)** + form.
- Visual: reuse **`VideoCards`** (kiri.mp4 kiri-atas, kanan.mp4 kanan-bawah, backdrop abu tipis, autoplay loop muted playsinline, stabil mobile↔desktop).
- Form fields: name, email, subject, message. Validasi client + server. **Tujuan data: DB (`ContactMessage`) → muncul di `/admin`.**
- Animasi "keren tapi ringan": input focus = garis bawah `scaleX`, label naik; submit = invert + state idle→loading→sent.
- Field harga: style `price` (`DESIGN.md §3`), putih; motif `666` → merah `#b60025`.

---

## 5. Definition of Done per section
Setiap section dianggap selesai jika: ✅ responsive 3 breakpoint · ✅ reduced-motion fallback · ✅ data dari API (bukan hardcode) · ✅ `tsc --noEmit` + `build` + `lint` bersih · ✅ tidak ada layout shift saat font load.
