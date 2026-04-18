/**
 * Error Handler Middleware
 * Centralized error handling for all routes with comprehensive logging
 */

const logger = require("../utils/logger");

/**
 * Custom API Error class
 * Extends Error to include HTTP status code
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    this.details = details;
  }
}

/**
 * Validation Error class
 * For input validation failures
 */
class ValidationError extends ApiError {
  constructor(message, details = []) {
    super(400, message, details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication Error class
 */
class AuthenticationError extends ApiError {
  constructor(message = "Authentication failed") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization Error class
 */
class AuthorizationError extends ApiError {
  constructor(message = "You do not have permission to access this resource") {
    super(403, message);
    this.name = "AuthorizationError";
  }
}

/**
 * Not Found Error class
 */
class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Convert Prisma errors to ApiError
 */
function handlePrismaError(err) {
  if (err.code === "P2025") {
    return new NotFoundError("Resource");
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return new ApiError(409, `${field} already exists`);
  }

  if (err.code === "P2003") {
    return new ApiError(400, "Invalid reference - related record not found");
  }

  if (err.code === "P2014") {
    return new ApiError(400, "The provided data is invalid for the operation");
  }

  if (err.code === "P2015") {
    return new ApiError(400, "A required related record was not found");
  }

  // Generic Prisma error
  return new ApiError(500, "Database operation failed");
}

/**
 * Main error handling middleware
 * Catches and formats all errors with comprehensive logging
 */
function errorHandler(err, req, res, _next) {
  let apiError = err;

  // Convert Prisma errors
  if (err.code && err.code.startsWith("P")) {
    apiError = handlePrismaError(err);
  }
  // Ensure it's an ApiError
  else if (!(err instanceof ApiError)) {
    apiError = new ApiError(err.statusCode || 500, err.message || "Internal server error");
  }

  const statusCode = apiError.statusCode || 500;
  const response = {
    error: apiError.message,
    statusCode,
  };

  // Include details in development
  if (process.env.NODE_ENV === "development") {
    response.details = apiError.details;
    response.stack = err.stack;
  }

  // Log errors appropriately
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.path}] ${apiError.message}`, err, {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });
  } else if (statusCode >= 400) {
    logger.warn(`[${req.method} ${req.path}] ${apiError.message}`, {
      statusCode,
      path: req.path,
      userId: req.user?.id,
    });
  }

  res.status(statusCode).json(response);
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  errorHandler,
  handlePrismaError,
};
