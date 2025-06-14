'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images: string
  category: string
  sizes: string
  colors: string
  sku: string
  stockQuantity: number
  isAvailable: boolean
  brand: {
    name: string
    logo?: string
  }
}

interface ProductQuickViewProps {
  product: Product
}

export default function ProductQuickView({ product }: ProductQuickViewProps) {
  const [showModal, setShowModal] = useState(false)
  
  const images = JSON.parse(product.images || '[]')
  const sizes = JSON.parse(product.sizes || '[]')
  const colors = JSON.parse(product.colors || '[]')

  return (
    <>
      {/* Klikatelná karta produktu */}
      <div 
        onClick={() => setShowModal(true)}
        className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {images.length > 0 ? (
              <img 
                src={images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-xs">📷</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-black truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">
              {product.brand.name} • {product.category}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-black">
                €{product.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                {product.stockQuantity} ks
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Velikosti: {sizes.slice(0, 3).join(', ')}
              {sizes.length > 3 && '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Modal s detaily */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header modalu */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-black">Náhled produktu</h2>
              <div className="flex space-x-3">
                <Link 
                  href={`/admin/products/${product.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Otevřít detail
                </Link>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Obsah modalu */}
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Obrázek */}
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <img 
                      src={images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">📷</span>
                    </div>
                  )}
                </div>

                {/* Informace */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">{product.brand.name}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{product.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isAvailable ? 'Dostupný' : 'Nedostupný'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-black mb-3">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Cena a skladem */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Cena</span>
                        <div className="text-2xl font-bold text-black">
                          €{product.price.toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600">Skladem</span>
                        <div className="text-2xl font-bold text-black">
                          {product.stockQuantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Velikosti a barvy */}
                  <div className="space-y-3">
                    {sizes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">Velikosti</h4>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((size: string) => (
                            <span 
                              key={size}
                              className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {colors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">Barvy</h4>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color: string) => (
                            <span 
                              key={color}
                              className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">SKU:</span> {product.sku}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer modalu */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Klikněte na "Otevřít detail" pro kompletní informace
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Zavřít
                </button>
                <Link 
                  href={`/admin/products/${product.id}`}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Otevřít detail
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 