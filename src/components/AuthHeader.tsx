'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export default function AuthHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Přidat event listener pro click na logo/homepage linky
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    
    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Check auth status when component mounts or updates (less frequently)
    const interval = setInterval(checkAuthStatus, 60000) // Check every 60 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const checkAuthStatus = async () => {
    try {
      // Guard: Skip auth check if not in browser environment
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      // Nejdříve zkusíme najít token pro creatora
      const creatorToken = localStorage.getItem('creator_token') || sessionStorage.getItem('creator_token')
      
      if (creatorToken) {
        try {
          // Zkusíme ověřit creator token
          const response = await fetchWithTimeout('/api/creator/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${creatorToken}`,
              'Content-Type': 'application/json'
            }
          }, 5000)

          if (response.ok) {
            const data = await response.json()
            const creator = data.creator || data
            const newUser = {
              id: creator.id || 'unknown-id',
              name: creator.name || 'Unknown User',
              email: creator.email || 'No email',
              avatar: creator.avatar
            }
            setUser(newUser)
            setUserType('creator')
            setIsLoading(false)
            return
          } else {
            // Token není platný, odstraníme ho
            localStorage.removeItem('creator_token')
            localStorage.removeItem('creator_user')
            sessionStorage.removeItem('creator_token')
            sessionStorage.removeItem('creator_user')
          }
        } catch (creatorError) {
          console.warn('⚠️ Creator auth check failed:', creatorError)
          // Pokračujeme k brand auth
        }
      }

      try {
        // Zkusíme brand auth (pomocí cookies)
        const brandResponse = await fetchWithTimeout('/api/auth/brand/verify', {
          method: 'GET',
          credentials: 'include'
        }, 5000)

        if (brandResponse.ok) {
          const data = await brandResponse.json()
          setUser({
            id: data.user.brandId || 'unknown-brand-id',
            name: data.user.brandName || 'Unknown Brand',
            email: data.user.email || 'No email'
          })
          setUserType('brand')
          setIsLoading(false)
          return
        }
      } catch (brandError) {
        console.warn('⚠️ Brand auth check failed:', brandError)
        // Continue to fallback
      }

      // Žádný validní token nenalezen
      setUser(null)
      setUserType(null)
      setIsLoading(false)

    } catch (error) {
      console.error('❌ Error checking auth status:', error)
      setUser(null)
      setUserType(null)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (userType === 'creator') {
        // Pro creatiry jen odebereme tokeny z localStorage
        localStorage.removeItem('creator_token')
        localStorage.removeItem('creator_user')
        sessionStorage.removeItem('creator_token')
        sessionStorage.removeItem('creator_user')
      } else if (userType === 'brand') {
        // Pro brandy zavoláme logout API
        await fetchWithTimeout('/api/auth/brand/logout', {
          method: 'POST',
          credentials: 'include'
        }, 5000)
      }
      
      setUser(null)
      setUserType(null)
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // I když API selže, vyčistíme local data
      setUser(null)
      setUserType(null)
      setShowUserMenu(false)
      router.push('/')
    }
  }

  const getDashboardLink = () => {
    if (userType === 'creator') return '/creator/dashboard'
    if (userType === 'brand') return '/partner-company'
    return '/'
  }

  const getProfileLink = () => {
    if (userType === 'creator') return '/creator/profile'
    if (userType === 'brand') return '/partner-company/settings'
    return '/'
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    // Zobrazíme přihlašovací odkazy když není přihlášen
    return (
      <nav className="hidden lg:flex items-center space-x-8">
        <div className="relative group">
          <button className="text-gray-700 hover:text-black font-medium transition-colors">
            For Creators
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <Link href="/creators" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                How It Works
              </Link>
              <Link href="#creator-form" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Apply Now
              </Link>
              <Link href="/creator/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Log In
              </Link>
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <button className="text-gray-700 hover:text-black font-medium transition-colors">
            For Brands
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <Link href="/brands" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                How It Works
              </Link>
              <Link href="#brand-form" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Start Partnership
              </Link>
              <Link href="/brand/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Brand Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Zobrazíme uživatelské menu když je přihlášen
  return (
    <div className="flex items-center space-x-4">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-3 focus:outline-none"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
            <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showUserMenu && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  {userType === 'creator' ? '✨ Creator' : '🏢 Brand Partner'}
                </p>
              </div>
              
              <Link
                href={getDashboardLink()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                Dashboard
              </Link>
              
              {userType === 'creator' && (
                <>
                  <Link
                    href="/creator/dashboard/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Product Catalog
                  </Link>
                  <Link
                    href="/creator/dashboard/campaigns"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Campaigns
                  </Link>
                </>
              )}
              
              {userType === 'brand' && (
                <>
                  <Link
                    href="/partner-company/campaigns"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Campaigns
                  </Link>
                  <Link
                    href="/partner-company/promotions"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Promotions
                  </Link>
                  <Link
                    href="/partner-company/analytics"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}
              
              <Link
                href={getProfileLink()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                Profile Settings
              </Link>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 