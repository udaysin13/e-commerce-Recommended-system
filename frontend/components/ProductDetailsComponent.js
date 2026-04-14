'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { addCartItem } from '@/lib/cart';
import { isAuthenticated, getCurrentUserId } from '@/lib/auth';

/**
 * Enhanced Product Details Page
 * Amazon/Flipkart style with tabs, reviews, specifications
 */
export default function ProductDetails({ product: initialProduct, productId }) {
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'Rajesh K.',
      rating: 5,
      title: 'Excellent Product',
      comment: 'Great quality and fast delivery',
      date: '2 days ago',
    },
    {
      id: 2,
      user: 'Priya M.',
      rating: 4,
      title: 'Good Value',
      comment: 'Worth the money, arrived quickly',
      date: '1 week ago',
    },
  ]);

  const price = product?.price || 0;
  const discount = Number(product?.discount || 0);
  const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : price;
  const savings = originalPrice - price;
  const rating = Number(product?.rating || 4.5);
  const reviewCount = Number(product?.reviews || 234);
  const stock = product?.stock || 10;

  const images = [
    product?.imageUrl || product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop&q=60',
  ].filter(Boolean);

  const handleAddToCart = async () => {
    if (!product?.id) return;
    try {
      setAdding(true);
      await addCartItem(
        isAuthenticated() ? getCurrentUserId() : null,
        product,
        quantity
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto text-sm text-gray-600">
          <Link href="/products" className="text-blue-600 hover:underline">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span>{product?.category || 'Product'}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-semibold">{product?.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 sticky top-4 shadow-sm">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-lg mb-4 overflow-hidden aspect-square flex items-center justify-center">
                <ProductImage
                  src={images[selectedImage]}
                  alt={product?.name || 'Product'}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx
                        ? 'border-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ProductImage
                      src={img}
                      alt={`Product view ${idx + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Category and Title */}
              <p className="text-sm text-gray-600 uppercase font-semibold">
                {product?.category}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                {product?.name}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <a href="#reviews" className="text-blue-600 hover:underline text-sm">
                  {reviewCount} Reviews
                </a>
              </div>

              {/* Price Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{price.toLocaleString()}
                  </span>
                  {originalPrice > price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {discount}% off
                      </span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    Save ₹{savings.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Offers */}
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-gray-900">Offers & Benefits</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Free Fast Delivery</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>100% Authentic & Verified</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Easy 30-Day Returns</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Secure Payment Options</span>
                  </p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {stock > 0 ? (
                  <p className="text-sm font-semibold text-blue-900">
                    ✓ In Stock ({stock} available)
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-red-900">
                    Out of Stock
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Add to Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4 space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max: {stock} items</p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={adding || stock === 0 || added}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${
                  added
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {adding ? 'Adding...' : added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              {/* Wishlist Button */}
              <button className="w-full py-3 border-2 border-red-500 text-red-600 rounded-lg font-bold hover:bg-red-50 transition">
                ♡ Add to Wishlist
              </button>

              {/* Buy Now Button */}
              <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition">
                Buy Now
              </button>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-center text-xs text-gray-600">
                <p>🔒 Secure & Protected Transaction</p>
                <p>⚡ Quick & Easy Checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              {['overview', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Product Overview</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product?.description ||
                      'This is a premium quality product with excellent features and performance. Perfect for everyday use.'}
                  </p>
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Specifications
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-semibold text-gray-700">
                        Category
                      </span>
                      <span className="col-span-2 text-gray-600">
                        {product?.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-semibold text-gray-700">
                        Price
                      </span>
                      <span className="col-span-2 text-gray-600">
                        ₹{price.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 border-b">
                      <span className="font-semibold text-gray-700">
                        Rating
                      </span>
                      <span className="col-span-2 text-gray-600">
                        {rating} / 5
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <span className="font-semibold text-gray-700">
                        Stock
                      </span>
                      <span className="col-span-2 text-gray-600">
                        {stock > 0 ? `${stock} Available` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div id="reviews" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Customer Reviews
                    </h3>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Write Review
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <textarea
                        placeholder="Share your experience with this product..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Submit Review
                      </button>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.user}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {review.date}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 mt-2">
                          {review.title}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
