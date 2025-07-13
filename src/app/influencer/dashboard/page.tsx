'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InfluencerSidebar from '../../../components/InfluencerSidebar'

interface InfluencerData {
  id: string
  name: string
  email: string
  slug: string
  followers?: string
  totalEarnings?: number
  activeProducts?: number
  totalOrders?: number
  commissionRate?: number
  avatar?: string | null
  bio?: string | null
  socialNetworks?: any[]
  contentCategories?: any[]
  isActive: boolean
  isApproved: boolean
}

interface Campaign {
  id: string
  name: string
  slug: string
  status: string
  startDate: string
  endDate: string
  brand: {
    name: string
  }
  stats?: {
    totalSales: number
    totalRevenue: number
    totalOrders: number
    productCount: number
    conversionRate: number
  }
}



export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadCampaigns = async (token: string) => {
    try {
      console.log('🔍 Loading campaigns...')
      const response = await fetch('/api/influencer/campaigns', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Successfully loaded campaigns:', data.campaign.length)
        setCampaigns(data.campaigns || [])
      } else {
        console.log('❌ Failed to load campaigns')
      }
    } catch (err) {
      console.error('❌ Error loading campaigns:', err)
    }
  }

  useEffect(() => {
    const loadInfluencerData = async () => {
      try {
        console.log('🔍 Loading influencer data from API...')
        
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
        if (!token) {
          console.log('❌ No authentication token found')
          router.push('/influencer/login')
          return
        }

        // Call API to get real influencer data
        const response = await fetch('/api/influencer/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Successfully loaded influencer data:', data.influencer.name)
          setInfluencer(data.influencer)
          
          // Load campaigns
          await loadCampaigns(token)
        } else if (response.status === 401) {
          console.log('❌ Authentication failed, redirecting to login')
          localStorage.removeItem('influencer_token')
          localStorage.removeItem('influencer_user')
          sessionStorage.removeItem('influencer_token')
          sessionStorage.removeItem('influencer_user')
          router.push('/influencer/login')
          return
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to load profile data')
        }
      } catch (err) {
        console.error('❌ Error loading influencer data:', err)
        setError('Failed to connect to server')
      } finally {
        setIsLoading(false)
      }
    }

    loadInfluencerData()
  }, [router])

  const handleLogout = () => {
    console.log("Logging out...")
    localStorage.removeItem('influencer_token')
    localStorage.removeItem('influencer_user')
    sessionStorage.removeItem('influencer_token')
    sessionStorage.removeItem('influencer_user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/influencer/login')}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!influencer) {
    return null 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InfluencerSidebar currentPage="dashboard" />
      
      {/* Header - responsive */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          <div className="lg:block">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Welcome back, {influencer.name || 'User'}</p>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link
              href="/influencer/dashboard/products"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 lg:px-6 lg:py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-1 lg:gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Start New Campaign</span>
              <span className="sm:hidden">New</span>
            </Link>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs lg:text-sm">
                  {influencer.name ? influencer.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{influencer.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">{influencer.email || 'No email'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - responsive padding */}
      <main className="pt-16 lg:pt-16 lg:ml-64">
        <div className="p-4 lg:p-8">
          {/* Stats Cards Grid - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">€{influencer.totalEarnings?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{influencer.activeProducts || 0}</p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{influencer.totalOrders || 0}</p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Commission Rate</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{influencer.commissionRate || 15}%</p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns Section - responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Active Campaigns</h3>
              <Link
                href="/influencer/dashboard/campaigns"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm lg:text-base"
              >
                View All →
              </Link>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <svg className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm lg:text-base font-medium text-gray-900">No active campaigns</h3>
                <p className="mt-1 text-xs lg:text-sm text-gray-500">Get started by creating your first campaign.</p>
                <div className="mt-4 lg:mt-6">
                  <Link
                    href="/influencer/dashboard/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Start New Campaign
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {campaigns.slice(0, 4).map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base lg:text-lg font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                        campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600 mb-3">{campaign.brand.name}</p>
                    {campaign.stats && (
                      <div className="grid grid-cols-3 gap-2 lg:gap-4">
                        <div className="text-center">
                          <div className="text-lg lg:text-xl font-bold text-gray-900">{campaign.stats.totalSales}</div>
                          <div className="text-xs text-gray-500">Sales</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg lg:text-xl font-bold text-gray-900">€{campaign.stats.totalRevenue.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg lg:text-xl font-bold text-gray-900">{campaign.stats.conversionRate}%</div>
                          <div className="text-xs text-gray-500">Conversion</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions - responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <Link
                href="/influencer/dashboard/products"
                className="flex items-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm lg:text-base font-medium text-gray-900">Add Products</p>
                  <p className="text-xs lg:text-sm text-gray-500">Browse and select products</p>
                </div>
              </Link>
              
              <Link
                href="/influencer/profile"
                className="flex items-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm lg:text-base font-medium text-gray-900">Update Profile</p>
                  <p className="text-xs lg:text-sm text-gray-500">Edit your information</p>
                </div>
              </Link>
              
              <Link
                href="/influencer/dashboard/analytics"
                className="flex items-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm lg:text-base font-medium text-gray-900">View Analytics</p>
                  <p className="text-xs lg:text-sm text-gray-500">Check your performance</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
