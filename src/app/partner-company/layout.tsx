'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BrandUser {
  brandId: string
  email: string
  brandName: string
}

const PartnerSidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<BrandUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Načíst informace o uživateli při načtení komponenty
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Zkusíme získat informace o uživateli z API
        const response = await fetch('/api/auth/brand/verify', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          // Není přihlášený, přesměruj na login
          router.push('/brand/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/brand/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])
  
  // Určit aktuální stránku podle URL
  const getCurrentPage = () => {
    if (pathname === '/partner-company') return 'dashboard'
    if (pathname.startsWith('/partner-company/campaigns')) return 'campaigns'
    if (pathname.startsWith('/partner-company/promotions')) return 'promotions'
    if (pathname.startsWith('/partner-company/analytics')) return 'analytics'
    if (pathname.startsWith('/partner-company/settings')) return 'settings'
    return 'dashboard'
  }

  // Funkce pro odhlášení
  const handleLogout = async () => {
    try {
      // Zavolat API pro odhlášení
      const response = await fetch('/api/auth/brand/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Přesměrovat na login stránku
        router.push('/brand/login')
      } else {
        console.error('Logout failed')
        // I když API selže, přesměrujeme uživatele (cookies může smazat i frontend)
        router.push('/brand/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // I při chybě přesměrujeme na login
      router.push('/brand/login')
    }
  }

  // Pokud se ještě načítá, zobraz loading
  if (isLoading) {
    return (
      <div className="w-64 bg-white h-screen shadow-lg border-r border-gray-100 fixed left-0 top-0 z-40">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }
  
  const currentPage = getCurrentPage()
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ), 
      href: '/partner-company' 
    },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ), 
      href: '/partner-company/campaigns' 
    },
    { 
      id: 'promotions', 
      label: 'Promotions', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ), 
      href: '/partner-company/promotions' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      href: '/partner-company/analytics' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      href: '/partner-company/settings' 
    },
  ]

  return (
    <div className="w-64 bg-white h-screen shadow-lg border-r border-gray-100 fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold text-blue-600 tracking-tight text-center">
            {user?.brandName?.toUpperCase() || 'PARTNER'} PORTAL
          </h1>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info with Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.brandName || 'Brand Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'Loading...'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerSidebar />
      
      {/* Main content area with proper margin for sidebar */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  )
} 