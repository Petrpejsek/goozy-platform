'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images?: string
  category: string
  sizes?: string
  colors?: string
  sku: string
  stockQuantity: number
  isAvailable: boolean
  brands: {
    id: string
    name: string
    logo?: string
  }
}

interface ProductQuickViewProps {
  product: Product
}

export default function ProductQuickView({ product }: ProductQuickViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const images = product.images ? JSON.parse(product.images) : []
  const sizes = product.sizes ? (
    typeof product.sizes === 'string' && product.sizes.startsWith('[') 
      ? JSON.parse(product.sizes) 
      : product.sizes.split(',').map(s => s.trim())
  ) : []
  const colors = product.colors ? (
    typeof product.colors === 'string' && product.colors.startsWith('[') 
      ? JSON.parse(product.colors) 
      : product.colors.split(',').map(c => c.trim())
  ) : []

  return (
    <>
      {/* Product Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
      >
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {images.length > 0 ? (
            <img 
              src={images[0]} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📷</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{product.brands.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.isAvailable ? 'Available' : 'Out of Stock'}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-black">
              €{product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {product.stockQuantity} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Image */}
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

                {/* Information */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">{product.brands.name}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{product.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Out of Stock'}
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

                  {/* Price and stock */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Price</span>
                        <div className="text-2xl font-bold text-black">
                          €{product.price.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">In Stock</span>
                        <div className="text-2xl font-bold text-black">
                          {product.stockQuantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {sizes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">Sizes</h4>
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
                        <h4 className="font-medium text-black mb-2">Colors</h4>
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

            {/* Modal footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Product managed by {product.brands.name}
                </span>
                <div className="flex space-x-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => setIsModalOpen(false)}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 