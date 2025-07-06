import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductQuickView from '@/components/ProductQuickView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminProductDetail({ params }: PageProps) {
  try {
    const { id } = await params
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        brands: true,
      },
    })

    if (!product) {
      return (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
              <Link href="/admin" className="text-blue-600 hover:underline">
                Return to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    const images = product.images ? JSON.parse(product.images) : []
    const sizes = product.sizes ? JSON.parse(product.sizes) : []
    const colors = product.colors ? JSON.parse(product.colors) : []

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Admin Dashboard
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Product Details</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <img 
                      src={images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500 text-6xl">📷</span>
                    </div>
                  )}
                </div>
                
                {/* Additional images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1, 5).map((image: string, index: number) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${product.name} - ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
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
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-black mb-4">
                    {product.name}
                  </h1>
                  
                  {product.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Price</span>
                      <div className="text-3xl font-bold text-black">
                        €{product.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.currency}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">In Stock</span>
                      <div className="text-3xl font-bold text-black">
                        {product.stockQuantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        pieces
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sizes and Colors */}
                <div className="space-y-4">
                  {sizes.length > 0 && (
                    <div>
                      <h3 className="font-medium text-black mb-3">Sizes</h3>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string) => (
                          <span 
                            key={size}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {colors.length > 0 && (
                    <div>
                      <h3 className="font-medium text-black mb-3">Colors</h3>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color: string) => (
                          <span 
                            key={color}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-black mb-3">Technical Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-mono">{product.sku}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">External ID:</span>
                      <span className="ml-2 font-mono">{product.externalId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2">{new Date(product.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Updated:</span>
                      <span className="ml-2">{new Date(product.updatedAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-black mb-4">Product Statistics</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading product:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error loading product</h1>
            <Link href="/admin" className="text-blue-600 hover:underline">
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }
} 