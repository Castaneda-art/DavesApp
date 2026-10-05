const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersToSeed = [
    { 
      email: "admin@peluqueapp.com",
      name: "Administradora Principal", 
      password: "admin123", 
      role: "ADMINISTRADORA" 
    },
    { 
      email: "trenzas@peluqueapp.com",
      name: "Especialista en Trenzas", 
      password: "colab123", 
      role: "COLABORADORA" 
    },
    { 
      email: "estilista@peluqueapp.com",
      name: "Estilista de Apoyo", 
      password: "colab123", 
      role: "COLABORADORA" 
    }
  ];

  for (const user of usersToSeed) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    console.log(`Usuario asegurado: ${upsertedUser.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
