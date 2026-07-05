/**
 * Seed: admin pertama (dari ADMIN_EMAIL/ADMIN_PASSWORD di .env)
 * + 4 produk dummy dengan gambar placeholder.
 * Jalankan: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum di-set");
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

const DUMMY_PRODUCTS = [
  {
    title: "666 Oversized Tee — Black",
    subtitle: "Heavyweight cotton 240gsm",
    price: 189_000,
    showOnHome: true,
    sortOrder: 1,
  },
  {
    title: "666 Oversized Tee — White",
    subtitle: "Heavyweight cotton 240gsm",
    price: 189_000,
    showOnHome: true,
    sortOrder: 2,
  },
  {
    title: "Mosh Pit Hoodie",
    subtitle: "Fleece 330gsm, boxy fit",
    price: 349_000,
    showOnHome: true,
    sortOrder: 3,
  },
  {
    title: "Rebellion Cap",
    subtitle: "Embroidered glyph",
    price: 129_000,
    showOnHome: false,
    sortOrder: 4,
  },
];

async function main() {
  // --- Admin ---
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD belum di-set di .env");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });
  console.log(`✓ Admin: ${email}`);

  // --- Produk dummy (skip kalau sudah ada data) ---
  const count = await prisma.product.count();
  if (count === 0) {
    for (const p of DUMMY_PRODUCTS) {
      await prisma.product.create({
        data: {
          ...p,
          // Placeholder — diganti upload ImageKit via admin
          imageUrl: `https://placehold.co/800x1000/131313/e5e2e1?text=${encodeURIComponent(p.title)}`,
        },
      });
    }
    console.log(`✓ ${DUMMY_PRODUCTS.length} produk dummy dibuat`);
  } else {
    console.log(`• Skip produk dummy (sudah ada ${count} produk)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
