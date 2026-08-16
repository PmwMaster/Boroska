const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  const existing = await prisma.user.findFirst({ where: { email: 'cristiano@ritmo.app' } });
  if (existing) {
    console.log(`👤 User already exists: ${existing.name} (${existing.email})`);
    await prisma.$disconnect();
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Cristiano Xavier',
      email: 'cristiano@ritmo.app',
    },
  });

  console.log(`✅ Created user: ${user.name} (${user.email})`);
  console.log('🏁 Seed complete — clean slate ready.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
