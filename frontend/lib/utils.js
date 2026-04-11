/**
 * Frontend Utilities
 * Reusable functions and helpers for the e-commerce frontend
 */

/**
 * Format price to Indian Rupee format
 * @param {number} price - Price in rupees
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) return "₹0";
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Calculate discounted price
 * @param {number} originalPrice - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} Discounted price
 */
export function calculateDiscountedPrice(originalPrice, discount) {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(discount)) return originalPrice;
  return Math.round(originalPrice * (1 - discount / 100));
}

/**
 * Calculate savings amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Amount saved
 */
export function calculateSavings(originalPrice, discountedPrice) {
  return Math.round(originalPrice - discountedPrice);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating out of 5
 * @param {boolean} includeText - Include text rating
 * @returns {object} Stars and rating info
 */
export function generateStarRating(rating, includeText = true) {
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;

  return {
    fullStars,
    hasHalfStar,
    emptyStars: 5 - fullStars - (hasHalfStar ? 1 : 0),
    rating: roundedRating,
    text: includeText ? `${roundedRating.toFixed(1)} out of 5` : null,
  };
}

/**
 * Get badge color class based on badge type
 * @param {string} badgeType - Type of badge
 * @returns {string} Tailwind CSS class
 */
export function getBadgeColorClass(badgeType) {
  const badgeColors = {
    "Best Seller": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Top Rated": "bg-green-100 text-green-800 border-green-200",
    "Limited Offer": "bg-red-100 text-red-800 border-red-200",
    "Trending": "bg-blue-100 text-blue-800 border-blue-200",
    "New Arrival": "bg-purple-100 text-purple-800 border-purple-200",
    "Premium": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Popular": "bg-orange-100 text-orange-800 border-orange-200",
  };

  return badgeColors[badgeType] || "bg-slate-100 text-slate-800 border-slate-200";
}

/**
 * Get category icon/emoji
 * @param {string} category - Product category
 * @returns {string} Category emoji
 */
export function getCategoryIcon(category) {
  const icons = {
    Electronics: "⚡",
    Fashion: "👗",
    Home: "🏠",
    Beauty: "💄",
    General: "🛍️",
  };

  return icons[category] || "🛍️";
}

/**
 * Validate product object
 * @param {object} product - Product object to validate
 * @returns {boolean} True if valid product
 */
export function isValidProduct(product) {
  return (
    product &&
    typeof product === "object" &&
    product.id &&
    product.name &&
    typeof product.price === "number" &&
    Number.isFinite(product.price)
  );
}

/**
 * Sort products by various criteria
 * @param {array} products - Array of products
 * @param {string} sortBy - Sort criteria (price_asc, price_desc, rating, newest)
 * @returns {array} Sorted products
 */
export function sortProducts(products, sortBy = "newest") {
  const sorted = [...products];

  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "newest":
      return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    default:
      return sorted;
  }
}

/**
 * Filter products by price range
 * @param {array} products - Array of products
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {array} Filtered products
 */
export function filterByPriceRange(products, minPrice = 0, maxPrice = Infinity) {
  return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Filter products by rating
 * @param {array} products - Array of products
 * @param {number} minRating - Minimum rating (0-5)
 * @returns {array} Filtered products
 */
export function filterByRating(products, minRating = 0) {
  return products.filter((p) => (p.rating || 0) >= minRating);
}

/**
 * Get average rating from product reviews
 * @param {array} products - Array of products
 * @returns {number} Average rating
 */
export function getAverageRating(products) {
  if (!products || products.length === 0) return 0;
  const sum = products.reduce((acc, p) => acc + (p.rating || 0), 0);
  return (sum / products.length).toFixed(1);
}

/**
 * Generate product URL slug
 * @param {string} productName - Product name
 * @param {number} productId - Product ID
 * @returns {string} URL slug
 */
export function generateProductSlug(productName, productId) {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}-${productId}`;
}

/**
 * Calculate delivery date
 * @param {number} daysFromNow - Number of days from now
 * @returns {string} Formatted delivery date
 */
export function calculateDeliveryDate(daysFromNow = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format review date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatReviewDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

  return d.toLocaleDateString("en-IN");
}

/**
 * Check if product is on sale
 * @param {object} product - Product object
 * @returns {boolean} True if on sale
 */
export function isOnSale(product) {
  return product && product.discount > 0;
}

/**
 * Get instock status text
 * @param {boolean} inStock - Stock status
 * @returns {string} Status text
 */
export function getStockStatusText(inStock) {
  return inStock ? "In Stock" : "Out of Stock";
}

/**
 * Create product summary for sharing
 * @param {object} product - Product object
 * @returns {string} Share text
 */
export function createShareText(product) {
  const price = formatPrice(product.price);
  const rating = product.rating ? `${product.rating}★` : "New";
  return `Check out "${product.name}" - ${price} (${rating}) at ShopWise! 🛍️`;
}
