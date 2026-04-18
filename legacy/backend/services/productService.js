/**
 * Product Service
 * Comprehensive business logic for all product operations
 * Handles CRUD operations, filtering, search, and product analytics
 */

const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const {
  NotFoundError,
  ValidationError,
  ApiError,
} = require("../middleware/errorHandler");
const {
  calculateDiscountedPrice,
  validateProductData,
  validatePagination,
  validatePriceRange,
  sanitizeSearchQuery,
  sanitizeCategory,
} = require("../utils/validators");
const { calculateAverageRating } = require("../utils/helpers");

/**
 * Get all products with advanced filtering, search, and pagination
 */
async function getProducts(options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      minPrice = 0,
      maxPrice = Infinity,
      sort = "newest",
      inStock = null,
    } = options;

    // Validate pagination
    const { valid: paginationValid, page: validPage, limit: validLimit } = validatePagination(page, limit);
    if (!paginationValid) {
      throw new ValidationError("Invalid pagination parameters");
    }

    // Validate price range
    const { valid: priceValid, minPrice: validMinPrice, maxPrice: validMaxPrice } = validatePriceRange(
      minPrice,
      maxPrice
    );
    if (!priceValid) {
      throw new ValidationError("Invalid price range");
    }

    // Sanitize inputs
    const sanitizedSearch = sanitizeSearchQuery(search);
    const sanitizedCategory = sanitizeCategory(category);

    const skip = (validPage - 1) * validLimit;

    // Build where clause
    const where = {
      price: { gte: validMinPrice, lte: validMaxPrice },
      ...(inStock !== null && { inStock }),
      ...(sanitizedCategory && { category: { equals: sanitizedCategory, mode: "insensitive" } }),
      ...(sanitizedSearch && {
        OR: [
          { name: { contains: sanitizedSearch, mode: "insensitive" } },
          { description: { contains: sanitizedSearch, mode: "insensitive" } },
          { category: { contains: sanitizedSearch, mode: "insensitive" } },
        ],
      }),
    };

    // Determine sort order
    let orderBy = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "popularity":
        orderBy = { reviews: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Execute parallel queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: validLimit,
      }),
      prisma.product.count({ where }),
    ]);

    logger.debug("Products retrieved", {
      count: products.length,
      search: sanitizedSearch,
      sort,
    });

    return {
      items: products,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error("Error fetching products", error);
    throw new ApiError(500, "Failed to fetch products");
  }
}

/**
 * Get product by ID with calculated fields
 */
async function getProductById(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Calculate discounted price
    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

    logger.debug("Product retrieved", { productId, name: product.name });

    return {
      ...product,
      originalPrice: product.price,
      discountedPrice,
      inStock: product.inStock,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error("Error fetching product", error, { productId });
    throw new ApiError(500, "Failed to fetch product");
  }
}

/**
 * Create new product
 */
async function createProduct(productData) {
  try {
    // Validate product data
    const validation = validateProductData(productData);
    if (!validation.valid) {
      throw new ValidationError("Product validation failed", validation.errors);
    }

    const { name, category, description, price, imageUrl, discount = 0 } = productData;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        description: description?.trim(),
        price: Number(price),
        imageUrl,
        discount: Number(discount),
        inStock: productData.inStock !== false,
      },
    });

    logger.info("Product created", { productId: product.id, name: product.name });

    return product;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error("Error creating product", error);
    throw new ApiError(500, "Failed to create product");
  }
}

/**
 * Update product
 */
async function updateProduct(productId, updateData) {
  try {
    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    // Validate only the fields being updated
    if (Object.keys(updateData).length > 0) {
      const validation = validateProductData(updateData);
      if (!validation.valid) {
        throw new ValidationError("Product validation failed", validation.errors);
      }
    }

    const product = await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.category && { category: updateData.category.trim() }),
        ...(updateData.description && { description: updateData.description.trim() }),
        ...(updateData.price && { price: Number(updateData.price) }),
        ...(updateData.imageUrl && { imageUrl: updateData.imageUrl }),
        ...(updateData.discount !== undefined && { discount: Number(updateData.discount) }),
        ...(updateData.inStock !== undefined && { inStock: Boolean(updateData.inStock) }),
        ...(updateData.rating !== undefined && { rating: Number(updateData.rating) }),
        ...(updateData.reviews !== undefined && { reviews: Number(updateData.reviews) }),
      },
    });

    logger.info("Product updated", { productId });

    return product;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    logger.error("Error updating product", error, { productId });
    throw new ApiError(500, "Failed to update product");
  }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    await prisma.product.delete({
      where: { id: Number(productId) },
    });

    logger.info("Product deleted", { productId, name: product.name });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error("Error deleting product", error, { productId });
    throw new ApiError(500, "Failed to delete product");
  }
}

/**
 * Get product categories
 */
async function getCategories() {
  try {
    const categories = await prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });

    return categories.map((c) => c.category).filter(Boolean);
  } catch (error) {
    logger.error("Error fetching categories", error);
    throw new ApiError(500, "Failed to fetch categories");
  }
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
  getCategories,
  getSimilarProducts,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
};
