/**
 * Collaborative Filtering Integration Examples
 * Frontend patterns for using the collaborative filtering API
 */

// ============================================================================
// 1. BASIC HOOK - useCollaborativeRecommendations
// ============================================================================

import { useState, useEffect } from 'react';

export function useCollaborativeRecommendations(userId, options = {}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultOptions = {
    topK: 10,
    minSimilarity: 0.3,
    limit: 10,
  };

  const opts = { ...defaultOptions, ...options };

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams(opts);

        const response = await fetch(
          `/api/recommendations/${userId}/collaborative-filtering?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching collaborative recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, opts.topK, opts.minSimilarity, opts.limit]);

  return { recommendations, loading, error };
}

// ============================================================================
// 2. ANALYSIS HOOK - useUserSimilarityAnalysis
// ============================================================================

export function useUserSimilarityAnalysis(userId) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/recommendations/${userId}/collaborative-filtering/analysis`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.status}`);
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [userId]);

  return { analysis, loading, error };
}

// ============================================================================
// 3. COMPONENT - CollaborativeRecommendationsDisplay
// ============================================================================

import React from 'react';

export function CollaborativeRecommendationsDisplay({ userId, variant = 'default' }) {
  const options = {
    default: { topK: 10, minSimilarity: 0.3, limit: 10 },
    strict: { topK: 5, minSimilarity: 0.6, limit: 5 },
    generous: { topK: 20, minSimilarity: 0.2, limit: 15 },
  };

  const { recommendations, loading, error } = useCollaborativeRecommendations(
    userId,
    options[variant]
  );

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="spinner" />
        <p>Finding recommendations based on similar users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-error">
        <p>Failed to load recommendations: {error}</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="recommendations-empty">
        <p>No recommendations available at this time. Browse products to help us personalize!</p>
      </div>
    );
  }

  return (
    <div className="collaborative-recommendations">
      <h2>Recommended for You</h2>
      <p className="subtitle">Based on users with similar tastes</p>

      <div className="product-grid">
        {recommendations.map((product) => (
          <ProductRecommendationCard
            key={product.productId}
            product={product}
          />
        ))}
      </div>

      <div className="recommendations-footer">
        <span className="count">{recommendations.length} recommendations</span>
        <span className="algorithm">Collaborative Filtering</span>
      </div>
    </div>
  );
}

// ============================================================================
// 4. COMPONENT - ProductRecommendationCard
// ============================================================================

function ProductRecommendationCard({ product }) {
  const matchPercentage = Math.round(product.similarityScore * 100);
  const reasonIcons = {
    purchase: '🛒',
    view: '👁️',
    popular: '⭐',
  };

  return (
    <div className="product-card recommendation">
      <div className="product-badge">
        <span className="match-badge">{matchPercentage}% Match</span>
        {product.fromSimilarUsers && (
          <span className="users-badge">{product.fromSimilarUsers} users</span>
        )}
      </div>

      <div className="product-image">
        <img
          src={product.imageUrl}
          alt={product.productName}
          loading="lazy"
        />
      </div>

      <div className="product-info">
        <h3>{product.productName}</h3>
        <p className="category">{product.category}</p>
        <p className="description">{product.description}</p>

        <div className="product-meta">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="reason">
            {reasonIcons.popular} {product.reason}
          </span>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => viewProduct(product.productId)}
        >
          View Product
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 5. COMPONENT - SimilarityAnalysisDashboard
// ============================================================================

export function SimilarityAnalysisDashboard({ userId }) {
  const { analysis, loading, error } = useUserSimilarityAnalysis(userId);

  if (loading) {
    return <div className="analysis-loading">Analyzing recommendations...</div>;
  }

  if (error || !analysis) {
    return <div className="analysis-error">Unable to load analysis</div>;
  }

  const getRecommendationQuality = () => {
    if (analysis.averageSimilarity < 0.3) return 'low';
    if (analysis.averageSimilarity < 0.5) return 'medium';
    return 'high';
  };

  const quality = getRecommendationQuality();

  return (
    <div className="similarity-analysis">
      <h3>Your Similarity Profile</h3>

      <div className="stats-grid">
        <StatCard
          label="Similar Users Found"
          value={analysis.totalSimilarUsers}
          icon="👥"
        />
        <StatCard
          label="Average Similarity"
          value={(analysis.averageSimilarity * 100).toFixed(0) + '%'}
          icon="🎯"
        />
        <StatCard
          label="Peak Similarity"
          value={(analysis.maxSimilarity * 100).toFixed(0) + '%'}
          icon="⭐"
        />
        <StatCard
          label="Quality Rating"
          value={quality.charAt(0).toUpperCase() + quality.slice(1)}
          icon={quality === 'high' ? '✅' : quality === 'medium' ? '⚠️' : '❌'}
        />
      </div>

      <div className="distribution-chart">
        <h4>Similarity Distribution</h4>
        <SimilarityDistributionChart distribution={analysis.similarityDistribution} />
      </div>

      <div className="top-similar-users">
        <h4>Top Similar Users</h4>
        <ul>
          {analysis.topSimilarUsers.slice(0, 5).map((user) => (
            <li key={user.userId}>
              <span>User #{user.userId}</span>
              <span className="similarity-percent">
                {(user.similarity * 100).toFixed(0)}% match
              </span>
              <span className="common-items">
                {user.commonProducts} common products
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="recommendation-hint">
        {analysis.averageSimilarity < 0.3 && (
          <p className="hint-low">
            💡 Low average similarity detected. Visit more products to improve recommendations!
          </p>
        )}
        {analysis.averageSimilarity >= 0.3 && analysis.averageSimilarity < 0.5 && (
          <p className="hint-medium">
            💡 Moderate similarity. Continue browsing to refine your recommendations.
          </p>
        )}
        {analysis.averageSimilarity >= 0.5 && (
          <p className="hint-high">
            ✨ Great! Your recommendations will be highly personalized.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function SimilarityDistributionChart({ distribution }) {
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="chart">
      {Object.entries(distribution).map(([range, count]) => (
        <div key={range} className="chart-bar">
          <div className="bar-label">{range}</div>
          <div className="bar-container">
            <div
              className="bar-fill"
              style={{ width: `${(count / maxCount * 100) || 0}%` }}
            />
            <span className="bar-value">{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 6. PAGE - Recommendations Page with Multiple Variants
// ============================================================================

export function RecommendationsPage({ userId }) {
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="recommendations-page">
      <header className="page-header">
        <h1>Your Personalized Recommendations</h1>
        <p>Powered by Collaborative Filtering</p>
      </header>

      <div className="controls">
        <div className="variant-selector">
          <label>Recommendation Style:</label>
          <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)}>
            <option value="default">Balanced (Recommended)</option>
            <option value="strict">High Quality (Strict Matching)</option>
            <option value="generous">Broad Variety (Generous)</option>
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? 'Hide' : 'Show'} Analysis
        </button>
      </div>

      {showAnalysis && (
        <section className="analysis-section">
          <SimilarityAnalysisDashboard userId={userId} />
        </section>
      )}

      <section className="recommendations-section">
        <CollaborativeRecommendationsDisplay userId={userId} variant={selectedVariant} />
      </section>

      <section className="additional-resources">
        <h3>Other Recommendation Methods</h3>
        <div className="resource-links">
          <a href={`/recommendations/${userId}?type=content`}>
            Content-Based Recommendations
          </a>
          <a href={`/recommendations/${userId}?type=trending`}>
            Trending Products
          </a>
          <a href={`/recommendations/${userId}?type=hybrid`}>
            Hybrid Recommendations
          </a>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 7. API CLIENT UTILITY
// ============================================================================

export const collaborativeFilteringAPI = {
  /**
   * Get collaborative filtering recommendations for a user
   */
  getRecommendations: async (userId, options = {}) => {
    const params = new URLSearchParams({
      topK: options.topK || 10,
      minSimilarity: options.minSimilarity || 0.3,
      limit: options.limit || 10,
    });

    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/recommendations/${userId}/collaborative-filtering?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  /**
   * Analyze user similarity distribution
   */
  analyzeUserSimilarity: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/recommendations/${userId}/collaborative-filtering/analysis`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  /**
   * Get batch recommendations for multiple users
   */
  getBatchRecommendations: async (userIds, options = {}) => {
    const results = await Promise.all(
      userIds.map(userId => this.getRecommendations(userId, options))
    );
    return results;
  }
};

// ============================================================================
// 8. USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Simple component usage
 *
 * export default function HomePage({ userId }) {
 *   return (
 *     <div>
 *       <CollaborativeRecommendationsDisplay userId={userId} />
 *     </div>
 *   );
 * }
 */

/**
 * Example 2: Hook usage with custom options
 *
 * export default function CustomRecommendations() {
 *   const { recommendations } = useCollaborativeRecommendations(userId, {
 *     topK: 20,
 *     minSimilarity: 0.5,
 *     limit: 15
 *   });
 *
 *   return recommendations.map(rec => <ProductCard key={rec.productId} {...rec} />);
 * }
 */

/**
 * Example 3: API client usage
 *
 * const recs = await collaborativeFilteringAPI.getRecommendations(userId, {
 *   topK: 15,
 *   minSimilarity: 0.4,
 *   limit: 20
 * });
 */

export default {
  useCollaborativeRecommendations,
  useUserSimilarityAnalysis,
  collaborativeFilteringAPI,
  CollaborativeRecommendationsDisplay,
  RecommendationsPage,
  SimilarityAnalysisDashboard,
};
