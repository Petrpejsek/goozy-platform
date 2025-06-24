'use client'

import React, { useState, useEffect } from 'react'

interface BrandData {
  brandName: string
  contactName: string
  email: string
}

// Zatím žádné skutečné kampaně - všechny hodnoty jsou nula
const realCampaigns: any[] = [] // Prázdný seznam - žádné kampaně

export default function CampaignsPage() {
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await fetch('/api/auth/brand/verify')
        if (response.ok) {
          const data = await response.json()
          setBrandData(data.brand)
        }
      } catch (err) {
        console.error('Error loading brand data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBrandData()
  }, [])

  if (loading) {
    return (
      <div>
        <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
          <div className="flex items-center justify-between h-full px-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Campaign Overview</h2>
              <p className="text-sm text-gray-500">Your marketing campaigns status</p>
            </div>
          </div>
        </header>
        
        <main className="pt-24 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

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
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Overview</h2>
            <p className="text-sm text-gray-500">Your marketing campaigns status</p>
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
                  <dd className="text-3xl font-bold text-gray-900">0</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Reach</dt>
                  <dd className="text-3xl font-bold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                  <dd className="text-3xl font-bold text-gray-900">Kč0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Your Campaigns</h3>
            <p className="text-sm text-gray-500 mt-1">Overview of your marketing campaigns managed by our team</p>
          </div>
          
          {realCampaigns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your marketing campaigns will appear here once our team starts working on promoting your products with influencers.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Next step:</strong> Our team will contact you to discuss campaign strategy and start creating campaigns for your brand.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {realCampaigns.map((campaign: any) => (
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
                      {campaign.influencers && campaign.influencers.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Influencers: </span>
                          <span className="text-sm text-gray-700">{campaign.influencers.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 italic">Read-only</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 