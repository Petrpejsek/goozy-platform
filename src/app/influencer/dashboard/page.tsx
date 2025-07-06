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
        console.log('✅ Successfully loaded campaigns:', data.campaigns.length)
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
      
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Welcome back, {influencer.name || 'User'}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/influencer/dashboard/products"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Campaign
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {influencer.name ? influencer.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{influencer.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">{influencer.email || 'No email'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Odhlásit se"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="ml-64 pt-16 p-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {influencer.name || 'User'}! 🎉</h1>
              <p className="text-purple-100 mb-6 text-lg">
                Your creator journey continues. Track your progress and grow your earnings.
              </p>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">€{(influencer.totalEarnings || 0).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {influencer.totalEarnings && influencer.totalEarnings > 0 
                  ? '+12% from last month' 
                  : 'Start promoting products to earn commissions'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{influencer.activeProducts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {influencer.activeProducts && influencer.activeProducts > 0 
                  ? 'Products in your catalog' 
                  : 'Select products to start promoting'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{influencer.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {influencer.totalOrders && influencer.totalOrders > 0 
                  ? 'Orders from your referrals' 
                  : 'No orders yet'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Account Approved</p>
                  <p className="text-sm text-gray-600">Your creator account is now active</p>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Status</h3>
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">
                    You have {campaigns.length} active campaign{campaigns.length > 1 ? 's' : ''}
                  </p>
                  <Link
                    href="/influencer/dashboard/campaigns"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {campaigns.slice(0, 2).map((campaign) => {
                  const isActive = new Date(campaign.startDate) <= new Date() && new Date() <= new Date(campaign.endDate)
                  const isUpcoming = new Date(campaign.startDate) > new Date()
                  const stats = campaign.stats || {
                    totalSales: 0,
                    totalRevenue: 0,
                    totalOrders: 0,
                    productCount: 6, // Default from influencer products
                    conversionRate: 0
                  }
                  
                  return (
                    <div key={campaign.id} className={`p-4 rounded-xl border-2 ${
                      isActive ? 'bg-green-50 border-green-200' : 
                      isUpcoming ? 'bg-blue-50 border-blue-200' : 
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            isActive ? 'bg-green-500' : 
                            isUpcoming ? 'bg-blue-500' : 
                            'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{campaign.brand.name}</p>
                            <p className="text-xs text-gray-500">
                              {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended'} • {stats.productCount} products
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/campaign/${campaign.slug}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                      
                      {/* Campaign Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">€{stats.totalRevenue.toFixed(0)}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Conversion</p>
                        </div>
                      </div>
                      
                      {/* Progress bar for campaign duration */}
                      {(isActive || !isUpcoming) && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              style={{
                                width: (() => {
                                  const start = new Date(campaign.startDate).getTime()
                                  const end = new Date(campaign.endDate).getTime()
                                  const now = new Date().getTime()
                                  const progress = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
                                  return `${progress}%`
                                })()
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  You need to select products first to create your campaign page.
                </p>
                
                <div className="bg-yellow-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Waiting for Campaign</p>
                      <p className="text-xs text-gray-500">Select products to start your campaign</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href="/influencer/dashboard/products"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Campaign
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
