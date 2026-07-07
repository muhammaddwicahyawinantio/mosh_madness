# DESIGN.md — Mosh Madness

> Dark-artistic streetwear. Banjarmasin. Est. 16 May 2024.
> Aesthetic direction: **Dark Editorial / Minimalist Grunge** — high-contrast, brutalist grid, loud display type, generous negative space. Bukan "goth costume", tapi galeri gelap yang mahal.
> File ini adalah **single source of truth** untuk visual. `FRONTEND.md` & `BACKEND.md` tunduk ke file ini.

---

## 0. DECISIONS — LOCKED ✅ (2026-07-06)

Semua ambiguitas sudah dikonfirmasi Ilham:

1. **Font → Opsi A.**
   - **Death Stinger** = display raksasa saja (hero word, section anchor).
   - **Bebas Neue** = headline menengah / sub-anchor.
   - **Hanken Grotesk** = body & deskripsi.
   - **JetBrains Mono** = data teknis (SKU, size, harga label, motif `666`).
   - **Creepster** = aksen horror, **maks 1–2 tempat** (angka `666`, tag SALE, glitch word). Restraint = mewah.
2. **Bird field** = rAF ringan (bukan canvas). Detail di `FRONTEND.md §2.1`.
3. **Scroll-lock About** = teknik pin/sticky (bukan hard-lock) + skip. Detail di `FRONTEND.md §2.2`.
4. **Contact** = simpan ke DB → muncul di `/admin`. Detail di `BACKEND.md`.
5. **ImageKit DIHAPUS dari project.** Media strategy diganti: **upload masuk ke storage project sendiri** (bukan CDN eksternal). Konsekuensi teknis + solusi Railway → `BACKEND.md §Media & §Docker`.

---

## 1. Brand personality
Aggressive, raw, uncompromisingly urban — tapi disajikan dengan disiplin editorial. Grid kaku ala lookbook fisik yang sesekali "pecah" untuk aksen chaos (mosh pit energy). Target: youth streetwear, menghargai authenticity di atas polish. Emosi yang dikejar: **intensity + exclusivity**, bukan "seram norak".

---

## 2. Color tokens (LOCKED)

Palet sengaja dibatasi. Merah **hanya** untuk urgensi & motif `666`.

```
--surface / background      #131313   (pure-ish black, canvas)
--surface-container-lowest  #0e0e0e
--surface-container-low     #1c1b1b
--surface-container         #201f1f
--surface-container-high    #2a2a2a
--surface-container-highest #353534
--surface-bright            #393939

--primary (white)           #ffffff   (headline, CTA utama, teks kritis)
--on-primary                #2f3131

--on-surface                #e5e2e1   (body text default)
--on-surface-variant        #c4c7c8   (metadata, teks sekunder)
--outline                   #8e9192   (border tipis)
--outline-variant           #444748   (divider halus)

--accent-666 (red)          #b60025   (SALE, sold-out, motif 666, button tertentu)
--on-accent                 #ffffff
```

**Aturan merah:** jangan dipakai untuk teks panjang / dekorasi. Merah = sinyal (diskon, limited, error, easter-egg `666`). Kalau ragu, jangan merah.

Depth = **tonal layering + border 1px**, BUKAN shadow/blur. Hover = **inversi total** (putih↔hitam), radius **0px** di semua komponen.

---

## 3. Typography scale (asumsi Opsi A)

| Role | Font | Size (desktop) | LH | Tracking | Catatan |
|---|---|---|---|---|---|
| `display-xl` | Death Stinger | 120px | 110px | -0.02em | hero word, 1 per halaman |
| `headline-lg` | Bebas Neue | 64px | 60px | 0.02em | anchor section |
| `headline-lg-mobile` | Bebas Neue | 48px | 44px | — | |
| `headline-md` | Bebas Neue | 32px | 32px | — | judul kartu / sub |
| `accent-horror` | Creepster | 24–40px | auto | — | ⚠ pakai HEMAT |
| `body-lg` | Hanken Grotesk | 18px | 28px | — | |
| `body-md` | Hanken Grotesk | 16px | 24px | — | default |
| `label-caps` | JetBrains Mono | 12px | 16px | 0.1em | SKU, size, uppercase |
| `price` | JetBrains Mono / Bebas | 24px | 24px | — | harga |

