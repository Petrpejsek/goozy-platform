import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { InfluencerApplicationCard, BrandApplicationCard } from '@/components/AdminApplicationCard'
import ProductQuickView from '@/components/ProductQuickView'

export default async function AdminDashboard() {
  // Načteme všechny přihlášky a produkty
  const [influencerApplications, brandApplications, products] = await Promise.all([
    prisma.influencerApplication.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.brandApplication.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      include: {
        brand: {
          select: {
            name: true,
            logo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Zobrazíme posledních 10 produktů
    })
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">GOOZY ADMIN</h1>
            <Link 
              href="/"
              className="text-gray-600 hover:text-black"
            >
              ← Zpět na web
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Přihlášky influencerů */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-black">
                Přihlášky influencerů ({influencerApplications.length})
              </h2>
              <p className="text-gray-600 mt-1">
                Nové přihlášky čekající na schválení
              </p>
            </div>
            
            <div className="p-6">
              {influencerApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Zatím žádné přihlášky
                </p>
              ) : (
                <div className="space-y-4">
                  {influencerApplications.map((application) => (
                    <InfluencerApplicationCard 
                      key={application.id} 
                      application={application}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Přihlášky značek */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-black">
                Poptávky značek ({brandApplications.length})
              </h2>
              <p className="text-gray-600 mt-1">
                Nové poptávky na spolupráci
              </p>
            </div>
            
            <div className="p-6">
              {brandApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Zatím žádné poptávky
                </p>
              ) : (
                <div className="space-y-4">
                  {brandApplications.map((application) => (
                    <BrandApplicationCard 
                      key={application.id} 
                      application={application}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Produkty v katalogu */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">
                  Produkty v katalogu ({products.length})
                </h2>
                <p className="text-gray-600 mt-1">
                  Nejnovější produkty dostupné pro influencery
                </p>
              </div>
              <Link 
                href="/products"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Zobrazit všechny →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Zatím žádné produkty v katalogu
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductQuickView key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-black">
              {influencerApplications.filter(app => app.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Čekající influenceři</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-black">
              {brandApplications.filter(app => app.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Čekající značky</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {influencerApplications.filter(app => app.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Schválení influenceři</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {brandApplications.filter(app => app.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Schválené značky</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">
              {products.length}
            </div>
            <div className="text-sm text-gray-600">Produkty v katalogu</div>
          </div>
        </div>
      </div>
    </div>
  )
} 