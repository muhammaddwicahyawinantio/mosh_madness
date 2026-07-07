const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;
if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}
const prisma = globalForPrisma.__prisma;

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
  }
})();
