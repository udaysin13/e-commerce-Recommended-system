'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Enhanced Navigation Component
 * Amazon/Flipkart style with search, categories, and user menu
 */
export default function EnhancedNavigation() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys & Games',
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <p>Welcome to FastShop - Your One-Stop E-Commerce Store</p>
          <div className="space-x-4">
            <Link href="/seller" className="hover:text-blue-200">
              Become a Seller
            </Link>
            <Link href="/contact" className="hover:text-blue-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 flex-shrink-0 flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                FS
              </div>
              FastShop
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 px-4 py-3 bg-transparent focus:outline-none"
                />
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold"
                >
                  👤 Account
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                    <Link
                      href="/account/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/wishlist"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Wishlist
                    </Link>
                    <hr className="my-2" />
                    <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="flex flex-col items-center text-gray-700 hover:text-red-600 font-semibold"
              >
                ♡
                <span className="text-xs">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex flex-col items-center text-gray-700 hover:text-blue-600 font-semibold relative"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
                <span className="text-xs">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
          <Link
            href="/products"
            className="whitespace-nowrap text-gray-700 hover:text-blue-600 font-semibold transition"
          >
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${category.toLowerCase()}`}
              className="whitespace-nowrap text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
