import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { Prisma } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

type DatasetProduct = {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  category: string;
  brand: string;
  rating: string;
  stockQuantity: number;
  imageUrl: string;
  attributes: Record<string, unknown>;
};

const dataDir = path.resolve(process.cwd(), "prisma/data");
const LOCAL_SEED_PASSWORD = "Password123!";
const PASSWORD_SALT_ROUNDS = 12;

const userSeed = [
  {
    id: "user-admin",
    email: "admin@recomcart.dev",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN" as const,
  },
  {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "CUSTOMER" as const,
  },
  {
    id: "user-2",
    email: "alan@example.com",
    firstName: "Alan",
    lastName: "Turing",
    role: "CUSTOMER" as const,
  },
  {
    id: "user-3",
    email: "grace@example.com",
    firstName: "Grace",
    lastName: "Hopper",
    role: "CUSTOMER" as const,
  },
  {
    id: "user-4",
    email: "katherine@example.com",
    firstName: "Katherine",
    lastName: "Johnson",
    role: "CUSTOMER" as const,
  },
];

const categorySeed = [
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Official-brand audio, charging, and entertainment devices.",
  },
  {
    id: "cat-fashion",
    name: "Fashion",
    slug: "fashion",
    description: "Modern apparel variants with source-verified product imagery.",
  },
  {
    id: "cat-footwear",
    name: "Footwear",
    slug: "footwear",
    description: "Casual and performance shoes from official brand catalogs.",
  },
  {
    id: "cat-home-kitchen",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Kitchenware, tableware, and home essentials with exact merchandising photos.",
  },
  {
    id: "cat-beauty",
    name: "Beauty",
    slug: "beauty",
    description: "Beauty products and shades matched to exact brand imagery.",
  },
  {
    id: "cat-sports-fitness",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Workout, pilates, and recovery gear sourced from official product feeds.",
  },
  {
    id: "cat-books",
    name: "Books",
    slug: "books",
    description: "Book catalog entries using Open Library cover images by ISBN.",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Wallets, keycases, tools, and daily-carry accessories.",
  },
];

const readJson = <T>(filename: string): T =>
  JSON.parse(fs.readFileSync(path.join(dataDir, filename), "utf8")) as T;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const skuFor = (categorySlug: string, index: number) =>
  `${categorySlug.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(4, "0")}`;

const validateDataset = (products: DatasetProduct[]) => {
  const names = new Set<string>();
  const images = new Set<string>();
  const counts = new Map<string, number>();
  const validCategories = new Set(categorySeed.map((category) => category.name));

  for (const product of products) {
    if (!validCategories.has(product.category)) {
      throw new Error(`Unknown category in dataset: ${product.category}`);
    }

    if (names.has(product.name)) {
      throw new Error(`Duplicate product name found: ${product.name}`);
    }
    names.add(product.name);

    if (images.has(product.imageUrl)) {
      throw new Error(`Duplicate image URL found: ${product.imageUrl}`);
    }
    images.add(product.imageUrl);

    const rating = Number(product.rating);
    if (Number.isNaN(rating) || rating < 3.5 || rating > 5) {
      throw new Error(`Invalid rating for ${product.name}: ${product.rating}`);
    }

    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  for (const category of categorySeed) {
    const count = counts.get(category.name) ?? 0;
    if (count < 15 || count > 20) {
      throw new Error(`Category ${category.name} has invalid count ${count}`);
    }
  }

  return {
    counts: Object.fromEntries(counts),
    uniqueNames: names.size,
    uniqueImages: images.size,
  };
};

async function resetDatabase() {
  await prisma.recommendationCache.deleteMany();
  await prisma.productInteraction.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderTrackingHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(LOCAL_SEED_PASSWORD, PASSWORD_SALT_ROUNDS);

  await prisma.user.createMany({
    data: userSeed.map((user) => ({
      ...user,
      passwordHash,
      isActive: true,
    })),
  });
}

async function seedCategories() {
  await prisma.category.createMany({
    data: categorySeed.map((category) => ({
      ...category,
      isActive: true,
    })),
  });
}

async function seedProducts(products: DatasetProduct[]) {
  const categoryIdByName = new Map(categorySeed.map((category) => [category.name, category.id]));
  const categoryIndex = new Map<string, number>();

  await prisma.product.createMany({
    data: products.map((product, index) => {
      const category = categorySeed.find((item) => item.name === product.category);
      const categoryId = categoryIdByName.get(product.category);

      if (!category || !categoryId) {
        throw new Error(`Missing category mapping for ${product.category}`);
      }

      const currentIndex = categoryIndex.get(product.category) ?? 0;
      categoryIndex.set(product.category, currentIndex + 1);

      const compareAtPrice =
        currentIndex % 3 === 0 ? (Number(product.price) * 1.15).toFixed(2) : null;

      return {
        categoryId,
        name: product.name,
        slug: slugify(product.name),
        sku: skuFor(category.slug, currentIndex),
        description: product.description,
        shortDescription: product.shortDescription,
        brand: product.brand,
        price: product.price,
        compareAtPrice,
        currency: "USD",
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        imageUrls: [product.imageUrl],
        tags: [category.slug, slugify(product.brand)],
        attributes: product.attributes as Prisma.InputJsonValue,
        averageRating: Number(product.rating).toFixed(2),
        ratingCount: 36 + ((index * 11) % 420),
        viewCount: 180 + index * 37,
        clickCount: 48 + ((index * 13) % 260),
        cartCount: 18 + ((index * 7) % 180),
        purchaseCount: 24 + ((index * 9) % 160),
        isFeatured: currentIndex < 3,
        isActive: true,
      };
    }),
  });
}

async function main() {
  const products = readJson<DatasetProduct[]>("products.json");
  const validationReport = readJson<Record<string, unknown>>("validation-report.json");
  const validation = validateDataset(products);

  await resetDatabase();
  await seedUsers();
  await seedCategories();
  await seedProducts(products);

  console.log("Seed complete.");
  console.log(`Users inserted: ${userSeed.length}`);
  console.log(`Local seed password: ${LOCAL_SEED_PASSWORD}`);
  console.log(`Products inserted: ${products.length}`);
  console.log(`Unique image URLs: ${validation.uniqueImages}`);
  console.log("Products per category:");
  for (const [category, count] of Object.entries(validation.counts)) {
    console.log(`  ${category}: ${count}`);
  }
  console.log(
    `Validation report: ${path.join(dataDir, "validation-report.json")}`,
  );
  console.log(
    `Rejected image candidates logged: ${Array.isArray(validationReport.rejected) ? validationReport.rejected.length : 0}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
