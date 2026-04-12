# Controller Implementation - Quick Reference

## Response Format (Standard Template)

```javascript
// SUCCESS
{
  "success": true,
  "data": [...],
  "metadata": {
    "userId": 1,
    "count": 10,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}

// ERROR
{
  "success": false,
  "error": "User not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Validation Patterns

### Validate Number Parameter
```javascript
const userId = Number(req.params.userId);
if (!userId || !Number.isInteger(userId) || userId <= 0) {
  return res.status(400).json({
    success: false,
    error: "Invalid userId. Must be positive integer.",
    code: "INVALID_USER_ID"
  });
}
```

### Parse Query Parameter with Bounds
```javascript
const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
// Valid range: 1-50, default: 10
```

### Validate Enum Values
```javascript
const supportedTypes = ["type1", "type2", "type3"];
if (!supportedTypes.includes(type)) {
  return res.status(400).json({
    success: false,
    error: `Invalid type: ${type}`,
    code: "INVALID_TYPE",
    supportedTypes
  });
}
```

---

## Error Handling Patterns

### Service Error with Try-Catch
```javascript
try {
  const data = await service.getData(userId);
  return res.json({ success: true, data });
} catch (error) {
  logger.error("Error", { error: error.message });
  return res.status(500).json({
    success: false,
    error: "Operation failed",
    code: "ERROR_CODE"
  });
}
```

### HTTP Status Codes by Error Type
| Code | Usage | Example |
|------|-------|---------|
| 400 | Bad Request | Invalid input parameter |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Not authorized for resource |
| 404 | Not Found | User/product doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Database failure |

---

## Async/Await Patterns

### Single Service Call
```javascript
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  
  const data = await recommendationService.getRecommendations(userId);
  
  return res.json({ success: true, data });
});
```

### Parallel Service Calls
```javascript
const [recs1, recs2, recs3] = await Promise.all([
  service1.get(userId),
  service2.get(userId),
  service3.get(userId)
]);
```

### Conditional Service Calls
```javascript
if (type === "content") {
  data = await contentService.get(userId);
} else {
  data = await hybridService.get(userId);
}
```

---

## Logging Quick Reference

```javascript
// Development details
logger.debug("Function called", { userId, params });

// Important business events
logger.info("Data fetched", { userId, count: 10 });

// Warning signs
logger.warn("Unusual request", { userId, limit: 5000 });

// Errors that need attention
logger.error("Database failed", { error: err.message });
```

---

## Performance Optimization

### Execution Time Tracking
```javascript
const startTime = Date.now();
const data = await service.getData();
const executionTime = Date.now() - startTime;

return res.json({
  success: true,
  data,
  metadata: { executionTime: `${executionTime}ms` }
});
```

### Pagination
```javascript
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 100);
const skip = (page - 1) * limit;

const data = await service.get(userId, { skip, take: limit });

metadata: {
  page,
  limit,
  total: data.total,
  pages: Math.ceil(data.total / limit)
}
```

### Cache Headers
```javascript
res.set({
  "Cache-Control": "public, max-age=3600",
  "X-Cache-TTL": "3600"
});
return res.json({ success: true, data });
```

---

## Security Quick Tips

| ✅ DO | ❌ DON'T |
|-------|---------|
| Validate all inputs | Trust client data |
| Check authorization | Return all user data |
| Log errors securely | Expose sensitive details |
| Use HTTP status codes | Leak internal errors |
| Sanitize strings | Allow SQL injection |
| Rate limit endpoints | Allow unlimited requests |

### Authorization Check Example
```javascript
if (userId !== req.user.id && !req.user.isAdmin) {
  return res.status(403).json({
    success: false,
    error: "Not authorized",
    code: "FORBIDDEN"
  });
}
```

### Never Expose Secrets
```javascript
// ❌ Bad
error: `Database failed: ${dbError.password}`

// ✅ Good
logger.error("Database failed", { error: dbError });
return res.status(500).json({
  success: false,
  error: "Internal error",
  code: "DB_ERROR"
});
```

---

## Testing Patterns

### Success Case
```javascript
const res = await request(app)
  .get("/recommendations/1")
  .expect(200);

expect(res.body.success).toBe(true);
expect(res.body.data).toBeDefined();
expect(res.body.metadata).toBeDefined();
```

### Error Case
```javascript
const res = await request(app)
  .get("/recommendations/invalid")
  .expect(400);

expect(res.body.success).toBe(false);
expect(res.body.error).toBeDefined();
expect(res.body.code).toBe("INVALID_USER_ID");
```

### Parameter Bounds
```javascript
const res = await request(app)
  .get("/recommendations/1?limit=9999")
  .expect(200);

expect(res.body.data.length).toBeLessThanOrEqual(50);
```

---

## Controller Template (Copy & Modify)

```javascript
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");
const { validateUserId } = require("../utils/validators");
const service = require("../services/serviceName");

/**
 * GET /endpoint/:userId
 * Description of what this does
 * Query Parameters: type, limit
 */
const getEndpoint = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // 1. Validate input
  const { userId, error } = validateUserId(req.params.userId);
  if (error) {
    return res.status(400).json({
      success: false,
      error,
      code: "INVALID_USER_ID"
    });
  }

  // 2. Parse parameters
  const type = (req.query.type || "default").toLowerCase();
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);

  logger.debug("Request received", { userId, type, limit });

  try {
    // 3. Call service
    const data = await service.getData(userId, { type, limit });

    const executionTime = Date.now() - startTime;

    logger.info("Data fetched", {
      userId,
      count: data.length,
      executionTime: `${executionTime}ms`
    });

    // 4. Return response
    return res.status(200).json({
      success: true,
      data,
      metadata: {
        userId,
        type,
        limit,
        count: data.length,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // 5. Handle error
    logger.error("Error fetching data", {
      userId,
      error: error.message
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch data",
      code: "FETCH_ERROR",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = { getEndpoint };
```

---

## Checklist Before Submitting Controller

- [ ] All inputs validated
- [ ] HTTP status codes correct (200, 400, 404, 500)
- [ ] Response uses standard format
- [ ] Error codes defined for each error
- [ ] Logging at appropriate levels
- [ ] Try-catch around service calls
- [ ] No sensitive data in responses
- [ ] Authorization checks in place
- [ ] Query parameters bounded
- [ ] Timestamp included in metadata
- [ ] Documentation comments complete
- [ ] Works with asyncHandler

---

## Related Files

- **Main Controller:** `backend/controllers/recommendationController.js`
- **Examples:** `backend/controllers/recommendationControllerExamples.js`
- **Best Practices:** `backend/CONTROLLER_BEST_PRACTICES.md`
- **Validators:** `backend/utils/validators.js`
- **Logger:** `backend/utils/logger.js`
- **Async Handler:** `backend/middleware/asyncHandler.js`

---

**Quick Links:**
- Standard Response Format: See top of this file
- Validation Patterns: "Validation Patterns" section
- Error Codes: HTTP Status Codes table
- Template: "Controller Template" section

