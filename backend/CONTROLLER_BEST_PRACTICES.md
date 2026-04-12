# Express Controller - Best Practices Guide

## Overview

This guide covers best practices for building Express controllers for the recommendation system, specifically focused on:
- Input validation
- Error handling
- Async/await patterns
- Standard response formats
- Performance optimization

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "userId": 1,
    "count": 10,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "message": "Additional details (dev only)",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Input Validation Pattern

### 1. Validate Parameter Type
```javascript
const userId = req.params.userId ? Number(req.params.userId) : null;

if (!userId || !Number.isInteger(userId) || userId <= 0) {
  return res.status(400).json({
    success: false,
    error: "Invalid userId. Must be a positive integer.",
    code: "INVALID_USER_ID",
  });
}
```

### 2. Using Helper Validators
```javascript
const { validateUserId, validatePagination } = require("../utils/validators");

const { userId, error } = validateUserId(req.params.userId);
if (error) {
  return res.status(400).json({
    success: false,
    error,
    code: "INVALID_USER_ID",
  });
}
```

### 3. Parse Query Parameters with Bounds
```javascript
const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
// Result: 1-50, default 10

const page = Math.max(1, Number(req.query.page) || 1);
// Result: minimum 1

const score = Math.max(0, Math.min(1, Number(req.query.score) || 0.3));
// Result: 0-1, default 0.3
```

---

## Error Handling Pattern

### Async Handler Wrapper
```javascript
const asyncHandler = require("../middleware/asyncHandler");

const myController = asyncHandler(async (req, res) => {
  // Any errors will be caught by asyncHandler
  // No need for try/catch at top level
});
```

### Manual Try-Catch (When Needed)
```javascript
try {
  const data = await someService();
  return res.json({
    success: true,
    data,
  });
} catch (error) {
  logger.error("Operation failed", {
    error: error.message,
    code: error.code,
  });

  return res.status(500).json({
    success: false,
    error: "Operation failed",
    code: error.code || "UNKNOWN_ERROR",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}
```

### Error Classification
```javascript
if (!userId) {
  // 400 Bad Request - Client error
  return res.status(400).json({
    success: false,
    error: "Invalid input",
    code: "BAD_REQUEST",
  });
}

if (!user) {
  // 404 Not Found
  return res.status(404).json({
    success: false,
    error: "User not found",
    code: "NOT_FOUND",
  });
}

if (userNotAuthorized) {
  // 403 Forbidden
  return res.status(403).json({
    success: false,
    error: "Unauthorized access",
    code: "FORBIDDEN",
  });
}

// Database or unknown error
// 500 Internal Server Error
return res.status(500).json({
  success: false,
  error: "Internal server error",
  code: "INTERNAL_ERROR",
});
```

---

## Async/Await Pattern

### Basic Pattern
```javascript
const getRecommendations = asyncHandler(async (req, res) => {
  // 1. Validate input
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, error: "..." });

  try {
    // 2. Call async service
    const data = await recommendationService.getRecommendations(userId);

    // 3. Return response
    return res.json({ success: true, data });
  } catch (error) {
    // 4. Handle error
    logger.error("Error", { error });
    return res.status(500).json({ success: false, error: "..." });
  }
});
```

### Parallel Operations
```javascript
try {
  // Execute multiple async operations in parallel
  const [recs1, recs2, recs3] = await Promise.all([
    service1.getRecommendations(userId),
    service2.getRecommendations(userId),
    service3.getRecommendations(userId),
  ]);

  return res.json({
    success: true,
    data: { recs1, recs2, recs3 },
  });
} catch (error) {
  // ...
}
```

### Conditional Async
```javascript
try {
  let data;

  if (type === "content") {
    data = await contentService.getRecommendations(userId);
  } else if (type === "collaborative") {
    data = await collaborativeService.getRecommendations(userId);
  } else {
    data = await hybridService.getRecommendations(userId);
  }

  return res.json({ success: true, data });
} catch (error) {
  // ...
}
```

---

## Logging Pattern

### Structured Logging
```javascript
// Debug level - detailed info for development
logger.debug("Request received", {
  userId,
  type,
  limit,
  ip: req.ip,
});

// Info level - important business events
logger.info("Recommendations generated", {
  userId,
  count: recommendations.length,
  algorithm: "hybrid",
  executionTime: "150ms",
});

// Warn level - potential issues
logger.warn("Unusual request pattern", {
  userId,
  limit: 1000, // unusual
  ip: req.ip,
});

// Error level - errors that need attention
logger.error("Failed to fetch recommendations", {
  userId,
  error: error.message,
  stack: error.stack,
});
```

---

## Request Validation Checklist

- [ ] Validate path parameters (userId, productId, etc.)
- [ ] Check parameter type (number, string, etc.)
- [ ] Verify parameter is within valid range
- [ ] Parse query parameters with defaults
- [ ] Apply bounds to numeric parameters
- [ ] Validate enum values against allowed options
- [ ] Check for required vs optional fields
- [ ] Sanitize string inputs
- [ ] Log validation failures
- [ ] Return appropriate HTTP status code

---

## Response Format Checklist

