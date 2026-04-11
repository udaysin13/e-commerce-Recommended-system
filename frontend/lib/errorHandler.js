/**
 * Centralized Error Handler
 * Provides consistent error handling, formatting, and user-friendly messages
 */

// Error type definitions
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// HTTP status code to error type mapping
const STATUS_CODE_MAP = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.NOT_FOUND,
  429: ERROR_TYPES.RATE_LIMIT,
  500: ERROR_TYPES.SERVER,
  502: ERROR_TYPES.SERVER,
  503: ERROR_TYPES.SERVER,
  504: ERROR_TYPES.SERVER,
};

// User-friendly error messages
const USER_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network error. Please check your connection and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse API error response
 * @param {Error|Response} error - Error object or fetch response
 * @returns {Object} Parsed error object
 */
export async function parseError(error) {
  let errorData = {
    type: ERROR_TYPES.UNKNOWN,
    message: 'An unexpected error occurred',
    status: null,
    details: null,
  };

  try {
    // Handle fetch Response errors
    if (error instanceof Response) {
      errorData.status = error.status;
      errorData.type = STATUS_CODE_MAP[error.status] || ERROR_TYPES.SERVER;

      try {
        const json = await error.json();
        errorData.details = json;
        errorData.message = json.message || USER_MESSAGES[errorData.type];
      } catch {
        errorData.message = error.statusText || USER_MESSAGES[errorData.type];
      }
    }
    // Handle network errors
    else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorData.type = ERROR_TYPES.NETWORK;
      errorData.message = USER_MESSAGES[ERROR_TYPES.NETWORK];
    }
    // Handle Error objects
    else if (error instanceof Error) {
      errorData.message = error.message;
      errorData.details = error;
    }
    // Handle string messages
    else if (typeof error === 'string') {
      errorData.message = error;
    }
  } catch (parseErr) {
    console.error('Error parsing error response:', parseErr);
  }

  return errorData;
}

/**
 * Format error for display
 * @param {Object} error - Parsed error object
 * @returns {Object} Formatted error with title and description
 */
export function formatErrorForDisplay(error) {
  const { type, message, status } = error;

  return {
    title: getErrorTitle(type),
    description: message || USER_MESSAGES[type],
    userMessage: getUserMessage(type, status),
    icon: getErrorIcon(type),
    canRetry: canRetryError(type, status),
  };
}

/**
 * Get user-friendly error title
 * @param {string} type - Error type
 * @returns {string} Error title
 */
function getErrorTitle(type) {
  const titles = {
    [ERROR_TYPES.NETWORK]: 'Connection Problem',
    [ERROR_TYPES.AUTHENTICATION]: 'Login Required',
    [ERROR_TYPES.AUTHORIZATION]: 'Access Denied',
    [ERROR_TYPES.VALIDATION]: 'Invalid Input',
    [ERROR_TYPES.SERVER]: 'Server Error',
    [ERROR_TYPES.NOT_FOUND]: 'Not Found',
    [ERROR_TYPES.RATE_LIMIT]: 'Too Many Requests',
    [ERROR_TYPES.UNKNOWN]: 'Something Went Wrong',
  };
  return titles[type] || 'Error';
}

/**
 * Get error icon emoji
 * @param {string} type - Error type
 * @returns {string} Emoji icon
 */
function getErrorIcon(type) {
  const icons = {
    [ERROR_TYPES.NETWORK]: '🌐',
    [ERROR_TYPES.AUTHENTICATION]: '🔐',
    [ERROR_TYPES.AUTHORIZATION]: '🚫',
    [ERROR_TYPES.VALIDATION]: '⚠️',
    [ERROR_TYPES.SERVER]: '⚙️',
    [ERROR_TYPES.NOT_FOUND]: '❌',
    [ERROR_TYPES.RATE_LIMIT]: '⏱️',
    [ERROR_TYPES.UNKNOWN]: '🔴',
  };
  return icons[type] || '❌';
}

/**
 * Get user message for error
 * @param {string} type - Error type
 * @param {number} status - HTTP status code
 * @returns {string} User message
 */
function getUserMessage(type, status) {
  if (type === ERROR_TYPES.AUTHENTICATION && status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  if (type === ERROR_TYPES.RATE_LIMIT) {
    return 'You\'re making requests too quickly. Please wait a moment.';
  }
  return USER_MESSAGES[type] || USER_MESSAGES[ERROR_TYPES.UNKNOWN];
}

/**
 * Check if error is retryable
 * @param {string} type - Error type
 * @param {number} status - HTTP status code
 * @returns {boolean} Whether error can be retried
 */
function canRetryError(type, status) {
  const nonRetryableTypes = [
    ERROR_TYPES.AUTHENTICATION,
    ERROR_TYPES.AUTHORIZATION,
    ERROR_TYPES.NOT_FOUND,
  ];

  if (nonRetryableTypes.includes(type)) return false;

  // Can retry server errors, network errors, rate limits
  return [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.SERVER,
    ERROR_TYPES.RATE_LIMIT,
  ].includes(type);
}

/**
 * Log error for monitoring/debugging
 * @param {Object} error - Parsed error object
 * @param {string} context - Where error occurred
 */
export function logError(error, context = '') {
  console.error(`[${context}] Error:`, {
    type: error.type,
    message: error.message,
    status: error.status,
    details: error.details,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error monitoring service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Example: window.Sentry?.captureException(error);
  }
}

/**
 * Handle API error with automatic retry logic
 * @param {Function} apiCall - Function that makes API call
 * @param {Object} options - Options
 * @returns {Promise} API response
 */
export async function withRetry(
  apiCall,
  options = { maxRetries: 3, backoffMs: 1000, context: '' }
) {
  const { maxRetries = 3, backoffMs = 1000, context = '' } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      const parsedError = await parseError(error);
      const formatted = formatErrorForDisplay(parsedError);

      logError(parsedError, `${context} (attempt ${attempt}/${maxRetries})`);

      // Don't retry if error is not retryable
      if (!formatted.canRetry || attempt === maxRetries) {
        throw parsedError;
      }

      // Wait before retrying with exponential backoff
      const delayMs = backoffMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function
 * @param {string} context - Error context
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = '') {
  return async function (...args) {
    try {
      return await fn(...args);
    } catch (error) {
      const parsedError = await parseError(error);
      logError(parsedError, context);
      throw parsedError;
    }
  };
}
