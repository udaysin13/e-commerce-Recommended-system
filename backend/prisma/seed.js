const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.viewHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", password: "alice123" },
      { email: "bob@example.com", password: "bob123" },
      { email: "cara@example.com", password: "cara123" },
    ],
  });

  await prisma.product.createMany({
    data: [
      { name: "iPhone 15", category: "Electronics", price: 79999 },
      { name: "Samsung Galaxy S24", category: "Electronics", price: 74999 },
      { name: "Sony WH-1000XM5", category: "Electronics", price: 24999 },
      { name: "Nike Air Max SC", category: "Fashion", price: 6999 },
      { name: "Adidas Logo T-Shirt", category: "Fashion", price: 1999 },
      { name: "Puma Track Pants", category: "Fashion", price: 2499 },
      { name: "Philips Air Fryer", category: "Home", price: 8999 },
      { name: "Prestige Fry Pan", category: "Home", price: 1499 },
      { name: "Electric Kettle", category: "Home", price: 1299 },
    ],
  });

  await prisma.order.createMany({
    data: [
      { userId: 1, productId: 1 },
      { userId: 1, productId: 3 },
      { userId: 2, productId: 1 },
      { userId: 2, productId: 2 },
      { userId: 2, productId: 3 },
      { userId: 3, productId: 4 },
      { userId: 3, productId: 5 },
    ],
  });

  await prisma.viewHistory.createMany({
    data: [
      { userId: 1, productId: 1 },
      { userId: 1, productId: 2 },
      { userId: 1, productId: 3 },
      { userId: 2, productId: 7 },
      { userId: 3, productId: 4 },
      { userId: 3, productId: 5 },
    ],
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
