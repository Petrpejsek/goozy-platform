import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Mapování kódů zemí na názvy a vlajky
const countryData: Record<string, { name: string; flag: string }> = {
  'CZ': { name: 'Czech Republic', flag: '🇨🇿' },
  'SK': { name: 'Slovakia', flag: '🇸🇰' },
  'PL': { name: 'Poland', flag: '🇵🇱' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'AT': { name: 'Austria', flag: '🇦🇹' },
  'HU': { name: 'Hungary', flag: '🇭🇺' },
  'SI': { name: 'Slovenia', flag: '🇸🇮' },
  'HR': { name: 'Croatia', flag: '🇭🇷' },
  'US': { name: 'United States', flag: '🇺🇸' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'NL': { name: 'Netherlands', flag: '🇳🇱' },
  'BE': { name: 'Belgium', flag: '🇧🇪' },
  'CH': { name: 'Switzerland', flag: '🇨🇭' },
}

export default async function InfluencersPage() {
  // Načtu všechny influencery s jejich sociálními sítěmi a statistikami
  const influencers = await prisma.influencer.findMany({
          include: {
        socialNetworks: true,
              contentCategories: true,
      orders: {
        select: {
          totalAmount: true,
          status: true
        }
      },
      commissions: {
        select: {
          amount: true,
          status: true
        }
      },
      profile: true,
      _count: {
        select: {
          orders: true,
          commissions: true,
          selectedProducts: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Získám statistiky podle zemí z kampaní
  const campaigns = await prisma.campaign.findMany({
    select: {
      targetCountries: true,
      influencerIds: true,
      status: true
    }
  })

  // Spočítám statistiky podle zemí
  const countryStats: Record<string, { active: number; pending: number; total: number }> = {}
  
  // Projdu kampaně a spočítám influencery podle zemí
  campaigns.forEach(campaign => {
    try {
      const countries = JSON.parse(campaign.targetCountries || '[]')
      const influencerIds = campaign.influencerIds ? campaign.influencerIds.split(',') : []
      
      countries.forEach((country: string) => {
        if (!countryStats[country]) {
          countryStats[country] = { active: 0, pending: 0, total: 0 }
        }
        
        if (campaign.status === 'active') {
          countryStats[country].active += influencerIds.length
        } else if (campaign.status === 'draft') {
          countryStats[country].pending += influencerIds.length
        }
        countryStats[country].total += influencerIds.length
      })
    } catch (error) {
      console.error('Error parsing campaign data:', error)
    }
  })

  // Celkové statistiky
  const totalInfluencers = influencers.length
  const activeInfluencers = influencers.filter(inf => inf.isActive && inf.isApproved).length
  const pendingInfluencers = influencers.filter(inf => inf.onboardingStatus === 'pending').length
  const totalRevenue = influencers.reduce((sum, inf) => 
    sum + inf.order.reduce((orderSum, order) => orderSum + order.totalAmount, 0), 0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Influencers</h2>
          <p className="text-gray-600 mt-1">Manage and overview all influencers</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Influencers" value={totalInfluencers} color="blue" />
          <StatCard title="Active Influencers" value={activeInfluencers} color="green" />
          <StatCard title="Pending Approval" value={pendingInfluencers} color="yellow" />
          <StatCard title="Total Revenue" value={`€${totalRevenue.toFixed(0)}`} color="green" />
        </div>

        {/* Country Statistics */}
        {Object.keys(countryStats).length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Countries Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(countryStats).map(([countryCode, stats]) => (
                <div key={countryCode} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{countryData[countryCode]?.flag || '🌍'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {countryData[countryCode]?.name || countryCode}
                      </h3>
                      <p className="text-xs text-gray-500">{countryCode}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.active}</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Influencers List */}
        {influencers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">All Influencers</h2>
              <p className="text-gray-600 mt-1">Click on any influencer to view detailed information</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Influencer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Social Media
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {influencers.map((influencer) => {
                    const totalRevenue = influencer.order.reduce((sum, order) => sum + order.totalAmount, 0)
                    const totalCommissions = influencer.commissions.reduce((sum, comm) => sum + comm.amount, 0)
                    
                    return (
                      <tr key={influencer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {influencer.avatar ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={influencer.avatar} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {influencer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{influencer.name}</div>
                              <div className="text-sm text-gray-500">{influencer.email}</div>
                              <div className="text-xs text-gray-400">
                                Joined {new Date(influencer.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {influencer.socialNetworks.length > 0 && (
                            <div className="space-y-1">
                                                              {influencer.socialNetworks.map((social) => (
                                <div key={social.id} className="flex items-center text-sm">
                                  <span className="capitalize font-medium text-gray-700 w-16">
                                    {social.platform}:
                                  </span>
                                  <span className="text-gray-600">@{social.username}</span>
                                  <span className="ml-2 text-xs text-gray-400">
                                    ({social.followers.toLocaleString()})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              influencer.isActive && influencer.isApproved
                                ? 'bg-green-100 text-green-800'
                                : influencer.onboardingStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {influencer.isActive && influencer.isApproved ? 'Active' : 
                               influencer.onboardingStatus === 'pending' ? 'Pending' : 'Inactive'}
                            </span>
                            <div className="text-xs text-gray-500">
                              Commission: {(influencer.commissionRate * 100).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>€{totalRevenue.toFixed(2)} revenue</div>
                            <div className="text-xs text-gray-500">
                              €{totalCommissions.toFixed(2)} commission
                            </div>
                            <div className="text-xs text-gray-400">
                              {influencer._count.orders} orders • {influencer._count.selectedProducts} products
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {influencer.contentCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {influencer.contentCategories.slice(0, 2).map((category) => (
                                <span key={category.id} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {category.category}
                                </span>
                              ))}
                              {influencer.contentCategories.length > 2 && (
                                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  +{influencer.contentCategories.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/influencers/${influencer.id}`}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: 'yellow' | 'green' | 'blue' }) => {
  const colors = {
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
  }
  
  const icons = {
    yellow: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    green: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    blue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
          {icons[color]}
        </div>
      </div>
    </div>
  )
} 