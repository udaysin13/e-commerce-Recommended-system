'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Order Tracking Page
 * Track order status, delivery, and manage orders
 */
export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState([
    {
      id: 'FS-2024-001',
      date: '2024-04-10',
      total: 4999,
      status: 'in-transit',
      items: 2,
      estimatedDelivery: '2024-04-15',
      statusLabel: 'In Transit',
      progress: 75,
    },
    {
      id: 'FS-2024-002',
      date: '2024-04-08',
      total: 12499,
      status: 'processing',
      items: 1,
      estimatedDelivery: '2024-04-14',
      statusLabel: 'Processing',
      progress: 50,
    },
    {
      id: 'FS-2024-003',
      date: '2024-04-01',
      total: 2499,
      status: 'delivered',
      items: 1,
      deliveredDate: '2024-04-05',
      statusLabel: 'Delivered',
      progress: 100,
    },
    {
      id: 'FS-2024-004',
      date: '2024-03-25',
      total: 8999,
      status: 'delivered',
      items: 3,
      deliveredDate: '2024-03-29',
      statusLabel: 'Delivered',
      progress: 100,
    },
  ]);

  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  const displayOrders = activeTab === 'active' ? activeOrders : deliveredOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return '📦';
      case 'in-transit':
        return '🚚';
      case 'delivered':
        return '✓';
      case 'cancelled':
        return '✕';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-blue-100 mt-1">Track and manage your purchases</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === 'delivered'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Delivered ({deliveredOrders.length})
          </button>
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)} {order.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {order.status !== 'delivered' && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Estimated delivery:{' '}
                      <span className="font-semibold">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}

                {/* Order Details */}
                <div className="p-4 bg-gray-50 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Items
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {order.items}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      {order.status === 'delivered'
                        ? 'Delivered On'
                        : 'Est. Delivery'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(
                        order.deliveredDate || order.estimatedDelivery
                      ).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-3 justify-between">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    View Details
                  </Link>
                  {order.status === 'delivered' && (
                    <>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                        Leave Review
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                        Report Issue
                      </button>
                    </>
                  )}
                  {order.status !== 'delivered' && (
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg font-semibold mb-4">
              {activeTab === 'active'
                ? 'No active orders'
                : 'No delivered orders'}
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Need Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl mb-2">📞</p>
              <h3 className="font-semibold text-gray-900">Contact Support</h3>
              <p className="text-sm text-gray-600 mt-1">
                Available 24/7 to help you
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">📋</p>
              <h3 className="font-semibold text-gray-900">Return Process</h3>
              <p className="text-sm text-gray-600 mt-1">
                Easy 30-day returns
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">❓</p>
              <h3 className="font-semibold text-gray-900">FAQ</h3>
              <p className="text-sm text-gray-600 mt-1">
                Common questions answered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
