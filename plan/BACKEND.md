# BACKEND.md — Mosh Madness

> Stack: MySQL + Prisma ORM + Next.js route handlers + NextAuth v5.
> **Constraint keras (jangan diubah):** Prisma mode **`queryCompiler` + `driverAdapters` (engine-free)**. Routing pakai **`proxy.ts`** (bukan `middleware.ts`, Next 16).
> **Media: ImageKit DIHAPUS.** Semua upload disimpan di **storage project sendiri** (lihat §3).
> **Admin = CMS penuh:** hampir semua bagian dinamis di web bisa di-CRUD dari `/admin`, bukan cuma produk.

---

## 1. Clean code standard
- TS strict, no `any` liar. Tipe/DTO di `/types`.
- API route tipis (zod validate + panggil service). Logika DB di `/lib/services/*`.
- Error seragam: `apiError(status, code, message)` → `{ error: { code, message } }`.
- Prisma = lazy singleton engine-free (`lib/prisma.ts`).

---

## 2. Model konten yang bisa di-CRUD dari admin (jawaban "product kayak misal 1, hero 2-image, logo, dll")

| # | Bagian web | Model | Yang bisa di-CRUD dari admin |
|---|---|---|---|
| 1 | **Product** (home bestseller, /product, parallax) | `Product` + `ProductImage` | tambah/edit/hapus produk, harga, diskon, kategori, status, multi-image, set primary, reorder, toggle `showInHome` & `showInParallax` |
| 2 | **Hero section** (2 image swap hitam/putih) | `HeroMedia` | tambah/ganti/hapus image hero per varian (BLACK/WHITE), reorder, aktif/nonaktif |
| 3 | **Sponsor / logo** (himati, polihasnur, dwiscript) | `Sponsor` | tambah/edit/hapus logo, nama, link, urutan, aktif/nonaktif |
| 4 | **Teks section** (hero word, about writer, marquee, contact info) | `SiteContent` | edit teks per key |
| 5 | **Contact message** (dari form /contact) | `ContactMessage` | lihat, tandai handled, hapus |
| 6 | **Media library** (semua file upload) | `MediaAsset` | lihat, hapus, ganti alt |

---

## 3. Media strategy (pengganti ImageKit)

Karena ImageKit dihapus: **apapun yang di-upload masuk ke storage project**.
- Upload disimpan ke direktori `UPLOAD_DIR` (default dev: `./storage/uploads`), diserve app lewat route `GET /media/[...path]` (atau static). Metadata masuk tabel `MediaAsset`.
- Saat upload: opsional konversi ke `webp` + ambil width/height (pakai `sharp`) biar ringan & konsisten.
- Delete media = hapus row DB **dan** file fisik.
- `next.config` `images` → allow domain sendiri / unoptimized loader utk `/media`.

⚠ **PENTING — Railway (aturan no.7):** filesystem container itu **ephemeral**. Kalau upload cuma ke `./storage`, semua gambar **HILANG tiap redeploy/restart**. Solusi (pilih satu):
- **(Rekomendasi) Railway Volume**: mount volume persistent ke `UPLOAD_DIR` → file aman lintas deploy. Paling dekat dengan maksud "masuk ke project" & tanpa CDN eksternal.
- Simpan file sebagai blob di MySQL (`LONGBLOB`) → simple tapi DB membengkak, tidak ideal utk banyak/berat.
👉 Konfirmasi: pakai **Railway Volume**? (default asumsiku: ya.)

---

## 4. Prisma schema (extend dari existing: Product, VisitLog, AdminUser)

