const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const p = new PrismaClient();
  try {
    const email = 'admin@moshmadness.id';
    const plain = 'ilham666';
    const hash = await bcrypt.hash(plain, 12);
    const updated = await p.adminUser.update({ where: { email }, data: { passwordHash: hash } });
    console.log('UPDATED', updated.id);
    console.log('newHash:', hash);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
})();
