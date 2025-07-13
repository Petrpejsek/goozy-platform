'use client'

import React, { useState, useEffect } from 'react'

interface BrandData {
  brandName: string
  contactName: string
  email: string
}

// Skutečné údaje - zatím všechny nula, protože nejsou implementovány kampaně
const realAnalyticsData = {
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  conversionRate: 0,
  topProducts: [], // Prázdný seznam
  monthlyRevenue: [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 }
  ]
}

export default function AnalyticsPage() {
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6m')
  const [selectedView, setSelectedView] = useState('overview')

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

  // Skutečné údaje - zatím prázdné seznamy
  const revenueByDays: any[] = [] // Žádné denní příjmy
  const orderDetails: any[] = [] // Žádné objednávky

  const exportAnalyticsToCSV = () => {
    try {
      // Příprava dat pro export
      const csvData = []
      
      // Header
      csvData.push(['Analytics Report', `Generated on ${new Date().toLocaleDateString('cs-CZ')}`])
      csvData.push(['Time Range', timeRange])
      csvData.push(['Brand', brandData?.brandName || 'N/A'])
      csvData.push([]) // Prázdný řádek
      
      // Summary metrics
      csvData.push(['SUMMARY METRICS'])
      csvData.push(['Metric', 'Value'])
      csvData.push(['Total Revenue', `Kč${realAnalyticsData.totalRevenue.toLocaleString('cs-CZ')}`])
      csvData.push(['Total Orders', realAnalyticsData.totalOrders.toString()])
      csvData.push(['Average Order Value', `Kč${realAnalyticsData.averageOrderValue.toFixed(2)}`])
      csvData.push(['Conversion Rate', `${realAnalyticsData.conversionRate}%`])
      csvData.push([]) // Prázdný řádek
      
      // Monthly revenue breakdown
      csvData.push(['MONTHLY REVENUE BREAKDOWN'])
      csvData.push(['Month', 'Revenue (CZK)'])
      realAnalyticsData.monthlyRevenue.forEach(month => {
        csvData.push([month.month, month.revenue.toString()])
      })
      
      // Pokud existují denní data, přidat je
      if (revenueByDays.length > 0) {
        csvData.push([]) // Prázdný řádek
        csvData.push(['DAILY REVENUE BREAKDOWN'])
        csvData.push(['Date', 'Revenue (CZK)', 'Orders', 'Avg Order Value (CZK)'])
        revenueByDays.forEach(day => {
          const avgOrderValue = day.orders > 0 ? (day.revenue / day.orders).toFixed(2) : '0'
          csvData.push([
            new Date(day.date).toLocaleDateString('cs-CZ'),
            day.revenue.toString(),
            day.order.toString(),
            avgOrderValue
          ])
        })
      }
      
      // Pokud existují objednávky, přidat je
      if (orderDetails.length > 0) {
        csvData.push([]) // Prázdný řádek
        csvData.push(['ORDER DETAILS'])
        csvData.push(['Order ID', 'Date', 'Customer', 'Products', 'Total (CZK)', 'Status'])
        orderDetails.forEach(order => {
          csvData.push([
            order.id,
            new Date(order.date).toLocaleDateString('cs-CZ'),
            order.customer,
            `${order.products} items`,
            order.total.toString(),
            order.status
          ])
        })
      }
      
      // Konverze na CSV string
      const csvContent = csvData.map(row => 
        row.map(field => {
          // Escape quotes and wrap in quotes if contains comma or quote
          const fieldStr = field.toString()
          if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
            return '"' + fieldStr.replace(/"/g, '""') + '"'
          }
          return fieldStr
        }).join(',')
      ).join('\n')
      
      // Vytvořit a stáhnout soubor
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const fileName = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Chyba při exportu CSV souboru. Zkuste to znovu.')
    }
  }

  if (loading) {
    return (
      <div>
        <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
          <div className="flex items-center justify-between h-full px-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
              <p className="text-sm text-gray-500">Track your performance and revenue</p>
            </div>
          </div>
        </header>
        
        <main className="pt-24 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
            <p className="text-sm text-gray-500">Track your performance and revenue</p>
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
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={exportAnalyticsToCSV}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={() => setSelectedView('revenue')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-green-200 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-green-600 transition-colors">Total Revenue</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    Kč{realAnalyticsData.totalRevenue.toLocaleString('cs-CZ')}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">Click to view daily breakdown</div>
          </div>

          <div 
            onClick={() => setSelectedView('orders')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-blue-600 transition-colors">Total Orders</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {realAnalyticsData.totalOrders.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">Click to view order details</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Order Value</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    Kč{realAnalyticsData.averageOrderValue.toFixed(0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {realAnalyticsData.conversionRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Overview Button */}
        {selectedView !== 'overview' && (
          <div className="mb-6">
            <button
              onClick={() => setSelectedView('overview')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </button>
          </div>
        )}

        {/* Revenue Details Table */}
        {selectedView === 'revenue' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Revenue Breakdown</h3>
            {revenueByDays.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No revenue data yet</h3>
                <p className="text-gray-500">Revenue breakdown will appear here once campaigns generate sales.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueByDays.map((day: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          Kč{day.revenue.toLocaleString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Kč{Math.round(day.revenue / day.orders).toLocaleString('cs-CZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Details Table */}
        {selectedView === 'orders' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
            {orderDetails.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500">Order details will appear here once customers start purchasing through campaigns.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderDetails.map((order: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.date).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.products} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          Kč{order.total.toLocaleString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Charts and Tables - Show only in overview */}
        {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="mt-2">
              <div className="space-y-3">
                {realAnalyticsData.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...realAnalyticsData.monthlyRevenue.map(m => m.revenue), 1) // Min 1 to avoid division by 0
                  const width = month.revenue === 0 ? 5 : (month.revenue / maxRevenue) * 100 // Show minimal bar for 0
                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-12 text-xs text-gray-500 font-medium">
                        {month.month}
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-6">
                          <div 
                            className={`${month.revenue === 0 ? 'bg-gray-300' : 'bg-blue-600'} h-6 rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${width}%` }}
                          >
                            <span className={`${month.revenue === 0 ? 'text-gray-500' : 'text-white'} text-xs font-medium`}>
                              Kč{month.revenue.toLocaleString('cs-CZ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {realAnalyticsData.monthlyRevenue.every(m => m.revenue === 0) && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">No revenue data yet. Charts will show data once campaigns generate sales.</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Products</h3>
            {realAnalyticsData.topProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">No product data yet</h4>
                <p className="text-xs text-gray-500">Top products will appear here once sales start coming in.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {realAnalyticsData.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        Kč{product.revenue.toLocaleString('cs-CZ')}
                      </p>
                      <p className="text-xs text-gray-500">{product.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}


      </main>
    </div>
  )
} 