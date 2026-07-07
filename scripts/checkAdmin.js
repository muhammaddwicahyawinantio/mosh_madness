const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const p = new PrismaClient();
  try {
    const u = await p.adminUser.findUnique({ where: { email: 'admin@moshmadness.id' } });
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
  } finally {
    await p.$disconnect();
  }
})();
