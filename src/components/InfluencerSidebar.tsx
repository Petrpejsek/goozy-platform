'use client'

import Link from 'next/link'

interface InfluencerSidebarProps {
  currentPage?: string
}

const InfluencerSidebar = ({ currentPage = 'dashboard' }: InfluencerSidebarProps) => {
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
      href: '/influencer/dashboard' 
    },
    { 
      id: 'products', 
      label: 'Product Catalog', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ), 
      href: '/influencer/dashboard/products' 
    },
    { 
      id: 'campaigns', 
      label: 'My Campaigns', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ), 
      href: '/influencer/dashboard/campaigns'
    },
    { 
      id: 'earnings', 
      label: 'Earnings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      href: '/influencer/dashboard/earnings'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      href: '/influencer/dashboard/analytics'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      href: '/influencer/profile'
    },
  ]

  return (
    <div className="w-64 bg-white h-screen shadow-lg border-r border-gray-100 fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-black tracking-tight">GOOZY</h1>
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">CREATOR</span>
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
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default InfluencerSidebar 