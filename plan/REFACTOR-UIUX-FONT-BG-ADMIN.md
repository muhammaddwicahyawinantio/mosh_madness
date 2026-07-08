# REFACTOR — UI/UX POLISH: Product Background + Font Overhaul + Admin Mobile

> **Untuk Claude Code.** Ini spec perbaikan UI/UX untuk project **Mosh Madness** (Next.js App Router + TS strict + Tailwind + Framer Motion + Lenis + shadcn/ui + Prisma/MySQL).
> Status project **SUDAH LIVE**. Kerja dengan hati-hati, jangan sentuh apa pun di luar scope di bawah.

---

## ⛔ GUARDRAILS (baca dulu sebelum ngoding)

1. **JANGAN sentuh kode yang tidak terkait** dengan 3 task di bawah. Product data, API routes, auth, Prisma schema, Docker/Railway config, logic checkout/analytics — **JANGAN diubah**.
2. Semua perubahan font dilakukan lewat **design token terpusat** (globals.css + tailwind config + definisi `next/font`), **bukan** tempel `font-family` inline satu-satu.
3. **JANGAN paksa `text-transform: uppercase`** pada teks yang diubah di Task 2. Hormati casing natural teks (Title Case / sentence case sesuai konten).
4. Data produk / harga / toggle tetap **DB-driven via Prisma** — tidak ada hardcode baru.
5. **Gate wajib setelah selesai** (no exception): `tsc --noEmit` → `npm run build` → `npm run lint` semua harus clean.
6. Kalau nemu bekas usage `Creepster` (atau apa pun) yang **tidak jelas harus dimap ke mana**, **STOP dan tanya**, jangan asal ganti.
7. Sebelum overwrite komponen yang jalan, jelasin dulu alasannya. Prefer edit minimal, bukan rewrite.

---

## TASK 1 — Background Section Product (`product-section.png`)

**Goal:** Section product/bestseller punya background image `product-section.png`, mengikuti pola yang sudah dipakai section About (background absolute + blend + opacity rendah, konten tetap legible).

- [ ] Taruh asset `product-section.png` di lokasi asset yang **sama** dengan background section lain (ikuti konvensi existing untuk `about-section.png` / hero images — jangan bikin folder/mekanisme baru).
- [ ] Di komponen section product, tambahkan layer background:
  - `position: absolute; inset: 0;` di belakang konten (`z-0`), konten di `z-10`.
  - `object-cover`, opacity rendah + blend mode biar teks & grid tetap kebaca (samain feel-nya sama About: mix-blend + opacity ~40%, adjust sampai enak).
  - Grid blueprint / border brutalist yang sudah ada **tetap dipertahankan** di atas background.
- [ ] Pastikan background **tidak mengganggu hover/animasi card** produk yang sudah ada (pointer-events aman, tidak nutupin tombol).
- [ ] Cek responsive: mobile / tablet / desktop background tetap proporsional, gak bikin teks ketimpa.

**Jangan** ubah data/looping produk — cuma nambah layer visual.

---

## TASK 2 — FONT OVERHAUL

### 2.1 Setup font
- [ ] **Tambah `Metal Mania`** (Google Fonts) via `next/font/google` (auto self-hosted, konsisten sama setup self-hosted font Phase 0). Bikin token/variable-nya, mis. `--font-metal` / `font-metal`.
- [ ] **Hapus total `Creepster`**: buang import/definisi, buang token Tailwind/`globals.css`, dan buang semua penggunaannya di komponen.
- [ ] **`Death Stinger` tetap** (local font). **`Bebas Neue`, `Hanken Grotesk`, `JetBrains Mono` tetap.**

### 2.2 Aturan pemakaian (WAJIB dipatuhi)

**Metal Mania — HANYA di 2 tempat:**
- [ ] **Semua marquee** (semua instance komponen Marquee).
- [ ] **Slogan** seperti `Inovasi Digital Untuk Kemandirian UMKM Lokal`.
- [ ] Di luar 2 ini, Metal Mania **tidak boleh** muncul.

