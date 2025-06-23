'use client'

import React, { useState } from 'react'

// Mock data pro demonstraci
const mockPromotions = [
  {
    id: 1,
    name: 'Black Friday 2024',
    type: 'percentage',
    discount: 30,
    code: 'BF2024',
    startDate: '2024-11-29',
    endDate: '2024-12-02',
    status: 'scheduled',
    targetProducts: 'All Products',
    influencers: 5,
    totalUses: 0,
    revenue: 0
  },
  {
    id: 2,
    name: 'Summer Sale',
    type: 'percentage',
    discount: 20,
    code: 'SUMMER20',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'active',
    targetProducts: 'Summer Collection',
    influencers: 8,
    totalUses: 156,
    revenue: 45230
  },
  {
    id: 3,
    name: 'New Customer Discount',
    type: 'fixed',
    discount: 500,
    code: 'WELCOME500',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    targetProducts: 'All Products',
    influencers: 12,
    totalUses: 89,
    revenue: 23450
  },
  {
    id: 4,
    name: 'Spring Collection Launch',
    type: 'percentage',
    discount: 15,
    code: 'SPRING15',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    status: 'ended',
    targetProducts: 'Spring Collection',
    influencers: 6,
    totalUses: 234,
    revenue: 67890
  }
]

export default function PromotionsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'scheduled':
        return 'Scheduled'
      case 'ended':
        return 'Ended'
      default:
        return status
    }
  }

  const formatDiscount = (type: string, discount: number) => {
    if (type === 'percentage') {
      return `${discount}%`
    } else {
      return `${discount} Kč`
    }
  }

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Promotions</h2>
            <p className="text-sm text-gray-500">Manage your promotional campaigns and discount codes</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Promotion
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Promotions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockPromotions.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockPromotions.reduce((sum, p) => sum + p.revenue, 0).toLocaleString('cs-CZ')} Kč
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Code Uses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockPromotions.reduce((sum, p) => sum + p.totalUses, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Influencers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.max(...mockPromotions.map(p => p.influencers))}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Promotions</h2>
              <p className="text-gray-600 mt-1">Manage your promotional campaigns</p>
            </div>
            
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Scheduled</option>
                <option>Ended</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Promotion</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Uses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPromotions.map((promotion) => (
                  <tr key={promotion.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-sm text-gray-500">{promotion.targetProducts}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        {formatDiscount(promotion.type, promotion.discount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {promotion.code}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(promotion.startDate).toLocaleDateString('cs-CZ')} - {new Date(promotion.endDate).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                        {getStatusText(promotion.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {promotion.totalUses}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {promotion.revenue.toLocaleString('cs-CZ')} Kč
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Promotion Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create New Promotion</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g. Black Friday 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Kč)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g. 20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g. SAVE20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 