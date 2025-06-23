import { prisma } from '@/lib/prisma'
import TabbedApplicationSection from '@/components/TabbedApplicationSection'

export default async function ApplicationsPage() {
  const [influencerApplications, brandApplications] = await Promise.all([
    prisma.influencerApplication.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.brandApplication.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  
  const pendingInfluencers = influencerApplications.filter(app => app.status === 'pending').length;
  const pendingBrands = brandApplications.filter(app => app.status === 'pending').length;

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 h-16 fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center justify-between h-full px-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
            <p className="text-sm text-gray-500">Manage influencer and brand applications</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending: {pendingInfluencers + pendingBrands}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Approved: {influencerApplications.filter(app => app.status === 'approved').length + brandApplications.filter(app => app.status === 'approved').length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-24 p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Pending Influencers" value={pendingInfluencers} color="yellow" />
          <StatCard title="Pending Brands" value={pendingBrands} color="yellow" />
          <StatCard title="Approved Influencers" value={influencerApplications.filter(app => app.status === 'approved').length} color="green" />
          <StatCard title="Approved Brands" value={brandApplications.filter(app => app.status === 'approved').length} color="green" />
        </div>

        {/* Applications Section */}
        <div className="grid lg:grid-cols-2 gap-8">
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