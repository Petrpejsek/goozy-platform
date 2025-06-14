import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminProductDetail({ params }: PageProps) {
  const { id } = await params
  
  // Načteme produkt s detaily
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      influencerProducts: true
    }
  })
  
  if (!product) {
    notFound()
  }

  // Parsujeme JSON data
  const images = JSON.parse(product.images || '[]')
  const sizes = JSON.parse(product.sizes || '[]')
  const colors = JSON.parse(product.colors || '[]')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="text-gray-600 hover:text-black"
              >
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-black">Detail produktu</h1>
            </div>
            <div className="flex space-x-3">
              <Link 
                href="/products"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Zobrazit na webu
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Obrázky produktu */}
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
                  <span className="text-gray-500 text-4xl">📷</span>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informace o produktu */}
          <div className="space-y-6">
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
              
              <h1 className="text-3xl font-bold text-black mb-4">
                {product.name}
              </h1>
              
              {product.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Cena a skladem */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Cena</span>
                  <div className="text-3xl font-bold text-black">
                    €{product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.currency}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Skladem</span>
                  <div className="text-3xl font-bold text-black">
                    {product.stockQuantity}
                  </div>
                  <div className="text-sm text-gray-500">
                    kusů
                  </div>
                </div>
              </div>
            </div>

            {/* Velikosti a barvy */}
            <div className="space-y-4">
              {sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-black mb-2">Dostupné velikosti</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: string) => (
                      <span 
                        key={size}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {colors.length > 0 && (
                <div>
                  <h3 className="font-medium text-black mb-2">Dostupné barvy</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: string) => (
                      <span 
                        key={color}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technické informace */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-black mb-3">Technické informace</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">SKU:</span>
                  <span className="ml-2 font-mono">{product.sku}</span>
                </div>
                <div>
                  <span className="text-gray-600">Externí ID:</span>
                  <span className="ml-2 font-mono">{product.externalId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vytvořeno:</span>
                  <span className="ml-2">{new Date(product.createdAt).toLocaleDateString('cs-CZ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Aktualizováno:</span>
                  <span className="ml-2">{new Date(product.updatedAt).toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiky produktu */}
        <div className="mt-12 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-black">
              Statistiky produktu
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {product.influencerProducts.length}
                </div>
                <div className="text-sm text-gray-600">
                  Influenceři propagující
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  0
                </div>
                <div className="text-sm text-gray-600">
                  Celkové prodeje
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  €0.00
                </div>
                <div className="text-sm text-gray-600">
                  Celkový obrat
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informace o značce */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-black">Informace o značce</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {product.brand.logo ? (
                  <img 
                    src={product.brand.logo} 
                    alt={product.brand.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-500 text-xl">🏢</span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-black">
                  {product.brand.name}
                </h3>
                {product.brand.description && (
                  <p className="text-gray-600 mt-1">
                    {product.brand.description}
                  </p>
                )}
                {product.brand.website && (
                  <a 
                    href={product.brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                  >
                    Navštívit web →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 