import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Funkce pro vytvoření slug z jména
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default async function InfluencerPage({ params }: PageProps) {
  const { slug } = await params
  
  // Najdeme influencera podle slug vytvořeného z jména
  const influencerApplications = await prisma.influencerApplication.findMany({
    where: { status: 'approved' }
  })
  
  // Najdeme influencera, jehož slug odpovídá URL
  const influencer = influencerApplications.find(app => 
    createSlug(app.name) === slug
  )
  
  if (!influencer) {
    notFound()
  }

  // Načteme skutečné produkty z databáze
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      stockQuantity: {
        gt: 0
      }
    },
    include: {
      brand: {
        select: {
          name: true,
          logo: true
        }
      }
    },
    take: 6, // Zobrazíme max 6 produktů
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transformujeme produkty pro zobrazení
  const displayProducts = products.map(product => {
    const images = JSON.parse(product.images || '[]')
    const sizes = JSON.parse(product.sizes || '[]')
    const discountCode = `${influencer.name.replace(/\s+/g, '').toUpperCase()}15`
    const discountedPrice = product.price * 0.85 // 15% sleva
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: discountedPrice,
      originalPrice: product.price,
      discountCode,
      images,
      brand: product.brand.name,
      sizes,
      sku: product.sku,
      category: product.category
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black">
              GOOZY
            </Link>
            <div className="text-sm text-gray-600">
              Influencer stránka
            </div>
          </div>
        </div>
      </header>

      {/* Influencer Profile Header */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {influencer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-black mb-2">
              {influencer.name}
            </h1>
            
            {influencer.bio && (
              <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
                {influencer.bio}
              </p>
            )}
            
            <div className="flex justify-center space-x-4 mb-6">
              {influencer.instagram && (
                <a 
                  href={`https://instagram.com/${influencer.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-black"
                >
                  <span>📱</span>
                  <span>{influencer.instagram}</span>
                </a>
              )}
              
              {influencer.tiktok && (
                <a 
                  href={`https://tiktok.com/@${influencer.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-black"
                >
                  <span>🎵</span>
                  <span>{influencer.tiktok}</span>
                </a>
              )}
              
              {influencer.youtube && (
                <a 
                  href={`https://youtube.com/c/${influencer.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-black"
                >
                  <span>🎥</span>
                  <span>{influencer.youtube}</span>
                </a>
              )}
            </div>
            
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              💰 Sleva 15% na všechny produkty
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Moje oblíbené produkty
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vybral jsem pro vás ty nejlepší kousky. Získejte 15% slevu s mým kódem!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
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
                      <span className="text-gray-500">📷 Obrázek produktu</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">{product.brand}</span>
                    <span className="text-sm text-gray-400 ml-2">• {product.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-black mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-black">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      -15%
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Velikosti: </span>
                    <span className="text-sm font-medium">{product.sizes.join(', ')}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        Slevoý kód:
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono">
                          {product.discountCode}
                        </code>
                        <CopyButton text={product.discountCode} />
                      </div>
                    </div>
                    
                    <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                      Koupit nyní
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            Tato stránka je poskytována platformou
          </p>
          <Link href="/" className="text-black font-bold hover:underline">
            GOOZY
          </Link>
        </div>
      </footer>
    </div>
  )
} 