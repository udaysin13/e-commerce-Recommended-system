const prisma = require("../lib/prisma");
const seedData = require("../lib/seedData");

function toUserSeed(user) {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name || null,
    phone: user.phone || null,
  };
}

function toProductSeed(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    discount: product.discount || 0,
    imageUrl: product.imageUrl,
    rating: product.rating || 0,
    reviews: product.reviews || product.reviewCount || 0,
    inStock: product.inStock !== false,
  };
}

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.viewHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleaned");

  // Create users with their specific IDs
  console.log(`\n👥 Creating ${seedData.users.length} users...`);
  let userCount = 0;
  for (const user of seedData.users) {
    try {
      await prisma.user.create({ data: toUserSeed(user) });
      userCount++;
    } catch (err) {
      console.error(`❌ Failed to create user ${user.id}:`, err.message);
    }
  }
  console.log(`✅ Created ${userCount}/${seedData.users.length} users`);

  // Keep seed product IDs stable so orders and view history point to the right rows.
  console.log(`\n📦 Creating ${seedData.products.length} products...`);
  let productCount = 0;
  for (const product of seedData.products) {
    try {
      await prisma.product.create({ data: toProductSeed(product) });
      productCount++;
      if (productCount % 10 === 0) {
        console.log(`   Created ${productCount}/${seedData.products.length} products...`);
      }
    } catch (err) {
      console.error(`❌ Failed to create product:`, err.message.substring(0, 100));
    }
  }
  console.log(`✅ Created ${productCount}/${seedData.products.length} products`);

  console.log(`\n📋 Creating ${seedData.orders.length} orders...`);
  let orderCount = 0;
  for (const seedOrder of seedData.orders) {
    try {
      const product = seedData.products.find(
        (item) => item.id === seedOrder.productId
      );

      if (!product) continue;

      await prisma.order.create({
        data: {
          userId: seedOrder.userId,
          status: "delivered",
          total: product.price,
          items: {
            create: {
              productId: seedOrder.productId,
              userId: seedOrder.userId,
              quantity: 1,
              price: product.price,
            },
          },
        },
      });
      orderCount++;
    } catch (err) {
      console.error(`❌ Failed to create order:`, err.message);
    }
  }
  console.log(`✅ Created ${orderCount}/${seedData.orders.length} orders`);

  console.log(`\n👁️ Creating view history...`);
  try {
    await prisma.viewHistory.createMany({
      data: seedData.viewHistory.map(({ id, ...view }) => view),
    });
    console.log(`✅ Created view history records`);
  } catch (err) {
    console.error(`❌ Failed to create view history:`, err.message);
  }
}

main()
  .then(async () => {
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    console.log(`\n✅ Seeding complete! Database has ${userCount} users and ${productCount} products`);
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
