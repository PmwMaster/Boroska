const { prisma } = require('./prisma');

async function getUserId() {
  const user = await prisma.user.findFirst({ select: { id: true } });
  return user?.id;
}

module.exports = { getUserId };
