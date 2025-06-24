import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PartnersPage() {
  // Získání schválených brandů (partners)
  const partners = await prisma.brand.findMany({
    where: { 
      isActive: true,
      isApproved: true 
    },
    include: {
      _count: {
        select: {
          products: true,
          campaigns: true
        }
      },
      products: {
        select: {
          price: true,
          currency: true
        },
        take: 1 // Pro rychlé načtení
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Statistiky
  const [totalRevenue, totalProducts, totalOrders] = await Promise.all([
    // Celkový obrat (zatím mock - až budeme mít objednávky)
    Promise.resolve(0),
    
    // Celkový počet produktů
    prisma.product.count({
      where: {
        brand: {
          isActive: true,
          isApproved: true
        }
      }
    }),
    
    // Celkový počet objednávek (zatím mock)
    Promise.resolve(0)
  ])

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Partners Dashboard</h2>
            <p className="text-sm text-gray-500">Manage business partners and commission rates</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + Add Partner
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Partners" 
            value={partners.length} 
            color="blue"
            icon="partners"
          />
          <StatCard 
            title="Total Products" 
            value={totalProducts} 
            color="green"
            icon="products"
          />
          <StatCard 
            title="Total Revenue" 
            value={`€${totalRevenue.toFixed(2)}`} 
            color="yellow"
            icon="revenue"
          />
          <StatCard 
            title="Total Orders" 
            value={totalOrders} 
            color="purple"
            icon="orders"
          />
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Partners Overview</h2>
              <p className="text-gray-600 mt-1">All active business partners and their performance</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                Export
              </button>
              <Link 
                href="/admin/partners/commissions"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Commissions
              </Link>
            </div>
          </div>
          
          {partners.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No active partners found</p>
              <p className="text-gray-400 text-sm mt-1">Partners will appear here once brands are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Products</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Revenue</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Commission</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            {partner.logo ? (
                              <img src={partner.logo} alt={partner.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="text-blue-600 font-medium text-sm">
                                {partner.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{partner.name}</div>
                            <div className="text-sm text-gray-500">{partner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 font-medium">{partner._count.products}</div>
                        <div className="text-sm text-gray-500">active products</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 font-medium">€0.00</div>
                        <div className="text-sm text-gray-500">this month</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 font-medium">15%</div>
                        <div className="text-sm text-gray-500">default rate</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/partners/${partner.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/admin/products?brand=${partner.id}`}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Products
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  color, 
  icon 
}: { 
  title: string, 
  value: number | string, 
  color: 'blue' | 'green' | 'yellow' | 'purple',
  icon: 'partners' | 'products' | 'revenue' | 'orders'
}) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  }
  
  const icons = {
    partners: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    products: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    revenue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    orders: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  )
} 