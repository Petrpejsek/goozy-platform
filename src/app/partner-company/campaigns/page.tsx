'use client'

import React, { useState } from 'react'

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Fashion 2024',
    description: 'Promote our new summer collection',
    startDate: '2024-06-15',
    endDate: '2024-07-15',
    targetCountries: ['CZ', 'SK'],
    targetGender: 'women',
    influencers: ['Alice Fashion', 'Prague Style', 'Czech Trendy'],
    expectedReach: 125000,
    budgetAllocated: 5000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Denim Collection',
    description: 'Launch our premium denim line',
    startDate: '2024-06-20',
    endDate: '2024-07-20',
    targetCountries: ['CZ'],
    targetGender: 'unisex',
    influencers: ['Fashion Guru', 'Style Expert'],
    expectedReach: 85000,
    budgetAllocated: 3500,
    status: 'active'
  },
  {
    id: 3,
    name: 'Winter Preview',
    description: 'Early preview of winter collection',
    startDate: '2024-07-01',
    endDate: '2024-08-01',
    targetCountries: ['CZ', 'SK', 'PL'],
    targetGender: 'all',
    influencers: [],
    expectedReach: 200000,
    budgetAllocated: 8000,
    status: 'draft'
  }
]

const availableCountries = [
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'PL', name: 'Poland' },
  { code: 'HU', name: 'Hungary' },
  { code: 'AT', name: 'Austria' }
]

export default function CampaignsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetCountries: [],
    targetGender: 'all',
    budgetAllocated: '',
    expectedReach: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Management</h2>
            <p className="text-sm text-gray-500">Manage your marketing campaigns</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Campaign
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Campaign stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {mockCampaigns.filter(c => c.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Draft Campaigns</dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {mockCampaigns.filter(c => c.status === 'draft').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expected Reach</dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {(mockCampaigns.reduce((acc, c) => acc + c.expectedReach, 0) / 1000).toFixed(0)}K
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Your Campaigns</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {campaign.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{campaign.description}</p>
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        📅 {new Date(campaign.startDate).toLocaleDateString('cs-CZ')} - {new Date(campaign.endDate).toLocaleDateString('cs-CZ')}
                      </span>
                      <span>
                        🌍 {campaign.targetCountries.join(', ')}
                      </span>
                      <span>
                        👥 {campaign.expectedReach.toLocaleString()} reach
                      </span>
                      <span>
                        💰 Kč{campaign.budgetAllocated.toLocaleString()}
                      </span>
                    </div>
                    {campaign.influencers.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Influencers: </span>
                        <span className="text-sm text-gray-700">{campaign.influencers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Campaign Form (Hidden by default) */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 