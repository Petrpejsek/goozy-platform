import React from 'react'

export interface Product {
  id: number | string
  name: string
  price: number
  commission: number
  stock: number
  category: string
  status: string
  image?: string
}

interface ProductsTabProps {
  products: Product[]
  filteredProducts: Product[]
  searchTerm: string
  selectedCategory: string
  setSearchTerm: (v: string) => void
  setSelectedCategory: (v: string) => void
  setShowAddProduct: (v: boolean) => void
  setShowEditProduct: (v: boolean) => void
  setEditingProduct: (p: Product | null) => void
  setAddProductTab: (t: string) => void
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  filteredProducts,
  searchTerm,
  selectedCategory,
  setSearchTerm,
  setSelectedCategory,
  setShowAddProduct,
  setShowEditProduct,
  setEditingProduct,
  setAddProductTab,
  setProducts
}) => {
  // Funkce pro export do CSV
  const exportToCsv = () => {
    // Připravit CSV hlavičky
    const headers = ['ID', 'Name', 'Category', 'Price (CZK)', 'Commission (%)', 'Stock', 'Status']
    
    // Připravit data řádky
    const csvData = filteredProducts.map(product => [
      product.id,
      `"${product.name}"`, // Obalit název do uvozovek pro případ obsahování čárek
      product.category,
      product.price,
      product.commission,
      product.stock,
      product.status
    ])
    
    // Sestavit CSV obsah
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    // Vytvořit a stáhnout soubor
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
            <p className="text-sm text-gray-500">Manage your products available for influencer campaigns</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, category, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Beauty</option>
              <option>Home</option>
              <option>Sports</option>
              <option>Food</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={exportToCsv}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Commission</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Sales</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || selectedCategory !== 'All Categories'
                          ? 'Try adjusting your search criteria or filters'
                          : 'Add your first product to get started'}
                      </p>
                      {(searchTerm || selectedCategory !== 'All Categories') && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('All Categories')
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xl">📦</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{product.price} Kč</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium text-green-600">{product.commission}%</span>
                        <span className="text-xs text-gray-500 ml-1">
                          (~{Math.round((product.price * product.commission) / 100)} Kč)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">pcs</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">47</div>
                        <div className="text-xs text-gray-500">this month</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product as any)
                            setShowEditProduct(true)
                            setAddProductTab('basic')
                          }}
                          className="text-gray-600 hover:text-blue-600 p-1 transition-colors"
                          title="Edit Product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              setProducts(products.filter((p) => p.id !== product.id))
                            }
                          }}
                          className="text-gray-600 hover:text-red-600 p-1 transition-colors"
                          title="Delete Product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProductsTab) 