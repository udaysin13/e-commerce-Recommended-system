const prisma = require("../lib/prisma");
const seedData = require("../lib/seedData");

async function main() {
  await prisma.viewHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: seedData.users,
  });

  await prisma.product.createMany({
    data: seedData.products,
  });

  for (const order of seedData.orders) {
    const product = seedData.products.find((item) => item.id === order.productId);

    if (!product) continue;

    await prisma.order.create({
      data: {
        userId: order.userId,
        status: "delivered",
        total: product.price,
        items: {
          create: {
            productId: order.productId,
            userId: order.userId,
            quantity: 1,
            price: product.price,
          },
        },
      },
    });
  }

  await prisma.viewHistory.createMany({
    data: seedData.viewHistory.map(({ id, ...view }) => view),
  });

  console.log("Database seeded successfully");
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
