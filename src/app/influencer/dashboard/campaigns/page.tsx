'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InfluencerSidebar from '../../../../components/InfluencerSidebar'

interface Campaign {
  id: string
  slug?: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: string
  brand: {
    id: string
    name: string
    logo?: string
  }
  expectedReach?: number
  budgetAllocated?: number
  currency: string
  createdAt: string
}



export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/influencer/campaigns')
      const result = await response.json()

      if (result.success) {
        setCampaigns(result.campaigns)
        console.log('📊 Loaded campaigns:', result.campaigns)
      } else {
        console.error('❌ Failed to load campaigns:', result.error)
      }
    } catch (error) {
      console.error('❌ Error loading campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)

    if (now < start) return 'scheduled'
    if (now > end) return 'completed'
    return 'active'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const activeCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'active')
  const scheduledCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'scheduled')
  const completedCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'completed')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <InfluencerSidebar currentPage="campaigns" />
      
      {/* Main content container with proper left margin for sidebar */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 py-6 px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
              <p className="text-gray-600 mt-1">Manage your active and past campaigns</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/influencer/campaign/launch"
                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Campaign
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledCampaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCampaigns.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/influencer/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start creating your first campaign to promote products and earn commissions.
            </p>
            <Link
              href="/influencer/campaign/launch"
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">All Campaigns</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {campaigns.map((campaign) => {
                const status = getCampaignStatus(campaign)
                return (
                  <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        
                        {campaign.description && (
                          <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                          </span>
                          
                          {campaign.expectedReach && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {campaign.expectedReach.toLocaleString()} reach
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {campaign.brand.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {status === 'active' && (
                          <button
                            onClick={() => {
                              // Use the campaign slug from database if available
                              const campaignSlug = campaign.slug || `fallback-${campaign.id.slice(-8)}`
                              router.push(`/campaign/${campaignSlug}`)
                            }}
                            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Live
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Campaign Details</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCampaign.name}</p>
              </div>
              
              {selectedCampaign.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCampaign.endDate)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Partner</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCampaign.brand.name}</p>
              </div>
              
              {selectedCampaign.expectedReach && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Reach</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.expectedReach.toLocaleString()} people</p>
                </div>
              )}
              
              {selectedCampaign.budgetAllocated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCampaign.budgetAllocated.toLocaleString()} {selectedCampaign.currency}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getCampaignStatus(selectedCampaign))}`}>
                  {getCampaignStatus(selectedCampaign).charAt(0).toUpperCase() + getCampaignStatus(selectedCampaign).slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {getCampaignStatus(selectedCampaign) === 'active' && (
                <button
                  onClick={() => {
                    const campaignSlug = selectedCampaign.slug || `fallback-${selectedCampaign.id.slice(-8)}`
                    router.push(`/campaign/${campaignSlug}`)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  View Live Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 