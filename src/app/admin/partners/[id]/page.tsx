import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function PartnerDetailPage({ params }: Props) {
  const { id } = await params

  // Získání dat partnera
  const partner = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
          campaigns: true
        }
      },
      products: {
        include: {
          _count: {
            select: {
              influencerProducts: true,
              orderItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!partner) {
    notFound()
  }

  // Statistiky partnera
  const totalProductValue = partner.product.reduce((sum, product) => sum + product.price, 0)
  const avgProductPrice = partner.product.length > 0 ? totalProductValue / partner.product.length : 0

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-64 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div className="flex items-center">
            <Link 
              href="/admin/partners" 
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              ← Back to Partners
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{partner.name}</h2>
              <p className="text-sm text-gray-500">Partner Details & Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href={`/admin/products?brand=${partner.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Partner Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-bold text-lg">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{partner.name}</h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📧 {partner.email}</p>
                  {partner.website && (
                    <p>🌐 <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{partner.website}</a></p>
                  )}
                  {partner.phone && <p>📞 {partner.phone}</p>}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active Partner
                </span>
              </div>
              <p className="text-sm text-gray-500">Partner since {new Date(partner.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {partner.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{partner.description}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Products" value={partner._count.products} color="blue" />
          <StatCard title="Campaigns" value={partner._count.campaigns} color="green" />
          <StatCard title="Avg Price" value={`€${avgProductPrice.toFixed(2)}`} color="yellow" />
          <StatCard title="Commission" value="15%" color="purple" />
        </div>

        {/* Commission Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Commission Settings</h2>
              <p className="text-gray-600 mt-1">Manage commission rates for this partner</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Edit Rates
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Global Rate</h3>
              <p className="text-2xl font-bold text-gray-900">15%</p>
              <p className="text-sm text-gray-500">Default for all products</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Category Overrides</h3>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Custom category rates</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Product Overrides</h3>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Custom product rates</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Products ({partner.product.length})</h2>
              <p className="text-gray-600 mt-1">All products from this partner</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                Export
              </button>
              <Link
                href={`/admin/products?brand=${partner.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage All
              </Link>
            </div>
          </div>
          
          {partner.product.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">This partner hasn't added any products yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Stock</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Influencers</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Commission</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partner.product.slice(0, 10).map((product) => {
                    const images = product.images ? JSON.parse(product.images) : []
                    return (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                              {images.length > 0 ? (
                                <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">€{product.price.toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{product.stockQuantity}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{product._count.influencerProducts}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-green-600">15%</div>
                          <div className="text-sm text-gray-500">€{(product.price * 0.15).toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isAvailable ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {partner.product.length > 10 && (
                <div className="mt-4 text-center">
                  <Link
                    href={`/admin/products?brand=${partner.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {partner.product.length} products →
                  </Link>
                </div>
              )}
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
  color 
}: { 
  title: string, 
  value: number | string, 
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
} 