# Enhanced Recommendation System - API Testing Guide

## Quick Start Testing

### Prerequisites

- Backend running: `npm run dev` in `backend/` directory
- Base URL: `http://localhost:3000`

### Basic Tests

#### 1. Get Hybrid Recommendations
```bash
curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=5"
```

**Expected Response**: `200 OK` with array of products

#### 2. Get Collaborative Recommendations
```bash
curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=collaborative&limit=5"
```

**Expected Response**: `200 OK` with collaborative filtered products

#### 3. Get Trending Products
```bash
curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=trending&limit=5"
```

**Expected Response**: `200 OK` with trending products

#### 4. Get Content-Based Recommendations
```bash
curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=content&limit=5"
```

**Expected Response**: `200 OK` with content-based recommendations

#### 5. Get Scoring Details
```bash
curl "http://localhost:3000/api/enhanced-recommendations/1/details"
```

**Expected Response**: `200 OK` with detailed scoring breakdown

## Comprehensive Test Cases

### Test Case 1: Valid Requests

```bash
# Test 1.1: Default parameters
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1"

# Test 1.2: With custom limit
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=20"

# Test 1.3: Without explanations
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?includeExplanations=false"

# Test 1.4: All parameters
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=15&includeExplanations=true"
```

### Test Case 2: Algorithm Testing

```bash
# Test 2.1: Hybrid algorithm
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid"

# Test 2.2: Collaborative algorithm
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=collaborative"

# Test 2.3: Content algorithm
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=content"

# Test 2.4: Trending algorithm
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=trending"
```

### Test Case 3: Limit Parameter

```bash
# Test 3.1: Minimum limit
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=1"

# Test 3.2: Default limit
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=10"

# Test 3.3: Maximum limit
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=50"

# Test 3.4: Exceeds maximum (should be capped to 50)
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=100"

# Test 3.5: Less than minimum (should use default)
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=0"

# Test 3.6: Negative limit (should use default)
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=-5"
```

### Test Case 4: Error Handling

```bash
# Test 4.1: Invalid algorithm
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?algorithm=invalid"
# Expected: 400 Bad Request with error message

# Test 4.2: Missing user ID
curl -X GET "http://localhost:3000/api/enhanced-recommendations/"
# Expected: 404 Not Found

# Test 4.3: Invalid user ID format
curl -X GET "http://localhost:3000/api/enhanced-recommendations/invalid@user"
# Expected: 400 Bad Request

# Test 4.4: Non-existent user
curl -X GET "http://localhost:3000/api/enhanced-recommendations/99999"
# Expected: 200 OK (but may return empty or trending)

# Test 4.5: Invalid parameter type
curl -X GET "http://localhost:3000/api/enhanced-recommendations/1?limit=abc"
# Expected: 200 OK (invalid param ignored, uses default)
```

### Test Case 5: Multiple User Tests

```bash
# Test different users to ensure personalization
for user_id in 1 2 3 4 5; do
  echo "Testing user $user_id..."
  curl -s "http://localhost:3000/api/enhanced-recommendations/$user_id?algorithm=hybrid&limit=3" | jq '.data | length'
done
```

### Test Case 6: Algorithm Comparison

```bash
# Get same recommendations with different algorithms
USER_ID=1

echo "Hybrid:"
curl -s "http://localhost:3000/api/enhanced-recommendations/$USER_ID?algorithm=hybrid&limit=5" | jq '.data[] | .id'

echo "Collaborative:"
curl -s "http://localhost:3000/api/enhanced-recommendations/$USER_ID?algorithm=collaborative&limit=5" | jq '.data[] | .id'

echo "Content:"
curl -s "http://localhost:3000/api/enhanced-recommendations/$USER_ID?algorithm=content&limit=5" | jq '.data[] | .id'

echo "Trending:"
curl -s "http://localhost:3000/api/enhanced-recommendations/$USER_ID?algorithm=trending&limit=5" | jq '.data[] | .id'
```

### Test Case 7: Response Format Validation

```bash
# Get response and validate structure
curl -s "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=3" | jq '
{
  success: .success,
  dataCount: (.data | length),
  firstProduct: .data[0] | keys,
  metadata: .metadata | keys
}'
```

**Expected Output**:
```json
{
  "success": true,
  "dataCount": 3,
  "firstProduct": [
    "id",
    "name",
    "description",
    "price",
    "category",
    "image",
    "explanation"
  ],
  "metadata": [
    "userId",
    "algorithm",
    "limit",
    "count",
    "includeExplanations",
    "executionTime",
    "timestamp"
  ]
}
```

### Test Case 8: Performance Testing

