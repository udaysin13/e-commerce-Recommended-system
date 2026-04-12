# Recommendation Controller - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints Overview

| Endpoint | Method | Description | Status Code |
|----------|--------|-------------|-------------|
| `/recommendations/:userId` | GET | Get recommendations for user | 200, 400, 500 |
| `/recommendations/:userId/analysis` | GET | Analyze recommendations | 200, 400, 500 |
| `/recommendations/:userId/similar/:productId` | GET | Find similar products | 200, 400, 500 |

---

## 1. GET /recommendations/:userId

### Description
Get recommendations for a specific user using specified algorithm.

### Request

#### Path Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | number | Yes | ID of the user (positive integer) |

#### Query Parameters
| Param | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| type | string | hybrid | See types below | Recommendation algorithm type |
| limit | number | 10 | 1-50 | Number of recommendations to return |
| page | number | 1 | ≥1 | Page number for pagination |

#### Supported Types
- `hybrid` - Combines multiple algorithms
- `content` - Content-based filtering
- `collaborative` - Collaborative filtering
- `category` - Category-based recommendations
- `popular` - Most popular products
- `trending` - Trending products
- `recently-viewed` - Products similar to recently viewed

#### Examples

##### Basic Request
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/recommendations/1
```

##### With Custom Type and Limit
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?type=content&limit=20"
```

