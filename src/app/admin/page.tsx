import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { InfluencerApplicationCard, BrandApplicationCard } from '@/components/AdminApplicationCard'
import ProductQuickView from '@/components/ProductQuickView'
import TabbedApplicationSection from '@/components/TabbedApplicationSection'

export default async function AdminDashboard() {
  const [influencerApplications, brandApplications, products, activeCampaigns, upcomingCampaigns, approvedInfluencers] = await Promise.all([
    prisma.influencer_applications.findMany({ orderBy: { createdAt: 'desc' } }),
          prisma.brand_applications.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.products.findMany({
      include: { brands: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    // Počet aktivních kampaní (probíhají právě teď)
    prisma.campaigns.count({
      where: {
        AND: [
          { startDate: { lte: new Date() } },
          { endDate: { gte: new Date() } },
          { status: 'active' }
        ]
      }
    }),
    // Počet nadcházejících kampaní (začínají v budoucnu)
    prisma.campaigns.count({
      where: {
        startDate: { gt: new Date() }
      }
    }),
    // Skutečný počet schválených influencerů
    prisma.influencer_applications.count({
      where: { status: 'approved' }
    })
  ]);
  
  const pendingInfluencers = influencerApplications.filter(app => app.status === 'pending').length;
  const pendingBrands = brandApplications.filter(app => app.status === 'pending').length;

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Platform management center</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">admin@goozy.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Pending Influencers" value={pendingInfluencers} color="yellow" />
          <StatCard title="Pending Brands" value={pendingBrands} color="yellow" />
          <StatCard title="Approved Influencers" value={approvedInfluencers} color="green" />
          <ClickableStatCard 
            title="Active Campaigns" 
            value={activeCampaigns} 
            color="green" 
            href="/admin/campaigns"
            description="Currently running campaigns"
          />
          <ClickableStatCard 
            title="Upcoming Campaigns" 
            value={upcomingCampaigns} 
            color="blue" 
            href="/admin/campaigns"
            description="Scheduled campaigns"
          />
        </div>

        {/* Applications Section */}
        <div id="applications" className="grid lg:grid-cols-2 gap-8 mb-8">
          <TabbedApplicationSection
            title="Influencer Applications"
            applications={influencerApplications}
            type="influencer"
          />

          <TabbedApplicationSection
            title="Brand Applications"
            applications={brandApplications}
            type="brand"
          />
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Latest Products</h2>
              <p className="text-gray-600 mt-1">Products available to influencers</p>
            </div>
            <Link 
              href="/admin/products" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All →
            </Link>
          </div>
          
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No products in catalog</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductQuickView 
                  key={product.id} 
                  product={{
                    ...product,
                    description: product.description || undefined
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ title, value, color }: { title: string, value: number, color: 'yellow' | 'green' | 'blue' }) => {
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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

const ClickableStatCard = ({ 
  title, 
  value, 
  color, 
  href, 
  description 
}: { 
  title: string, 
  value: number, 
  color: 'yellow' | 'green' | 'blue',
  href: string,
  description: string
}) => {
  const colors = {
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    green: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
  }
  
  const campaignIcons = {
    green: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    blue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    yellow: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <Link href={href} className="group">
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 ${colors[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
            {campaignIcons[color]}
          </div>
        </div>
        
        {/* Hover arrow indicator */}
        <div className="mt-3 flex items-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="mr-1">View campaigns</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
} 