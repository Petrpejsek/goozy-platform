'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface InfluencerData {
  id: string
  name: string
  email: string
  instagram?: string
  tiktok?: string
  youtube?: string
}

export default function InfluencerDashboard() {
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Kontrola autentifikace
    const token = localStorage.getItem('influencerToken')
    if (!token) {
      router.push('/influencer/login')
      return
    }

    // Dekódování uživatele z tokenu (zjednodušené)
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      setInfluencer({
        id: tokenData.id,
        name: tokenData.name,
        email: tokenData.email,
        instagram: '',
        tiktok: '',
        youtube: ''
      })
    } catch (error) {
      console.error('Invalid token')
      localStorage.removeItem('influencerToken')
      router.push('/influencer/login')
      return
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('influencerToken')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!influencer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-black">
                GOOZY
              </Link>
              <span className="ml-4 text-sm text-gray-600">Influencer Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/influencer/dashboard/products"
                className="text-sm bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                📦 Produkty
              </Link>
              <span className="text-sm text-gray-700">Vítejte, {influencer.name}!</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-black"
              >
                Odhlásit se
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Message */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Vítejte v Goozy, {influencer.name}!
              </h1>
              <p className="text-gray-600 mb-4">
                Váš účet byl úspěšně schválen a nyní můžete začít spolupracovat s brandy.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Co dělat dál:</strong> Brzy zde budete moci procházet produkty, 
                  vytvářet své unikátní odkazy a sledovat své provize. Zatím se připravujeme 
                  na spuštění!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold">€</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Celkové výdělky
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        €0.00
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">#</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Aktivní produkty
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-semibold">🛒</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Celkové objednávky
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Features */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🚀 Dostupné funkce
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                  href="/influencer/dashboard/products"
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-700">
                    📦 Katalog produktů
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">
                    Procházejte a vybírejte produkty od partnerských brandů
                  </p>
                  <div className="mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Prohlédnout produkty →
                  </div>
                </Link>
                
                <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                  <h4 className="font-medium text-gray-900 mb-2">🔗 Unikátní odkazy</h4>
                  <p className="text-sm text-gray-600">
                    Vytvářejte své personalizované odkazy pro každý produkt
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    Připravuje se...
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                  <h4 className="font-medium text-gray-900 mb-2">💰 Sledování provizí</h4>
                  <p className="text-sm text-gray-600">
                    Sledujte své výdělky a historie provizí v reálném čase
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    Připravuje se...
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                  <h4 className="font-medium text-gray-900 mb-2">📊 Analýzy</h4>
                  <p className="text-sm text-gray-600">
                    Detailní statistiky vašich kampaní a výkonu
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    Připravuje se...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal URL Preview */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🌐 Váš osobní profil
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Váš unikátní URL:</p>
                <div className="flex items-center space-x-2 mb-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    localhost:3000/influencer/{influencer.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`http://localhost:3000/influencer/${influencer.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Kopírovat
                  </button>
                </div>
                <a 
                  href={`/influencer/${influencer.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  👁️ Zobrazit mou stránku
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 