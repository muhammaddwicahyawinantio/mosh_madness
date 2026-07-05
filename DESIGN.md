# DESIGN.md — Mosh Madness Design System

Basis: design system dari mock statis (`code.html` / "Mosh Madness Editorial") yang sudah ada — di-port ke Next.js + Tailwind CSS variables + shadcn, lalu ditambah standar animasi & breakpoint. Aesthetic: **Dark Editorial / Minimalist Grunge** — brutalist grid, tipografi raksasa, aksen crimson "666" yang simbolik, bukan vulgar.

Referensi kualitas: Awwwards-tier / Lusion / Locomotive. Bukan template, bukan AI slop.

---

## 1. Brand & Tone
- Owner: Ilham — Banjarmasin — berdiri 16 Mei 2024.
- Personality: agresif, raw, urban, eksklusif. Kegelapan sebagai bentuk seni.
- Angka **666** dipakai simbolik-artistik: rebellion, anti-polish, energi mosh pit. Muncul lewat aksen crimson, angka/glyph di label teknis (mis. `MSH-666`, `EST. 16.05.24`), bukan lewat imagery ofensif.
- Copywriting: Bahasa Indonesia, singkat, menggigit, all-caps untuk headline.

## 2. Color Tokens
Palet dibatasi keras: hitam pekat + putih + crimson untuk urgensi/identitas.

| Token | Hex | Pakai untuk |
|---|---|---|
| `background` / `surface` | `#131313` | Canvas utama |
| `surface-container-lowest` | `#0e0e0e` | Footer, CTA cell |
| `surface-container-low` | `#1c1b1b` | Section alternatif |
| `surface-container` → `highest` | `#201f1f` → `#353534` | Card, admin panel layering |
| `on-surface` | `#e5e2e1` | Body text |
| `on-surface-variant` | `#c4c7c8` | Metadata, deskripsi sekunder |
| `outline` | `#8e9192` | Border grid 1px |
| `outline-variant` | `#444748` | Divider halus |
| `primary` | `#ffffff` | Headline, CTA utama |
| `on-primary` | `#2f3131` | Teks di atas putih |
| **`accent-666`** (`secondary-container`) | `#b60025` | Diskon, sold out, hover berbahaya, detail 666 |
| `secondary` | `#ffb3b1` | Teks di atas crimson gelap |
| `error` | `#ffb4ab` | Form error |

Implementasi: CSS variables di `globals.css` (`--background`, `--accent-666`, dst) → dipetakan ke `tailwind.config.ts` supaya kompatibel shadcn.

## 3. Typography
Via `next/font/google`, `display: swap`.

| Role | Font | Size/LH | Catatan |
|---|---|---|---|
| `display-xl` | Bebas Neue 400 | 120/110, ls -0.02em | Headline hero, boleh bleed off-edge / di belakang imagery. Mobile: clamp turun ke ~64px |
| `headline-lg` | Bebas Neue 400 | 64/60, ls 0.02em | Section title. Mobile: 48/44 |
| `headline-md` | Bebas Neue 400 | 32/32 | Sub-section, brand mark |
| `body-lg` | Hanken Grotesk 400 | 18/28 | Intro paragraf |
| `body-md` | Hanken Grotesk 400 | 16/24 | Body default |
| `label-caps` | JetBrains Mono 500 | 12/16, ls 0.1em, UPPERCASE | Nav, tag, SKU, tombol, label form |
| `price` | Bebas Neue 400 | 24/24 | Harga produk |

Bebas Neue = suara brand. JetBrains Mono = lapisan teknis/utilitarian (SKU, size, tanggal, `MSH-666`).

## 4. Spacing & Layout
- Grid: 12 kolom desktop, 4 kolom mobile. `grid-margin: 2rem`, `gutter: 1rem`.
- `section-gap: 8rem` — tipografi boleh berisik, ruang harus lega.
- **Brutalist bordering**: cell produk dipisah border 1px `outline`, blueprint grid background (garis 40px, putih 5% opacity).
- **Editorial overlap**: headline Bebas negative-margin di atas/di belakang imagery (mix-blend `overlay`/`difference`).
- Vertical text (rotate -90) untuk label section di desktop, seperti "BESTSELLER" di mock.

