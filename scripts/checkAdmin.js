const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;
if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}
const prisma = globalForPrisma.__prisma;

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
  }
})();
