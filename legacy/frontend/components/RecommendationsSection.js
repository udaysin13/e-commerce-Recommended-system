'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getRecommendationsWithFallback } from '@/lib/recommendationApi';

/**
 * RecommendationsSection Component
 * 
 * Displays personalized product recommendations with:
 * - Multiple algorithm options
 * - Loading skeleton/shimmer effect
 * - Error handling
 * - Responsive grid layout
 * - Fallback recommendations
 */
export default function RecommendationsSection({
  userId, 
  title = 'Recommended for You',
  algorithm = 'hybrid',
  limit = 8,
  onAddToCart,
  onAddToWishlist,
  className = '',
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithm);

  // Fetch recommendations
  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRecommendationsWithFallback(userId, {
          algorithm: selectedAlgorithm,
          limit,
          includeExplanations: true,
        });

        // Handle response - could be from API or fallback
        if (response && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            setRecommendations(response.data);
            setError(null);
          } else if (Array.isArray(response.data) && response.data.length === 0) {
            // Empty recommendations from API
            setRecommendations([]);
            setError(null);
          } else {
            // Unexpected data format
            setRecommendations([]);
            setError('Unexpected response format');
          }
        } else if (response && response.error) {
          // Error response
          setError(response.error);
          setRecommendations([]);
        } else {
          // Empty response
          setRecommendations([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations. Please try another algorithm or refresh.');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, selectedAlgorithm, limit]);

  // Handle algorithm change
  const handleAlgorithmChange = (newAlgorithm) => {
    if (newAlgorithm !== selectedAlgorithm) {
      setSelectedAlgorithm(newAlgorithm);
    }
  };

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">
            Personalized picks based on your shopping history
          </p>
        </div>

        {/* Algorithm Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center mr-2">Algorithm:</span>
          {['hybrid', 'collaborative', 'content', 'trending'].map((algo) => (
            <button
              key={algo}
              onClick={() => handleAlgorithmChange(algo)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedAlgorithm === algo
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {algo.charAt(0).toUpperCase() + algo.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800">Unable to load recommendations</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              No recommendations available
            </h3>
            <p className="text-gray-600 mt-2">
              Start shopping to get personalized recommendations
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                explanation={product.explanation}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            ))}
          </div>
        )}

        {/* Metadata (Optional) */}
        {!loading && recommendations.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-sm text-gray-500">
              Showing {recommendations.length} recommendations using{' '}
              <span className="font-medium text-gray-700">
                {selectedAlgorithm} algorithm
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
