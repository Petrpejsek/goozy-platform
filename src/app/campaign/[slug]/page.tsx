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
  creator?: {
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
        {/* Header */}
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Shopping Cart</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-2 -m-2 touch-target"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Cart Content */}
        <div className="p-4 sm:p-6 pb-32">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6.5M17 17v6a2 2 0 002 2h.5"/>
              </svg>
              <p className="text-gray-500 text-base sm:text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm sm:text-base mt-2">Add some products to get started!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 sm:space-y-6 mb-6">
                {cartItems.map((item: any) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ', '}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </p>
                      <p className="font-semibold text-sm sm:text-base mt-2">€{item.discountedPrice}</p>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 touch-target"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-sm sm:text-base font-medium min-w-[2rem] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 touch-target"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                          className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium touch-target p-2 -m-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer with total and checkout - fixed at bottom */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:p-6 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base sm:text-lg font-semibold">Total:</span>
                <span className="text-lg sm:text-xl font-bold">€{total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-black text-white py-3 sm:py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base touch-target">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
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
          creator: result.campaign.creator // No mock fallback - use real data only
        }
        
        console.log('📊 Campaign data loaded:', {
          creator: campaignData.creator?.name,
          creatorBio: campaignData.creator?.bio,
          productsCount: campaignData.product.length,
          startDate: campaignData.startDate,
          isActive: campaignData.isActive
        })
        
        // Log first few products for debugging
        if (campaignData.product.length > 0) {
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
    const discountCode = campaignData?.creator?.name ? `${campaignData.creator.name.toUpperCase()}20` : 'DISCOUNT20'
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
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-black tracking-tight hover:opacity-80 transition-opacity">
                GOOZY
              </Link>
              <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                CAMPAIGN
              </span>
            </div>
            
            {campaignStarted && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-black text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6.5M17 17v6a2 2 0 002 2h.5"/>
                </svg>
                Cart ({cartItemsCount})
              </button>
            )}
            
            {!campaignStarted && (
              <div className="bg-purple-100 text-purple-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Campaign Countdown (if not started) */}
        {!campaignStarted && timeLeft && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Campaign Starts Soon!</h2>
            <p className="text-base sm:text-lg mb-6 opacity-90">Get ready for exclusive deals from {campaignData.creator?.name}</p>
            
            {/* Responsive countdown grid - 2x2 on mobile, 4x1 on larger screens */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-md sm:max-w-lg mx-auto">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-white/30">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-xs sm:text-sm text-purple-700 font-medium">Days</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-white/30">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs sm:text-sm text-purple-700 font-medium">Hours</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-white/30">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs sm:text-sm text-purple-700 font-medium">Minutes</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-white/30">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs sm:text-sm text-purple-700 font-medium">Seconds</div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8">
              <p className="text-xs sm:text-sm opacity-75 mb-2">Campaign starts on</p>
              <p className="text-lg sm:text-xl font-semibold">
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

        {/* Creator Section – show only after campaign start */}
        {campaignStarted && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <img
                src={campaignData.creator?.avatar || '/avatars/prague_fashionista_1750324937394.jpg'}
                alt={campaignData.creator?.name || 'Creator'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 mx-auto sm:mx-0"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{campaignData.creator?.name || 'Creator'}</h2>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {campaignData.creator?.followers || '0'} followers
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    {campaignData.creator?.instagram && (
                      <a
                        href={campaignData.creator.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-3 text-white rounded-lg hover:shadow-lg transition-all bg-gradient-to-r from-purple-500 to-pink-500 touch-target"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {campaignData.creator?.tiktok && (
                      <a
                        href={campaignData.creator.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-3 text-white rounded-lg hover:shadow-lg transition-all bg-black touch-target"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      </a>
                    )}
                    {campaignData.creator?.youtube && (
                      <a
                        href={campaignData.creator.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-3 text-white rounded-lg hover:shadow-lg transition-all bg-red-600 touch-target"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">{campaignData.creator?.bio || `Welcome to ${campaignData.creator?.name || 'my'} exclusive campaign! Check out these amazing products with special discount.`}</p>
                
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200 inline-block">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Exclusive Discount Code</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <code className="bg-white px-3 py-2 rounded border text-base sm:text-lg font-mono font-bold text-purple-600">
                      {campaignData.creator?.name ? `${campaignData.creator.name.toUpperCase()}20` : 'DISCOUNT20'}
                    </code>
                    <button
                      onClick={copyDiscountCode}
                      className={`px-3 py-2 rounded font-medium transition-colors text-sm sm:text-base touch-target ${
                        discountCodeCopied 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {discountCodeCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600">(20% OFF)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section - Only show when campaign has started */}
        {campaignStarted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">My Selected Products</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {campaignData.product.length} products • All prices include 20% discount
              </p>
            </div>
            
            {/* Responsive product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {campaignData.product.map((product) => {
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      try {
                        localStorage.setItem('selectedProduct', JSON.stringify({ ...product, creator: campaignData.creator }))
                        window.open(`/campaign/${params.slug}/product/${product.id}`, '_blank')
                      } catch {}
                    }}
                    className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden transition-all duration-200 group relative hover:shadow-md hover:border-gray-200 cursor-pointer flex flex-col touch-target"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                        -20%
                      </div>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Product Info - flex-1 to take remaining space */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">{product.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mb-3">{product.brand}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg sm:text-xl font-bold text-black">€{product.discountedPrice || (product.price * 0.8).toFixed(2)}</span>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">€{product.price}</span>
                      </div>
                      
                      {/* Creator Recommendation - použij skutečná data */}
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
                                <span className="text-xs font-medium text-blue-700">{campaignData.creator?.name || 'Creator'} recommends</span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">{product.recommendation}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Add to Cart Button - at bottom of card */}
                      <div className="mt-auto">
                        <button
                          onClick={(e) => addToCart(product, e)}
                          className={`w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base touch-target ${
                            addedToCartProductId === product.id 
                              ? 'bg-green-600 text-white' 
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {addedToCartProductId === product.id ? 'Added to Cart!' : 'Add to Cart'}
                        </button>
                      </div>
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
