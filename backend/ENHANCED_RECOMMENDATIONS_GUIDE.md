# Enhanced Recommendation System - Integration Guide

## Overview

The Enhanced Recommendation System provides intelligent, personalized product recommendations using:
- **Weighted Interaction Scoring** (PURCHASE > CLICK > VIEW)
- **Recency Decay** (recent interactions weighted more heavily)
- **Collaborative Filtering** (finding similar users)
- **Popularity Boosts** (trending products)
- **Clear Explanations** (why was this recommended?)

## Architecture

### Components

```
Frontend (Client)
    ↓
API Endpoints (/api/enhanced-recommendations)
    ↓
Controllers (enhancedRecommendationController.js)
    ↓
Services (scoringService.js)
    ↓
Database (Prisma)
    ↓
Interaction Data
```

### Key Files

- **Controller**: `backend/controllers/enhancedRecommendationController.js`
- **Routes**: `backend/routes/enhancedRecommendationRoutes.js`
- **Scoring Service**: `backend/services/scoringService.js`

## API Endpoints

### 1. Get Recommendations

```
GET /api/enhanced-recommendations/:userId?algorithm=hybrid&limit=10&includeExplanations=true
```

**Parameters:**
- `userId` (required): The user ID for personalized recommendations
- `algorithm` (optional): `hybrid`, `collaborative`, `content`, or `trending` (default: `hybrid`)
- `limit` (optional): Number of recommendations (1-50, default: 10)
- `includeExplanations` (optional): Include explanation text (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "category": "Electronics",
      "image": "image-url.jpg",
      "score": 85.5,
      "explanation": "matches your viewing history and liked by users like you"
    }
  ],
  "metadata": {
    "userId": "user123",
    "algorithm": "hybrid",
    "limit": 10,
    "count": 10,
    "includeExplanations": true,
    "executionTime": "145ms",
    "timestamp": "2024-01-15T10:30:45Z"
  }
}
```

### 2. Get Scoring Details

```
GET /api/enhanced-recommendations/:userId/details
```

**Purpose**: Debug and transparency - see how scores are calculated

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "recentInteractions": [
      {
        "product": {
          "id": 1,
          "name": "Product Name",
          "category": "Electronics"
        },
        "interaction": {
          "type": "PURCHASE",
          "weight": 5.0,
          "date": "2024-01-10T14:30:00Z"
        },
        "scoring": {
          "baseScore": 5.0,
          "recencyFactor": 0.95,
          "finalScore": 4.75
        }
      }
    ],
    "scoringSystem": {
      "weights": {
        "PURCHASE": 5.0,
        "REVIEW": 4.0,
        "WISHLIST": 3.0,
        "COMPARE": 3.0,
        "CLICK": 2.0,
        "VIEW": 1.0
      },
      "recencyHalfLife": "30 days"
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:45Z"
  }
}
```

## Algorithms Explained

### 1. Hybrid Algorithm (Recommended)

**Weighting:**
- User's own interactions: 50%
- Similar users' preferences: 35%
- Trending products: 15%

**Best For**: General personalization

**Example**:
```
GET /api/enhanced-recommendations/user123?algorithm=hybrid&limit=20
```

### 2. Collaborative Filtering

**Method**: Finds products liked by similar users

**Best For**: Discovering new products from similar shoppers

**Example**:
```
GET /api/enhanced-recommendations/user123?algorithm=collaborative&limit=20
```

### 3. Content-Based

**Method**: Recommends products similar to user's past interactions

**Best For**: Finding variations of products user has already liked

**Example**:
```
GET /api/enhanced-recommendations/user123?algorithm=content&limit=20
```

### 4. Trending

**Method**: Returns products with recent high-value interactions

**Best For**: Showing what's hot right now

**Example**:
```
GET /api/enhanced-recommendations/user123?algorithm=trending&limit=20
```

## Scoring System

### Interaction Weights

```javascript
PURCHASE: 5.0    // User bought it - strongest signal
REVIEW: 4.0      // User wrote a review
WISHLIST: 3.0    // User saved it for later
COMPARE: 3.0     // User compared products
CLICK: 2.0       // User clicked on it
VIEW: 1.0        // User viewed it - weakest signal
```

### Recency Decay

Interactions decay exponentially with time:
- **Half-life**: 30 days
- Formula: `decay = 0.5^(age_days / 30)`
- **Examples**:
  - 0 days old: 1.0 (100%)
  - 30 days old: 0.5 (50%)
  - 60 days old: 0.25 (25%)
  - 90 days old: 0.125 (12.5%)

### Popularity Boost

Popular products get boosted based on:
- Recent interaction count (last 7 days)
- Product rating
- Purchase count

## Integration Steps

### 1. Mount Routes

In `backend/src/app.js`:

```javascript
const enhancedRecommendationsRouter = require('../routes/enhancedRecommendationRoutes');

// Mount the router
app.use('/api/enhanced-recommendations', enhancedRecommendationsRouter);
```

### 2. Frontend Integration

