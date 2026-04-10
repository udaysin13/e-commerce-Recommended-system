const prisma = require("../lib/prisma");
const seedData = require("../lib/seedData");

async function main() {
  await prisma.viewHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: seedData.users.map(({ id, ...user }) => user),
  });

  await prisma.product.createMany({
    data: seedData.products.map(({ id, ...product }) => product),
  });

  await prisma.order.createMany({
    data: seedData.orders.map(({ id, ...order }) => order),
  });

  await prisma.viewHistory.createMany({
    data: seedData.viewHistory.map(({ id, ...view }) => view),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
