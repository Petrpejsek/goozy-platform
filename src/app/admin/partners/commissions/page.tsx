import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CommissionsPage() {
  // Získání všech partnerů pro nastavení provizí
  const partners = await prisma.brand.findMany({
    where: { 
      isActive: true,
      isApproved: true 
    },
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Získání všech kategorií produktů
  const productCategories = await prisma.product.findMany({
    where: {
      brand: {
        isActive: true,
        isApproved: true
      }
    },
    select: {
      category: true
    },
    distinct: ['category']
  })

  const categories = productCategories.map(p => p.category).filter(Boolean).sort()

  // Mock data pro commission rates (později z CommissionRate table)
  const globalCommissionRate = 15
  const partnerCommissionRates = partners.map(partner => ({
    partnerId: partner.id,
    partnerName: partner.name,
    rate: null, // null = používá globální
    customRate: false
  }))

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div className="flex items-center">
            <Link 
              href="/admin/partners" 
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              ← Back to Partners
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Commission Management</h2>
              <p className="text-sm text-gray-500">Set commission rates for partners and products</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        
        {/* Global Commission Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Global Commission Rate</h2>
              <p className="text-gray-600 mt-1">Default commission rate for all partners and products</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Default Rate</h3>
                <p className="text-gray-600">This rate applies to all products unless overridden</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{globalCommissionRate}%</div>
                  <div className="text-sm text-gray-500">for all influencers</div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Partner-Specific Rates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Partner Commission Rates</h2>
              <p className="text-gray-600 mt-1">Override global rate for specific partners</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + Add Override
            </button>
          </div>
          
          {partners.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No partners found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Products</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Current Rate</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Custom Rate</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => {
                    const partnerRate = partnerCommissionRates.find(r => r.partnerId === partner.id)
                    const currentRate = partnerRate?.rate || globalCommissionRate
                    const isCustom = partnerRate?.customRate || false
                    
                    return (
                      <tr key={partner.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              {partner.logo ? (
                                <img src={partner.logo} alt={partner.name} className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <span className="text-blue-600 font-medium text-xs">
                                  {partner.name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{partner.name}</div>
                              <div className="text-sm text-gray-500">{partner.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{partner._count.products}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className={`font-medium ${isCustom ? 'text-orange-600' : 'text-gray-900'}`}>
                              {currentRate}%
                            </span>
                            {!isCustom && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                Global
                              </span>
                            )}
                            {isCustom && (
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder={globalCommissionRate.toString()}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              {isCustom ? 'Update' : 'Set Custom'}
                            </button>
                            {isCustom && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                  Remove
                                </button>
                              </>
                            )}
                            <span className="text-gray-300">|</span>
                            <Link
                              href={`/admin/partners/${partner.id}`}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category-Specific Rates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Category Commission Rates</h2>
              <p className="text-gray-600 mt-1">Set different rates for product categories</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              + Add Category Override
            </button>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 font-medium">No product categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{category}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      Global
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{globalCommissionRate}%</div>
                      <div className="text-sm text-gray-500">Using global rate</div>
                    </div>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Set Custom
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Hierarchy Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Commission Rate Hierarchy</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Commission rates are applied in the following order of priority:
              </p>
              <ol className="text-yellow-700 text-sm space-y-1">
                <li>1. <strong>Product-specific rate</strong> (highest priority)</li>
                <li>2. <strong>Category-specific rate</strong></li>
                <li>3. <strong>Partner-specific rate</strong></li>
                <li>4. <strong>Global rate</strong> (default fallback)</li>
              </ol>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  )
} 