## 5. Shape & Depth
- **Radius 0px di semua elemen user-facing.** Tanpa shadow, tanpa blur. Hierarki dari kontras warna + tonal layering.
- Hover = **inversi warna instan** (putih↔hitam), bukan lift/shadow.
- Grain/noise overlay subtle di background (CSS/SVG turbulence, opacity rendah) untuk tekstur grunge.
- Pengecualian pragmatis: admin dashboard boleh pakai radius kecil shadcn default demi usability — admin bukan panggung brand.

## 6. Animation Standards (semua animasi WAJIB pakai ini)
Konstanta di `/lib/motion.ts` — dilarang hardcode duration/easing di komponen.

**Easing:**
- `easeBrand: [0.16, 1, 0.3, 1]` (expo-out) — entrance, reveal, expand
- `easeSharp: [0.83, 0, 0.17, 1]` — inversi/switch state, marquee-adjacent
- `linear` — marquee, ambient loop
- Hover invert: **duration 0** (cut instan, sesuai identitas brutalist)

**Duration scale:**
- `fast: 0.2s` — micro-interaction (focus ring, icon nudge)
- `base: 0.5s` — reveal elemen tunggal
- `slow: 0.9s` — hero crossfade, parallax settle, expand selector
- Stagger anak: `0.06–0.09s`

**Scroll:** Lenis (`lerp ~0.1`) + `useScroll`/`useTransform` Framer Motion untuk parallax. Reveal pattern standar: `clip-path` wipe atau translate-y 24px + fade, `easeBrand`, sekali saja (`once: true`).

**Signature moments** (di sinilah boldness dihabiskan — sisanya disiplin):
1. Hero: crossfade garment hitam↔putih mengikuti pointer + particle boids.
2. About: deep parallax zoom (scale 1 → 1.15 scroll-linked).
3. Sponsor: R3F tilt/float 3D pada logo.

**Performa & aksesibilitas (hard rules):**
- `prefers-reduced-motion` → matikan particle, 3D idle-loop, marquee auto-scroll; sisakan fade sederhana.
- Particle: canvas 2D, max ~60 partikel desktop / ~25 mobile, `requestAnimationFrame` pause saat off-viewport / tab hidden.
- R3F: `dpr={[1, 1.5]}`, `frameloop="demand"` kalau memungkinkan, lazy mount on in-view.
- Hanya animasikan `transform` & `opacity`. No layout thrash.

## 7. Breakpoints
| Nama | Min | Grid |
|---|---|---|
| mobile | 0 | 4 col, margin 1rem, display-xl → clamp 56–64px |
| `md` tablet | 768px | 8 col efektif |
| `lg` desktop | 1024px | 12 col, vertical labels aktif |
| `xl` wide | 1440px | Max content width 1600px, centered |

Semua section dites di 390 / 768 / 1024 / 1440. No horizontal overflow, ever.

## 8. Components
- **Button primary**: putih solid, teks hitam `label-caps`, radius 0, hover → transparan + border putih + teks putih (invert instan). Icon arrow `lucide-react` dengan nudge `fast`.
- **Button secondary**: border 1px putih, no fill, hover invert.
- **Product card**: image-centric, `mix-blend-screen` di atas surface gelap, divider 1px sebelum title/price, tag diskon = chip crimson `accent-666` + border 1px.
- **Chip/Tag**: industrial label — fill hitam, border putih 1px, JetBrains Mono uppercase.
- **Input**: bottom-border 1px putih saja, label `label-caps` kiri-atas, focus → border jadi `accent-666` + subtle glyph, error pakai `error`.
- **Marquee**: strip putih, teks hitam mono, border hitam atas-bawah, loop linear ~15s, pause on reduced-motion.
- **Navbar**: transparan di hero → solid saat scroll (Framer Motion), logo Bebas italic center, trigger CATALOG mono + icon.
- **Interactive selector (S3)**: card flex-grow expand `slow`+`easeBrand`, label slide+fade stagger, data dari API.

## 9. Imagery
- Foto produk/model: high-contrast, desaturated, hard-crop. No soft mask, no fade edges.
- Hero: `herosection_black.jpeg` / `herosection_white.jpeg` (sudah ada) — crossfade pair.
- Delivery via ImageKit dengan transformation params (`f-auto,q-80,w-{size}`); ukuran responsif per breakpoint.
