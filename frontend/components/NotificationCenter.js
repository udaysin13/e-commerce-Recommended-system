'use client';

import { useState } from 'react';

/**
 * Notifications/Toast Component
 * For order updates, deals, and alerts
 */
export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Placed',
      message: 'Your order #FS-2024-001 has been confirmed',
      time: '2 minutes ago',
      read: false,
      icon: '📦',
    },
    {
      id: 2,
      type: 'deal',
      title: 'Flash Sale Alert',
      message: 'Wireless headphones at 50% off - only for next 2 hours!',
      time: '1 hour ago',
      read: false,
      icon: '⚡',
    },
    {
      id: 3,
      type: 'wishlist',
      title: 'Price Drop',
      message: 'Smart Watch Pro price reduced by ₹2000 - added to your wishlist',
      time: '3 hours ago',
      read: true,
      icon: '💚',
    },
    {
      id: 4,
      type: 'delivery',
      title: 'Out for Delivery',
      message: 'Your package is on its way - expected delivery today',
      time: '5 hours ago',
      read: true,
      icon: '🚚',
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-l-4 border-blue-600';
      case 'deal':
        return 'bg-red-50 border-l-4 border-red-600';
      case 'wishlist':
        return 'bg-pink-50 border-l-4 border-pink-600';
      case 'delivery':
        return 'bg-green-50 border-l-4 border-green-600';
      default:
        return 'bg-gray-50 border-l-4 border-gray-600';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          setShowSettings(false);
        }}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${getNotificationColor(
                    notification.type
                  )}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-600 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600">
                <p className="text-lg mb-2">🎉</p>
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Settings (Hidden by default) */}
          {showSettings && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-3">
                Notification Settings
              </h4>
              <div className="space-y-2">
                {['Orders', 'Deals', 'Wishlist Updates', 'Delivery'].map(
                  (setting) => (
                    <label
                      key={setting}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{setting}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 hover:underline font-semibold">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
