'use client'

import React, { useState } from 'react'
import AddProductModal from '@/components/AddProductModal'

interface ProductsContentProps {
  products: any[]
  brands: { id: string; name: string }[]
  categories: { category: string }[]
  totalCount: number
  totalPages: number
  page: number
  params: any
  totalProducts: number
  totalBrands: number
  outOfStock: number
  totalValue: { _sum: { price: number } }
}

export default function ProductsContent({
  products,
  brands,
  categories,
  totalCount,
  totalPages,
  page,
  params,
  totalProducts,
  totalBrands,
  outOfStock,
  totalValue
}: ProductsContentProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleProductAdded = () => {
    // Refresh the page to show the new product
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
          </div>
          
          {/* Add Product Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <span className="text-lg">➕</span>
            <span>Add Product</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Products" 
            value={totalProducts} 
            color="blue" 
            icon="📦"
          />
          <StatCard 
            title="Total Value" 
            value={`€${(totalValue._sum.price || 0).toFixed(0)}`} 
            color="green" 
            icon="💰"
          />
          <StatCard 
            title="Out of Stock" 
            value={outOfStock} 
            color="red" 
            icon="⚠️"
          />
          <StatCard 
            title="Active Brands" 
            value={totalBrands} 
            color="purple" 
            icon="🏢"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h2>
          
          <form method="GET" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Product name, SKU, brand..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  name="brand"
                  defaultValue={params.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  defaultValue={params.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  name="availability"
                  defaultValue={params.availability}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Products</option>
                  <option value="available">Available</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <a
                href="/admin/products"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </a>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <p className="text-gray-600 mt-1">
                  Showing {products.length} of {totalCount} products
                  {Object.keys(params).length > 0 && ' (filtered)'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  📊 Export CSV
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  🔄 Sync Products
                </button>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand & Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price & Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const images = product.images ? JSON.parse(product.images) : []
                      const firstImage = Array.isArray(images) ? images[0] : images
                      const isAvailable = product.isAvailable && product.stockQuantity > 0
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0">
                                {firstImage ? (
                                  <img 
                                    className="h-12 w-12 rounded-lg object-cover" 
                                    src={firstImage} 
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                                    📦
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku}
                                </div>
                                {product.externalId && (
                                  <div className="text-xs text-gray-400">
                                    ID: {product.externalId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{product.brand?.name || product.brand_name}</div>
                              <div className="text-gray-500">{product.category}</div>
                              {product.gender && (
                                <div className="text-xs text-gray-400">{product.gender}</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">€{product.price.toFixed(2)}</div>
                              <div className="text-gray-500">{product.currency}</div>
                              <div className="text-xs text-gray-400">
                                Stock: {product.stockQuantity}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isAvailable ? '✅ Available' : '❌ Out of Stock'}
                              </span>
                              {product.availabilityOverride !== null && (
                                <div className="text-xs text-orange-600">🔧 Override Active</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              <div>👥 {product._count.influencerProducts} influencers</div>
                              <div>🛒 {product._count.orderItems} orders</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50">
                                ✏️ Edit
                              </button>
                              <button className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50">
                                👥 Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Page {page} of {totalPages} • {totalCount} total products
                    </div>
                    <div className="flex space-x-2">
                      {page > 1 && (
                        <a
                          href={`/admin/products?${new URLSearchParams({...params, page: (page - 1).toString()}).toString()}`}
                          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          ← Previous
                        </a>
                      )}
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                        if (pageNum > totalPages) return null
                        
                        return (
                          <a
                            key={pageNum}
                            href={`/admin/products?${new URLSearchParams({...params, page: pageNum.toString()}).toString()}`}
                            className={`px-3 py-1 border rounded text-sm transition-colors ${
                              pageNum === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </a>
                        )
                      })}
                      
                      {page < totalPages && (
                        <a
                          href={`/admin/products?${new URLSearchParams({...params, page: (page + 1).toString()}).toString()}`}
                          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          Next →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {Object.keys(params).length > 0 
                  ? 'Try adjusting your filters to see more products.'
                  : 'No products are currently available in the system.'
                }
              </p>
              {Object.keys(params).length > 0 && (
                <a
                  href="/admin/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  Clear all filters
                </a>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleProductAdded}
        brands={brands}
      />
    </div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  color, 
  icon 
}: { 
  title: string
  value: string | number
  color: 'blue' | 'green' | 'red' | 'purple'
  icon: string 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900'
  }

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  )
} 