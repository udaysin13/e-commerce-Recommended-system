'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import RecommendationsSection from './RecommendationsSection';

/**
 * Enhanced Home Page Component
 * 
 * Modern landing page with intelligent recommendations
 */
export default function HomePageEnhanced() {
  const [userId, setUserId] = useState('1');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.1%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Shop Smart,
                <span className="block text-blue-200">Get Smarter</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Discover products tailored just for you. Our AI-powered recommendation engine learns your preferences and shows you exactly what you'll love.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-center"
                >
                  Shop Now
                </Link>
                <button
                  className="inline-block px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  onClick={() => {
                    document.getElementById('trending').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See Recommendations
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-blue-100">Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-blue-100">Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">99%</p>
                  <p className="text-blue-100">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative h-96 hidden md:block">
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-20"
                style={{
                  transform: `translateY(${scrollY * 0.1}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why ShopSmart?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Get recommendations in milliseconds using our advanced algorithms.',
              },
              {
                icon: '🎯',
                title: 'Personalized',
                description: 'Every recommendation is tailored to your unique preferences.',
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Find the best deals on products you actually want to buy.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 text-center hover:shadow-lg rounded-lg transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Browse', desc: '10,000+ products' },
              { num: '2', title: 'Interact', desc: 'Like, wishlist, buy' },
              { num: '3', title: 'Learn', desc: 'AI learns preferences' },
              { num: '4', title: 'Discover', desc: 'Get recommendations' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <div id="trending" className="scroll-mt-20">
        <RecommendationsSection
          userId={userId}
          title="Trending This Week"
          algorithm="trending"
          limit={8}
          onAddToCart={handleAddToCart}
          className="bg-white"
        />
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop Smart?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse thousands of products curated just for you
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
