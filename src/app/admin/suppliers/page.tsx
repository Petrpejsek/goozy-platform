'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  isActive: boolean
  brandId: string
  brand: {
    name: string
  }
  // Shipping settings
  has_shipping_api: boolean
  shipping_free_threshold?: number
  shipping_flat_rate?: number
  // Return policy
  return_policy_days?: number
  return_policy_cost?: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/admin/suppliers')
      if (!response.ok) {
        throw new Error('Chyba při načítání dodavatelů')
      }
      const data = await response.json()
      setSuppliers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neočekávaná chyba')
    } finally {
      setLoading(false)
    }
  }

  const toggleSupplierStatus = async (id: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/suppliers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      if (!response.ok) {
        throw new Error('Chyba při aktualizaci stavu')
      }

      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? { ...supplier, isActive: newStatus } : supplier
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při aktualizaci')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám dodavatele...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa dodavatelů</h1>
          <p className="text-gray-600 mt-2">Konfigurace shipping a return policies pro dodavatele</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dodavatel
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Značka
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doprava
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vrácení
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.email}</div>
                      {supplier.phone && (
                        <div className="text-sm text-gray-500">{supplier.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{supplier.brand.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {supplier.has_shipping_api ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🔗 API
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          📝 Manuální
                        </span>
                      )}
                      {supplier.shipping_free_threshold && (
                        <div className="text-xs text-gray-500">
                          Free nad €{supplier.shipping_free_threshold}
                        </div>
                      )}
                      {supplier.shipping_flat_rate && (
                        <div className="text-xs text-gray-500">
                          Poplatek: €{supplier.shipping_flat_rate}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {supplier.return_policy_days && (
                        <div className="text-sm text-gray-900">{supplier.return_policy_days} dní</div>
                      )}
                      {supplier.return_policy_cost && (
                        <div className="text-xs text-gray-500">
                          Platí: {supplier.return_policy_cost === 'customer' ? 'Zákazník' : 
                                 supplier.return_policy_cost === 'supplier' ? 'Dodavatel' : 'Sdílené'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleSupplierStatus(supplier.id, !supplier.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {supplier.isActive ? '✅ Aktivní' : '❌ Neaktivní'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/suppliers/${supplier.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        ⚙️ Nastavení
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-lg font-medium">Žádní dodavatelé</div>
                    <p className="mt-2">Dodavatelé se vytváří automaticky když partneři přidají produkty.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 