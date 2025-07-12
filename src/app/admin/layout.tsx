'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AdminSidebar = () => {
  const pathname = usePathname()
  
  // Určit aktuální stránku podle URL
  const getCurrentPage = () => {
    if (pathname === '/admin') return 'dashboard'
    if (pathname.startsWith('/admin/applications')) return 'applications'
    if (pathname.startsWith('/admin/influencers')) return 'influencers'
    if (pathname.startsWith('/admin/database')) return 'database'
    if (pathname.startsWith('/admin/scraping')) return 'scraping'
    if (pathname.startsWith('/admin/bing-search')) return 'bing-search'
    if (pathname.startsWith('/admin/instagram-scraping')) return 'instagram-scraping'
    if (pathname.startsWith('/admin/products')) return 'products'
    if (pathname.startsWith('/admin/partners')) return 'partners'
    if (pathname.startsWith('/admin/campaigns')) return 'campaigns'
    if (pathname.startsWith('/admin/integrations')) return 'integrations'
    if (pathname.startsWith('/admin/suppliers')) return 'suppliers'

    return 'dashboard'
  }
  
  const currentPage = getCurrentPage()
  const menuItems = [
    { href: '/admin', label: 'Přehled', icon: '📊' },
    { href: '/admin/applications', label: 'Žádosti', icon: '📝' },
          { href: '/admin/creators', label: 'Creatory', icon: '👥' },
    { href: '/admin/products', label: 'Produkty', icon: '📦' },
    { href: '/admin/campaigns', label: 'Kampaně', icon: '🎯' },
    { href: '/admin/partners', label: 'Partneři', icon: '🤝' },
    { href: '/admin/suppliers', label: 'Dodavatelé', icon: '🚚' },
    { href: '/admin/integrations', label: 'Integrace', icon: '🔗' },
  ]

  return (
    <div className="w-64 bg-white h-screen shadow-lg border-r border-gray-100 fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-black tracking-tight">GOOZY</h1>
          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">ADMIN</span>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.href.substring(1) // Assuming href is like '/admin/something'
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main content area with proper margin for sidebar */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  )
} 