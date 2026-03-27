require("dotenv").config()

const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} must be set before running the seed script.`)
  }
  return value
}

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  console.log("Seeding database...")

  // Seed categories and products from JSON.
  const productsFile = path.join(__dirname, "..", "data", "products.json")
  const productsJson = JSON.parse(fs.readFileSync(productsFile, "utf8"))

  const categoriesByName = new Map()

  for (const item of productsJson) {
    const categoryName = item.category?.trim() || "Uncategorized"
    if (!categoriesByName.has(categoryName)) {
      const slug = slugify(categoryName)
      const category = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name: categoryName, slug },
      })
      categoriesByName.set(categoryName, category)
    }
  }

  for (const item of productsJson) {
    const category = categoriesByName.get(item.category?.trim() || "Uncategorized")
    const name = item.name?.trim() || `Product ${item.id}`
    const slug = slugify(name)

    await prisma.product.upsert({
      where: { slug },
      update: {
        kind: item.kind,
        image: item.image,
        price: item.price,
        inStock: 50,
        description: item.kind ? `A great ${item.kind} from ${item.category}.` : undefined,
        categoryId: category.id,
      },
      create: {
        name,
        slug,
        kind: item.kind,
        image: item.image,
        price: item.price,
        inStock: 50,
        description: item.kind ? `A great ${item.kind} from ${item.category}.` : undefined,
        categoryId: category.id,
      },
    })
  }

  // Create admin user from environment variables.
  const adminUsername = requireEnv("ADMIN_USERNAME")
  const adminPassword = requireEnv("ADMIN_PASSWORD")
  const demoUserName = process.env.DEMO_USER_NAME?.trim()
  const demoUserEmail = process.env.DEMO_USER_EMAIL?.trim().toLowerCase()
  const demoUserPassword = process.env.DEMO_USER_PASSWORD?.trim()

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: `${adminUsername}@example.com` },
    update: {
      name: adminUsername,
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: adminUsername,
      email: `${adminUsername}@example.com`,
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  })

  if (demoUserName && demoUserEmail && demoUserPassword) {
    const demoUserPasswordHash = await bcrypt.hash(demoUserPassword, 10)

    await prisma.user.upsert({
      where: { email: demoUserEmail },
      update: {
        name: demoUserName,
        passwordHash: demoUserPasswordHash,
        role: "USER",
      },
      create: {
        name: demoUserName,
        email: demoUserEmail,
        passwordHash: demoUserPasswordHash,
        role: "USER",
      },
    })
  }

  console.log("✅ Database seeded successfully.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
