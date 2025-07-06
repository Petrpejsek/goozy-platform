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

export default function AuthHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'influencer' | 'brand' | null>(null)
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
    
    // Check auth status when component mounts or updates
    const interval = setInterval(checkAuthStatus, 30000) // Check every 30 seconds
    
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
      // Nejdříve zkusíme najít token pro influencera
      const influencerToken = localStorage.getItem('influencer_token') || sessionStorage.getItem('influencer_token')
      
      if (influencerToken) {
        // Zkusíme ověřit influencer token
        const response = await fetch('/api/influencer/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${influencerToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const influencer = data.influencer || data
          const newUser = {
            id: influencer.id || 'unknown-id',
            name: influencer.name || 'Unknown User',
            email: influencer.email || 'No email',
            avatar: influencer.avatar
          }
          setUser(newUser)
          setUserType('influencer')
          setIsLoading(false)
          return
        } else {
          // Token není platný, odstraníme ho
          localStorage.removeItem('influencer_token')
          localStorage.removeItem('influencer_user')
          sessionStorage.removeItem('influencer_token')
          sessionStorage.removeItem('influencer_user')
        }
      }

      // Zkusíme brand auth (pomocí cookies)
      const brandResponse = await fetch('/api/auth/brand/verify', {
        method: 'GET',
        credentials: 'include'
      })

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
      if (userType === 'influencer') {
        // Pro influencery jen odebereme tokeny z localStorage
        localStorage.removeItem('influencer_token')
        localStorage.removeItem('influencer_user')
        sessionStorage.removeItem('influencer_token')
        sessionStorage.removeItem('influencer_user')
      } else if (userType === 'brand') {
        // Pro brandy zavoláme logout API
        await fetch('/api/auth/brand/logout', {
          method: 'POST',
          credentials: 'include'
        })
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
    if (userType === 'influencer') return '/influencer/dashboard'
    if (userType === 'brand') return '/partner-company'
    return '/'
  }

  const getProfileLink = () => {
    if (userType === 'influencer') return '/influencer/profile'
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
            For Influencers
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <Link href="#for-influencers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                How It Works
              </Link>
              <Link href="#influencer-form" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Apply Now
              </Link>
              <Link href="/influencer/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
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
              <Link href="#for-brands" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Partnership Info
              </Link>
              <Link href="#brand-form" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                Get Started
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
                  {userType === 'influencer' ? '✨ Influencer' : '🏢 Brand Partner'}
                </p>
              </div>
              
              <Link
                href={getDashboardLink()}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                Dashboard
              </Link>
              
              {userType === 'influencer' && (
                <>
                  <Link
                    href="/influencer/dashboard/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Product Catalog
                  </Link>
                  <Link
                    href="/influencer/dashboard/campaigns"
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