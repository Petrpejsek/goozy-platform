'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InfluencerSidebar from '../../../../components/InfluencerSidebar'

interface AnalyticsData {
  totalRevenue: number
  totalCommission: number
  totalReturns: number
  netEarnings: number
  averageCommissionRate: number
  returnRate: number
  topPerformingCampaign: string
  topPerformingProduct: string
  thisMonthRevenue: number
  thisMonthCommission: number
  thisMonthReturns: number
}

interface CampaignPerformance {
  id: string
  name: string
  totalRevenue: number
  commission: number
  returns: number
  netEarnings: number
  commissionRate: number
  returnRate: number
}

interface ProductPerformance {
  id: string
  name: string
  totalRevenue: number
  commission: number
  returns: number
  netEarnings: number
  returnRate: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([])
  const [products, setProducts] = useState<ProductPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
        if (!token) {
          router.push('/influencer/login')
          return
        }

        // Call real API instead of using mock data (temporarily in test mode)
        const response = await fetch('/api/influencer/analytics?test=true', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/influencer/login')
            return
          }
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        
        setAnalytics(data.analytics)
        setCampaigns(data.campaigns)
        setProducts(data.products)
        
      } catch (err) {
        console.error('Error loading analytics data:', err)
        setError('Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [router])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InfluencerSidebar currentPage="analytics" />
      
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            <p className="text-sm text-gray-500">Track your performance and insights</p>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-8 ml-64">
        {analytics && (
          <>
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Commission Earned</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalCommission)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Returns Lost</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(analytics.totalReturns)}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Net Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.netEarnings)}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* This Month Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(analytics.thisMonthRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-1">Revenue Generated</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics.thisMonthCommission)}</p>
                  <p className="text-sm text-gray-500 mt-1">Commission Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{formatCurrency(analytics.thisMonthReturns)}</p>
                  <p className="text-sm text-gray-500 mt-1">Returns Lost</p>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Average Commission Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.averageCommissionRate}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Return Rate</p>
                <p className="text-2xl font-semibold text-yellow-600">{analytics.returnRate}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Top Campaign</p>
                <p className="text-lg font-semibold text-gray-900">{analytics.topPerformingCampaign}</p>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
                <p className="text-sm text-gray-500">Your campaigns ranked by earnings and returns</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {campaign.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campaign.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campaign.commission)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          {formatCurrency(campaign.returns)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(campaign.netEarnings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-yellow-600 font-medium">{campaign.returnRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
                <p className="text-sm text-gray-500">Products with highest revenue and earnings</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.commission)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          {formatCurrency(product.returns)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(product.netEarnings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-yellow-600 font-medium">{product.returnRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
} 