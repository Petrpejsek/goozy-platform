'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function InfluencerProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Kontrola autentifikace a načtení dat
  useEffect(() => {
    const token = localStorage.getItem('influencerToken')
    if (!token) {
      router.push('/influencer/login')
      return
    }

    fetchCategories()
    fetchProducts()
    fetchSelectedProducts()
  }, [router])

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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchProducts(category || undefined)
  }

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const calculateDiscountedPrice = (price: number) => {
    return price * 0.85 // 15% sleva
  }

  // Načtení vybraných produktů influencera
  const fetchSelectedProducts = async () => {
    try {
      const token = localStorage.getItem('influencerToken')
      if (!token) return

      const response = await fetch('/api/influencer/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const productIds = data.products.map((p: any) => p.id)
        setSelectedProducts(new Set(productIds))
      }
    } catch (err) {
      console.error('Chyba při načítání vybraných produktů:', err)
    }
  }

  // Uložení výběru produktů
  const saveProductSelection = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('influencerToken')
      if (!token) {
        alert('Chyba autentizace. Prosím přihlaste se znovu.')
        return
      }

      const response = await fetch('/api/influencer/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          action: 'set'
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.error || 'Nepodařilo se uložit výběr'}`)
      }
    } catch (err) {
      console.error('Chyba při ukládání výběru:', err)
      alert('❌ Nepodařilo se uložit výběr')
    } finally {
      setSaving(false)
    }
  }

  // Vymazání všech vybraných produktů
  const clearAllSelection = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('influencerToken')
      if (!token) return

      const response = await fetch('/api/influencer/products', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSelectedProducts(new Set())
        const data = await response.json()
        alert(`✅ ${data.message}`)
      } else {
        const data = await response.json()
        alert(`❌ ${data.error || 'Nepodařilo se vymazat výběr'}`)
      }
    } catch (err) {
      console.error('Chyba při mazání výběru:', err)
      alert('❌ Nepodařilo se vymazat výběr')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/influencer/dashboard"
                className="text-gray-600 hover:text-black"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-black">Katalog produktů</h1>
            </div>
                         <div className="flex space-x-3">
               {selectedProducts.size > 0 && (
                 <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                   {selectedProducts.size} vybráno
                 </div>
               )}
               <Link 
                 href="/influencer/dashboard"
                 className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
               >
                 🏠 Dashboard
               </Link>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Vyberte produkty pro svou stránku
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Prozkoumejte katalog produktů a vyberte ty, které chcete propagovat. 
            Každý produkt bude mít automaticky 15% slevu pro vaše sledující.
          </p>
        </div>

        {/* Selected Products Info */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">
                  {selectedProducts.size} produktů vybráno
                </h3>
                <p className="text-sm text-blue-700">
                  Tyto produkty se zobrazí na vaší osobní stránce s 15% slevou
                </p>
              </div>
              <button 
                onClick={saveProductSelection}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Ukládám...' : 'Uložit výběr'}
              </button>
            </div>
          </div>
        )}

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
            {products.map((product) => {
              const isSelected = selectedProducts.has(product.id)
              const discountedPrice = calculateDiscountedPrice(product.price)
              
              return (
                <div 
                  key={product.id} 
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                      ✓
                    </div>
                  )}
                  
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
                    
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          €{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          €{product.price.toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          -15%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cena pro vaše sledující
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-xs text-gray-600">Velikosti: </span>
                      <span className="text-xs font-medium">{product.sizes.join(', ')}</span>
                    </div>
                    
                    <button 
                      onClick={() => toggleProductSelection(product.id)}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {isSelected ? 'Odebrat z výběru' : 'Přidat do výběru'}
                    </button>
                  </div>
                </div>
              )
            })}
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

      {/* Spacer for fixed bottom bar */}
      {selectedProducts.size > 0 && <div className="h-20"></div>}

      {/* Fixed bottom bar when products selected */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <span className="font-medium text-black">
                {selectedProducts.size} produktů vybráno
              </span>
              <p className="text-sm text-gray-600">
                Zobrazí se na vaší osobní stránce s 15% slevou
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={clearAllSelection}
                disabled={saving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vymazat vše
              </button>
              <button 
                onClick={saveProductSelection}
                disabled={saving}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Ukládám...' : 'Uložit výběr'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 