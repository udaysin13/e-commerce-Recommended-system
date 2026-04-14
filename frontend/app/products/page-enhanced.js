'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import AdvancedProductFilter from '@/components/AdvancedProductFilter';
import RecommendationsSection from '@/components/RecommendationsSection';
import { fetchProducts as fetchProductsFromApi } from '@/lib/api';

/**
 * Enhanced Products Page - Amazon/Flipkart Style
 * 
 * Features:
 * - Advanced filtering with sidebar
 * - Grid layout with product cards
 * - Search, sorting, price range
 * - Category and rating filters
 * - Personalized recommendations
 */
export default function ProductsPageEnhanced() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('1');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchProductsFromApi();
      setAllProducts(response || []);
      setFilteredProducts(response || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtered, filterState) => {
    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Shop Our Collection</h1>
          <p className="text-blue-100 mt-1">
            Discover {allProducts.length} products with personalized recommendations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Filters & Sort</span>
            <span>{mobileFilterOpen ? '−' : '+'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filter - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <AdvancedProductFilter
              products={allProducts}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Sidebar Filter - Mobile */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-1 bg-white rounded-lg shadow-md p-4 mb-4">
              <AdvancedProductFilter
                products={allProducts}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <p className="text-gray-700">
                Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold">{allProducts.length}</span> products
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg h-96 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg font-semibold">
                      No products found matching your filters
                    </p>
                    <button
                      onClick={() => {
                        setFilteredProducts(allProducts);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Recommendations Section */}
            {!loading && !error && userId && (
              <div className="mt-12">
                <RecommendationsSection userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
