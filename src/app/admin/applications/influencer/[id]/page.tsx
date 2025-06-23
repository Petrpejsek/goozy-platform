import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InfluencerApplicationActions from './InfluencerApplicationActions'

interface PageProps {
  params: {
    id: string
  }
}

export default async function InfluencerApplicationDetail({ params }: PageProps) {
  const { id } = await params
  
  const application = await prisma.influencerApplication.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      instagram: true,
      tiktok: true,
      youtube: true,
      facebook: true,
      categories: true,
      bio: true,
      collaborationTypes: true,
      status: true,
      notes: true,
      // Duplicate detection fields - explicitly included
      mergeStatus: true,
      mergeData: true,
      possibleDuplicateIds: true,
      createdAt: true,
      updatedAt: true
    }
  })

  // Initialize social metrics variable
  let socialMetrics = {
    totalFollowers: null as number | null,
    engagementRate: null as number | null,
    avgLikes: null as number | null,
    avgComments: null as number | null,
    scrapedData: null as any
  }

  if (!application) {
    notFound()
  }

  // Parse JSON fields
  const categories = JSON.parse(application.categories || '[]')
  const collaborationTypes = JSON.parse(application.collaborationTypes || '[]')
  const possibleDuplicateIds = JSON.parse(application.possibleDuplicateIds || '[]')
  
  // Safely parse mergeData with error handling
  let mergeData = null
  try {
    if (application.mergeData) {
      mergeData = JSON.parse(application.mergeData)
      console.log('🔍 Parsed mergeData successfully:', mergeData)
    }
  } catch (error) {
    console.error('❌ Error parsing mergeData:', error)
    console.log('Raw mergeData:', application.mergeData)
  }

  // Try to find existing Influencer record for this application
  let linkedInfluencer = null
  let campaignStats = { activeCampaigns: 0, totalCampaigns: 0, campaigns: [] }
  let revenueStats = { totalRevenue: 0, totalOrders: 0, orders: [] }
  let commissionStats = { totalCommission: 0, paidCommission: 0, pendingCommission: 0, commissions: [] }

  try {
    // Look for influencer by email or Instagram username
    const searchCriteria = []
    if (application?.email) {
      searchCriteria.push({ email: application.email })
    }
    if (application?.instagram) {
      // Remove @ symbol if present
      const instagramUsername = application.instagram.replace('@', '')
      searchCriteria.push({ 
        socialNetworks: {
          some: {
            platform: 'instagram',
            username: instagramUsername
          }
        }
      })
    }

    if (searchCriteria.length > 0) {
      linkedInfluencer = await prisma.influencer.findFirst({
        where: {
          OR: searchCriteria
        },
        include: {
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
          socialNetworks: true
        }
      })

      if (linkedInfluencer) {
        console.log('📊 Found linked influencer:', linkedInfluencer.id)
        
        // Calculate revenue stats
        const orders = linkedInfluencer.orders || []
        revenueStats.totalOrders = orders.length
        revenueStats.totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        revenueStats.orders = orders.slice(0, 5) // Show last 5 orders

        // Calculate commission stats  
        const commissions = linkedInfluencer.commissions || []
        commissionStats.totalCommission = commissions.reduce((sum, comm) => sum + (comm.amount || 0), 0)
        commissionStats.paidCommission = commissions
          .filter(comm => comm.status === 'paid')
          .reduce((sum, comm) => sum + (comm.amount || 0), 0)
        commissionStats.pendingCommission = commissions
          .filter(comm => comm.status === 'pending')
          .reduce((sum, comm) => sum + (comm.amount || 0), 0)
        commissionStats.commissions = commissions.slice(0, 5) // Show last 5 commissions

        // Get campaigns (we need to find campaigns that include this influencer)
        const campaigns = await prisma.campaign.findMany({
          where: {
            influencerIds: {
              contains: linkedInfluencer.id
            }
          },
          include: {
            brand: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        campaignStats.totalCampaigns = campaigns.length
        campaignStats.activeCampaigns = campaigns.filter(c => c.status === 'active').length
        campaignStats.campaigns = campaigns.slice(0, 5) // Show last 5 campaigns
      }
    }
  } catch (error) {
    console.error('Error finding linked influencer:', error)
  }

  // Try to get social media metrics from scraped data
  if (mergeData?.duplicates) {
    for (const duplicate of mergeData.duplicates) {
      if (duplicate.type === 'database' && duplicate.followers > 0) {
        // Try to get detailed data from InfluencerDatabase
        try {
          const dbProfile = await prisma.influencerDatabase.findUnique({
            where: { id: duplicate.id },
            select: {
              totalFollowers: true,
              engagementRate: true,
              avgLikes: true,
              avgComments: true,
              instagramData: true
            }
          })
          
          if (dbProfile) {
            socialMetrics = {
              totalFollowers: dbProfile.totalFollowers,
              engagementRate: dbProfile.engagementRate,
              avgLikes: dbProfile.avgLikes,
              avgComments: dbProfile.avgComments,
              scrapedData: dbProfile.instagramData ? JSON.parse(dbProfile.instagramData) : null
            }
            break // Use first available data
          }
        } catch (error) {
          console.error('Error loading social metrics:', error)
        }
      }
    }
  }

  // Alternatively, try to find by Instagram username in our database
  if (!socialMetrics.totalFollowers && application?.instagram) {
    try {
      const instagramUsername = application.instagram.replace(/[@\/]/g, '').toLowerCase()
      
      // Check if this profile exists in our database
      const existingProfile = await prisma.influencerDatabase.findFirst({
        where: {
          instagramUsername: instagramUsername
        },
        select: {
          totalFollowers: true,
          engagementRate: true,
          avgLikes: true,
          avgComments: true,
          instagramData: true
        }
      })
      
      if (existingProfile) {
        socialMetrics = {
          totalFollowers: existingProfile.totalFollowers,
          engagementRate: existingProfile.engagementRate,
          avgLikes: existingProfile.avgLikes,
          avgComments: existingProfile.avgComments,
          scrapedData: existingProfile.instagramData ? JSON.parse(existingProfile.instagramData) : null
        }
      }
    } catch (error) {
      console.error('Error checking existing profile:', error)
    }
  }

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Influencer Application Detail</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{application.name}</h1>
              
              {/* Basic Information */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{application.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{application.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applied</label>
                  <p className="text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Analytics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Followers */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {socialMetrics.totalFollowers ? socialMetrics.totalFollowers.toLocaleString() : '---'}
                  </div>
                  <div className="text-sm text-gray-600">Total Followers</div>
                  {!socialMetrics.totalFollowers && (
                    <div className="text-xs text-gray-400 mt-1">Not available</div>
                  )}
                </div>
                
                {/* Engagement Rate */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {socialMetrics.engagementRate ? `${socialMetrics.engagementRate.toFixed(1)}%` : '---'}
                  </div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                  {!socialMetrics.engagementRate && (
                    <div className="text-xs text-gray-400 mt-1">Not available</div>
                  )}
                </div>
                
                {/* Average Likes */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {socialMetrics.avgLikes ? socialMetrics.avgLikes.toLocaleString() : '---'}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Likes</div>
                  {!socialMetrics.avgLikes && (
                    <div className="text-xs text-gray-400 mt-1">Not available</div>
                  )}
                </div>
                
                {/* Average Comments */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {socialMetrics.avgComments ? socialMetrics.avgComments.toLocaleString() : '---'}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Comments</div>
                  {!socialMetrics.avgComments && (
                    <div className="text-xs text-gray-400 mt-1">Not available</div>
                  )}
                </div>
              </div>
              
              {/* Data Source Information */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                {socialMetrics.scrapedData ? (
                  <div>
                    <p className="text-xs text-green-600 mb-2 font-medium">✅ Data from scraped profile:</p>
                    <div className="text-sm space-y-1">
                      {socialMetrics.scrapedData.posts && (
                        <div><span className="font-medium">Posts:</span> {socialMetrics.scrapedData.posts.toLocaleString()}</div>
                      )}
                      {socialMetrics.scrapedData.following && (
                        <div><span className="font-medium">Following:</span> {socialMetrics.scrapedData.following.toLocaleString()}</div>
                      )}
                      {socialMetrics.scrapedData.verified && (
                        <div><span className="font-medium">Verified:</span> ✅ Yes</div>
                      )}
                      {socialMetrics.scrapedData.isPrivate && (
                        <div><span className="font-medium">Private Account:</span> 🔒 Yes</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-yellow-600 mb-2 font-medium">⚠️ No scraped data available</p>
                    <p className="text-sm text-gray-600">
                      Social media metrics are automatically loaded from our database when available. 
                      {application?.instagram && (
                        <span> Instagram profile: <span className="font-mono text-blue-600">@{application.instagram}</span></span>
                      )}
                    </p>
                    <div className="mt-2">
                      <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                        Request Data Scraping
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* Social Media Profiles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Profiles</h2>
              <div className="space-y-3">
                {application.instagram && (
                  <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551-.684-.94-.684-2.126 0-3.066.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.126 0 3.066-.684.94-1.835 1.551-3.132 1.551z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Instagram</p>
                      <a 
                        href={application.instagram.startsWith('http') ? application.instagram : `https://instagram.com/${application.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {application.instagram}
                      </a>
                    </div>
                  </div>
                )}
                
                {application.tiktok && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">TikTok</p>
                      <a 
                        href={application.tiktok.startsWith('http') ? application.tiktok : `https://tiktok.com/@${application.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {application.tiktok}
                      </a>
                    </div>
                  </div>
                )}
                
                {application.youtube && (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">YouTube</p>
                      <a 
                        href={application.youtube.startsWith('http') ? application.youtube : `https://youtube.com/c/${application.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {application.youtube}
                      </a>
                    </div>
                  </div>
                )}
                
                {application.facebook && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Facebook</p>
                      <a 
                        href={application.facebook.startsWith('http') ? application.facebook : `https://facebook.com/${application.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {application.facebook}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {application.bio && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
                <p className="text-gray-700 leading-relaxed">{application.bio}</p>
              </div>
            )}

            {/* Categories & Collaboration Types */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content & Collaboration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                {collaborationTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Types</label>
                    <div className="flex flex-wrap gap-2">
                      {collaborationTypes.map((type: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h2>
              
              {linkedInfluencer ? (
                campaignStats.totalCampaigns > 0 ? (
                  <div className="space-y-4">
                    {/* Campaign Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">{campaignStats.activeCampaigns}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">{campaignStats.totalCampaigns}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {campaignStats.campaigns.filter(c => c.status === 'completed').length}
                        </div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                    </div>

                    {/* Recent Campaigns */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Campaigns</h3>
                      <div className="space-y-2">
                        {campaignStats.campaigns.map((campaign) => (
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
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">No campaigns found</p>
                    <p className="text-xs text-gray-500 mt-1">This influencer is not participating in any campaigns yet</p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">⚠️ Cannot load campaign data</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    No linked influencer account found. Campaign data will be available after the application is approved and influencer account is created.
                  </p>
                </div>
              )}
            </div>

            {/* Overall Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Revenue</h2>
              
              {linkedInfluencer ? (
                revenueStats.totalOrders > 0 ? (
                  <div className="space-y-4">
                    {/* Revenue Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          €{revenueStats.totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{revenueStats.totalOrders}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Orders</h3>
                      <div className="space-y-2">
                        {revenueStats.orders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">#{order.orderNumber}</div>
                              <div className="text-xs text-gray-500">
                                {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {order.items?.length || 0} item(s)
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">€{order.totalAmount.toFixed(2)}</div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">No orders found</p>
                    <p className="text-xs text-gray-500 mt-1">This influencer hasn't generated any sales yet</p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">⚠️ Cannot load revenue data</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    No linked influencer account found. Revenue data will be available after the application is approved and influencer account is created.
                  </p>
                </div>
              )}
            </div>

            {/* Overall Commission */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Commission</h2>
              
              {linkedInfluencer ? (
                commissionStats.totalCommission > 0 ? (
                  <div className="space-y-4">
                    {/* Commission Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">
                          €{commissionStats.paidCommission.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Paid</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          €{commissionStats.pendingCommission.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                          €{commissionStats.totalCommission.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                    </div>

                    {/* Recent Commissions */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Commissions</h3>
                      <div className="space-y-2">
                        {commissionStats.commissions.map((commission) => (
                          <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-sm">Commission #{commission.id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">
                                Rate: {(commission.rate * 100).toFixed(1)}% • {new Date(commission.createdAt).toLocaleDateString()}
                              </div>
                              {commission.paidAt && (
                                <div className="text-xs text-green-600">
                                  Paid: {new Date(commission.paidAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">€{commission.amount.toFixed(2)}</div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {commission.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">No commissions found</p>
                    <p className="text-xs text-gray-500 mt-1">This influencer hasn't earned any commissions yet</p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">⚠️ Cannot load commission data</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    No linked influencer account found. Commission data will be available after the application is approved and influencer account is created.
                  </p>
                </div>
              )}
            </div>

            {/* Duplicate Detection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Duplicate Detection</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detection Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.mergeStatus === 'detected' ? 'bg-yellow-100 text-yellow-800' :
                    application.mergeStatus === 'merged' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.mergeStatus === 'detected' ? 'Duplicates Detected' :
                     application.mergeStatus === 'merged' ? 'Merged' : 
                     application.mergeStatus === 'none' ? 'No Duplicates Found' :
                     application.mergeStatus}
                  </span>
                </div>
                
                {mergeData && mergeData.duplicates && mergeData.duplicates.length > 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Found {mergeData.duplicates.length} Potential Duplicate(s)
                    </label>
                    <div className="space-y-3">
                      {mergeData.duplicates.map((duplicate: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-yellow-400">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{duplicate.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  duplicate.type === 'database' ? 'bg-blue-100 text-blue-800' :
                                  duplicate.type === 'prospect' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {duplicate.type === 'database' ? 'Scraped Profile' :
                                   duplicate.type === 'prospect' ? 'Prospect' :
                                   'Application'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                {duplicate.username && (
                                  <div>
                                    <span className="font-medium">{duplicate.platform}:</span> @{duplicate.username}
                                  </div>
                                )}
                                {duplicate.email && (
                                  <div>
                                    <span className="font-medium">Email:</span> {duplicate.email}
                                  </div>
                                )}
                                {duplicate.followers && (
                                  <div>
                                    <span className="font-medium">Followers:</span> {duplicate.followers.toLocaleString()}
                                  </div>
                                )}
                                {duplicate.country && (
                                  <div>
                                    <span className="font-medium">Country:</span> {duplicate.country}
                                  </div>
                                )}
                                {duplicate.status && (
                                  <div>
                                    <span className="font-medium">Status:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      duplicate.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      duplicate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {duplicate.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                                View Details
                              </button>
                              <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                                Merge
                              </button>
                              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                                Keep Separate
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {mergeData.detectedAt && (
                      <div className="mt-3 text-xs text-gray-500">
                        Detected on: {new Date(mergeData.detectedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {application.mergeStatus === 'none' ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          ✅ No duplicate profiles detected for this application.
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Automatic duplicate detection checked against existing profiles, prospects, and applications.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          ⏳ Duplicate detection in progress or no results available yet.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          The system automatically checks for duplicates when applications are submitted.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <InfluencerApplicationActions 
                applicationId={application.id}
                currentStatus={application.status}
              />
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              {(() => {
                let notesHistory = []
                try {
                  if (application.notes) {
                    const parsed = JSON.parse(application.notes)
                    notesHistory = Array.isArray(parsed) ? parsed : [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
                  }
                } catch (error) {
                  // If notes is not JSON, treat it as legacy single note
                  if (application.notes) {
                    notesHistory = [{ text: application.notes, timestamp: new Date(application.updatedAt).toISOString(), admin: 'admin' }]
                  }
                }

                if (notesHistory.length === 0) {
                  return <p className="text-sm text-gray-500 italic">No notes added yet</p>
                }

                return (
                  <div className="space-y-3">
                    {/* Latest note always visible */}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-sm text-gray-800 mb-2">{notesHistory[0].text}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {notesHistory[0].admin}</span>
                        <span>{new Date(notesHistory[0].timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>

                    {/* Older notes - expandable */}
                    {notesHistory.length > 1 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium list-none">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Show {notesHistory.length - 1} older note{notesHistory.length > 2 ? 's' : ''}
                          </div>
                        </summary>
                        <div className="mt-3 space-y-2 pl-6">
                          {notesHistory.slice(1).map((note, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 p-3 rounded-md">
                              <p className="text-sm text-gray-700 mb-2">{note.text}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>By {note.admin}</span>
                                <span>{new Date(note.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Application Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-gray-700">Application ID</label>
                  <p className="text-gray-600 font-mono text-xs">{application.id}</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Created</label>
                  <p className="text-gray-600">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
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
                    {new Date(application.updatedAt).toLocaleDateString('en-US', {
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