/**
 * Validation Middleware
 * Request validation and sanitization
 */

const { ApiError } = require("./errorHandler");

/**
 * Validate product data
 */
function validateProduct(req, _res, next) {
  const { name, category, description, price, imageUrl } = req.body;

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, "Product name is required");
  }

  if (!category || category.trim().length === 0) {
    throw new ApiError(400, "Product category is required");
  }

  if (!description || description.trim().length === 0) {
    throw new ApiError(400, "Product description is required");
  }

  if (typeof price !== "number" || price < 0) {
    throw new ApiError(400, "Product price must be a positive number");
  }

  if (!imageUrl || imageUrl.trim().length === 0) {
    throw new ApiError(400, "Product image URL is required");
  }

  next();
}

/**
 * Validate user registration data
 */
function validateUserRegistration(req, _res, next) {
  const { email, password, name } = req.body;

  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, "Name is required");
  }

  next();
}

/**
 * Validate user login data
 */
function validateUserLogin(req, _res, next) {
  const { email, password } = req.body;

  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, _res, next) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (page < 1 || !Number.isInteger(page)) {
    throw new ApiError(400, "Page must be a positive integer");
  }

  if (limit < 1 || limit > 100 || !Number.isInteger(limit)) {
    throw new ApiError(400, "Limit must be between 1 and 100");
  }

  req.pagination = { page, limit };
  next();
}

/**
 * Validate cart item data
 */
function validateCartItem(req, _res, next) {
  const { productId, quantity } = req.body;

  if (!productId || typeof productId !== "number") {
    throw new ApiError(400, "Valid product ID is required");
  }

  if (!quantity || typeof quantity !== "number" || quantity < 1) {
    throw new ApiError(400, "Quantity must be a positive number");
  }

  next();
}

/**
 * Validate order data
 */
function validateOrder(req, _res, next) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.productId)) {
      throw new ApiError(400, "Each item must have a valid product ID");
    }
    if (!item.quantity || item.quantity < 1) {
      throw new ApiError(400, "Each item must have quantity >= 1");
    }
  }

  next();
}

module.exports = {
  validateProduct,
  validateUserRegistration,
  validateUserLogin,
  validatePagination,
  validateCartItem,
  validateOrder,
};
