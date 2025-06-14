import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { InfluencerApplicationCard, BrandApplicationCard } from '@/components/AdminApplicationCard'
import ProductQuickView from '@/components/ProductQuickView'

export default async function AdminDashboard() {
  const [influencerApplications, brandApplications, products, approvedInfluencers, approvedBrands] = await Promise.all([
    prisma.influencer_applications.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.brand_applications.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({
      include: { brand: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.influencer.count(),
    prisma.brand.count(),
  ]);
  
  const pendingInfluencers = influencerApplications.filter(app => app.status === 'PENDING').length;
  const pendingBrands = brandApplications.filter(app => app.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-2xl font-bold text-black">GOOZY ADMIN</h1>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2">
              Zpět na web
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <StatCard title="Čekající influenceři" value={pendingInfluencers} color="yellow" />
          <StatCard title="Čekající značky" value={pendingBrands} color="yellow" />
          <StatCard title="Schválení influenceři" value={approvedInfluencers} color="green" />
          <StatCard title="Aktivní značky" value={approvedBrands} color="green" />
          <StatCard title="Produktů v katalogu" value={products.length} color="blue" />
        </div>
      
        <div className="grid lg:grid-cols-2 gap-8">
          <ApplicationSection
            title="Přihlášky influencerů"
            count={influencerApplications.length}
            description="Nové přihlášky čekající na schválení"
          >
            {influencerApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Zatím žádné přihlášky</p>
            ) : (
              influencerApplications.map(app => <InfluencerApplicationCard key={app.id} application={app} />)
            )}
          </ApplicationSection>

          <ApplicationSection
            title="Poptávky značek"
            count={brandApplications.length}
            description="Nové poptávky na spolupráci"
          >
            {brandApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Zatím žádné poptávky</p>
            ) : (
              brandApplications.map(app => <BrandApplicationCard key={app.id} application={app} />)
            )}
          </ApplicationSection>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">Nejnovější produkty v katalogu</h2>
                <p className="text-gray-600 mt-1">Produkty dostupné pro influencery</p>
              </div>
              <Link href="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Zobrazit všechny →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Žádné produkty v katalogu</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductQuickView key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ title, value, color }: { title: string, value: number, color: 'yellow' | 'green' | 'blue' }) => {
  const colors = {
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
  }
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-4xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}

const ApplicationSection = ({ title, count, description, children }: { title: string, count: number, description: string, children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-black">{title} ({count})</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}; 