```prisma
// ---------- MEDIA (storage project sendiri) ----------
model MediaAsset {
  id        String   @id @default(cuid())
  key       String   @unique          // path di storage, mis. "2026/uuid.webp"
  url       String                     // URL publik diserve app, mis. "/media/2026/uuid.webp"
  alt       String   @default("")
  mime      String
  width     Int?
  height    Int?
  size      Int                        // bytes
  createdAt DateTime @default(now())

  productImages ProductImage[]
  heroMedia     HeroMedia[]
  sponsors      Sponsor[]
}

// ---------- PRODUCT ----------
model Product {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String        @db.Text
  price       Int                        // satuan terkecil, hindari float
  compareAt   Int?                        // harga coret
  currency    String        @default("IDR")
  category    String?
  status      ProductStatus @default(DRAFT)

  showInHome     Boolean @default(false)  // muncul di bestseller/home
  showInParallax Boolean @default(false)  // masuk ZoomParallax (max 7 dijaga di API)

  images    ProductImage[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, showInHome])
  @@index([status, showInParallax])
}

model ProductImage {
  id        String     @id @default(cuid())
  productId String
  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  mediaId   String
  media     MediaAsset @relation(fields: [mediaId], references: [id])
  isPrimary Boolean    @default(false)    // "varian utama" → dipakai parallax
  sort      Int        @default(0)

  @@index([productId, isPrimary])
  @@index([productId, sort])
}

enum ProductStatus { DRAFT PUBLISHED ARCHIVED }

// ---------- HERO (2-image swap) ----------
model HeroMedia {
  id      String      @id @default(cuid())
  variant HeroVariant                     // BLACK / WHITE
  mediaId String
  media   MediaAsset  @relation(fields: [mediaId], references: [id])
  sort    Int         @default(0)
  active  Boolean     @default(true)

  @@index([variant, active])
}

enum HeroVariant { BLACK WHITE }

// ---------- SPONSOR / LOGO ----------
model Sponsor {
  id      String     @id @default(cuid())
  name    String
  mediaId String
  media   MediaAsset @relation(fields: [mediaId], references: [id])
  link    String?
  sort    Int        @default(0)
  active  Boolean    @default(true)

  @@index([active, sort])
}

// ---------- TEKS SECTION (editable copy) ----------
model SiteContent {
  id        String   @id @default(cuid())
  key       String   @unique             // "hero.word", "about.writer", "marquee.about", "contact.address", ...
  value     String   @db.Text
  updatedAt DateTime @updatedAt
}

// ---------- CONTACT ----------
model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String?
  message   String   @db.Text
  handled   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([handled, createdAt])
}
```
- Ubah schema → `npx prisma migrate dev --name <nama>` (dev) / `migrate deploy` (prod). Aku kabari tiap schema berubah.

### Seed (biar web nggak kosong sebelum admin dipakai)
- `SiteContent` default (hero word, about text, marquee, contact info).
- `HeroMedia` dari `herosection_black.jpeg` (BLACK) + `herosection_white.jpeg` (WHITE).
- `Sponsor` dari 3 logo di `public/assets/sponsor/`.
- **Product** dari file statis `public/assets/products/` (upload manual Ilham). Grouping TEBAKAN (⚠ konfirmasi nama & isi harga via `/admin`):

| Produk (sementara) | Images (`isPrimary` = ⭐) | parallax? |
|---|---|---|
| 1312! | ⭐1312!.jpg, 1312!1.jpg | ya |
| Borneo Guardians | ⭐borneoguardians.jpg, …1.jpg, …2.jpg | ya |
| Burutality | ⭐burutality1.jpg, burutality2.jpg | ya |
| Sacred | ⭐sacred1.jpg, sacred2.jpg | ya |
| Sinister | ⭐sinister1.jpg, sinister2.jpg | ya |
| Spokelse | ⭐spokelse.jpg, spokelse2.jpg | ya |
| Rajajin | ⭐rajajin.jpg | ya (genap 7) |
| The Addict Skull | ⭐theaddictskull.jpg | tidak |
| Turmoil | ⭐turmoil.jpg | tidak |

  → `ProductImage.url` = path statis (mis. `/assets/products/borneoguardians.jpg`) via `MediaAsset` bertipe "static". `showInParallax=true` untuk 7 produk pertama (max 7). Harga = placeholder (0/TBD), status DRAFT sampai Ilham isi.

### Video (kiri.mp4 / kanan.mp4)
- Statis di `public/assets/videos/`, dipakai `VideoCards` (sponsor & /contact). **Tidak perlu CRUD** — cukup path di `SiteContent` (`video.kiri`, `video.kanan`) kalau mau bisa diganti dari admin; kalau tidak, refer langsung. (ponytail: jangan bikin CRUD video kalau belum dibutuhkan.)
- Video About (`vidsectionabout.mp4`) & `about-section.png` ⚠ belum ada — tunggu upload Ilham.

---

## 5. API routes

