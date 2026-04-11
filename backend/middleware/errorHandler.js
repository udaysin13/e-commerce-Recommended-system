/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

/**
 * Error handling middleware
 * Catches and formats all errors
 */
function errorHandler(err, _req, res, _next) {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  // If it's an ApiError, use its status code
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Prisma validation errors
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Resource not found",
      statusCode: 404,
    });
  }

  // Prisma unique constraint errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({
      error: `${field} already exists`,
      statusCode: 409,
    });
  }

  // Prisma validation errors
  if (err.code === "P2003") {
    return res.status(400).json({
      error: "Invalid reference - related record not found",
      statusCode: 400,
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
    statusCode: err.statusCode || 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = {
  ApiError,
  errorHandler,
};
