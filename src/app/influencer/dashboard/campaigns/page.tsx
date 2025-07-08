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
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isProcessing, setIsProcessing] = useState(false) // Pro stop/delete akce

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        console.log('❌ No authentication token found')
        router.push('/influencer/login')
        return
      }

      const response = await fetch('/api/influencer/campaigns', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        console.log('❌ Authentication failed, redirecting to login')
        localStorage.removeItem('influencer_token')
        localStorage.removeItem('influencer_user')
        sessionStorage.removeItem('influencer_token')
        sessionStorage.removeItem('influencer_user')
        router.push('/influencer/login')
        return
      }
      
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
      setLoading(false)
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

  // Funkce pro zastavení kampaně
  const handleStopCampaign = async (campaignId: string) => {
    try {
      setIsProcessing(true)
      
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/influencer/campaigns/${campaignId}/stop`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (result.success) {
        // Aktualizuj local state
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { ...c, status: 'inactive', endDate: new Date().toISOString() }
            : c
        ))
        setSelectedCampaign(null)
        
        // Zobraz success zprávu
        showToast('Campaign stopped successfully', 'success')
      } else {
        throw new Error(result.error || 'Failed to stop campaign')
      }
    } catch (error) {
      console.error('❌ Error stopping campaign:', error)
      showToast('Failed to stop campaign', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Funkce pro smazání kampaně
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setIsProcessing(true)
      
      const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/influencer/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (result.success) {
        // Odeber kampaň z local state
        setCampaigns(prev => prev.filter(c => c.id !== campaignId))
        setSelectedCampaign(null)
        
        // Zobraz success zprávu
        showToast('Campaign deleted successfully', 'success')
      } else {
        throw new Error(result.error || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('❌ Error deleting campaign:', error)
      showToast('Failed to delete campaign', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper funkce pro toast zprávy
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const activeCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'active')
  const scheduledCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'scheduled')
  const completedCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'completed')

  if (loading) {
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
                <label className="block text-sm font-medium text-gray-700">Campaign URL</label>
                <div className="mt-1 flex items-center space-x-2">
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-md border flex-1">
                    {window.location.origin}/campaign/{selectedCampaign.slug || `fallback-${selectedCampaign.id.slice(-8)}`}
                  </p>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/campaign/${selectedCampaign.slug || `fallback-${selectedCampaign.id.slice(-8)}`}`
                      navigator.clipboard.writeText(url)
                      // Můžete přidat toast notifikaci zde
                    }}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
                    title="Kopírovat URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getCampaignStatus(selectedCampaign))}`}>
                  {getCampaignStatus(selectedCampaign).charAt(0).toUpperCase() + getCampaignStatus(selectedCampaign).slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              {/* Akce vlevo - Edit/Delete/Stop */}
              <div className="flex space-x-3">
                {/* Edit Products - jen pro budoucí a aktivní kampaně */}
                {(getCampaignStatus(selectedCampaign) === 'scheduled' || getCampaignStatus(selectedCampaign) === 'active') && (
                  <button
                    onClick={() => {
                      // Navigace na edit produkty stránku
                      router.push('/influencer/dashboard/products?editCampaign=' + selectedCampaign.id)
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Products
                  </button>
                )}
                
                {/* Stop Campaign - jen pro aktivní kampaně */}
                {getCampaignStatus(selectedCampaign) === 'active' && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to stop this campaign? This action cannot be undone.')) {
                        await handleStopCampaign(selectedCampaign.id)
                      }
                    }}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                      isProcessing 
                        ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                        : 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    )}
                    {isProcessing ? 'Stopping...' : 'Stop Campaign'}
                  </button>
                )}
                
                {/* Delete Campaign - jen pro neaktivní kampaně */}
                {getCampaignStatus(selectedCampaign) !== 'active' && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                        await handleDeleteCampaign(selectedCampaign.id)
                      }
                    }}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                      isProcessing 
                        ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                        : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {isProcessing ? 'Deleting...' : 'Delete Campaign'}
                  </button>
                )}
              </div>
              
              {/* Akce vpravo - Close/View Live */}
              <div className="flex space-x-3">
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
        </div>
      )}
    </div>
  )
} 