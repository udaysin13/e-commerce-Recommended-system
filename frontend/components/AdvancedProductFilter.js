'use client';

import { useState } from 'react';

/**
 * Advanced Product Filter Component
 * Amazon/Flipkart style product filtering with sidebar
 * 
 * Features:
 * - Price range slider
 * - Category filter
 * - Rating filter
 * - Search with autocomplete
 * - Sort options
 */
export default function AdvancedProductFilter({
  products = [],
  onFilterChange,
  initialFilters = {},
}) {
  const [priceRange, setPriceRange] = useState(
    initialFilters.priceRange || [0, 100000]
  );
  const [selectedCategories, setSelectedCategories] = useState(
    initialFilters.categories || []
  );
  const [selectedRatings, setSelectedRatings] = useState(
    initialFilters.ratings || []
  );
  const [inStock, setInStock] = useState(initialFilters.inStock !== false);
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'relevance');
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    rating: true,
  });

  // Get unique categories from products
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number(e.target.value);
    if (newRange[0] <= newRange[1]) {
      setPriceRange(newRange);
      applyFilters(
        search,
        newRange,
        selectedCategories,
        selectedRatings,
        inStock,
        sortBy
      );
    }
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    applyFilters(
      search,
      priceRange,
      updated,
      selectedRatings,
      inStock,
      sortBy
    );
  };

  // Handle rating filter
  const handleRatingChange = (rating) => {
    const updated = selectedRatings.includes(rating)
      ? selectedRatings.filter((r) => r !== rating)
      : [...selectedRatings, rating];
    setSelectedRatings(updated);
    applyFilters(
      search,
      priceRange,
      selectedCategories,
      updated,
      inStock,
      sortBy
    );
  };

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    applyFilters(value, priceRange, selectedCategories, selectedRatings, inStock, sortBy);
  };

  // Handle sort
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    applyFilters(
      search,
      priceRange,
      selectedCategories,
      selectedRatings,
      inStock,
      value
    );
  };

  // Apply all filters
  const applyFilters = (
    searchTerm,
    prices,
    cats,
    ratings,
    stock,
    sort
  ) => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= prices[0] && p.price <= prices[1]
    );

    // Category filter
    if (cats.length > 0) {
      filtered = filtered.filter((p) => cats.includes(p.category));
    }

    // Rating filter
    if (ratings.length > 0) {
      filtered = filtered.filter((p) => ratings.some((r) => p.rating >= r));
    }

    // Stock filter
    if (stock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'relevance':
      default:
        // Keep original order or use search relevance
        break;
    }

    onFilterChange(filtered, {
      search: searchTerm,
      priceRange: prices,
      categories: cats,
      ratings: ratings,
      inStock: stock,
      sortBy: sort,
    });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedRatings([]);
    setInStock(true);
    setSortBy('relevance');
    onFilterChange(products, {});
  };

  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedRatings.length > 0 ||
    !inStock ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sort Options */}
      <div className="p-4 border-b">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="border-b">
        <button
          onClick={() => toggleSection('price')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <h3 className="font-semibold text-gray-700">Price Range</h3>
          <span className="text-gray-400">
            {expandedSections.price ? '−' : '+'}
          </span>
        </button>
        {expandedSections.price && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min={priceRange[0]}
                max="100000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ₹{priceRange[0].toLocaleString()} - ₹
              {priceRange[1].toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="border-b">
        <button
          onClick={() => toggleSection('category')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <h3 className="font-semibold text-gray-700">Category</h3>
          <span className="text-gray-400">
            {expandedSections.category ? '−' : '+'}
          </span>
        </button>
        {expandedSections.category && (
          <div className="px-4 pb-4 space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <h3 className="font-semibold text-gray-700">Rating</h3>
          <span className="text-gray-400">
            {expandedSections.rating ? '−' : '+'}
          </span>
        </button>
        {expandedSections.rating && (
          <div className="px-4 pb-4 space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} & up
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* In Stock Filter */}
      <div className="p-4 border-b">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              const value = e.target.checked;
              setInStock(value);
              applyFilters(
                search,
                priceRange,
                selectedCategories,
                selectedRatings,
                value,
                sortBy
              );
            }}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-700 font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="p-4">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
