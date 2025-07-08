'use client'

import React, { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: ''
  })

  const [targetCountries, setTargetCountries] = useState<string[]>([])
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    webhookUrl: '',
    autoSync: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [loginData, setLoginData] = useState({
    email: '',
    lastLogin: ''
  })

  const availableCountries = [
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'PL', name: 'Poland' },
    { code: 'HU', name: 'Hungary' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'DE', name: 'Germany' },
    { code: 'AT', name: 'Austria' }
  ]

  const handleCountryToggle = (countryCode: string) => {
    setTargetCountries(prev => 
      prev.includes(countryCode) 
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    )
    }

  const regenerateApiKey = () => {
    // Generování API klíče pro partnera pro nahrávání produktů
    const newKey = 'goozy_partner_' + Math.random().toString(36).substring(2, 22)
    setApiSettings(prev => ({ ...prev, apiKey: newKey }))
    alert('New API key generated successfully! Use this key to upload products to Goozy platform.')
  }

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: '🏢' },
    { id: 'security', name: 'Security & Login', icon: '🔒' },
    { id: 'countries', name: 'Target Countries', icon: '🌍' },
    { id: 'api', name: 'API & Integration', icon: '🔗' }
  ]

  return (
    <div>
      {/* Top Header - properly positioned for sidebar layout */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 left-64 right-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Manage your company profile and preferences</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.website}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={companyData.description}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change Password Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Update Password
                </button>
              </div>
            </div>

            {/* Login Settings Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Login Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Login Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 max-w-md"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                


                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Account Activity</h4>
                  <div className="text-sm text-gray-600">
                    <p>No activity data available yet</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Save Login Settings
                </button>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'countries' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Target Countries</h3>
            <p className="text-sm text-gray-600 mb-6">Select the countries where you want to sell your products.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCountries.map((country) => (
                <div key={country.code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={country.code}
                    checked={targetCountries.includes(country.code)}
                    onChange={() => handleCountryToggle(country.code)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={country.code} className="ml-3 text-sm text-gray-700">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Countries
              </button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">API & Integration Configuration</h3>
            
            <div className="space-y-6">
              {/* API Key Section */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">🔑 Product Upload API</h4>
                <p className="text-blue-800 mb-4">
                  Use this API key to upload your product catalog to the Goozy platform programmatically.
                </p>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">API Key</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 rounded-l-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={apiSettings.apiKey}
                      readOnly
                      placeholder="No API key generated yet"
                    />
                    <button
                      onClick={regenerateApiKey}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {apiSettings.apiKey ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">Include this key in the Authorization header of your API requests</p>
                </div>
              </div>

              {/* Webhook Section */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">🔔 Order Notifications</h4>
                <p className="text-green-800 mb-4">
                  Receive real-time notifications when customers order your products through influencer campaigns.
                </p>
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    value={apiSettings.webhookUrl}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://your-domain.com/webhooks/goozy-orders"
                  />
                  <p className="text-xs text-green-700 mt-2">We'll send POST requests with order details to this URL</p>
                </div>
              </div>

              {/* Auto Sync Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">⚙️ Synchronization Settings</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={apiSettings.autoSync}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoSync" className="ml-3 text-sm text-gray-700">
                    Enable automatic inventory synchronization
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2">Automatically sync stock levels and product availability</p>
              </div>

              {/* API Documentation */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">📚 API Documentation</h4>
                <p className="text-yellow-800 mb-3">
                  Complete API guide for integrating your systems with Goozy platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm text-yellow-700">
                    <p>• <strong>Products API</strong> - Upload/update product catalog</p>
                    <p>• <strong>Inventory API</strong> - Manage stock levels</p>
                  </div>
                  <div className="text-sm text-yellow-700">
                    <p>• <strong>Orders Webhook</strong> - Receive order notifications</p>
                    <p>• <strong>Analytics API</strong> - Access sales performance data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save API Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 