'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SupplierSettings {
  id: string
  name: string
  email: string
  brandId: string
  brand: {
    name: string
  }
  
  // Shipping API Settings
  shipping_api_endpoint?: string
  shipping_api_key?: string
  has_shipping_api: boolean
  
  // Manual Shipping Settings
  shipping_flat_rate?: number
  shipping_free_threshold?: number
  shipping_regions?: any
  shipping_rules?: any
  
  // Return Policy
  return_policy_days?: number
  return_policy_conditions?: string
  return_policy_cost?: string
  return_address?: string
  return_instructions?: string
  
  // Other
  currency: string
  vat_included: boolean
}

export default async function EditSupplierPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  
  return <EditSupplierContent supplierId={resolvedParams.id} />
}

function EditSupplierContent({ supplierId }: { supplierId: string }) {
  const router = useRouter()
  const [settings, setSettings] = useState<SupplierSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    has_shipping_api: false,
    shipping_api_endpoint: '',
    shipping_api_key: '',
    shipping_flat_rate: '',
    shipping_free_threshold: '',
    shipping_regions: '{"CZ": 5.99, "EU": 9.99}',
    return_policy_days: 14,
    return_policy_conditions: '',
    return_policy_cost: 'customer',
    return_address: '',
    return_instructions: '',
    currency: 'EUR',
    vat_included: true
  })

  useEffect(() => {
    loadSupplierSettings()
  }, [supplierId])

  const loadSupplierSettings = async () => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`)
      if (!response.ok) {
        throw new Error('Chyba při načítání nastavení dodavatele')
      }
      const data = await response.json()
      setSettings(data)
      
      // Naplnit formulář
      setFormData({
        has_shipping_api: data.has_shipping_api || false,
        shipping_api_endpoint: data.shipping_api_endpoint || '',
        shipping_api_key: data.shipping_api_key || '',
        shipping_flat_rate: data.shipping_flat_rate?.toString() || '',
        shipping_free_threshold: data.shipping_free_threshold?.toString() || '',
        shipping_regions: data.shipping_regions ? JSON.stringify(data.shipping_regions, null, 2) : '{"CZ": 5.99, "EU": 9.99}',
        return_policy_days: data.return_policy_days || 14,
        return_policy_conditions: data.return_policy_conditions || '',
        return_policy_cost: data.return_policy_cost || 'customer',
        return_address: data.return_address || '',
        return_instructions: data.return_instructions || '',
        currency: data.currency || 'EUR',
        vat_included: data.vat_included !== false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neočekávaná chyba')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Validace JSON
      let shippingRegions = null
      if (formData.shipping_regions.trim()) {
        try {
          shippingRegions = JSON.parse(formData.shipping_regions)
        } catch {
          throw new Error('Neplatný JSON formát pro shipping regions')
        }
      }

      const payload = {
        has_shipping_api: formData.has_shipping_api,
        shipping_api_endpoint: formData.shipping_api_endpoint || null,
        shipping_api_key: formData.shipping_api_key || null,
        shipping_flat_rate: formData.shipping_flat_rate ? parseFloat(formData.shipping_flat_rate) : null,
        shipping_free_threshold: formData.shipping_free_threshold ? parseFloat(formData.shipping_free_threshold) : null,
        shipping_regions: shippingRegions,
        return_policy_days: formData.return_policy_days,
        return_policy_conditions: formData.return_policy_conditions || null,
        return_policy_cost: formData.return_policy_cost,
        return_address: formData.return_address || null,
        return_instructions: formData.return_instructions || null,
        currency: formData.currency,
        vat_included: formData.vat_included
      }

      const response = await fetch(`/api/admin/suppliers/${supplierId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chyba při ukládání nastavení')
      }

      setSuccess('Nastavení úspěšně uloženo!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám nastavení...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Dodavatel nenalezen
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              href="/admin/suppliers"
              className="text-gray-500 hover:text-gray-700"
            >
              ← Zpět na dodavatele
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nastavení dodavatele</h1>
          <p className="text-gray-600 mt-1">
            {settings.name} ({settings.brand.name})
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Shipping Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🚚 Nastavení dopravy</h2>
          
          {/* API vs Manual Toggle */}
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_shipping_api}
                onChange={(e) => setFormData({...formData, has_shipping_api: e.target.checked})}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-900">
                Dodavatel má vlastní API pro ceny dopravy
              </span>
            </label>
          </div>

          {/* API Settings */}
          {formData.has_shipping_api && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900">API konfigurace</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="url"
                  value={formData.shipping_api_endpoint}
                  onChange={(e) => setFormData({...formData, shipping_api_endpoint: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="https://api.supplier.com/shipping/calculate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.shipping_api_key}
                  onChange={(e) => setFormData({...formData, shipping_api_key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="sk_..."
                />
              </div>
            </div>
          )}

          {/* Manual Settings */}
          {!formData.has_shipping_api && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixní poplatek za dopravu (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shipping_flat_rate}
                    onChange={(e) => setFormData({...formData, shipping_flat_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    placeholder="5.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free shipping nad (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shipping_free_threshold}
                    onChange={(e) => setFormData({...formData, shipping_free_threshold: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ceny podle regionů (JSON)
                </label>
                <textarea
                  value={formData.shipping_regions}
                  onChange={(e) => setFormData({...formData, shipping_regions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-sm"
                  rows={4}
                  placeholder='{"CZ": 5.99, "EU": 9.99, "WORLD": 19.99}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pokud je prázdné, použije se fixní poplatek pro všechny regiony
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Return Policy */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">↩️ Podmínky vrácení</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Počet dní na vrácení
                </label>
                <input
                  type="number"
                  value={formData.return_policy_days}
                  onChange={(e) => setFormData({...formData, return_policy_days: parseInt(e.target.value) || 14})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kdo platí return shipping
                </label>
                <select
                  value={formData.return_policy_cost}
                  onChange={(e) => setFormData({...formData, return_policy_cost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                >
                  <option value="customer">Zákazník</option>
                  <option value="supplier">Dodavatel</option>
                  <option value="shared">Sdílené náklady</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresa pro vrácení
              </label>
              <textarea
                value={formData.return_address}
                onChange={(e) => setFormData({...formData, return_address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                rows={3}
                placeholder="Jméno firmy, Ulice 123, 12345 Město, Česká republika"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Podmínky vrácení (text pro zákazníky)
              </label>
              <textarea
                value={formData.return_policy_conditions}
                onChange={(e) => setFormData({...formData, return_policy_conditions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                rows={4}
                placeholder="Zboží lze vrátit do 14 dní v původním stavu s visačkami..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrukce pro vrácení
              </label>
              <textarea
                value={formData.return_instructions}
                onChange={(e) => setFormData({...formData, return_instructions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                rows={3}
                placeholder="1. Zabalte zboží do původního obalu, 2. Přiložte kopii faktury..."
              />
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">⚙️ Další nastavení</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Měna
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="CZK">CZK (Kč)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.vat_included}
                    onChange={(e) => setFormData({...formData, vat_included: e.target.checked})}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Ceny produktů zahrnují DPH
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Ukládám...' : 'Uložit nastavení'}
        </button>
      </div>
    </div>
  )
} 