**Font loading (siap deploy, no CLS):**
- `deathsinger` & `creepster` → self-host `.woff2` via `@font-face` + `next/font/local`. `font-display: swap`. Jangan tarik Creepster live dari Google di production (hindari FOUT + dependency) — download `.woff2`-nya, host sendiri.
- Bebas / Hanken / JetBrains → `next/font/google` (subset `latin`) ATAU self-host juga (lebih aman utk build offline). Pilih satu, konsisten.
- ⚠ **License:** verifikasi lisensi komersial Death Stinger sebelum production. Creepster = OFL (aman komersial) — tetap simpan bukti lisensi.

---

## 4. Layout & spacing (LOCKED)
- Grid: **12-col desktop / 4-col mobile**, `grid-margin: 2rem`, `gutter: 1rem`.
- Section gap besar: `section-gap: 8rem` (breathing room walau type-nya loud).
- **Brutalist border:** 1px `--outline` untuk mendefinisikan sel grid (blueprint feel).
- **Editorial overlap:** headline Bebas/Death Stinger boleh bleed / negative-margin menimpa gambar.
- Radius: **0px** mutlak. Sudut tajam = identitas.

---

## 5. Motion language (kunci anti "AI slop")
Semua animasi wajib terasa **custom & premium**. Dilarang: fade-in polos, bounce default, scale-up generik tanpa alasan.

**Easing standard project** (pakai di SEMUA komponen, jangan campur random):
```ts
// lib/motion.ts
export const EASE = {
  out:   [0.16, 1, 0.3, 1],    // expo-out — reveal, entrance
  inOut: [0.87, 0, 0.13, 1],   // expo-inOut — transisi section
  smooth:[0.25, 1, 0.5, 1],    // hover micro-interaction
} as const;

export const DUR = { fast: 0.4, base: 0.7, slow: 1.1 } as const;
```
- Lenis smooth scroll global (`lerp ~0.1`), sinkron dgn Framer Motion `useScroll`.
- Hover = inversi warna instan (duration-0) untuk button; micro-interaction lain pakai `EASE.smooth`.
- **Respect `prefers-reduced-motion`**: matikan parallax berat, scroll-lock, particle → fallback ke reveal statis. Ini wajib, bukan opsional.
- Prinsip: **satu momen orkestrasi > sepuluh efek tersebar.**

---

## 6. Components (LOCKED)
- **Button primary:** solid putih, teks hitam uppercase, radius 0, hover → invert (hitam/teks putih), no transition.
- **Button accent-666:** fill `#b60025`, teks putih — hanya untuk aksi urgensi.
- **Product card:** image-centric, divider tajam, title `label-caps`, harga `price`. Diskon → tag industrial (border 1px + mono).
- **Input:** bottom-border only 1px putih, label mono di kiri-atas.
- **Chip/Tag:** hitam fill + border putih 1px + mono ("LIMITED", "20% OFF").
- **Marquee:** strip putih/teks hitam berjalan (slogan / SALE).
- **Nav:** top-bar minimal, logo center, trigger "CATALOG" = text link + icon, gaya mono.

---

## 7. Assets terverifikasi di project
```
herosection_black.jpeg   → hero garment (varian hitam)
herosection_white.jpeg   → hero garment (varian putih)  → dipakai utk hover swap
logo_himati.png          → sponsor
logo_polihasnur.png      → sponsor
dwiscript.png            → sponsor (mark kucing hitam)
```
⚠ **`dwiscript.png`**: bentuknya mirip karakter kucing hitam yang dikenal (Jiji/Ghibli-style). Kalau ini memang IP pihak lain, pastikan ada izin sebelum production — samain diligence-nya kayak font.
⚠ **Product images belum ada** di project knowledge. Section product & halaman `/product` butuh foto produk. Media strategy: **disimpan di storage project sendiri** (ImageKit dihapus), path/URL tersimpan di DB, bukan hardcode. Untuk `ZoomParallax` → pakai image ber-flag `isPrimary` (lihat `FRONTEND.md §2.3` & `BACKEND.md`).
