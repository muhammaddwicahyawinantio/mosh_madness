/**
 * Script dev: cek apakah admin user ada di DB dan verifikasi password.
 * Jalankan: node scripts/checkAdmin.js
 *
 * Catatan: script ini CJS dan tidak bisa import ESM lib/prisma.ts langsung.
 * Menggunakan PrismaClient langsung aman untuk script CLI one-shot
 * (bukan server — tidak ada pool leak karena proses langsung exit).
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[checkAdmin] ERROR: DATABASE_URL belum di-set di environment');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ['error'],
});

(async () => {
  try {
    const u = await prisma.adminUser.findUnique({ where: { email: 'admin@moshmadness.id' } });
    if (!u) {
      console.log('NOT_FOUND');
      return;
    }
    console.log('FOUND');
    console.log('id:', u.id);
    console.log('email:', u.email);
    console.log('passwordHash:', u.passwordHash);
    const ok = await bcrypt.compare('ilham666', u.passwordHash);
    console.log('match:', ok);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
