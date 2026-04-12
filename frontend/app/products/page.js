'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import RecommendationsSection from '@/components/RecommendationsSection';

/**
 * Products Page
 * 
 * Complete ecommerce products page with:
 * - Product filtering and sorting
 * - Grid layout
 * - Personalized recommendations
 * - Cart management
 * - Loading states
 */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [cartNotification, setCartNotification] = useState(null);
  const [userId, setUserId] = useState('1'); // Default user ID

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // Get user ID from session/auth
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortBy]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      // Use mock data for demo if API fails
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Store in localStorage or send to API
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Show notification
    setCartNotification(`${product.name} added to cart!`);
    setTimeout(() => setCartNotification(null), 3000);
  };

  // Handle add to wishlist
  const handleAddToWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((p) => p.id === product.id);
    if (!exists) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map((p) => p.category))];

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Cart Notification */}
      {cartNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {cartNotification}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-600 mt-2">
            Discover our collection of {products.length} products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sorting */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg h-96 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800">
                Error loading products
              </h3>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredProducts.length === 0 && !error && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                No products found in this category
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {!loading && products.length > 0 && (
          <RecommendationsSection
            userId={userId}
            title="Recommended for You"
            algorithm="hybrid"
            limit={8}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        )}
      </div>
    </main>
  );
}

// Mock products for demo/fallback
function getMockProducts() {
  return [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: 149.99,
      rating: 4.5,
      reviewCount: 234,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      description: 'High-quality wireless headphones with noise cancellation',
      inStock: true,
    },
    {
      id: 2,
      name: 'Vintage Camera',
      category: 'Photography',
      price: 299.99,
      rating: 4.8,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop',
      description: 'Classic vintage camera for enthusiasts',
      inStock: true,
    },
    {
      id: 3,
      name: 'Eco-Friendly Water Bottle',
      category: 'Lifestyle',
      price: 34.99,
      rating: 4.3,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e9?w=500&h=500&fit=crop',
      description: 'Sustainable water bottle made from recyclable materials',
      inStock: true,
    },
    {
      id: 4,
      name: 'Wool Knit Sweater',
      category: 'Fashion',
      price: 89.99,
      rating: 4.6,
      reviewCount: 122,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      description: 'Cozy wool sweater perfect for any season',
      inStock: true,
    },
    {
      id: 5,
      name: 'Stainless Steel Coffee Maker',
      category: 'Home',
      price: 79.99,
      rating: 4.7,
      reviewCount: 198,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=500&h=500&fit=crop',
      description: 'Professional-grade coffee maker for home use',
      inStock: true,
    },
    {
      id: 6,
      name: 'Leather Backpack',
      category: 'Fashion',
      price: 129.99,
      rating: 4.4,
      reviewCount: 267,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      description: 'Durable leather backpack for travel and daily use',
      inStock: true,
    },
    {
      id: 7,
      name: 'Solar-Powered Charger',
      category: 'Electronics',
      price: 44.99,
      rating: 4.2,
      reviewCount: 145,
      image: 'https://images.unsplash.com/photo-1609042231021-07eadaaa1fe6?w=500&h=500&fit=crop',
      description: 'Portable solar charger for outdoor adventures',
      inStock: true,
    },
    {
      id: 8,
      name: 'Ceramic Dinner Set',
      category: 'Home',
      price: 99.99,
      rating: 4.5,
      reviewCount: 88,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop',
      description: 'Beautiful ceramic dinnerware for 6 people',
      inStock: true,
    },
  ];
}
