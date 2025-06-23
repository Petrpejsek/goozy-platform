'use client'

import React, { useState } from 'react'

// Mock data
const mockAnalyticsData = {
  totalRevenue: 245680,
  totalOrders: 1286,
  averageOrderValue: 191.15,
  conversionRate: 4.2,
  topProducts: [
    { name: 'Summer Dress Collection', revenue: 45680, orders: 234, percentage: 18.6 },
    { name: 'Urban Sneakers', revenue: 38920, orders: 189, percentage: 15.8 },
    { name: 'Designer Handbags', revenue: 32450, orders: 156, percentage: 13.2 },
    { name: 'Casual T-Shirts', revenue: 28340, orders: 142, percentage: 11.5 }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 18450 },
    { month: 'Feb', revenue: 22100 },
    { month: 'Mar', revenue: 19800 },
    { month: 'Apr', revenue: 25600 },
    { month: 'May', revenue: 28900 },
    { month: 'Jun', revenue: 32450 }
  ]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m')
  const [selectedView, setSelectedView] = useState('overview') // 'overview', 'revenue', 'orders', 'products', 'conversion'

  // Mock detailed data
  const revenueByDays = [
    { date: '2024-06-15', revenue: 2850, orders: 12 },
    { date: '2024-06-16', revenue: 3200, orders: 15 },
    { date: '2024-06-17', revenue: 2950, orders: 11 },
    { date: '2024-06-18', revenue: 3800, orders: 18 },
    { date: '2024-06-19', revenue: 4200, orders: 21 },
    { date: '2024-06-20', revenue: 3650, orders: 16 },
    { date: '2024-06-21', revenue: 4100, orders: 19 }
  ]

  const orderDetails = [
    { id: '#12856', date: '2024-06-21', customer: 'Anna Nováková', products: 2, total: 2850, status: 'Completed' },
    { id: '#12855', date: '2024-06-21', customer: 'Petr Svoboda', products: 1, total: 1200, status: 'Completed' },
    { id: '#12854', date: '2024-06-20', customer: 'Marie Dvořáková', products: 3, total: 3650, status: 'Processing' },
    { id: '#12853', date: '2024-06-20', customer: 'Jan Novák', products: 1, total: 890, status: 'Completed' },
    { id: '#12852', date: '2024-06-19', customer: 'Eva Procházková', products: 2, total: 2100, status: 'Completed' },
    { id: '#12851', date: '2024-06-19', customer: 'Tomáš Černý', products: 4, total: 4200, status: 'Shipped' }
  ]

  const exportData = () => {
    // Mock export functionality
    alert('Analytics data exported successfully!')
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
              onClick={exportData}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Export Data
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
                    Kč{mockAnalyticsData.totalRevenue.toLocaleString('cs-CZ')}
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
                    {mockAnalyticsData.totalOrders.toLocaleString()}
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
                    Kč{mockAnalyticsData.averageOrderValue.toFixed(0)}
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
                    {mockAnalyticsData.conversionRate}%
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
                  {revenueByDays.map((day, index) => (
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
          </div>
        )}

        {/* Orders Details Table */}
        {selectedView === 'orders' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
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
                  {orderDetails.map((order, index) => (
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
                {mockAnalyticsData.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...mockAnalyticsData.monthlyRevenue.map(m => m.revenue))
                  const width = (month.revenue / maxRevenue) * 100
                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-12 text-xs text-gray-500 font-medium">
                        {month.month}
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-6">
                          <div 
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2" 
                            style={{ width: `${width}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              Kč{(month.revenue / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
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
            <div className="space-y-4">
              {mockAnalyticsData.topProducts.map((product, index) => (
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
          </div>
        </div>
        )}

        {/* Export Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Data Export</h3>
              <p className="text-sm text-gray-600 mt-1">Download your analytics data for external analysis</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={exportData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button 
                onClick={exportData}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Export PDF Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 