```bash
# Measure response time for different limits
for limit in 5 10 20 50; do
  echo "Testing limit=$limit..."
  time curl -s "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=$limit" > /dev/null
done
```

### Test Case 9: Scoring Details Endpoint

```bash
# Get detailed scoring information
curl -s "http://localhost:3000/api/enhanced-recommendations/1/details" | jq '{
  userId: .data.userId,
  interactionCount: (.data.recentInteractions | length),
  weights: .data.scoringSystem.weights
}'
```

### Test Case 10: Concurrent Requests

```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -s "http://localhost:3000/api/enhanced-recommendations/1?limit=5" > /dev/null &
done
wait
echo "All requests completed"
```

## Using Postman

### 1. Import Collection (Optional)

Create a Postman collection with these requests:

**Collection Variables:**
- `base_url`: `http://localhost:3000`
- `user_id`: `1`

### 2. Sample Requests

**Request 1: Hybrid Recommendations**
```
GET {{base_url}}/api/enhanced-recommendations/{{user_id}}?algorithm=hybrid&limit=10
```

**Request 2: Collaborative Recommendations**
```
GET {{base_url}}/api/enhanced-recommendations/{{user_id}}?algorithm=collaborative&limit=10
```

**Request 3: Trending Products**
```
GET {{base_url}}/api/enhanced-recommendations/{{user_id}}?algorithm=trending&limit=10
```

**Request 4: Details**
```
GET {{base_url}}/api/enhanced-recommendations/{{user_id}}/details
```

## Using JavaScript/Node.js

```javascript
// test-api.js

const BASE_URL = 'http://localhost:3000';

async function testRecommendations() {
  console.log('Testing Enhanced Recommendations API...\n');

  // Test 1: Hybrid
  console.log('1. Testing Hybrid Recommendations:');
  try {
    const response = await fetch(
      `${BASE_URL}/api/enhanced-recommendations/1?algorithm=hybrid&limit=5`
    );
    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Count: ${data.data.length}`);
    console.log(`✓ First product: ${data.data[0]?.name}`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }

  console.log('\n2. Testing Collaborative Recommendations:');
  try {
    const response = await fetch(
      `${BASE_URL}/api/enhanced-recommendations/1?algorithm=collaborative&limit=5`
    );
    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Count: ${data.data.length}`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }

  console.log('\n3. Testing Trending:');
  try {
    const response = await fetch(
      `${BASE_URL}/api/enhanced-recommendations/1?algorithm=trending&limit=5`
    );
    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Count: ${data.data.length}`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }

  console.log('\n4. Testing Details:');
  try {
    const response = await fetch(
      `${BASE_URL}/api/enhanced-recommendations/1/details`
    );
    const data = await response.json();
    console.log(`✓ Status: ${response.status}`);
    console.log(`✓ Recent interactions: ${data.data.recentInteractions.length}`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

testRecommendations();
```

Run with: `node test-api.js`

## Performance Benchmarks

### Expected Response Times

- **Hybrid** (with 5-10 recommendations): 100-200ms
- **Collaborative** (with 5-10 recommendations): 150-250ms
- **Content** (with 5-10 recommendations): 80-150ms
- **Trending** (with 5-10 recommendations): 50-100ms
- **Details** endpoint: 100-200ms

### Load Testing (Optional)

Using Apache Bench:

```bash
# Test 100 requests with concurrency of 10
ab -n 100 -c 10 "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=5"
```

## Debugging

### Enable Detailed Logging

Set environment variable:
```bash
DEBUG=* npm run dev
```

### Check Server Logs

Look for patterns:
- `[DEBUG]` - Detailed execution info
- `[INFO]` - General information
- `[WARN]` - Warnings
- `[ERROR]` - Errors

### Common Issues & Solutions

**Issue**: Returns empty array

**Solution**:
1. Verify user has interactions in database
2. Check interaction records exist
3. Try with `algorithm=trending` as fallback

**Issue**: Slow responses

**Solution**:
1. Check database indexes
2. Reduce limit parameter
3. Try simpler algorithm (content or trending)

**Issue**: 400 errors

**Solution**:
1. Validate algorithm parameter
2. Ensure user ID is valid format
3. Check limit is between 1-50

## Documentation

For more detailed information, see:
- [Enhanced Recommendations Guide](./ENHANCED_RECOMMENDATIONS_GUIDE.md)
- [Setup Checklist](./SETUP_CHECKLIST.md)
- [Controller Code](./controllers/enhancedRecommendationController.js)
- [Scoring Service](./services/scoringService.js)

## Reporting Issues

When reporting issues, please include:
1. Request URL and parameters
2. Response status code
3. Response body (first 500 chars)
4. Server logs around the time of request
5. User ID and environment (dev/prod)
