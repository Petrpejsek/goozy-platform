'use client'

import React, { useState } from 'react'

// Mock data for demonstration
const mockMetrics = {
  totalSales: 45250,
  totalOrders: 186,
  averageOrderValue: 243.28,
  conversionRate: 3.2,
  activeCampaigns: 15, // Active Campaigns
  upcomingCampaigns: 8, // Upcoming Campaigns  
  todaysRevenue: 12450, // Today's Revenue
  activeCountries: ['CZ', 'SK', 'PL', 'DE', 'AT'], // Active Countries - země kde je povolen prodej
  activeBrands: 8
}

const mockSalesData = [
  { date: '2024-06-15', sales: 2450, orders: 8 },
  { date: '2024-06-16', sales: 3200, orders: 12 },
  { date: '2024-06-17', sales: 1800, orders: 6 },
  { date: '2024-06-18', sales: 4100, orders: 15 },
  { date: '2024-06-19', sales: 3600, orders: 11 },
  { date: '2024-06-20', sales: 2900, orders: 9 },
  { date: '2024-06-21', sales: 3800, orders: 13 }
]

const mockTopProducts = [
  { name: 'Summer Dress Collection', sales: 8450, orders: 25, revenue: 'Kč 18,450' },
  { name: 'Urban Sneakers', sales: 6800, orders: 18, revenue: 'Kč 12,800' },
  { name: 'Designer Handbags', sales: 4200, orders: 12, revenue: 'Kč 9,200' },
  { name: 'Casual T-Shirts', sales: 2600, orders: 8, revenue: 'Kč 5,600' }
]

const mockActiveCampaigns = [
  {
    id: 1,
    name: 'Summer Fashion 2024',
    startDate: '2024-06-15',
    endDate: '2024-07-15',
    influencers: ['Alice Fashion', 'Prague Style', 'Czech Trendy'],
    expectedReach: 125000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Streetwear Collection',
    startDate: '2024-06-20',
    endDate: '2024-07-20',
    influencers: ['Fashion Guru', 'Style Expert'],
    expectedReach: 85000,
    status: 'active'
  }
]

export default function PartnerDashboard() {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Partner Dashboard</h2>
            <p className="text-sm text-gray-500">Your brand performance center</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Stats Cards s vašimi úpravami */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Active Campaigns" value={mockMetrics.activeCampaigns} color="green" />
          <StatCard title="Upcoming Campaigns" value={mockMetrics.upcomingCampaigns} color="blue" />
          <StatCard title="Today's Revenue" value={mockMetrics.todaysRevenue} color="yellow" isCurrency={true} />
          <StatCard title="Total Orders" value={mockMetrics.totalOrders} color="blue" />
          <StatCard title="Active Countries" countries={mockMetrics.activeCountries} color="green" />
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Overview</h3>
            <div className="mt-2">
              {/* Simple bar chart representation */}
              <div className="space-y-3">
                {mockSalesData.map((day, index) => {
                  const maxSales = Math.max(...mockSalesData.map(d => d.sales))
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
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Products</h3>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {mockTopProducts.map((product, index) => (
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
          
          {mockActiveCampaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No active campaigns</p>
          ) : (
            <div className="space-y-4">
              {mockActiveCampaigns.map((campaign) => (
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
                    <span>Influencers: {campaign.influencers.join(', ')}</span>
                    <span>Expected reach: {campaign.expectedReach.toLocaleString()}</span>
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