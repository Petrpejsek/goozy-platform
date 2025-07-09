'use client'

import React, { useState, useEffect } from 'react'

interface BrandData {
  brandName: string
  contactName: string
  email: string
}

interface Metrics {
  activeCampaigns: number
  upcomingCampaigns: number
  todaysRevenue: number
  totalOrders: number
  activeCountries: string[]
}

interface DashboardData {
  metrics: Metrics
  salesData: Array<{date: string, sales: number, orders: number}>
  topProducts: Array<{name: string, sales: number, orders: number, revenue: string}>
  recentCampaigns: Array<any>
  brand: {
    id: string
    name: string
    email: string
    totalProducts: number
    totalCampaigns: number
  }
}

export default function PartnerDashboard() {
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Loading dashboard data...')
        
        // Nejdříve ověřit authentication
        const brandResponse = await fetch('/api/auth/brand/verify')
        
        if (brandResponse.ok) {
          const brandData = await brandResponse.json()
          setBrandData(brandData.user)
          console.log('✅ Brand authentication verified:', brandData.user)
        } else {
          setError('Not authenticated')
          return
        }

        // Pokud je uživatel přihlášený, načíst dashboard data
        const dashboardResponse = await fetch('/api/partner-company/dashboard')
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          console.log('✅ Dashboard data loaded:', dashboardData)
          setDashboardData(dashboardData)
        } else {
          console.error('❌ Failed to load dashboard data:', dashboardResponse.status)
          setError('Unable to load dashboard data')
          return
        }
        
      } catch (err) {
        console.error('❌ Error loading data:', err)
        setError('Error loading dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !dashboardData) {
    return (
      <div>
        <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
          <div className="flex items-center justify-between h-full px-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Partner Dashboard</h2>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </header>
        <main className="pt-24 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Partner Dashboard</h2>
            <p className="text-sm text-gray-500">Welcome, {brandData?.brandName || 'Partner'}</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Stats Cards s reálnými daty */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Active Campaigns" value={dashboardData?.metrics.activeCampaigns || 0} color="green" />
          <StatCard title="Upcoming Campaigns" value={dashboardData?.metrics.upcomingCampaigns || 0} color="blue" />
          <StatCard title="Today's Revenue" value={dashboardData?.metrics.todaysRevenue || 0} color="yellow" isCurrency={true} />
          <StatCard title="Total Orders" value={dashboardData?.metrics.totalOrders || 0} color="blue" />
          <StatCard title="Active Countries" countries={dashboardData?.metrics.activeCountries || []} color="green" />
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Overview</h3>
            <div className="mt-2">
              {(dashboardData?.salesData || []).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">No sales data available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Sales data will appear once you have active campaigns</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(dashboardData?.salesData || []).map((day, index) => {
                    const maxSales = Math.max(...(dashboardData?.salesData || []).map(d => d.sales))
                    const width = (day.sales / maxSales) * 100
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-16 text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-600 h-4 rounded-full" 
                              style={{ width: `${width}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm font-medium text-gray-900">
                          Kč{day.sales.toLocaleString('cs-CZ')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Products</h3>
            <div className="flow-root">
              {(dashboardData?.topProducts || []).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-500">No product data available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Product performance will appear once you have sales</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {(dashboardData?.topProducts || []).map((product, index) => (
                    <li key={index} className="py-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.orders} orders
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.revenue}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
              <p className="text-gray-600 mt-1">Currently running campaigns</p>
            </div>
          </div>
          
          {(dashboardData?.recentCampaigns || []).length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No active campaigns</p>
              <p className="text-gray-400 mt-2">Create your first campaign to start collaborating with influencers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(dashboardData?.recentCampaigns || []).map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(campaign.startDate).toLocaleDateString('cs-CZ')} - {new Date(campaign.endDate).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Status: {campaign.status}</span>
                    <span>Expected reach: {campaign.expectedReach ? campaign.expectedReach.toLocaleString() : 'N/A'}</span>
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

const StatCard = ({ title, value, color, isCurrency = false, countries }: { 
  title: string, 
  value?: number, 
  color: 'yellow' | 'green' | 'blue', 
  isCurrency?: boolean, 
  countries?: string[] 
}) => {
  const colors = {
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
  }
  
  const icons = {
    yellow: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    green: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    blue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  }

  // Funkce pro získání emoji vlajky ze zkratky země
  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'CZ': '🇨🇿',
      'SK': '🇸🇰', 
      'PL': '🇵🇱',
      'DE': '🇩🇪',
      'AT': '🇦🇹',
      'HU': '🇭🇺',
      'SI': '🇸🇮',
      'HR': '🇭🇷'
    }
    return flags[countryCode] || '🏳️'
  }

  let displayValue;
  if (countries) {
    // Zobrazit pouze země s vlajkami bez ikony
    if (countries.length === 0) {
      displayValue = (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">No active countries yet</p>
        </div>
      )
    } else {
      displayValue = (
        <div className="flex flex-wrap gap-1">
          {countries.map((country, index) => (
            <span key={index} className="inline-flex items-center gap-1 text-sm font-medium">
              <span className="text-lg">{getCountryFlag(country)}</span>
              <span>{country}</span>
            </span>
          ))}
        </div>
      )
    }
  } else if (value !== undefined) {
    displayValue = isCurrency ? `${value.toLocaleString('cs-CZ')} Kč` : value.toString();
  } else {
    displayValue = '';
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {countries ? (
        // Speciální layout pro země - bez ikony
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
          {displayValue}
        </div>
      ) : (
        // Standardní layout pro ostatní karty
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`font-bold text-gray-900 ${isCurrency ? 'text-lg' : 'text-3xl'}`}>{displayValue}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
            {icons[color]}
          </div>
        </div>
      )}
    </div>
  )
} 