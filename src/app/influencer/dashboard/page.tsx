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



export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
          console.log('✅ Successfully loaded influencer data:', data.name)
          setInfluencer(data)
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
            <p className="text-sm text-gray-500">Welcome back, {influencer.name}</p>
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
                  {influencer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{influencer.name}</p>
                <p className="text-xs text-gray-500">{influencer.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="ml-64 pt-16 p-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {influencer.name}! 🎉</h1>
              <p className="text-purple-100 mb-6 text-lg">
                Your creator journey continues. Track your progress and grow your earnings.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">{influencer.followers || '0'} Followers</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-200 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">{influencer.commissionRate || 10}% Commission</span>
                </div>
              </div>
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
            {influencer.activeProducts && influencer.activeProducts > 0 ? (
              <>
                <p className="text-gray-600 mb-6">
                  Your campaign is ready! Share your personalized page with your audience.
                </p>
                
                <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-gray-700">
                        goozy.com/campaign/{influencer.slug}
                      </p>
                      <p className="text-xs text-gray-500">Your campaign page is live</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://goozy.com/campaign/${influencer.slug}`)}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Copy Link
                    </button>
                    <Link
                      href={`/campaign/${influencer.slug}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      View Campaign
                    </Link>
                  </div>
                </div>
              </>
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
