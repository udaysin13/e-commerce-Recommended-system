/**
 * Logger Utility
 * Production-grade logging with levels and formatting
 */

const fs = require("fs");
const path = require("path");

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level (from env or default to INFO)
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

// Log colors for console
const COLORS = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m", // Yellow
  INFO: "\x1b[36m", // Cyan
  DEBUG: "\x1b[35m", // Magenta
  RESET: "\x1b[0m",
};

/**
 * Format timestamp for logs
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message with metadata
 */
function formatLogMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level}]${dataStr}: ${message}`;
}

/**
 * Write log to file
 */
function writeToFile(level, message, data = null) {
  try {
    const logDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
    const logMessage = formatLogMessage(level, message, data) + "\n";
    fs.appendFileSync(logFile, logMessage, "utf-8");
  } catch (err) {
    console.error("Failed to write to log file:", err.message);
  }
}

/**
 * Core logging function
 */
function log(level, message, data = null) {
  if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL) {
    return; // Skip if level is below current threshold
  }

  const formattedMessage = formatLogMessage(level, message, data);
  const color = COLORS[level] || COLORS.INFO;

  // Console output with color
  if (process.env.NODE_ENV === "development") {
    console.log(`${color}${formattedMessage}${COLORS.RESET}`);
  } else {
    console.log(formattedMessage);
  }

  // File output for ERROR and WARN in production
  if (["ERROR", "WARN"].includes(level)) {
    writeToFile(level, message, data);
  }
}

/**
 * Logger object with methods for each level
 */
const logger = {
  error: (message, data = null) => log("ERROR", message, data),
  warn: (message, data = null) => log("WARN", message, data),
  info: (message, data = null) => log("INFO", message, data),
  debug: (message, data = null) => log("DEBUG", message, data),

  /**
   * Log HTTP request
   */
  logRequest: (req, res, duration) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
    };
    const level = res.statusCode >= 400 ? "WARN" : "INFO";
    log(level, `HTTP ${req.method} ${req.originalUrl}`, logData);
  },

  /**
   * Log algorithm performance
   */
  logAlgorithmPerformance: (algorithmName, duration, resultCount) => {
    logger.debug(`${algorithmName} executed`, {
      algorithm: algorithmName,
      duration: `${duration}ms`,
      resultCount,
    });
  },

  /**
   * Log database operation
   */
  logDatabaseOperation: (operation, table, duration, success = true) => {
    const level = success ? "DEBUG" : "WARN";
    log(level, `Database ${operation} on ${table}`, {
      operation,
      table,
      duration: `${duration}ms`,
      success,
    });
  },

  /**
   * Log error with stack trace
   */
  logError: (message, error, data = null) => {
    const errorData = {
      ...data,
      error: error.message,
      stack: error.stack,
    };
    log("ERROR", message, errorData);
  },
};

module.exports = logger;
