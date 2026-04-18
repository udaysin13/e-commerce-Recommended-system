# Advanced Recommendations - Frontend Integration Guide

## Overview

This guide shows how to integrate the intermediate-level recommendation system into your React/Next.js frontend for displaying personalized, behavior-based recommendations to users.

---

## Quick Start

### 1. Import the New API Functions

In any component, import the advanced recommendation functions:

```javascript
import {
  trackProductView,
  fetchSmartRecommendations,
  fetchUsersAlsoBought,
  fetchAdvancedCollaborative,
  fetchAdvancedContentBased,
  fetchUserBehaviorAnalytics,
  fetchProductAnalytics,
  fetchRecommendationAnalysis,
} from '@/lib/api';
```

### 2. Track Product Views

When user views a product detail page, record it:

```javascript
// In ProductDetailClient.js or similar
import { useEffect } from 'react';
import { trackProductView } from '@/lib/api';

export default function ProductDetail({ product, userId }) {
  useEffect(() => {
    if (product?.id && userId) {
      // Silently track the view (don't wait for response)
      trackProductView(userId, product.id).catch(
        err => console.log('View tracking failed (non-critical)', err)
      );
    }
  }, [product?.id, userId]);

  return (
    // ... product detail JSX
  );
}
```

### 3. Display Smart Recommendations

Show on homepage or as a section:

```javascript
import { useState, useEffect } from 'react';
import { fetchSmartRecommendations } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function RecommendedForYou({ userId }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRecs() {
      try {
        const data = await fetchSmartRecommendations(userId, { limit: 12 });
        setRecs(data.recommendations);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadRecs();
  }, [userId]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!recs.length) return <div>No recommendations available yet</div>;

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recs.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Based on your viewing and purchase patterns
      </p>
    </div>
  );
}
```

### 4. Show "Users Also Bought" on Product Detail

```javascript
import { useState, useEffect } from 'react';
import { fetchUsersAlsoBought } from '@/lib/api';

export default function UsersAlsoBought({ product, userId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    async function loadRelated() {
      setLoading(true);
      try {
        const data = await fetchUsersAlsoBought(userId, product.id, 6);
        setRelated(data.recommendations);
      } catch (err) {
        console.error('Failed to load related products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRelated();
  }, [product?.id, userId]);

  if (loading) return null;
  if (!related.length) return null;

  return (
    <div className="mt-12 p-6 bg-blue-50 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Customers Also Bought</h3>
      <p className="text-sm text-gray-600 mb-4">
        {related[0]?.percentBoughtTogether} of customers who bought this also bought:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Component Examples

### Homepage with Smart Recommendations

```javascript
'use client';

import { useEffect, useState } from 'react';
import { fetchSmartRecommendations, fetchPopularProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const userId = 1; // Get from auth context in real app
  const [smartRecs, setSmartRecs] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // For new users, show popular; for returning users, show smart
        const smart = await fetchSmartRecommendations(userId, { limit: 8 });
        setSmartRecs(smart.recommendations);

        // Always show some popular products
        const pop = await fetchPopularProducts(6);
        setPopular(pop.recommendations);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <main>
      {/* Smart Recommendations */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">Just For You</h2>
        <div className="grid grid-cols-4 gap-4">
          {smartRecs.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="grid grid-cols-4 gap-4">
          {popular.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </main>
  );
}
```

### Product Detail Page with Related Products

```javascript
'use client';

import { useEffect, useState } from 'react';
import { fetchProductById, fetchUsersAlsoBought, trackProductView } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail({ params }) {
  const { id } = params;
  const userId = 1; // From auth context
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Get product details
        const prod = await fetchProductById(id);
        setProduct(prod);

        // Track that user viewed this product
        trackProductView(userId, parseInt(id)).catch(e => 
          console.log('Tracking skipped:', e)
        );

        // Get related products
        const rel = await fetchUsersAlsoBought(userId, parseInt(id), 4);
        setRelated(rel.recommendations);
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, userId]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <main>
      {/* Product Details */}
      <div className="p-8">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl text-blue-600 mt-4">${product.price}</p>
        <p className="mt-4">{product.description}</p>
        {/* Add to cart button, etc. */}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="p-8 bg-gray-50">
          <h2 className="text-xl font-bold mb-6">Frequently Bought Together</h2>
          <div className="grid grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </main>
  );
}
```

### User Dashboard with Analytics

```javascript
'use client';

