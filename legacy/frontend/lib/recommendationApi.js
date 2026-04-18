/**
 * Recommendation API Client
 * 
 * Handles all recommendation-related API calls
 */

import { getApiBaseUrl, getApiOriginUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl();
const API_ORIGIN_URL = getApiOriginUrl();

/**
 * Fetch recommendations for a user
 * 
 * @param {string|number} userId - The user ID
 * @param {Object} options - Configuration options
 *   - algorithm: 'hybrid' | 'collaborative' | 'content' | 'trending' (default: 'hybrid')
 *   - limit: number of recommendations (default: 10)
 *   - includeExplanations: boolean (default: true)
 * @returns {Promise<Object>} Recommendation response
 */
export async function getRecommendations(userId, options = {}) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const {
    algorithm = 'hybrid',
    limit = 10,
    includeExplanations = true,
  } = options;

  try {
    const params = new URLSearchParams({
      algorithm,
      limit: Math.min(limit, 50), // Cap at 50
      includeExplanations,
    });

    const url = `${API_BASE_URL}/enhanced-recommendations/${userId}?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // No caching for real-time recommendations
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || `Failed to fetch recommendations (${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Recommendation API error:', error);
    throw error;
  }
}

/**
 * Fetch recommendation details for debugging
 * 
 * @param {string|number} userId - The user ID
 * @returns {Promise<Object>} Detailed scoring information
 */
export async function getRecommendationDetails(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const url = `${API_BASE_URL}/enhanced-recommendations/${userId}/details`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch details (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Recommendation details API error:', error);
    throw error;
  }
}

/**
 * Get recommendations with automatic fallback
 * Falls back to simpler algorithm if primary fails
 * 
 * @param {string|number} userId - The user ID
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Recommendation response
 */
export async function getRecommendationsWithFallback(userId, options = {}) {
  const algorithms = [
    options.algorithm || 'hybrid',
    'collaborative',
    'content',
    'trending',
  ];

  let lastError = null;
  for (const algorithm of algorithms) {
    try {
      const response = await getRecommendations(userId, { ...options, algorithm });
      // Ensure response has proper structure
      if (response && response.data) {
        return {
          success: true,
          data: response.data || [],
          metadata: response.metadata || { algorithm, count: (response.data || []).length },
        };
      }
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`${algorithm} algorithm failed, trying next...`, error.message);
      // Continue to next algorithm
    }
  }

  // If all fail, return error result
  return {
    success: false,
    data: [],
    error: lastError?.message || 'All recommendation algorithms failed. Please check if the backend is running.',
  };
}

/**
 * Validate if API is available
 * 
 * @returns {Promise<boolean>} True if API is available
 */
export async function isRecommendationApiAvailable() {
  try {
    const response = await fetch(API_ORIGIN_URL, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Batch fetch recommendations for multiple users
 * 
 * @param {Array<string|number>} userIds - Array of user IDs
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Map of userId to recommendations
 */
export async function batchGetRecommendations(userIds, options = {}) {
  const promises = userIds.map((userId) =>
    getRecommendations(userId, options).catch((error) => ({
      userId,
      error,
      data: [],
    }))
  );

  const results = await Promise.all(promises);
  
  return results.reduce((acc, result) => {
    if (result.userId) {
      acc[result.userId] = result;
    } else {
      acc[result.data?.userId || 'unknown'] = result;
    }
    return acc;
  }, {});
}

/**
 * Cache wrapper for recommendations
 * Simple in-memory cache (for static generation)
 */
const recommendationCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCachedRecommendations(userId, options = {}) {
  const cacheKey = `${userId}-${options.algorithm || 'hybrid'}-${options.limit || 10}`;
  const cached = recommendationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  return null;
}

export function setCachedRecommendations(userId, recommendations, options = {}) {
  const cacheKey = `${userId}-${options.algorithm || 'hybrid'}-${options.limit || 10}`;
  recommendationCache.set(cacheKey, {
    data: recommendations,
    timestamp: Date.now(),
  });
}

export function clearRecommendationCache() {
  recommendationCache.clear();
}
