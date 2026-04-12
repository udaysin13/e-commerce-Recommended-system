# Enhanced Recommendation System - Setup Checklist

## Pre-Implementation

- [ ] Review `ENHANCED_RECOMMENDATIONS_GUIDE.md` documentation
- [ ] Understand scoring algorithms and weighting system
- [ ] Review code in `enhancedRecommendationController.js` and `scoringService.js`
- [ ] Ensure Prisma database is properly set up with Interaction model

## Database Setup

- [ ] Verify Interaction model exists in `schema.prisma`
- [ ] Check that Product model has required fields (id, name, price, category, image)
- [ ] Verify User model exists and has id field
- [ ] Run `npx prisma migrate dev` to apply any pending migrations
- [ ] Create indexes for performance:
  ```sql
  CREATE INDEX idx_interaction_userid ON interaction(userId);
  CREATE INDEX idx_interaction_productid ON interaction(productId);
  CREATE INDEX idx_interaction_type ON interaction(type);
  CREATE INDEX idx_interaction_userid_createdat ON interaction(userId, createdAt);
  CREATE INDEX idx_interaction_productid_createdat ON interaction(productId, createdAt);
  ```

## Backend Setup

### Step 1: Mount Routes

**File**: `backend/src/app.js`

```javascript
// Add this import at the top
const enhancedRecommendationsRouter = require('../routes/enhancedRecommendationRoutes');

// Add this after other route declarations (before app.use(errorHandler))
app.use('/api/enhanced-recommendations', enhancedRecommendationsRouter);
```

### Step 2: Verify Dependencies

**File**: `backend/package.json`

Ensure these are installed:
- [ ] `express` (already installed)
- [ ] `prisma` (already installed)
- [ ] `@prisma/client` (already installed)

If not, run:
```bash
npm install express @prisma/client
```

### Step 3: Create Utilities (if missing)

**File**: `backend/utils/logger.js` (create if doesn't exist)

```javascript
// Simple logger utility
module.exports = {
  debug: (msg, data) => console.debug(`[DEBUG] ${msg}`, data),
  info: (msg, data) => console.info(`[INFO] ${msg}`, data),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data),
  error: (msg, data) => {
    console.error(`[ERROR] ${msg}`, data);
    // Could also send to external logging service
  },
};
```

**File**: `backend/utils/validators.js` (create if doesn't exist)

```javascript
// Validation utilities
function validateUserId(userId) {
  if (!userId) {
    return { error: 'User ID is required' };
  }
  
  if (typeof userId !== 'string' && typeof userId !== 'number') {
    return { error: 'User ID must be a string or number' };
  }
  
  return { userId: String(userId) };
}

module.exports = {
  validateUserId,
};
```

### Step 4: Verify Files Created

- [ ] `backend/controllers/enhancedRecommendationController.js` ✓ (created)
- [ ] `backend/routes/enhancedRecommendationRoutes.js` ✓ (created)
- [ ] `backend/services/scoringService.js` ✓ (exists, verify exports)

## Testing Setup

### Manual Testing

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test hybrid recommendations**:
   ```bash
   curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=hybrid&limit=5"
   ```

3. **Test collaborative filtering**:
   ```bash
   curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=collaborative&limit=5"
   ```

4. **Test trending**:
   ```bash
   curl "http://localhost:3000/api/enhanced-recommendations/1?algorithm=trending&limit=5"
   ```

5. **Test details endpoint**:
   ```bash
   curl "http://localhost:3000/api/enhanced-recommendations/1/details"
   ```

### Automated Testing

- [ ] Create test file: `backend/test/recommendations.test.js`
- [ ] Run tests: `npm test` (or `npm run test:recommendations`)
- [ ] Verify all endpoints respond correctly
- [ ] Check error handling with invalid parameters

## Frontend Integration

### Step 1: Create API Client

**File**: `frontend/lib/api.js` (add these functions)

```javascript
// Enhanced recommendations functions
export async function getRecommendations(userId, options = {}) {
  const params = new URLSearchParams({
    algorithm: options.algorithm || 'hybrid',
    limit: options.limit || 10,
    includeExplanations: options.includeExplanations !== false,
  });

  const response = await fetch(
    `/api/enhanced-recommendations/${userId}?${params}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch recommendations');
  }

  return response.json();
}

export async function getRecommendationDetails(userId) {
  const response = await fetch(
    `/api/enhanced-recommendations/${userId}/details`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch recommendation details');
  }

  return response.json();
}
```

### Step 2: Create Recommendation Component

**File**: `frontend/components/RecommendationsList.js`

```javascript
'use client';

import { useEffect, useState } from 'react';
import { getRecommendations } from '@/lib/api';
import ProductCard from './ProductCard';