##### With Pagination
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?limit=10&page=2"
```

### Response

#### Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Product Name",
      "price": 29.99,
      "category": "Electronics",
      "rating": 4.5,
      "image": "url/to/image.jpg",
      "matchScore": 0.95,
      "reason": "Based on your viewing history"
    },
    {
      "id": 102,
      "name": "Another Product",
      "price": 39.99,
      "category": "Electronics",
      "rating": 4.3,
      "image": "url/to/image.jpg",
      "matchScore": 0.87,
      "reason": "Similar products you liked"
    }
  ],
  "metadata": {
    "userId": 1,
    "type": "hybrid",
    "limit": 10,
    "page": 1,
    "count": 2,
    "executionTime": "145ms",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error - Invalid userId (400)
```json
{
  "success": false,
  "error": "Invalid userId. Must be a positive integer.",
  "code": "INVALID_USER_ID",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error - Invalid Type (400)
```json
{
  "success": false,
  "error": "Invalid type: unknown_type",
  "code": "INVALID_TYPE",
  "supportedTypes": ["hybrid", "content", "collaborative", "category", "trending"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error - Server Error (500)
```json
{
  "success": false,
  "error": "Failed to fetch recommendations",
  "code": "FETCH_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response Format Details

#### Success Response
- **success** (boolean): Always `true` for successful requests
- **data** (array): Array of recommended products
  - Each product includes: id, name, price, category, rating, matchScore
- **metadata** (object): Request and response information
  - userId: The user ID requested
  - type: The algorithm type used
  - limit: Number of recommendations requested
  - page: Page number
  - count: Actual number of recommendations returned
  - executionTime: Server-side execution time
  - timestamp: ISO 8601 timestamp

#### Error Response
- **success** (boolean): Always `false` for errors
- **error** (string): Human-readable error message
- **code** (string): Error code for programmatic handling
- **message** (string): Optional detailed error (dev only)
- **timestamp** (string): ISO 8601 timestamp

### Status Codes

| Code | Condition | Example |
|------|-----------|---------|
| 200 | Request successful, returns recommendations | Valid request processed |
| 400 | Bad request, validation failed | Invalid userId, invalid type |
| 401 | Unauthorized, missing/invalid token | Missing Authorization header |
| 403 | Forbidden, not authorized | User accessing another user's data |
| 404 | Not found | Endpoint doesn't exist |
| 500 | Server error | Database connection failed |

---

## 2. GET /recommendations/:userId/analysis

### Description
Get detailed analysis of recommendations including scores and reasons.

### Request

#### Path Parameters
| Param | Type | Required |
|-------|------|----------|
| userId | number | Yes |

#### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | hybrid | Algorithm type |
| limit | number | 5 | Max products to analyze |
| verbose | boolean | false | Include detailed analysis |

#### Example
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1/analysis?verbose=true"
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "algorithm": "hybrid",
    "recommendations": [
      {
        "productId": 101,
        "matchScore": 0.95,
        "scores": {
          "contentBased": 0.92,
          "collaborative": 0.98,
          "popularity": 0.90
        },
        "reasons": [
          "95% match with your viewing history",
          "Users similar to you liked this",
          "Popular in your category"
        ],
        "userProfile": {
          "preferences": ["Electronics", "Gadgets"],
          "avgRating": 4.5,
          "purchaseHistory": 15
        }
      }
    ]
  },
  "metadata": {
    "userId": 1,
    "analysisTime": "320ms",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 3. GET /recommendations/:userId/similar/:productId

### Description
Find products similar to a specified product.

### Request

#### Path Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | number | Yes | User ID |
| productId | number | Yes | Product ID to find similar items |

#### Query Parameters
| Param | Type | Default | Range |
|-------|------|---------|-------|
| limit | number | 10 | 1-50 |
| threshold | number | 0.5 | 0.0-1.0 |

#### Example
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1/similar/101?limit=15"
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "sourceProduct": {
      "id": 101,
      "name": "Source Product",
      "category": "Electronics",
      "price": 29.99
    },
    "similarProducts": [
      {
        "id": 102,
        "name": "Similar Product 1",
        "similarity": 0.92,
        "category": "Electronics",
        "price": 31.99
      },
      {
        "id": 103,
        "name": "Similar Product 2",
        "similarity": 0.87,
        "category": "Electronics",
        "price": 32.99
      }
    ]
  },
  "metadata": {
    "userId": 1,
    "sourceProductId": 101,
    "count": 2,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Common Patterns

### Pattern 1: Basic Recommendations
```bash
# Get default (hybrid) recommendations
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/recommendations/1
```

### Pattern 2: Content-Based Recommendations
```bash
# Get content-based recommendations (category, price similarity)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?type=content&limit=20"
```

### Pattern 3: Collaborative Filtering
```bash
# Get collaborative recommendations (user-to-user similarity)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?type=collaborative&limit=15"
```

### Pattern 4: Paginated Results
```bash
# Get first page
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?limit=10&page=1"

# Get second page
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1?limit=10&page=2"
```

### Pattern 5: Find Similar Products
```bash
# Find products similar to product 101
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1/similar/101?limit=10"
```

### Pattern 6: Detailed Analysis
```bash
# Get analysis with detailed scoring
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/recommendations/1/analysis?verbose=true"
```

---

## Error Codes Reference

| Code | HTTP | Meaning | Action |
|------|------|---------|--------|
| INVALID_USER_ID | 400 | userId is invalid | Provide valid positive integer |
| INVALID_TYPE | 400 | Recommendation type invalid | Use supported type |
| INVALID_PRODUCT_ID | 400 | Product ID invalid | Provide valid product ID |
| BAD_REQUEST | 400 | Request failed validation | Check parameters |
| NOT_FOUND | 404 | Resource not found | Verify ID exists |
| UNAUTHORIZED | 401 | Missing/invalid token | Provide valid JWT |
| FORBIDDEN | 403 | Not authorized for resource | Check permissions |
| FETCH_ERROR | 500 | Server error fetching data | Try again later |
| INTERNAL_ERROR | 500 | Unexpected server error | Contact support |

---

## Rate Limiting

```
Rate Limit: 100 requests per 15 minutes per user
Rate-Limit-Limit: 100
Rate-Limit-Remaining: 95
Rate-Limit-Reset: 1234567890
```

When rate limited, server returns 429 Too Many Requests:
```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## Performance Metrics

### Typical Response Times

| Type | Time | Note |
|------|------|------|
| Hybrid | 100-200ms | Combines multiple algorithms |
| Content | 50-100ms | Fast, category/price based |
| Collaborative | 150-300ms | Requires user similarity calc |
| Popular | 20-50ms | Fastest, cache friendly |
| Trending | 40-80ms | Time-based calculations |

---

## Caching Strategy

### Response Headers
```
Cache-Control: public, max-age=3600
ETag: "abc123..."
Last-Modified: Mon, 15 Jan 2024 10:00:00 GMT
```

### Supported Cache Times
- Popular products: 1 hour
- Trending: 30 minutes
- User-specific: No cache (personalized)
- Analysis: 5 minutes

---

## Webhook Events

When recommendations are generated, the system can trigger webhooks:

```javascript
// Example webhook payload
{
  "event": "recommendations.generated",
  "userId": 1,
  "type": "hybrid",
  "count": 10,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "recommendations": [...]
}
```

---

## SDK Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get recommendations
const recommendations = await client.get(`/recommendations/1?type=hybrid&limit=10`);

// Find similar products
const similar = await client.get(`/recommendations/1/similar/101`);
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
base_url = 'http://localhost:3000/api'

# Get recommendations
response = requests.get(
  f'{base_url}/recommendations/1',
  params={'type': 'hybrid', 'limit': 10},
  headers=headers
)
recommendations = response.json()

# Find similar products
response = requests.get(
  f'{base_url}/recommendations/1/similar/101',
  headers=headers
)
similar = response.json()
```

### JavaScript (Browser Fetch)
```javascript
const token = localStorage.getItem('authToken');

// Get recommendations
const response = await fetch(
  'http://localhost:3000/api/recommendations/1?type=hybrid&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const recommendations = await response.json();
```

---

## Testing Endpoints

### Using cURL

```bash
# 1. Get token (adjust endpoint as needed)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Test recommendations endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/recommendations/1?type=hybrid&limit=10"

# 3. Test with different types
for type in hybrid content collaborative category trending; do
  echo "Testing $type..."
  curl -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3000/api/recommendations/1?type=$type"
done

# 4. Test error cases
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/recommendations/invalid" # Should return 400

curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/recommendations/1?type=invalid" # Should return 400
```

### Using Postman

1. Create collection "Recommendations API"
2. Create GET request: `{{base_url}}/recommendations/{{userId}}`
3. Add requests for each endpoint
4. Use environment variables: `base_url`, `token`, `userId`
5. Test various query parameters

---

## Migration Guide

### From Old API to New API

#### Old Format
```json
{
  "data": [...],
  "count": 10
}
```

#### New Format
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "count": 10,
    "timestamp": "...",
    "executionTime": "..."
  }
}
```

### Update Client Code
```javascript
// Old
const data = response.data;

// New
const data = response.data;
const metadata = response.metadata;
const count = metadata.count;
const executionTime = metadata.executionTime;
```

---

## Support & Documentation

- **Issues**: backend/RECOMMENDATIONS_GUIDE.md
- **Examples**: backend/controllers/recommendationControllerExamples.js
- **Best Practices**: backend/CONTROLLER_BEST_PRACTICES.md
- **Testing**: backend/CONTROLLER_TESTING_GUIDE.md
- **Quick Ref**: backend/CONTROLLER_QUICK_REFERENCE.md

---

**API Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Status:** Production Ready ✅

