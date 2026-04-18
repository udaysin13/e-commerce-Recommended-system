/**
 * Validation Utilities
 * Input validation and sanitization for all API requests
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate positive integer
 */
function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate non-negative number
 */
function isNonNegativeNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate pagination parameters
 */
function validatePagination(page = 1, limit = 10) {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (!isPositiveInteger(pageNum) || pageNum < 1) {
    return { valid: false, error: "Page must be a positive integer" };
  }

  if (!isPositiveInteger(limitNum) || limitNum < 1 || limitNum > 100) {
    return { valid: false, error: "Limit must be between 1 and 100" };
  }

  return { valid: true, page: pageNum, limit: limitNum };
}

/**
 * Validate price range
 */
function validatePriceRange(minPrice = 0, maxPrice = Infinity) {
  const min = Number(minPrice);
  const max = Number(maxPrice);

  if (!isNonNegativeNumber(min)) {
    return { valid: false, error: "Min price must be non-negative" };
  }

  if (!isNonNegativeNumber(max)) {
    return { valid: false, error: "Max price must be non-negative" };
  }

  if (min > max) {
    return { valid: false, error: "Min price cannot exceed max price" };
  }

  return { valid: true, minPrice: min, maxPrice: max };
}

/**
 * Validate product ID
 */
function validateProductId(productId) {
  if (!isPositiveInteger(productId)) {
    return { valid: false, error: "Invalid product ID" };
  }
  return { valid: true, productId: Number(productId) };
}

/**
 * Validate user ID
 */
function validateUserId(userId) {
  if (!isPositiveInteger(userId)) {
    return { valid: false, error: "Invalid user ID" };
  }
  return { valid: true, userId: Number(userId) };
}

/**
 * Validate order ID
 */
function validateOrderId(orderId) {
  if (!isPositiveInteger(orderId)) {
    return { valid: false, error: "Invalid order ID" };
  }
  return { valid: true, orderId: Number(orderId) };
}

/**
 * Validate quantity
 */
function validateQuantity(quantity) {
  const qty = Number(quantity);
  if (!isPositiveInteger(qty) || qty < 1 || qty > 1000) {
    return { valid: false, error: "Quantity must be between 1 and 1000" };
  }
  return { valid: true, quantity: qty };
}

/**
 * Validate product data for creation/update
 */
function validateProductData(productData) {
  const errors = [];

  if (!productData.name || productData.name.trim().length < 3) {
    errors.push("Product name must be at least 3 characters");
  }

  if (!productData.category || productData.category.trim().length < 2) {
    errors.push("Product category must be at least 2 characters");
  }

  if (!isNonNegativeNumber(productData.price)) {
    errors.push("Product price must be non-negative");
  }

  if (productData.description && productData.description.length > 1000) {
    errors.push("Product description cannot exceed 1000 characters");
  }

  if (productData.discount !== undefined) {
    const discount = Number(productData.discount);
    if (discount < 0 || discount > 100) {
      errors.push("Discount must be between 0 and 100");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate user data for registration
 */
function validateUserRegistration(userData) {
  const errors = [];

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push("Valid email is required");
  }

  if (!userData.password || !isValidPassword(userData.password)) {
    errors.push("Password must be at least 8 characters with uppercase, lowercase, and number");
  }

  if (!userData.name || userData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize search query
 */
function sanitizeSearchQuery(search) {
  return search
    ? search
        .trim()
        .substring(0, 100) // Limit search length
        .replace(/[<>]/g, "") // Remove HTML tags
    : "";
}

/**
 * Sanitize filter category
 */
function sanitizeCategory(category) {
  return category
    ? category
        .trim()
        .substring(0, 50)
        .replace(/[<>]/g, "")
    : "";
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isPositiveInteger,
  isNonNegativeNumber,
  validatePagination,
  validatePriceRange,
  validateProductId,
  validateUserId,
  validateOrderId,
  validateQuantity,
  validateProductData,
  validateUserRegistration,
  sanitizeSearchQuery,
  sanitizeCategory,
};
