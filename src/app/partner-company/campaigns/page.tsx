'use client'

import React, { useState, useEffect } from 'react'

interface BrandData {
  brandName: string
  contactName: string
  email: string
}

interface Campaign {
  id: string
  slug: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  expectedReach: number
  budgetAllocated: number
  currency: string
  targetCountries: string[]
  influencer: {
    id: string
    name: string
    avatar: string | null
    slug: string
    commissionRate: number
  } | null
  stats: {
    productCount: number
    totalOrders: number
    totalRevenue: number
    conversionRate: number
  }
}

interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  totalReach: number
  totalCommissionPaid: number
}

export default function CampaignsPage() {
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Načíst základní brand data
        const brandResponse = await fetch('/api/auth/brand/verify')
        if (brandResponse.ok) {
          const brandData = await brandResponse.json()
          setBrandData(brandData.brand)
        }

        // Načíst kampaně
        const campaignsResponse = await fetch('/api/partner-company/campaigns')
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          if (campaignsData.success) {
            setCampaigns(campaignsData.campaigns || [])
            setCampaignStats(campaignsData.stats || null)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Campaign Overview</h3>
                             <p className="text-sm text-blue-700 mt-1">
                 <strong>Revenue</strong> = Your earnings from sales • 
                 <strong>Commission Paid</strong> = Influencer's percentage from sales (only when products are sold)
               </p>
            </div>
          </div>
        </div>

        {/* Campaign stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
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
                  <dd className="text-3xl font-bold text-gray-900">{campaignStats?.activeCampaigns || 0}</dd>
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
                  <dd className="text-3xl font-bold text-gray-900">{campaignStats?.totalReach?.toLocaleString() || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                  <dd className="text-3xl font-bold text-emerald-600">€0</dd>
                  <dd className="text-xs text-gray-400 mt-1">Your earnings</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Items Sold</dt>
                  <dd className="text-3xl font-bold text-orange-600">0</dd>
                  <dd className="text-xs text-gray-400 mt-1">Products sold</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Commission Paid</dt>
                  <dd className="text-3xl font-bold text-gray-900">€0</dd>
                  <dd className="text-xs text-gray-400 mt-1">Influencer earnings from sales</dd>
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
          
          {campaigns.length === 0 ? (
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
              {campaigns.map((campaign) => (
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
                          📅 {new Date(campaign.startDate).toLocaleDateString('en-GB')} - {new Date(campaign.endDate).toLocaleDateString('en-GB')}
                        </span>
                        <span>
                          🌍 {campaign.targetCountries.join(', ')}
                        </span>
                        <span>
                          👥 {campaign.expectedReach.toLocaleString()} reach
                        </span>
                        <span>
                          💰 Commission on sales only
                        </span>
                      </div>
                      {campaign.influencer && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Influencer:</span>
                          <div className="flex items-center space-x-2">
                            {campaign.influencer.avatar ? (
                              <img 
                                src={campaign.influencer.avatar} 
                                alt={campaign.influencer.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500">{campaign.influencer.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-700">{campaign.influencer.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {(campaign.influencer.commissionRate * 100).toFixed(0)}% commission
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <span>📦 {campaign.stats.productCount} products</span>
                        <span>🛍️ {campaign.stats.totalOrders} orders placed</span>
                        <span>💰 €{campaign.stats.totalRevenue.toLocaleString()} your earnings</span>
                        {campaign.slug && (
                          <a 
                            href={`/campaign/${campaign.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            🔗 View live campaign
                          </a>
                        )}
                      </div>
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