import { useEffect, useState } from 'react';
import { fetchUserBehaviorAnalytics, fetchRecommendationAnalysis } from '@/lib/api';

export default function UserDashboard() {
  const userId = 1;
  const [behavior, setBehavior] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const b = await fetchUserBehaviorAnalytics(userId);
        setBehavior(b);

        const a = await fetchRecommendationAnalysis(userId, { limit: 5 });
        setAnalysis(a);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    }

    load();
  }, [userId]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      {behavior && (
        <div className="bg-white p-6 rounded-lg mb-8 shadow">
          <h2 className="text-xl font-bold mb-4">Your Activity</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Views</p>
              <p className="text-2xl font-bold">{behavior.analytics.viewCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Purchases</p>
              <p className="text-2xl font-bold">{behavior.analytics.purchases}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p className="text-lg font-bold">{behavior.classification.userType}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {behavior.interpretation.recommendations.strategy}
          </p>
        </div>
      )}

      {analysis && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recommendations For You</h2>
          <div className="space-y-4">
            {analysis.analysis.recommendations.sources && (
              <p className="text-sm text-gray-600">
                Based on: {analysis.analysis.recommendations.sources.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Handling Different User Types

```javascript
'use client';

import { useEffect, useState } from 'react';
import { fetchUserBehaviorAnalytics, fetchSmartRecommendations, fetchPopularProducts } from '@/lib/api';

/**
 * Show different recommendations based on user type
 */
export default function PersonalizedSection({ userId }) {
  const [userType, setUserType] = useState(null);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // Determine user type
        const behavior = await fetchUserBehaviorAnalytics(userId);
        setUserType(behavior.classification.userType);

        // Show appropriate recommendations
        let recommendations;
        switch (behavior.classification.userType) {
          case 'Loyal Customer':
            // Premium products + new items
            recommendations = await fetchSmartRecommendations(userId, { limit: 8 });
            break;

          case 'Repeat Customer':
            // Mix of personalized + popular
            recommendations = await fetchSmartRecommendations(userId, { limit: 8 });
            break;

          case 'Active Browser':
            // Popular items to encourage first purchase
            recommendations = await fetchPopularProducts(8);
            break;

          default:
            // New user - show featured items
            recommendations = await fetchPopularProducts(6);
        }

        setRecs(recommendations.recommendations || recommendations);
      } catch (err) {
        console.error('Failed:', err);
      }
    }

    load();
  }, [userId]);

  return (
    <div className="p-6">
      {userType === 'Loyal Customer' && (
        <h2 className="text-2xl font-bold mb-4">Premium Picks For You</h2>
      )}
      {userType === 'Repeat Customer' && (
        <h2 className="text-2xl font-bold mb-4">Continue Shopping</h2>
      )}
      {userType === 'Active Browser' && (
        <h2 className="text-2xl font-bold mb-4">You Might Like These</h2>
      )}
      {!userType && (
        <h2 className="text-2xl font-bold mb-4">Trending Products</h2>
      )}

      <div className="grid grid-cols-4 gap-4">
        {recs.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling Patterns

```javascript
/**
 * Pattern 1: Fallback to Popular Products
 */
async function loadRecommendations(userId) {
  try {
    const recs = await fetchSmartRecommendations(userId);
    
    // Check data quality
    if (recs.dataQuality === 'low' && recs.recommendations.length === 0) {
      // Fall back to popular
      return await fetchPopularProducts();
    }
    
    return recs.recommendations;
  } catch (err) {
    // Network error - show fallback
    console.log('Recommendations unavailable, showing popular:', err);
    return await fetchPopularProducts();
  }
}

/**
 * Pattern 2: Show Error Message to User
 */
function RecommendationSection({ userId }) {
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSmartRecommendations(userId);
        setRecs(data.recommendations);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [userId]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">Unable to load recommendations</p>
        <p className="text-sm text-red-600">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {recs.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

/**
 * Pattern 3: Show Loading State
 */
function RecommendationSection({ userId }) {
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSmartRecommendations(userId);
        setRecs(data.recommendations);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 h-64 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {recs.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## Advanced Patterns

### Caching Recommendations

```javascript
/**
 * Cache recommendations in sessionStorage for 5 minutes
 */
async function fetchRecommendationsWithCache(userId) {
  const cacheKey = `recs_${userId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    // Cache valid for 5 minutes
    if (age < 5 * 60 * 1000) {
      return data;
    }
  }

  // Fetch fresh data
  const data = await fetchSmartRecommendations(userId);
  
  // Cache it
  sessionStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));

  return data;
}
```

### Analytics Tracking

```javascript
/**
 * Track when user clicks on a recommendation
 */
function ProductCard({ product, fromAlgorithm = 'unknown' }) {
  const handleClick = () => {
    // Track which recommendation algorithm led to a click
    analytics.track('recommendation_clicked', {
      productId: product.id,
      algorithm: fromAlgorithm,
      timestamp: new Date(),
    });

    // Navigate to product page
    navigate(`/products/${product.id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {/* Product card content */}
    </div>
  );
}

// Usage in component
<ProductCard 
  product={p} 
  fromAlgorithm="Smart Recommendations" 
/>
```

### A/B Testing Recommendations

```javascript
/**
 * Show different algorithms to different users
 * for A/B testing performance
 */
async function loadOptimizedRecommendations(userId) {
  // Randomly assign to test group
  const testGroup = Math.random() > 0.5 ? 'smart' : 'collaborative';

  if (testGroup === 'smart') {
    return await fetchSmartRecommendations(userId);
  } else {
    return await fetchAdvancedCollaborative(userId);
  }
}
```

---

## Responsive Design

```javascript
/**
 * Show different grid layouts for different screen sizes
 */
export default function RecommendationGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

---

## API Reference for Components

```javascript
// Track viewing a product
trackProductView(userId, productId)
  → { success: true, tracked: { userId, productId, viewedAt } }

// Get smart recommendations
fetchSmartRecommendations(userId, { productId?, limit? })
  → { recommendations: [...], userBehavior: {...}, dataQuality: '...' }

// Get users also bought
fetchUsersAlsoBought(userId, productId, limit?)
  → { recommendations: [...], percentBoughtTogether: '70%', ... }

// Get similar user recommendations
fetchAdvancedCollaborative(userId, limit?)
  → { recommendations: [...], similarUsersCount: N, averageConfidence: X%, ... }

// Get category-based recommendations
fetchAdvancedContentBased(userId, limit?)
  → { recommendations: [...], preferredCategories: [...] }

// Get user analytics
fetchUserBehaviorAnalytics(userId)
  → { analytics: {...}, classification: {...}, engagement: {...} }

// Get product analytics
fetchProductAnalytics(productId)
  → { analytics: {...}, recommendation: {...}, conversionRate: '...' }

// Get comprehensive analysis
fetchRecommendationAnalysis(userId, { productId?, limit? })
  → { userId, analysis: {...}, dataQuality: {...} }
```

---

## Common Patterns Checklist

- [ ] Track views on product detail pages
- [ ] Show smart recommendations on homepage
- [ ] Show users-also-bought on product detail
- [ ] Handle loading states with placeholders
- [ ] Handle errors with fallback to popular
- [ ] Use appropriate algorithm for each section
- [ ] Cache recommendations when reasonable
- [ ] Track which recommendations get clicked
- [ ] Responsive grid for all screen sizes
- [ ] Test with multiple user types

---

## Summary

The advanced recommendation system is production-ready for frontend integration. Use the patterns above to:

1. **Track**: User browsing behavior
2. **Display**: Personalized recommendations
3. **Analyze**: User engagement and preferences
4. **Optimize**: Different strategies for different user types

All API functions have built-in error handling and graceful degradation. Start with the quick-start examples and expand based on your specific needs.

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Ready for Production
