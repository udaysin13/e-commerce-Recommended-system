/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and handle promises properly
 * Ensures all errors are properly caught and passed to error handling middleware
 */

const logger = require("../utils/logger");

/**
 * Wrap async route handlers to catch errors
 * @param {Function} fn - Async route handler
 * @returns {Function} - Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    const startTime = performance.now();

    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        const duration = performance.now() - startTime;
        logger.debug(`Route error: ${req.method} ${req.path}`, {
          duration: `${duration.toFixed(2)}ms`,
          error: error.message,
        });
        next(error);
      })
      .then(() => {
        // Log successful request completion
        if (res.statusCode < 400) {
          const duration = performance.now() - startTime;
          logger.debug(`Route success: ${req.method} ${req.path}`, {
            statusCode: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
          });
        }
      });
  };
}

module.exports = asyncHandler;