- [ ] Always use `success` boolean flag
- [ ] Include `data` field for successful responses
- [ ] Include `error` field for failed responses
- [ ] Add `code` field for error classification
- [ ] Include `metadata` with relevant info
- [ ] Add `timestamp` for all responses
- [ ] Return correct HTTP status code
- [ ] Include helpful error messages
- [ ] Don't expose sensitive data in responses
- [ ] Format dates as ISO 8601

---

## Performance Best Practices

### Timing Measurement
```javascript
const startTime = Date.now();

try {
  const data = await service.getRecommendations(userId);
  const executionTime = Date.now() - startTime;

  return res.json({
    success: true,
    data,
    metadata: {
      executionTime: `${executionTime}ms`,
    },
  });
} catch (error) {
  // ...
}
```

### Pagination
```javascript
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 100);
const skip = (page - 1) * limit;

const data = await service.getRecommendations(userId, {
  skip,
  take: limit,
});

return res.json({
  success: true,
  data,
  metadata: {
    page,
    limit,
    total: data.total,
    pages: Math.ceil(data.total / limit),
  },
});
```

### Caching Headers
```javascript
const CACHE_TTL = 3600; // 1 hour

res.set({
  "Cache-Control": `public, max-age=${CACHE_TTL}`,
  "X-Cache-Hit": "false",
  "X-Cache-TTL": CACHE_TTL.toString(),
});

return res.json({ success: true, data });
```

---

## Security Best Practices

### Never Expose Sensitive Info
```javascript
// ❌ Bad
return res.json({
  success: false,
  error: `Database connection failed: ${dbError.password}`,
});

// ✅ Good
logger.error("Database error", { error: dbError });
return res.status(500).json({
  success: false,
  error: "Internal server error",
});
```

### Validate Authorization
```javascript
// ✅ Check if user is authorized
if (userId !== req.user.id && !req.user.isAdmin) {
  return res.status(403).json({
    success: false,
    error: "Not authorized",
    code: "FORBIDDEN",
  });
}
```

### Rate Limiting
```javascript
// Apply rate limiter middleware
router.get(
  "/recommendations/:userId",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  getRecommendations
);
```

---

## Complete Controller Example

```javascript
const asyncHandler = require("../middleware/asyncHandler");
const { validateUserId } = require("../utils/validators");
const logger = require("../utils/logger");
const recommendationService = require("../services/recommendationService");

/**
 * GET /recommendations/:userId
 * Get recommendations for a user
 * 
 * Query Parameters:
 * - type: Algorithm type (hybrid, content, collaborative, category, trending)
 * - limit: Number of recommendations (1-50, default: 10)
 * - page: Page number for pagination (default: 1)
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // 1. VALIDATE INPUT
  const { userId, error: userError } = validateUserId(req.params.userId);
  
  if (userError) {
    logger.warn("Invalid userId", { userId: req.params.userId });
    return res.status(400).json({
      success: false,
      error: userError,
      code: "INVALID_USER_ID",
    });
  }

  // 2. PARSE QUERY PARAMETERS
  const type = (req.query.type || "hybrid").toLowerCase().trim();
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
  const page = Math.max(1, Number(req.query.page) || 1);

  // 3. VALIDATE TYPE
  const supportedTypes = ["hybrid", "content", "collaborative", "category", "trending"];
  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type: ${type}`,
      code: "INVALID_TYPE",
      supportedTypes,
    });
  }

  logger.debug("Recommendations requested", { userId, type, limit, page });

  try {
    // 4. FETCH RECOMMENDATIONS
    const recommendations = await recommendationService.getRecommendations(
      userId,
      { type, limit, page }
    );

    const executionTime = Date.now() - startTime;

    logger.info("Recommendations fetched successfully", {
      userId,
      type,
      count: recommendations.length,
      executionTime: `${executionTime}ms`,
    });

    // 5. RETURN RESPONSE
    return res.status(200).json({
      success: true,
      data: recommendations,
      metadata: {
        userId,
        type,
        limit,
        page,
        count: recommendations.length,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // 6. HANDLE ERROR
    logger.error("Error fetching recommendations", {
      userId,
      type,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      code: "FETCH_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = { getRecommendations };
```

---

## Testing the Controller

### Unit Test Example
```javascript
describe("GET /recommendations/:userId", () => {
  it("should return recommendations for valid userId", async () => {
    const res = await request(app)
      .get("/recommendations/1")
      .expect(200);

    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("metadata");
  });

  it("should return 400 for invalid userId", async () => {
    const res = await request(app)
      .get("/recommendations/invalid")
      .expect(400);

    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("code", "INVALID_USER_ID");
  });

  it("should respect limit parameter bounds", async () => {
    const res = await request(app)
      .get("/recommendations/1?limit=1000")
      .expect(200);

    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });
});
```

---

## Quick Checklist for New Controllers

1. ✅ Use `asyncHandler` middleware wrapper
2. ✅ Validate all inputs immediately
3. ✅ Use try-catch for service calls
4. ✅ Log important events and errors
5. ✅ Return standard response format
6. ✅ Use correct HTTP status codes
7. ✅ Include metadata in responses
8. ✅ Never expose sensitive data
9. ✅ Test error scenarios
10. ✅ Document parameters and responses

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-XX
