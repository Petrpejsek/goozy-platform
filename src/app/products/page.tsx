'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  sku: string
  stockQuantity: number
  brand: {
    id: string
    name: string
    logo?: string
  }
}

interface Category {
  name: string
  count: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Načtení produktů
  const fetchProducts = async (category?: string) => {
    try {
      setLoading(true)
      const url = category 
        ? `/api/products?category=${encodeURIComponent(category)}&limit=20`
        : '/api/products?limit=20'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
      } else {
        setError(data.error || 'Nepodařilo se načíst produkty')
      }
    } catch (err) {
      setError('Chyba při načítání produktů')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Načtení kategorií
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (err) {
      console.error('Chyba při načítání kategorií:', err)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchProducts(category || undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black">
              GOOZY
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-black">
                Domů
              </Link>
              <Link href="/products" className="text-black font-medium">
                Produkty
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Všechny produkty
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Objevte nejnovější módní trendy od našich partnerských značek
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Všechny ({categories.reduce((sum, cat) => sum + cat.count, 0)})
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Načítám produkty...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchProducts(selectedCategory || undefined)}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Zkusit znovu
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">📷</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">{product.brand.name}</span>
                    <span className="text-sm text-gray-400 ml-2">• {product.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-black">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stockQuantity} ks skladem
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs text-gray-600">Velikosti: </span>
                    <span className="text-xs font-medium">{product.sizes.join(', ')}</span>
                  </div>
                  
                  <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                    Zobrazit detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {selectedCategory 
                ? `Žádné produkty v kategorii "${selectedCategory}"`
                : 'Žádné produkty nenalezeny'
              }
            </p>
            {selectedCategory && (
              <button 
                onClick={() => handleCategoryChange('')}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Zobrazit všechny produkty
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            Powered by
          </p>
          <Link href="/" className="text-black font-bold hover:underline">
            GOOZY
          </Link>
        </div>
      </footer>
    </div>
  )
} 