/**
 * Product Service
 * Business logic for product operations
 */

const prisma = require("../lib/prisma");
const { ApiError } = require("../middleware/errorHandler");

/**
 * Get all products with pagination and filtering
 */
async function getProducts(options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    minPrice = 0,
    maxPrice = Infinity,
    sort = "newest",
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && { category }),
    price: { gte: minPrice, lte: maxPrice },
  };

  // Determine sort order
  let orderBy = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "rating") {
    orderBy = { rating: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get product by ID
 */
async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
}

/**
 * Create new product
 */
async function createProduct(productData) {
  const { name, category, description, price, imageUrl } = productData;

  const product = await prisma.product.create({
    data: {
      name,
      category,
      description,
      price,
      imageUrl,
    },
  });

  return product;
}

/**
 * Update product
 */
async function updateProduct(productId, updateData) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: updateData,
  });

  return product;
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  await prisma.product.delete({
    where: { id: productId },
  });

  return { message: "Product deleted successfully" };
}

/**
 * Get similar products (same category)
 */
async function getSimilarProducts(productId, limit = 4) {
  const product = await getProductById(productId);

  const similar = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: productId },
    },
    take: limit,
  });

  return similar;
}

/**
 * Get products by category
 */
async function getProductsByCategory(category, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { category },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { category } }),
  ]);

  return {
    items: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get featured/top rated products
 */
async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { rating: "desc" },
    take: limit,
  });

  return products;
}

/**
 * Search products
 */
async function searchProducts(query, options = {}) {
  return getProducts({
    ...options,
    search: query,
  });
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
};