**Death Stinger:**
- [ ] Dipakai untuk **display text besar** yang berdiri bareng barisan judul section (headline skala besar / hero-scale).
- [ ] **Navbar "MOSH MADNESS" tetap Death Stinger.**

**Bekas Creepster:** audit semua lokasinya. Untuk tiap lokasi, map sesuai peran:
- Kalau itu marquee/slogan → Metal Mania.
- Kalau itu accent display besar → Death Stinger.
- Kalau itu heading biasa → Bebas Neue.
- **Kalau ragu perannya → STOP & tanya**, jangan asal.

### 2.3 Teks yang pindah ke FONT STANDAR (natural case, JANGAN uppercase paksa)

Gunakan **JetBrains Mono** (utility, natural case, letter-spacing dinormalkan — jangan `label-caps` yang maksa CAPS) untuk:
- [ ] Counter sponsor: `004 / Didukung oleh 001 /` dan seterusnya.
- [ ] `Sponsored by`.
- [ ] **Nav index**: `Home`, `Product`, `Contact` (Title Case, bukan HOME/PRODUCT/CONTACT).
- [ ] **Footer**: `Kontak`, `WhatsApp`, `Instagram`.
- [ ] Copyright: `© 2026 Mosh Madness. All rights reserved.`
- [ ] **Navbar** — label hamburger / semua teks navbar **kecuali** "MOSH MADNESS" (yang tetap Death Stinger).

Gunakan **Hanken Grotesk** (body, readable, natural case) untuk:
- [ ] **Typewriter text di section About**.

> Catatan: kalau Ilham mau font sans/display khusus lain untuk grup "font standar" ini, gampang di-swap karena semua lewat token. Default gua: JetBrains Mono (utility) + Hanken Grotesk (typewriter).

### 2.4 Aturan casing global untuk teks yang diubah
- [ ] Hilangkan `uppercase` / `text-transform: uppercase` pada teks-teks di 2.3. Tulis apa adanya sesuai konten.
- [ ] Jangan ganti komponen lain yang memang sengaja CAPS (mis. headline Bebas Neue existing yang bukan bagian daftar di atas) — biarkan.

---

## TASK 3 — ADMIN PANEL: perbaikan MOBILE ONLY

**Goal:** Tampilan `/admin` enak & gampang diakses di HP. **Desktop JANGAN diubah sama sekali.**

- [ ] Semua perbaikan **hanya di breakpoint mobile** (pakai Tailwind default: base = mobile, lalu `md:`/`lg:` untuk balikin layout desktop apa adanya). Jangan ubah style yang aktif di `md:`+.
- [ ] Perbaiki minimal:
  - Navigasi/menu admin bisa diakses di layar kecil (sidebar → drawer/collapsible di mobile, tetap sidebar di desktop).
  - Tabel CRUD (products, contact messages, media, dll) tidak overflow horizontal parah — kasih scroll container atau stack jadi card di mobile.
  - Tombol aksi (add/edit/delete/upload) kepencet enak (target ≥ 40px), gak numpuk.
  - Form input full-width & spacing enak di mobile.
- [ ] Verifikasi di lebar ~360–414px gak ada elemen kepotong / tombol ketiban.
- [ ] **Desktop harus identik** dengan sebelum refactor (visual regression = 0 di ≥ `md`).

---

## ✅ DEFINITION OF DONE
- [ ] `tsc --noEmit` clean, `npm run build` sukses, `npm run lint` clean.
- [ ] Metal Mania cuma di marquee + slogan. Creepster 0 sisa di seluruh repo.
- [ ] Navbar "MOSH MADNESS" masih Death Stinger; sisanya font standar natural-case.
- [ ] Product section punya background `product-section.png`, teks tetap kebaca.
- [ ] Admin mobile enak; admin desktop tidak berubah.
- [ ] Tidak ada file di luar scope yang tersentuh.

## 📋 LAPORAN yang gua tunggu setelah selesai
1. File apa aja yang disentuh (list).
2. Ringkasan tiap task: apa yang berubah.
3. Langkah manual yang perlu gua lakuin (mis. taruh `product-section.png` di path X, dll).
4. Kalau ada bekas Creepster yang ambigu — list-nya + pertanyaannya, jangan diputusin sendiri.
