import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function InfluencerDetail({ params }: PageProps) {
  const { id } = await params

  const influencer = await prisma.influencer.findUnique({
    where: { id },
          include: {
        socialNetworks: true,
              contentCategories: true,
              orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
        orderBy: {
          createdAt: 'desc'
        }
      },
      commissions: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      selectedProducts: {
        include: {
          product: true
        }
      },
      profile: true,
      discountCodes: true
    }
  })

  if (!influencer) {
    notFound()
  }

  // Calculate statistics
  const totalRevenue = influencer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalCommissions = influencer.commissions.reduce((sum, comm) => sum + comm.amount, 0)
  const paidCommissions = influencer.commissions
    .filter(comm => comm.status === 'paid')
    .reduce((sum, comm) => sum + comm.amount, 0)
  const pendingCommissions = influencer.commissions
    .filter(comm => comm.status === 'pending')
    .reduce((sum, comm) => sum + comm.amount, 0)

  // Get campaigns that include this influencer
  const campaigns = await prisma.campaign.findMany({
    where: {
      influencerIds: {
        contains: influencer.id
      }
    },
    include: {
      brand: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalCampaigns = campaigns.length

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const currentStatus = influencer.isActive && influencer.isApproved ? 'active' : 
                       influencer.onboardingStatus === 'pending' ? 'pending' : 'inactive'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/influencers" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Influencer Detail</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Influencer Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 flex-shrink-0">
                  {influencer.avatar ? (
                    <img className="h-16 w-16 rounded-full object-cover" src={influencer.avatar} alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {influencer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{influencer.name}</h1>
                  <p className="text-gray-600">{influencer.email}</p>
                  <p className="text-sm text-gray-500">@{influencer.slug}</p>
                </div>
              </div>
              
              {/* Basic Information */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{influencer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{influencer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate</label>
                  <p className="text-sm text-gray-900">{(influencer.commissionRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                  <p className="text-sm text-gray-900">
                    {new Date(influencer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    €{totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{influencer.order.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    €{totalCommissions.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Commission</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{influencer.selectedProducts.length}</div>
                  <div className="text-sm text-gray-600">Selected Products</div>
                </div>
              </div>
            </div>

                         {/* Active Campaigns */}
            {campaigns.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{activeCampaigns}</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{totalCampaigns}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {campaigns.filter(c => c.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recent Campaigns</h3>
                    <div className="space-y-2">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{campaign.name}</div>
                            <div className="text-xs text-gray-500">
                              {campaign.brand?.name} • {new Date(campaign.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

                         {/* Social Media Profiles */}
                          {influencer.socialNetworks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Profiles</h2>
                <div className="space-y-3">
                                      {influencer.socialNetworks.map((social) => (
                    <div key={social.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase">
                          {social.platform.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{social.platform}</p>
                        <p className="text-sm text-gray-600">@{social.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{social.followers.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">followers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {influencer.bio && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
                <p className="text-gray-700 leading-relaxed">{influencer.bio}</p>
              </div>
            )}

                         {/* Content Categories */}
                          {influencer.contentCategories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h2>
                <div className="flex flex-wrap gap-2">
                                      {influencer.contentCategories.map((category) => (
                    <span 
                      key={category.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {category.category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    currentStatus === 'active' ? 'text-green-600' :
                    currentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification:</span>
                  <span className="font-medium text-gray-900">{influencer.verificationStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Onboarding:</span>
                  <span className="font-medium text-gray-900">{influencer.onboardingStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount Codes:</span>
                  <span className="font-medium text-gray-900">{influencer.discountCodes.length}</span>
                </div>
              </div>
            </div>

            {/* Commission Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Details</h2>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-600">€{paidCommissions.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Paid</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">€{pendingCommissions.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">€{totalCommissions.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            </div>

                         {/* Recent Orders */}
            {influencer.order.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {influencer.order.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">#{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{order.customerName}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">€{order.totalAmount.toFixed(2)}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Influencer Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-gray-700">Influencer ID</label>
                  <p className="text-gray-600 font-mono text-xs">{influencer.id}</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Created</label>
                  <p className="text-gray-600">
                    {new Date(influencer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-600">
                    {new Date(influencer.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 