/**
 * Script dev: hash ulang password admin dan update di DB.
 * Jalankan: node scripts/hashAdminPassword.js
 *
 * Catatan: script ini CJS dan tidak bisa import ESM lib/prisma.ts langsung.
 * Menggunakan PrismaClient langsung aman untuk script CLI one-shot
 * (bukan server — tidak ada pool leak karena proses langsung exit).
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[hashAdminPassword] ERROR: DATABASE_URL belum di-set di environment');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ['error'],
});

(async () => {
  try {
    const email = 'admin@moshmadness.id';
    const plain = 'ilham666';
    const hash = await bcrypt.hash(plain, 12);
    const updated = await prisma.adminUser.update({ where: { email }, data: { passwordHash: hash } });
    console.log('UPDATED', updated.id);
    console.log('newHash:', hash);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
