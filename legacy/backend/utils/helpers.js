/**
 * Common Utility Functions
 * Helper functions used across the application
 */

const logger = require("./logger");

/**
 * Calculate similarity score between two products
 * Based on: category match, price range, ratings
 */
function calculateProductSimilarity(product1, product2) {
  let score = 0;

  // Category match (40% weight)
  if (product1.category === product2.category) {
    score += 40;
  }

  // Price range similarity (30% weight)
  const priceDiff = Math.abs(product1.price - product2.price);
  const maxPrice = Math.max(product1.price, product2.price);
  const priceSimilarity = Math.max(0, 1 - priceDiff / (maxPrice || 1));
  score += priceSimilarity * 30;

  // Rating similarity (20% weight)
  const ratingDiff = Math.abs(product1.rating - product2.rating);
  const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5);
  score += ratingSimilarity * 20;

  // Popularity (10% weight)
  const maxReviews = Math.max(product1.reviews, product2.reviews) || 1;
  const reviewSimilarity = Math.min(product1.reviews, product2.reviews) / maxReviews;
  score += reviewSimilarity * 10;

  return Math.round(score);
}

/**
 * Calculate collaborative filtering score
 * Higher score if more similar users bought this product
 */
function calculateCollaborativeScore(purchaseCount, totalPurchases) {
  if (totalPurchases === 0) return 0;

  // Normalize to 0-100
  const baseScore = (purchaseCount / totalPurchases) * 100;

  // Boost with purchase frequency (diminishing returns)
  const frequencyBoost = Math.log(purchaseCount + 1) * 5;

  return Math.round(Math.min(100, baseScore + frequencyBoost));
}

/**
 * Calculate co-purchase confidence
 * Probability that customers who bought product A also bought B
 */
function calculateCoPurchaseConfidence(coPurchaseCount, totalPurchases) {
  if (totalPurchases === 0) return 0;

  const confidence = (coPurchaseCount / totalPurchases) * 100;
  return Math.round(Math.min(100, confidence));
}

/**
 * Calculate view-based engagement score
 * Users who view similar products are likely interested
 */
function calculateEngagementScore(viewCount, daysSinceView) {
  const baseScore = Math.min(100, viewCount * 10);

  // Decay by time (views older than 30 days have lower weight)
  const timeFactor = Math.max(0.3, 1 - daysSinceView / 30);

  const engagementScore = baseScore * timeFactor;
  return Math.round(engagementScore);
}

/**
 * Get time-based decay factor
 * Newer data gets higher weight
 */
function getTimeDecayFactor(dateMs) {
  const ageInDays = (Date.now() - new Date(dateMs).getTime()) / (1000 * 60 * 60 * 24);

  // Half-life of 30 days
  return Math.pow(0.5, ageInDays / 30);
}

/**
 * Merge and deduplicate product arrays
 */
function mergeAndDeduplicateProducts(arrays) {
  const productMap = new Map();

  arrays.forEach((arr) => {
    arr.forEach((product) => {
      if (product && product.id) {
        if (!productMap.has(product.id)) {
          productMap.set(product.id, product);
        }
      }
    });
  });

  return Array.from(productMap.values());
}

/**
 * Sort products by score in descending order
 */
function sortByScore(products) {
  return products.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Paginate array
 */
function paginate(items, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

/**
 * Calculate average rating
 */
function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate discount price
 */
function calculateDiscountedPrice(originalPrice, discountPercent) {
  const discount = (originalPrice * discountPercent) / 100;
  return Math.round((originalPrice - discount) * 100) / 100;
}

/**
 * Calculate totals for order items
 */
function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round((subtotal * 0.1) * 100) / 100; // 10% tax
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    total,
  };
}

/**
 * Clone object deeply
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Extract numeric ID safely
 */
function extractNumericId(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * Truncate string with ellipsis
 */
function truncateString(str, maxLength = 100) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
  const now = new Date();
  const ms = now - new Date(date);
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

/**
 * Measure execution time of async function
 */
async function measureExecutionTime(asyncFn, label = "Operation") {
  const startTime = performance.now();

  try {
    const result = await asyncFn();
    const duration = performance.now() - startTime;
    logger.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`${label} failed`, error, { duration: `${duration.toFixed(2)}ms` });
    throw error;
  }
}

module.exports = {
  calculateProductSimilarity,
  calculateCollaborativeScore,
  calculateCoPurchaseConfidence,
  calculateEngagementScore,
  getTimeDecayFactor,
  mergeAndDeduplicateProducts,
  sortByScore,
  paginate,
  calculateAverageRating,
  formatCurrency,
  calculateDiscountedPrice,
  calculateOrderTotals,
  deepClone,
  extractNumericId,
  truncateString,
  formatRelativeTime,
  measureExecutionTime,
};
