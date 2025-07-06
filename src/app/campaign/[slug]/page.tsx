'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  discountedPrice?: number
  images: string[]
  brand: string
  category: string
  description: string
  sizes?: string[]
  colors?: string[]
  recommendation?: string
  brandLogo?: string
}

type CampaignData = {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  influencer?: {
    id: string
    name: string
    avatar?: string
    bio?: string
    followers?: string
    instagram?: string
    tiktok?: string
    youtube?: string
  }
  products: Product[]
}

const socialPlatforms = [
  { key: 'instagram', name: 'Instagram', color: 'from-purple-500 to-pink-500', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { key: 'tiktok', name: 'TikTok', color: 'bg-black', icon: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  { key: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
]

// Cart component
const Cart = ({ isOpen, onClose, cartItems, updateQuantity, removeItem }: any) => {
  const total = cartItems.reduce((sum: number, item: any) => sum + (item.discountedPrice * item.quantity), 0)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item: any) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 border rounded-lg">
                    <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ', '}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </p>
                      <p className="font-semibold">€{item.discountedPrice}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                          className="ml-2 text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total: €{total.toFixed(2)}</span>
                </div>
                <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LiveCampaign() {
  const params = useParams()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [discountCodeCopied, setDiscountCodeCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCartProductId, setAddedToCartProductId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)
  const [campaignStarted, setCampaignStarted] = useState(false)

  // Function to calculate time left until campaign starts
  const calculateTimeLeft = (startDate: string) => {
    const now = new Date().getTime()
    const campaignStart = new Date(startDate).getTime()
    const difference = campaignStart - now

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      return { days, hours, minutes, seconds }
    }
    
    return null
  }

  // Check if campaign has started
  const checkCampaignStatus = (startDate: string) => {
    const now = new Date().getTime()
    const campaignStart = new Date(startDate).getTime()
    const hasStarted = now >= campaignStart
    console.log('🕐 Campaign status check:', {
      now: new Date(now).toISOString(),
      start: new Date(campaignStart).toISOString(),
      hasStarted
    })
    return hasStarted
  }

  useEffect(() => {
    setMounted(true)
    
    // Load campaign data
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaign/${params.slug}`)
        if (!response.ok) {
          throw new Error('Campaign not found')
        }
        const result = await response.json()
        
        // Transform API response to expected format - USE REAL DATA ONLY
        const campaignData: CampaignData = {
          id: result.campaign.id,
          name: result.campaign.name,
          description: result.campaign.description,
          startDate: result.campaign.startDate,
          endDate: result.campaign.endDate,
          isActive: result.campaign.isActive,
          products: result.campaign.products || [],
          influencer: result.campaign.influencer // No mock fallback - use real data only
        }
        
        console.log('📊 Campaign data loaded:', {
          influencer: campaignData.influencer?.name,
          influencerBio: campaignData.influencer?.bio,
          productsCount: campaignData.products.length,
          startDate: campaignData.startDate,
          isActive: campaignData.isActive
        })
        
        // Log first few products for debugging
        if (campaignData.products.length > 0) {
          console.log('📦 First product:', campaignData.products[0])
        }
        
        setCampaignData(campaignData)
        
        // Check campaign status initially
        const started = checkCampaignStatus(campaignData.startDate)
        setCampaignStarted(started)
        
        if (!started) {
          // Initial countdown calculation
          const timeRemaining = calculateTimeLeft(campaignData.startDate)
          setTimeLeft(timeRemaining)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.slug) {
      fetchCampaign()
    }
  }, [params.slug])

  // Separate useEffect for countdown timer
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null

    if (campaignData && !campaignStarted) {
      const updateCountdown = () => {
        const timeRemaining = calculateTimeLeft(campaignData.startDate)
        console.log('⏰ Countdown update:', timeRemaining) // Debug log
        setTimeLeft(timeRemaining)
        
        if (!timeRemaining) {
          console.log('🚀 Campaign started!')
          setCampaignStarted(true)
          if (countdownInterval) {
            clearInterval(countdownInterval)
          }
        }
      }
      
      // Initial call
      updateCountdown()
      
      // Set up interval
      countdownInterval = setInterval(updateCountdown, 1000)
    }

    // Cleanup interval on unmount or when campaign starts
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [campaignData, campaignStarted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error || !campaignData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This campaign does not exist or is no longer available.'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const copyDiscountCode = async () => {
    const discountCode = campaignData?.influencer?.name ? `${campaignData.influencer.name.toUpperCase()}20` : 'DISCOUNT20'
    try {
      await navigator.clipboard.writeText(discountCode)
      setDiscountCodeCopied(true)
      setTimeout(() => setDiscountCodeCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const updateQuantity = (id: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id, size, color)
      return
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id && item.selectedSize === size && item.selectedColor === color
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeItem = (id: string, size: string, color: string) => {
    setCartItems(cartItems.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    ))
  }

  // Funkce pro přidání produktu do košíku
  const addToCart = (product: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const discountedPrice = product.discountedPrice || (product.price * 0.8)
    const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size'
    const selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
    
    const existingItem = cartItems.find(item => 
      item.id === product.id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    )
    
    if (existingItem) {
      updateQuantity(product.id, selectedSize, selectedColor, existingItem.quantity + 1)
    } else {
      setCartItems([...cartItems, {
        ...product,
        discountedPrice,
        selectedSize,
        selectedColor,
        quantity: 1
      }])
    }

    // Zobraz feedback na 2 vteřiny
    setAddedToCartProductId(product.id)
    setTimeout(() => {
      setAddedToCartProductId(null)
    }, 2000)
  }

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={campaignData.influencer?.avatar || '/avatars/prague_fashionista_1750324937394.jpg'}
                alt={campaignData.influencer?.name || 'Influencer'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold">{campaignData.influencer?.name || 'Influencer'}'s Campaign</h1>
                <p className="text-sm text-gray-500">
                  {campaignStarted ? 'Exclusive discount available' : 'Starting soon...'}
                </p>
              </div>
            </div>
            
            {campaignStarted && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6.5M17 17v6a2 2 0 002 2h.5"/>
                </svg>
                Cart ({cartItemsCount})
              </button>
            )}
            
            {!campaignStarted && (
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Campaign Countdown (if not started) */}
        {!campaignStarted && timeLeft && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 mb-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Campaign Starts Soon!</h2>
            <p className="text-lg mb-6 opacity-90">Get ready for exclusive deals from {campaignData.influencer?.name}</p>
            
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-md border border-white/30">
                <div className="text-3xl font-bold text-purple-600">{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-sm text-purple-700 font-medium">Days</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-white/30">
                <div className="text-3xl font-bold text-purple-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-sm text-purple-700 font-medium">Hours</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-white/30">
                <div className="text-3xl font-bold text-purple-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-sm text-purple-700 font-medium">Minutes</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md border border-white/30">
                <div className="text-3xl font-bold text-purple-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-sm text-purple-700 font-medium">Seconds</div>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-sm opacity-75 mb-2">Campaign starts on</p>
              <p className="text-xl font-semibold">
                {new Date(campaignData.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Influencer Section – show only after campaign start */}
        {campaignStarted && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <img
                src={campaignData.influencer?.avatar || '/avatars/prague_fashionista_1750324937394.jpg'}
                alt={campaignData.influencer?.name || 'Influencer'}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaignData.influencer?.name || 'Influencer'}</h2>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {campaignData.influencer?.followers || '0'} followers
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {campaignData.influencer?.instagram && (
                      <a
                        href={campaignData.influencer.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-white rounded-lg hover:shadow-lg transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {campaignData.influencer?.tiktok && (
                      <a
                        href={campaignData.influencer.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-white rounded-lg hover:shadow-lg transition-all bg-black"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      </a>
                    )}
                    {campaignData.influencer?.youtube && (
                      <a
                        href={campaignData.influencer.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-white rounded-lg hover:shadow-lg transition-all bg-red-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6">{campaignData.influencer?.bio || `Welcome to ${campaignData.influencer?.name || 'my'} exclusive campaign! Check out these amazing products with special discount.`}</p>
                
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200 inline-block">
                  <p className="text-sm text-gray-600 mb-2">Exclusive Discount Code</p>
                  <div className="flex items-center gap-3">
                    <code className="bg-white px-3 py-2 rounded border text-lg font-mono font-bold text-purple-600">
                      {campaignData.influencer?.name ? `${campaignData.influencer.name.toUpperCase()}20` : 'DISCOUNT20'}
                    </code>
                    <button
                      onClick={copyDiscountCode}
                      className={`px-3 py-2 rounded font-medium transition-colors ${
                        discountCodeCopied 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {discountCodeCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <span className="text-sm text-gray-600">(20% OFF)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section - Only show when campaign has started */}
        {campaignStarted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">My Selected Products</h3>
            <p className="text-sm text-gray-500">
              {campaignData.products.length} products • All prices include 20% discount
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaignData.products.map((product) => {
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    try {
                      localStorage.setItem('selectedProduct', JSON.stringify({ ...product, influencer: campaignData.influencer }))
                      window.open(`/campaign/${params.slug}/product/${product.id}`, '_blank')
                    } catch {}
                  }}
                  className="bg-white shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 group relative hover:shadow-md hover:border-gray-200 cursor-pointer flex flex-col"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                      -20%
                    </div>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Product Info - flex-1 to take remaining space */}
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{product.brand}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-black">€{product.discountedPrice || (product.price * 0.8).toFixed(2)}</span>
                      <span className="text-sm text-gray-400 line-through">€{product.price}</span>
                    </div>
                    
                    {/* Influencer Recommendation - použij skutečná data */}
                    {product.recommendation && (
                      <div className="mb-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 overflow-hidden">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                              <span className="text-xs font-medium text-blue-700">My recommendation</span>
                            </div>
                          </div>
                          <p className="text-xs text-blue-800 italic break-words">"{product.recommendation.length > 100 ? product.recommendation.substring(0, 100) + '...' : product.recommendation}"</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Spacer to push button to bottom */}
                    <div className="flex-1"></div>
                    
                    <button 
                      onClick={(e) => addToCart(product, e)}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 mt-auto ${
                        addedToCartProductId === product.id
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {addedToCartProductId === product.id ? '✓ Added to Cart!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </main>

      {/* Cart - Only when campaign started */}
      {campaignStarted && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      )}
    </div>
  )
}
