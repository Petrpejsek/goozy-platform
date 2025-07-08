'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Mock fallback campaign (frontend only)
const mockCampaignData = {
  influencer: {
    name: 'Demo Influencer',
    avatar: 'https://picsum.photos/100/100?random=99',
    followers: '100K',
    discountCode: 'DEMO20',
    discountPercent: 20,
  },
  products: [
    {
      id: 'demo1',
      name: 'Demo T-Shirt',
      price: 29.9,
      discountedPrice: 23.9,
      images: ['https://picsum.photos/600/600?random=11'],
      brand: 'DemoBrand',
      category: 'T-Shirts',
      description: 'Sample description of demo product.',
      recommendation: 'This is a demo recommendation used as fallback.'
    }
  ]
}

// Helper pro načtení kampaně (stejné jako na stránce kampaně)
const loadCampaignDataBySlug = async (slug: string) => {
  try {
    // 1) Zkusíme API
    const res = await fetch(`/api/campaign/${slug}`)
    if (res.ok) {
      const json = await res.json()
      if (json.success) return json.campaign
    }
    // 2) Fallback localStorage (kompatibilita s mocky)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeCampaign')
      if (saved) return JSON.parse(saved)
    }
    return null
  } catch (err) {
    console.error('Failed to load campaign:', err)
    return null
  }
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const campaignSlug = params.slug as string
  const productId = params.productId as string

  const [product, setProduct] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const campaign = await loadCampaignDataBySlug(campaignSlug)
      let prod = null
      if (campaign) {
        setInfluencer(campaign.influencer)
        prod = campaign.products?.find((p: any) => String(p.id) === String(productId))
        if (prod) {
          setProduct(prod)
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0])
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0])
        }
      }
      if (!campaign && !prod) {
        // Use fallback mock
        setInfluencer(mockCampaignData.influencer)
        const fallback = mockCampaignData.products.find(p=>String(p.id)===String(productId)) || mockCampaignData.products[0]
        setProduct(fallback)
      }
      setIsLoading(false)
    }
    load()
  }, [productId, campaignSlug])

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      productId,
      selectedSize,
      selectedColor,
      quantity
    })
    alert('Product added to cart!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link
            href={`/campaign/${campaignSlug}`}
            className="inline-block bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Campaign
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/campaign/${campaignSlug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Campaign
            </Link>
            
            <div className="flex items-center gap-4">
              {influencer && (
                <div className="flex items-center gap-3">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-8 h-8 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/32/32?random=1';
                    }}
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{influencer.name}</p>
                    <p className="text-gray-500">{influencer.followers} followers</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/campaign/${campaignSlug}`} className="hover:text-gray-900 transition-colors">
            Campaign
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://picsum.photos/600/600?random=99';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 font-medium">
                  {product.brand}
                </span>
                <span className="text-sm text-gray-600">{product.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-black">€{product.discountedPrice}</span>
                <span className="text-xl text-gray-500 line-through">€{product.price}</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 text-sm font-bold">
                  -{influencer?.discountPercent}% OFF
                </span>
              </div>

              <div className="text-lg text-green-600 font-semibold">
                You save €{(product.price - product.discountedPrice).toFixed(2)}
              </div>
            </div>

            {/* Influencer Recommendation */}
            {product.recommendation && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-12 h-12 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/48/48?random=1';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-900">{influencer.name}</span>
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-purple-700">{influencer.followers} followers</p>
                  </div>
                </div>
                <blockquote className="text-purple-900 italic text-lg leading-relaxed">
                  "{product.recommendation}"
                </blockquote>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-4 px-8 text-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Add to Cart - €{product.discountedPrice}
              </button>

              {/* Discount Code */}
              {influencer?.discountCode && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Use discount code:</p>
                      <code className="text-lg font-bold text-purple-900">{influencer.discountCode}</code>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-700">Save</p>
                      <p className="text-lg font-bold text-purple-900">{influencer.discountPercent}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white border border-gray-200 mb-16">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
 