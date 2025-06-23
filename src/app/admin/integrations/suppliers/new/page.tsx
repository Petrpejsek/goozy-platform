'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ApiCapability {
  id: string
  name: string
  description: string
}

const API_CAPABILITIES: ApiCapability[] = [
  { id: 'inventory_sync', name: 'Inventory Sync', description: 'Real-time inventory synchronization' },
  { id: 'order_webhook', name: 'Order Webhooks', description: 'Receive orders via webhook notifications' },
  { id: 'order_api', name: 'Order API', description: 'Submit orders via API calls' },
  { id: 'product_sync', name: 'Product Sync', description: 'Product catalog synchronization' },
  { id: 'price_sync', name: 'Price Sync', description: 'Pricing updates synchronization' },
  { id: 'status_webhook', name: 'Status Webhooks', description: 'Order status update notifications' }
]

const AUTH_METHODS = [
  { value: 'api_key', label: 'API Key' },
  { value: 'bearer_token', label: 'Bearer Token' },
  { value: 'basic_auth', label: 'Basic Authentication' },
  { value: 'oauth2', label: 'OAuth 2.0' }
]

export default function NewSupplierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Základní informace o dodavateli
  const [supplierData, setSupplierData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  })
  
  // API připojení
  const [apiConnection, setApiConnection] = useState({
    connectionName: '',
    baseUrl: '',
    authMethod: 'api_key',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    capabilities: [] as string[],
    syncFrequency: 15,
    isActive: true
  })

  const handleSupplierChange = (field: string, value: string) => {
    setSupplierData(prev => ({ ...prev, [field]: value }))
  }

  const handleApiChange = (field: string, value: any) => {
    setApiConnection(prev => ({ ...prev, [field]: value }))
  }

  const handleCapabilityToggle = (capabilityId: string) => {
    setApiConnection(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capabilityId)
        ? prev.capabilities.filter(id => id !== capabilityId)
        : [...prev.capabilities, capabilityId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/integrations/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier: supplierData,
          apiConnection: apiConnection
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creating supplier')
      }

      router.push('/admin/integrations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/integrations"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Integrations
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">➕ Add New Supplier</h1>
        <p className="text-gray-600 mt-2">
          Add a new supplier and configure API integration
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Základní informace o dodavateli */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🏢 Supplier Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={supplierData.name}
                onChange={(e) => handleSupplierChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Fashion Wholesale Ltd."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={supplierData.email}
                onChange={(e) => handleSupplierChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="api@supplier.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={supplierData.phone}
                onChange={(e) => handleSupplierChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+420 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={supplierData.website}
                onChange={(e) => handleSupplierChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://supplier.com"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
                          <textarea
                value={supplierData.description}
                onChange={(e) => handleSupplierChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description of supplier and their services..."
              />
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔗 API Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Name *
              </label>
              <input
                type="text"
                required
                value={apiConnection.connectionName}
                onChange={(e) => handleApiChange('connectionName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Main API Connection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL *
              </label>
              <input
                type="url"
                required
                value={apiConnection.baseUrl}
                onChange={(e) => handleApiChange('baseUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.supplier.com/v1"
              />
            </div>
          </div>

          {/* Authentication Method */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication Method
            </label>
            <select
              value={apiConnection.authMethod}
              onChange={(e) => handleApiChange('authMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AUTH_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Authentication Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiConnection.authMethod === 'api_key' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  required
                  value={apiConnection.apiKey}
                  onChange={(e) => handleApiChange('apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter API key from supplier..."
                />
                                 <p className="text-sm text-gray-500 mt-1">
                   Enter the API key provided by the supplier
                 </p>
              </div>
            )}

            {apiConnection.authMethod === 'bearer_token' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bearer Token *
                </label>
                <input
                  type="password"
                  required
                  value={apiConnection.apiKey}
                  onChange={(e) => handleApiChange('apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bearer token..."
                />
              </div>
            )}

            {apiConnection.authMethod === 'basic_auth' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={apiConnection.username}
                    onChange={(e) => handleApiChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={apiConnection.password}
                    onChange={(e) => handleApiChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {apiConnection.authMethod === 'oauth2' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={apiConnection.apiKey}
                    onChange={(e) => handleApiChange('apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret *
                  </label>
                  <input
                    type="password"
                    required
                    value={apiConnection.apiSecret}
                    onChange={(e) => handleApiChange('apiSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* API Capabilities */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h2 className="text-xl font-semibold text-gray-900 mb-6">⚡ API Capabilities</h2>
           <p className="text-gray-600 mb-4">Select which API features are supported:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {API_CAPABILITIES.map((capability) => (
              <div key={capability.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={capability.id}
                  checked={apiConnection.capabilities.includes(capability.id)}
                  onChange={() => handleCapabilityToggle(capability.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor={capability.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                    {capability.name}
                  </label>
                  <p className="text-sm text-gray-500">{capability.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">⏰ Sync Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Frequency (minutes)
              </label>
              <select
                value={apiConnection.syncFrequency}
                onChange={(e) => handleApiChange('syncFrequency', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
                <option value={240}>Every 4 hours</option>
                <option value={1440}>Once daily</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={apiConnection.isActive}
                  onChange={(e) => handleApiChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  Activate connection immediately
                </span>
              </label>
                             <p className="text-sm text-gray-500 mt-1">
                 If checked, connection will be activated immediately after creation
               </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/integrations"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Supplier'}
          </button>
        </div>
      </form>
    </div>
  )
} 