```javascript
// lib/api.js
export async function getRecommendations(userId, options = {}) {
  const params = new URLSearchParams({
    algorithm: options.algorithm || 'hybrid',
    limit: options.limit || 10,
    includeExplanations: options.includeExplanations !== false,
  });

  const response = await fetch(
    `/api/enhanced-recommendations/${userId}?${params}`
  );

  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
}

// Usage in React component
import { getRecommendations } from '@/lib/api';

export default function RecommendationsSection({ userId }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getRecommendations(userId, {
      algorithm: 'hybrid',
      limit: 10,
    }).then((res) => setRecommendations(res.data));
  }, [userId]);

  return (
    <div>
      {recommendations.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          explanation={product.explanation}
        />
      ))}
    </div>
  );
}
```

## Performance Considerations

### Query Optimization

The recommendation system uses:
- **Indexed queries** on `userId`, `productId`, `type`
- **GroupBy** for efficient aggregation
- **Batch processing** of interactions
- **Take/Skip** for pagination

### Caching Strategy (Recommended)

```javascript
// Cache recommendations for 1 hour
const CACHE_TTL = 3600000; // 1 hour in ms

const cache = new Map();

async function getCachedRecommendations(userId, algorithm) {
  const key = `${userId}-${algorithm}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await getRecommendations(userId, { algorithm });
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### Database Indexes

Ensure these indexes exist for performance:

```prisma
// In schema.prisma
model Interaction {
  // ... fields ...
  @@index([userId])
  @@index([productId])
  @@index([type])
  @@index([userId, createdAt])
  @@index([productId, createdAt])
}
```

## Testing

### Test Recommendations

```bash
# Get hybrid recommendations for a user
curl "http://localhost:3000/api/enhanced-recommendations/user123?algorithm=hybrid&limit=10"

# Get collaborative recommendations
curl "http://localhost:3000/api/enhanced-recommendations/user123?algorithm=collaborative&limit=10"

# Get trending recommendations
curl "http://localhost:3000/api/enhanced-recommendations/user123?algorithm=trending&limit=10"

# Get scoring details
curl "http://localhost:3000/api/enhanced-recommendations/user123/details"
```

### Automated Tests

```javascript
// test/recommendations.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Enhanced Recommendations API', () => {
  describe('GET /api/enhanced-recommendations/:userId', () => {
    it('should return hybrid recommendations', async () => {
      const response = await request(app)
        .get('/api/enhanced-recommendations/user123')
        .query({ algorithm: 'hybrid', limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body.metadata.algorithm).toBe('hybrid');
    });

    it('should return collaborative recommendations', async () => {
      const response = await request(app)
        .get('/api/enhanced-recommendations/user123')
        .query({ algorithm: 'collaborative' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate invalid algorithm', async () => {
      const response = await request(app)
        .get('/api/enhanced-recommendations/user123')
        .query({ algorithm: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_ALGORITHM');
    });
  });
});
```

## Customization

### Tuning Weights

Adjust interaction weights in `scoringService.js`:

```javascript
const INTERACTION_WEIGHTS = {
  PURCHASE: 6.0,    // Increase purchase importance
  REVIEW: 3.5,      // Decrease review weight
  CLICK: 1.5,       // Decrease click weight
  VIEW: 0.5,        // Decrease view weight
};
```

### Changing Recency Half-Life

Make recent interactions decay slower (or faster):

```javascript
const RECENCY_CONFIG = {
  HALF_LIFE_DAYS: 45,  // Interactions half-life every 45 days instead of 30
};
```

### Algorithm Weights

Adjust algorithm mixing in `enhancedRecommendationController.js`:

```javascript
// In getHybridRecommendations()
const blended = mergeAndBlendScores([
  { products: contentScored, weight: 0.6 },   // Increase to 60%
  { products: collaborativeScored, weight: 0.25 }, // Decrease to 25%
  { products: trendingProducts, weight: 0.15 },
]);
```

## Monitoring & Analytics

### Key Metrics to Track

- **Recommendation coverage**: % of users receiving recommendations
- **CTR (Click-Through Rate)**: % who click on recommendations
- **Conversion rate**: % who purchase recommended items
- **Execution time**: API response time
- **Algorithm popularity**: Which algorithm users prefer

### Logging

The system logs:
- Invalid requests
- Algorithm selection
- Execution time
- Errors and exceptions

Access logs: Check `backend/logs/` directory

## Troubleshooting

### No Recommendations Returned

**Possible causes:**
1. User has no interaction history
2. No similar users found
3. Recency window too narrow

**Solution:**
```javascript
// Increase recency window
const recommendations = await scoreUserInteractions(userId, {
  limit: 20,
  recencyDays: 180  // Increase from 90 to 180
});

// Or use trending as fallback
// Already handled in controller
```

### Slow API Response

**Possible causes:**
1. Database queries not optimized
2. Too many interactions to process
3. Large limit parameter

**Solution:**
```javascript
// Ensure database indexes exist
// Limit max results
const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);

// Use caching
```

### Same Recommendations Every Time

**Possible causes:**
1. Only one algorithm being used
2. Insufficient interaction data
3. Weights not varied enough

**Solution:**
```javascript
// Try different algorithms
// Ensure interactions are tracked
// Adjust weights
```

## Next Steps

1. **Mount routes** in main app
2. **Test endpoints** with sample data
3. **Integrate frontend** with recommendation APIs
4. **Monitor performance** and user engagement
5. **Tune weights** based on business metrics
6. **Add caching** for production
7. **Set up analytics** to track effectiveness

For support or questions, refer to the main README.md or check individual file headers for implementation details.
