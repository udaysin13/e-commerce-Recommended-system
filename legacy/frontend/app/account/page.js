'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * User Account / Profile Page
 * Amazon/Flipkart style account management
 */
export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState({
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91-9876543210',
    dob: '1990-05-15',
    gender: 'Male',
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'Rajesh Kumar',
      address: '123 Main Street, Apartment 4A',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      phone: '+91-9876543210',
      default: true,
    },
    {
      id: 2,
      type: 'Work',
      name: 'Rajesh Kumar',
      address: '456 Tech Park, Building B',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560002',
      phone: '+91-9876543210',
      default: false,
    },
  ]);

  const [editingProfile, setEditingProfile] = useState(false);

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'addresses', label: '📍 Addresses', icon: '📍' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
    { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userInfo.firstName}!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold mb-2 transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Information
                  </h2>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingProfile ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userInfo.firstName}
                      onChange={(e) =>
                        setUserInfo({
                          ...userInfo,
                          firstName: e.target.value,
                        })
                      }
                      disabled={!editingProfile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userInfo.lastName}
                      onChange={(e) =>
                        setUserInfo({
                          ...userInfo,
                          lastName: e.target.value,
                        })
                      }
                      disabled={!editingProfile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) =>
                        setUserInfo({
                          ...userInfo,
                          phone: e.target.value,
                        })
                      }
                      disabled={!editingProfile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={userInfo.dob}
                      onChange={(e) =>
                        setUserInfo({
                          ...userInfo,
                          dob: e.target.value,
                        })
                      }
                      disabled={!editingProfile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={userInfo.gender}
                      onChange={(e) =>
                        setUserInfo({
                          ...userInfo,
                          gender: e.target.value,
                        })
                      }
                      disabled={!editingProfile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {addr.type}
                          {addr.default && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="space-x-2">
                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
                          Edit
                        </button>
                        <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition">
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-900 font-semibold">{addr.name}</p>
                    <p className="text-gray-600">{addr.address}</p>
                    <p className="text-gray-600">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-gray-600 mt-2">Phone: {addr.phone}</p>
                  </div>
                ))}

                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:bg-gray-50 transition">
                  <p className="text-2xl mb-2">+</p>
                  <p className="font-semibold text-gray-700">
                    Add New Address
                  </p>
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Change Password
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Regularly update your password to keep your account secure
                    </p>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Change Password
                    </button>
                  </div>

                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                      Enable 2FA
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Active Sessions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Manage devices where you're logged in
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Current Device:</span>{' '}
                        Chrome on Windows
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Last active: Just now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {['Order Updates', 'Promotional Offers', 'Wishlist Alerts', 'Price Drops'].map(
                    (pref) => (
                      <label
                        key={pref}
                        className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-3 font-semibold text-gray-700">
                          {pref}
                        </span>
                      </label>
                    )
                  )}
                </div>

                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