export default function RecommendationsList({ userId, algorithm = 'hybrid', limit = 10 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const response = await getRecommendations(userId, { algorithm, limit });
        setRecommendations(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [userId, algorithm, limit]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;
  if (recommendations.length === 0) return <div>No recommendations available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((product) => (
        <div key={product.id}>
          <ProductCard product={product} />
          {product.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              ℹ️ {product.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Add to Pages

**File**: `frontend/app/products/page.js` (add recommendations section)

```javascript
import RecommendationsList from '@/components/RecommendationsList';

export default function ProductsPage({ searchParams }) {
  const userId = searchParams.userId || '1'; // Get from auth

  return (
    <div>
      {/* Existing content */}
      
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <RecommendationsList 
          userId={userId} 
          algorithm="hybrid" 
          limit={12} 
        />
      </section>
    </div>
  );
}
```

## Configuration & Tuning

### Adjust Scoring Weights

**File**: `backend/services/scoringService.js`

Modify `INTERACTION_WEIGHTS` to prioritize certain interactions:

```javascript
const INTERACTION_WEIGHTS = {
  PURCHASE: 5.0,    // Adjust if needed
  REVIEW: 4.0,      // Adjust if needed
  COMPARE: 3.0,
  WISHLIST: 3.0,
  CLICK: 2.0,
  VIEW: 1.0,
};
```

### Adjust Recency Parameters

**File**: `backend/services/scoringService.js`

Modify `RECENCY_CONFIG`:

```javascript
const RECENCY_CONFIG = {
  HALF_LIFE_DAYS: 30,      // Adjust decay rate (higher = slower decay)
  MINIMUM_WEIGHT: 0.1,     // Minimum weight floor
  CURRENT_DAY_BOOST: 1.5,  // Boost for today's interactions
};
```

### Adjust Algorithm Weights

**File**: `backend/controllers/enhancedRecommendationController.js`

In `getHybridRecommendations()` function:

```javascript
const blended = mergeAndBlendScores([
  { products: contentScored, weight: 0.5, source: "Your interactions" },
  { products: collaborativeScored, weight: 0.35, source: "Users like you" },
  { products: trendingProducts, weight: 0.15, source: "Trending now" },
]);
```

## Performance Optimization

- [ ] Add database indexes (see Database Setup above)
- [ ] Implement caching layer (Redis recommended for production)
- [ ] Monitor API response times
- [ ] Set up request logging
- [ ] Consider pagination for large result sets

## Monitoring & Analytics

- [ ] Set up request logging to track API usage
- [ ] Track which algorithms are most used
- [ ] Monitor recommendation click-through rates
- [ ] Track conversion rates for recommended products
- [ ] Monitor API performance metrics

## Safety Checks

- [ ] Verify user authentication on endpoints (optional - add authMiddleware)
- [ ] Validate all input parameters
- [ ] Handle edge cases (new users, no interactions, etc.)
- [ ] Ensure error messages don't leak system details
- [ ] Rate limit API endpoints (optional)

## Deployment Checklist

### Before Production

- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance tested with realistic data
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Database backups configured
- [ ] Monitoring set up

### Production Deployment

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] Frontend updated with new components
- [ ] Cache layer initialized (if using)
- [ ] Monitoring dashboards created
- [ ] Rollback plan documented

## Post-Deployment

- [ ] Monitor API response times
- [ ] Track user engagement with recommendations
- [ ] Gather feedback from users
- [ ] Fine-tune algorithm weights based on metrics
- [ ] Regular performance audits
- [ ] Keep documentation updated

## Troubleshooting Guide

### Issue: No recommendations returned

**Solutions:**
- [ ] Verify user exists and has interactions
- [ ] Check recencyDays parameter (try increasing)
- [ ] Check database has Interaction records
- [ ] Review server logs for errors

### Issue: Slow API responses

**Solutions:**
- [ ] Check database indexes are created
- [ ] Reduce limit parameter
- [ ] Check database query performance
- [ ] Consider implementing caching

### Issue: Same recommendations every time

**Solutions:**
- [ ] Verify multiple algorithms are working
- [ ] Check weighting is varied
- [ ] Ensure new interactions are being recorded
- [ ] Try different algorithms

### Issue: 404 errors on endpoints

**Solutions:**
- [ ] Verify routes are mounted in app.js
- [ ] Check server is running
- [ ] Verify correct URL format
- [ ] Check for typos in route names

## Support & Next Steps

1. **Test all endpoints** thoroughly
2. **Monitor performance** in production
3. **Gather user feedback** on recommendations
4. **Iterate and improve** algorithm parameters
5. **Scale with caching** if needed
6. **Consider A/B testing** different algorithms
7. **Archive this checklist** as completed

## Sign-Off

- **Date Completed**: _______________
- **Completed By**: _______________
- **Notes**: _______________________________________________

---

For detailed documentation, see `ENHANCED_RECOMMENDATIONS_GUIDE.md`
