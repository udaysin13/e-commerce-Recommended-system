# Recommendation Controller - Testing Guide

## Testing Setup

### Prerequisites
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Or using yarn
yarn add --dev jest supertest
```

### Test Configuration (jest.config.js)
```javascript
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: ["controllers/**/*.js", "services/**/*.js"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## Unit Tests for recommendationController.js

### Test File: `__tests__/controllers/recommendationController.test.js`

```javascript
const request = require("supertest");
const app = require("../../src/app");
const recommendationService = require("../../services/recommendationService");

jest.mock("../../services/recommendationService");

describe("Recommendation Controller", () => {
  describe("GET /recommendations/:userId", () => {
    
    // ============================================
    // 1. SUCCESSFUL REQUESTS
    // ============================================
    
    describe("Success Cases", () => {
      it("should return recommendations for valid userId", async () => {
        const mockData = [
          { id: 101, name: "Product 1", score: 0.95 },
          { id: 102, name: "Product 2", score: 0.87 }
        ];

        recommendationService.getRecommendations.mockResolvedValue(mockData);

        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body).toEqual({
          success: true,
          data: mockData,
          metadata: expect.objectContaining({
            userId: 1,
            count: 2,
            algorithm: expect.any(String),
            timestamp: expect.any(String)
          })
        });
      });

      it("should return metadata with correct structure", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/1?type=hybrid&limit=15")
          .expect(200);

        expect(res.body.metadata).toHaveProperty("userId", 1);
        expect(res.body.metadata).toHaveProperty("type", "hybrid");
        expect(res.body.metadata).toHaveProperty("limit", 15);
        expect(res.body.metadata).toHaveProperty("count", 0);
        expect(res.body.metadata).toHaveProperty("timestamp");
      });

      it("should handle empty recommendations array", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/5")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
        expect(res.body.metadata.count).toBe(0);
      });

      it("should include executionTime in metadata", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body.metadata.executionTime).toMatch(/^\d+ms$/);
      });
    });

    // ============================================
    // 2. VALIDATION ERRORS
    // ============================================

    describe("Input Validation", () => {
      it("should reject missing userId", async () => {
        const res = await request(app)
          .get("/recommendations/")
          .expect(404); // Route not found
      });

      it("should reject non-numeric userId", async () => {
        const res = await request(app)
          .get("/recommendations/abc")
          .expect(400);

        expect(res.body).toEqual({
          success: false,
          error: "Invalid userId. Must be a positive integer.",
          code: "INVALID_USER_ID"
        });
      });

      it("should reject negative userId", async () => {
        const res = await request(app)
          .get("/recommendations/-5")
          .expect(400);

        expect(res.body).toEqual({
          success: false,
          error: "Invalid userId. Must be a positive integer.",
          code: "INVALID_USER_ID"
        });
      });

      it("should reject zero userId", async () => {
        const res = await request(app)
          .get("/recommendations/0")
          .expect(400);

        expect(res.body).toEqual({
          success: false,
          error: "Invalid userId. Must be a positive integer.",
          code: "INVALID_USER_ID"
        });
      });

      it("should reject float userId", async () => {
        const res = await request(app)
          .get("/recommendations/1.5")
          .expect(400);

        expect(res.body.code).toBe("INVALID_USER_ID");
      });

      it("should reject invalid recommendation type", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/1?type=invalid_type")
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe("INVALID_TYPE");
        expect(res.body.error).toContain("invalid_type");
      });

      it("should accept valid recommendation types", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const validTypes = [
          "hybrid",
          "content",
          "collaborative",
          "category",
          "trending"
        ];

        for (const type of validTypes) {
          const res = await request(app)
            .get(`/recommendations/1?type=${type}`)
            .expect(200);

          expect(res.body.metadata.type).toBe(type);
        }
      });
    });

    // ============================================
    // 3. QUERY PARAMETER HANDLING
    // ============================================

    describe("Query Parameter Parsing", () => {
      beforeEach(() => {
        recommendationService.getRecommendations.mockResolvedValue([]);
      });

      it("should use default limit when not provided", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body.metadata.limit).toBe(10);
      });

      it("should accept custom limit", async () => {
        const res = await request(app)
          .get("/recommendations/1?limit=20")
          .expect(200);

        expect(res.body.metadata.limit).toBe(20);
      });

      it("should cap limit to maximum 50", async () => {
        const res = await request(app)
          .get("/recommendations/1?limit=1000")
          .expect(200);

        expect(res.body.metadata.limit).toBe(50);
      });

      it("should enforce minimum limit of 1", async () => {
        const res = await request(app)
          .get("/recommendations/1?limit=0")
          .expect(200);

        expect(res.body.metadata.limit).toBe(1);
      });

      it("should use default type when not provided", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body.metadata.type).toBe("hybrid");
      });

      it("should handle case-insensitive type parameter", async () => {
        const res = await request(app)
          .get("/recommendations/1?type=COLLABORATIVE")
          .expect(200);

        expect(res.body.metadata.type).toBe("collaborative");
      });

      it("should trim whitespace from type", async () => {
        const res = await request(app)
          .get("/recommendations/1?type=%20hybrid%20")
          .expect(200);

        expect(res.body.metadata.type).toBe("hybrid");
      });
    });

    // ============================================
    // 4. ERROR HANDLING
    // ============================================

    describe("Error Handling", () => {
      it("should handle service errors gracefully", async () => {
        const error = new Error("Database connection failed");
        recommendationService.getRecommendations.mockRejectedValue(error);

        const res = await request(app)
          .get("/recommendations/1")
          .expect(500);

        expect(res.body).toEqual({
          success: false,
          error: "Failed to fetch recommendations",
          code: "FETCH_ERROR",
          timestamp: expect.any(String)
        });
      });

      it("should log errors appropriately", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        
        recommendationService.getRecommendations.mockRejectedValue(
          new Error("Test error")
        );

        await request(app)
          .get("/recommendations/1")
          .expect(500);

        consoleErrorSpy.mockRestore();
      });

      it("should not expose sensitive error details in production", async () => {
        process.env.NODE_ENV = "production";

        recommendationService.getRecommendations.mockRejectedValue(
          new Error("Sensitive DB error: connection string...")
        );

        const res = await request(app)
          .get("/recommendations/1")
          .expect(500);

        expect(res.body.message).toBeUndefined();
        
        process.env.NODE_ENV = "test";
      });

      it("should expose error details in development", async () => {
        process.env.NODE_ENV = "development";

        const testError = new Error("Development error");
        recommendationService.getRecommendations.mockRejectedValue(testError);

        const res = await request(app)
          .get("/recommendations/1")
          .expect(500);

        expect(res.body.message).toBeDefined();
        
        process.env.NODE_ENV = "test";
      });

      it("should include timestamp on error responses", async () => {
        recommendationService.getRecommendations.mockRejectedValue(
          new Error("Test error")
        );

        const res = await request(app)
          .get("/recommendations/1")
          .expect(500);

        expect(res.body.timestamp).toBeDefined();
        expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
      });
    });

    // ============================================
    // 5. RESPONSE FORMAT
    // ============================================

    describe("Response Format", () => {
      beforeEach(() => {
        recommendationService.getRecommendations.mockResolvedValue([
          { id: 1, name: "Product A", score: 0.9 }
        ]);
      });

      it("should always include success field", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body).toHaveProperty("success");
        expect(typeof res.body.success).toBe("boolean");
      });

      it("should include data array in success response", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body).toHaveProperty("data");
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it("should include metadata in success response", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        expect(res.body).toHaveProperty("metadata");
        expect(typeof res.body.metadata).toBe("object");
      });

      it("should include error field in error response", async () => {
        const res = await request(app)
          .get("/recommendations/abc")
          .expect(400);

        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toBe("string");
      });

      it("should include code field in error response", async () => {
        const res = await request(app)
          .get("/recommendations/abc")
          .expect(400);

        expect(res.body).toHaveProperty("code");
        expect(typeof res.body.code).toBe("string");
      });

      it("should not include extra fields in response", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        const allowedKeys = ["success", "data", "metadata"];
        const actualKeys = Object.keys(res.body);
        const unexpectedKeys = actualKeys.filter(
          k => !allowedKeys.includes(k)
        );

        expect(unexpectedKeys).toEqual([]);
      });
    });

    // ============================================
    // 6. PERFORMANCE & LIMITS
    // ============================================

    describe("Performance", () => {
      beforeEach(() => {
        recommendationService.getRecommendations.mockResolvedValue(
          Array(50).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Product ${i + 1}`
          }))
        );
      });

      it("should complete request within 5 seconds", async () => {
        const start = Date.now();

        await request(app)
          .get("/recommendations/1")
          .expect(200);

        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
      });

      it("should handle maximum limit (50 products)", async () => {
        const res = await request(app)
          .get("/recommendations/1?limit=50")
          .expect(200);

        expect(res.body.data.length).toBeLessThanOrEqual(50);
      });

      it("should not exceed memory with large result sets", async () => {
        const res = await request(app)
          .get("/recommendations/1")
          .expect(200);

        // Check response size is reasonable (< 1MB)
        const responseSize = JSON.stringify(res.body).length;
        expect(responseSize).toBeLessThan(1024 * 1024);
      });
    });

    // ============================================
    // 7. HTTP STATUS CODES
    // ============================================

    describe("HTTP Status Codes", () => {
      it("should return 200 for successful request", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/1");

        expect(res.status).toBe(200);
      });

      it("should return 400 for bad request (invalid userId)", async () => {
        const res = await request(app)
          .get("/recommendations/abc");

        expect(res.status).toBe(400);
      });

      it("should return 400 for bad request (invalid type)", async () => {
        recommendationService.getRecommendations.mockResolvedValue([]);

        const res = await request(app)
          .get("/recommendations/1?type=invalid");

        expect(res.status).toBe(400);
      });

      it("should return 500 for server error", async () => {
        recommendationService.getRecommendations.mockRejectedValue(
          new Error("Internal error")
        );

        const res = await request(app)
          .get("/recommendations/1");

        expect(res.status).toBe(500);
      });
    });
  });

  // ============================================
  // 8. INTEGRATION TESTS
  // ============================================

  describe("Integration Tests", () => {
    it("should handle multiple concurrent requests", async () => {
      recommendationService.getRecommendations.mockResolvedValue([]);

      const requests = Array(5).fill(null).map((_, i) =>
        request(app).get(`/recommendations/${i + 1}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });

    it("should maintain separate context for different users", async () => {
      recommendationService.getRecommendations.mockImplementation(
        userId => Promise.resolve([{ userId, id: 1 }])
      );

      const res1 = await request(app)
        .get("/recommendations/1")
        .expect(200);

      const res2 = await request(app)
        .get("/recommendations/2")
        .expect(200);

      expect(res1.body.metadata.userId).toBe(1);
      expect(res2.body.metadata.userId).toBe(2);
    });
  });
});
```

---

## Integration Tests (with Database)

### Test File: `__tests__/recommendations.integration.test.js`

```javascript
const request = require("supertest");
const app = require("../src/app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Recommendations Integration Tests", () => {
  describe("with Real Database", () => {
    let userId;

    beforeAll(async () => {
      // Setup: Create test user
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          password: "hashed_password",
          name: "Test User"
        }
      });
      userId = user.id;
    });

    afterAll(async () => {
      // Cleanup
      await prisma.user.deleteMany();
      await prisma.product.deleteMany();
      await prisma.$disconnect();
    });

    it("should fetch recommendations for existing user", async () => {
      const res = await request(app)
        .get(`/recommendations/${userId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.metadata.userId).toBe(userId);
    });

    it("should work with all recommendation types", async () => {
      const types = ["hybrid", "content", "collaborative"];

      for (const type of types) {
        const res = await request(app)
          .get(`/recommendations/${userId}?type=${type}`)
          .expect(200);

        expect(res.body.metadata.type).toBe(type);
      }
    });
  });
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- recommendationController.test.js
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (for development)
```bash
npm test -- --watch
```

### Run Single Test
```bash
npm test -- --testNamePattern="should return recommendations"
```

---

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | - |
| Integration | 70% | - |
| E2E | 60% | - |
| Overall | 75% | - |

---

## Common Testing Scenarios

### Scenario 1: User Not Found
```javascript
it("should handle user not found gracefully", async () => {
  recommendationService.getRecommendations.mockResolvedValue([]);

  const res = await request(app)
    .get("/recommendations/99999")
    .expect(200); // Still 200 with empty array

  expect(res.body.data).toEqual([]);
});
```

### Scenario 2: Large Result Set
```javascript
it("should handle large result sets efficiently", async () => {
  const largeData = Array(100).fill(null).map((_, i) => ({
    id: i,
    name: `Product ${i}`
  }));

  recommendationService.getRecommendations.mockResolvedValue(largeData);

  const res = await request(app)
    .get("/recommendations/1")
    .expect(200);

  expect(res.body.data.length).toBeLessThanOrEqual(50);
});
```

### Scenario 3: Complex Query Parameters
```javascript
it("should handle complex query strings", async () => {
  recommendationService.getRecommendations.mockResolvedValue([]);

  const res = await request(app)
    .get("/recommendations/1?type=collaborative&limit=25&page=2")
    .expect(200);

  expect(res.body.metadata.type).toBe("collaborative");
  expect(res.body.metadata.limit).toBe(25);
});
```

---

## Debugging Tests

### Run with Verbose Output
```bash
npm test -- --verbose
```

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest --testNamePattern="specific test"
```

### Check Test File Syntax
```bash
npm test -- --showConfig
```

---

## Tips for Testing

1. **Mock External Dependencies** - Use jest.mock() for services
2. **Test Edge Cases** - Test min, max, empty, null values
3. **Use Descriptive Names** - Make test purpose clear
4. **Group Related Tests** - Use describe() blocks
5. **Clean Up After Tests** - Use afterEach/afterAll
6. **Test Error Scenarios** - What happens when things fail?
7. **Verify Response Format** - Always check structure matches spec
8. **Test Status Codes** - Ensure correct HTTP codes returned

---

**Related Files:**
- Main Controller: `backend/controllers/recommendationController.js`
- Examples: `backend/controllers/recommendationControllerExamples.js`
- Best Practices: `backend/CONTROLLER_BEST_PRACTICES.md`
- Quick Reference: `backend/CONTROLLER_QUICK_REFERENCE.md`

