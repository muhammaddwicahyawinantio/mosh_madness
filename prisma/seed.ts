/**
 * Seed P4 (BACKEND.md §4) — biar web tidak kosong sebelum admin dipakai:
 * - Admin pertama (ADMIN_EMAIL/ADMIN_PASSWORD di .env)
 * - MediaAsset "static" untuk asset yang sudah ada di /public
 * - Product + ProductImage (grouping varian, 7 pertama masuk parallax)
 * - HeroMedia BLACK/WHITE, Sponsor 3 logo, SiteContent default
 * Idempotent: upsert by unique key — aman dijalankan berulang.
 * Jalankan: npx prisma db seed
 */
import { statSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum di-set");
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

// ---------- Static media ----------

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Upsert MediaAsset untuk file statis di /public — url langsung /assets/… */
async function upsertStaticAsset(rel: string, alt: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", rel);
  const size = statSync(filePath).size; // throw kalau file hilang — fail fast
  const mime = MIME_BY_EXT[path.extname(rel).toLowerCase()] ?? "application/octet-stream";
  const asset = await prisma.mediaAsset.upsert({
    where: { key: `static/${rel}` },
    update: { size, mime },
    create: { key: `static/${rel}`, url: `/${rel}`, alt, mime, size },
  });
  return asset.id;
}

// ---------- Data ----------

/**
 * Grouping varian = tebakan BACKEND.md §4 (⚠ konfirmasi Ilham via /admin).
 * Harga & deskripsi dibawa dari seed lama yang sudah tampil di web.
 * Image pertama = isPrimary (dipakai parallax & kartu).
 */
const PRODUCTS = [
  { name: "1312!", slug: "1312", price: 179_000, description: "Oversized tee — heavyweight cotton 240gsm", images: ["1312!.jpg", "1312!1.jpg"], parallax: true },
  { name: "Borneo Guardians", slug: "borneo-guardians", price: 189_000, description: "Oversized tee — front & back print", images: ["borneoguardians.jpg", "borneoguardians1.jpg", "borneoguardians2.jpg"], parallax: true },
  { name: "Burutality", slug: "burutality", price: 189_000, description: "Oversized tee — front & back print", images: ["burutality1.jpg", "burutality2.jpg"], parallax: true },
  { name: "Sacred", slug: "sacred", price: 185_000, description: "Oversized tee — heavyweight cotton 240gsm", images: ["sacred1.jpg", "sacred2.jpg"], parallax: true },
  { name: "Sinister", slug: "sinister", price: 175_000, description: "Oversized tee — heavyweight cotton 240gsm", images: ["sinister1.jpg", "sinister2.jpg"], parallax: true },
  { name: "Spøkelse", slug: "spokelse", price: 199_000, description: "Oversized tee — glow pigment print", images: ["spokelse.jpg", "spokelse2.jpg"], parallax: true },
  { name: "Rajajin", slug: "rajajin", price: 185_000, description: "Oversized tee — puff print", images: ["rajajin.jpg"], parallax: true },
  { name: "The Addict Skull", slug: "the-addict-skull", price: 179_000, description: "Oversized tee — discharge print", images: ["theaddictskull.jpg"], parallax: false },
  { name: "Turmoil", slug: "turmoil", price: 195_000, description: "Oversized tee — washed black", images: ["turmoil.jpg"], parallax: false },
];

const SPONSORS = [
  { name: "HIMATI", file: "logo_himati.png", sort: 0 },
  { name: "Politeknik Hasnur", file: "logo_polihasnur.png", sort: 1 },
  { name: "Dwiscript", file: "dwiscript.png", sort: 2 },
];

/** Teks default section — editable via /admin/content. */
const SITE_CONTENT: Record<string, string> = {
  "hero.word": "MOSH MADNESS",
  "about.writer":
    "Mosh Madness berdiri 16 Mei 2024 di Banjarmasin, Kalimantan Selatan — dibangun Ilham dari keringat barisan depan panggung. Bukan sekadar pakaian: ini seragam untuk mereka yang menolak jinak.\n\nAngka 666 di label kami bukan provokasi murahan. Ia simbol perlawanan — anti-polish, anti-seragam, energi mentah yang tidak minta izin. Kegelapan kami rawat sebagai bentuk seni.",
  "marquee.about": "MOSH MADNESS — EST. 16.05.24 — MSH-666",
  "marquee.product": "Kegelapan sebagai bentuk seni — 666",
  "marquee.contact": "Bicara sama kami — MOSH MADNESS — Banjarmasin",
  "contact.address": "Banjarmasin, Kalimantan Selatan",
  // TODO(Ilham): ganti WA/IG asli via /admin/content
  "contact.whatsapp": "https://wa.me/6281234567890",
  "contact.instagram": "https://instagram.com/moshmadness",
};

// ---------- Main ----------

async function main() {
  // Admin
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD belum di-set di .env");
  }
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✓ Admin: ${email}`);

  // Products + images (skip yang sudah ada — jangan timpa edit admin)
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`• Skip produk "${p.name}" (sudah ada)`);
      continue;
    }
    const mediaIds: string[] = [];
    for (const file of p.images) {
      mediaIds.push(
        await upsertStaticAsset(`assets/products/${file}`, `${p.name} — Mosh Madness`),
      );
    }
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        status: "PUBLISHED",
        showInHome: true,
        showInParallax: p.parallax,
        images: {
          create: mediaIds.map((mediaId, i) => ({
            mediaId,
            isPrimary: i === 0,
            sort: i,
          })),
        },
      },
    });
    console.log(`✓ Produk: ${p.name} (${p.images.length} image)`);
  }

  // Hero 2-image swap
  if ((await prisma.heroMedia.count()) === 0) {
    const black = await upsertStaticAsset(
      "assets/hero/hero-black.jpeg",
      "Mosh Madness garment — varian hitam",
    );
    const white = await upsertStaticAsset(
      "assets/hero/hero-white.jpeg",
      "Mosh Madness garment — varian putih",
    );
    await prisma.heroMedia.createMany({
      data: [
        { variant: "BLACK", mediaId: black },
        { variant: "WHITE", mediaId: white },
      ],
    });
    console.log("✓ Hero media BLACK/WHITE");
  } else {
    console.log("• Skip hero media (sudah ada)");
  }

  // Sponsors
  if ((await prisma.sponsor.count()) === 0) {
    for (const s of SPONSORS) {
      const mediaId = await upsertStaticAsset(
        `assets/sponsor/${s.file}`,
        `Logo ${s.name}`,
      );
      await prisma.sponsor.create({ data: { name: s.name, mediaId, sort: s.sort } });
    }
    console.log(`✓ ${SPONSORS.length} sponsor`);
  } else {
    console.log("• Skip sponsor (sudah ada)");
  }

  // SiteContent — create-only (update {} = jangan timpa edit admin)
  for (const [key, value] of Object.entries(SITE_CONTENT)) {
    await prisma.siteContent.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`✓ ${Object.keys(SITE_CONTENT).length} site content key`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
