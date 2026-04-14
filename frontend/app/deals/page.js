'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Flash Sale / Deals Page
 * Amazon/Flipkart style deals and offers
 */
export default function FlashSalesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  const deals = [
    {
      id: 1,
      name: 'Wireless Earbuds Pro',
      originalPrice: 4999,
      salePrice: 1999,
      discount: 60,
      rating: 4.8,
      reviews: 1200,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'electronics',
      stock: 5,
      badge: 'Flash Sale',
    },
    {
      id: 2,
      name: 'Smart Watch',
      originalPrice: 9999,
      salePrice: 4999,
      discount: 50,
      rating: 4.5,
      reviews: 800,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'electronics',
      stock: 12,
      badge: 'Limited Time',
    },
    {
      id: 3,
      name: 'Laptop Stand',
      originalPrice: 1999,
      salePrice: 999,
      discount: 50,
      rating: 4.7,
      reviews: 450,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'accessories',
      stock: 25,
      badge: 'Deal of the Day',
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      originalPrice: 5999,
      salePrice: 2999,
      discount: 50,
      rating: 4.6,
      reviews: 600,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'electronics',
      stock: 8,
      badge: 'Flash Sale',
    },
    {
      id: 5,
      name: 'USB-C Hub',
      originalPrice: 1499,
      salePrice: 749,
      discount: 50,
      rating: 4.4,
      reviews: 320,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'accessories',
      stock: 40,
      badge: 'Limited Stock',
    },
    {
      id: 6,
      name: 'Phone Mount',
      originalPrice: 599,
      salePrice: 299,
      discount: 50,
      rating: 4.3,
      reviews: 200,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'accessories',
      stock: 50,
      badge: 'Best Seller',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Deals', count: 6 },
    { id: 'electronics', label: 'Electronics', count: 4 },
    { id: 'accessories', label: 'Accessories', count: 2 },
    { id: 'home', label: 'Home', count: 0 },
  ];

  const filteredDeals =
    selectedCategory === 'all'
      ? deals
      : deals.filter((d) => d.category === selectedCategory);

  const getBadgeColor = (badge) => {
    if (badge.includes('Flash')) return 'bg-red-600';
    if (badge.includes('Deal')) return 'bg-orange-600';
    if (badge.includes('Limited')) return 'bg-purple-600';
    if (badge.includes('Best')) return 'bg-green-600';
    return 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ⚡ Flash Sale 2024
              </h1>
              <p className="text-xl text-orange-100 mb-4">
                Get up to 60% off on premium electronics and accessories!
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-black bg-opacity-30 rounded-lg p-6">
              <p className="text-sm font-semibold mb-2 text-orange-200">
                SALE ENDS IN
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-4xl font-bold">{timeLeft.hours}</div>
                  <div className="text-sm text-orange-200">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-sm text-orange-200">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-sm text-orange-200">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Filter by Category
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.label}
                {cat.count > 0 && ` (${cat.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
            >
              {/* Image */}
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                />

                {/* Badge */}
                <div
                  className={`absolute top-3 left-3 ${getBadgeColor(
                    deal.badge
                  )} text-white px-3 py-1 rounded-full text-sm font-bold`}
                >
                  {deal.badge}
                </div>

                {/* Discount Percentage */}
                <div className="absolute top-3 right-3 bg-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg">
                  {deal.discount}%
                </div>

                {/* Stock Alert */}
                {deal.stock <= 10 && (
                  <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">
                    Only {deal.stock} Left!
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                  {deal.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(deal.rating))}
                    {'☆'.repeat(5 - Math.floor(deal.rating))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({deal.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{deal.salePrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    Save ₹
                    {(deal.originalPrice - deal.salePrice).toLocaleString()}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 mb-4">😢</p>
            <p className="text-lg text-gray-600">
              No deals available in this category
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Don't miss out on amazing deals!
          </h2>
          <p className="text-gray-600 mb-6">
            These prices won't last long. Shop now and save big!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition"
            >
              Shop All Deals
            </Link>
            <button className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
