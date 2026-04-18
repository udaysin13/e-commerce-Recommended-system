/**
 * Application Configuration
 * Centralized configuration for production and development
 */

const dotenv = require("dotenv");
dotenv.config();

/**
 * Environment Configuration
 */
const CONFIG = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "INFO",
  LOG_DIR: process.env.LOG_DIR || "./logs",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === "true",

  // Recommendation System
  RECOMMENDATION: {
    // Limits for recommendation queries
    MAX_RECOMMENDATIONS: 50,
    MIN_RECOMMENDATIONS: 5,
    DEFAULT_LIMIT: 12,

    // Algorithm weights (must sum to 100)
    HYBRID_WEIGHTS: {
      contentBased: 0.35,
      collaborative: 0.3,
      trending: 0.2,
      categoryBased: 0.15,
    },

    // Time decay factor for view history (days)
    VIEW_HISTORY_HALF_LIFE: 30,

    // Minimum interaction count for recommendations
    MIN_INTERACTIONS: 2,

    // Popular products calculation (views in last X days)
    POPULARITY_WINDOW_DAYS: 30,

    // Minimum purchase count to consider for collaborative filtering
    MIN_PURCHASE_COUNT: 1,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Validation
  VALIDATION: {
    // Product
    MIN_PRODUCT_NAME_LENGTH: 3,
    MAX_PRODUCT_NAME_LENGTH: 100,
    MIN_PRICE: 0,
    MAX_PRICE: 999999,
    MAX_DISCOUNT: 100,

    // User
    MIN_PASSWORD_LENGTH: 8,
    MIN_NAME_LENGTH: 2,

    // Search
    MAX_SEARCH_LENGTH: 100,
    MIN_SEARCH_LENGTH: 1,

    // Quantity
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 1000,
  },

  // API Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // Cache settings
  CACHE: {
    ENABLED: process.env.CACHE_ENABLED !== "false",
    POPULAR_PRODUCTS_TTL: 3600, // 1 hour in seconds
    TRENDING_PRODUCTS_TTL: 1800, // 30 minutes
    RECOMMENDATIONS_TTL: 300, // 5 minutes
  },

  // API Response
  RESPONSE: {
    TIMEOUT_MS: 30000, // 30 seconds
  },

  // Features
  FEATURES: {
    ENABLE_ADVANCED_RECOMMENDATIONS: true,
    ENABLE_COLLABORATIVE_FILTERING: true,
    ENABLE_CONTENT_BASED: true,
    ENABLE_TRENDING: true,
  },
};

/**
 * Validate required environment variables
 */
function validateConfig() {
  const requiredVars = ["DATABASE_URL", "JWT_SECRET"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
    console.warn("Please check your .env file");
  }

  // Validate hybrid weights sum to 1
  const weightsSum = Object.values(CONFIG.RECOMMENDATION.HYBRID_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(weightsSum - 1) > 0.01) {
    console.warn("⚠️  Warning: HYBRID_WEIGHTS do not sum to 1");
  }
}

/**
 * Get configuration for current environment
 */
function getConfig() {
  return CONFIG;
}

/**
 * Check if running in production
 */
function isProduction() {
  return CONFIG.NODE_ENV === "production";
}

/**
 * Check if running in development
 */
function isDevelopment() {
  return CONFIG.NODE_ENV === "development";
}

/**
 * Check if feature is enabled
 */
function isFeatureEnabled(featureName) {
  return CONFIG.FEATURES[`ENABLE_${featureName.toUpperCase()}`] || false;
}

// Validate on load
validateConfig();

module.exports = {
  CONFIG,
  getConfig,
  isProduction,
  isDevelopment,
  isFeatureEnabled,
  validateConfig,
};