**Public (read-only):**
- `GET /api/products` — published; `?home=1`, `?parallax=1` (max 7, hanya `isPrimary`, dijaga di server), `?category=`.
- `GET /api/products/[slug]` — detail + semua image.
- `GET /api/hero` — hero media aktif (BLACK & WHITE).
- `GET /api/sponsors` — sponsor aktif, terurut.
- `GET /api/content?keys=hero.word,about.writer` — teks section.
- `POST /api/contact` — simpan `ContactMessage` (+ honeypot & rate-limit sederhana).
- `GET /api/health` — pertahankan. Visit tracking privacy-safe — pertahankan.
- `GET /media/[...path]` — serve file dari storage.

**Admin (protected, guard di `proxy.ts`):**
- `POST /api/admin/upload` — terima file → simpan storage → buat `MediaAsset`.
- `products`: `GET/POST /api/admin/products`, `GET/PATCH/DELETE /api/admin/products/[id]` (termasuk toggle showInHome/showInParallax/status).
- `product images`: `POST /api/admin/products/[id]/images`, `PATCH/DELETE .../images/[imageId]` (reorder, set primary, delete).
- `hero`: `GET/POST /api/admin/hero`, `PATCH/DELETE /api/admin/hero/[id]`.
- `sponsors`: `GET/POST /api/admin/sponsors`, `PATCH/DELETE /api/admin/sponsors/[id]`.
- `content`: `GET /api/admin/content`, `PATCH /api/admin/content/[key]`.
- `messages`: `GET /api/admin/messages`, `PATCH/DELETE /api/admin/messages/[id]`.
- `media`: `GET /api/admin/media`, `DELETE /api/admin/media/[id]` (hapus DB + file).
- `analytics`: `GET /api/admin/analytics` (30-day) — pertahankan.

Semua admin route: cek session server-side + zod validate. Toggle/flag jangan dipercaya dari client tanpa auth.

---

## 6. Halaman `/admin`
Route `/admin`, guard `proxy.ts` (no session → `/admin/login`).
- `/admin` — **Dashboard**: total produk, published, visits 30 hari, pesan contact belum handled, chart ringkas (SWR polling).
- `/admin/products` (+ `/new`, `/[id]`) — tabel CRUD + **image manager** (drag-drop upload, reorder `sort`, set `isPrimary`, delete DB+file, `alt` wajib).
- `/admin/hero` — kelola 2 image swap (BLACK/WHITE), upload/ganti/hapus, aktif/nonaktif.
- `/admin/sponsors` — CRUD logo (nama, link, urutan, aktif).
- `/admin/content` — form edit teks section (hero word, about writer, marquee, contact info).
- `/admin/messages` — daftar contact, tandai handled.
- `/admin/media` — library semua upload.

UI admin fungsional & rapi (reuse shadcn/ui), tetap dark. Boleh kurang "editorial" dari front-of-house.

---

## 7. Auth (NextAuth v5)
- Split config existing `auth.config.ts` + `auth.ts` — pertahankan.
- Credentials provider (password hashed). `proxy.ts` proteksi `/admin/**` & `/api/admin/**`.

---

## 8. Docker → Railway
- **`Dockerfile`** multi-stage: `deps` → `builder` (`next build`, `output: 'standalone'`, `prisma generate` tanpa engine download) → `runner` (node slim, non-root).
- **`.dockerignore`**, `next.config` `output:'standalone'`.
- **Railway**: MySQL plugin → `DATABASE_URL`. `prisma migrate deploy` saat release. Healthcheck `/api/health`.
- **Volume**: mount Railway Volume ke `UPLOAD_DIR` (lihat §3) supaya upload persist.

**ENV (isi manual):**
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
UPLOAD_DIR=/data/uploads        # arahkan ke mount volume di Railway
# (opsional) RESEND_API_KEY=    # kalau nanti mau notif email contact
```
(ImageKit ENV dihapus.)

---

## 9. Definition of Done
✅ `tsc --noEmit` + `build` + `lint` bersih · ✅ semua konten (product/hero/sponsor/teks) dari DB, bukan hardcode · ✅ admin route ter-guard · ✅ upload sinkron DB↔storage & delete bersih · ✅ Docker build lokal sukses · ✅ upload persist di Railway (volume) · ✅ tidak ada Prisma engine download saat build.
