'use client';

import { useState } from 'react';

/**
 * Search with Autocomplete Component
 * Amazon/Flipkart style search with suggestions
 */
export default function SearchWithAutocomplete() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Wireless Headphones',
    'Smart Watch',
    'Laptop Stand',
    'USB-C Cable',
  ]);

  // Mock product suggestions
  const allProducts = [
    'Wireless Headphones',
    'Wireless Charger',
    'Wireless Mouse',
    'Smart Watch Pro',
    'Smart Home Speaker',
    'Smartphone Stand',
    'Laptop Stand',
    'USB-C Cable',
    'USB Hub',
    'Type-C Adapter',
  ];

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = allProducts.filter((product) =>
        product.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Show max 8 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Add to recent searches
    if (!recentSearches.includes(suggestion)) {
      setRecentSearches([suggestion, ...recentSearches.slice(0, 9)]);
    }
    // Trigger search
    handleSearch(suggestion);
  };

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // Redirect to products page with search query
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
  };

  return (
    <div className="w-full max-w-2xl relative">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-lg overflow-hidden border-2 border-gray-300 focus-within:border-blue-600 transition">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery.length === 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 px-4 py-3 focus:outline-none"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            🔍
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10">
            {/* Recent Searches */}
            {searchQuery.length === 0 && (
              <div>
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Recent Searches
                  </p>
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(search)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <span>🕐</span>
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {searchQuery.length > 0 && suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Search Suggestions
                  </p>
                </div>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <span>🔍</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery.length > 0 && suggestions.length === 0 && (
              <div className="px-4 py-4 text-center text-gray-600">
                <p>No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
